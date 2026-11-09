import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,chooseStarter,creature,walk,interact,startBattle,battleAction,finishBattle,encodeSave,decodeSave,atCamp,swapReserve,RESERVE_LIMIT} from '../src/engine.js';
import {maps} from '../src/data.js';
const ready=()=>{const s=newGame();chooseStarter(s,'strila');return s;};
const full=()=>{const s=ready();s.team=['glimra','strila','knopp','vippa','kolkrabb','tuvling'].map(id=>creature(id,5));return s;};

test('chapter two entry unlocks after original completion, preserves flags and returns to rise',()=>{
  const s=ready();s.map='ridge';s.x=18;s.y=8;
  assert.equal(walk(s,1,0),false);assert.equal(s.map,'ridge');
  s.flags.complete=true;s.flags.puzzle=true;
  assert.equal(walk(s,1,0),true);assert.equal(s.map,'wrack');
  assert.equal(walk(s,-1,0),true);assert.equal(s.map,'ridge');
  assert.equal(s.flags.complete,true);assert.equal(s.flags.puzzle,true);
  assert.equal(decodeSave(encodeSave(s)).flags.complete,true);
});
test('repeatable discovery supports flee/retry and full team Catch to reserve, reload and free camp swap',()=>{
  const s=full(),original=structuredClone(s.team);s.map='wrack';s.x=13;s.y=7;s.facing=[0,-1];
  interact(s);assert.equal(s.battle.enemy.species,'siltippet');
  battleAction(s,'flee');finishBattle(s);assert.deepEqual(s.discoveries,[]);
  interact(s);battleAction(s,'capture',undefined,()=>0);assert.equal(s.team.length,6);assert.equal(s.reserve.length,1);
  assert.deepEqual(s.team,original);assert.match(s.battle.log.join(' '),/resting at camp/);
  assert.deepEqual(s.discoveries,['silt-pool']);finishBattle(s);
  const loaded=decodeSave(encodeSave(s));assert.equal(loaded.reserve[0].species,'siltippet');
  assert.equal(swapReserve(loaded,0,0),false,'no remote reserve access');
  loaded.x=3;loaded.y=7;assert.equal(atCamp(loaded),true);
  assert.equal(swapReserve(loaded,0,0),true);assert.equal(loaded.team[0].species,'siltippet');
  assert.equal(loaded.reserve[0].species,'glimra');assert.equal(loaded.active,0);
  assert.deepEqual(decodeSave(encodeSave(loaded)).reserve,loaded.reserve);
});
test('legacy six-member saves default empty reserve; invalid reserve is rejected rather than truncated',()=>{
  const s=full();delete s.reserve;delete s.discoveries;
  const loaded=decodeSave(JSON.stringify(s));assert.equal(loaded.team.length,6);assert.deepEqual(loaded.reserve,[]);
  assert.deepEqual(loaded.team.map(c=>c.species),s.team.map(c=>c.species));
  loaded.reserve=Array.from({length:RESERVE_LIMIT+1},()=>creature('glimra'));
  assert.throws(()=>decodeSave(JSON.stringify(loaded)),/reserve/);
  loaded.reserve=[{...creature('glimra'),hp:-1}];assert.throws(()=>decodeSave(JSON.stringify(loaded)),/reserve/);
});
test('full reserve prevents vessel spending and companions cannot swap into battle',()=>{
  const s=full();s.reserve=Array.from({length:RESERVE_LIMIT},()=>creature('strila'));
  startBattle(s,'siltippet');const items=structuredClone(s.items);
  assert.equal(battleAction(s,'capture',undefined,()=>0),false);assert.deepEqual(s.items,items);
  assert.equal(s.reserve.length,RESERVE_LIMIT);assert.match(s.battle.log[0],/No vessel was used/);
  assert.equal(swapReserve(s,0,0),false);
});
test('loss and legacy all-fainted recovery preserve and heal retained companions; swaps keep an able lead',()=>{
  const s=full();s.reserve=[creature('siltippet')];s.reserve[0].hp=0;s.flags.complete=true;
  s.map='wrack';s.x=3;s.y=7;s.team.slice(1).forEach(c=>c.hp=0);
  assert.equal(swapReserve(s,0,0),false,'cannot leave travelling team entirely fainted');
  s.team[1].hp=1;assert.equal(swapReserve(s,0,0),true);assert.equal(s.active,1);
  s.team.forEach(c=>c.hp=0);const loaded=decodeSave(encodeSave(s));
  assert.equal(loaded.map,'village');assert.equal(loaded.flags.complete,true);
  assert.ok([...loaded.team,...loaded.reserve].every(c=>c.hp===c.maxHp));
});
test('proof map entry, camp, record and discovery all have reachable adjacent walkable tiles',()=>{
  const m=maps.wrack;const reachable=new Set(['1,8']),q=[[1,8]];
  for(const [x,y] of q)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const xx=x+dx,yy=y+dy,key=`${xx},${yy}`,tile=m.rows[yy]?.[xx];
    if(!tile||'#TH'.includes(tile)||m.npcs.some(n=>n.x===xx&&n.y===yy)||reachable.has(key))continue;
    reachable.add(key);q.push([xx,yy]);
  }
  for(const n of m.npcs)assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>reachable.has(`${n.x+dx},${n.y+dy}`)),n.id);
});
