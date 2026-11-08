import test from "node:test";
import assert from "node:assert/strict";
import {effects, effectDuration, SoundEffects, battleEffect} from "../src/sfx.js";
import {newGame, chooseStarter, startBattle} from "../src/engine.js";
import {planBattleTurn, BattleSequence} from "../src/battle-sequence.js";

const audio = () => {
  const voices=[];
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const context={currentTime:10,state:'running',destination:{},
    createGain(){return {gain:param(),connect(){},disconnect(){this.disconnected=true;}};},
    createOscillator(){const v={frequency:param(),start(at){this.startAt=at;},stop(at){this.endAt=at;},connect(){},disconnect(){this.disconnected=true;}};voices.push(v);return v;}};
  let enabled=true;
  return {context,voices,sfx:new SoundEffects(()=>context,()=>enabled),enable:v=>{enabled=v;}};
};
const ready = () => {const s=newGame();chooseStarter(s,'glimra');startBattle(s,'daggla');return s;};

test('original effect score has finite modest envelopes and distinct type gestures', () => {
  for(const [name,parts] of Object.entries(effects)) {
    assert.ok(effectDuration(name)<=.25);
    for(const part of parts) {
      assert.ok(['square','triangle'].includes(part.type));let end=0;
      for(const p of part.pulses){assert.ok(p.at>=end);assert.ok(p.duration>=.02);assert.ok(p.level>0&&p.level<=.04);assert.ok(p.from>0&&p.to>0);end=p.at+p.duration;}
    }
  }
  assert.equal(new Set(['neutral','ember','tide','moss','wind'].map(type=>JSON.stringify(effects[`attack-${type}`]))).size,5);
});
test('muted or suspended context queues nothing; bounded live voices retire even with a stopped audio clock', () => {
  const a=audio();a.enable(false);assert.equal(a.sfx.play('heal'),false);assert.equal(a.voices.length,0);
  a.enable(true);a.context.state='suspended';assert.equal(a.sfx.play('heal'),false);
  a.context.state='running';
  for(const id of Object.keys(effects)) {a.sfx.play(id);assert.ok(a.sfx.nodes.size<=8);}
  const groups=[...a.sfx.groups];a.sfx.stop();
  assert.equal(a.sfx.nodes.size,0);assert.equal(a.sfx.groups.size,0);
  for(const group of groups)group.dispose();
  assert.ok(a.voices.every(v=>v.disconnected&&v.endAt===10));
});
test('one presentation edge triggers once; speculative capture planning is silent and cancel discards its outcome', async () => {
  const a=audio(), plan=planBattleTurn(ready(),'capture',undefined,()=>0);
  assert.equal(a.voices.length,0);
  const waits=[],seen=[];
  const seq=new BattleSequence(()=>new Promise(r=>waits.push(r)),()=>a.sfx.stop());
  const pending=seq.play(plan,frame=>{seen.push(battleEffect(frame));a.sfx.play(battleEffect(frame));});
  assert.deepEqual(seen,['capture-attempt']);assert.ok(a.sfx.nodes.size>0);
  seq.cancel();waits.shift()();assert.equal(await pending,false);
  assert.deepEqual(seen,['capture-attempt']);assert.equal(a.sfx.nodes.size,0);
  a.enable(false);a.context.currentTime=20;assert.equal(a.sfx.play('capture'),false);
  a.enable(true);assert.equal(a.sfx.nodes.size,0,'resume does not replay skipped effects');
});
test('capture outcome and type/XP routing retain committed rules in normal and reduced sequences', async () => {
  let rolls=0;
  planBattleTurn(ready(),'typed',undefined,()=>{rolls++;return .99;});
  assert.equal(rolls,1,'type metadata reuses the one enemy choice, without another roll');
  for(const reduced of [false,true]) {
    for(const [rng,result] of [[()=>0,'capture'],[()=>.99,'capture-miss']]) {
      const p=planBattleTurn(ready(),'capture',undefined,rng), heard=[];
      const seq=new BattleSequence(async()=>{});
      await seq.play(p,f=>heard.push(battleEffect(f)),reduced);
      assert.deepEqual(heard.slice(0,2),['capture-attempt',result]);
      assert.equal(p.finalState.items.capsules,5);
    }
  }
  const s=ready();s.team[0].xp=3;s.battle.enemy.hp=1;
  const p=planBattleTurn(s,'typed'), heard=p.frames.map(battleEffect);
  assert.equal(heard[0],'attack-ember');
  assert.deepEqual(heard.slice(1),['xp','level-up','xp','victory']);
  assert.equal(p.finalState.team[0].xp,1);assert.equal(p.finalState.team[0].level,4);
});
