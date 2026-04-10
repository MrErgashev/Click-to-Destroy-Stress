const STRESS_WORDS = [
  {
    label: "Stress",
    meaning: "Ichki zo‘riqish holati: miya xavfni kattalashtirib talqin qiladi.",
    body: "Yurak urishi va mushak tarangligi oshadi.",
    action: "4-6 nafas sikli: 4 soniya olib, 6 soniya chiqarish.",
    visual: "🧠⚡",
  },
  {
    label: "Deadline",
    meaning: "Vaqt bosimi tufayli ongda shoshilish va xato qo‘rquvi kuchayadi.",
    body: "Fikrlar tarqaladi, diqqatingiz bo‘linadi.",
    action: "Ishni 25 daqiqalik sprint va 5 daqiqalik tanaffusga bo‘ling.",
    visual: "⏱️🔥",
  },
  {
    label: "Imtihon",
    meaning: "Natija uchun yuqori mas’uliyat hissi o‘zini tekshirishga aylanishi mumkin.",
    body: "Qo‘l sovishi, qorin bezovtaligi kuzatiladi.",
    action: "3 ta ehtimoliy savolga qisqa javob yozib, miyani isitib oling.",
    visual: "📝🌩️",
  },
  {
    label: "Qarzdorlik",
    meaning: "Noaniqlik va nazorat yo‘qligi hissi ruhiy bosimni oshiradi.",
    body: "Uyqu sifati pasayadi, fon tashvish kuchayadi.",
    action: "Qarzlarni A/B/C ustuvorlikka ajratib, eng kichigidan boshlang.",
    visual: "💸🧱",
  },
  {
    label: "Uyqu yetishmasligi",
    meaning: "Miya tiklanmasligi sabab emotsiya boshqaruvi susayadi.",
    body: "Asabiylik va xotira pasayishi seziladi.",
    action: "Bugun faqat 30 daqiqa erta yotish maqsadini qo‘ying.",
    visual: "🌙🫩",
  },
  {
    label: "Prezentatsiya",
    meaning: "Baholanish qo‘rquvi o‘zini himoya rejimini yoqadi.",
    body: "Ovoz titrashi, kaft terlashi tabiiy holat.",
    action: "2 daqiqalik ovozli mashq: bir gapni 5 marta aniq ayting.",
    visual: "🎤💥",
  },
  {
    label: "Vazifa",
    meaning: "Yirik topshiriq miyaga ‘juda ko‘p’ signalini beradi.",
    body: "Prokrastinatsiya boshlanadi, energiya tushadi.",
    action: "Vazifani 1 ta keyingi amaliy qadamga maydalang.",
    visual: "📌🧩",
  },
  {
    label: "Qo‘rquv",
    meaning: "Mumkin bo‘lgan salbiy natijani ong ortiqcha realdek qabul qiladi.",
    body: "Nafas qisqa bo‘ladi, ko‘krak siqiladi.",
    action: "‘Eng yomon / eng yaxshi / eng real’ ssenariyni yozing.",
    visual: "😨🫁",
  },
  {
    label: "Bosim",
    meaning: "Kutilmalar va o‘z-o‘ziga talablar o‘rtasidagi keskinlik.",
    body: "Yelka va bo‘yinda qotishish paydo bo‘ladi.",
    action: "Bo‘yin-yelka uchun 60 soniyalik cho‘zilish qiling.",
    visual: "🧱😮‍💨",
  },
  {
    label: "Charchoq",
    meaning: "Resurs kamayganda oddiy vazifalar ham og‘ir ko‘rinadi.",
    body: "Diqqat pasayadi, xatolar ko‘payadi.",
    action: "90 soniya ko‘zlarni yumib, 10 marta chuqur nafas oling.",
    visual: "🔋⬇️",
  },
];

const FINAL_MESSAGE = {
  heading: "Siz kuchlisiz.",
  copy: "Bugungi stresslarni bir oz bo‘lsa ham yengdingiz.",
};

const WORD_SCALES = [0.92, 1, 1.06, 1.12, 0.98];
const PARTICLE_COLORS = ["#4de2ff", "#ff5fb2", "#ffd66b", "#926bff", "#7af7c4"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  screen: "welcome",
  soundEnabled: true,
  destroyedCount: 0,
  totalCount: STRESS_WORDS.length,
  words: [],
};

const elements = {
  screenStage: document.getElementById("screenStage"),
  welcomeScreen: document.getElementById("welcomeScreen"),
  gameScreen: document.getElementById("gameScreen"),
  finishScreen: document.getElementById("finishScreen"),
  startButton: document.getElementById("startButton"),
  replayButton: document.getElementById("replayButton"),
  restartButton: document.getElementById("restartButton"),
  soundToggle: document.getElementById("soundToggle"),
  playfield: document.getElementById("playfield"),
  progressText: document.getElementById("progressText"),
  progressFill: document.getElementById("progressFill"),
  remainingText: document.getElementById("remainingText"),
  finalHeading: document.getElementById("finalHeading"),
  finalCopy: document.getElementById("finalCopy"),
  finalSummary: document.getElementById("finalSummary"),
  finishGlow: document.getElementById("finishGlow"),
  insightWord: document.getElementById("insightWord"),
  insightMeaning: document.getElementById("insightMeaning"),
  insightBody: document.getElementById("insightBody"),
  insightAction: document.getElementById("insightAction"),
  insightVisual: document.getElementById("insightVisual"),
};

const screens = {
  welcome: elements.welcomeScreen,
  playing: elements.gameScreen,
  finished: elements.finishScreen,
};

let activeTransitionId = 0;

class SoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.enabled = true;
    this.supported = "AudioContext" in window || "webkitAudioContext" in window;
  }

  async unlock() {
    if (!this.supported || this.context) {
      if (this.context?.state === "suspended") {
        try {
          await this.context.resume();
        } catch {
          return false;
        }
      }
      return Boolean(this.context);
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      return true;
    } catch {
      this.supported = false;
      return false;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  playDestroy() {
    if (!this.enabled || !this.context || !this.master) {
      return;
    }

    const now = this.context.currentTime;
    const variant = Math.floor(Math.random() * 3);
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.connect(gain);
    gain.connect(this.master);

    if (variant === 0) {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.11);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    } else if (variant === 1) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.16);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.17, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    } else {
      osc.type = "square";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(210, now + 0.07);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

const soundEngine = new SoundEngine();

function initApp() {
  bindEvents();
  resetGameData();
  updateSoundToggle();
  setInitialScreen("welcome");
}

function bindEvents() {
  elements.startButton.addEventListener("click", startGame);
  elements.replayButton.addEventListener("click", startGame);
  elements.restartButton.addEventListener("click", startGame);
  elements.soundToggle.addEventListener("click", toggleSound);
  window.addEventListener("resize", debounce(handleResize, 120));
}

function setInitialScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    const isActive = name === screenName;
    screen.hidden = !isActive;
    screen.classList.toggle("is-active", isActive);
    screen.classList.remove("is-ready");
  });

  state.screen = screenName;
  renderScreenContents(screenName);
}

function resetGameData() {
  state.destroyedCount = 0;
  state.words = STRESS_WORDS.map((item, index) => ({
    id: `word-${index + 1}`,
    label: item.label,
    meaning: item.meaning,
    body: item.body,
    action: item.action,
    visual: item.visual,
    x: 0,
    y: 0,
    scale: WORD_SCALES[index % WORD_SCALES.length],
    driftX: `${(Math.random() * 16 - 8).toFixed(1)}px`,
    driftY: `${(-5 - Math.random() * 10).toFixed(1)}px`,
    floatDuration: `${(4.2 + Math.random() * 2.2).toFixed(2)}s`,
    destroyed: false,
  }));
}

async function startGame() {
  clearTransientEffects();
  resetGameData();
  updateProgress();
  soundEngine.unlock();
  await setScreen("playing");
}

async function finishGame() {
  elements.finalHeading.textContent = FINAL_MESSAGE.heading;
  elements.finalCopy.textContent = FINAL_MESSAGE.copy;
  elements.finalSummary.textContent = `Yo‘q qilindi: ${state.destroyedCount} / ${state.totalCount}`;
  await setScreen("finished");
}

async function resetGame() {
  clearTransientEffects();
  resetGameData();
  await setScreen("welcome");
}

async function setScreen(nextScreen) {
  const previousScreen = state.screen;
  const previousElement = screens[previousScreen];
  const nextElement = screens[nextScreen];
  const transitionId = ++activeTransitionId;

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  if (previousScreen === nextScreen) {
    renderScreenContents(nextScreen);
    await animateScreenEnter(nextScreen, transitionId);
    focusForScreen(nextScreen);
    return;
  }

  if (previousElement) {
    await animateScreenExit(previousScreen, transitionId);
    if (transitionId !== activeTransitionId) {
      return;
    }
    previousElement.hidden = true;
    previousElement.classList.remove("is-active", "is-ready");
  }

  state.screen = nextScreen;
  nextElement.hidden = false;
  nextElement.classList.add("is-active");
  renderScreenContents(nextScreen);
  await nextFrame();

  if (transitionId !== activeTransitionId) {
    return;
  }

  if (nextScreen === "playing") {
    await renderWordsWhenReady(transitionId);
    if (transitionId !== activeTransitionId) {
      return;
    }
  }

  await animateScreenEnter(nextScreen, transitionId);
  if (transitionId !== activeTransitionId) {
    return;
  }

  focusForScreen(nextScreen);
}

function renderScreenContents(screenName) {
  if (screenName === "playing") {
    clearTransientEffects();
    updateInsight(STRESS_WORDS[0]);
    updateProgress();
    return;
  }

  if (screenName === "finished") {
    elements.finishScreen.classList.remove("is-ready");
    clearTransientEffects();
    return;
  }

  elements.playfield.innerHTML = "";
  elements.finishScreen.classList.remove("is-ready");
}

async function animateScreenExit(screenName, transitionId) {
  const screen = screens[screenName];
  if (!screen || prefersReducedMotion.matches) {
    return;
  }

  const keyframes = screenName === "playing"
    ? [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translate3d(0, 22px, 0) scale(0.985)", filter: "blur(10px)" },
      ]
    : [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
        { opacity: 0, transform: "translate3d(0, -16px, 0) scale(0.97)", filter: "blur(8px)" },
      ];

  await runAnimation(screen, keyframes, {
    duration: screenName === "playing" ? 300 : 260,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    fill: "forwards",
  }, transitionId);
}

async function animateScreenEnter(screenName, transitionId) {
  const screen = screens[screenName];
  if (!screen) {
    return;
  }

  screen.style.opacity = "1";
  screen.style.transform = "translate3d(0, 0, 0)";
  screen.style.filter = "blur(0)";

  if (prefersReducedMotion.matches) {
    if (screenName === "finished") {
      elements.finishScreen.classList.add("is-ready");
      celebrateFinish(true);
    }
    return;
  }

  const keyframes = screenName === "playing"
    ? [
        { opacity: 0, transform: "translate3d(0, 26px, 0) scale(0.985)", filter: "blur(10px)" },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
      ]
    : [
        { opacity: 0, transform: "translate3d(0, 18px, 0) scale(0.97)", filter: "blur(8px)" },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
      ];

  await runAnimation(screen, keyframes, {
    duration: screenName === "playing" ? 420 : 460,
    easing: "cubic-bezier(0.16, 0.84, 0.24, 1)",
    fill: "forwards",
  }, transitionId);

  if (screenName === "finished" && transitionId === activeTransitionId) {
    celebrateFinish(false);
  }
}

function focusForScreen(screenName) {
  if (screenName === "playing") {
    const firstChip = elements.playfield.querySelector(".word-chip");
    (firstChip || elements.playfield).focus({ preventScroll: true });
    return;
  }

  if (screenName === "finished") {
    elements.finalHeading.focus({ preventScroll: true });
    return;
  }

  elements.startButton.focus({ preventScroll: true });
}

function updateProgress() {
  elements.progressText.textContent = `${state.destroyedCount} / ${state.totalCount}`;
  elements.remainingText.textContent = String(state.totalCount - state.destroyedCount);
  const completion = (state.destroyedCount / state.totalCount) * 100;
  elements.progressFill.style.width = `${completion}%`;
}

function renderWords() {
  elements.playfield.innerHTML = "";
  const wordsToPlace = state.words.filter((word) => !word.destroyed);
  const ready = placeWords(elements.playfield, wordsToPlace);
  if (!ready) {
    return false;
  }

  const fragment = document.createDocumentFragment();
  wordsToPlace.forEach((word) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "word-chip";
    button.dataset.wordId = word.id;
    button.textContent = word.label;
    button.style.left = `${word.x}px`;
    button.style.top = `${word.y}px`;
    button.style.setProperty("--scale", word.scale);
    button.style.setProperty("--drift-x", word.driftX);
    button.style.setProperty("--drift-y", word.driftY);
    button.style.setProperty("--float-duration", word.floatDuration);
    button.setAttribute("aria-label", `${word.label} so‘zini yo‘q qilish`);
    button.addEventListener("mouseenter", () => updateInsight(word));
    button.addEventListener("focus", () => updateInsight(word));
    button.addEventListener("click", (event) => destroyWord(word.id, event));
    fragment.appendChild(button);
  });

  elements.playfield.appendChild(fragment);
  return true;
}

function placeWords(container, words) {
  const rect = container.getBoundingClientRect();
  if (rect.width < 120 || rect.height < 120) {
    return false;
  }

  const padding = rect.width < 640 ? 12 : 18;
  const placed = [];

  words.forEach((word) => {
    const size = measureWord(word.label, word.scale);
    const randomSpot = findRandomPlacement(rect, size, placed, padding);
    const fallbackSpot = randomSpot || getFallbackPlacement(rect, size, placed, padding);
    word.x = fallbackSpot.x;
    word.y = fallbackSpot.y;
    placed.push({ x: word.x, y: word.y, width: size.width, height: size.height });
  });

  return true;
}

function findRandomPlacement(containerRect, wordRect, placed, padding) {
  const maxAttempts = 220;
  const maxX = Math.max(padding, containerRect.width - wordRect.width - padding);
  const maxY = Math.max(padding, containerRect.height - wordRect.height - padding);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = {
      x: randomInRange(padding, maxX),
      y: randomInRange(padding, maxY),
      width: wordRect.width,
      height: wordRect.height,
    };

    if (!hasCollision(candidate, placed, padding)) {
      return candidate;
    }
  }

  return null;
}

function getFallbackPlacement(containerRect, wordRect, placed, padding) {
  const columns = containerRect.width < 640 ? 2 : containerRect.width < 920 ? 3 : 4;
  const rows = Math.max(3, Math.ceil(state.totalCount / columns));
  const slotWidth = (containerRect.width - padding * 2) / columns;
  const slotHeight = (containerRect.height - padding * 2) / rows;
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      slots.push({
        x: padding + column * slotWidth + (slotWidth - wordRect.width) / 2,
        y: padding + row * slotHeight + (slotHeight - wordRect.height) / 2,
        width: wordRect.width,
        height: wordRect.height,
      });
    }
  }

  for (const slot of slots) {
    const boundedSlot = {
      ...slot,
      x: clamp(slot.x, padding, containerRect.width - wordRect.width - padding),
      y: clamp(slot.y, padding, containerRect.height - wordRect.height - padding),
    };

    if (!hasCollision(boundedSlot, placed, 6)) {
      return boundedSlot;
    }
  }

  return {
    x: clamp(padding + placed.length * 12, padding, containerRect.width - wordRect.width - padding),
    y: clamp(padding + placed.length * 18, padding, containerRect.height - wordRect.height - padding),
    width: wordRect.width,
    height: wordRect.height,
  };
}

function hasCollision(candidate, placed, padding) {
  return placed.some((item) => {
    return !(
      candidate.x + candidate.width + padding < item.x ||
      candidate.x > item.x + item.width + padding ||
      candidate.y + candidate.height + padding < item.y ||
      candidate.y > item.y + item.height + padding
    );
  });
}

function measureWord(label, scale) {
  const probe = document.createElement("button");
  probe.type = "button";
  probe.className = "word-chip measure-chip";
  probe.textContent = label;
  probe.style.setProperty("--scale", scale);
  elements.playfield.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();

  return {
    width: Math.ceil(rect.width * scale),
    height: Math.ceil(rect.height * scale),
  };
}

function destroyWord(wordId, event) {
  if (state.screen !== "playing") {
    return;
  }

  const word = state.words.find((item) => item.id === wordId);
  if (!word || word.destroyed) {
    return;
  }

  word.destroyed = true;
  state.destroyedCount += 1;
  updateProgress();

  const chip = event.currentTarget;
  chip.classList.add("is-destroying");
  soundEngine.playDestroy();
  animateDestroy(chip, event, state.destroyedCount === state.totalCount);

  const nextWord = state.words.find((item) => !item.destroyed);
  if (nextWord) {
    updateInsight(nextWord);
  }
}

function updateInsight(word) {
  if (!word || !elements.insightWord) {
    return;
  }

  elements.insightWord.textContent = word.label;
  elements.insightMeaning.textContent = `Ma'nosi: ${word.meaning}`;
  elements.insightBody.textContent = `Tana signali: ${word.body}`;
  elements.insightAction.textContent = `Mikro-yechim: ${word.action}`;
  elements.insightVisual.textContent = word.visual;
}

function animateDestroy(chip, event, isLastWord) {
  const reduceMotion = prefersReducedMotion.matches;
  const rect = elements.playfield.getBoundingClientRect();
  const pointerX = event.clientX || rect.left + rect.width / 2;
  const pointerY = event.clientY || rect.top + rect.height / 2;
  const burstX = pointerX - rect.left;
  const burstY = pointerY - rect.top;

  spawnImpactEffects(elements.playfield, burstX, burstY, reduceMotion ? 8 : 18);

  if (reduceMotion) {
    chip.remove();
    if (isLastWord) {
      finishGame();
    }
    return;
  }

  const currentScale = extractScale(chip);
  chip.animate(
    [
      { transform: `translate3d(0, 0, 0) scale(${currentScale})`, opacity: 1, filter: "brightness(1)" },
      { transform: `translate3d(-4px, -5px, 0) scale(${currentScale * 1.16})`, opacity: 1, filter: "brightness(1.3)", offset: 0.24 },
      { transform: `translate3d(7px, 4px, 0) scale(${currentScale * 0.88})`, opacity: 0.72, filter: "brightness(0.9)", offset: 0.62 },
      { transform: `translate3d(0, -26px, 0) scale(${currentScale * 0.18})`, opacity: 0, filter: "brightness(1.45)" },
    ],
    {
      duration: 420,
      easing: "cubic-bezier(0.2, 0.85, 0.3, 1)",
      fill: "forwards",
    },
  );

  window.setTimeout(() => {
    chip.remove();
    if (isLastWord) {
      finishGame();
    }
  }, 250);
}

function spawnImpactEffects(container, x, y, count) {
  const burst = document.createElement("div");
  burst.className = "particle-burst";

  const flash = document.createElement("div");
  flash.className = "impact-flash";
  flash.style.setProperty("--x", `${x}px`);
  flash.style.setProperty("--y", `${y}px`);
  burst.appendChild(flash);

  const ring = document.createElement("div");
  ring.className = "impact-ring";
  ring.style.setProperty("--x", `${x}px`);
  ring.style.setProperty("--y", `${y}px`);
  burst.appendChild(ring);

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.34;
    const distance = prefersReducedMotion.matches ? 26 : 48 + Math.random() * 34;
    const size = `${4 + Math.random() * 8}px`;
    particle.className = "particle";
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", size);
    particle.style.setProperty("--color", PARTICLE_COLORS[index % PARTICLE_COLORS.length]);
    burst.appendChild(particle);
  }

  container.appendChild(burst);
  window.setTimeout(() => burst.remove(), 760);
}

function celebrateFinish(skipMotion) {
  elements.finishScreen.classList.remove("is-ready");
  void elements.finishScreen.offsetWidth;
  elements.finishScreen.classList.add("is-ready");

  const rect = elements.finishScreen.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height * 0.42;
  spawnCelebrationBurst(centerX, centerY, skipMotion ? 10 : 22);
}

function spawnCelebrationBurst(x, y, count) {
  const burst = document.createElement("div");
  burst.className = "celebration-burst";

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.25;
    const distance = prefersReducedMotion.matches ? 32 : 72 + Math.random() * 48;
    particle.className = "particle";
    particle.style.setProperty("--x", `${x}px`);
    particle.style.setProperty("--y", `${y}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${4 + Math.random() * 10}px`);
    particle.style.setProperty("--color", PARTICLE_COLORS[(index + 1) % PARTICLE_COLORS.length]);
    burst.appendChild(particle);
  }

  elements.finishScreen.appendChild(burst);
  window.setTimeout(() => burst.remove(), 860);
}

function clearTransientEffects() {
  elements.screenStage
    .querySelectorAll(".particle-burst, .celebration-burst")
    .forEach((node) => node.remove());
}

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  soundEngine.setEnabled(state.soundEnabled);

  if (state.soundEnabled) {
    soundEngine.unlock();
  }

  updateSoundToggle();
}

function updateSoundToggle() {
  elements.soundToggle.textContent = `Ovoz: ${state.soundEnabled ? "Yoqilgan" : "O‘chiq"}`;
  elements.soundToggle.setAttribute("aria-pressed", String(state.soundEnabled));
}

function handleResize() {
  if (state.screen === "playing") {
    renderWordsWhenReady(activeTransitionId);
  }
}

function extractScale(chip) {
  const scaleValue = chip.style.getPropertyValue("--scale");
  return scaleValue ? Number(scaleValue) : 1;
}

function debounce(callback, wait) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function nextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function renderWordsWhenReady(transitionId, attempts = 0) {
  if (transitionId !== activeTransitionId) {
    return false;
  }

  const rendered = renderWords();
  if (rendered) {
    return true;
  }

  if (attempts >= 6) {
    return false;
  }

  await nextFrame();
  return renderWordsWhenReady(transitionId, attempts + 1);
}

function runAnimation(element, keyframes, options, transitionId) {
  if (!element.animate) {
    return Promise.resolve();
  }

  const animation = element.animate(keyframes, options);
  return animation.finished.catch(() => {}).then(() => {
    if (transitionId === activeTransitionId) {
      animation.commitStyles?.();
    }
    animation.cancel();
  });
}

initApp();
