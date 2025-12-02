let canvas=document.getElementById('bookCanvas');
let ctx=canvas.getContext('2d');

function resize(){
  canvas.width=canvas.clientWidth;
  canvas.height=canvas.clientHeight;
}
resize();
window.onresize=resize;

let runes=[];
for(let i=0;i<50;i++){
  runes.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, base:2+Math.random()*3, t:Math.random()*6 });
}

function animate(){
  ctx.fillStyle="#1c110f";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  runes.forEach(r=>{
    r.t+=0.05;
    let g=(Math.sin(r.t)+1)/2;
    ctx.fillStyle=`rgba(255,220,160,${0.2 + g*0.6})`;
    ctx.beginPath();
    ctx.arc(r.x,r.y, r.base + g*3, 0, Math.PI*2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();

let spells=[
  {name:'Ignis Ember', element:'Fire', power:25, desc:'Summons a burst of flame.'},
  {name:'Aqua Mend', element:'Water', power:18, desc:'Heals shallow wounds.'},
  {name:'Ventus Pulse', element:'Air', power:14, desc:'Quickens movement.'},
  {name:'Terra Guard', element:'Earth', power:30, desc:'Shields the caster.'},
  {name:'Lux Nova', element:'Light', power:40, desc:'Dispels darkness.'},
  {name:'Umbra Veil', element:'Shadow', power:35, desc:'Cloaks the caster.'}
];

let chosenSpell=null;
let spellList=document.getElementById('spellList');

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

document.getElementById('lorePage').innerHTML = `
<h3>Origins of the Grimoire</h3>
<p>Passed down through ancient mage lines. Its runes shift with living magic.</p>
`;

document.getElementById('ritualPage').innerHTML = `
<h3>Ritual of Focus</h3>
<p>1. Sit calmly — breathe.</p>
<p>2. Open to any page.</p>
<p>3. Touch the rune circle.</p>
<p>4. Speak your desire softly.</p>
`;

document.querySelectorAll('.tab').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.pageView').forEach(v=>v.classList.remove('active'));
    document.getElementById(btn.dataset.page+"Page").classList.add('active');
  };
});

document.getElementById('castSpell').onclick=()=>{
  if(!chosenSpell){ alert("Choose a spell first."); return; }
  let flashes=0;
  let interval=setInterval(()=>{
    flashes++;
    ctx.fillStyle=`rgba(255,240,180,${flashes%2?0.5:0})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(flashes>6){ clearInterval(interval); alert("✨ "+chosenSpell.name+" cast!"); }
  },120);
};
