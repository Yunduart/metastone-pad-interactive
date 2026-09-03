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

test("the Pad exposes a read-only progress indicator and approved speed controls", async () => {
  const source = await readFile(appSourcePath, "utf8");
  assert.doesNotMatch(source, /type=["']range["']/);
  assert.match(source, /播放端同步进度，只读/);
  assert.match(source, /PLAYBACK_RATES\.map/);
  assert.match(source, /rate === 1 \? "原速"/);
  assert.match(source, /客户体验测试版/);
  assert.match(source, /仅供体验 · 非验收 \/ 非生产/);
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
