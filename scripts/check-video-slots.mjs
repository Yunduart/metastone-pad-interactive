import { existsSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTENT_CATALOGS } from "../src/domains.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const videoRoot = resolve(projectRoot, "public/videos");
const total = CONTENT_CATALOGS.reduce((sum, catalog) => sum + catalog.items.length, 0);
let ready = 0;

console.log(`\n视频投放根目录：${videoRoot}\n`);

for (const catalog of CONTENT_CATALOGS) {
  console.log(`${catalog.title} / ${catalog.english}`);
  for (const item of catalog.items) {
    const absolutePath = resolve(videoRoot, item.fileName);
    const present = existsSync(absolutePath) && statSync(absolutePath).isFile();
    const duplicatedExtensionPath = `${absolutePath}.mp4`;
    const hasDuplicatedExtension = !present
      && existsSync(duplicatedExtensionPath)
      && statSync(duplicatedExtensionPath).isFile();
    if (present) ready += 1;
    const size = present ? ` ${(statSync(absolutePath).size / 1024 / 1024).toFixed(1)} MB` : "";
    const status = present ? "[READY]" : hasDuplicatedExtension ? "[RENAME]" : "[EMPTY]";
    const hint = hasDuplicatedExtension ? `（检测到 ${item.fileName}.mp4，请删除多余的 .mp4）` : "";
    console.log(`  ${status} ${item.number} ${item.title} -> ${item.fileName}${size}${hint}`);
  }
  console.log("");
}

console.log(`槽位状态：${ready}/${total} 已放入，${total - ready}/${total} 等待素材。`);
console.log("缺失素材会自动进入演示画面，不会中断 Pad / TV 联动测试。\n");
