import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_CATALOGS } from "../src/domains.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const videoRoot = resolve(projectRoot, "public/videos");

test("latest folders map to fourteen case items and eleven product films", () => {
  const [cases, products] = CONTENT_CATALOGS;
  assert.deepEqual(cases.items.map((item) => item.title), [
    "互联网",
    "大模型",
    "航空航天",
    "高端制造",
    "科研院所",
    "海洋模拟",
    "AI for Science",
  ]);
  assert.equal(cases.sourceFolder, "0824案例介绍");
  assert.equal(products.sourceFolder, "0817是石科技产品视频互动展示");
  assert.deepEqual(cases.items.map((item) => item.sourceFolder), [
    "1-互联网",
    "2-大模型",
    "3-航空航天",
    "4-高端制造",
    "5-科研院所",
    "6-海洋模拟",
    "7-AI for  Science",
  ]);
  assert.deepEqual(products.items.map((item) => item.sourceFolder), [
    "1-国产Token优化工厂",
    "2-超智算集群",
    "3-国产异构超智算中心",
    "4-国产Token优化工厂计算速度大比拼：CPU vs GPU",
    "5-国产Token优化工厂-技术优势",
    "6-AI infra",
    "7-PD分离",
    "8-投机解码",
    "9-多层级KV Cache",
  ]);
  assert.equal(cases.items.reduce((sum, item) => sum + item.playlist.length, 0), 14);
  assert.equal(products.items.reduce((sum, item) => sum + item.playlist.length, 0), 11);
  assert.equal(products.items.find((item) => item.id === "product-03").playlist.length, 3);
});

test("every playlist item has a unique H.264 delivery slot present on disk", () => {
  const media = CONTENT_CATALOGS.flatMap((catalog) => catalog.items.flatMap((item) => item.playlist));
  assert.equal(media.length, 25);
  assert.equal(new Set(media.map((item) => item.id)).size, media.length);
  assert.equal(new Set(media.map((item) => item.fileName)).size, media.length);
  for (const item of media) {
    assert.match(item.fileName, /\.mp4$/i);
    const path = resolve(videoRoot, item.fileName);
    assert.ok(existsSync(path), `missing ${item.fileName}`);
    assert.ok(statSync(path).size > 0, `empty ${item.fileName}`);
    assert.ok(item.duration > 0, `missing duration for ${item.id}`);
  }
});

test("all PPT pages are looping video items and the two GIF slides stay identified", () => {
  const caseMedia = CONTENT_CATALOGS[0].items.flatMap((item) => item.playlist);
  const slides = caseMedia.filter((item) => item.kind === "ppt-slide-video");
  assert.equal(slides.length, 11);
  assert.ok(slides.every((item) => item.loop));
  assert.deepEqual(
    slides.filter((item) => item.containsAnimatedGif).map((item) => item.id),
    ["case-03-slide-01", "case-04-slide-01"],
  );
});
