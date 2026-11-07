import test from 'node:test';
import assert from 'node:assert/strict';
import {scores,eventsFor} from '../music/scores.js';
import {Music,cueFor} from '../src/audio.js';
import {newGame,chooseStarter,startBattle} from '../src/engine.js';
test('all seven canonical scores have valid pitches, matching part lengths and no channel overlaps',()=>{
 assert.equal(Object.keys(scores).length,7);
 for(const cue of Object.values(scores)){
  const ends={};for(const event of eventsFor(cue)){
   assert.match(event.note,/^[A-G][#b]?\d$/);assert.ok(event.duration>0);assert.ok(event.beat>=(ends[event.part]||0));ends[event.part]=event.beat+event.duration;assert.ok(ends[event.part]<=cue.beats);
  }
 }
});
test('audio routing follows gameplay and muted construction creates no context or timer',()=>{
 const music=new Music();music.setCue('village');assert.equal(music.context,null);assert.equal(music.timer,null);
 const s=newGame();chooseStarter(s,'glimra');assert.equal(cueFor(s),'village');s.map='ridge';assert.equal(cueFor(s),'route');startBattle(s,'knopp','keeper');assert.equal(cueFor(s),'boss');s.battle.result='capture';assert.equal(cueFor(s),'capture');music.stop();assert.equal(music.nodes.size,0);
});
