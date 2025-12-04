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
  {id:'first_cast',name:'First Spell',desc:'Cast your first spell',icon:'✨',unlocked:false},
  {id:'streak_3',name:'Dedicated',desc:'3 day streak',icon:'🔥',unlocked:false},
  {id:'streak_7',name:'Committed',desc:'7 day streak',icon:'⚡',unlocked:false},
  {id:'streak_30',name:'Master',desc:'30 day streak',icon:'👑',unlocked:false},
  {id:'casts_10',name:'Apprentice',desc:'Cast 10 spells',icon:'🎓',unlocked:false},
  {id:'casts_50',name:'Adept',desc:'Cast 50 spells',icon:'🔮',unlocked:false},
  {id:'casts_100',name:'Wizard',desc:'Cast 100 spells',icon:'🧙',unlocked:false},
  {id:'all_categories',name:'Versatile',desc:'Cast spells from all categories',icon:'🌟',unlocked:false},
  {id:'ritual_complete',name:'Ritualist',desc:'Complete your first ritual',icon:'🕯️',unlocked:false}
];

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
  favorites: [],
  customSpells: [],
  customRituals: []
};

/* === Helpers for combined data === */

function getAllSpells() {
  return [
    ...SPELLS.body,
    ...SPELLS.mind,
    ...SPELLS.spirit,
    ...SPELLS.environment,
    ...state.customSpells
  ];
}

function getSpellsByCategory(category) {
  const base = SPELLS[category] || [];
  const custom = state.customSpells.filter(s => s.category === category);
  return [...base, ...custom];
}

function getAllRituals() {
  return [...RITUALS_BASE, ...state.customRituals];
}

/* === Utility === */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function save() {
  localStorage.setItem('grimoireOS', JSON.stringify(state));
}

function load() {
  let s = localStorage.getItem('grimoireOS');
  if (s) {
    state = JSON.parse(s);
    if (!state.achievements) state.achievements = [];
    if (!state.level) state.level = 1;
    if (!state.xp) state.xp = 0;
    if (!state.ritualProgress) state.ritualProgress = {};
    if (!state.categoriesCast) state.categoriesCast = [];
    if (!state.favorites) state.favorites = [];
    if (!state.customSpells) state.customSpells = [];
    if (!state.customRituals) state.customRituals = [];
  }
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

/* === Achievements === */

function checkAchievements() {
  let newUnlocks = [];
  
  ACHIEVEMENTS.forEach(ach => {
    if (state.achievements.includes(ach.id)) return;
    
    let unlock = false;
    
    switch(ach.id) {
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

/* === Spell-cast UI effect (popup + canvas) === */

let spellCanvas = null;
let spellCtx = null;
let spellParticles = [];
let spellAnimating = false;

function initSpellCanvas() {
  spellCanvas = document.getElementById('spellCanvas');
  if (!spellCanvas) return;
  spellCtx = spellCanvas.getContext('2d');
  resizeSpellCanvas();
  window.addEventListener('resize', resizeSpellCanvas);
}

function resizeSpellCanvas() {
  if (!spellCanvas || !spellCtx) return;
  spellCanvas.width = window.innerWidth;
  spellCanvas.height = window.innerHeight;
}

function triggerSpellCanvas(mana) {
  if (!spellCanvas || !spellCtx) return;

  const count = 30 + Math.min(40, Math.floor(mana / 2));
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    const isGold = Math.random() < 0.5;
    spellParticles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 40 + Math.random() * 20,
      radius: 2 + Math.random() * 3,
      type: isGold ? 'gold' : 'arcane'
    });
  }

  if (!spellAnimating) {
    spellAnimating = true;
    spellCanvas.classList.add('active');
    requestAnimationFrame(animateSpellCanvas);
  }
}

function animateSpellCanvas() {
  if (!spellCanvas || !spellCtx) return;

  spellCtx.clearRect(0, 0, spellCanvas.width, spellCanvas.height);

  spellParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
  });

  spellParticles = spellParticles.filter(p => p.life < p.maxLife);

  spellParticles.forEach(p => {
    const alpha = 1 - p.life / p.maxLife;
    spellCtx.beginPath();
    spellCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    if (p.type === 'gold') {
      spellCtx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    } else {
      spellCtx.fillStyle = `rgba(138, 43, 226, ${alpha})`;
    }
    spellCtx.fill();
  });

  if (spellParticles.length > 0) {
    requestAnimationFrame(animateSpellCanvas);
  } else {
    spellAnimating = false;
    spellCanvas.classList.remove('active');
    spellCtx.clearRect(0, 0, spellCanvas.width, spellCanvas.height);
  }
}

function showSpellEffect(mana) {
  const effect = document.getElementById('spellEffect');
  const manaText = document.getElementById('effectMana');
  
  manaText.textContent = mana;
  effect.classList.add('active');
  triggerSpellCanvas(mana);
  
  setTimeout(() => {
    effect.classList.remove('active');
  }, 600);
}

/* === State init === */

load();

function generateDaily() {
  const allSpells = getAllSpells();
  if (allSpells.length === 0) return;
  state.daily = allSpells
    .slice()
    .sort(() => 0.5 - Math.random())
    .slice(0, 5)
    .map(s => s.id);
  state.lastDay = today();
  save();
}

if (state.lastDay !== today()) {
  generateDaily();
  if (state.lastDay && new Date(today()).getTime() - new Date(state.lastDay).getTime() > 86400000 * 1.5) {
    state.streak = 0;
  }
}

/* === Render functions === */

function renderHeader() {
  document.getElementById('manaDisplay').textContent = state.mana;
  document.getElementById('totalCasts').textContent = state.totalCasts;
  document.getElementById('streak').textContent = state.streak;
  document.getElementById('level').textContent = state.level;
  document.getElementById('levelDisplay').textContent = getLevelTitle(state.level);
  
  const xpProgress = state.xp % 100;
  const xpPercent = (xpProgress / 100) * 100;
  
  document.getElementById('xpFill').style.width = xpPercent + '%';
  document.getElementById('xpText').textContent = xpProgress + ' / 100 XP';
}

function renderDaily() {
  const ul = document.getElementById('dailyList');
  ul.innerHTML = '';
  
  const allSpells = getAllSpells();
  
  state.daily.forEach(id => {
    const sp = allSpells.find(s => s.id === id);
    if (!sp) return;
    
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="spell-name">${sp.name}</span>
      <div class="spell-desc">${sp.desc}</div>
      <span class="spell-reward">+${sp.reward} ✨ Mana</span>
      <button class="cast-button" data-cast="${id}">⚡ Cast Spell</button>
    `;
    ul.appendChild(li);
  });
}

function renderSpellCategory(category, elementId) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = '';
  
  const spells = getSpellsByCategory(category);
  spells.forEach(sp => {
    const li = document.createElement('li');
    const isFav = state.favorites.includes(sp.id);
    li.innerHTML = `
      <span class="spell-name">${sp.name}</span>
      <div class="spell-desc">${sp.desc}</div>
      <span class="spell-reward">+${sp.reward} ✨ Mana</span>
      <div class="spell-actions">
        <button class="cast-button small" data-cast="${sp.id}">⚡ Quick Cast</button>
        <button class="secondary-button small" data-add-daily="${sp.id}">➕ Add to Daily</button>
        <button class="icon-button favorite-button ${isFav ? 'active' : ''}" data-fav="${sp.id}">
          ${isFav ? '★ Favourited' : '☆ Favourite'}
        </button>
      </div>
    `;
    ul.appendChild(li);
  });
}

function renderAchievements() {
  const grid = document.getElementById('achievementsList');
  grid.innerHTML = '';
  
  ACHIEVEMENTS.forEach(ach => {
    const div = document.createElement('div');
    div.className = 'achievement' + (state.achievements.includes(ach.id) ? '' : ' locked');
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
  ul.innerHTML = '';
  
  const rituals = getAllRituals();
  rituals.forEach(ritual => {
    const li = document.createElement('li');
    li.className = 'ritual-item';
    
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

/* === Spell search === */

function filterSpellLibrary(term) {
  const query = term.trim().toLowerCase();
  const items = document.querySelectorAll('#spells .spell-list li');
  items.forEach(li => {
    if (!query) {
      li.style.display = '';
      return;
    }
    const text = li.textContent.toLowerCase();
    li.style.display = text.includes(query) ? '' : 'none';
  });
}

function initSpellSearch() {
  const input = document.getElementById('spellSearch');
  const clearBtn = document.getElementById('clearSearch');
  if (!input) return;

  input.addEventListener('input', () => {
    filterSpellLibrary(input.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      filterSpellLibrary('');
    });
  }
}

/* === Custom spell & ritual forms === */

function toggleElement(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('hidden');
}

function initCustomSpellForm() {
  const toggleBtn = document.getElementById('toggleCustomSpell');
  const saveBtn = document.getElementById('saveCustomSpell');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleElement('customSpellCard'));
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('customSpellName');
      const descEl = document.getElementById('customSpellDesc');
      const rewardEl = document.getElementById('customSpellReward');
      const categoryEl = document.getElementById('customSpellCategory');

      const name = nameEl.value.trim();
      const desc = descEl.value.trim();
      const reward = Math.max(1, Math.min(50, parseInt(rewardEl.value || '8', 10)));
      const category = categoryEl.value;

      if (!name || !desc || !category) {
        alert('Please fill in name, description, and category for your spell.');
        return;
      }

      const id = 'cspell_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      state.customSpells.push({
        id,
        name,
        desc,
        reward,
        category
      });

      save();
      renderSpellCategory('body', 'bodySpells');
      renderSpellCategory('mind', 'mindSpells');
      renderSpellCategory('spirit', 'spiritSpells');
      renderSpellCategory('environment', 'environmentSpells');

      nameEl.value = '';
      descEl.value = '';
      rewardEl.value = '8';
      categoryEl.value = 'body';

      alert('✨ Custom spell added to your Tome!');
    });
  }
}

function initCustomRitualForm() {
  const toggleBtn = document.getElementById('toggleCustomRitual');
  const saveBtn = document.getElementById('saveCustomRitual');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => toggleElement('customRitualCard'));
  }
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const nameEl = document.getElementById('customRitualName');
      const descEl = document.getElementById('customRitualDesc');
      const stepsEl = document.getElementById('customRitualSteps');
      const rewardEl = document.getElementById('customRitualReward');

      const name = nameEl.value.trim();
      const desc = descEl.value.trim();
      const reward = Math.max(5, Math.min(100, parseInt(rewardEl.value || '35', 10)));

      const steps = stepsEl.value
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (!name || !desc || steps.length === 0) {
        alert('Please add a name, description, and at least one step for your ritual.');
        return;
      }

      const id = 'crit_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      state.customRituals.push({
        id,
        name,
        desc,
        steps,
        reward
      });

      save();
      renderRituals();

      nameEl.value = '';
      descEl.value = '';
      stepsEl.value = '';
      rewardEl.value = '35';

      alert('🕯️ Custom ritual added to your Tome!');
    });
  }
}

/* === Global click handlers === */

document.addEventListener('click', e => {
  // Spell cast (daily + library quick cast)
  if (e.target.dataset.cast) {
    const id = e.target.dataset.cast;
    const allSpells = getAllSpells();
    const sp = allSpells.find(s => s.id === id);
    
    if (!sp) return;
    
    state.mana += sp.reward;
    state.xp += sp.reward;
    state.totalCasts++;
    
    if (!state.categoriesCast.includes(sp.category)) {
      state.categoriesCast.push(sp.category);
    }
    
    if (state.lastDay === today()) {
      // same day, streak continues
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
    renderAchievements();
    showSpellEffect(sp.reward);
    
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
  
  // Generate new daily spread
  if (e.target.id === 'newSpread') {
    generateDaily();
    renderDaily();
  }

  // Add a library spell into today's daily list
  if (e.target.dataset.addDaily) {
    const id = e.target.dataset.addDaily;
    if (!state.daily.includes(id)) {
      state.daily.push(id);
    }
    state.daily = [...new Set(state.daily)];
    state.lastDay = today();
    save();
    renderDaily();

    e.target.textContent = 'Added to Daily';
    e.target.classList.add('disabled');
    e.target.disabled = true;
  }

  // Toggle favourites
  if (e.target.dataset.fav) {
    const id = e.target.dataset.fav;
    const idx = state.favorites.indexOf(id);
    if (idx === -1) {
      state.favorites.push(id);
      e.target.classList.add('active');
      e.target.textContent = '★ Favourited';
    } else {
      state.favorites.splice(idx, 1);
      e.target.classList.remove('active');
      e.target.textContent = '☆ Favourite';
    }
    save();
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
  
  // Ritual step toggle
  if (e.target.classList.contains('ritual-step')) {
    const ritualId = e.target.dataset.ritual;
    const stepIdx = parseInt(e.target.dataset.step, 10);
    
    state.ritualProgress[ritualId][stepIdx] = !state.ritualProgress[ritualId][stepIdx];
    
    const rituals = getAllRituals();
    const ritual = rituals.find(r => r.id === ritualId);
    if (!ritual) return;

    const allComplete = state.ritualProgress[ritualId].every(s => s);
    
    if (allComplete) {
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
    }
    
    save();
    renderHeader();
    renderRituals();
    renderAchievements();
  }
});

/* === Book opening === */

function openBook() {
  const cover = document.getElementById('bookCover');
  const pages = document.getElementById('bookPages');
  
  cover.classList.add('open');
  setTimeout(() => {
    cover.style.display = 'none';
    pages.classList.add('open');
  }, 600);
}

document.getElementById('bookCover').addEventListener('click', openBook);

/* === Background particles === */

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    container.appendChild(particle);
  }
}

/* === Init === */

initSpellCanvas();
createParticles();
renderHeader();
renderDaily();
renderSpellCategory('body', 'bodySpells');
renderSpellCategory('mind', 'mindSpells');
renderSpellCategory('spirit', 'spiritSpells');
renderSpellCategory('environment', 'environmentSpells');
renderAchievements();
renderRituals();
initSpellSearch();
initCustomSpellForm();
initCustomRitualForm();
