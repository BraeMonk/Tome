// ================= BASE SPELL DATA =================
const SPELLS = {
  body: [
    {id:'water',name:'Hydration Charm',reward:5,desc:'Drink a full glass of pure water.',category:'body'},
    {id:'breathe',name:'Breathing Sigil',reward:6,desc:'Take 10 slow, deep breaths.',category:'body'},
    {id:'stretch',name:'Limb Unbinding',reward:7,desc:'Perform a 2-minute stretch routine.',category:'body'},
    {id:'walk',name:'Movement Incantation',reward:10,desc:'Take a 10-minute walk outside.',category:'body'},
    {id:'exercise',name:'Vitality Ritual',reward:15,desc:'Complete 20 minutes of exercise.',category:'body'},
    {id:'posture',name:'Alignment Spell',reward:5,desc:'Check and correct your posture.',category:'body'},
    {id:'meal',name:'Nourishment Blessing',reward:8,desc:'Eat a healthy, balanced meal.',category:'body'},
    {id:'sleep',name:'Restoration Charm',reward:12,desc:'Get 7-8 hours of quality sleep.',category:'body'}
  ],
  mind: [
    {id:'focus',name:'Micro Focus Spell',reward:10,desc:'Focus on a single task for 25 minutes.',category:'mind'},
    {id:'read',name:'Wisdom Absorption',reward:8,desc:'Read for 15 minutes.',category:'mind'},
    {id:'journal',name:'Reflection Ritual',reward:10,desc:'Journal for 10 minutes.',category:'mind'},
    {id:'learn',name:'Knowledge Enchantment',reward:12,desc:'Learn something new for 20 minutes.',category:'mind'},
    {id:'create',name:'Creation Manifestation',reward:15,desc:'Work on a creative project for 30 minutes.',category:'mind'},
    {id:'plan',name:'Foresight Divination',reward:7,desc:'Plan tomorrow\'s tasks.',category:'mind'},
    {id:'puzzle',name:'Mental Sharpening',reward:8,desc:'Solve a puzzle or brain teaser.',category:'mind'}
  ],
  spirit: [
    {id:'meditate',name:'Inner Peace Meditation',reward:12,desc:'Meditate for 10 minutes.',category:'spirit'},
    {id:'gratitude',name:'Thankfulness Blessing',reward:8,desc:'Write down 3 things you\'re grateful for.',category:'spirit'},
    {id:'connect',name:'Social Bond Weaving',reward:10,desc:'Have a meaningful conversation.',category:'spirit'},
    {id:'nature',name:'Earth Connection',reward:10,desc:'Spend 15 minutes in nature.',category:'spirit'},
    {id:'music',name:'Harmonic Resonance',reward:7,desc:'Listen to uplifting music for 15 minutes.',category:'spirit'},
    {id:'art',name:'Beauty Appreciation',reward:8,desc:'Appreciate or create art for 10 minutes.',category:'spirit'},
    {id:'kindness',name:'Compassion Casting',reward:10,desc:'Perform a random act of kindness.',category:'spirit'}
  ],
  environment: [
    {id:'clean',name:'Space Purification',reward:8,desc:'Clean and organize your space for 15 minutes.',category:'environment'},
    {id:'declutter',name:'Chaos Banishment',reward:10,desc:'Declutter one area of your home.',category:'environment'},
    {id:'fresh_air',name:'Air Renewal',reward:5,desc:'Open windows and air out your space.',category:'environment'},
    {id:'plants',name:'Green Guardian Care',reward:6,desc:'Water and care for your plants.',category:'environment'}
  ]
};

const BASE_RITUALS = [
  {
    id:'morning',
    name:'Dawn Awakening Ritual',
    desc:'A powerful morning routine to start your day with purpose.',
    steps:['Drink water immediately upon waking','Perform 5 minutes of stretching','Meditate for 10 minutes','Write 3 daily intentions'],
    reward:30
  },
  {
    id:'evening',
    name:'Twilight Reflection Ritual',
    desc:'An evening practice to process the day and prepare for rest.',
    steps:['Review the day\'s accomplishments','Write in gratitude journal','Prepare tomorrow\'s tasks','Read for 15 minutes','Perform bedtime stretches'],
    reward:35
  },
  {
    id:'weekly',
    name:'Sabbath Restoration',
    desc:'A weekly deep restoration practice.',
    steps:['Deep clean one room','Plan the week ahead','Engage in a creative hobby for 1 hour','Connect with loved ones','Review weekly progress'],
    reward:50
  }
];

let RITUALS = [...BASE_RITUALS];

const ACHIEVEMENTS = [
  {id:'first_cast',name:'First Spell',desc:'Cast your first spell',icon:'✨'},
  {id:'streak_3',name:'Dedicated',desc:'3 day streak',icon:'🔥'},
  {id:'streak_7',name:'Committed',desc:'7 day streak',icon:'⚡'},
  {id:'streak_30',name:'Master',desc:'30 day streak',icon:'👑'},
  {id:'casts_10',name:'Apprentice',desc:'Cast 10 spells',icon:'🎓'},
  {id:'casts_50',name:'Adept',desc:'Cast 50 spells',icon:'🔮'},
  {id:'casts_100',name:'Wizard',desc:'Cast 100 spells',icon:'🧙'},
  {id:'all_categories',name:'Versatile',desc:'Cast spells from all categories',icon:'🌟'},
  {id:'ritual_complete',name:'Ritualist',desc:'Complete your first ritual',icon:'🕯️'}
];

// ================= STATE =================
let state = {
  mana: 0,
  totalCasts: 0,
  streak: 0,
  lastDay: null,
  daily: [],
  achievements: [],
  level: 1,
  xp: 0,
  ritualProgress: {},
  categoriesCast: [],
  customSpells: [],      // {id,name,reward,desc,category}
  customRituals: []      // {id,name,desc,steps[],reward}
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function save() {
  localStorage.setItem('grimoireOS', JSON.stringify(state));
}

function load() {
  const s = localStorage.getItem('grimoireOS');
  if (s) {
    try {
      const parsed = JSON.parse(s);
      Object.assign(state, parsed);
    } catch (e) {
      console.warn('Failed to parse saved state', e);
    }
  }
  if (!state.achievements) state.achievements = [];
  if (!state.level) state.level = 1;
  if (!state.xp) state.xp = 0;
  if (!state.ritualProgress) state.ritualProgress = {};
  if (!state.categoriesCast) state.categoriesCast = [];
  if (!state.customSpells) state.customSpells = [];
  if (!state.customRituals) state.customRituals = [];

  // Rehydrate custom spells into SPELLS
  state.customSpells.forEach(sp => {
    if (SPELLS[sp.category] && !SPELLS[sp.category].some(b => b.id === sp.id)) {
      SPELLS[sp.category].push(sp);
    }
  });

  // Rehydrate custom rituals
  state.customRituals.forEach(r => {
    if (!RITUALS.some(base => base.id === r.id)) {
      RITUALS.push(r);
    }
  });
}

// ================= LEVEL / TITLES =================
function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function getLevelTitle(level) {
  if (level === 1) return 'Novice';
  if (level < 5) return 'Apprentice';
  if (level < 10) return 'Adept';
  if (level < 20) return 'Wizard';
  if (level < 50) return 'Archmage';
  return 'Grand Sorcerer';
}

// ================= ACHIEVEMENTS =================
function checkAchievements() {
  const newly = [];

  ACHIEVEMENTS.forEach(ach => {
    if (state.achievements.includes(ach.id)) return;

    let unlock = false;
    switch (ach.id) {
      case 'first_cast': unlock = state.totalCasts >= 1; break;
      case 'streak_3': unlock = state.streak >= 3; break;
      case 'streak_7': unlock = state.streak >= 7; break;
      case 'streak_30': unlock = state.streak >= 30; break;
      case 'casts_10': unlock = state.totalCasts >= 10; break;
      case 'casts_50': unlock = state.totalCasts >= 50; break;
      case 'casts_100': unlock = state.totalCasts >= 100; break;
      case 'all_categories': unlock = state.categoriesCast.length >= 4; break;
      case 'ritual_complete':
        unlock = Object.values(state.ritualProgress).some(steps =>
          steps.filter(Boolean).length === steps.length && steps.length > 0
        );
        break;
    }

    if (unlock) {
      state.achievements.push(ach.id);
      newly.push(ach);
    }
  });

  return newly;
}

// ================= FX: SPELL CAST =================
function showSpellEffect(mana) {
  const effect = document.getElementById('spellEffect');
  const manaText = document.getElementById('effectMana');
  if (!effect || !manaText) return;
  manaText.textContent = mana;
  effect.classList.add('active');
  triggerSpellCanvasBurst();

  setTimeout(() => {
    effect.classList.remove('active');
  }, 600);
}

// Canvas particles
let spellCanvas, spellCtx;
function initSpellCanvas() {
  spellCanvas = document.getElementById('spellCanvas');
  if (!spellCanvas) return;
  spellCanvas.width = window.innerWidth;
  spellCanvas.height = window.innerHeight;
  spellCtx = spellCanvas.getContext('2d');
}
window.addEventListener('resize', () => {
  if (!spellCanvas) return;
  spellCanvas.width = window.innerWidth;
  spellCanvas.height = window.innerHeight;
});

function triggerSpellCanvasBurst() {
  if (!spellCanvas || !spellCtx) return;
  spellCanvas.classList.add('active');

  const particles = [];
  const cx = spellCanvas.width / 2;
  const cy = spellCanvas.height / 2;

  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 400 + Math.random() * 300
    });
  }

  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    spellCtx.clearRect(0, 0, spellCanvas.width, spellCanvas.height);

    particles.forEach(p => {
      const progress = elapsed / p.life;
      if (progress >= 1) return;
      p.x += p.vx;
      p.y += p.vy;
      spellCtx.globalAlpha = 1 - progress;
      spellCtx.fillStyle = '#ffe9a6';
      spellCtx.beginPath();
      spellCtx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      spellCtx.fill();
    });

    if (elapsed < 700) {
      requestAnimationFrame(frame);
    } else {
      spellCtx.clearRect(0, 0, spellCanvas.width, spellCanvas.height);
      spellCanvas.classList.remove('active');
    }
  }

  requestAnimationFrame(frame);
}

// ================= AMBIENT AUDIO =================
let ambienceStarted = false;
let audioCtx, ambienceNodes = [];

function startAmbience() {
  if (ambienceStarted) return;
  ambienceStarted = true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Two gentle detuned sines for a pad
    function createPadOsc(freq, detune) {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const gain = audioCtx.createGain();
      gain.gain.value = 0.02; // super subtle
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      ambienceNodes.push(osc, gain);
    }

    createPadOsc(110, -5);
    createPadOsc(220, 7);
  } catch (e) {
    console.warn('Ambient audio failed:', e);
  }
}

function nudgeAmbience() {
  if (!ambienceStarted) startAmbience();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// ================= DAILY GENERATION =================
function allSpellsArray() {
  return [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment
  ];
}

function generateDaily() {
  const allSpells = allSpellsArray();
  const shuffled = [...allSpells].sort(() => 0.5 - Math.random());
  state.daily = shuffled.slice(0, 5).map(s => s.id);
  state.lastDay = today();
  save();
}

// ================= RENDERING =================
function renderHeader() {
  const manaEl = document.getElementById('manaDisplay');
  const totalEl = document.getElementById('totalCasts');
  const streakEl = document.getElementById('streak');
  const levelStatEl = document.getElementById('levelStat');
  const levelDisplayEl = document.getElementById('levelDisplay');
  const levelEl = document.getElementById('level');

  if (manaEl) manaEl.textContent = state.mana;
  if (totalEl) totalEl.textContent = state.totalCasts;
  if (streakEl) streakEl.textContent = state.streak;
  if (levelStatEl) levelStatEl.textContent = state.level;
  if (levelEl) levelEl.textContent = state.level;
  if (levelDisplayEl) levelDisplayEl.textContent = getLevelTitle(state.level);

  const xpProgress = state.xp % 100;
  const xpFillEl = document.getElementById('xpFill');
  const xpTextEl = document.getElementById('xpText');
  if (xpFillEl) xpFillEl.style.width = xpProgress + '%';
  if (xpTextEl) xpTextEl.textContent = xpProgress + ' / 100 XP';

  renderHomeStats();
}

function renderHomeStats() {
  const manaHome = document.getElementById('homeManaDisplay');
  const lvlTitleHome = document.getElementById('homeLevelTitle');
  const lvlNumberHome = document.getElementById('homeLevelNumber');

  if (manaHome) manaHome.textContent = state.mana;
  if (lvlTitleHome) lvlTitleHome.textContent = getLevelTitle(state.level);
  if (lvlNumberHome) lvlNumberHome.textContent = state.level;
}

function renderDaily() {
  const ul = document.getElementById('dailyList');
  if (!ul) return;
  ul.innerHTML = '';

  const allSpells = allSpellsArray();

  state.daily.forEach(id => {
    const sp = allSpells.find(s => s.id === id);
    if (!sp) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="spell-name">${sp.name}</span>
      <div class="spell-desc">${sp.desc}</div>
      <span class="spell-reward">+${sp.reward} ✨ Mana</span>
      <button class="cast-button" data-cast="${sp.id}">⚡ Cast Spell</button>
    `;
    ul.appendChild(li);
  });

  renderOrbitDaily();
}

function renderOrbitDaily() {
  const container = document.getElementById('orbitDailyContainer');
  if (!container) return;
  container.innerHTML = '';

  const allSpells = allSpellsArray();
  const n = state.daily.length;
  if (n === 0) return;

  const radius = 37; // percent of container
  state.daily.forEach((id, idx) => {
    const sp = allSpells.find(s => s.id === id);
    if (!sp) return;

    const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;

    const card = document.createElement('button');
    card.className = 'orbit-spell';
    card.dataset.cast = id;
    card.style.left = x + '%';
    card.style.top = y + '%';
    card.innerHTML = `
      <div class="orbit-spell-name">${sp.name}</div>
      <div class="orbit-spell-reward">+${sp.reward} ✨</div>
    `;
    container.appendChild(card);
  });
}

function renderSpellCategory(category, elementId, filterText = '') {
  const ul = document.getElementById(elementId);
  if (!ul) return;
  ul.innerHTML = '';

  const list = SPELLS[category] || [];
  const q = filterText.trim().toLowerCase();

  list.forEach(sp => {
    if (q && !(sp.name.toLowerCase().includes(q) || sp.desc.toLowerCase().includes(q))) return;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="spell-name">${sp.name}</span>
      <div class="spell-desc">${sp.desc}</div>
      <span class="spell-reward">+${sp.reward} ✨ Mana</span>
    `;
    ul.appendChild(li);
  });
}

function renderSpellLibrary(filterCategory = 'all', searchText = '') {
  const categories = ['body', 'mind', 'spirit', 'environment'];
  const q = searchText || '';
  categories.forEach(cat => {
    if (filterCategory !== 'all' && filterCategory !== cat) {
      const ul = document.getElementById(cat + 'Spells');
      if (ul) ul.innerHTML = '';
    } else {
      renderSpellCategory(cat, cat + 'Spells', q);
    }
  });
}

function renderAchievements() {
  const grid = document.getElementById('achievementsList');
  if (!grid) return;
  grid.innerHTML = '';

  ACHIEVEMENTS.forEach(ach => {
    const div = document.createElement('div');
    const unlocked = state.achievements.includes(ach.id);
    div.className = 'achievement' + (unlocked ? '' : ' locked');
    div.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-name">${ach.name}</div>
    `;
    div.title = ach.desc;
    grid.appendChild(div);
  });
}

function renderRituals() {
  const ul = document.getElementById('ritualsList');
  if (!ul) return;
  ul.innerHTML = '';

  RITUALS.forEach(ritual => {
    if (!state.ritualProgress[ritual.id]) {
      state.ritualProgress[ritual.id] = new Array(ritual.steps.length).fill(false);
    }
    const progress = state.ritualProgress[ritual.id];
    const completed = progress.filter(Boolean).length;
    const total = ritual.steps.length;

    const li = document.createElement('li');
    li.className = 'ritual-item';

    let stepsHtml = '<ul class="ritual-steps">';
    ritual.steps.forEach((step, idx) => {
      const done = progress[idx];
      stepsHtml += `
        <li class="ritual-step ${done ? 'completed' : ''}" data-ritual="${ritual.id}" data-step="${idx}">
          ${done ? '✓' : '○'} ${step}
        </li>
      `;
    });
    stepsHtml += '</ul>';

    li.innerHTML = `
      <div class="ritual-title">${ritual.name}</div>
      <div class="ritual-desc">${ritual.desc}</div>
      <div style="margin: 10px 0; font-weight: bold; color: #6a0dad;">Progress: ${completed}/${total}</div>
      ${stepsHtml}
      <span class="spell-reward">Complete for +${ritual.reward} ✨ Mana</span>
    `;
    ul.appendChild(li);
  });
}

// ================= CAST HANDLING =================
function handleCast(spellId) {
  const allSpells = allSpellsArray();
  const sp = allSpells.find(s => s.id === spellId);
  if (!sp) return;

  nudgeAmbience();

  state.mana += sp.reward;
  state.xp += sp.reward;
  state.totalCasts++;

  if (!state.categoriesCast.includes(sp.category)) {
    state.categoriesCast.push(sp.category);
  }

  if (state.lastDay === today()) {
    // streak continues, nothing to do
  } else if (state.lastDay) {
    const daysDiff = (new Date(today()).getTime() - new Date(state.lastDay).getTime()) / 86400000;
    if (daysDiff <= 1.5) {
      state.streak++;
    } else {
      state.streak = 1;
    }
  } else {
    state.streak = 1;
  }

  state.lastDay = today();

  const oldLevel = state.level;
  state.level = calculateLevel(state.xp);

  const newAchievements = checkAchievements();

  save();
  renderHeader();
  renderDaily();
  renderAchievements();
  showSpellEffect(sp.reward);

  if (state.level > oldLevel) {
    alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
  }

  if (newAchievements.length > 0) {
    newAchievements.forEach(ach => {
      setTimeout(() => {
        alert(`🏆 Achievement Unlocked: ${ach.name} - ${ach.desc}`);
      }, 120);
    });
  }
}

// ================= EVENT LISTENERS =================

// Click delegation
document.addEventListener('click', e => {
  // 🔧 FIX: use closest so clicks on inner elements still count
  const castEl = e.target.closest('[data-cast]');
  if (castEl && castEl.dataset.cast) {
    handleCast(castEl.dataset.cast);
    return;
  }

  // Daily "Draw New Spread" in book
  if (e.target.id === 'newSpread') {
    generateDaily();
    renderDaily();
    save();
    return;
  }

  // Daily "Draw New Spread" on home
  if (e.target.id === 'newSpreadHome') {
    generateDaily();
    renderDaily();
    save();
    return;
  }

  // Tab switching
  const tabButton = e.target.closest('.spell-tab');
  if (tabButton) {
    const tabId = tabButton.dataset.tab;
    if (!tabId) return;
    document.querySelectorAll('.spell-tab').forEach(b => b.classList.remove('active'));
    tabButton.classList.add('active');
    document.querySelectorAll('.spell-view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(tabId);
    if (view) view.classList.add('active');
    return;
  }

  // Ritual step toggle
  if (e.target.classList.contains('ritual-step')) {
    const ritualId = e.target.dataset.ritual;
    const stepIdx = parseInt(e.target.dataset.step, 10);
    if (!ritualId || isNaN(stepIdx)) return;

    const progress = state.ritualProgress[ritualId] || [];
    progress[stepIdx] = !progress[stepIdx];
    state.ritualProgress[ritualId] = progress;

    const ritual = RITUALS.find(r => r.id === ritualId);
    const allComplete = progress.length > 0 && progress.every(Boolean);

    if (allComplete && ritual) {
      nudgeAmbience();
      state.mana += ritual.reward;
      state.xp += ritual.reward;
      state.totalCasts++;

      const oldLevel = state.level;
      state.level = calculateLevel(state.xp);
      const newAchievements = checkAchievements();

      showSpellEffect(ritual.reward);

      if (state.level > oldLevel) {
        alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
      }

      alert(`🎊 Ritual Complete! You gained ${ritual.reward} mana!`);

      state.ritualProgress[ritualId] = new Array(ritual.steps.length).fill(false);

      save();
    }

    renderHeader();
    renderRituals();
    renderAchievements();
    return;
  }
});

// Open / close book
function openBook() {
  const pages = document.getElementById('bookPages');
  if (pages) {
    pages.classList.add('open');
    pages.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  nudgeAmbience();
}

function closeBook() {
  const pages = document.getElementById('bookPages');
  if (pages) pages.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  initSpellCanvas();

  const cover = document.getElementById('bookCover');
  if (cover) cover.addEventListener('click', openBook);

  const closeButton = document.getElementById('closeBook');
  if (closeButton) closeButton.addEventListener('click', closeBook);

  // Spell search + filter
  const searchInput = document.getElementById('spellSearch');
  const filterButtons = document.querySelectorAll('.spell-library-controls .secondary-button');
  let currentFilter = 'all';
  let currentSearch = '';

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value || '';
      renderSpellLibrary(currentFilter, currentSearch);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter || 'all';
      renderSpellLibrary(currentFilter, currentSearch);
    });
  });

  // Custom spell form
  const customSpellForm = document.getElementById('customSpellForm');
  if (customSpellForm) {
    customSpellForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('customSpellName').value.trim();
      const desc = document.getElementById('customSpellDesc').value.trim();
      const reward = parseInt(document.getElementById('customSpellReward').value, 10) || 5;
      const category = document.getElementById('customSpellCategory').value;

      if (!name || !desc || !category) return;

      const idBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const id = 'custom_' + idBase + '_' + Date.now().toString(36);

      const newSpell = { id, name, reward, desc, category };
      if (!SPELLS[category]) SPELLS[category] = [];
      SPELLS[category].push(newSpell);
      state.customSpells.push(newSpell);

      save();
      renderSpellLibrary(currentFilter, currentSearch);

      customSpellForm.reset();
    });
  }

  // Custom ritual form
  const customRitualForm = document.getElementById('customRitualForm');
  if (customRitualForm) {
    customRitualForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('customRitualName').value.trim();
      const reward = parseInt(document.getElementById('customRitualReward').value, 10) || 30;
      const stepsRaw = document.getElementById('customRitualSteps').value.trim();
      if (!name || !stepsRaw) return;

      const steps = stepsRaw.split('\n').map(s => s.trim()).filter(Boolean);
      if (steps.length === 0) return;

      const idBase = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const id = 'ritual_custom_' + idBase + '_' + Date.now().toString(36);

      const ritual = { id, name, desc: 'Custom ritual', steps, reward };
      RITUALS.push(ritual);
      state.customRituals.push(ritual);

      save();
      renderRituals();
      customRitualForm.reset();
    });
  }

  // Initial particle background
  createParticles();

  // Load + bootstrap
  load();

  // Ensure daily for today
  if (state.lastDay !== today()) {
    generateDaily();
    if (state.lastDay && new Date(today()).getTime() - new Date(state.lastDay).getTime() > 86400000 * 1.5) {
      state.streak = 0;
    }
  }

  renderHeader();
  renderDaily();
  renderSpellLibrary('all', '');
  renderAchievements();
  renderRituals();
});

// ================= PARTICLES =================
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    container.appendChild(particle);
  }
}
