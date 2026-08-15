const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function collectVisibleTargetPoints(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('hiraganaCanvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const points = [];

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        if (a > 160 && r > 180 && g < 120 && b < 120) {
          points.push({ x, y });
        }
      }
    }

    return points;
  });
}

async function traceTargetPoints(page, targetPoints) {
  if (!targetPoints.length) {
    throw new Error('No visible target dots found on canvas.');
  }

  const sorted = [...targetPoints].sort((a, b) => a.y - b.y || a.x - b.x);
  const first = sorted[0];

  await page.mouse.move(first.x + 1, first.y + 1);
  await page.mouse.down();

  for (const point of sorted.slice(1)) {
    await page.mouse.move(point.x, point.y, { steps: 2 });
  }

  await page.mouse.up();
  await page.waitForTimeout(200);
}

test('hiragana target-dot trace can be measured via current visible target coordinates', async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 430, height: 900 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });

    await page.goto('http://localhost:8000/games/hiragana.html', { waitUntil: 'networkidle' });
    await page.locator('#startBtn').click();
    await page.waitForTimeout(200);

    const targetPoints = await collectVisibleTargetPoints(page);
    const pointCount = targetPoints.length;
    console.log(JSON.stringify({ targetPointsCount: pointCount }, null, 2));

    assert.ok(pointCount > 0, 'current target dots should exist on the canvas');

    await traceTargetPoints(page, targetPoints);

    const metrics = await page.evaluate(() => {
      const fn = window.__hiraganaDebug && window.__hiraganaDebug.getCurrentMetrics;
      if (!fn) {
        return null;
      }
      return fn.call(window.__hiraganaDebug);
    });

    console.log(JSON.stringify({ metrics }, null, 2));

    assert.ok(metrics, 'metrics should be available after tracing target dots');
    assert.ok(Number.isFinite(metrics.totalTarget), 'totalTarget should be numeric');
    assert.ok(Number.isFinite(metrics.totalHit), 'totalHit should be numeric');
    assert.ok(Number.isFinite(metrics.overallRatio), 'overallRatio should be numeric');
    assert.ok(Number.isFinite(metrics.areasRatio), 'areasRatio should be numeric');

    console.log('target-trace-complete');
  } finally {
    await browser.close();
  }
});
