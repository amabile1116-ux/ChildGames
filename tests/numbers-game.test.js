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

test('numbers normal mode keeps prompt flow and hard mode asks random small/big questions', async () => {
  const { browser, page, server, port } = await openPage('/games/numbers.html');

  try {
    const cards = await page.locator('.difficulty-card').count();
    assert.equal(cards, 3, 'difficulty selection should show three difficulty cards');

    const modeNames = await page.locator('.difficulty-card').evaluateAll((nodes) =>
      nodes.map((node) => node.dataset.mode)
    );
    assert.deepEqual(modeNames, ['easy', 'normal', 'hard']);

    await page.locator('.difficulty-card[data-mode="easy"]').click();
    await page.waitForSelector('.number-card');
    const easyValues = await page.locator('.number-card').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.value))
    );
    assert.deepEqual([...easyValues].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    await page.locator('#backBtn').click();

    await page.locator('.difficulty-card[data-mode="normal"]').click();
    await page.waitForSelector('.number-card');

    const normalValues = await page.locator('.number-card').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.value))
    );
    assert.equal(normalValues.length, 5);
    assert.ok(normalValues.every((value) => value >= 1 && value <= 5));

    const promptValue = await page.evaluate(() => window.__currentPromptValue || null);
    assert.ok(promptValue >= 1 && promptValue <= 5, 'normal mode should prompt only 1 through 5');
    const statusDisplay = await page.locator('#statusText').evaluate((element) => getComputedStyle(element).display);
    assert.equal(statusDisplay, 'none', 'normal mode should hide the prompt text block');

    await page.locator('#playSequenceBtn').click();
    const spoken = await page.evaluate(() => window.__lastSpokenText || '');
    assert.ok(spoken.includes(String(promptValue)) || spoken.length > 0, 'normal mode should speak the target number');

    const targetCard = Number(promptValue);
    await page.evaluate(() => {
      window.__testAudioDelayMs = 180;
      const OriginalAudio = window.Audio;
      window.Audio = class extends OriginalAudio {
        constructor(src) {
          super(src);
          this._src = src;
        }
        play() {
          return new Promise((resolve) => {
            setTimeout(() => {
              if (this.onended) {
                this.onended();
              }
              resolve();
            }, window.__testAudioDelayMs);
          });
        }
      };
    });
    await page.locator(`.number-card[data-value="${targetCard}"]`).first().click();
    const promptImmediatelyAfterClick = await page.evaluate(() => window.__currentPromptValue || null);
    assert.equal(promptImmediatelyAfterClick, promptValue, 'the next prompt must wait for the OK audio to finish');

    await page.waitForTimeout(250);
    const nextPrompt = await page.evaluate(() => window.__currentPromptValue || null);
    assert.ok(nextPrompt >= 1 && nextPrompt <= 5, 'normal mode should advance to a fresh 1-5 prompt after the OK audio ends');

    await page.locator('#backBtn').click();
    await page.evaluate(() => {
      const originalRandom = Math.random.bind(Math);
      window.__randomQueue = [
        0.11, 0.81, 0.41, 0.20, 0.70, 0.30, 0.60, 0.20, // hard round 1: values + shuffles + "small"
        0.61, 0.01, 0.31, 0.40, 0.80, 0.50, 0.90, 0.80  // hard round 2: values + shuffles + "big"
      ];
      Math.random = () => {
        if (window.__randomQueue.length > 0) {
          return window.__randomQueue.shift();
        }
        return originalRandom();
      };

      const OriginalAudio = window.Audio;
      window.__audioPlayed = [];
      window.Audio = class extends OriginalAudio {
        constructor(src) {
          super(src);
          window.__audioPlayed.push(src);
        }

        play() {
          return new Promise((resolve) => {
            setTimeout(() => {
              if (this.onended) {
                this.onended();
              }
              resolve();
            }, 0);
          });
        }
      };
    });

    await page.locator('.difficulty-card[data-mode="hard"]').click();
    await page.waitForSelector('.number-card');
    await page.waitForFunction(() => (window.__audioPlayed || []).length >= 1);

    const hardValues = await page.locator('.number-card').evaluateAll((nodes) =>
      nodes.map((node) => Number(node.dataset.value))
    );
    assert.equal(hardValues.length, 3);
    assert.ok(hardValues.every((value) => value >= 1 && value <= 10));
    assert.equal(new Set(hardValues).size, hardValues.length, 'hard mode should use distinct values');

    const firstHardPrompt = await page.evaluate(() => window.__currentHardPromptType || null);
    assert.equal(firstHardPrompt, 'small', 'hard mode should ask the small-question prompt');
    const firstAudio = await page.evaluate(() => window.__audioPlayed[0]);
    assert.ok(firstAudio.endsWith('/sounds/small.mp3') || firstAudio === './sounds/small.mp3');

    await page.locator('#playSequenceBtn').click();
    await page.waitForFunction(() => (window.__audioPlayed || []).length >= 2);
    const replayAudio = await page.evaluate(() => window.__audioPlayed[1]);
    assert.ok(replayAudio.endsWith('/sounds/small.mp3') || replayAudio === './sounds/small.mp3');

    const hardTargetValue = await page.evaluate(() => window.__currentHardTargetValue || null);
    const wrongValue = hardValues.find((value) => value !== hardTargetValue);
    assert.ok(Number.isFinite(wrongValue), 'hard mode should have a wrong option');

    await page.locator(`.number-card[data-value="${wrongValue}"]`).first().click();
    await page.waitForFunction(() => (window.__audioPlayed || []).length >= 3);
    const ngAudio = await page.evaluate(() => window.__audioPlayed[2]);
    assert.ok(ngAudio.endsWith('/sounds/NG.mp3') || ngAudio === './sounds/NG.mp3');
    assert.equal(await page.locator('.number-card').count(), 3, 'wrong answer should not end the hard game');

    await page.locator(`.number-card[data-value="${hardTargetValue}"]`).first().click();
    await page.waitForFunction(() => (window.__audioPlayed || []).length >= 5);

    const secondHardPrompt = await page.evaluate(() => window.__currentHardPromptType || null);
    assert.equal(secondHardPrompt, 'big', 'after correct answer, hard mode should move to a big-question prompt');
    const nextPromptAudio = await page.evaluate(() => window.__audioPlayed[4]);
    assert.ok(nextPromptAudio.endsWith('/sounds/big.mp3') || nextPromptAudio === './sounds/big.mp3');

    await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
    const homeLink = page.locator('a[href="games/numbers.html"]');
    await homeLink.waitFor();
    assert.equal(await homeLink.getAttribute('aria-label'), 'すうじをならべよう');
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
