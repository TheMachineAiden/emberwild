import test from "node:test";
import assert from "node:assert/strict";
import { EncounterIntro } from "../src/encounter-intro.js";
import { entryDuration } from "../music/scores.js";

function clock() {
  const pending = new Map();
  let id = 0;
  const intro = new EncounterIntro({
    setTimer(fn, at) { pending.set(++id, {fn,at}); return id; },
    clearTimer(key) { pending.delete(key); },
  });
  return {intro, pending};
}
test("one genuine entry owns takeover, opposed entrances and ready, within the musical opening", () => {
  for (const cue of ["battle", "boss"]) {
    const {intro,pending} = clock(), seen = [], completed = [];
    const duration = entryDuration(cue);
    assert.ok(duration >= 1000 && duration <= 1500);
    const options = {duration, show:phase => seen.push(phase), done:result => completed.push(result)};
    assert.equal(intro.start(options), true);
    assert.equal(intro.busy, true);
    assert.equal(intro.start(options), false);
    assert.deepEqual(seen, ["takeover"]);
    const timers = [...pending.values()].sort((a,b) => a.at-b.at);
    assert.ok(timers[0].at < timers[1].at);
    timers[0].fn();
    assert.deepEqual(seen, ["takeover", "entrances"]);
    assert.equal(intro.busy, true);
    timers[1].fn();
    assert.equal(intro.busy, false);
    assert.deepEqual(completed, [{interrupted:false}]);
    assert.equal(pending.size, 0);
  }
});
test("interruption retires both stages and stale callbacks cannot affect a subsequent encounter", () => {
  const {intro,pending} = clock(), seen = [], completed = [];
  const options = {duration:1240, show:phase => seen.push(phase), done:result => completed.push(result)};
  intro.start(options);
  const stale = [...pending.values()];
  assert.equal(intro.finish(), true);
  assert.equal(intro.finish(), false);
  assert.equal(pending.size, 0);
  assert.deepEqual(completed, [{interrupted:true}]);
  intro.start(options);
  for (const timer of stale) timer.fn();
  assert.equal(intro.phase, "takeover");
  assert.deepEqual(seen, ["takeover", "takeover"]);
  intro.finish();
});

test("default browser timers are invoked without the controller as their receiver", () => {
  const oldSet = globalThis.setTimeout, oldClear = globalThis.clearTimeout;
  let calls = 0;
  globalThis.setTimeout = function() { assert.equal(this,undefined); return ++calls; };
  globalThis.clearTimeout = function() { assert.equal(this,undefined); };
  try {
    const intro = new EncounterIntro();
    intro.start({duration:1240,show(){},done(){}});
    assert.equal(calls,2);
    intro.finish();
  } finally {
    globalThis.setTimeout = oldSet;
    globalThis.clearTimeout = oldClear;
  }
});
