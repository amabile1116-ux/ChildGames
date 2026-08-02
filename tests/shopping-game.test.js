const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('shopping game includes kana labels, icon-based questions, and next-button flow', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'games', 'shopping.html'), 'utf8');

  assert.match(html, /ぎゅうにゅう/);
  assert.match(html, /ばななを/);
  assert.match(html, /つぎへ/);
  assert.match(html, /registerBtn\.style\.display = "none"/);
});
