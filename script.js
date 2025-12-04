// ===================== DATA =====================

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

const RITUALS = [
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

// ===================== STATE =====================

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
  customSpells: [],
  customRituals: []
};

let ambienceAudio = null;

// ===================== HELPERS =====================

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
      state = Object.assign(state, parsed);
    } catch (e) {
      console.warn('Failed to load state, resetting.', e);
    }
  }
  if (!state.achievements) state.achievements = [];
  if (!state.level) state.level = 1;
  if (!state.xp) state.xp = 0;
  if (!state.ritualProgress) state.ritualProgress = {};
  if (!state.categoriesCast) state.categoriesCast = [];
  if (!state.customSpells) state.customSpells = [];
  if (!state.customRituals) state.customRituals = [];
}

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

function getAllSpells() {
  const base = [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment
  ];
  return base.concat(state.customSpells || []);
}

function getAllRituals() {
  return RITUALS.concat(state.customRituals || []);
}

// ===================== ACHIEVEMENTS =====================

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
          steps && steps.filter(s => s).length === steps.length
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

// ===================== VISUAL EFFECTS =====================

function showSpellEffect(mana) {
  const effect = document.getElementById('spellEffect');
  const manaText = document.getElementById('effectMana');

  if (manaText) {
    manaText.textContent = mana;
  }
  if (effect) {
    effect.classList.add('active');
    setTimeout(() => effect.classList.remove('active'), 600);
  }

  runCanvasSpellEffect();
}

function runCanvasSpellEffect() {
  const canvas = document.getElementById('spellCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = window.innerWidth;
  const h = canvas.height = window.innerHeight;

  const particles = [];
  const count = 80;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x: w / 2,
      y: h / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 30 + Math.random() * 20
    });
  }

  canvas.classList.add('active');

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(5, 2, 15, 0.25)';
    ctx.fillRect(0, 0, w, h);

    let alive = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      const t = p.life / p.maxLife;
      if (t < 1) alive = true;
      const alpha = Math.max(0, 1 - t);
      const radius = 2 + 4 * (1 - t);
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,215,0,${alpha})`;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    if (alive) {
      requestAnimationFrame(tick);
    } else {
      canvas.classList.remove('active');
      ctx.clearRect(0, 0, w, h);
    }
  }

  tick();
}

// simple ambience hook – expects ambience.mp3 if you add it
function startAmbience() {
  if (ambienceAudio) return;
  try {
    ambienceAudio = new Audio('ambience.mp3');
    ambienceAudio.loop = true;
    ambienceAudio.volume = 0.18;
    ambienceAudio.play().catch(() => {
      // user may need to interact again; ignore
    });
  } catch (e) {
    console.warn('Ambience unavailable', e);
  }
}

// ===================== RENDERING =====================

function renderHeader() {
  const manaEls = [
    document.getElementById('manaDisplay'),
    document.getElementById('manaDisplayTop')
  ];
  manaEls.forEach(el => {
    if (el) el.textContent = state.mana;
  });

  const totalCastsEl = document.getElementById('totalCasts');
  if (totalCastsEl) totalCastsEl.textContent = state.totalCasts;

  const streakEl = document.getElementById('streak');
  if (streakEl) streakEl.textContent = state.streak;

  const levelEl = document.getElementById('level');
  if (levelEl) levelEl.textContent = state.level;

  const title = getLevelTitle(state.level);
  const levelTitleEls = [
    document.getElementById('levelDisplay'),
    document.getElementById('levelDisplayTop')
  ];
  levelTitleEls.forEach(el => {
    if (el) el.textContent = title;
  });

  const xpNeeded = state.level * 100;
  const xpProgress = state.xp % 100;
  const xpPercent = Math.max(0, Math.min(100, (xpProgress / 100) * 100));

  const xpFill = document.getElementById('xpFill');
  const xpText = document.getElementById('xpText');
  if (xpFill) xpFill.style.width = xpPercent + '%';
  if (xpText) xpText.textContent = xpProgress + ' / 100 XP';
}

function renderDaily() {
  const ul = document.getElementById('dailyList');
  const floatContainer = document.getElementById('floatingDailyContainer');
  if (ul) ul.innerHTML = '';
  if (floatContainer) floatContainer.innerHTML = '';

  const allSpells = getAllSpells();

  state.daily.forEach(id => {
    const sp = allSpells.find(s => s.id === id);
    if (!sp) return;

    if (ul) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="spell-name">${sp.name}</span>
        <div class="spell-desc">${sp.desc}</div>
        <span class="spell-reward">+${sp.reward} ✨ Mana</span>
        <button class="cast-button" data-cast="${sp.id}">⚡ Cast Spell</button>
      `;
      ul.appendChild(li);
    }

    if (floatContainer) {
      const card = document.createElement('div');
      card.className = 'floating-daily-card';
      card.innerHTML = `
        <div class="floating-daily-name">${sp.name}</div>
        <div class="floating-daily-reward">+${sp.reward} ✨</div>
        <button class="floating-daily-cast" data-cast="${sp.id}">Cast</button>
      `;
      floatContainer.appendChild(card);
    }
  });

  layoutFloatingSpells();
}

function layoutFloatingSpells() {
  const container = document.getElementById('floatingDailyContainer');
  if (!container) return;
  const cards = Array.from(container.children);
  const count = cards.length;
  if (!count) return;

  const radius = 110;

  cards.forEach((card, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    card.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px)`;
  });
}

function renderSpellCategory(category, elementId) {
  const ul = document.getElementById(elementId);
  if (!ul) return;
  ul.innerHTML = '';

  const queryEl = document.getElementById('spellSearch');
  const q = queryEl ? queryEl.value.trim().toLowerCase() : '';

  const spells = getAllSpells().filter(s => s.category === category);

  spells
    .filter(sp => {
      if (!q) return true;
      return sp.name.toLowerCase().includes(q) ||
             sp.desc.toLowerCase().includes(q);
    })
    .forEach(sp => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="spell-name">${sp.name}</span>
        <div class="spell-desc">${sp.desc}</div>
        <span class="spell-reward">+${sp.reward} ✨ Mana</span>
      `;
      ul.appendChild(li);
    });
}

function renderAllSpellCategories() {
  renderSpellCategory('body', 'bodySpells');
  renderSpellCategory('mind', 'mindSpells');
  renderSpellCategory('spirit', 'spiritSpells');
  renderSpellCategory('environment', 'environmentSpells');
}

function renderAchievements() {
  const grid = document.getElementById('achievementsList');
  if (!grid) return;
  grid.innerHTML = '';

  ACHIEVEMENTS.forEach(ach => {
    const div = document.createElement('div');
    div.className =
      'achievement' + (state.achievements.includes(ach.id) ? '' : ' locked');
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

  const rituals = getAllRituals();

  rituals.forEach(ritual => {
    if (!state.ritualProgress[ritual.id]) {
      state.ritualProgress[ritual.id] =
        new Array(ritual.steps.length).fill(false);
    }

    const progress = state.ritualProgress[ritual.id];
    const completed = progress.filter(s => s).length;
    const total = ritual.steps.length;

    const li = document.createElement('li');
    li.className = 'ritual-item';

    let stepsHtml = '<ul class="ritual-steps">';
    ritual.steps.forEach((step, idx) => {
      stepsHtml += `
        <li class="ritual-step ${progress[idx] ? 'completed' : ''}"
            data-ritual="${ritual.id}" data-step="${idx}">
          ${progress[idx] ? '✓' : '○'} ${step}
        </li>
      `;
    });
    stepsHtml += '</ul>';

    li.innerHTML = `
      <div class="ritual-title">${ritual.name}</div>
      <div class="ritual-desc">${ritual.desc}</div>
      <div style="margin: 10px 0; font-weight: bold; color: #6a0dad;">
        Progress: ${completed}/${total}
      </div>
      ${stepsHtml}
      <span class="spell-reward">Complete for +${ritual.reward} ✨ Mana</span>
    `;

    ul.appendChild(li);
  });
}

// ===================== DAILY GENERATION =====================

function generateDaily() {
  const allSpells = getAllSpells();
  if (!allSpells.length) return;
  state.daily = allSpells
    .slice()
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map(s => s.id);
  state.lastDay = today();
  save();
}

function updateStreakOnCast() {
  const t = today();

  if (state.lastDay === t) {
    // streak unchanged for same day
  } else if (state.lastDay) {
    const daysDiff =
      (new Date(t).getTime() - new Date(state.lastDay).getTime()) / 86400000;
    if (daysDiff <= 1.5) {
      state.streak++;
    } else {
      state.streak = 1;
    }
  } else {
    state.streak = 1;
  }

  state.lastDay = t;
}

// ===================== BOOK OPEN/CLOSE =====================

function openBook() {
  const pages = document.getElementById('bookPages');
  if (!pages) return;
  pages.classList.add('open');
  startAmbience();
}

function closeBook() {
  const pages = document.getElementById('bookPages');
  if (!pages) return;
  pages.classList.remove('open');
}

// ===================== CUSTOM SPELLS & RITUALS =====================

function setupCustomSpellUI() {
  const toggleBtn = document.getElementById('toggleCustomSpell');
  const card = document.getElementById('customSpellCard');
  const saveBtn = document.getElementById('saveCustomSpell');
  const nameEl = document.getElementById('customSpellName');
  const descEl = document.getElementById('customSpellDesc');
  const catEl = document.getElementById('customSpellCategory');
  const rewardEl = document.getElementById('customSpellReward');

  if (toggleBtn && card) {
    toggleBtn.addEventListener('click', () => {
      card.classList.toggle('hidden');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = (nameEl.value || '').trim();
      const desc = (descEl.value || '').trim();
      const category = catEl.value || 'body';
      let reward = parseInt(rewardEl.value, 10);
      if (!Number.isFinite(reward) || reward < 1) reward = 5;
      if (reward > 50) reward = 50;

      if (!name || !desc) {
        alert('Please give your spell a name and description.');
        return;
      }

      const id = 'custom_spell_' + Date.now();
      state.customSpells.push({id, name, desc, reward, category});
      save();

      nameEl.value = '';
      descEl.value = '';
      rewardEl.value = '8';
      card.classList.add('hidden');

      renderAllSpellCategories();
      renderDaily();
    });
  }
}

function setupCustomRitualUI() {
  const toggleBtn = document.getElementById('toggleCustomRitual');
  const card = document.getElementById('customRitualCard');
  const saveBtn = document.getElementById('saveCustomRitual');
  const nameEl = document.getElementById('customRitualName');
  const descEl = document.getElementById('customRitualDesc');
  const stepsEl = document.getElementById('customRitualSteps');
  const rewardEl = document.getElementById('customRitualReward');

  if (toggleBtn && card) {
    toggleBtn.addEventListener('click', () => {
      card.classList.toggle('hidden');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = (nameEl.value || '').trim();
      const desc = (descEl.value || '').trim();
      const steps = (stepsEl.value || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      let reward = parseInt(rewardEl.value, 10);
      if (!Number.isFinite(reward) || reward < 5) reward = 20;
      if (reward > 100) reward = 100;

      if (!name || !steps.length) {
        alert('Please give your ritual a name and at least one step.');
        return;
      }

      const id = 'custom_ritual_' + Date.now();
      state.customRituals.push({id, name, desc, steps, reward});
      save();

      nameEl.value = '';
      descEl.value = '';
      stepsEl.value = '';
      rewardEl.value = '30';
      card.classList.add('hidden');

      renderRituals();
      renderAchievements();
    });
  }
}

// ===================== EVENTS =====================

document.addEventListener('click', e => {
  // Casting spells (daily list & floating)
  const castId = e.target.dataset.cast;
  if (castId) {
    const allSpells = getAllSpells();
    const sp = allSpells.find(s => s.id === castId);
    if (!sp) return;

    state.mana += sp.reward;
    state.xp += sp.reward;
    state.totalCasts++;

    if (!state.categoriesCast.includes(sp.category)) {
      state.categoriesCast.push(sp.category);
    }

    updateStreakOnCast();

    const oldLevel = state.level;
    state.level = calculateLevel(state.xp);
    const newAchievements = checkAchievements();

    save();
    renderHeader();
    renderAchievements();
    showSpellEffect(sp.reward);

    if (state.level > oldLevel) {
      alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
    }

    if (newAchievements.length > 0) {
      newAchievements.forEach(ach => {
        setTimeout(() => {
          alert(`🏆 Achievement Unlocked: ${ach.name} - ${ach.desc}`);
        }, 150);
      });
    }
  }

  // New spread
  if (e.target.id === 'newSpread') {
    generateDaily();
    renderDaily();
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
  }

  // Ritual step toggling
  if (e.target.classList.contains('ritual-step')) {
    const ritualId = e.target.dataset.ritual;
    const stepIdx = parseInt(e.target.dataset.step, 10);
    if (!ritualId || Number.isNaN(stepIdx)) return;

    state.ritualProgress[ritualId][stepIdx] =
      !state.ritualProgress[ritualId][stepIdx];

    const rituals = getAllRituals();
    const ritual = rituals.find(r => r.id === ritualId);
    const allComplete = state.ritualProgress[ritualId].every(s => s);

    if (ritual && allComplete) {
      state.mana += ritual.reward;
      state.xp += ritual.reward;
      state.totalCasts++;

      const oldLevel = state.level;
      state.level = calculateLevel(state.xp);

      const newAchievements = checkAchievements();

      showSpellEffect(ritual.reward);
      alert(`🎊 Ritual Complete! You gained ${ritual.reward} mana!`);

      if (state.level > oldLevel) {
        alert(`🎉 Level Up! You are now ${getLevelTitle(state.level)} (Level ${state.level})!`);
      }

      state.ritualProgress[ritualId] =
        new Array(ritual.steps.length).fill(false);
    }

    save();
    renderHeader();
    renderRituals();
    renderAchievements();
  }
});

// Book open/close
document.addEventListener('DOMContentLoaded', () => {
  const cover = document.getElementById('bookCover');
  const closeBtn = document.getElementById('closeBook');

  if (cover) cover.addEventListener('click', openBook);
  if (closeBtn) closeBtn.addEventListener('click', closeBook);
});

// Spell search
document.addEventListener('DOMContentLoaded', () => {
  const search = document.getElementById('spellSearch');
  const clearBtn = document.getElementById('clearSpellSearch');

  if (search) {
    search.addEventListener('input', () => {
      renderAllSpellCategories();
    });
  }

  if (clearBtn && search) {
    clearBtn.addEventListener('click', () => {
      search.value = '';
      renderAllSpellCategories();
    });
  }
});

// ===================== PARTICLES =====================

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    container.appendChild(p);
  }
}

// ===================== INIT =====================

load();

if (state.lastDay !== today()) {
  generateDaily();
  if (
    state.lastDay &&
    new Date(today()).getTime() - new Date(state.lastDay).getTime() >
      86400000 * 1.5
  ) {
    state.streak = 0;
  }
}

createParticles();
renderHeader();
renderDaily();
renderAllSpellCategories();
renderAchievements();
renderRituals();
setupCustomSpellUI();
setupCustomRitualUI();
