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
  mode: 'easy',
  selectedCount: 5,
  placement: [],
  boardValues: [],
  boardSlots: [],
  expectedOrder: [],
  promptValue: null,
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
  const columns = 3;
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

function setStatus(message) {
  statusText.textContent = message;
  if (message === '') {
    statusText.style.display = 'none';
    return;
  }
  statusText.style.display = 'block';
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
    return playAudioFile('./sounds/OK.mp3');
  }

  const values = String(text)
    .split('、')
    .map((part) => Number(part))
    .filter((value) => Number.isFinite(value));

  if (values.length > 0) {
    return (async () => {
      for (const value of values) {
        await playAudioFile(`./sounds/num_${value}.mp3`);
      }
    })();
  }

  return Promise.resolve();
}

async function speakSequence(values) {
  const spoken = values.map((value) => NUMBER_WORDS[value] || value).join('、');
  window.__lastSpokenText = spoken;
  state.lastSpokenText = spoken;

  for (const value of values) {
    await playAudioFile(`./sounds/num_${value}.mp3`);
  }
}

function isCorrectEasyOrder(values) {
  return values.length === 5 && values.every((value, index) => value === index + 1);
}

async function playNormalPrompt() {
  if (state.mode !== 'normal' || state.promptValue === null) {
    return;
  }

  const value = state.promptValue;
  window.__lastSpokenText = String(value);
  state.lastSpokenText = String(value);

  await playAudioFile(`./sounds/num_${value}.mp3`);
  await wait(150);
  await playAudioFile('./sounds/choose.mp3');
}

function nextRound(mode) {
  state.mode = mode;
  state.placement = [];
  state.isClear = false;
  state.expectedOrder = [];
  state.promptValue = null;
  window.__currentPromptValue = null;

  if (mode === 'easy') {
    state.selectedCount = 5;
    state.boardValues = shuffle([1, 2, 3, 4, 5]);
    state.boardSlots = shuffle(buildBoardSlots(5));
    setStatus('1から ならべよう');
  } else if (mode === 'normal') {
    state.selectedCount = 5;
    const target = Math.floor(Math.random() * 5) + 1;
    state.promptValue = target;
    window.__currentPromptValue = target;
    state.boardValues = shuffle([1, 2, 3, 4, 5]);
    state.boardSlots = shuffle(buildBoardSlots(5));
    setStatus('');
  } else {
    state.selectedCount = 5;
    const values = new Set();
    while (values.size < 5) {
      values.add(Math.floor(Math.random() * 10) + 1);
    }
    state.expectedOrder = [...values].sort((a, b) => a - b);
    state.boardValues = shuffle(state.expectedOrder);
    state.boardSlots = shuffle(buildBoardSlots(5));
    setStatus('ちいさい じゅんに ならべよう');
  }

  render();
}

function triggerClear() {
  state.isClear = true;
  setStatus('🎉 せいかい！');
  speakText('せいかい！');
  setScreen('clear');
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
      const nextPlacement = state.placement.filter((item) => item !== value);
      state.placement = nextPlacement;
      render();
      if (!state.isClear) {
        setStatus(state.mode === 'easy' ? '1から ならべよう' : 'もういちど');
      }
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
    card.setAttribute('aria-label', `${value} を選ぶ`);

    const slot = state.boardSlots[index];
    const columns = 3;
    const rows = Math.ceil(state.selectedCount / columns);
    const leftPercent = ((slot.col + 0.5) / columns) * 100;
    const topPercent = ((slot.row + 0.5) / rows) * 100;
    card.style.left = `${leftPercent}%`;
    card.style.top = `${topPercent}%`;

    card.addEventListener('click', () => {
      if (state.isClear) {
        return;
      }

      if (state.mode === 'normal') {
        if (value === state.promptValue) {
          setStatus('');
          (async () => {
            await speakText('せいかい！');
            await wait(500);
            nextRound('normal');
            setScreen('game');
            setTimeout(() => {
              playNormalPrompt();
            }, 150);
          })();
          return;
        }

        (async () => {
          await playAudioFile('./sounds/NG.mp3');
          await wait(300);
          await playNormalPrompt();
        })();
        setStatus('');
        return;
      }

      if (state.mode === 'hard') {
        if (state.placement.includes(value)) {
          return;
        }

        const expected = state.expectedOrder[state.placement.length];
        if (value !== expected) {
          playAudioFile('./sounds/NG.mp3');
          state.placement = [];
          render();
          setStatus('もういちど');
          return;
        }

        state.placement.push(value);
        render();

        if (state.placement.length === state.expectedOrder.length) {
          setStatus('🎉 せいかい！');
          speakText('せいかい！');
          setScreen('clear');
          setTimeout(() => {
            setScreen('game');
            nextRound('hard');
          }, 700);
          return;
        }

        setStatus(`${state.placement.length}こ そろったよ`);
        return;
      }

      if (state.placement.includes(value)) {
        return;
      }

      state.placement.push(value);
      render();
      playAudioFile(`./sounds/num_${value}.mp3`).catch(() => {});
    });

    boardEl.appendChild(card);
  });
}

function render() {
  renderPlacedArea();
  renderBoard();
}

function resetToDifficulty() {
  state.mode = 'easy';
  state.placement = [];
  state.promptValue = null;
  window.__currentPromptValue = null;
  setScreen('difficulty');
  setStatus('1から ならべよう');
}

document.querySelectorAll('.difficulty-card').forEach((card) => {
  card.addEventListener('click', () => {
    const mode = card.dataset.mode || 'easy';
    nextRound(mode);
    setScreen('game');
    if (mode === 'normal') {
      setTimeout(() => {
        playNormalPrompt();
      }, 150);
    }
  });
});

playSequenceBtn.addEventListener('click', async () => {
  if (state.isClear) {
    return;
  }

  if (state.mode === 'normal') {
    if (state.promptValue === null) {
      return;
    }
    setStatus('');
    playNormalPrompt();
    return;
  }

  if (state.mode === 'hard') {
    if (state.placement.length > 0) {
      await speakSequence(state.placement);
      return;
    }
    return;
  }

  await speakSequence(state.placement);

  if (isCorrectEasyOrder(state.placement)) {
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
  nextRound(state.mode || 'easy');
  setScreen('game');
});

clearRestartBtn.addEventListener('click', () => {
  nextRound(state.mode || 'easy');
  setScreen('game');
});

setScreen('difficulty');
setStatus('1から ならべよう');
window.__lastSpokenText = '';
window.__currentPromptValue = null;
