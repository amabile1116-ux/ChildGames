const NUMBER_WORDS = {
  1: 'いち',
  2: 'に',
  3: 'さん',
  4: 'よん',
  5: 'ご',
  6: 'ろく',
  7: 'なな',
  8: 'はち',
  9: 'きゅう',
  10: 'じゅう'
};

const state = {
  selectedCount: 0,
  placement: [],
  boardValues: [],
  boardSlots: [],
  isClear: false,
  lastSpokenText: ''
};

const difficultyScreen = document.getElementById('difficultyScreen');
const gameScreen = document.getElementById('gameScreen');
const clearScreen = document.getElementById('clearScreen');
const boardEl = document.getElementById('board');
const placedArea = document.getElementById('placedArea');
const statusText = document.getElementById('statusText');
const playSequenceBtn = document.getElementById('playSequenceBtn');
const backBtn = document.getElementById('backBtn');
const restartBtn = document.getElementById('restartBtn');
const clearRestartBtn = document.getElementById('clearRestartBtn');

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBoardSlots(count) {
  const columns = count <= 3 ? 3 : count <= 5 ? 3 : 5;
  const rows = Math.ceil(count / columns);
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const index = row * columns + col;
      if (index >= count) {
        continue;
      }
      slots.push({ row, col });
    }
  }

  return slots;
}

function setScreen(target) {
  difficultyScreen.classList.toggle('show', target === 'difficulty');
  gameScreen.classList.toggle('show', target === 'game');
  clearScreen.classList.toggle('show', target === 'clear');
}

function playAudioFile(fileName) {
  return new Promise((resolve) => {
    const audio = new Audio(fileName);
    audio.preload = 'auto';
    audio.onended = () => resolve();
    audio.onerror = () => resolve();
    audio.play().catch(() => resolve());
  });
}

function speakText(text) {
  window.__lastSpokenText = text;
  state.lastSpokenText = text;

  if (text === 'せいかい！') {
    playAudioFile('./sounds/OK.mp3');
    return;
  }

  const values = String(text)
    .split('、')
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value));

  if (values.length > 0) {
    (async () => {
      for (const value of values) {
        await playAudioFile(`./sounds/num_${value}.mp3`);
      }
    })();
  }
}

async function speakSequence(values) {
  const spoken = values.map((value) => NUMBER_WORDS[value] || value).join('、');
  window.__lastSpokenText = spoken;
  state.lastSpokenText = spoken;

  for (const value of values) {
    await playAudioFile(`./sounds/num_${value}.mp3`);
  }
}

function isCorrectOrder(values) {
  return values.length === state.selectedCount && values.every((value, index) => value === index + 1);
}

function setStatus(message) {
  statusText.textContent = message;
}

function renderPlacedArea() {
  const slots = [];
  for (let index = 0; index < state.selectedCount; index += 1) {
    const value = state.placement[index];
    if (value === undefined) {
      slots.push('<button class="placed-slot empty" type="button" aria-label="まだ並んでいません" tabindex="-1"> </button>');
      continue;
    }

    slots.push(`<button class="placed-slot filled" type="button" data-value="${value}" aria-label="${value} を取り消す">${value}</button>`);
  }

  placedArea.innerHTML = slots.join('');

  placedArea.querySelectorAll('.placed-slot.filled').forEach((button) => {
    button.addEventListener('click', () => {
      const value = Number(button.dataset.value);
      removePlacedValue(value);
    });
  });
}

function renderBoard() {
  boardEl.innerHTML = '';

  state.boardValues.forEach((value, index) => {
    if (state.placement.includes(value)) {
      return;
    }

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'number-card';
    card.dataset.value = String(value);
    card.textContent = value;
    card.setAttribute('aria-label', `${value} を並べる`);

    const slot = state.boardSlots[index];
    const columns = state.selectedCount <= 3 ? 3 : state.selectedCount <= 5 ? 3 : 5;
    const rows = Math.ceil(state.selectedCount / columns);
    const leftPercent = ((slot.col + 0.5) / columns) * 100;
    const topPercent = ((slot.row + 0.5) / rows) * 100;
    card.style.left = `${leftPercent}%`;
    card.style.top = `${topPercent}%`;

    card.addEventListener('click', () => {
      addPlacedValue(value);
    });

    boardEl.appendChild(card);
  });
}

function addPlacedValue(value) {
  if (state.isClear) {
    return;
  }

  if (state.placement.includes(value)) {
    return;
  }

  state.placement.push(value);
  render();
  playAudioFile(`./sounds/num_${value}.mp3`).catch(() => {});
}

function removePlacedValue(value) {
  const nextPlacement = state.placement.filter((item) => item !== value);
  state.placement = nextPlacement;
  render();
  if (!state.isClear) {
    setStatus('1から ならべよう');
  }
}

function triggerClear() {
  state.isClear = true;
  setStatus('🎉 せいかい！');
  speakText('せいかい！');
  setScreen('clear');
}

function render() {
  renderPlacedArea();
  renderBoard();
}

function startGame(count) {
  state.selectedCount = count;
  state.placement = [];
  state.boardValues = Array.from({ length: count }, (_, index) => index + 1);
  state.boardSlots = buildBoardSlots(count);
  state.boardValues = shuffle(state.boardValues);
  state.boardSlots = shuffle(state.boardSlots);
  state.isClear = false;
  setScreen('game');
  setStatus('1から ならべよう');
  render();
}

function resetToDifficulty() {
  state.selectedCount = 0;
  state.placement = [];
  setScreen('difficulty');
  setStatus('1から ならべよう');
}

document.querySelectorAll('.difficulty-card').forEach((card) => {
  card.addEventListener('click', () => {
    const count = Number(card.dataset.count);
    startGame(count);
  });
});

playSequenceBtn.addEventListener('click', async () => {
  if (state.isClear) {
    return;
  }

  await speakSequence(state.placement);

  if (isCorrectOrder(state.placement)) {
    triggerClear();
    return;
  }

  await playAudioFile('./sounds/NG.mp3');
  state.placement = [];
  render();
  setStatus('1から ならべよう');
});

backBtn.addEventListener('click', () => {
  resetToDifficulty();
});

restartBtn.addEventListener('click', () => {
  if (state.selectedCount > 0) {
    startGame(state.selectedCount);
  } else {
    resetToDifficulty();
  }
});

clearRestartBtn.addEventListener('click', () => {
  resetToDifficulty();
});

setScreen('difficulty');
setStatus('1から ならべよう');
window.__lastSpokenText = '';
