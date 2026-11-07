import {species,starters,typeNames,typedMoves,maps} from './data.js';
import {newGame,chooseStarter,walk,interact,battleAction,finishBattle,encodeSave,decodeSave,SAVE_KEY} from './engine.js';
let state=newGame(),panel=null;
const $=id=>document.getElementById(id),scene=$('scene'),canvas=$('world'),ctx=canvas.getContext('2d');
function node(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
function button(text,fn,disabled=false){const el=node('button',text);el.type='button';el.disabled=disabled;el.addEventListener('click',fn);return el;}
function marker(id,pose='front'){
  if(id==='glimra'){const el=node('img',null,'creature-sprite');el.src=`assets/creatures/${id}-${pose}.png`;el.alt='';el.width=64;el.height=64;return el;}
  const el=node('span',null,'marker');el.style.setProperty('--creature-color',species[id].color);el.setAttribute('aria-hidden','true');return el;
}
function store(announce=false){
  try{localStorage.setItem(SAVE_KEY,encodeSave(state));if(announce)state.message='Sparat på den här enheten.';}
  catch{state.message='Kunde inte spara här. Kontrollera webbläsarens lagringsinställningar. Spelet kan fortsätta.';}
}
function load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw){state.message='Det finns ingen sparning på den här enheten.';}else{state=decodeSave(raw);panel=null;}}catch{state.message='Sparningen kunde inte läsas. Ditt pågående spel är kvar.';}render();}
function world(){
  const map=maps[state.map];ctx.clearRect(0,0,480,312);
  map.rows.forEach((row,y)=>[...row].forEach((tile,x)=>{
    ctx.fillStyle=tile==='#'?'#233b3e':tile==='T'?'#41634d':tile==='H'?'#8c6c53':tile==='g'?'#7e985e':'#b0ad7a';ctx.fillRect(x*24,y*24,24,24);
    if(tile==='g'){ctx.fillStyle='#42654c';ctx.fillRect(x*24+5,y*24+8,3,12);ctx.fillRect(x*24+14,y*24+4,3,16);}
    if(tile==='T'){ctx.fillStyle='#294b40';ctx.fillRect(x*24+3,y*24+3,18,16);}
  }));
  for(const exit of map.exits){ctx.fillStyle=exit.requires&&!state.flags[exit.requires]?'#ac7757':'#f2d28b';ctx.fillRect(exit.x*24+3,exit.y*24+3,18,18);ctx.fillStyle='#20323b';ctx.font='16px monospace';ctx.textAlign='center';ctx.fillText('↟',exit.x*24+12,exit.y*24+18);}
  for(const n of map.npcs){ctx.fillStyle=n.id==='healer'?'#d8e2b5':'#b88364';ctx.fillRect(n.x*24+5,n.y*24+5,14,18);ctx.fillStyle='#1d2d32';ctx.font='9px monospace';ctx.textAlign='center';ctx.fillText(n.label,n.x*24+12,n.y*24-3);}
  ctx.fillStyle='#2a333d';ctx.fillRect(state.x*24+4,state.y*24+7,16,17);ctx.fillStyle='#efc77d';ctx.fillRect(state.x*24+5,state.y*24+2,14,9);ctx.fillStyle='#fff0ce';ctx.fillRect(state.x*24+10+state.facing[0]*6,state.y*24+12+state.facing[1]*6,4,4);
  canvas.setAttribute('aria-label',`${map.name}. Position ${state.x}, ${state.y}.`);
}
function renderTeam(inBattle=false){
  scene.append(node('h2',inBattle?'Välj följeslagare':'Ditt lag'));
  const list=node('div',null,'team-list');
  state.team.forEach((c,i)=>{const row=node('div',null,'team-row');row.append(node('span',`${species[c.species].name} · Nv ${c.level} · ${typeNames[species[c.species].type]}\nHP ${c.hp}/${c.maxHp}${i===state.active?' · Aktiv':''}`));row.append(button(i===state.active?'Aktiv':'Välj',()=>{if(inBattle){panel=null;act('switch',i);}else{state.active=i;render();}},c.hp===0||i===state.active));list.append(row);});scene.append(list);
  scene.append(button('Tillbaka',()=>{panel=null;render();}));
}
function fighter(c,side){const el=node('div',null,`fighter ${side}`);el.append(marker(c.species,side==='ally'?'back':'front'));const stat=node('div',null,'stats');stat.append(node('strong',`${species[c.species].name} · Nv ${c.level}`));const hp=node('progress');hp.max=c.maxHp;hp.value=c.hp;hp.setAttribute('aria-label',`HP ${c.hp} av ${c.maxHp}`);stat.append(hp,node('span',`${c.hp}/${c.maxHp} HP · ${typeNames[species[c.species].type]}`));el.append(stat);return el;}
function act(action,index){if(battleAction(state,action,index)){if(state.mode==='world')store();}render();if(state.mode==='battle'){scene.classList.remove('impact');void scene.offsetWidth;scene.classList.add('impact');}}
function renderBattle(){
  const b=state.battle,c=state.team[state.active];scene.append(node('h2',b.trainer?`Utmanare · ${b.name}`:'Vild varelse'));
  const field=node('div',null,'battlefield');field.append(fighter(b.enemy,'enemy'),fighter(c,'ally'));scene.append(field);
  const log=node('div',null,'battle-log');log.setAttribute('role','status');log.setAttribute('aria-live','polite');for(const line of b.log)log.append(node('p',line));scene.append(log);
  const actions=node('div',null,'actions');
  if(b.result)actions.append(button('Fortsätt',()=>{finishBattle(state);store();render();}));
  else if(!c.hp){actions.append(button('Välj i laget',()=>{panel='team';render();}));}
  else{
    actions.append(button('Tackling · neutral',()=>act('attack')),button(`${typedMoves[species[c.species].type]} · ${typeNames[species[c.species].type]}`,()=>act('typed')),button('Skydd · +3 HP',()=>act('guard')),
    button(`Glödkapsel (${state.items.capsules})`,()=>act('capture'),b.trainer||!state.items.capsules||state.team.length>=6),button(`Brygd +22 (${state.items.tonics})`,()=>act('tonic'),!state.items.tonics||c.hp===c.maxHp),button('Byt följeslagare',()=>{panel='team';render();},state.team.length<2),button('Fly',()=>act('flee'),b.trainer));
  }
  scene.append(actions);
}
function render(){
  $('stage').classList.toggle('has-scene',state.mode!=='world'||panel!==null);
  document.body.classList.toggle('in-battle',state.mode==='battle');
  world();scene.replaceChildren();
  $('objective').textContent=state.flags.complete?'Fyren lyser igen. Återvänd till Glödvik eller fortsätt utforska.':!state.flags.rival?'Sök glöd på Sävstigen. Prata med Liv vid stigens östra ände.':!state.flags.trainer?'Följ vägen österut till Vindryggen. Sök upp Edda vid fyren.':!state.flags.puzzle?'Gå in i fyren. Läs inskriften och tänd de tre skålarna.':'Trappan är öppen. Vila och möt Signe på fyrens krön.';$('location').textContent=maps[state.map].name;$('message').textContent=state.message;
  $('save').disabled=state.mode!=='world';$('load').disabled=state.mode==='battle';$('team-toggle').disabled=state.mode==='starter'||state.mode==='ending';$('interact').disabled=state.mode!=='world'||panel!==null;
  document.querySelectorAll('[data-dir]').forEach(b=>b.disabled=state.mode!=='world'||panel!==null);
  if(state.mode==='starter'){
    scene.append(node('h2','Vem följer med dig?'),node('p','Fyren har tystnat. De vilda varelserna bär fortfarande på glöd. Välj en vän och ta reda på varför.'));
    const grid=node('div',null,'starter-grid');for(const id of starters){const el=button(species[id].name,()=>{chooseStarter(state,id);store();render();});el.prepend(marker(id));el.append(node('small',`${typeNames[species[id].type]} · ${species[id].hp} HP`));grid.append(el);}scene.append(grid,node('p','Sparat sedan tidigare? Välj ”Läs in” ovanför.'));
  }else if(state.mode==='ending'){
    scene.append(node('h2','Fyren lyser igen'),node('p','Varelserna samlas kring linsen. En efter en delar de sin glöd, tills ljuset når havet.'),node('p','Signe öppnar luckorna. Nere i Glödvik tänds fönstren som svar. Det som verkade stulet hade blivit skyddat hela tiden.'),node('p','Kapitel 1 är avslutat. Ditt lag och världen finns kvar att utforska.'),button('Tillbaka till världen',()=>{state.mode='world';store();render();}));
  }else if(panel==='team')renderTeam(state.mode==='battle');else if(state.mode==='battle')renderBattle();
}
function move(dx,dy){if(panel)return;const previousMap=state.map;walk(state,dx,dy);if(previousMap!==state.map)store();render();}
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(...b.dataset.dir.split(',').map(Number))));
$('interact').addEventListener('click',()=>{interact(state);if(state.mode==='world')store();render();});
$('team-toggle').addEventListener('click',()=>{panel=panel?null:'team';render();});$('save').addEventListener('click',()=>{store(true);render();});$('load').addEventListener('click',load);
let lastMove=0;
document.addEventListener('keydown',event=>{
  // Preserve native activation and tab navigation in all menus.
  if(event.key==='Escape'){if(state.mode==='starter'||state.mode==='ending')return;panel=panel?null:'team';render();return;}
  if(state.mode!=='world'||panel)return;
  const directions={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
  const dir=directions[event.key];if(dir){event.preventDefault();if(performance.now()-lastMove<110)return;lastMove=performance.now();move(...dir);}
  if((event.key==='Enter'||event.key===' ')&&event.target.tagName!=='BUTTON'){event.preventDefault();if(event.repeat)return;interact(state);if(state.mode==='world')store();render();}
});
render();
