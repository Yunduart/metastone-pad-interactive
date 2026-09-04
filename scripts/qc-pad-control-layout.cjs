const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output/playwright/control-scale-20260904');
fs.mkdirSync(output, { recursive: true });
const url = process.env.PAD_QC_URL || 'http://127.0.0.1:4175';

async function geometry(page) {
  return page.evaluate(() => {
    const box = (element) => {
      if (!element) return null;
      const r = element.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom, cy: r.y + r.height / 2 };
    };
    const controls = document.querySelector('.player-controls');
    const buttons = [...controls.querySelectorAll('button')].map((el) => ({
      label: el.getAttribute('aria-label'),
      rect: box(el),
      font: getComputedStyle(el.querySelector('span') || el).fontSize,
      disabled: el.disabled,
    }));
    const dock = box(controls);
    const directory = box(document.querySelector('.pad-media-directory'));
    const widths = buttons.map((b) => b.rect.width);
    const heights = buttons.map((b) => b.rect.height);
    const centers = buttons.map((b) => b.rect.cy);
    return {
      viewport: { width: innerWidth, height: innerHeight },
      dock, directory, buttons,
      checks: {
        eightControls: buttons.length === 8,
        equalWidths: Math.max(...widths) - Math.min(...widths) < 1,
        equalHeights: Math.max(...heights) - Math.min(...heights) < 1,
        sharedCenterline: Math.max(...centers) - Math.min(...centers) < 1,
        minimum64px: Math.min(...widths, ...heights) >= 63.9,
        readableControlLabels: buttons.filter((b) => !/暂停|继续/.test(b.label)).every((b) => parseFloat(b.font) >= 16),
        noPageOverflow: document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight,
        allButtonsInsideDock: buttons.every(({ rect: r }) => r.x >= dock.x && r.right <= dock.right && r.y >= dock.y && r.bottom <= dock.bottom),
        dockInsideViewport: dock.x >= 0 && dock.right <= innerWidth && dock.y >= 0 && dock.bottom <= innerHeight,
        noDirectoryOverlap: directory.bottom <= dock.y,
        padIsControlOnly: document.querySelectorAll('video').length === 0,
        progressReadOnly: !!document.querySelector('[role="progressbar"]') && !document.querySelector('input[type="range"]'),
        glassPreserved: getComputedStyle(controls).backdropFilter.includes('blur(30px)'),
      },
    };
  });
}

async function settle(page) {
  await page.mouse.move(3, 3);
  await page.waitForTimeout(250);
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 1 });
  const errors = [];
  const warnings = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
    if (m.type() === 'warning') warnings.push(m.text());
  });
  await page.request.post(`${url}/api/control`, { data: { type: 'STOP' } });
  await page.goto(`${url}/pad`, { waitUntil: 'networkidle' });
  fs.writeFileSync(path.join(output, 'home-aria.txt'), await page.locator('body').ariaSnapshot());
  await page.getByRole('button', { name: /在电视端播放/ }).click();
  await page.locator('.video-portal.is-open').waitFor();
  await page.waitForTimeout(1000);
  await settle(page);
  const responsive = [];
  for (const viewport of [{ width: 1920, height: 1200 }, { width: 1536, height: 1024 }, { width: 1280, height: 800 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await settle(page);
    await page.screenshot({ path: path.join(output, `pad-${viewport.width}x${viewport.height}.png`), fullPage: true });
    responsive.push(await geometry(page));
  }

  await page.setViewportSize({ width: 1920, height: 1200 });
  const actions = {};
  await page.locator('.player-controls__next').hover();
  await page.waitForTimeout(200);
  const hoverGeometry = await geometry(page);
  actions.hoverKeepsFootprint = hoverGeometry.checks.equalWidths && hoverGeometry.checks.equalHeights && hoverGeometry.checks.sharedCenterline;
  await page.locator('.player-controls__rates button').first().focus();
  actions.keyboardFocusVisible = await page.locator('.player-controls__rates button').first().evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth) >= 2);
  await settle(page);
  const state = async () => (await page.request.get(`${url}/api/state`)).json();
  await page.locator('.player-controls__play').click();
  await settle(page);
  actions.pause = (await state()).playing === false;
  await page.screenshot({ path: path.join(output, 'pad-paused-1920x1200.png'), fullPage: true });
  await page.locator('.player-controls__play').click();
  await settle(page);
  actions.resume = (await state()).playing === true;
  const beforeIndex = (await state()).itemIndex;
  await page.getByRole('button', { name: '下一项', exact: true }).click();
  await settle(page);
  actions.next = (await state()).itemIndex !== beforeIndex;
  await page.getByRole('button', { name: '上一项', exact: true }).click();
  await settle(page);
  actions.previous = (await state()).itemIndex === beforeIndex;
  for (const rate of [2, 4, 1]) {
    await page.getByRole('button', { name: rate === 1 ? '原速播放' : `${rate}倍速播放`, exact: true }).click();
    await settle(page);
    actions[`rate${rate}`] = (await state()).playbackRate === rate;
  }
  const originalMute = (await state()).muted;
  await page.locator('.player-controls__mute').click();
  await settle(page);
  actions.mute = (await state()).muted !== originalMute;
  await page.locator('.player-controls__mute').click();
  await page.getByRole('button', { name: '返回成果案例', exact: true }).click();
  await settle(page);
  actions.returnHome = !await page.locator('.video-portal.is-open').count();
  await page.goto(`${url}/pad02`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /在电视端播放/ }).click();
  await page.waitForTimeout(1000);
  await settle(page);
  await page.screenshot({ path: path.join(output, 'pad02-single-item-1920x1200.png'), fullPage: true });
  actions.singleItemNavigationDisabled = await page.locator('.player-controls__previous').isDisabled() && await page.locator('.player-controls__next').isDisabled();
  const productGeometry = await geometry(page);
  await page.getByRole('button', { name: '返回产品介绍', exact: true }).click();
  await page.goto(`${url}/pad`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /在电视端播放/ }).click();
  await page.waitForTimeout(1000);
  await settle(page);
  await page.screenshot({ path: path.join(output, 'pad-1920x1200.png'), fullPage: true });

  const beforePath = path.join(root, 'audit/control-scale-qc-20260904/before-1920x1200.png');
  const afterPath = path.join(output, 'pad-1920x1200.png');
  await sharp({ create: { width: 1920, height: 2400, channels: 4, background: '#030817' } })
    .composite([{ input: beforePath, top: 0, left: 0 }, { input: afterPath, top: 1200, left: 0 }])
    .png().toFile(path.join(output, 'before-after-full.png'));
  const crops = await Promise.all([beforePath, afterPath].map((p) => sharp(p).extract({ left: 0, top: 960, width: 1920, height: 240 }).png().toBuffer()));
  await sharp({ create: { width: 1920, height: 480, channels: 4, background: '#030817' } })
    .composite([{ input: crops[0], top: 0, left: 0 }, { input: crops[1], top: 240, left: 0 }])
    .png().toFile(path.join(output, 'before-after-controls.png'));
  const passed = responsive.every((r) => Object.values(r.checks).every(Boolean))
    && Object.values(productGeometry.checks).every(Boolean)
    && Object.values(actions).every(Boolean) && errors.length === 0;
  const result = { url, browser: 'Chrome (temporary local QC fallback)', responsive, productGeometry, actions, errors, warnings, passed };
  fs.writeFileSync(path.join(output, 'browser-qc.json'), `${JSON.stringify(result, null, 2)}\n`);
  await browser.close();
  console.log(JSON.stringify({ passed, actions, errors, responsive: responsive.map((r) => ({ viewport: r.viewport, checks: r.checks })) }, null, 2));
  if (!passed) process.exitCode = 1;
})().catch((e) => { console.error(e); process.exitCode = 1; });
