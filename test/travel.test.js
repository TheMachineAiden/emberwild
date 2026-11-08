import test from "node:test";
import assert from "node:assert/strict";
import { TileTravel, directionKey, WALK_DURATION, SPRINT_DURATION } from "../src/travel.js";
import { newGame, chooseStarter } from "../src/engine.js";
function harness(options = {}) {
  let state = newGame(),
    time = 0,
    frame;
  chooseStarter(state, "glimra");
  const poses = [],
    commits = [];
  const travel = new TileTravel({
    getState: () => state,
    canMove: () => state.mode === "world",
    commit: (next) => {
      state = next;
      commits.push(structuredClone(next));
    },
    draw: (p) => poses.push(p),
    now: () => time,
    requestFrame: (f) => {
      frame = f;
    },
    rng: () => 0,
    duration: 100,
    ...options,
  });
  return {
    travel,
    poses,
    commits,
    get state() {
      return state;
    },
    advance(t) {
      time = t;
      const f = frame;
      frame = null;
      f?.(t);
    },
  };
}
test("held travel interpolates once per tile and release finishes only the current step", () => {
  const h = harness();
  h.travel.press("right", [1, 0]);
  h.advance(50);
  assert.equal(h.poses.at(-1).x, 4.5);
  assert.equal(h.state.x, 4);
  h.advance(100);
  assert.equal(h.state.x, 5);
  h.travel.release("right");
  h.advance(200);
  h.advance(400);
  assert.equal(h.state.x, 6);
  assert.equal(h.state.steps, 2);
  assert.equal(h.travel.busy, false);
});
test("latest direction turns at arrival, blocked tiles turn without walking, and old holds resume", () => {
  const h = harness();
  h.travel.press("right", [1, 0]);
  h.travel.press("up", [0, -1]);
  h.advance(100);
  h.advance(200);
  assert.deepEqual([h.state.x, h.state.y], [5, 7]);
  h.travel.release("up");
  h.advance(300);
  h.advance(400);
  assert.deepEqual([h.state.x, h.state.y], [6, 6]);
  h.travel.clear();
  h.advance(500);
  h.state.x = 2;
  h.state.y = 2;
  const steps = h.state.steps;
  h.travel.press("left", [-1, 0]);
  assert.equal(h.travel.busy, false);
  assert.deepEqual(h.state.facing, [-1, 0]);
  assert.equal(h.state.steps, steps);
  h.travel.clear();
});
test("map changes commit only on arrival and encounters clear held movement", () => {
  const h = harness();
  h.state.x = 18;
  h.travel.press("right", [1, 0]);
  assert.equal(h.state.map, "village");
  h.advance(100);
  assert.equal(h.state.map, "route");
  h.travel.clear();
  h.advance(200);
  h.state.x = 4;
  h.state.y = 5;
  h.state.steps = 3;
  h.travel.press("right", [1, 0]);
  assert.equal(h.state.mode, "world");
  h.advance(300);
  assert.equal(h.state.mode, "battle");
  assert.equal(h.state.steps, 4);
  assert.equal(h.travel.held.size, 0);
  h.advance(500);
  assert.equal(h.state.steps, 4);
});

test("changing letter case between press and release does not leave movement held", () => {
  const h = harness();
  h.travel.press(directionKey("W"), [0, -1]);
  h.advance(50);
  h.travel.release(directionKey("w"));
  h.advance(100);
  h.advance(300);
  assert.equal(h.state.y, 7);
  assert.equal(h.state.steps, 1);
  assert.equal(h.travel.held.size, 0);
  assert.equal(directionKey("ArrowUp"), "ArrowUp");
});

test('walk and sprint freeze their duration at tile start, including mid-step release', () => {
  let sprint = false;
  const h = harness({getDuration: () => sprint ? SPRINT_DURATION : WALK_DURATION});
  h.travel.press('right', [1,0]);
  h.advance(70);
  assert.equal(h.travel.position(70).progress,.25);
  sprint = true;
  assert.equal(h.travel.position(70).progress,.25, 'pressing sprint cannot jump the current tile');
  h.advance(280);
  assert.equal(h.state.x,5);
  h.advance(352.5);
  assert.equal(h.travel.position(352.5).progress,.5);
  sprint = false;
  assert.equal(h.travel.position(352.5).progress,.5, 'release cannot reverse the current tile');
  h.advance(425);
  assert.equal(h.state.x,6);
  h.travel.release('right');
  h.advance(565);
  assert.equal(h.travel.position(565).progress,.5,'next step returns to walking');
  h.advance(705);
  h.advance(1000);
  assert.equal(h.state.x,7);
  assert.equal(h.state.steps,3);
  assert.equal(h.commits.length,3);
});

test('sprint encounter commits once at arrival and clears continued travel', () => {
  const h = harness({duration: SPRINT_DURATION});
  h.state.map='route'; h.state.x=4; h.state.y=5; h.state.steps=3;
  h.travel.press('right',[1,0]);
  h.advance(144);
  assert.equal(h.state.mode,'world'); assert.equal(h.state.steps,3);
  h.advance(145);
  assert.equal(h.state.mode,'battle'); assert.equal(h.state.steps,4);
  h.advance(1000);
  assert.equal(h.commits.length,1); assert.equal(h.travel.held.size,0);
});

test('held steps carry frame remainder at60/120Hz without duplicate commits or a tile-boundary pause', () => {
  for(const hz of [60,120])for(const duration of [WALK_DURATION,SPRINT_DURATION]) {
    const h=harness({duration});
    h.travel.press('right',[1,0]);
    for(let i=1;i<=Math.ceil(4.5*duration*hz/1000);i++) h.advance(i*1000/hz);
    const t=Math.ceil(4.5*duration*hz/1000)*1000/hz;
    assert.equal(h.state.steps,4);
    assert.ok(Math.abs(h.travel.position(t).x-(4+t/duration))<1e-9);
    assert.equal(h.commits.length,4);
    h.travel.release('right');
    h.advance(5*duration+1000/hz);
    assert.equal(h.commits.length,5,'release completes only the already-started step');
  }
});
