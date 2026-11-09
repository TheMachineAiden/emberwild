import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,chooseStarter,interact,encodeSave,decodeSave,walk} from '../src/engine.js';
import {maps,trainers} from '../src/data.js';
const ready=()=>{const s=newGame();chooseStarter(s,'glimra');s.map='cellar';s.x=8;s.y=8;s.flags.trainer=true;return s;};
const touch=(s,id)=>{const n=maps.cellar.npcs.find(n=>n.id===id);s.x=n.x;s.y=n.y+1;s.facing=[0,-1];interact(s);return s.message;};

test('unequal light fails harmlessly; resetting clears allocations without spending supplies',()=>{
  const s=ready(),items=structuredClone(s.items),team=structuredClone(s.team);
  for(const id of ['tide','tide','moss','moss','ember','ember'])touch(s,'bowl-'+id);
  assert.equal(s.flags.puzzle,false);assert.deepEqual(s.bowlCharges,[0,0,0]);
  assert.match(s.message,/uneven/);assert.deepEqual(s.items,items);assert.deepEqual(s.team,team);
  touch(s,'bowl-ember');touch(s,'bowl-moss');
  touch(s,'reset');assert.deepEqual(s.bowlCharges,[0,0,0]);assert.equal(s.bowlStep,0);
  assert.deepEqual(s.items,items);
});
test('allocation rather than activation order solves the mechanism and preserves summit access',()=>{
  let solved;
  for (const sequence of [['tide','moss','moss','ember','ember','ember'], ['ember','moss','ember','tide','ember','moss']]) {
    const s=ready();
    for(const id of sequence)touch(s,'bowl-'+id);
    assert.equal(s.flags.puzzle,true);assert.deepEqual(s.bowlCharges,[1,2,3]);solved=s;
  }
  const loaded=decodeSave(encodeSave(solved));
  touch(loaded,'reset');assert.equal(loaded.flags.puzzle,true);assert.equal(loaded.bowlStep,3);
  assert.deepEqual(loaded.bowlCharges,[1,2,3]);
  loaded.x=16;loaded.y=3;assert.equal(walk(loaded,0,-1),true);assert.equal(loaded.map,'summit');
});
test('new partial arrangements survive save/reload; old partial sequences settle safely',()=>{
  const s=ready();touch(s,'bowl-moss');touch(s,'bowl-ember');
  assert.deepEqual(decodeSave(encodeSave(s)).bowlCharges,[0,1,1]);
  const legacy=structuredClone(s);delete legacy.bowlCharges;delete legacy.towerPuzzleVersion;legacy.bowlStep=2;
  const loaded=decodeSave(JSON.stringify(legacy));assert.deepEqual(loaded.bowlCharges,[0,0,0]);
  assert.match(loaded.message,/old sparks have settled/);assert.deepEqual(loaded.team,s.team);
  assert.deepEqual(loaded.items,s.items);assert.equal(loaded.flags.trainer,true);
});
test('legacy solved and completed saves retain the earned resolution regardless of old bowl data',()=>{
  const s=ready();s.flags.puzzle=true;s.flags.complete=true;s.bowlStep=3;
  delete s.bowlCharges;delete s.towerPuzzleVersion;
  const loaded=decodeSave(JSON.stringify(s));assert.equal(loaded.flags.complete,true);
  assert.equal(loaded.flags.puzzle,true);assert.deepEqual(loaded.bowlCharges,[1,2,3]);
  assert.deepEqual(loaded.team,s.team);
});
test('reachable clue, reset, failure and NPC guidance never repeat the old ordered answer',()=>{
  const s=ready(),messages=[touch(s,'inscription'),touch(s,'reset'),trainers.edda.reward,maps.cellar.exits[1].locked];
  for(const id of ['tide','tide','moss','moss','ember','ember'])messages.push(touch(s,'bowl-'+id));
  assert.doesNotMatch(messages.join('\n'),/Tide[^\n]*Moss[^\n]*Ember|Begin with|in that order|order shown/);
  assert.match(messages[0],/equal light/);assert.match(messages[1],/six wick notches/);
});
