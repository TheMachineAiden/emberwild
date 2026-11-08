import test from "node:test";
import assert from "node:assert/strict";
import {WorldClock, UnderfootGrass, waterFrame} from "../src/world-clock.js";

test("one world clock redraws only dirty art and retires stale callbacks on pause", () => {
  const callbacks=new Map(), cancelled=[], updates=[], draws=[];
  let id=0, enabled=true, dirty=false;
  const clock=new WorldClock({enabled:()=>enabled,
    update:(now,time)=>{updates.push([now,time]);return dirty;},
    draw:()=>draws.push(true), request:fn=>{callbacks.set(++id,fn);return id;},
    cancel:handle=>cancelled.push(handle)});
  clock.sync(); clock.sync(); assert.equal(id,1);
  callbacks.get(1)(100); assert.equal(draws.length,0);
  dirty=true; callbacks.get(2)(120); assert.equal(draws.length,1);
  assert.equal(clock.time,20);
  const stale=callbacks.get(3);
  enabled=false; clock.sync(); assert.deepEqual(cancelled,[3]);
  enabled=true; clock.sync(); const fresh=clock.frame;
  stale(5000); assert.equal(clock.frame,fresh);
  callbacks.get(fresh)(6000); assert.equal(clock.time,20,'hidden time does not advance scenery');
  enabled=false; callbacks.get(clock.frame)(6010);
  assert.equal(clock.frame,null);
  assert.equal(updates.length,3);
});
test("water is a coherent reversible cycle and grass is anchored to real travel only", () => {
  assert.deepEqual([0,350,700,1050,1400].map(waterFrame),[0,1,2,1,0]);
  const grass=new UnderfootGrass(), map={rows:['....','.gg.','....']};
  grass.touch('route',map,{x:1.25,y:1,progress:.25,stride:1},100);
  const pose=grass.pose('route',100);
  assert.equal(pose.x,42); assert.equal(pose.y,47); assert.equal(pose.alpha,1);
  assert.equal(grass.pose('route',210).alpha,.5);
  assert.equal(grass.pose('route',320),null);
  assert.equal(grass.pose('other',110),null);
  assert.equal(grass.pose('route',110,true),null);
  grass.clear(); grass.touch('route',map,{x:0,y:0,progress:.2,stride:1},500);
  assert.equal(grass.pose('route',500),null);
});
