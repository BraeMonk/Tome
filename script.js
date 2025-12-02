// Basic state
const STATE_KEY = "ArcaneGrimoire_v1";

const defaultState = {
  mana: 0,
  level: 1,
  totalCasts: 0,
  currentStreak: 0,
  bestStreak: 0,
  activeDays: 0,
  lastCastDay: null,
  lastDailyGenerated: null,
  todaysSpellIds: [],
  todaysCompleted: []
};

// Spell definitions = real-world actions
const SPELLS = [
  {
    id: "drink_water",
    name: "Minor Hydration Charm",
    school: "body",
    reward: 8,
    tags: ["body", "energy"],
    desc: "Drink a full glass of water slowly, paying attention to each sip."
  },
  {
    id: "stretch",
    name: "Limb Unbinding",
    school: "body",
    reward: 10,
    tags: ["body"],
    desc: "Stand up and stretch neck, shoulders, back and legs for 2–3 minutes."
  },
  {
    id: "breathe",
    name: "Calm Breathing Sigil",
    school: "mind",
    reward: 10,
    tags: ["mind"],
    desc: "Do 10 slow breaths: in for 4, hold 4, out for 4, hold 4."
  },
  {
    id: "focus_10",
    name: "Micro Focus Spell",
    school: "focus",
    reward: 12,
    tags: ["focus"],
    desc: "Pick one small task and work on it for 10 uninterrupted minutes."
  },
  {
    id: "gratitude",
    name: "Grateful Heart Invocation",
    school: "mind",
    reward: 10,
    tags: ["mind"],
    desc: "Write or think of 3 things you’re genuinely grateful for today."
  },
  {
    id: "message_friend",
    name: "Thread of Connection",
    school: "connection",
    reward: 10,
    tags: ["connection"],
    desc: "Send a genuine message to someone: check in or say thanks."
  },
  {
    id: "step_outside",
    name: "Fresh Air Cantrip",
    school: "body",
    reward: 10,
    tags: ["body", "mind"],
    desc: "Step outside for at least 2 minutes. Look at something far away."
  },
  {
    id: "clean_5",
    name: "Tidying Gust",
    school: "focus",
    reward: 12,
    tags: ["focus", "body"],
    desc: "Clean or organize one small area for 5 minutes."
  },
  {
    id: "journal",
    name: "Ink of Reflection",
    school: "mind",
    reward: 14,
    tags: ["mind"],
    desc: "Write a few sentences about how you’re feeling right now."
  },
  {
    id: "wind_down",
    name: "Evening Wind‑Down",
    school: "restore",
    reward: 16,
    tags: ["restore"],
    desc: "Spend 10 tech‑free minutes doing something gentle (reading, music, etc.)."
  }
];

let state = { ...defaultState };

// DOM refs
const manaEl = document.getElementById("manaAmount");
const levelEl = document.getElementById("grimoireLevel");
const dailyListEl = document.getElementById("dailyList");
const spellListEl = document.getElementById("spellList");
const schoolFilterEl = document.getElementById("schoolFilter");
const rerollBtn = document.getElementById("rerollDaily");

const totalCastsEl = document.getElementById("totalCasts");
const currentStreakEl = document.getElementById("currentStreak");
const bestStreakEl = document.getElementById("bestStreak");
const activeDaysEl = document.getElementById("activeDays");

const ritualStatusEl = document.getElementById("ritualStatus");
const ritualTimerEl = document.getElementById("ritualTimer");

// --- Persistence ---
function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state", e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = { ...defaultState, ...parsed };
  } catch (e) {
    console.warn("Failed to load state", e);
  }
}

// Date helpers
function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // yyyy-mm-dd
}

// Daily spread
function generateDailySpread(force = false) {
  const today = todayKey();
  if (!force && state.lastDailyGenerated === today && state.todaysSpellIds.length) return;

  // pick 3–4 random distinct spells
  const indices = [...SPELLS.keys()];
  indices.sort(() => Math.random() - 0.5);
  const count = 3;
  state.todaysSpellIds = indices.slice(0, count).map(i => SPELLS[i].id);
  state.todaysCompleted = [];
  state.lastDailyGenerated = today;
  saveState();
}

function getSpellById(id) {
  return SPELLS.find(s => s.id === id) || null;
}

function renderDaily() {
  dailyListEl.innerHTML = "";
  state.todaysSpellIds.forEach(id => {
    const spell = getSpellById(id);
    if (!spell) return;
    const done = state.todaysCompleted.includes(id);

    const li = document.createElement("li");
    li.className = "card" + (done ? " done" : "");
    li.innerHTML = `
      <div>
        <div class="card-title">${spell.name}</div>
        <div class="card-tags">${spell.school.toUpperCase()} • Reward ${spell.reward} ✨</div>
        <div class="card-desc">${spell.desc}</div>
      </div>
      <div class="card-meta">
        <button class="btn small">${done ? "Cast ✔" : "Cast"}</button>
      </div>
    `;

    const btn = li.querySelector("button");
    btn.addEventListener("click", () => {
      if (!done) {
        castSpell(id, spell.reward);
      }
    });

    dailyListEl.appendChild(li);
  });
}

// Casting logic
function castSpell(id, reward) {
  const today = todayKey();
  const alreadyDone = state.todaysCompleted.includes(id);
  if (!alreadyDone) {
    state.todaysCompleted.push(id);
  }

  // Mana + level
  state.mana += reward;
  state.totalCasts += 1;

  // Simple leveling: every 200 mana = +1 level
  const newLevel = 1 + Math.floor(state.mana / 200);
  state.level = Math.max(state.level, newLevel);

  // Streak logic
  if (!state.lastCastDay) {
    state.currentStreak = 1;
    state.activeDays = 1;
  } else {
    const prev = new Date(state.lastCastDay);
    const cur = new Date(today);
    const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // same day, streak unchanged
    } else if (diffDays === 1) {
      state.currentStreak += 1;
      state.activeDays += 1;
    } else if (diffDays > 1) {
      state.currentStreak = 1;
      state.activeDays += 1;
    }
  }

  state.bestStreak = Math.max(state.bestStreak, state.currentStreak);
  state.lastCastDay = today;

  saveState();
  renderAll();
}

// Spell library list
function renderSpellLibrary() {
  const filter = schoolFilterEl.value;
  spellListEl.innerHTML = "";

  SPELLS.filter(s => filter === "all" || s.school === filter).forEach(spell => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div>
        <div class="card-title">${spell.name}</div>
        <div class="card-tags">${spell.school.toUpperCase()} • ${spell.reward} ✨</div>
        <div class="card-desc">${spell.desc}</div>
      </div>
    `;
    spellListEl.appendChild(div);
  });
}

// Stats
function renderStats() {
  totalCastsEl.textContent = state.totalCasts;
  currentStreakEl.textContent = state.currentStreak;
  bestStreakEl.textContent = state.bestStreak;
  activeDaysEl.textContent = state.activeDays;
}

// Header
function renderHeader() {
  manaEl.textContent = Math.floor(state.mana);
  levelEl.textContent = state.level;
}

function renderAll() {
  renderHeader();
  renderDaily();
  renderSpellLibrary();
  renderStats();
}

// Ritual timer
let ritualTimerId = null;
let ritualRemaining = 0;

function startRitual(minutes) {
  if (ritualTimerId) {
    clearInterval(ritualTimerId);
  }
  ritualRemaining = minutes * 60;
  ritualStatusEl.textContent = `Ritual in progress (${minutes} min)…`;
  updateRitualDisplay();

  ritualTimerId = setInterval(() => {
    ritualRemaining -= 1;
    if (ritualRemaining <= 0) {
      clearInterval(ritualTimerId);
      ritualTimerId = null;
      ritualRemaining = 0;
      ritualStatusEl.textContent = "Ritual complete ✔ Take note of how you feel.";
      ritualTimerEl.textContent = "00:00";
    } else {
      updateRitualDisplay();
    }
  }, 1000);
}

function updateRitualDisplay() {
  const m = String(Math.floor(ritualRemaining / 60)).padStart(2, "0");
  const s = String(ritualRemaining % 60).padStart(2, "0");
  ritualTimerEl.textContent = `${m}:${s}`;
}

// Event bindings
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-view").forEach(view => {
      view.classList.toggle("active", view.id === tab + "Tab");
    });
  });
});

schoolFilterEl.addEventListener("change", renderSpellLibrary);

rerollBtn.addEventListener("click", () => {
  if (!confirm("Generate a new spread for today? This won’t erase already cast spells.")) return;
  generateDailySpread(true);
  renderDaily();
});

// Ritual buttons
document.querySelectorAll(".ritual-controls .btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const min = parseInt(btn.dataset.min, 10) || 1;
    startRitual(min);
  });
});

// Canvas / animated runes
const canvas = document.getElementById("bookCanvas");
const ctx = canvas.getContext("2d");
let runes = [];

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  runes = [];
  const count = 60;
  for (let i = 0; i < count; i++) {
    runes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      base: 2 + Math.random() * 3,
      t: Math.random() * Math.PI * 2
    });
  }
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function animateRunes() {
  ctx.fillStyle = "#1c110f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  runes.forEach(r => {
    r.t += 0.04;
    const glow = (Math.sin(r.t) + 1) / 2;
    const radius = r.base + glow * 3;

    const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius * 2.5);
    gradient.addColorStop(0, `rgba(255,230,190,${0.4 + glow * 0.4})`);
    gradient.addColorStop(1, "rgba(255,230,190,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,250,235,0.9)";
    ctx.beginPath();
    ctx.arc(r.x, r.y, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animateRunes);
}
animateRunes();

// Init
(function init() {
  loadState();
  generateDailySpread(false);
  renderAll();
})();
