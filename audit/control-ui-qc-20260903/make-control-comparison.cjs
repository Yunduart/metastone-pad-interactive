const path = require("node:path");
const sharp = require("sharp");

const auditDir = __dirname;
const sourcePath = "C:\\Users\\visua\\AppData\\Local\\Temp\\codex-clipboard-f79e44f3-0f84-4f4d-8e0f-6dc1902f0f65.png";
const implementationPath = path.join(auditDir, "pad01-orbital-control-default.png");

async function normalizedImage(file, width, height, fit = "contain") {
  return sharp(file)
    .resize({ width, height, fit, background: { r: 1, g: 6, b: 23, alpha: 1 } })
    .png()
    .toBuffer();
}

async function main() {
  const sourceFull = await normalizedImage(sourcePath, 420, 840);
  const implementationFull = await normalizedImage(implementationPath, 1400, 840);
  await sharp({
    create: { width: 1880, height: 900, channels: 4, background: { r: 1, g: 6, b: 23, alpha: 1 } },
  })
    .composite([
      { input: sourceFull, left: 20, top: 30 },
      { input: implementationFull, left: 460, top: 30 },
    ])
    .png()
    .toFile(path.join(auditDir, "control-reference-comparison-v2.png"));

  const sourceFocus = await sharp(sourcePath)
    .extract({ left: 0, top: 180, width: 224, height: 268 })
    .resize({ width: 460, height: 480, fit: "contain", background: { r: 1, g: 6, b: 23, alpha: 1 } })
    .png()
    .toBuffer();
  const implementationFocus = await sharp(implementationPath)
    .extract({ left: 280, top: 990, width: 1360, height: 210 })
    .resize({ width: 1320, height: 480, fit: "contain", background: { r: 1, g: 6, b: 23, alpha: 1 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 1840, height: 540, channels: 4, background: { r: 1, g: 6, b: 23, alpha: 1 } },
  })
    .composite([
      { input: sourceFocus, left: 20, top: 30 },
      { input: implementationFocus, left: 500, top: 30 },
    ])
    .png()
    .toFile(path.join(auditDir, "control-focus-comparison-v2.png"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
