import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tvSource = readFileSync(new URL("../src/TvDisplay.jsx", import.meta.url), "utf8");
const orbitSource = readFileSync(new URL("../src/OrbitScene.jsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

test("TV standby is a twelve-second seamless galaxy loop", () => {
  assert.match(tvSource, /const STANDBY_LOOP_MS = 12000/);
  assert.match(tvSource, /Math\.sin\(phase\)/);
  assert.match(styles, /tv-standby-background 12s ease-in-out infinite/);
});

test("standby keeps the galaxy but removes selected-node guidance", () => {
  assert.match(tvSource, /<OrbitScene[\s\S]*showEnergyLink=\{false\}/);
  assert.match(orbitSource, /showEnergyLink = true/);
  assert.match(orbitSource, /\{showEnergyLink \? \(/);
});

test("TV standby uses the original METASTONE logo artwork", () => {
  assert.match(tvSource, /className="tv-standby__core-logo" src="\/assets\/metastone-official-logo\.png"/);
  assert.match(styles, /\.tv-standby__core-logo\s*\{/);
});

test("visitor copy and Pad handoff stay explicit and unwrapped", () => {
  assert.match(tvSource, /成果案例 <i \/> 产品介绍/);
  assert.match(tvSource, /请在 Pad 端选择内容/);
  assert.doesNotMatch(tvSource, /客户体验测试版|待验收|非验收|非生产/);
  assert.match(styles, /\.tv-standby__message strong \{[\s\S]*white-space: nowrap/);
});

test("TV preserves reduced-motion and auto-starts without a TV-side activation step", () => {
  assert.match(tvSource, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(tvSource, /启用电视播放/);
  assert.doesNotMatch(tvSource, /armDisplay|setArmed|\[armed/);
  assert.match(tvSource, /autoPlay=\{Boolean\(remoteState\.playing\)\}/);
  assert.match(tvSource, /startTvPlayback\(video, state\.muted\)/);
  assert.match(tvSource, /!domain \? <TvStandbyGalaxy active \/> : null/);
  assert.match(tvSource, /renderProfile="tv-low"/);
  assert.match(styles, /\.tv-display\.is-media-active::before/);
  assert.match(orbitSource, /dpr=\{lowPower \? 1 : \[1, 1\.5\]\}/);
  assert.match(orbitSource, /powerPreference: lowPower \? "low-power" : "high-performance"/);
  assert.match(orbitSource, /lowPower \? 32 : 64/);
  assert.match(orbitSource, /lowPower \? 120 : 280/);
  assert.match(orbitSource, /segments=\{lowPower \? 96 : 180\}/);
  assert.match(orbitSource, /!lowPower \? \(/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});

test("TV ignores progress-only SSE renders and performs lightweight drift checks", () => {
  assert.match(tvSource, /const TV_STATE_FIELDS = \[/);
  assert.match(tvSource, /remoteStateRef\.current = nextState/);
  assert.match(tvSource, /hasTvStateChanged\(previous, nextState\)/);
  assert.match(tvSource, /const timer = window\.setInterval\(sync, 500\)/);
  assert.match(tvSource, /if \(video\.paused\) startTvPlayback\(video, state\.muted\)/);
  assert.doesNotMatch(tvSource, /\}, \[media, mediaError, remoteState\]\);/);
});

test("TV clears the exact video node when playback is exited or replaced", () => {
  assert.match(tvSource, /function clearTvVideo\(video\)/);
  assert.match(tvSource, /video\.pause\(\)/);
  assert.match(tvSource, /video\.removeAttribute\("src"\)/);
  assert.match(tvSource, /video\.load\(\)/);
  assert.match(tvSource, /const setVideoRef = useCallback\(\(node\) =>/);
  assert.match(tvSource, /if \(!node && videoRef\.current\) clearTvVideo\(videoRef\.current\)/);
  assert.match(tvSource, /ref=\{setVideoRef\}/);
});
