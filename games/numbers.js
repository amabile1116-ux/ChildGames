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
  hardPromptType: null,
  hardTargetValue: null,
  isRoundTransition: false,
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

const audioPlaybackState = {
  current: null
};

function playAudioFile(fileName) {
  return new Promise((resolve) => {
    if (audioPlaybackState.current) {
      try {
        audioPlaybackState.current.pause();
        audioPlaybackState.current.currentTime = 0;
      } catch (error) {
        // ignore browser-specific pause failures
      }
      audioPlaybackState.current = null;
    }

    const audio = new Audio(fileName);
    audio.preload = 'auto';
    audioPlaybackState.current = audio;

    const finish = () => {
      if (audioPlaybackState.current === audio) {
        audioPlaybackState.current = null;
      }
      resolve();
    };

    audio.onended = finish;
    audio.onerror = finish;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        finish();
      });
    }
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

async function playHardPrompt() {
  if (state.mode !== 'hard' || !state.hardPromptType) {
    return;
  }

  const fileName = state.hardPromptType === 'small' ? './sounds/small.mp3' : './sounds/big.mp3';
  window.__lastSpokenText = state.hardPromptType === 'small' ? 'small' : 'big';
  state.lastSpokenText = window.__lastSpokenText;
  await playAudioFile(fileName);
}

function triggerModePrompt(mode) {
  if (mode === 'normal') {
    setTimeout(() => {
      playNormalPrompt();
    }, 150);
    return;
  }

  if (mode === 'hard') {
    setTimeout(() => {
      playHardPrompt();
    }, 150);
  }
}

function nextRound(mode) {
  state.mode = mode;
  state.placement = [];
  state.isClear = false;
  state.isRoundTransition = false;
  state.expectedOrder = [];
  state.promptValue = null;
  state.hardPromptType = null;
  state.hardTargetValue = null;
  window.__currentPromptValue = null;
  window.__currentHardPromptType = null;
  window.__currentHardTargetValue = null;

  if (mode === 'easy') {
    state.selectedCount = 5;
    state.boardValues = shuffle([1, 2, 3, 4, 5]);
    state.boardSlots = shuffle(buildBoardSlots(5));
    setStatus('1から ならべよう');
  } else if (mode === 'normal') {
    state.selectedCount = 5;
    const numbers = shuffle(Array.from({ length: 10 }, (_, index) => index + 1)).slice(0, 5);
    const target = numbers[Math.floor(Math.random() * numbers.length)];
    state.promptValue = target;
    window.__currentPromptValue = target;
    state.boardValues = numbers;
    state.boardSlots = shuffle(buildBoardSlots(5));
    setStatus('');
  } else {
    state.selectedCount = 3;
    const values = new Set();
    while (values.size < 3) {
      values.add(Math.floor(Math.random() * 10) + 1);
    }
    state.boardValues = shuffle([...values]);
    state.boardSlots = shuffle(buildBoardSlots(3));
    state.hardPromptType = Math.random() < 0.5 ? 'small' : 'big';
    state.hardTargetValue = state.hardPromptType === 'small'
      ? Math.min(...state.boardValues)
      : Math.max(...state.boardValues);
    window.__currentHardPromptType = state.hardPromptType;
    window.__currentHardTargetValue = state.hardTargetValue;
    setStatus('');
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
  if (state.mode !== 'easy') {
    placedArea.innerHTML = '';
    placedArea.style.display = 'none';
    return;
  }

  placedArea.style.display = 'flex';
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

      if (state.isRoundTransition) {
        return;
      }

      if (state.mode === 'normal') {
        if (value === state.promptValue) {
          setStatus('');
          triggerClear();
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
        if (value !== state.hardTargetValue) {
          playAudioFile('./sounds/NG.mp3');
          setStatus('もういちど');
          return;
        }

        setStatus('');
        triggerClear();
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
  state.hardPromptType = null;
  state.hardTargetValue = null;
  state.isRoundTransition = false;
  window.__currentPromptValue = null;
  window.__currentHardPromptType = null;
  window.__currentHardTargetValue = null;
  setScreen('difficulty');
  setStatus('1から ならべよう');
}

document.querySelectorAll('.difficulty-card').forEach((card) => {
  card.addEventListener('click', () => {
    const mode = card.dataset.mode || 'easy';
    nextRound(mode);
    setScreen('game');
    triggerModePrompt(mode);
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
    if (!state.isRoundTransition) {
      await playHardPrompt();
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
  triggerModePrompt(state.mode || 'easy');
});

clearRestartBtn.addEventListener('click', () => {
  nextRound(state.mode || 'easy');
  setScreen('game');
  triggerModePrompt(state.mode || 'easy');
});

setScreen('difficulty');
setStatus('1から ならべよう');
window.__lastSpokenText = '';
window.__currentPromptValue = null;
window.__currentHardPromptType = null;
window.__currentHardTargetValue = null;
