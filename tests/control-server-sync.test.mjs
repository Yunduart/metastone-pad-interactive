import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("control-server-start-timeout")), 5_000);
    const onData = (chunk) => {
      if (!String(chunk).includes("Pad control:")) return;
      clearTimeout(timer);
      child.stdout.off("data", onData);
      resolve();
    };
    child.stdout.on("data", onData);
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code && code !== 0) reject(new Error(`control-server-exit-${code}`));
    });
  });
}

test("the LAN control server advances progress, applies rate, and rejects stale commands", async () => {
  const port = 4500 + Math.floor(Math.random() * 400);
  const child = spawn(process.execPath, ["server/test-control-server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, TEST_PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const endpoint = `http://127.0.0.1:${port}`;
  const controllerId = "sync-test-pad";
  const playbackId = "sync-test-playback";
  let clientSequence = 0;

  const post = (payload) => fetch(`${endpoint}/api/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      controllerId,
      playbackId,
      clientSequence: ++clientSequence,
    }),
  });

  try {
    await waitForServer(child);
    const playResponse = await post({
      type: "PLAY",
      catalogId: "product-introduction",
      domainId: "product-01",
      itemIndex: 0,
      progress: 10,
      muted: false,
      playbackRate: 1,
    });
    assert.equal(playResponse.status, 200);

    await wait(600);
    const running = await fetch(`${endpoint}/api/state`).then((response) => response.json());
    assert.ok(running.progress > 10.45, `expected live progress, received ${running.progress}`);
    assert.equal(running.playbackRate, 1);
    assert.equal(running.itemId, "product-01-video-01");
    assert.equal(running.loop, false);

    const rateResponse = await post({
      type: "RATE",
      progress: running.progress,
      playing: true,
      playbackRate: 4,
    });
    assert.equal(rateResponse.status, 200);

    await wait(300);
    const fast = await fetch(`${endpoint}/api/state`).then((response) => response.json());
    assert.ok(fast.progress - running.progress > 0.9, "4x playback did not advance quickly enough");
    assert.equal(fast.playbackRate, 4);

    const staleResponse = await fetch(`${endpoint}/api/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "SYNC",
        controllerId,
        playbackId,
        clientSequence,
        progress: 1,
        playing: true,
        playbackRate: 1,
      }),
    });
    assert.equal(staleResponse.status, 409);

    const pauseResponse = await post({
      type: "PAUSE",
      progress: 20,
      muted: false,
      playbackRate: 4,
    });
    assert.equal(pauseResponse.status, 200);
    await wait(250);
    const paused = await fetch(`${endpoint}/api/state`).then((response) => response.json());
    assert.equal(paused.playing, false);
    assert.equal(paused.progress, 20);

    const loopPlaybackId = "sync-test-loop-playback";
    const loopResponse = await fetch(`${endpoint}/api/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PLAY",
        controllerId,
        playbackId: loopPlaybackId,
        clientSequence: ++clientSequence,
        catalogId: "success-cases",
        domainId: "aerospace",
        itemIndex: 0,
        progress: 9.9,
        playing: true,
        playbackRate: 4,
      }),
    });
    assert.equal(loopResponse.status, 200);
    await wait(200);
    const looped = await fetch(`${endpoint}/api/state`).then((response) => response.json());
    assert.equal(looped.itemId, "case-03-slide-01");
    assert.equal(looped.loop, true);
    assert.ok(looped.progress >= 0 && looped.progress < looped.duration, "loop progress was not wrapped");
  } finally {
    child.kill();
    child.stdout.destroy();
    child.stderr.destroy();
  }
});
