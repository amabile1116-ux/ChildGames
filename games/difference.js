function toSvgDataUri(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPlaceholderScene(options) {
  const {
    balloonColor,
    flowerColor,
    cloudText
  } = options;

  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="プレースホルダーの絵">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#dff4ff" />
          <stop offset="100%" stop-color="#fff4cf" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="18" fill="url(#sky)" />
      <rect y="72" width="100" height="28" fill="#9be17c" />
      <circle cx="18" cy="18" r="8" fill="#ffd95c" />
      <ellipse cx="34" cy="20" rx="11" ry="6" fill="#ffffff" />
      <ellipse cx="42" cy="18" rx="9" ry="5" fill="#ffffff" />
      <ellipse cx="51" cy="21" rx="8" ry="5" fill="#ffffff" />
      <text x="42" y="23" text-anchor="middle" font-size="7" font-family="Arial" fill="#89a1bf">${cloudText}</text>
      <rect x="60" y="45" width="20" height="18" rx="2" fill="#ffe7c7" stroke="#d59465" stroke-width="1.5" />
      <polygon points="58,46 70,35 82,46" fill="#ff8fb0" />
      <rect x="67" y="54" width="6" height="9" rx="1" fill="#8fc8ff" />
      <circle cx="31" cy="63" r="8" fill="${balloonColor}" />
      <rect x="30.2" y="69" width="1.6" height="11" rx="1" fill="#8d5a4b" />
      <circle cx="50" cy="80" r="5.6" fill="${flowerColor}" />
      <circle cx="50" cy="80" r="2.2" fill="#ffd95c" />
      <rect x="49.2" y="81.5" width="1.6" height="8.5" rx="1" fill="#6cb35c" />
      <circle cx="22" cy="82" r="4.8" fill="#ffa5c5" />
      <circle cx="22" cy="82" r="2" fill="#ffd95c" />
      <rect x="21.3" y="83.2" width="1.4" height="7.8" rx="1" fill="#6cb35c" />
      <circle cx="77" cy="79" r="4.8" fill="#b391ff" />
      <circle cx="77" cy="79" r="2" fill="#ffd95c" />
      <rect x="76.3" y="80.2" width="1.4" height="8" rx="1" fill="#6cb35c" />
      <rect x="11" y="53" width="9" height="24" rx="3" fill="#8f6b53" />
      <circle cx="15.5" cy="47" r="10" fill="#62c86a" />
      <circle cx="10.5" cy="49" r="6" fill="#7edb85" />
      <circle cx="20" cy="49" r="6" fill="#7edb85" />
    </svg>
  `);
}

const MEMORY_ITEMS = {
  fruit: [
    { id: 'apple', label: 'りんご', emoji: '🍎', imagePath: 'images/placeholder-fruit.png' },
    { id: 'banana', label: 'バナナ', emoji: '🍌', imagePath: 'images/placeholder-fruit.png' },
    { id: 'grape', label: 'ぶどう', emoji: '🍇', imagePath: 'images/placeholder-fruit.png' },
    { id: 'strawberry', label: 'いちご', emoji: '🍓', imagePath: 'images/placeholder-fruit.png' },
    { id: 'orange', label: 'オレンジ', emoji: '🍊', imagePath: 'images/placeholder-fruit.png' },
    { id: 'watermelon', label: 'すいか', emoji: '🍉', imagePath: 'images/placeholder-fruit.png' },
    { id: 'peach', label: 'もも', emoji: '🍑', imagePath: 'images/placeholder-fruit.png' },
    { id: 'pineapple', label: 'パイナップル', emoji: '🍍', imagePath: 'images/placeholder-fruit.png' },
    { id: 'cherry', label: 'さくらんぼ', emoji: '🍒', imagePath: 'images/placeholder-fruit.png' },
    { id: 'kiwi', label: 'キウイ', emoji: '🥝', imagePath: 'images/placeholder-fruit.png' }
  ],
  animal: [
    { id: 'dog', label: 'いぬ', emoji: '🐶', imagePath: 'images/placeholder-animal.png' },
    { id: 'cat', label: 'ねこ', emoji: '🐱', imagePath: 'images/placeholder-animal.png' },
    { id: 'rabbit', label: 'うさぎ', emoji: '🐰', imagePath: 'images/placeholder-animal.png' },
    { id: 'elephant', label: 'ぞう', emoji: '🐘', imagePath: 'images/placeholder-animal.png' },
    { id: 'giraffe', label: 'きりん', emoji: '🦒', imagePath: 'images/placeholder-animal.png' },
    { id: 'lion', label: 'ライオン', emoji: '🦁', imagePath: 'images/placeholder-animal.png' },
    { id: 'monkey', label: 'さる', emoji: '🐵', imagePath: 'images/placeholder-animal.png' },
    { id: 'bear', label: 'くま', emoji: '🐻', imagePath: 'images/placeholder-animal.png' },
    { id: 'pig', label: 'ぶた', emoji: '🐷', imagePath: 'images/placeholder-animal.png' },
    { id: 'bird', label: 'とり', emoji: '🐦', imagePath: 'images/placeholder-animal.png' }
  ]
};

function buildPrincessGardenScene(missingFlower) {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="プリンセスのお花畑">
      <defs>
        <linearGradient id="gardenSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#dffbff" />
          <stop offset="100%" stop-color="#fff7d5" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#gardenSky)"/>
      <circle cx="17" cy="18" r="8" fill="#ffd96d"/>
      <rect y="65" width="100" height="35" fill="#9fe38b"/>
      <rect x="8" y="52" width="10" height="20" fill="#7dbf7d"/>
      <circle cx="13" cy="49" r="7" fill="#7edb85"/>
      <rect x="32" y="42" width="18" height="16" rx="4" fill="#f7d7a8"/>
      <circle cx="41" cy="36" r="8" fill="#f7d0df"/>
      <rect x="39" y="44" width="4" height="10" fill="#ffb3d1"/>
      <circle cx="34" cy="38" r="3.5" fill="#ffeb3b"/>
      <circle cx="48" cy="38" r="3.5" fill="#ffeb3b"/>
      <circle cx="41" cy="31" r="3.5" fill="#ffeb3b"/>
      <circle cx="41" cy="45" r="3.5" fill="#ffeb3b"/>
      <g opacity="${missingFlower ? '0.18' : '1'}">
        <rect x="58" y="42" width="18" height="16" rx="4" fill="#f7d7a8"/>
        <circle cx="67" cy="36" r="8" fill="#f7d0df"/>
        <rect x="65" y="44" width="4" height="10" fill="#ffb3d1"/>
        <circle cx="60" cy="38" r="3.5" fill="#ffeb3b"/>
        <circle cx="74" cy="38" r="3.5" fill="#ffeb3b"/>
        <circle cx="67" cy="31" r="3.5" fill="#ffeb3b"/>
        <circle cx="67" cy="45" r="3.5" fill="#ffeb3b"/>
      </g>
      <g>
        ${Array.from({ length: 6 }, (_, index) => {
          const x = 18 + index * 13;
          return `<circle cx="${x}" cy="${72 + (index % 2) * 3}" r="5" fill="#ff8ab3" /><circle cx="${x + 3}" cy="${68 + (index % 2) * 3}" r="5" fill="#ffb6cd" />`;
        }).join('')}
      </g>
      <circle cx="84" cy="20" r="6" fill="#ffd9bc"/>
      <rect x="83" y="25" width="2" height="9" fill="#9a725f"/>
      <path d="M70 60 L78 52 L86 60" fill="#e7b8ff"/>
      <path d="M20 58 L28 50 L36 58" fill="#b7dfff"/>
    </svg>
  `);
}

function buildForestScene(missingButterfly) {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="どうぶつの森">
      <rect width="100" height="100" fill="#dff9ff"/>
      <rect y="70" width="100" height="30" fill="#8bd98d"/>
      <circle cx="20" cy="18" r="7" fill="#ffe173"/>
      <g>
        <path d="M10 64 L20 45 L30 64 Z" fill="#6dbf67"/>
        <path d="M28 64 L38 43 L48 64 Z" fill="#85cc7d"/>
        <path d="M48 64 L62 38 L74 64 Z" fill="#67b76e"/>
        <path d="M68 64 L79 45 L90 64 Z" fill="#7ecf7b"/>
      </g>
      <g>
        <circle cx="22" cy="50" r="6" fill="#f0d19a"/>
        <circle cx="19" cy="48" r="1.5" fill="#3e2d27"/>
        <circle cx="25" cy="48" r="1.5" fill="#3e2d27"/>
        <path d="M19 54 Q22 57 25 54" stroke="#3e2d27" stroke-width="1.5" fill="none"/>
        <path d="M14 46 L7 39" stroke="#7ecf7b" stroke-width="2"/>
        <path d="M30 46 L38 39" stroke="#7ecf7b" stroke-width="2"/>
      </g>
      <g>
        <circle cx="70" cy="52" r="6" fill="#f0d19a"/>
        <circle cx="67" cy="50" r="1.5" fill="#3e2d27"/>
        <circle cx="73" cy="50" r="1.5" fill="#3e2d27"/>
        <path d="M67 56 Q70 59 73 56" stroke="#3e2d27" stroke-width="1.5" fill="none"/>
      </g>
      <g opacity="${missingButterfly ? '0.15' : '1'}">
        <path d="M52 30 C56 22, 65 22, 68 30 C65 34, 58 34, 52 30 Z" fill="#ff8ad1"/>
        <path d="M40 30 C44 22, 53 22, 56 30 C53 34, 46 34, 40 30 Z" fill="#ffd449"/>
        <circle cx="51" cy="30" r="2" fill="#3e2d27"/>
        <path d="M48 30 L51 35 L54 30" stroke="#3e2d27" stroke-width="1" fill="none"/>
      </g>
      <g>
        <circle cx="58" cy="44" r="2.5" fill="#f7bc7d"/>
        <circle cx="61" cy="44" r="2.5" fill="#f7bc7d"/>
      </g>
    </svg>
  `);
}

function buildCakeScene(missingStrawberry) {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="おかしのくに">
      <rect width="100" height="100" fill="#fff5d6"/>
      <rect y="70" width="100" height="30" fill="#bfe4ff"/>
      <rect x="14" y="44" width="72" height="24" rx="8" fill="#ffd8b5"/>
      <rect x="22" y="38" width="56" height="10" rx="4" fill="#ffd5df"/>
      <g>
        <circle cx="33" cy="35" r="6" fill="#ff9bbd"/>
        <circle cx="48" cy="33" r="6" fill="#ff9bbd"/>
        <circle cx="63" cy="35" r="6" fill="#ff9bbd"/>
        <circle cx="41" cy="42" r="5.5" fill="#ff9bbd"/>
        <circle cx="55" cy="42" r="5.5" fill="#ff9bbd"/>
      </g>
      <g opacity="${missingStrawberry ? '0.12' : '1'}">
        <circle cx="48" cy="31" r="4.5" fill="#ff5d8f"/>
        <circle cx="48" cy="25" r="3.5" fill="#ff7ca6"/>
        <path d="M48 31 L48 18" stroke="#77c57d" stroke-width="1.2"/>
      </g>
      <g>
        <rect x="18" y="68" width="8" height="18" fill="#7ad8a2"/>
        <rect x="74" y="68" width="8" height="18" fill="#7ad8a2"/>
      </g>
      <g>
        <circle cx="26" cy="18" r="5" fill="#ffde59"/>
        <circle cx="72" cy="18" r="5" fill="#ffde59"/>
      </g>
    </svg>
  `);
}

function buildBeachScene(missingShell) {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="うみであそぼう">
      <rect width="100" height="100" fill="#cfeeff"/>
      <rect y="60" width="100" height="40" fill="#7ad7ff"/>
      <path d="M0 62 C20 56, 32 54, 50 62 S80 68, 100 62 V100 H0 Z" fill="#6acbff"/>
      <g>
        <circle cx="26" cy="62" r="6" fill="#ffd18c"/>
        <circle cx="33" cy="64" r="5" fill="#ffd18c"/>
        <circle cx="40" cy="63" r="6" fill="#ffd18c"/>
      </g>
      <g opacity="${missingShell ? '0.12' : '1'}">
        <path d="M62 62 C68 55, 76 55, 82 62 C76 68, 68 68, 62 62 Z" fill="#ffd7a8" stroke="#d09475" stroke-width="1.2"/>
        <path d="M69 59 C72 53, 77 53, 80 59" stroke="#d8f0ff" stroke-width="1.2" fill="none"/>
      </g>
      <g>
        <circle cx="18" cy="22" r="7" fill="#ffffffff"/>
        <circle cx="27" cy="21" r="5" fill="#ffffff"/>
        <circle cx="76" cy="18" r="6" fill="#ffffff"/>
      </g>
      <g>
        <path d="M12 80 Q22 70, 30 80" stroke="#ff8ab3" stroke-width="3" fill="none"/>
        <path d="M71 80 Q80 70, 88 80" stroke="#ff8ab3" stroke-width="3" fill="none"/>
      </g>
    </svg>
  `);
}

function buildRoomScene(missingStuffedToy) {
  return toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="プリンセスのおへや">
      <rect width="100" height="100" fill="#fef0fd"/>
      <rect y="70" width="100" height="30" fill="#d6f7c6"/>
      <rect x="12" y="16" width="76" height="48" rx="10" fill="#dcd9ff"/>
      <rect x="20" y="22" width="60" height="36" rx="8" fill="#f4f1ff"/>
      <rect x="20" y="42" width="18" height="18" rx="4" fill="#fff0aa"/>
      <rect x="62" y="42" width="18" height="18" rx="4" fill="#fff0aa"/>
      <g opacity="${missingStuffedToy ? '0.15' : '1'}">
        <circle cx="33" cy="54" r="8" fill="#ffb4d7"/>
        <circle cx="33" cy="46" r="6" fill="#ffd8ea"/>
        <circle cx="30" cy="46" r="1.3" fill="#3f2d2a"/>
        <circle cx="36" cy="46" r="1.3" fill="#3f2d2a"/>
        <path d="M30 54 Q33 57 36 54" stroke="#3f2d2a" stroke-width="1.2" fill="none"/>
      </g>
      <g>
        <circle cx="71" cy="54" r="8" fill="#a9d2ff"/>
        <circle cx="71" cy="46" r="6" fill="#d9ebff"/>
        <circle cx="68" cy="46" r="1.3" fill="#3f2d2a"/>
        <circle cx="74" cy="46" r="1.3" fill="#3f2d2a"/>
        <path d="M68 54 Q71 57 74 54" stroke="#3f2d2a" stroke-width="1.2" fill="none"/>
      </g>
      <g>
        <rect x="44" y="54" width="12" height="12" rx="3" fill="#ffd28d"/>
        <circle cx="50" cy="49" r="6" fill="#ffe7a6"/>
      </g>
    </svg>
  `);
}

const PROBLEMS = {
  compare: [
    {
      id: 'princess-garden',
      title: 'くらべて みつけよう',
      subtitle: 'ちがう ところを タップしてね！',
      clearText: 'ふたつの えを くらべて みつけられたね！',
      imageA: buildPrincessGardenScene(false),
      imageB: buildPrincessGardenScene(true),
      differences: [{ x: 67, y: 38, radius: 12 }]
    },
    {
      id: 'forest-butterfly',
      title: 'くらべて みつけよう',
      subtitle: 'ちがう ところを タップしてね！',
      clearText: 'ふたつの えを くらべて みつけられたね！',
      imageA: buildForestScene(false),
      imageB: buildForestScene(true),
      differences: [{ x: 53, y: 30, radius: 12 }]
    },
    {
      id: 'cake-strawberry',
      title: 'くらべて みつけよう',
      subtitle: 'ちがう ところを タップしてね！',
      clearText: 'ふたつの えを くらべて みつけられたね！',
      imageA: buildCakeScene(false),
      imageB: buildCakeScene(true),
      differences: [{ x: 48, y: 31, radius: 11 }]
    },
    {
      id: 'beach-shell',
      title: 'くらべて みつけよう',
      subtitle: 'ちがう ところを タップしてね！',
      clearText: 'ふたつの えを くらべて みつけられたね！',
      imageA: buildBeachScene(false),
      imageB: buildBeachScene(true),
      differences: [{ x: 72, y: 62, radius: 13 }]
    },
    {
      id: 'princess-room',
      title: 'くらべて みつけよう',
      subtitle: 'ちがう ところを タップしてね！',
      clearText: 'ふたつの えを くらべて みつけられたね！',
      imageA: buildRoomScene(false),
      imageB: buildRoomScene(true),
      differences: [{ x: 33, y: 54, radius: 12 }]
    }
  ],
  memory: {
    title: 'おぼえて みつけよう',
    subtitle: 'よーく おぼえてね！',
    clearText: 'なくなった ものを みつけられたね！',
    category: 'fruit',
    items: [],
    missingId: null
  }
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildMemoryProblem() {
  const categoryKeys = Object.keys(MEMORY_ITEMS);
  const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
  const pool = MEMORY_ITEMS[category];
  const items = shuffle(pool).slice(0, 3);
  const missing = items[Math.floor(Math.random() * items.length)];

  const candidateKey = `${category}:${missing.id}`;
  if (state.lastMemoryKey === candidateKey) {
    return buildMemoryProblem();
  }

  state.lastMemoryKey = candidateKey;
  return {
    title: 'おぼえて みつけよう',
    subtitle: 'よーく おぼえてね！',
    clearText: 'なくなった ものを みつけられたね！',
    category,
    items,
    missingId: missing.id,
    categoryLabel: category === 'fruit' ? 'フルーツ' : 'どうぶつ'
  };
}

const VOICE_PATHS = {
  voice1: './sounds/voice1.mp3',
  voice2: './sounds/voice2.mp3'
};

const DEFAULT_VOICE_CONFIG = {
  voice1: { enabled: true, path: './sounds/voice1.mp3' },
  voice2: { enabled: true, path: './sounds/voice2.mp3' }
};

const audioPlaybackState = {
  current: null
};

const state = {
  mode: null,
  isSolved: false,
  phase: 'mode',
  revealTimerId: null,
  transitionTimerId: null,
  clearTimerId: null,
  memoryMissingId: null,
  lastMemoryKey: null,
  currentMemoryProblem: null,
  currentCompareProblem: null,
  lastCompareKey: null,
  lastPlayedVoiceKey: null
};

const modeScreen = document.getElementById('modeScreen');
const gameScreen = document.getElementById('gameScreen');
const clearScreen = document.getElementById('clearScreen');
const compareStage = document.getElementById('compareStage');
const memoryStage = document.getElementById('memoryStage');
const compareLeftImage = document.getElementById('compareLeftImage');
const compareRightImage = document.getElementById('compareRightImage');
const instructionText = document.getElementById('instructionText');
const feedbackText = document.getElementById('feedbackText');
const modeBadge = document.getElementById('modeBadge');
const clearText = document.getElementById('clearText');
const compareLeftMarkers = document.getElementById('compareLeftMarkers');
const compareRightMarkers = document.getElementById('compareRightMarkers');
const memoryBoard = document.getElementById('memoryBoard');
const memoryOptions = document.getElementById('memoryOptions');
const backBtn = document.getElementById('backBtn');
const retryBtn = document.getElementById('retryBtn');
const clearRestartBtn = document.getElementById('clearRestartBtn');
const compareLeftHitbox = document.getElementById('compareLeftHitbox');
const compareRightHitbox = document.getElementById('compareRightHitbox');

function setScreen(target) {
  modeScreen.classList.toggle('show', target === 'mode');
  gameScreen.classList.toggle('show', target === 'game');
  clearScreen.classList.toggle('show', target === 'clear');
  state.phase = target;
}

function getVoiceConfig() {
  const runtimeConfig = window.__differenceVoiceConfig || {};
  return {
    voice1: { ...DEFAULT_VOICE_CONFIG.voice1, ...(runtimeConfig.voice1 || {}) },
    voice2: { ...DEFAULT_VOICE_CONFIG.voice2, ...(runtimeConfig.voice2 || {}) }
  };
}

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

    try {
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
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => finish());
      }
    } catch (error) {
      resolve();
    }
  });
}

function safelyPlayAudio(fileName) {
  return playAudioFile(fileName);
}

function playVoiceOnce(voiceKey) {
  const config = getVoiceConfig();
  const voiceConfig = config[voiceKey];
  const fileName = (voiceConfig && voiceConfig.path) || VOICE_PATHS[voiceKey];

  if (!voiceConfig || !voiceConfig.enabled || !fileName || state.lastPlayedVoiceKey === voiceKey) {
    return Promise.resolve();
  }

  state.lastPlayedVoiceKey = voiceKey;
  return safelyPlayAudio(fileName);
}

function resetVoiceTracking() {
  state.lastPlayedVoiceKey = null;
}

function clearTimers() {
  if (state.revealTimerId) {
    clearTimeout(state.revealTimerId);
    state.revealTimerId = null;
  }
  if (state.transitionTimerId) {
    clearTimeout(state.transitionTimerId);
    state.transitionTimerId = null;
  }
  if (state.clearTimerId) {
    clearTimeout(state.clearTimerId);
    state.clearTimerId = null;
  }
}

function resetMarkerLayers() {
  compareLeftMarkers.innerHTML = '';
  compareRightMarkers.innerHTML = '';
  if (memoryBoard) {
    memoryBoard.innerHTML = '';
  }
  if (memoryOptions) {
    memoryOptions.innerHTML = '';
  }
}

function setFeedback(message, tone = '') {
  feedbackText.textContent = message;
  feedbackText.className = 'feedback-text';
  if (tone) {
    feedbackText.classList.add(tone);
  }
}

function setInstruction(message) {
  instructionText.textContent = message;
}

function showCompareStage() {
  compareStage.classList.remove('hidden');
  memoryStage.classList.add('hidden');
}

function showMemoryStage() {
  compareStage.classList.add('hidden');
  memoryStage.classList.remove('hidden');
}

function createMarker(diff, kind) {
  const marker = document.createElement('span');
  marker.className = `marker marker--${kind}`;
  marker.style.left = `${diff.x}%`;
  marker.style.top = `${diff.y}%`;

  if (kind === 'correct') {
    marker.style.width = `${diff.radius * 2}%`;
    marker.style.height = `${diff.radius * 2}%`;
  }

  return marker;
}

function addMissMarker(layer, point) {
  const marker = createMarker({ x: point.x, y: point.y, radius: 0 }, 'miss');
  layer.appendChild(marker);
  setTimeout(() => {
    marker.remove();
  }, 650);
}

function showCorrectMarkers(diff) {
  if (state.mode === 'compare') {
    compareLeftMarkers.appendChild(createMarker(diff, 'correct'));
    compareRightMarkers.appendChild(createMarker(diff, 'correct'));
    return;
  }

  if (memoryBoard) {
    const missingNode = memoryBoard.querySelector('[data-id="' + state.memoryMissingId + '"]');
    if (missingNode) {
      missingNode.classList.add('is-missing');
      missingNode.querySelector('.label').textContent = '？';
      missingNode.querySelector('.emoji').textContent = '✨';
    }
  }
}

function pickCompareProblem() {
  const problems = PROBLEMS.compare;
  const available = problems.filter((problem) => problem.id !== state.lastCompareKey);
  const chosen = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : problems[0];
  state.lastCompareKey = chosen.id;
  state.currentCompareProblem = chosen;
  return chosen;
}

function currentProblem() {
  if (state.mode === 'memory') {
    return state.currentMemoryProblem || PROBLEMS.memory;
  }
  if (state.mode === 'compare') {
    return state.currentCompareProblem || pickCompareProblem();
  }
  return PROBLEMS[state.mode];
}

function normalizePoint(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const rawX = ((event.clientX - rect.left) / rect.width) * 100;
  const rawY = ((event.clientY - rect.top) / rect.height) * 100;
  return {
    x: Math.max(0, Math.min(100, rawX)),
    y: Math.max(0, Math.min(100, rawY))
  };
}

function findHit(point) {
  return currentProblem().differences.find((diff) => {
    const dx = point.x - diff.x;
    const dy = point.y - diff.y;
    return Math.hypot(dx, dy) <= diff.radius;
  }) || null;
}

function goToClearScreen() {
  clearText.textContent = currentProblem().clearText;
  setScreen('clear');
}

function retryCurrentMode() {
  if (!state.mode) {
    returnToModeSelection();
    return;
  }
  startMode(state.mode);
}

function handleCorrect(diff) {
  if (state.isSolved) {
    return;
  }

  state.isSolved = true;
  showCorrectMarkers(diff);
  playAudioFile('./sounds/OK.mp3');
  setFeedback('せいかい！', 'success');
  setInstruction('みつけたね！');
  state.clearTimerId = setTimeout(goToClearScreen, 900);
}

function handleMiss(event, point) {
  if (state.mode !== 'compare') {
    playAudioFile('./sounds/NG.mp3');
    setFeedback('おしい！ もういちど えらんでね', 'warning');
    return;
  }

  const layer = event.currentTarget === compareLeftHitbox ? compareLeftMarkers : compareRightMarkers;
  addMissMarker(layer, point);
  playAudioFile('./sounds/NG.mp3');
  setFeedback('おしい！ もういちど タップしてね', 'warning');
}

function handleTap(event) {
  if (state.isSolved) {
    return;
  }

  if (state.mode === 'memory' && state.phase !== 'memory-find') {
    return;
  }

  event.preventDefault();
  const point = normalizePoint(event);
  const hit = findHit(point);

  if (hit) {
    handleCorrect(hit);
    return;
  }

  handleMiss(event, point);
}

function renderMemoryBoard() {
  if (!memoryBoard || !currentProblem() || !currentProblem().items) {
    return;
  }

  const items = currentProblem().items;
  memoryBoard.innerHTML = '';

  items.forEach((item) => {
    const node = document.createElement('div');
    node.className = 'memory-item';
    node.dataset.id = item.id;
    if (state.phase === 'memory-find' && item.id === state.memoryMissingId) {
      node.classList.add('is-missing');
    }

    const emoji = document.createElement('span');
    emoji.className = 'emoji';
    emoji.textContent = state.phase === 'memory-find' && item.id === state.memoryMissingId ? '？' : item.emoji;

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = state.phase === 'memory-find' && item.id === state.memoryMissingId ? '？' : item.label;

    node.appendChild(emoji);
    node.appendChild(label);
    memoryBoard.appendChild(node);
  });
}

function renderMemoryOptions() {
  if (!memoryOptions || !currentProblem() || !currentProblem().items) {
    return;
  }

  const problem = currentProblem();
  const categoryItems = MEMORY_ITEMS[problem.category] || [];
  const visibleIds = new Set(problem.items.map((item) => item.id));
  const missingItem = categoryItems.find((item) => item.id === problem.missingId) || problem.items[0];
  const distractors = shuffle(
    categoryItems.filter((item) => item.id !== missingItem.id && !visibleIds.has(item.id))
  ).slice(0, 2);
  const options = shuffle([missingItem, ...distractors]);

  memoryOptions.innerHTML = '';

  options.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-option';
    button.dataset.id = item.id;
    button.innerHTML = `<span class="emoji">${item.emoji}</span><span class="label">${item.label}</span>`;
    button.addEventListener('click', () => {
      if (state.isSolved || state.phase !== 'memory-find') {
        return;
      }
      if (item.id === state.memoryMissingId) {
        state.isSolved = true;
        playAudioFile('./sounds/OK.mp3');
        setFeedback('せいかい！', 'success');
        setInstruction('なくなった ものを みつけたね！');
        button.classList.add('is-correct');
        setTimeout(() => goToClearScreen(), 800);
      } else {
        playAudioFile('./sounds/NG.mp3');
        setFeedback('ちがうよ！ もういちど えらんでね', 'warning');
      }
    });
    memoryOptions.appendChild(button);
  });
}

function prepareCommonGameScreen() {
  clearTimers();
  resetMarkerLayers();
  setFeedback('');
  state.isSolved = false;
  setScreen('game');
  modeBadge.textContent = currentProblem().title;
}

function startCompareMode() {
  prepareCommonGameScreen();
  showCompareStage();
  const problem = pickCompareProblem();
  compareLeftImage.src = problem.imageA;
  compareRightImage.src = problem.imageB;
  setInstruction(problem.subtitle);
  state.phase = 'compare-find';
}

function startMemoryMode() {
  prepareCommonGameScreen();
  showMemoryStage();
  resetVoiceTracking();
  state.currentMemoryProblem = buildMemoryProblem();
  state.memoryMissingId = state.currentMemoryProblem.missingId;
  setInstruction('よーく おぼえてね！');
  state.phase = 'memory-preview';
  memoryOptions.innerHTML = '';
  renderMemoryBoard();
  playVoiceOnce('voice1');

  state.revealTimerId = setTimeout(() => {
    state.phase = 'memory-find';
    setInstruction('なくなった ものは どれかな？');
    playVoiceOnce('voice2');
    renderMemoryBoard();
    renderMemoryOptions();
    setFeedback('');
  }, 5000);
}

function startMode(mode) {
  state.mode = mode;
  if (mode === 'compare') {
    startCompareMode();
    return;
  }
  startMemoryMode();
}

function returnToModeSelection() {
  clearTimers();
  resetMarkerLayers();
  resetVoiceTracking();
  state.mode = null;
  state.isSolved = false;
  state.memoryMissingId = null;
  state.currentMemoryProblem = null;
  state.currentCompareProblem = null;
  state.lastMemoryKey = null;
  state.lastCompareKey = null;
  setFeedback('');
  setScreen('mode');
}

document.querySelectorAll('.mode-card').forEach((button) => {
  button.addEventListener('click', () => {
    startMode(button.dataset.mode);
  });
});

compareLeftHitbox.addEventListener('click', handleTap);
compareRightHitbox.addEventListener('click', handleTap);
backBtn.addEventListener('click', returnToModeSelection);
retryBtn.addEventListener('click', retryCurrentMode);
clearRestartBtn.addEventListener('click', retryCurrentMode);

window.__differenceDebug = {
  getState() {
    return {
      mode: state.mode,
      phase: state.phase,
      isSolved: state.isSolved
    };
  },
  getProblem(mode) {
    if (mode === 'memory') {
      return state.currentMemoryProblem || buildMemoryProblem();
    }
    return PROBLEMS[mode];
  },
  getMemoryProblem() {
    return state.currentMemoryProblem || buildMemoryProblem();
  },
  getCompareProblems() {
    return PROBLEMS.compare;
  },
  getCurrentCompareProblem() {
    return state.currentCompareProblem || pickCompareProblem();
  }
};

setScreen('mode');
