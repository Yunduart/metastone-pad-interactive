import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_CATALOGS } from "../src/domains.js";
import {
  PLAYBACK_RATES,
  normalizePlaybackRate,
  projectPlaybackProgress,
} from "../src/playbackSync.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = resolve(projectRoot, "dist/client");
const sourceVideoRoot = resolve(projectRoot, "public/videos");
const host = "0.0.0.0";
const port = Number(process.env.TEST_PORT || 4175);
const sseClients = new Set();
const validContent = new Set(
  CONTENT_CATALOGS.flatMap((catalog) => catalog.items.map((item) => `${catalog.id}:${item.id}`)),
);

const initialTime = Date.now();

let controlState = {
  sequence: 0,
  clientSequence: 0,
  command: "IDLE",
  controllerId: null,
  playbackId: null,
  catalogId: null,
  domainId: null,
  playing: false,
  muted: false,
  playbackRate: 1,
  progress: 0,
  anchorAtMs: initialTime,
  updatedAtMs: initialTime,
  updatedAt: new Date(initialTime).toISOString(),
};

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".m4v": "video/x-m4v",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
};

function snapshot() {
  const nowMs = Date.now();
  return {
    ...controlState,
    progress: projectPlaybackProgress(controlState, nowMs),
    serverTimeMs: nowMs,
    displayClients: sseClients.size,
  };
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  response.end(body);
}

function broadcast() {
  const message = `data: ${JSON.stringify(snapshot())}\n\n`;
  sseClients.forEach((client) => client.write(message));
}

function resolveInside(root, relativePath) {
  const target = resolve(root, relativePath);
  if (target === root || target.startsWith(`${root}${sep}`)) return target;
  return null;
}

function serveFile(request, response, filePath, cacheControl = "no-cache") {
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) return false;
  const stats = statSync(filePath);
  const mime = MIME[extname(filePath).toLowerCase()] ?? "application/octet-stream";
  const range = request.headers.range;
  const commonHeaders = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": cacheControl,
  };

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
      response.end();
      return true;
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Math.min(Number(match[2]), stats.size - 1) : stats.size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stats.size) {
      response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
      response.end();
      return true;
    }
    response.writeHead(206, {
      ...commonHeaders,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath, { start, end }).pipe(response);
    return true;
  }

  response.writeHead(200, { ...commonHeaders, "Content-Length": stats.size });
  if (request.method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
  return true;
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("payload-too-large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function updateControlState(input) {
  const type = String(input.type ?? "").toUpperCase();
  if (!["PLAY", "PAUSE", "RESUME", "SEEK", "RATE", "SYNC", "MUTE", "STOP"].includes(type)) {
    throw new Error("unsupported-command");
  }

  const nowMs = Date.now();
  const controllerId = typeof input.controllerId === "string" ? input.controllerId : null;
  const clientSequence = Number(input.clientSequence);
  if (
    controllerId
    && controllerId === controlState.controllerId
    && Number.isFinite(clientSequence)
    && clientSequence <= controlState.clientSequence
  ) {
    const error = new Error("stale-command");
    error.status = 409;
    throw error;
  }
  if (
    type !== "PLAY"
    && controlState.playbackId
    && typeof input.playbackId === "string"
    && input.playbackId !== controlState.playbackId
  ) {
    const error = new Error("stale-playback");
    error.status = 409;
    throw error;
  }

  const next = {
    ...controlState,
    sequence: controlState.sequence + 1,
    command: type,
    progress: projectPlaybackProgress(controlState, nowMs),
    anchorAtMs: nowMs,
  };
  if (controllerId) next.controllerId = controllerId;
  if (Number.isFinite(clientSequence)) next.clientSequence = clientSequence;

  if (type === "PLAY") {
    if (!validContent.has(`${input.catalogId}:${input.domainId}`)) throw new Error("unknown-content");
    next.catalogId = input.catalogId;
    next.domainId = input.domainId;
    next.playbackId = typeof input.playbackId === "string"
      ? input.playbackId
      : `playback-${nowMs}-${next.sequence}`;
    next.playing = true;
    next.progress = Number.isFinite(input.progress) ? Math.max(0, input.progress) : 0;
    next.playbackRate = normalizePlaybackRate(input.playbackRate, 1);
    if (typeof input.muted === "boolean") next.muted = input.muted;
  } else if (type === "PAUSE") {
    next.playing = false;
    if (Number.isFinite(input.progress)) next.progress = Math.max(0, input.progress);
  } else if (type === "RESUME") {
    next.playing = true;
    if (Number.isFinite(input.progress)) next.progress = Math.max(0, input.progress);
    if (typeof input.muted === "boolean") next.muted = input.muted;
    next.playbackRate = normalizePlaybackRate(input.playbackRate, next.playbackRate);
  } else if (type === "SEEK") {
    next.progress = Number.isFinite(input.progress) ? Math.max(0, input.progress) : next.progress;
    if (typeof input.playing === "boolean") next.playing = input.playing;
    if (typeof input.muted === "boolean") next.muted = input.muted;
  } else if (type === "RATE") {
    if (!PLAYBACK_RATES.includes(Number(input.playbackRate))) throw new Error("invalid-playback-rate");
    if (Number.isFinite(input.progress)) next.progress = Math.max(0, input.progress);
    next.playbackRate = Number(input.playbackRate);
    if (typeof input.playing === "boolean") next.playing = input.playing;
  } else if (type === "SYNC") {
    if (!next.catalogId || !next.domainId) throw new Error("no-active-playback");
    if (Number.isFinite(input.progress)) next.progress = Math.max(0, input.progress);
    if (typeof input.playing === "boolean") next.playing = input.playing;
    if (typeof input.muted === "boolean") next.muted = input.muted;
    next.playbackRate = normalizePlaybackRate(input.playbackRate, next.playbackRate);
  } else if (type === "MUTE") {
    if (typeof input.muted !== "boolean") throw new Error("invalid-muted-state");
    next.muted = input.muted;
  } else if (type === "STOP") {
    next.catalogId = null;
    next.domainId = null;
    next.playbackId = null;
    next.playing = false;
    next.playbackRate = 1;
    next.progress = 0;
  }

  next.anchorAtMs = nowMs;
  next.updatedAtMs = nowMs;
  next.updatedAt = new Date(nowMs).toISOString();
  controlState = next;
  broadcast();
  return snapshot();
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);

  if (request.method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, snapshot());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    response.write(`data: ${JSON.stringify(snapshot())}\n\n`);
    sseClients.add(response);
    broadcast();
    request.on("close", () => {
      sseClients.delete(response);
      broadcast();
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/control") {
    try {
      const body = await readJson(request);
      sendJson(response, 200, updateControlState(body));
    } catch (error) {
      sendJson(response, Number(error.status) || 400, { error: error.message, state: snapshot() });
    }
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "api-not-found" });
    return;
  }

  if (!["GET", "HEAD"].includes(request.method ?? "")) {
    sendJson(response, 405, { error: "method-not-allowed" });
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    sendJson(response, 400, { error: "invalid-path" });
    return;
  }

  if (decodedPath.startsWith("/videos/")) {
    const relative = decodedPath.slice("/videos/".length);
    const videoPath = resolveInside(sourceVideoRoot, relative);
    if (serveFile(request, response, videoPath, "no-store")) return;
    sendJson(response, 404, { error: "video-not-found", path: relative });
    return;
  }

  const relative = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  const staticPath = resolveInside(clientRoot, relative);
  if (serveFile(request, response, staticPath, "no-cache")) return;

  if (serveFile(request, response, resolve(clientRoot, "index.html"), "no-cache")) return;
  sendJson(response, 503, { error: "test-build-missing", hint: "run npm run build" });
});

const keepAlive = setInterval(() => {
  sseClients.forEach((client) => client.write(": keep-alive\n\n"));
}, 15000);
keepAlive.unref();

const playbackTicker = setInterval(() => {
  if (controlState.playing && sseClients.size > 0) broadcast();
}, 500);
playbackTicker.unref();

server.listen(port, host, () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((item) => item?.family === "IPv4" && !item.internal)
    .map((item) => item.address)
    .filter((address) => !address.startsWith("198.18."));
  const lanAddress = addresses[0] ?? "<host-ip>";
  console.log(`Pad control: http://127.0.0.1:${port}/pad`);
  console.log(`TV display:  http://127.0.0.1:${port}/tv`);
  console.log(`LAN Pad:     http://${lanAddress}:${port}/pad`);
  console.log(`LAN TV:      http://${lanAddress}:${port}/tv`);
});

function shutdown() {
  clearInterval(keepAlive);
  clearInterval(playbackTicker);
  sseClients.forEach((client) => client.end());
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
