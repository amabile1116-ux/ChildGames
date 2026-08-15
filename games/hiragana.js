const WORDS = [
  {
    name: 'にいな',
    chars: ['に', 'い', 'な']
  }
];

const GRID_SIZE = 100;
const CELL_COUNT = 3;
const MIN_TARGET_PIXELS = 100;
const AREA_THRESHOLD = 0.30;
const MIN_SUCCESSFUL_AREAS_RATIO = 0.90;
const MIN_OVERALL_HIT_RATIO = 0.15;

const state = {
  word: WORDS[0],
  charIndex: 0,
  currentChar: 'に',
  targetCells: Array(9).fill(null).map(() => new Set()),
  hitCells: Array(9).fill(null).map(() => new Set()),
  strokes: [],
  currentStroke: null,
  isPointerDown: false,
  isSuccess: false,
  screen: 'title'
};

const titleScreen = document.getElementById('titleScreen');
const practiceScreen = document.getElementById('practiceScreen');
const clearScreen = document.getElementById('clearScreen');
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const restartBtn = document.getElementById('restartBtn');
const progressText = document.getElementById('progressText');
const wordLabel = document.getElementById('wordLabel');
const statusText = document.getElementById('statusText');
const canvas = document.getElementById('hiraganaCanvas');
const ctx = canvas.getContext('2d');

function setScreen(nextScreen) {
  state.screen = nextScreen;
  titleScreen.classList.toggle('show', nextScreen === 'title');
  practiceScreen.classList.toggle('show', nextScreen === 'practice');
  clearScreen.classList.toggle('show', nextScreen === 'clear');
}

function getGridIndex(x, y) {
  const col = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((x / GRID_SIZE) * CELL_COUNT)));
  const row = Math.min(CELL_COUNT - 1, Math.max(0, Math.floor((y / GRID_SIZE) * CELL_COUNT)));
  return row * CELL_COUNT + col;
}

function normalizeToGrid(point) {
  const x = (point.x / canvas.width) * GRID_SIZE;
  const y = (point.y / canvas.height) * GRID_SIZE;
  return { x, y };
}

function setCurrentCharacter() {
  state.currentChar = state.word.chars[state.charIndex];
  state.targetCells = buildTargetCellsForChar(state.currentChar);
  state.hitCells = Array(9).fill(null).map(() => new Set());
  state.strokes = [];
  state.currentStroke = null;
  state.isSuccess = false;
  progressText.textContent = `${state.charIndex + 1} / ${state.word.chars.length}`;
  wordLabel.textContent = state.currentChar;
  statusText.textContent = 'ゆびで なぞってみよう！';
  statusText.classList.remove('success');
  renderCanvas();
}

function buildTargetCellsForChar(char) {
  const offscreen = document.createElement('canvas');
  offscreen.width = GRID_SIZE;
  offscreen.height = GRID_SIZE;
  const offCtx = offscreen.getContext('2d');

  offCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
  offCtx.fillStyle = '#000000';
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.font = '700 70px "Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif';
  offCtx.fillText(char, GRID_SIZE / 2, GRID_SIZE / 2);

  const imageData = offCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;
  const cells = Array(9).fill(null).map(() => new Set());

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const index = (y * GRID_SIZE + x) * 4;
      const alpha = imageData[index + 3];

      if (alpha <= 0) {
        continue;
      }

      const cellIndex = getGridIndex(x, y);
      cells[cellIndex].add(y * GRID_SIZE + x);
    }
  }

  return cells;
}

function drawGuide() {
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(122, 146, 255, 0.30)';
  ctx.lineWidth = 1;
  for (let i = 1; i < CELL_COUNT; i += 1) {
    const offset = (width / CELL_COUNT) * i;
    ctx.beginPath();
    ctx.moveTo(offset, 0);
    ctx.lineTo(offset, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(width, offset);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(92, 117, 255, 0.18)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.floor(width * 0.72)}px "Hiragino Sans", "Yu Gothic", sans-serif`;
  ctx.fillText(state.currentChar, width / 2, height / 2 + 14);
}

function drawStroke(stroke) {
  if (!stroke || stroke.length < 1) {
    return;
  }

  ctx.beginPath();
  ctx.strokeStyle = '#ff6f91';
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.moveTo(stroke[0].x, stroke[0].y);

  for (let i = 1; i < stroke.length; i += 1) {
    ctx.lineTo(stroke[i].x, stroke[i].y);
  }

  ctx.stroke();
}

function renderCanvas() {
  drawGuide();

  for (const stroke of state.strokes) {
    drawStroke(stroke);
  }
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / (rect.width || 1);
  const scaleY = canvas.height / (rect.height || 1);
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  return { x, y };
}

function markHitAtPixel(gridX, gridY) {
  if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
    return;
  }

  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -2; dy <= 2; dy += 1) {
      const cx = gridX + dx;
      const cy = gridY + dy;

      if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) {
        continue;
      }

      const neighborIndex = cy * GRID_SIZE + cx;
      const cellIndex = getGridIndex(cx, cy);
      if (state.targetCells[cellIndex] && state.targetCells[cellIndex].has(neighborIndex)) {
        state.hitCells[cellIndex].add(neighborIndex);
      }
    }
  }
}

function processStrokeSegment(from, to) {
  const start = normalizeToGrid(from);
  const end = normalizeToGrid(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  if (steps === 0) {
    markHitAtPixel(Math.round(end.x), Math.round(end.y));
    return;
  }

  const stepCount = Math.ceil(steps);
  for (let i = 0; i <= stepCount; i += 1) {
    const t = i / stepCount;
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    markHitAtPixel(Math.round(x), Math.round(y));
  }
}

function evaluateSuccess() {
  const validAreas = [];
  let successfulAreas = 0;
  let totalTargetPixels = 0;
  let totalHitPixels = 0;

  for (let i = 0; i < state.targetCells.length; i += 1) {
    const targetSet = state.targetCells[i];
    const hitSet = state.hitCells[i];

    if (targetSet.size === 0) {
      continue;
    }

    totalTargetPixels += targetSet.size;
    totalHitPixels += hitSet.size;

    if (targetSet.size < MIN_TARGET_PIXELS) {
      continue;
    }

    validAreas.push(i);

    const areaRatio = hitSet.size / targetSet.size;
    if (areaRatio >= AREA_THRESHOLD) {
      successfulAreas += 1;
    }
  }

  if (!validAreas.length) {
    return false;
  }

  const areasRatio = successfulAreas / validAreas.length;
  const overallRatio = totalTargetPixels > 0 ? totalHitPixels / totalTargetPixels : 0;

  return areasRatio >= MIN_SUCCESSFUL_AREAS_RATIO && overallRatio >= MIN_OVERALL_HIT_RATIO;
}

function showSuccessState() {
  state.isSuccess = true;
  statusText.textContent = 'できた！';
  statusText.classList.add('success');

  const confetti = document.createElement('div');
  confetti.className = 'sparkles';
  for (let i = 0; i < 22; i += 1) {
    const sparkle = document.createElement('span');
    sparkle.className = 'sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.setProperty('--dx', `${(Math.random() - 0.5) * 180}px`);
    sparkle.style.setProperty('--dy', `${-(Math.random() * 170 + 30)}px`);
    confetti.appendChild(sparkle);
  }

  const existing = document.querySelector('.sparkles');
  if (existing) {
    existing.remove();
  }

  document.querySelector('.app').appendChild(confetti);

  setTimeout(() => {
    if (state.charIndex < state.word.chars.length - 1) {
      state.charIndex += 1;
      setCurrentCharacter();
    } else {
      setScreen('clear');
    }
  }, 1200);
}

function startStroke(event) {
  if (state.isSuccess) {
    return;
  }

  event.preventDefault();
  const point = getCanvasPoint(event);
  state.currentStroke = [point];
  state.strokes.push(state.currentStroke);
  state.isPointerDown = true;
  renderCanvas();
}

function moveStroke(event) {
  if (!state.isPointerDown || state.isSuccess) {
    return;
  }

  event.preventDefault();
  const point = getCanvasPoint(event);

  if (!state.currentStroke) {
    state.currentStroke = [point];
    state.strokes.push(state.currentStroke);
    renderCanvas();
    return;
  }

  const previous = state.currentStroke[state.currentStroke.length - 1];
  if (!previous) {
    state.currentStroke.push(point);
    renderCanvas();
    return;
  }

  processStrokeSegment(previous, point);
  state.currentStroke.push(point);
  renderCanvas();
}

function endStroke() {
  if (!state.isPointerDown) {
    return;
  }

  state.isPointerDown = false;
  state.currentStroke = null;

  if (!state.isSuccess && evaluateSuccess()) {
    showSuccessState();
  }
}

function resetCurrentCharacter() {
  state.isSuccess = false;
  state.strokes = [];
  state.currentStroke = null;
  state.hitCells = Array(9).fill(null).map(() => new Set());
  renderCanvas();
  statusText.textContent = 'ゆびで なぞってみよう！';
  statusText.classList.remove('success');
}

function startGame() {
  state.charIndex = 0;
  setCurrentCharacter();
  setScreen('practice');
}

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', resetCurrentCharacter);
restartBtn.addEventListener('click', startGame);

canvas.addEventListener('pointerdown', startStroke);
canvas.addEventListener('pointermove', moveStroke);
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointerleave', endStroke);
canvas.addEventListener('pointercancel', endStroke);

setScreen('title');
renderCanvas();
