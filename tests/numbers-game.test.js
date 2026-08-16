const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

function createServer(rootDir) {
  return http.createServer((req, res) => {
    const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.join(rootDir, requestPath);
    const safePath = path.normalize(filePath);

    if (!safePath.startsWith(rootDir)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

async function openPage(relativePath) {
  const rootDir = path.join(__dirname, '..');
  const server = createServer(rootDir);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 430, height: 900 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  await page.goto(`http://127.0.0.1:${port}${relativePath}`, { waitUntil: 'networkidle' });

  return { browser, page, server, port };
}

test('numbers game inputs, playback, clearing, and difficulty levels work as designed', async () => {
  const { browser, page, server, port } = await openPage('/games/numbers.html');

  try {
    const cards = await page.locator('.difficulty-card').count();
    assert.equal(cards, 3, 'difficulty selection should show three difficulty cards');

    const cardCounts = await page.locator('.difficulty-card').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.count))
    );
    assert.deepEqual(cardCounts.sort((a, b) => a - b), [3, 5, 10]);

    await page.locator('.difficulty-card[data-count="3"]').click();
    await page.waitForSelector('.number-card');

    const boardValues = await page.locator('.number-card').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.value))
    );
    assert.deepEqual([...boardValues].sort((a, b) => a - b), [1, 2, 3]);

    const wrongSequence = [1, 3, 2];
    for (const value of wrongSequence) {
      await page.locator(`.number-card[data-value="${value}"]`).first().click();
    }

    assert.equal(await page.locator('#clearScreen').evaluate((node) => getComputedStyle(node).display), 'none');

    await page.locator('#playSequenceBtn').click();
    const spoken = await page.evaluate(() => window.__lastSpokenText || '');
    assert.match(spoken, /いち.*さん.*に|いち、さん、に/);

    await page.locator('.placed-slot.filled').filter({ hasText: '3' }).click();
    await page.waitForTimeout(150);

    const placedAfterRemove = await page.locator('.placed-slot.filled').evaluateAll((nodes) =>
      nodes.map((node) => node.textContent.trim())
    );
    assert.deepEqual(placedAfterRemove, ['1', '2'], 'the player should be able to undo a wrong tap');

    await page.locator('.number-card[data-value="3"]').first().click();
    const finalStatus = await page.locator('#statusText').textContent();
    assert.match(finalStatus, /せいかい/);

    await page.locator('#clearRestartBtn').click();
    await page.locator('.difficulty-card[data-count="5"]').click();
    await page.waitForSelector('.number-card');
    assert.equal(await page.locator('.number-card').count(), 5);

    await page.locator('#backBtn').click();
    await page.locator('.difficulty-card[data-count="10"]').click();
    await page.waitForSelector('.number-card');
    assert.equal(await page.locator('.number-card').count(), 10);

    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    const homeLink = page.locator('a[href="games/numbers.html"]');
    await homeLink.waitFor();
    assert.equal(await homeLink.getAttribute('aria-label'), 'すうじをならべよう');
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
