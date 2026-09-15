const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const outputDir = __dirname;

function insideViewport(rect, viewport) {
  return rect.left >= 0
    && rect.top >= 0
    && rect.right <= viewport.width
    && rect.bottom <= viewport.height;
}

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1200 },
    deviceScaleFactor: 1,
  });
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleMessages.push({ type: message.type(), text: message.text() });
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.request.post("http://127.0.0.1:4175/api/control", { data: { type: "STOP" } });
  await page.goto("http://127.0.0.1:4175/pad", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /在电视端播放/ }).click();
  await page.locator(".video-portal.is-open").waitFor({ state: "visible" });
  await page.waitForTimeout(2000);
  await page.locator(".pad-media-directory").hover();
  await page.waitForTimeout(200);

  const defaultVisualState = await page.evaluate(() => {
    const portal = document.querySelector(".video-portal");
    return {
      appClass: document.querySelector(".app")?.className,
      portalClass: portal?.className,
      clipPath: portal ? getComputedStyle(portal).clipPath : null,
      transitionDuration: portal ? getComputedStyle(portal).transitionDuration : null,
    };
  });

  await page.screenshot({
    path: path.join(outputDir, "pad01-orbital-control-default.png"),
    fullPage: true,
  });

  const beforeToggle = await page.locator(".player-controls__play").getAttribute("aria-label");
  await page.locator(".player-controls__play").click();
  await page.waitForTimeout(300);
  const afterToggle = await page.locator(".player-controls__play").getAttribute("aria-label");
  const pausedVisualState = await page.evaluate(() => {
    const portal = document.querySelector(".video-portal");
    return {
      appClass: document.querySelector(".app")?.className,
      portalClass: portal?.className,
      clipPath: portal ? getComputedStyle(portal).clipPath : null,
      transitionDuration: portal ? getComputedStyle(portal).transitionDuration : null,
    };
  });
  await page.screenshot({
    path: path.join(outputDir, "pad01-orbital-control-paused.png"),
    fullPage: true,
  });

  const beforeNext = await page.locator(".player-controls__identity small").textContent();
  await page.locator(".player-controls__next").click();
  await page.waitForTimeout(500);
  const afterNext = await page.locator(".player-controls__identity small").textContent();

  await page.getByRole("button", { name: "2倍速播放" }).click();
  await page.waitForTimeout(200);
  const rate2Selected = await page.getByRole("button", { name: "2倍速播放" }).getAttribute("aria-pressed");

  await page.screenshot({
    path: path.join(outputDir, "pad01-orbital-control-interacted.png"),
    fullPage: true,
  });

  const geometry = await page.evaluate(() => {
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const materialStyle = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backdropFilter: style.backdropFilter || style.webkitBackdropFilter,
        borderColor: style.borderColor,
      };
    };
    const selectors = {
      controls: ".player-controls",
      console: ".player-controls__console",
      play: ".player-controls__play",
      previous: ".player-controls__previous",
      next: ".player-controls__next",
      secondary: ".player-controls__secondary",
      directory: ".pad-media-directory",
    };
    const boxes = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return [key, rect ? {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      } : null];
    }));

    return {
      viewport,
      boxes,
      bodyOverflowX: document.documentElement.scrollWidth - window.innerWidth,
      bodyOverflowY: document.documentElement.scrollHeight - window.innerHeight,
      videoCount: document.querySelectorAll("video").length,
      progressRole: document.querySelector(".player-controls__progress")?.getAttribute("role"),
      progressLabel: document.querySelector(".player-controls__progress")?.getAttribute("aria-label"),
      rateLabels: [...document.querySelectorAll(".player-controls__rates button")].map((button) => button.textContent.trim()),
      glassMaterial: {
        controls: materialStyle(".player-controls"),
        directory: materialStyle(".pad-media-directory"),
      },
    };
  });

  const { viewport, boxes } = geometry;
  const checks = {
    padRemainsControllerOnly: geometry.videoCount === 0,
    noHorizontalOverflow: geometry.bodyOverflowX === 0,
    noVerticalOverflow: geometry.bodyOverflowY === 0,
    controlsInsideViewport: insideViewport(boxes.controls, viewport),
    consoleCentered: Math.abs(((boxes.console.left + boxes.console.right) / 2) - (viewport.width / 2)) <= 1,
    playIsCircular: Math.abs(boxes.play.width - boxes.play.height) <= 1,
    nextHasLargerTouchAreaThanPrevious: (boxes.next.width * boxes.next.height) > (boxes.previous.width * boxes.previous.height),
    controlsDoNotOverlapDirectory: boxes.controls.top >= boxes.directory.bottom,
    progressIsReadOnly: geometry.progressRole === "progressbar" && geometry.progressLabel.includes("只读"),
    approvedRatesOnly: JSON.stringify(geometry.rateLabels) === JSON.stringify(["原速", "2×", "4×"]),
    playPauseWorks: beforeToggle !== afterToggle,
    nextItemWorks: beforeNext !== afterNext,
    rateWorks: rate2Selected === "true",
    glassUsesBackdropBlur: [geometry.glassMaterial.controls, geometry.glassMaterial.directory]
      .every((material) => material?.backdropFilter.includes("blur(30px)")),
    glassKeepsBackgroundVisible: [geometry.glassMaterial.controls, geometry.glassMaterial.directory]
      .every((material) => Number(material?.backgroundColor.match(/[\d.]+(?=\))/)?.[0]) < 0.5),
    glassHasDirectionalHighlight: [geometry.glassMaterial.controls, geometry.glassMaterial.directory]
      .every((material) => material?.backgroundImage !== "none"),
    consoleFreeOfRuntimeErrors: pageErrors.length === 0 && consoleMessages.filter((entry) => entry.type === "error").length === 0,
  };

  const result = {
    sourceReference: "C:\\Users\\visua\\AppData\\Local\\Temp\\codex-clipboard-f79e44f3-0f84-4f4d-8e0f-6dc1902f0f65.png",
    url: page.url(),
    geometry,
    interactions: { beforeToggle, afterToggle, beforeNext, afterNext, rate2Selected },
    visualStates: { default: defaultVisualState, paused: pausedVisualState },
    consoleMessages,
    pageErrors,
    checks,
    passed: Object.values(checks).every(Boolean),
  };

  fs.writeFileSync(path.join(outputDir, "browser-qc.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  await browser.close();

  if (!result.passed) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
