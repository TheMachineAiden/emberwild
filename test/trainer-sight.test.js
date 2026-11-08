import test from "node:test";
import assert from "node:assert/strict";
import { TrainerSight, inTrainerSight } from "../src/trainer-sight.js";

const fixture = () => {
  const npc = { id: "watch", x: 5, y: 2 };
  const map = { rows: ["#######", "#.....#", "#.....#", "#.....#", "#######"], npcs: [npc], exits: [] };
  const trainers = { watch: { flag: "won" } };
  const c = new TrainerSight({ route: map, other: map }, trainers,
    { watch: { facing: [-1, 0], range: 4, turnEvery: 3200 } });
  const state = { map: "route", x: 2, y: 2, mode: "world", flags: {} };
  return { c, map, npc, state };
};
test("cardinal sight rejects range, diagonals, obstacles, NPCs and exits", () => {
  const { map, npc, state } = fixture();
  assert.equal(inTrainerSight(map, npc, state, [-1,0], 4),true);
  assert.equal(inTrainerSight(map, npc, {...state,y:1}, [-1,0],4),false);
  assert.equal(inTrainerSight(map, npc, state, [-1,0],2),false);
  for(const wall of ['#','T','H']) {
    map.rows[2]=`#..${wall}..#`;
    assert.equal(inTrainerSight(map,npc,state,[-1,0],4),false);
  }
  map.rows[2]='#.....#'; map.npcs.push({id:'other',x:3,y:2});
  assert.equal(inTrainerSight(map,npc,state,[-1,0],4),false);
  map.npcs.pop(); map.exits.push({x:3,y:2});
  assert.equal(inTrainerSight(map,npc,state,[-1,0],4),false);
});
test("notice, passable approach and one encounter never mutate static maps or player", () => {
  const {c,map,npc,state}=fixture(), before=structuredClone({map,state});
  assert.deepEqual(c.tick(state,0),[{type:'notice',id:'watch'}]);
  for(let i=0;i<20;i++) c.pose(npc,100+i); // render cannot advance detection
  assert.equal(c.active.phase,'notice');
  c.tick(state,450); assert.equal(c.pose(npc,590).x,4.5);
  c.tick(state,730);
  assert.deepEqual(c.tick(state,1010),[{type:'encounter',id:'watch'}]);
  assert.deepEqual(c.tick(state,1011),[]); // encounter emitted at last arrival
  assert.equal(c.active.phase,'engaged');
  assert.deepEqual(c.tick(state,5000),[]);
  assert.deepEqual({map,state},before);
});
test("interruptions suppress stale reentry until player changes tile; defeated trainers never notice", () => {
  const {c,state}=fixture(); c.tick(state,0); c.tick(state,100,{enabled:false});
  assert.equal(c.busy,false); assert.deepEqual(c.tick(state,200),[]);
  state.x=3; assert.deepEqual(c.tick(state,201),[{type:'notice',id:'watch'}]);
  state.flags.won=true; assert.deepEqual(c.tick(state,220),[]);
  assert.equal(c.busy,false); state.x=2; assert.deepEqual(c.tick(state,230),[]);
  state.flags.won=false; state.map='other';
  assert.deepEqual(c.tick(state,240),[{type:'notice',id:'watch'}]);
  state.mode='battle'; c.tick(state,250); assert.equal(c.busy,false);
});
test("rotating sight runs only during enabled updates, and blocked approach stops", () => {
  const {c,state,map}=fixture(); state.y=1;
  c.tick(state,0); c.tick(state,3200); assert.deepEqual(c.facing('watch'),[0,-1]);
  c.tick(state,3300,{enabled:false}); c.tick(state,9000);
  assert.deepEqual(c.facing('watch'),[0,-1]);
  state.y=2; c.elapsed=0; c.tick(state,9001);
  assert.equal(c.busy,true); map.rows[2]='#..T..#';
  c.tick(state,9451); // first step to4 is clear
  assert.deepEqual(c.tick(state,9731),[{type:'blocked',id:'watch'}]);
  assert.equal(c.busy,false); assert.deepEqual(c.tick(state,10000),[]);
});
