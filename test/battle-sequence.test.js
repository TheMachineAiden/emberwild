import test from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  chooseStarter,
  startBattle,
  creature,
} from "../src/engine.js";
import { planBattleTurn, BattleSequence } from "../src/battle-sequence.js";
const ready = () => {
  const s = newGame();
  chooseStarter(s, "glimra");
  startBattle(s, "daggla");
  return s;
};

test("player damage is visible before the reply and planning preserves the original save state", () => {
  const s = ready(),
    before = structuredClone(s),
    p = planBattleTurn(s, "attack", undefined, () => 0);
  assert.deepEqual(s, before);
  assert.deepEqual(
    p.frames.map((f) => f.kind),
    ["player-hit", "enemy-hit"],
  );
  assert.equal(p.frames[0].state.team[0].hp, before.team[0].hp);
  assert.ok(p.frames[0].state.battle.enemy.hp < before.battle.enemy.hp);
  assert.ok(p.frames[1].state.team[0].hp < before.team[0].hp);
  assert.deepEqual(p.frames.at(-1).state, p.finalState);
});
test("capture, item, faint, forced switch and exit retain their own sequence boundaries", () => {
  let s = ready();
  assert.deepEqual(
    planBattleTurn(s, "capture", undefined, () => 0).frames.map((f) => f.kind),
    ["capture"],
  );
  assert.deepEqual(
    planBattleTurn(s, "capture", undefined, () => 0.99).frames.map(
      (f) => f.kind,
    ),
    ["capture-miss", "enemy-hit"],
  );
  s.team[0].hp = 10;
  assert.deepEqual(
    planBattleTurn(s, "tonic", undefined, () => 0).frames.map((f) => f.kind),
    ["heal", "enemy-hit"],
  );
  s.team[0].hp = 1;
  s.team.push(creature("knopp"));
  let p = planBattleTurn(s, "attack", undefined, () => 0);
  assert.deepEqual(
    p.frames.map((f) => f.kind),
    ["player-hit", "enemy-hit", "faint"],
  );
  assert.deepEqual(
    planBattleTurn(p.finalState, "switch", 1).frames.map((f) => f.kind),
    ["switch"],
  );
  assert.deepEqual(
    planBattleTurn(s, "flee").frames.map((f) => f.kind),
    ["flee"],
  );
});
test("resolution rejects repeated input and cancellation suppresses stale frames", async () => {
  const waits = [],
    sequence = new BattleSequence(
      () => new Promise((resolve) => waits.push(resolve)),
    ),
    seen = [];
  const plan = planBattleTurn(ready(), "attack", undefined, () => 0);
  const first = sequence.play(plan, (f) => seen.push(f.kind));
  assert.equal(sequence.busy, true);
  assert.equal(
    await sequence.play(plan, () => assert.fail("Repeated action")),
    false,
  );
  sequence.cancel();
  waits.shift()();
  assert.equal(await first, false);
  assert.deepEqual(seen, ["player-hit"]);
  assert.equal(sequence.busy, false);
});

test("a defeated opponent never replies, including a trainer sendout", () => {
  const s = ready();
  s.battle.enemy.hp = 1;
  let p = planBattleTurn(s, "attack");
  assert.deepEqual(
    p.frames.map((f) => f.kind),
    ["player-hit", "xp", "victory"],
  );
  s.battle.queue = [creature("knopp")];
  p = planBattleTurn(s, "attack");
  assert.deepEqual(
    p.frames.map((f) => f.kind),
    ["player-hit", "xp", "sendout"],
  );
  assert.equal(p.finalState.battle.enemy.species, "knopp");
});
