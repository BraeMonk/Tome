const SPELLS=[
{id:'water',name:'Hydration Charm',reward:5,desc:'Drink a glass of water.'},
{id:'breathe',name:'Breathing Sigil',reward:6,desc:'Take 10 slow breaths.'},
{id:'stretch',name:'Limb Unbinding',reward:7,desc:'Do a 2-minute stretch.'},
{id:'focus',name:'Micro Focus Spell',reward:10,desc:'Focus on a single task for 5 minutes.'}
];

let state={mana:0,totalCasts:0,streak:0,lastDay:null,daily:[]};

function today(){return new Date().toISOString().slice(0,10);}
function save(){localStorage.setItem('grimoireOS',JSON.stringify(state));}
function load(){let s=localStorage.getItem('grimoireOS');if(s)state=JSON.parse(s);}

load();

function generateDaily(){
state.daily = SPELLS.sort(()=>0.5-Math.random()).slice(0,3).map(s=>s.id);
state.lastDay = today();
save();
}

if(state.lastDay!==today()) generateDaily();

function renderHeader(){
document.getElementById('manaDisplay').textContent='✨'+state.mana;
document.getElementById('totalCasts').textContent=state.totalCasts;
document.getElementById('streak').textContent=state.streak;
}

function renderDaily(){
let ul=document.getElementById('dailyList'); ul.innerHTML='';
state.daily.forEach(id=>{
let sp=SPELLS.find(s=>s.id===id);
let li=document.createElement('li');
li.innerHTML = `<b>${sp.name}</b><br>${sp.desc}<br>
<button data-cast='${id}'>Cast</button>`;
ul.appendChild(li);
});
}

function renderLibrary(){
let ul=document.getElementById('library'); ul.innerHTML='';
SPELLS.forEach(sp=>{
let li=document.createElement('li');
li.innerHTML=`<b>${sp.name}</b><br>${sp.desc} — ${sp.reward}✨`;
ul.appendChild(li);
});
}

document.addEventListener('click',e=>{
if(e.target.dataset.cast){
let id=e.target.dataset.cast;
let sp=SPELLS.find(s=>s.id===id);

state.mana+=sp.reward;
state.totalCasts++;
if(state.lastDay===today()) state.streak++;
else state.streak=1;

state.lastDay = today();
save();
renderHeader();
}
if(e.target.id==='newSpread'){
generateDaily(); renderDaily();
}
if(e.target.dataset.tab){
document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
e.target.classList.add('active');

document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
document.getElementById(e.target.dataset.tab).classList.add('active');
}
});

renderHeader();
renderDaily();
renderLibrary();
