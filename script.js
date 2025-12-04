// =============== STATE ===============
let state = {
  mana: 0,
  level: 1,
  xp: 0,
  streak: 0,
  totalCasts: 0,
  lastCompletionDate: null,
  dailySpells: [],
  completedDailyIds: [],
  allSpells: [],
  rituals: [],
  achievements: []
};

// =============== SPELL LIBRARY ===============
const defaultSpells = [
  // Body
  { id: 'body1', name: 'Morning Stretch', category: 'body', reward: 5, desc: '5 minutes of gentle stretching' },
  { id: 'body2', name: 'Hydration Ritual', category: 'body', reward: 3, desc: 'Drink a full glass of water' },
  { id: 'body3', name: 'Healthy Meal', category: 'body', reward: 8, desc: 'Prepare and eat a nutritious meal' },
  { id: 'body4', name: 'Walk in Nature', category: 'body', reward: 10, desc: 'Take a 20-minute walk outdoors' },
  { id: 'body5', name: 'Exercise Session', category: 'body', reward: 15, desc: 'Complete a 30-minute workout' },
  { id: 'body6', name: 'Deep Breathing', category: 'body', reward: 5, desc: '10 deep breaths with intention' },
  
  // Mind
  { id: 'mind1', name: 'Reading Time', category: 'mind', reward: 10, desc: 'Read for 20 minutes' },
  { id: 'mind2', name: 'Learning Quest', category: 'mind', reward: 12, desc: 'Learn something new today' },
  { id: 'mind3', name: 'Creative Work', category: 'mind', reward: 15, desc: 'Work on a creative project' },
  { id: 'mind4', name: 'Puzzle Solving', category: 'mind', reward: 8, desc: 'Complete a puzzle or brain game' },
  { id: 'mind5', name: 'Journal Entry', category: 'mind', reward: 7, desc: 'Write in your journal' },
  { id: 'mind6', name: 'Skill Practice', category: 'mind', reward: 12, desc: 'Practice a skill for 30 minutes' },
  
  // Spirit
  { id: 'spirit1', name: 'Meditation', category: 'spirit', reward: 10, desc: 'Meditate for 10 minutes' },
  { id: 'spirit2', name: 'Gratitude Practice', category: 'spirit', reward: 7, desc: 'List 3 things you\'re grateful for' },
  { id: 'spirit3', name: 'Acts of Kindness', category: 'spirit', reward: 12, desc: 'Do something kind for someone' },
  { id: 'spirit4', name: 'Mindful Moment', category: 'spirit', reward: 5, desc: 'Take 5 minutes to be present' },
  { id: 'spirit5', name: 'Connection', category: 'spirit', reward: 10, desc: 'Have a meaningful conversation' },
  { id: 'spirit6', name: 'Self-Reflection', category: 'spirit', reward: 8, desc: 'Reflect on your day and growth' },
  
  // Environment
  { id: 'env1', name: 'Tidy Space', category: 'environment', reward: 8, desc: 'Clean and organize your workspace' },
  { id: 'env2', name: 'Fresh Air', category: 'environment', reward: 5, desc: 'Open windows and air out your space' },
  { id: 'env3', name: 'Plant Care', category: 'environment', reward: 6, desc: 'Water and care for your plants' },
  { id: 'env4', name: 'Declutter', category: 'environment', reward: 10, desc: 'Remove 5 items you don\'t need' },
  { id: 'env5', name: 'Sacred Space', category: 'environment', reward: 12, desc: 'Create a calming corner in your home' },
  { id: 'env6', name: 'Deep Clean', category: 'environment', reward: 15, desc: 'Thoroughly clean one room' }
];

const defaultRituals = [
  {
    id: 'ritual1',
    name: 'Morning Awakening Ceremony',
    reward: 25,
    steps: ['Make your bed', 'Drink water with lemon', 'Stretch for 5 minutes', 'Set intentions for the day', 'Meditate for 10 minutes'],
    completed: []
  },
  {
    id: 'ritual2',
    name: 'Evening Wind Down',
    reward: 20,
    steps: ['Dim the lights', 'Reflect on your day', 'Write in gratitude journal', 'Gentle yoga or stretching', 'Prepare for tomorrow'],
    completed: []
  },
  {
    id: 'ritual3',
    name: 'Weekly Reset',
    reward: 40,
    steps: ['Review your week', 'Clean your living space', 'Meal prep for the week', 'Plan goals for next week', 'Self-care activity of choice'],
    completed: []
  }
];

const achievements = [
  { id: 'ach1', name: 'First Cast', icon: '✨', desc: 'Cast your first spell', unlocked: false, check: s => s.totalCasts >= 1 },
  { id: 'ach2', name: 'Apprentice', icon: '🎓', desc: 'Reach level 3', unlocked: false, check: s => s.level >= 3 },
  { id: 'ach3', name: 'Dedicated', icon: '🔥', desc: '7 day streak', unlocked: false, check: s => s.streak >= 7 },
  { id: 'ach4', name: 'Adept', icon: '⚡', desc: '50 total casts', unlocked: false, check: s => s.totalCasts >= 50 },
  { id: 'ach5', name: 'Master', icon: '🎖️', desc: 'Reach level 10', unlocked: false, check: s => s.level >= 10 },
  { id: 'ach6', name: 'Persistent', icon: '💪', desc: '30 day streak', unlocked: false, check: s => s.streak >= 30 },
  { id: 'ach7', name: 'Mana Collector', icon: '💎', desc: 'Earn 500 total mana', unlocked: false, check: s => s.mana >= 500 },
  { id: 'ach8', name: 'Ritualist', icon: '🌙', desc: 'Complete 5 rituals', unlocked: false, check: s => s.rituals.filter(r => r.completedCount >= 1).length >= 5 }
];

// =============== INITIALIZATION ===============
function init() {
  loadState();
  initParticles();
  drawNewDailySpread();
  updateAllDisplays();
  setupEventListeners();
  checkAchievements();
}

function loadState() {
  const saved = localStorage.getItem('tomeState');
  if (saved) {
    const parsed = JSON.parse(saved);
    state = { ...state, ...parsed };
    
    // Check if it's a new day
    const today = new Date().toDateString();
    if (state.lastCompletionDate !== today) {
      // Reset daily spells
      state.completedDailyIds = [];
      // Check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (state.lastCompletionDate === yesterday.toDateString()) {
        // Streak continues
      } else if (state.lastCompletionDate) {
        // Streak broken
        state.streak = 0;
      }
    }
  } else {
    // First time - initialize with defaults
    state.allSpells = [...defaultSpells];
    state.rituals = JSON.parse(JSON.stringify(defaultRituals));
    state.achievements = JSON.parse(JSON.stringify(achievements));
  }
}

function saveState() {
  localStorage.setItem('tomeState', JSON.stringify(state));
}

// =============== DAILY SPELLS ===============
function drawNewDailySpread() {
  const availableSpells = state.allSpells.filter(s => !state.completedDailyIds.includes(s.id));
  
  if (availableSpells.length < 6) {
    // Reset if not enough spells
    state.completedDailyIds = [];
  }
  
  const shuffled = [...state.allSpells].sort(() => Math.random() - 0.5);
  state.dailySpells = shuffled.slice(0, 6);
  
  renderDailySpells();
  renderOrbitSpells();
  saveState();
}

function renderDailySpells() {
  const container = document.getElementById('dailyList');
  container.innerHTML = '';
  
  state.dailySpells.forEach(spell => {
    const completed = state.completedDailyIds.includes(spell.id);
    const li = document.createElement('li');
    li.className = `spell-item ${completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <div class="spell-info">
        <div class="spell-name">${spell.name}</div>
        <div class="spell-desc">${spell.desc}</div>
        <div class="spell-reward">+${spell.reward} ✨ Mana</div>
      </div>
      <div class="spell-actions">
        <button class="cast-button" onclick="castSpell('${spell.id}')" ${completed ? 'disabled' : ''}>
          ${completed ? '✓ Complete' : '⚡ Cast'}
        </button>
      </div>
    `;
    
    container.appendChild(li);
  });
}

function renderOrbitSpells() {
  const container = document.getElementById('orbitDailyContainer');
  container.innerHTML = '';
  
  const radius = 170;
  const angleStep = (2 * Math.PI) / state.dailySpells.length;
  
  state.dailySpells.forEach((spell, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    const completed = state.completedDailyIds.includes(spell.id);
    
    const div = document.createElement('div');
    div.className = `orbit-spell ${completed ? 'completed' : ''}`;
    div.style.left = `calc(50% + ${x}px)`;
    div.style.top = `calc(50% + ${y}px)`;
    div.style.animationDelay = `${index * 0.5}s`;
    
    div.innerHTML = `
      <div class="orbit-spell-name">${spell.name}</div>
      <div class="orbit-spell-reward">+${spell.reward} ✨</div>
    `;
    
    div.onclick = () => {
      if (!completed) {
        castSpell(spell.id);
      }
    };
    
    container.appendChild(div);
  });
}

function castSpell(spellId) {
  if (state.completedDailyIds.includes(spellId)) return;
  
  const spell = state.allSpells.find(s => s.id === spellId);
  if (!spell) return;
  
  // Add mana and XP
  state.mana += spell.reward;
  state.xp += spell.reward;
  state.totalCasts++;
  state.completedDailyIds.push(spellId);
  
  // Update streak
  const today = new Date().toDateString();
  if (state.lastCompletionDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (state.lastCompletionDate === yesterday.toDateString()) {
      state.streak++;
    } else {
      state.streak = 1;
    }
    state.lastCompletionDate = today;
  }
  
  // Check level up
  checkLevelUp();
  
  // Show effect
  showSpellEffect(spell.reward);
  
  // Update displays
  updateAllDisplays();
  checkAchievements();
  saveState();
}

function checkLevelUp() {
  const xpNeeded = state.level * 100;
  if (state.xp >= xpNeeded) {
    state.xp -= xpNeeded;
    state.level++;
    showLevelUpEffect();
  }
}

function showSpellEffect(mana) {
  const effect = document.getElementById('spellEffect');
  const manaText = document.getElementById('effectMana');
  
  manaText.textContent = mana;
  effect.classList.add('active');
  
  // Particle burst
  createParticleBurst();
  
  setTimeout(() => {
    effect.classList.remove('active');
  }, 1000);
}

function showLevelUpEffect() {
  // Could add a special level-up animation here
  alert(`🎉 Level Up! You are now Level ${state.level}!`);
}

function createParticleBurst() {
  const canvas = document.getElementById('spellCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1
    });
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let alive = false;
    particles.forEach(p => {
      if (p.life > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        
        ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    if (alive) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  animate();
}

// =============== SPELL LIBRARY ===============
function renderSpellLibrary() {
  const categories = ['body', 'mind', 'spirit', 'environment'];
  
  categories.forEach(cat => {
    const spells = state.allSpells.filter(s => s.category === cat);
    const container = document.getElementById(`${cat}Spells`);
    const countEl = document.getElementById(`${cat}Count`);
    
    countEl.textContent = `(${spells.length})`;
    container.innerHTML = '';
    
    spells.forEach(spell => {
      const li = document.createElement('li');
      li.className = 'spell-item';
      li.dataset.spellId = spell.id;
      
      const isCustom = !defaultSpells.find(s => s.id === spell.id);
      
      li.innerHTML = `
        <div class="spell-info">
          <div class="spell-name">${spell.name}</div>
          <div class="spell-desc">${spell.desc}</div>
          <div class="spell-reward">+${spell.reward} ✨ Mana</div>
        </div>
        <div class="spell-actions">
          ${isCustom ? `<button class="delete-button" onclick="deleteSpell('${spell.id}')">🗑️ Delete</button>` : ''}
        </div>
      `;
      
      container.appendChild(li);
    });
  });
}

function filterSpells(category) {
  const categories = document.querySelectorAll('.spell-category');
  
  if (category === 'all') {
    categories.forEach(cat => cat.style.display = 'block');
  } else {
    categories.forEach(cat => {
      const catName = cat.querySelector('.spell-list').id.replace('Spells', '');
      cat.style.display = catName === category ? 'block' : 'none';
    });
  }
}

function searchSpells(query) {
  const items = document.querySelectorAll('.spell-category .spell-item');
  const lowerQuery = query.toLowerCase();
  
  items.forEach(item => {
    const name = item.querySelector('.spell-name').textContent.toLowerCase();
    const desc = item.querySelector('.spell-desc').textContent.toLowerCase();
    
    if (name.includes(lowerQuery) || desc.includes(lowerQuery)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function addCustomSpell(e) {
  e.preventDefault();
  
  const name = document.getElementById('customSpellName').value;
  const reward = parseInt(document.getElementById('customSpellReward').value);
  const category = document.getElementById('customSpellCategory').value;
  const desc = document.getElementById('customSpellDesc').value;
  
  const newSpell = {
    id: 'custom_' + Date.now(),
    name,
    category,
    reward,
    desc
  };
  
  state.allSpells.push(newSpell);
  renderSpellLibrary();
  saveState();
  
  e.target.reset();
  alert(`✨ Spell "${name}" has been added to your library!`);
}

function deleteSpell(spellId) {
  if (!confirm('Are you sure you want to delete this spell?')) return;
  
  state.allSpells = state.allSpells.filter(s => s.id !== spellId);
  renderSpellLibrary();
  saveState();
}

// =============== RITUALS ===============
function renderRituals() {
  const container = document.getElementById('ritualsList');
  container.innerHTML = '';
  
  state.rituals.forEach(ritual => {
    const li = document.createElement('li');
    li.className = 'ritual-item';
    
    const stepsHtml = ritual.steps.map((step, i) => `
      <li class="ritual-step ${ritual.completed.includes(i) ? 'completed' : ''}">
        <input 
          type="checkbox" 
          class="step-checkbox" 
          ${ritual.completed.includes(i) ? 'checked' : ''}
          onchange="toggleRitualStep('${ritual.id}', ${i})"
        />
        <span class="step-text">${step}</span>
      </li>
    `).join('');
    
    const allComplete = ritual.completed.length === ritual.steps.length;
    const isCustom = !defaultRituals.find(r => r.id === ritual.id);
    
    li.innerHTML = `
      <div class="ritual-header">
        <div class="ritual-name">${ritual.name}</div>
        <div class="ritual-reward">+${ritual.reward} ✨</div>
      </div>
      <ul class="ritual-steps">
        ${stepsHtml}
      </ul>
      <div class="ritual-actions">
        ${isCustom ? `<button class="delete-button" onclick="deleteRitual('${ritual.id}')">🗑️ Delete</button>` : ''}
        <button 
          class="complete-ritual-button" 
          onclick="completeRitual('${ritual.id}')"
          ${!allComplete ? 'disabled' : ''}
        >
          ${allComplete ? '✨ Complete Ritual' : '⏳ Incomplete'}
        </button>
      </div>
    `;
    
    container.appendChild(li);
  });
}

function toggleRitualStep(ritualId, stepIndex) {
  const ritual = state.rituals.find(r => r.id === ritualId);
  if (!ritual) return;
  
  if (ritual.completed.includes(stepIndex)) {
    ritual.completed = ritual.completed.filter(i => i !== stepIndex);
  } else {
    ritual.completed.push(stepIndex);
  }
  
  renderRituals();
  saveState();
}

function completeRitual(ritualId) {
  const ritual = state.rituals.find(r => r.id === ritualId);
  if (!ritual) return;
  
  if (ritual.completed.length !== ritual.steps.length) {
    alert('Please complete all steps first!');
    return;
  }
  
  // Award mana
  state.mana += ritual.reward;
  state.xp += ritual.reward;
  state.totalCasts++;
  ritual.completedCount = (ritual.completedCount || 0) + 1;
  
  // Reset steps
  ritual.completed = [];
  
  // Check level up
  checkLevelUp();
  
  // Show effect
  showSpellEffect(ritual.reward);
  
  // Update displays
  updateAllDisplays();
  checkAchievements();
  saveState();
}

function addCustomRitual(e) {
  e.preventDefault();
  
  const name = document.getElementById('customRitualName').value;
  const reward = parseInt(document.getElementById('customRitualReward').value);
  const stepsText = document.getElementById('customRitualSteps').value;
  const steps = stepsText.split('\n').filter(s => s.trim());
  
  const newRitual = {
    id: 'custom_ritual_' + Date.now(),
    name,
    reward,
    steps,
    completed: [],
    completedCount: 0
  };
  
    state.rituals.push(newRitual);
  renderRituals();
  saveState();
  
  e.target.reset();
  alert(`🌙 Ritual "${name}" has been added to your grimoire!`);
}

function deleteRitual(ritualId) {
  if (!confirm('Are you sure you want to delete this ritual?')) return;
  
  state.rituals = state.rituals.filter(r => r.id !== ritualId);
  renderRituals();
  saveState();
}

// =============== STATS & ACHIEVEMENTS ===============
function renderStats() {
  document.getElementById('streak').textContent = state.streak;
  document.getElementById('totalCasts').textContent = state.totalCasts;
  document.getElementById('levelStat').textContent = state.level;
  
  // XP Bar
  const xpNeeded = state.level * 100;
  const xpPercent = (state.xp / xpNeeded) * 100;
  document.getElementById('xpFill').style.width = xpPercent + '%';
  document.getElementById('xpText').textContent = `${state.xp} / ${xpNeeded} XP`;
}

function renderAchievements() {
  const container = document.getElementById('achievementsList');
  container.innerHTML = '';
  
  state.achievements.forEach(ach => {
    const div = document.createElement('div');
    div.className = `achievement-item ${ach.unlocked ? '' : 'locked'}`;
    
    div.innerHTML = `
      <div class="achievement-icon">${ach.unlocked ? ach.icon : '🔒'}</div>
      <div class="achievement-name">${ach.name}</div>
      <div class="achievement-desc">${ach.desc}</div>
    `;
    
    container.appendChild(div);
  });
}

function checkAchievements() {
  let newUnlocks = [];
  
  state.achievements.forEach(ach => {
    if (!ach.unlocked && ach.check(state)) {
      ach.unlocked = true;
      newUnlocks.push(ach);
    }
  });
  
  if (newUnlocks.length > 0) {
    renderAchievements();
    newUnlocks.forEach(ach => {
      setTimeout(() => {
        alert(`🏆 Achievement Unlocked!\n\n${ach.icon} ${ach.name}\n${ach.desc}`);
      }, 500);
    });
  }
}

// =============== LEVEL SYSTEM ===============
function getLevelTitle(level) {
  if (level < 3) return 'Novice';
  if (level < 5) return 'Apprentice';
  if (level < 8) return 'Adept';
  if (level < 12) return 'Expert';
  if (level < 15) return 'Master';
  if (level < 20) return 'Grandmaster';
  return 'Archmage';
}

// =============== UI UPDATES ===============
function updateAllDisplays() {
  // Update mana displays
  document.getElementById('manaDisplay').textContent = state.mana;
  document.getElementById('homeManaDisplay').textContent = state.mana;
  
  // Update level displays
  const levelTitle = getLevelTitle(state.level);
  document.getElementById('levelDisplay').textContent = levelTitle;
  document.getElementById('level').textContent = state.level;
  document.getElementById('homeLevelTitle').textContent = levelTitle;
  document.getElementById('homeLevelNumber').textContent = state.level;
  
  // Update home stats
  document.getElementById('homeStreak').textContent = state.streak;
  document.getElementById('homeCasts').textContent = state.totalCasts;
  document.getElementById('homeAchievements').textContent = state.achievements.filter(a => a.unlocked).length;
  
  // Re-render spell lists
  renderDailySpells();
  renderOrbitSpells();
  renderSpellLibrary();
  renderRituals();
  renderStats();
  renderAchievements();
}

// =============== BOOK NAVIGATION ===============
function openBook() {
  document.getElementById('bookPages').classList.add('open');
}

function closeBook() {
  document.getElementById('bookPages').classList.remove('open');
}

function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.spell-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update views
  document.querySelectorAll('.spell-view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(tabName).classList.add('active');
}

// =============== EVENT LISTENERS ===============
function setupEventListeners() {
  // Book open/close
  document.getElementById('bookCover').addEventListener('click', openBook);
  document.getElementById('closeBook').addEventListener('click', closeBook);
  
  // Tab switching
  document.querySelectorAll('.spell-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
  
  // New spread buttons
  document.getElementById('newSpread').addEventListener('click', () => {
    if (confirm('Draw a new daily spread? This will replace your current quests.')) {
      drawNewDailySpread();
    }
  });
  
  document.getElementById('newSpreadHome').addEventListener('click', () => {
    if (confirm('Draw a new daily spread? This will replace your current quests.')) {
      drawNewDailySpread();
    }
  });
  
  // Custom spell form
  document.getElementById('customSpellForm').addEventListener('submit', addCustomSpell);
  
  // Custom ritual form
  document.getElementById('customRitualForm').addEventListener('submit', addCustomRitual);
  
  // Spell search
  document.getElementById('spellSearch').addEventListener('input', (e) => {
    searchSpells(e.target.value);
  });
  
  // Spell filter buttons
  document.querySelectorAll('.spell-library-controls .secondary-button').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.spell-library-controls .secondary-button').forEach(b => {
        b.classList.remove('filter-active');
      });
      btn.classList.add('filter-active');
      
      // Filter spells
      filterSpells(btn.dataset.filter);
    });
  });
}

// =============== PARTICLES ===============
function initParticles() {
  const container = document.getElementById('particles');
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (8 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

// =============== START APP ===============
document.addEventListener('DOMContentLoaded', init);

