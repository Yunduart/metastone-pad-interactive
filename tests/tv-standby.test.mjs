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

test("visitor copy and Pad handoff stay explicit and unwrapped", () => {
  assert.match(tvSource, /成果案例 <i \/> 产品介绍/);
  assert.match(tvSource, /请在 Pad 端选择内容/);
  assert.match(tvSource, /客户体验测试版 · 非验收 \/ 非生产/);
  assert.match(styles, /\.tv-standby__message strong \{[\s\S]*white-space: nowrap/);
});

test("TV preserves reduced-motion and first-run playback activation", () => {
  assert.match(tvSource, /prefers-reduced-motion: reduce/);
  assert.match(tvSource, /启用电视播放/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
