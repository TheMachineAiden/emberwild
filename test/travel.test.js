import test from "node:test";
import assert from "node:assert/strict";
import { TileTravel } from "../src/travel.js";
import { newGame, chooseStarter } from "../src/engine.js";
function harness() {
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
