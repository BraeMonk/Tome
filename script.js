let canvas=document.getElementById('bookCanvas');
let ctx=canvas.getContext('2d');

function resize(){
  canvas.width=canvas.clientWidth;
  canvas.height=canvas.clientHeight;
}
resize();
window.onresize=resize;

// RUNES ANIMATION
let runes=[];
for(let i=0;i<50;i++){
  runes.push({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    base:Math.random()*3+2,
    t:Math.random()*Math.PI*2
  });
}

function animate(){
  ctx.fillStyle="#1c110f";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  runes.forEach(r=>{
    r.t+=0.04;
    let glow=(Math.sin(r.t)+1)/2;
    ctx.fillStyle=`rgba(255,210,140,${0.2+glow*0.6})`;
    ctx.beginPath();
    ctx.arc(r.x,r.y,r.base+(glow*3),0,Math.PI*2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();

// GRIMOIRE CONTENT
let spells=[
  {name:'Ignis Ember', element:'Fire', power:25, desc:'Summons a burst of flame.'},
  {name:'Aqua Mend', element:'Water', power:18, desc:'Heals shallow wounds.'},
  {name:'Ventus Pulse', element:'Air', power:14, desc:'Quickens movement and reflexes.'},
  {name:'Terra Guard', element:'Earth', power:30, desc:'Shields the caster with stone.'},
  {name:'Lux Nova', element:'Light', power:40, desc:'A brilliant flash that dispels darkness.'},
  {name:'Umbra Veil', element:'Shadow', power:35, desc:'Cloaks the caster in obscurity.'}
];

let spellList=document.getElementById('spellList');
let chosenSpell=null;

function renderSpells(){
  spellList.innerHTML='';
  spells.forEach(s=>{
    let div=document.createElement('div');
    div.className='spellItem';
    div.innerHTML=`<b>${s.name}</b><br><i>${s.element} • Power ${s.power}</i><br>${s.desc}`;
    div.onclick=()=>{
      document.querySelectorAll('.spellItem').forEach(x=>x.classList.remove('active'));
      div.classList.add('active');
      chosenSpell=s;
      document.getElementById('chosenSpell').textContent="Selected: "+s.name;
    };
    spellList.appendChild(div);
  });
}
renderSpells();

// Lore
document.getElementById('lorePage').innerHTML = `
  <h3>Origins of the Grimoire</h3>
  <p>This ancient book has been passed through generations of mages.
     It records the arcane patterns of reality that shape all spells.</p>
  <p>The runes you see glowing faintly are echoes of forgotten magic.</p>
`;

// Rituals
document.getElementById('ritualPage').innerHTML = `
  <h3>Basic Ritual of Focus</h3>
  <p>1. Sit before the grimoire.</p>
  <p>2. Breathe deeply.</p>
  <p>3. Place a hand on the page.</p>
  <p>4. Whisper your intent.</p>
`;

// PAGE SWITCHING
document.querySelectorAll('.tab').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.pageView').forEach(p=>p.classList.remove('active'));
    let page=btn.dataset.page;
    document.getElementById(page+"Page")?.classList.add('active');
  };
});

// Spell Casting Animation
document.getElementById('castSpell').onclick=()=>{
  if(!chosenSpell){
    alert('Select a spell first!');
    return;
  }
  let flash=0;
  let flashInterval=setInterval(()=>{
    flash++;
    ctx.fillStyle=`rgba(255,240,180,${flash%2===0?0.5:0})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(flash>6){
      clearInterval(flashInterval);
      alert("✨ "+chosenSpell.name+" cast! ("+chosenSpell.element+")");
    }
  },120);
};
