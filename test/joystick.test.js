import test from 'node:test';
import assert from 'node:assert/strict';
import { ThumbJoystick, joystickVector } from '../src/joystick.js';
import { portraitGate, toggleFullscreen } from '../src/display.js';
test('thumb travel is bounded, cardinal, and neutral inside its dead zone', () => {
  assert.equal(joystickVector(8, 8).direction, null);
  assert.deepEqual(joystickVector(30, -20).direction, [1, 0]);
  assert.deepEqual(joystickVector(20, -30).direction, [0, -1]);
  const v = joystickVector(300,400);
  assert.equal(Math.hypot(v.x,v.y), 40);
});
test('one finger owns the stick; changes and dead zone work without lifting', () => {
  const changes = []; const j = new ThumbJoystick({change: d=>changes.push(d)});
  assert.equal(j.start(11, 35,0), true);
  assert.equal(j.start(22, -35,0), false);
  j.move(22, -35,0); j.end(22);
  assert.deepEqual(j.direction,[1,0]);
  j.move(11, 0,-35); j.move(11,0,-36);
  j.move(11, 0,0); j.move(11, -35,0); j.end(11);
  assert.deepEqual(changes,[[1,0],[0,-1],null,[-1,0],null]);
  assert.equal(j.pointer,null);
});
test('cancel, lost capture, menu, blur or rotation reset cannot inherit movement', () => {
  let enabled = true; const changes = []; const poses=[];
  const j = new ThumbJoystick({change:d=>changes.push(d),paint:(x,y)=>poses.push([x,y]),enabled:()=>enabled});
  j.start(1, 40,0); enabled=false; j.move(1,40,0);
  enabled=true; j.move(1,40,0);
  assert.equal(j.pointer,null); assert.equal(j.direction,null);
  assert.deepEqual(poses.at(-1),[0,0]);
  for(const reason of ['cancel','lost-capture','menu','blur','rotation']) {
    j.start(2,0,-40); j.reset(); j.move(2,0,-40);
    assert.equal(j.direction,null,reason); assert.equal(changes.at(-1),null);
  }
});
test('portrait gate applies to phones, keeps landscape and desktop usable', () => {
  assert.equal(portraitGate(390,844,true),true);
  assert.equal(portraitGate(844,390,true),false);
  assert.equal(portraitGate(667,375,true),false);
  assert.equal(portraitGate(390,844,false),false);
});
test('fullscreen lifecycle handles successful gesture, exit, denied and unsupported fallbacks', async () => {
  const calls=[];
  const root={requestFullscreen:async()=>calls.push('enter')};
  const doc={fullscreenEnabled:true,exitFullscreen:async()=>calls.push('exit')};
  assert.equal(await toggleFullscreen(root,doc,{lock:async x=>calls.push(x)}),'entered');
  doc.fullscreenElement=root;
  assert.equal(await toggleFullscreen(root,doc,{}),'exited');
  assert.deepEqual(calls,['enter','landscape','exit']);
  doc.fullscreenElement=null;
  root.requestFullscreen=async()=>{throw Error('denied')};
  assert.equal(await toggleFullscreen(root,doc,{}),'denied');
  assert.equal(await toggleFullscreen({},doc,{}),'unavailable');
  root.requestFullscreen=async()=>{};
  assert.equal(await toggleFullscreen(root,doc,{lock:async()=>{throw Error('no lock')}}),'entered');
});

test('DOM adapter owns capture and ignores the action finger through cancel/lost capture', async () => {
  const { bindJoystick } = await import('../src/joystick.js');
  const handlers = {}, changes = [], captures = [], styles = {};
  const element = {
    style:{setProperty:(k,v)=>{styles[k]=v}},
    getBoundingClientRect:()=>({left:10,top:20,width:112,height:112}),
    setPointerCapture:id=>captures.push(id),
    addEventListener:(name,fn)=>{handlers[name]=fn},
  };
  let enabled=true;
  bindJoystick(element,{change:d=>changes.push(d),enabled:()=>enabled});
  const e = (pointerId,x,y)=>({pointerId,button:0,clientX:x,clientY:y,preventDefault(){}});
  handlers.pointerdown(e(1,66,76)); // central dead zone
  handlers.pointermove(e(1,100,76));
  handlers.pointerdown(e(2,66,30)); // independent action finger cannot steal ownership
  handlers.pointerup(e(2,66,30));
  handlers.pointermove(e(1,66,35));
  assert.deepEqual(changes,[[1,0],[0,-1]]);
  assert.deepEqual(captures,[1]);
  handlers.pointerup(e(1,999,999));
  assert.equal(changes.at(-1),null);
  assert.equal(styles['--thumb-x'],'0px');
  for(const name of ['pointercancel','lostpointercapture']) {
    handlers.pointerdown(e(3,100,76)); handlers[name](e(3,100,76));
    handlers.pointermove(e(3,100,76)); assert.equal(changes.at(-1),null);
  }
  handlers.pointerdown(e(4,100,76)); enabled=false;
  handlers.pointermove(e(4,100,76)); enabled=true;
  handlers.pointermove(e(4,100,76)); assert.equal(changes.at(-1),null);
});
