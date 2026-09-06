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
        '.svg': 'image/svg+xml',
        '.png': 'image/png'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

async function openPage(relativePath, initScript) {
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

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  if (typeof initScript === 'function') {
    await page.addInitScript(initScript);
  }

  await page.goto(`http://127.0.0.1:${port}${relativePath}`, { waitUntil: 'networkidle' });

  return { browser, page, server, port, pageErrors, consoleErrors };
}

async function tapAtPercent(locator, xPercent, yPercent) {
  const box = await locator.boundingBox();
  assert.ok(box, 'target should be visible');

  await locator.click({
    position: {
      x: box.width * (xPercent / 100),
      y: box.height * (yPercent / 100)
    }
  });
}

test('compare mode has five themed problems, random selection, and princess clear screen', async () => {
  const { browser, page, server, pageErrors, consoleErrors } = await openPage('/index.html');

  try {
    await page.locator('a[href="games/difference.html"]').click();
    await page.waitForURL(/games\/difference\.html$/);
    await page.locator('#modeScreen.show').waitFor();

    const problems = await page.evaluate(() => window.__differenceDebug.getCompareProblems());
    assert.equal(problems.length, 5, 'compare mode should have five configurations');
    problems.forEach((problem) => {
      assert.ok(problem.imageA, 'problem should have imageA');
      assert.ok(problem.imageB, 'problem should have imageB');
      assert.ok(problem.differences && problem.differences.length > 0, 'problem should define a target');
      assert.ok(Number.isFinite(problem.differences[0].x), 'difference x should be a number');
      assert.ok(Number.isFinite(problem.differences[0].y), 'difference y should be a number');
      assert.ok(Number.isFinite(problem.differences[0].radius), 'difference radius should be a number');
    });

    await page.locator('.mode-card[data-mode="compare"]').click();
    await page.locator('#gameScreen.show').waitFor();
    const firstProblemId = await page.evaluate(() => window.__differenceDebug.getCurrentCompareProblem().id);

    const compareRightHitbox = page.locator('#compareRightHitbox');
    const firstDifference = await page.evaluate(() => window.__differenceDebug.getCurrentCompareProblem().differences[0]);
    await tapAtPercent(compareRightHitbox, firstDifference.x, firstDifference.y);
    await page.waitForSelector('#clearScreen.show');

    await page.locator('#clearScreen img[alt="プリンセス"]').waitFor();
    assert.match(await page.locator('#clearText').textContent(), /くらべて/);
    assert.equal(await page.locator('#clearRestartBtn').textContent(), 'もう一度');

    await page.locator('#clearRestartBtn').click();
    await page.locator('#gameScreen.show').waitFor();
    const secondProblemId = await page.evaluate(() => window.__differenceDebug.getCurrentCompareProblem().id);
    assert.notEqual(secondProblemId, firstProblemId, 'compare mode should avoid repeating the same puzzle immediately');

    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('memory mode plays voice1, voice2, and replays with a new question', async () => {
  const { browser, page, server, pageErrors, consoleErrors } = await openPage('/index.html', () => {
    window.__voiceCalls = [];
    window.__differenceVoiceConfig = {
      voice1: { enabled: true, path: './voices/voice1.mp3' },
      voice2: { enabled: true, path: './voices/voice2.mp3' }
    };

    class MockAudio {
      constructor(src) {
        this.src = src;
        this.preload = 'auto';
        this.onended = null;
        this.onerror = null;
      }

      play() {
        window.__voiceCalls.push(this.src);
        return Promise.resolve();
      }
    }

    window.Audio = MockAudio;
  });

  try {
    await page.locator('a[href="games/difference.html"]').click();
    await page.waitForURL(/games\/difference\.html$/);
    await page.locator('#modeScreen.show').waitFor();

    await page.locator('.mode-card[data-mode="memory"]').click();
    await page.locator('#memoryStage').waitFor();
    await page.waitForFunction(() => window.__voiceCalls.some((src) => src.includes('voice1.mp3')));

    await page.waitForTimeout(5200);
    await page.waitForFunction(() => window.__voiceCalls.some((src) => src.includes('voice2.mp3')));

    assert.match(await page.locator('#instructionText').textContent(), /なくなった ものは どれかな/);

    const firstMissingId = await page.evaluate(() => window.__differenceDebug.getMemoryProblem().missingId);
    const answer = page.locator(`.memory-option[data-id="${firstMissingId}"]`);
    await answer.waitFor();
    await answer.click();
    await page.waitForSelector('#clearScreen.show');
    await page.locator('#clearScreen img[alt="プリンセス"]').waitFor();

    await page.locator('#clearRestartBtn').click();
    await page.locator('#memoryStage').waitFor();
    await page.locator('#memoryBoard .memory-item').first().waitFor();

    const secondMissingId = await page.evaluate(() => window.__differenceDebug.getMemoryProblem().missingId);
    assert.notEqual(secondMissingId, firstMissingId);

    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});

test('memory mode stays safe when voice files are still missing', async () => {
  const { browser, page, server, pageErrors, consoleErrors } = await openPage('/index.html');

  try {
    await page.locator('a[href="games/difference.html"]').click();
    await page.waitForURL(/games\/difference\.html$/);
    await page.locator('#modeScreen.show').waitFor();

    await page.locator('.mode-card[data-mode="memory"]').click();
    await page.locator('#memoryStage').waitFor();
    await page.waitForTimeout(5200);
    await page.locator('#memoryOptions .memory-option').first().waitFor();

    assert.deepEqual(pageErrors, []);
    assert.deepEqual(consoleErrors, []);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
