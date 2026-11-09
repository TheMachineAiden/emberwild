import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {maps,fieldEncounters,starters,trainers} from '../src/data.js';
import {newGame,chooseStarter,creature,walk,interact,battleAction,finishBattle,encodeSave,decodeSave,moveInfo} from '../src/engine.js';
import {weirFlow} from '../src/weir-puzzle.js';
const ready=()=>{const s=newGame();chooseStarter(s,'glimra');s.flags.complete=true;s.flags.puzzle=true;return s;};
const touch=(s,map,id)=>{s.map=map;const m=maps[map],n=m.npcs.find(n=>n.id===id);
 const [dx,dy]=[[0,1],[1,0],[0,-1],[-1,0]].find(([dx,dy])=>{
  const t=m.rows[n.y+dy]?.[n.x+dx];return t&&!"#TH".includes(t)&&!m.npcs.some(o=>o.x===n.x+dx&&o.y===n.y+dy);
 });s.x=n.x+dx;s.y=n.y+dy;s.facing=[-dx,-dy];interact(s);return s.message;};
function reachable(map){
 const m=maps[map],seen=new Set([m.start.join(',')]),q=[m.start];
 for(const [x,y] of q)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const xx=x+dx,yy=y+dy,k=`${xx},${yy}`,t=m.rows[yy]?.[xx];
  if(!t||'#TH'.includes(t)||m.npcs.some(n=>n.x===xx&&n.y===yy)||seen.has(k))continue;
  seen.add(k);q.push([xx,yy]);
 }return seen;
}
test('all three chapter areas, six discoveries, clue branches, recovery and exits are reachable',()=>{
 const newSpecies=new Set();
 for(const map of ['wrack','weir','basin']){
  const m=maps[map],seen=reachable(map);assert.equal(m.rows.length,13);assert.ok(m.rows.every(r=>r.length===20));
  for(const n of m.npcs){assert.ok(!'#TH'.includes(m.rows[n.y][n.x]),n.id);
   assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has(`${n.x+dx},${n.y+dy}`)),`${map}:${n.id}`);
   if(n.id.startsWith('wild-'))newSpecies.add(fieldEncounters[n.id.slice(5)].species);
  }
  for(const e of m.exits){assert.ok(seen.has(`${e.x},${e.y}`),`exit ${map}`);const to=maps[e.map];assert.ok(!'#TH'.includes(to.rows[e.to[1]][e.to[0]]));assert.ok(!to.npcs.some(n=>n.x===e.to[0]&&n.y===e.to[1]));}
 }
 assert.deepEqual([...newSpecies].sort(),['siltippet','coaldrill','vesperknot','bractisel','kelpurl','peatuff'].sort());
});
test('weir experiments and reset preserve team/items; partial settings survive saves without unlocking',()=>{
 const s=ready();s.map='weir';s.x=5;s.y=8;const before={team:structuredClone(s.team),items:structuredClone(s.items)};
 assert.match(touch(s,'weir','weir-test'),/No fresh water/);
 touch(s,'weir','gate-cliff');assert.match(touch(s,'weir','weir-test'),/rises/);
 touch(s,'weir','gate-foam');assert.match(touch(s,'weir','weir-test'),/exposed/);
 const loaded=decodeSave(encodeSave(s));assert.deepEqual(loaded.weirGates,[true,false,true]);assert.equal(loaded.flags.weir,false);
 assert.deepEqual(loaded.team,before.team);assert.deepEqual(loaded.items,before.items);
 touch(loaded,'weir','weir-reset');assert.deepEqual(loaded.weirGates,[false,false,false]);assert.equal(loaded.flags.weir,false);
});
test('complementary height/nest clues give a unique steady through-flow and permanent basin access',()=>{
 const solutions=[];for(let n=0;n<8;n++){const g=[!!(n&1),!!(n&2),!!(n&4)];if(weirFlow(g)==='steady')solutions.push(g);}
 assert.equal(solutions.length,1);const s=ready();
 assert.match(touch(s,'weir','weir-relief'),/middle sill/);assert.match(touch(s,'weir','weir-record'),/lowest open outlet/);assert.match(touch(s,'weir','weir-nests'),/roots end above the deep cut/);
 s.x=18;s.y=8;assert.equal(walk(s,1,0),false);assert.equal(s.map,'weir');
 touch(s,'weir','gate-cliff');touch(s,'weir','gate-reed');touch(s,'weir','weir-test');assert.equal(s.flags.weir,true);
 touch(s,'weir','weir-reset');assert.equal(s.flags.weir,true);
 const loaded=decodeSave(encodeSave(s));assert.deepEqual(loaded.weirGates,solutions[0]);loaded.x=18;loaded.y=8;
 assert.equal(walk(loaded,1,0),true);assert.equal(loaded.map,'basin');
 assert.equal(walk(loaded,-1,0),true);assert.equal(loaded.map,'weir');assert.equal(loaded.flags.complete,true);
});
test('all six fixed encounters can be caught into a full travelling team and remain repeatable after the ending',()=>{
 const s=ready();s.team=['glimra','strila','knopp','vippa','kolkrabb','tuvling'].map(id=>creature(id,5));s.flags.chapterTwo=true;s.flags.weir=true;
 for(const map of ['wrack','weir','basin'])for(const n of maps[map].npcs.filter(n=>n.id.startsWith('wild-'))){
  touch(s,map,n.id);assert.equal(s.mode,'battle');battleAction(s,'capture',undefined,()=>0);assert.equal(s.battle.captureDestination,'reserve');finishBattle(s);s.items.capsules=6;
 }
 const loaded=decodeSave(encodeSave(s));assert.equal(loaded.team.length,6);assert.equal(loaded.reserve.length,6);assert.equal(loaded.discoveries.length,6);assert.equal(loaded.flags.chapterTwo,true);
});
test('guardian completion has a separate ending flag, survives reload and retains the original beacon',()=>{
 const s=ready();s.flags.weir=true;s.team=starters.map(id=>creature(id,8));touch(s,'basin','haven');assert.equal(s.flags.chapterTwo,false);
 for(let turns=0;s.mode==='battle'&&!s.battle.result&&turns<60;turns++){
  if(!s.team[s.active].hp){battleAction(s,'switch',s.team.findIndex(c=>c.hp>0));continue;}
  if(s.team[s.active].hp<18&&s.items.tonics){battleAction(s,'tonic');continue;}
  battleAction(s,'typed',undefined,()=>0);
 }
 assert.equal(s.battle.result,'win');assert.equal(s.flags.chapterTwo,true);assert.equal(s.flags.complete,true);finishBattle(s);assert.equal(s.mode,'ending');
 const loaded=decodeSave(encodeSave(s));assert.equal(loaded.mode,'world');assert.equal(loaded.flags.weir,true);assert.equal(loaded.flags.complete,true);assert.equal(loaded.flags.chapterTwo,true);
});
test('old completed saves and malformed partial gate data retain old progress and coherent new defaults',()=>{
 const s=ready();delete s.weirGates;delete s.flags.weir;delete s.flags.weirPractice;delete s.flags.chapterTwo;
 let loaded=decodeSave(JSON.stringify(s));assert.equal(loaded.flags.complete,true);assert.deepEqual(loaded.weirGates,[false,false,false]);assert.equal(loaded.flags.chapterTwo,false);
 s.weirGates=['yes',false,0];loaded=decodeSave(JSON.stringify(s));assert.deepEqual(loaded.weirGates,[false,false,false]);
});
test('rested level-five starters can finish the guardian without a mandatory capture or XP grind',()=>{
 for(const id of starters){const s=ready();s.team=[creature(id,5)];s.flags.weir=true;touch(s,'basin','haven');
  for(let turns=0;s.mode==='battle'&&!s.battle.result&&turns<50;turns++){
   const c=s.team[0],e=s.battle.enemy;
   const incoming=Math.max(moveInfo(e,c,true).damage,moveInfo(e,c,false).damage);
   battleAction(s,c.hp<=incoming&&s.items.tonics?'tonic':moveInfo(c,e,true).damage>moveInfo(c,e,false).damage?'typed':'attack',undefined,()=>.5);
  }
  assert.equal(s.mode,'battle',id);assert.equal(s.battle.result,'win',id);assert.equal(s.team.length,1);assert.equal(s.flags.chapterTwo,true);
 }
});
test('a failed nursery challenge preserves restored flow, old resolution and free retry',()=>{
 const s=ready();s.flags.weir=true;s.weirGates=[true,true,false];s.team=[creature('glimra',5)];s.team[0].hp=1;touch(s,'basin','haven');
 battleAction(s,'attack',undefined,()=>.5);assert.equal(s.mode,'world');assert.equal(s.map,'village');
 assert.equal(s.flags.weir,true);assert.equal(s.flags.complete,true);assert.equal(s.flags.chapterTwo,false);
 const loaded=decodeSave(encodeSave(s));assert.equal(loaded.team[0].hp,loaded.team[0].maxHp);assert.equal(loaded.items.tonics,3);assert.equal(loaded.flags.weir,true);
});

test('a completed published-baseline save retains its real position and reaches the new shore',()=>{
 const raw=JSON.parse(readFileSync(new URL('./fixtures/beacon-complete-v1-save.json',import.meta.url),'utf8'));
 const s=decodeSave(JSON.stringify(raw));assert.equal(s.map,'ridge');assert.equal(s.x,16);assert.equal(s.y,8);
 assert.deepEqual(s.team,raw.team);assert.deepEqual(s.items,raw.items);assert.deepEqual(s.reserve,[]);
 assert.equal(s.flags.complete,true);assert.equal(s.flags.chapterTwo,false);
 for(let i=0;i<3;i++)assert.equal(walk(s,1,0),true);
 assert.equal(s.map,'wrack');assert.equal(s.x,1);assert.equal(s.flags.complete,true);
});
