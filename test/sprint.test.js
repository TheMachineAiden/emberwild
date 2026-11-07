import test from 'node:test';
import assert from 'node:assert/strict';
import {bindSprint} from '../src/sprint.js';

function harness() {
  const handlers={}, captures=[], attributes={}; let enabled=true;
  const control=bindSprint({
    addEventListener:(name,fn)=>handlers[name]=fn,
    setPointerCapture:id=>captures.push(id),
    setAttribute:(name,value)=>attributes[name]=value,
  }, {enabled:()=>enabled});
  const event=(id=1)=>({pointerId:id,button:0,preventDefault(){}});
  return {control,handlers,captures,attributes,event,disable(){enabled=false},enable(){enabled=true}};
}
test('sprint pointer owns its hold independently of joystick/action and keyboard',()=>{
  const h=harness(); h.control.press('keyboard');
  h.handlers.pointerdown(h.event(10)); h.handlers.pointerdown(h.event(20));
  assert.deepEqual(h.captures,[10]);
  h.handlers.pointerup(h.event(20)); assert.equal(h.control.active,true);
  h.control.release('keyboard'); assert.equal(h.control.active,true);
  h.handlers.pointerup(h.event(10)); assert.equal(h.control.active,false);
  assert.equal(h.attributes['aria-pressed'],'false');
});
test('release, cancellation and suspension require a fresh sprint press',()=>{
  const h=harness();
  for(const name of ['pointerup','pointercancel','lostpointercapture']) {
    h.handlers.pointerdown(h.event(1)); h.handlers[name](h.event(1));
    assert.equal(h.control.active,false,name);
  }
  h.handlers.pointerdown(h.event(1)); h.control.press('keyboard');
  h.disable(); h.control.reset();
  assert.equal(h.control.press('keyboard'),false);
  h.enable(); h.handlers.pointerup(h.event(1));
  h.handlers.keydown({key:' ',repeat:true,preventDefault(){}});
  assert.equal(h.control.active,false,'old pointer/repeated key cannot re-arm a cleared hold');
  h.handlers.pointerdown(h.event(2)); assert.equal(h.control.active,true);
  h.control.reset();
  h.handlers.keydown({key:'Enter',repeat:false,preventDefault(){}});
  assert.equal(h.control.active,true);
  h.handlers.blur(); assert.equal(h.control.active,false);
});
