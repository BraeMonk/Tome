// ================== DATA ==================
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

const RITUALS_BASE = [
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

// ================== STATE ==================
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
  customSpells: [],     // per-category
  customRituals: []     // appended after base rituals
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
    state = JSON.parse(s);
  }
  if (!state.achievements) state.achievements = [];
  if (!state.level) state.level = 1;
  if (!state.xp) state.xp = 0;
  if (!state.ritualProgress) state.ritualProgress = {};
  if (!state.categoriesCast) state.categoriesCast = [];
  if (!state.customSpells) state.customSpells = [];
  if (!state.customRituals) state.customRituals = [];
}

// ================== LEVEL / TITLES ==================
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

// ================== ACHIEVEMENTS ==================
function checkAchievements() {
  const newUnlocks = [];

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
          steps.filter(s => s).length === steps.length
        );
        break;
    }

    if (unlock) {
      state.achievements.push(ach.id);
      newUnlocks.push(ach);
    }
  });

  return newUnlocks;
}

// ================== EFFECTS ==================
function showSpellEffect(mana) {
  const effect = document.getElementById('spellEffect');
  const manaText = document.getElementById('effectMana');
  if (!effect || !manaText) return;

  manaText.textContent = mana;
  effect.classList.add('active');

  setTimeout(() => {
    effect.classList.remove('active');
  }, 600);
}

// (optional) spell canvas particles: lightweight placeholder
function flashSpellCanvas() {
  const canvas = document.getElementById('spellCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 0,
      maxLife: 25 + Math.random() * 20
    });
  }

  let frame = 0;
  canvas.classList.add('active');

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    });
    if (frame < 50) {
      requestAnimationFrame(tick);
    } else {
      canvas.classList.remove('active');
    }
  }
  tick();
}

// ================== DAILY GENERATION ==================
function generateDaily() {
  const allSpells = [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment
  ];
  state.daily = allSpells
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map(s => s.id);
  state.lastDay = today();
  save();
}

// ================== RENDERING ==================
function renderHeader() {
  const manaEl = document.getElementById('manaDisplay');
  const totalCastsEl = document.getElementById('totalCasts');
  const streakEl = document.getElementById('streak');
  const levelEl = document.getElementById('level');
  const levelDisplayEl = document.getElementById('levelDisplay');
  const xpFillEl = document.getElementById('xpFill');
  const xpTextEl = document.getElementById('xpText');

  // book header
  if (manaEl) manaEl.textContent = state.mana;
  if (totalCastsEl) totalCastsEl.textContent = state.totalCasts;
  if (streakEl) streakEl.textContent = state.streak;
  if (levelEl) levelEl.textContent = state.level;
  if (levelDisplayEl) levelDisplayEl.textContent = getLevelTitle(state.level);

  const xpProgress = state.xp % 100;
  if (xpFillEl) xpFillEl.style.width = xpProgress + '%';
  if (xpTextEl) xpTextEl.textContent = `${xpProgress} / 100 XP`;

  // home orb
  const homeMana = document.getElementById('homeMana');
  const homeLevelTitle = document.getElementById('homeLevelTitle');
  const homeLevelNumber = document.getElementById('homeLevelNumber');
  if (homeMana) homeMana.textContent = state.mana;
  if (homeLevelTitle) homeLevelTitle.textContent = getLevelTitle(state.level);
  if (homeLevelNumber) homeLevelNumber.textContent = `Lv ${state.level}`;
}

function renderDaily() {
  const ul = document.getElementById('dailyList');
  if (!ul) return;
  ul.innerHTML = '';

  const allSpells = [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment
  ];

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

  renderHomeOrbit();
}

function renderSpellCategory(category, elementId) {
  const ul = document.getElementById(elementId);
  if (!ul) return;
  ul.innerHTML = '';

  const base = SPELLS[category] || [];
  const custom = state.customSpells.filter(s => s.category === category);

  [...base, ...custom].forEach(sp => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="spell-name">${sp.name}</span>
      <div class="spell-desc">${sp.desc}</div>
      <span class="spell-reward">+${sp.reward} ✨ Mana</span>
    `;
    ul.appendChild(li);
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

function getAllRituals() {
  return [...RITUALS_BASE, ...state.customRituals];
}

function renderRituals() {
  const ul = document.getElementById('ritualsList');
  if (!ul) return;
  ul.innerHTML = '';

  getAllRituals().forEach(ritual => {
    if (!state.ritualProgress[ritual.id]) {
      state.ritualProgress[ritual.id] = new Array(ritual.steps.length).fill(false);
    }

    const progress = state.ritualProgress[ritual.id];
    const completed = progress.filter(s => s).length;
    const total = ritual.steps.length;

    let stepsHtml = '<ul class="ritual-steps">';
    ritual.steps.forEach((step, idx) => {
      stepsHtml += `
        <li class="ritual-step ${progress[idx] ? 'completed' : ''}" data-ritual="${ritual.id}" data-step="${idx}">
          ${progress[idx] ? '✓' : '○'} ${step}
        </li>
      `;
    });
    stepsHtml += '</ul>';

    const li = document.createElement('li');
    li.className = 'ritual-item';
    li.innerHTML = `
      <div class="ritual-title">${ritual.name}</div>
      <div class="ritual-desc">${ritual.desc}</div>
      <div style="margin: 6px 0; font-weight: bold; color: #6a0dad;">Progress: ${completed}/${total}</div>
      ${stepsHtml}
      <span class="spell-reward">Complete for +${ritual.reward} ✨ Mana</span>
    `;
    ul.appendChild(li);
  });
}

// ================== HOME ORBIT RENDERING ==================
function renderHomeOrbit() {
  const container = document.getElementById('orbitSpells');
  if (!container) return;
  container.innerHTML = '';

  const allSpells = [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment
  ];

  const spells = state.daily
    .map(id => allSpells.find(s => s.id === id))
    .filter(Boolean);

  spells.forEach(sp => {
    const btn = document.createElement('button');
    btn.className = 'orbit-spell';
    btn.dataset.cast = sp.id;
    btn.innerHTML = `
      <div class="orbit-spell-name">${sp.name}</div>
      <div class="orbit-spell-reward">+${sp.reward} ✨</div>
    `;
    container.appendChild(btn);
  });

  layoutOrbitSpells();
}

function layoutOrbitSpells() {
  const container = document.getElementById('orbitSpells');
  if (!container) return;
  const cards = container.querySelectorAll('.orbit-spell');
  const count = cards.length;
  if (!count) return;

  const rect = container.getBoundingClientRect();
  const radius = Math.max(Math.min(rect.width, rect.height) / 2 - 40, 60);

  cards.forEach((card, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    card.style.top = '50%';
    card.style.left = '50%';
    card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });
}

// ================== CUSTOM SPELLS / RITUALS ==================
function setupCustomForms() {
  const addSpellBtn = document.getElementById('addCustomSpellButton');
  const spellForm = document.getElementById('customSpellForm');
  const saveSpellBtn = document.getElementById('saveCustomSpell');
  const addRitualBtn = document.getElementById('saveCustomRitual');

  if (addSpellBtn && spellForm) {
    addSpellBtn.addEventListener('click', () => {
      spellForm.classList.toggle('hidden');
    });
  }

  if (saveSpellBtn) {
    saveSpellBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('customSpellName');
      const descEl = document.getElementById('customSpellDesc');
      const rewardEl = document.getElementById('customSpellReward');
      const categoryEl = document.getElementById('customSpellCategory');
      if (!nameEl || !descEl || !rewardEl || !categoryEl) return;

      const name = nameEl.value.trim();
      const desc = descEl.value.trim();
      const reward = parseInt(rewardEl.value, 10) || 5;
      const category = categoryEl.value || 'mind';

      if (!name || !desc) return;

      const id = 'custom_' + Date.now();
      state.customSpells.push({ id, name, desc, reward, category });
      save();

      renderSpellCategory('body', 'bodySpells');
      renderSpellCategory('mind', 'mindSpells');
      renderSpellCategory('spirit', 'spiritSpells');
      renderSpellCategory('environment', 'environmentSpells');
      renderHomeOrbit();

      nameEl.value = '';
      descEl.value = '';
      rewardEl.value = '10';
      categoryEl.value = 'body';
      spellForm.classList.add('hidden');
    });
  }

  const saveRitualBtn = document.getElementById('saveCustomRitual');
  if (saveRitualBtn) {
    saveRitualBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('customRitualName');
      const stepsEl = document.getElementById('customRitualSteps');
      const rewardEl = document.getElementById('customRitualReward');
      if (!nameEl || !stepsEl || !rewardEl) return;

      const name = nameEl.value.trim();
      const reward = parseInt(rewardEl.value, 10) || 30;
      const lines = stepsEl.value
        .split('\n')
        .map(x => x.trim())
        .filter(Boolean);

      if (!name || !lines.length) return;

      const id = 'ritual_' + Date.now();
      state.customRituals.push({
        id,
        name,
        desc: 'Custom ritual',
        steps: lines,
        reward
      });

      save();
      renderRituals();

      nameEl.value = '';
      stepsEl.value = '';
      rewardEl.value = '30';
    });
  }
}

// ================== SEARCH ==================
function setupSpellSearch() {
  const input = document.getElementById('spellSearch');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();

    ['bodySpells', 'mindSpells', 'spiritSpells', 'environmentSpells'].forEach(id => {
      const list = document.getElementById(id);
      if (!list) return;
      const items = list.querySelectorAll('li');
      items.forEach(li => {
        const text = li.textContent.toLowerCase();
        li.style.display = text.includes(q) ? '' : 'none';
      });
    });
  });
}

// ================== BOOK OPEN / MODE HANDLING ==================
function getUrlParams() {
  const params = {};
  const search = window.location.search.substring(1).split('&');
  search.forEach(part => {
    if (!part) return;
    const [k, v] = part.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return params;
}

function openGrimoireTab() {
  const url = window.location.pathname + '?mode=book';
  window.open(url, '_blank');
}

function setupDockClick() {
  const dock = document.getElementById('bookCoverDock');
  if (!dock) return;
  dock.addEventListener('click', openGrimoireTab);
}

function enterBookMode() {
  const home = document.getElementById('homeSection');
  const bookPages = document.getElementById('bookPages');
  if (home) home.style.display = 'none';
  if (bookPages) bookPages.classList.add('open');

  const closeBtn = document.getElementById('closeGrimoireButton');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // try to close tab; if blocked, just go back to base
      if (window.opener) {
        window.close();
      } else {
        window.location = window.location.pathname;
      }
    });
  }
}

function setupTabs() {
  document.addEventListener('click', e => {
    // Tabs
    const tabButton = e.target.closest('.spell-tab');
    if (tabButton) {
      const tabId = tabButton.dataset.tab;
      if (!tabId) return;

      document.querySelectorAll('.spell-tab').forEach(b => b.classList.remove('active'));
      tabButton.classList.add('active');

      document.querySelectorAll('.spell-view').forEach(v => v.classList.remove('active'));
      const view = document.getElementById(tabId);
      if (view) view.classList.add('active');
    }
  });
}

// ================== CLICK HANDLER (CAST / DAILY / RITUALS) ==================
document.addEventListener('click', e => {
  // CAST from any element with data-cast
  if (e.target.dataset && e.target.dataset.cast) {
    const id = e.target.dataset.cast;
    const allSpells = [
      ...SPELLS.body,
      ...SPELLS.mind,
      ...SPELLS.spirit,
      ...SPELLS.environment,
      ...state.customSpells
    ];
    const sp = allSpells.find(s => s.id === id);
    if (!sp) return;

    state.mana += sp.reward;
    state.xp += sp.reward;
    state.totalCasts++;

    if (!state.categoriesCast.includes(sp.category)) {
      state.categoriesCast.push(sp.category);
    }

    if (state.lastDay === today()) {
      // streak continues
    } else if (state.lastDay) {
      const daysDiff =
        (new Date(today()).getTime() - new Date(state.lastDay).getTime()) / 86400000;
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
    renderAchievements();
    renderHomeOrbit();
    showSpellEffect(sp.reward);
    flashSpellCanvas();

    if (state.level > oldLevel) {
      alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
    }

    if (newAchievements.length > 0) {
      newAchievements.forEach(ach => {
        setTimeout(() => {
          alert(`🏆 Achievement Unlocked: ${ach.name} - ${ach.desc}`);
        }, 100);
      });
    }
  }

  // New daily spread
  if (e.target.id === 'newSpread') {
    generateDaily();
    renderDaily();
  }

  // Ritual steps
  if (e.target.classList.contains('ritual-step')) {
    const ritualId = e.target.dataset.ritual;
    const stepIdx = parseInt(e.target.dataset.step, 10);
    if (!ritualId) return;

    state.ritualProgress[ritualId][stepIdx] = !state.ritualProgress[ritualId][stepIdx];

    const ritual = getAllRituals().find(r => r.id === ritualId);
    const allComplete = state.ritualProgress[ritualId].every(s => s);

    if (ritual && allComplete) {
      state.mana += ritual.reward;
      state.xp += ritual.reward;
      state.totalCasts++;

      const oldLevel = state.level;
      state.level = calculateLevel(state.xp);

      const newAchievements = checkAchievements();

      showSpellEffect(ritual.reward);
      flashSpellCanvas();

      if (state.level > oldLevel) {
        alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
      }

      alert(`🎊 Ritual Complete! You gained ${ritual.reward} mana!`);
      state.ritualProgress[ritualId] = new Array(ritual.steps.length).fill(false);
    }

    save();
    renderHeader();
    renderRituals();
    renderAchievements();
  }
});

// ================== PARTICLES ==================
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

// ================== INIT ==================
function init() {
  load();

  // daily logic
  if (state.lastDay !== today()) {
    generateDaily();
    if (
      state.lastDay &&
      new Date(today()).getTime() - new Date(state.lastDay).getTime() > 86400000 * 1.5
    ) {
      state.streak = 0;
    }
  }

  renderHeader();
  renderDaily();
  renderSpellCategory('body', 'bodySpells');
  renderSpellCategory('mind', 'mindSpells');
  renderSpellCategory('spirit', 'spiritSpells');
  renderSpellCategory('environment', 'environmentSpells');
  renderAchievements();
  renderRituals();
  setupCustomForms();
  setupSpellSearch();
  setupDockClick();
  setupTabs();
  createParticles();

  // layout orbit initially + on resize
  layoutOrbitSpells();
  window.addEventListener('resize', layoutOrbitSpells);

  // book mode?
  const params = getUrlParams();
  if (params.mode === 'book') {
    enterBookMode();
  }
}

document.addEventListener('DOMContentLoaded', init);
