import test from 'node:test';
import assert from 'node:assert/strict';
import { experienceSteps } from '../src/experience.js';
import { newGame, chooseStarter, startBattle, creature } from '../src/engine.js';
import { planBattleTurn, BattleSequence } from '../src/battle-sequence.js';

test('committed XP crosses its threshold, resets and retains the real remainder', () => {
  const old = {species:'glimra',level:3,xp:3};
  assert.deepEqual(experienceSteps(old,{...old,level:4,xp:1}), [
    {kind:'xp',level:3,from:3,to:4},
    {kind:'level-up',level:4,from:0,to:0},
    {kind:'xp',level:4,from:0,to:1},
  ]);
  assert.deepEqual(experienceSteps({...old,level:100},{...old,level:100,xp:0}), []);
});
test('a real trainer reward finishes before sendout without changing the resolved turn', async () => {
  const s=newGame(); chooseStarter(s,'glimra'); startBattle(s,'daggla');
  s.battle.trainer=true; s.battle.queue=[creature('knopp')];
  s.battle.enemy.hp=1; s.team[0].xp=3;
  const before=structuredClone(s), p=planBattleTurn(s,'attack');
  assert.deepEqual(s,before);
  assert.deepEqual(p.frames.map(f=>f.kind),['player-hit','xp','level-up','xp','sendout']);
  assert.equal(p.finalState.team[0].level,4); assert.equal(p.finalState.team[0].xp,2);
  for(const f of p.frames.slice(1,-1)) {
    assert.equal(f.state.battle.enemy.hp,0); assert.equal(f.state.battle.enemy.species,'daggla');
    assert.equal(f.state.battle.result,null);
  }
  const seen=[], seq=new BattleSequence(async()=>assert.equal(seq.busy,true));
  assert.equal(await seq.play(p,f=>seen.push(f.kind)),true);
  assert.deepEqual(seen,p.frames.map(f=>f.kind));
  assert.deepEqual(p.frames.at(-1).state,p.finalState);
});
test('capture never invents experience or level animation', () => {
  const s=newGame(); chooseStarter(s,'glimra'); startBattle(s,'daggla');
  s.team[0].xp=3;
  const p=planBattleTurn(s,'capture',undefined,()=>0);
  assert.deepEqual(p.frames.map(f=>f.kind),['capture']);
  assert.equal(p.finalState.team[0].xp,3);
});
