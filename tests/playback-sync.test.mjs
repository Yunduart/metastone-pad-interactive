import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  normalizePlaybackRate,
  planPlaybackCorrection,
  projectPlaybackProgress,
} from "../src/playbackSync.js";

const appSourcePath = fileURLToPath(new URL("../src/App.jsx", import.meta.url));
const tvSourcePath = fileURLToPath(new URL("../src/TvDisplay.jsx", import.meta.url));
const stylesSourcePath = fileURLToPath(new URL("../src/styles.css", import.meta.url));

test("the Pad exposes a read-only progress indicator and approved speed controls", async () => {
  const source = await readFile(appSourcePath, "utf8");
  const styles = await readFile(stylesSourcePath, "utf8");
  assert.doesNotMatch(source, /type=["']range["']/);
  assert.doesNotMatch(source, /<video\b/);
  assert.doesNotMatch(source, /type:\s*["']SYNC["']/);
  assert.match(source, /播放端同步进度，只读/);
  assert.match(source, /PAD 控制端 · 本机不播放视频/);
  assert.match(source, /播放目录（按顺序）/);
  assert.match(source, /player-controls__next/);
  assert.match(source, /getAssignedCatalogId/);
  assert.match(source, /assignedCatalogId/);
  assert.match(source, /PLAYBACK_RATES\.map/);
  assert.match(source, /rate === 1 \? "原速"/);
  assert.match(source, /客户体验测试版/);
  assert.match(source, /仅供体验 · 非验收 \/ 非生产/);
  assert.match(source, /电视端同步进度 · 只读/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 1fr\) clamp\(312px, 26vw, 440px\) minmax\(0, 1fr\)/);
  assert.match(styles, /\.player-controls__console::before/);
});

test("the Pad control dock uses one enlarged touch scale and balanced item navigation", async () => {
  const source = await readFile(appSourcePath, "utf8");
  const styles = await readFile(stylesSourcePath, "utf8");
  assert.match(styles, /--control-size:\s*clamp\(64px, 5\.2vw, 80px\)/);
  assert.match(styles, /width:\s*min\(calc\(100vw - 72px\), 1560px\)/);
  assert.match(styles, /\.player-controls__transport \.player-controls__previous,\s*\.player-controls__transport \.player-controls__next\s*\{[\s\S]*?width:\s*var\(--control-size\);[\s\S]*?height:\s*var\(--control-size\);/);
  for (const selector of ["player-controls__play", "player-controls__rates button"]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(styles, new RegExp(`\\.${escaped}\\s*\\{[\\s\\S]*?height:\\s*var\\(--control-size\\);`));
  }
  assert.match(source, /player-controls__timeline/);
  assert.ok(source.indexOf('className="player-controls__timeline"') < source.indexOf('className="player-controls__identity"'));
  assert.match(source, /player-controls__return/);
  assert.match(source, /<span>返回<\/span>/);
  const controlStyles = styles.slice(styles.indexOf('.player-controls {'), styles.indexOf('.boot-screen {'));
  assert.doesNotMatch(controlStyles, /transform:\s*(scale|translateY)\(/);
  assert.match(controlStyles, /touch-action:\s*manipulation/);
  assert.match(controlStyles, /outline:\s*2px solid #b9f3ff/);
  assert.doesNotMatch(styles, /height:\s*32px;[\s\S]{0,350}font-size:\s*11px;/);
});

test("only the TV route owns an HTML video renderer", async () => {
  const source = await readFile(tvSourcePath, "utf8");
  assert.match(source, /<video\b/);
  assert.match(source, /loop=\{media\.loop\}/);
  assert.match(source, /\/api\/events\?role=tv/);
  assert.match(source, /!domain \? <img src="\/assets\/shishi-logo\.svg"/);
});

test("only the approved Pad playback rates are accepted", () => {
  assert.equal(normalizePlaybackRate(1), 1);
  assert.equal(normalizePlaybackRate(2), 2);
  assert.equal(normalizePlaybackRate(4), 4);
  assert.equal(normalizePlaybackRate(3), 1);
});

test("the authoritative progress advances from its server anchor at the selected rate", () => {
  const progress = projectPlaybackProgress({
    progress: 10,
    playing: true,
    playbackRate: 4,
    anchorAtMs: 1_000,
  }, 1_750);
  assert.equal(progress, 13);
});

test("large drift seeks, small drift nudges, and a locked stream returns to base rate", () => {
  const hard = planPlaybackCorrection({
    currentTime: 10,
    targetTime: 10.6,
    playing: true,
    playbackRate: 2,
  });
  assert.equal(hard.mode, "seek");
  assert.equal(hard.seekTo, 10.6);

  const soft = planPlaybackCorrection({
    currentTime: 10,
    targetTime: 10.2,
    playing: true,
    playbackRate: 2,
  });
  assert.equal(soft.mode, "nudge");
  assert.ok(soft.playbackRate > 2);

  const locked = planPlaybackCorrection({
    currentTime: 10,
    targetTime: 10.03,
    playing: true,
    playbackRate: 2,
  });
  assert.equal(locked.mode, "locked");
  assert.equal(locked.playbackRate, 2);
});

test("paused playback is corrected exactly instead of drifting", () => {
  const correction = planPlaybackCorrection({
    currentTime: 8,
    targetTime: 8.2,
    playing: false,
    playbackRate: 4,
  });
  assert.equal(correction.mode, "seek");
  assert.equal(correction.seekTo, 8.2);
  assert.equal(correction.playbackRate, 4);
});
