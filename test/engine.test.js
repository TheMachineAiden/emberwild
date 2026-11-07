import test from "node:test";
import assert from "node:assert/strict";
import {
  newGame,
  chooseStarter,
  walk,
  interact,
  startBattle,
  battleAction,
  finishBattle,
  encodeSave,
  decodeSave,
  creature,
  effectiveness,
} from "../src/engine.js";
const ready = () => {
  const s = newGame();
  chooseStarter(s, "glimra");
  return s;
};
test("starter is chosen once and walking follows collision and map exits", () => {
  const s = ready();
  assert.equal(chooseStarter(s, "knopp"), false);
  for (let i = 0; i < 15; i++) walk(s, 1, 0, () => 1);
  assert.equal(s.map, "route");
  assert.equal(s.x, 1);
  walk(s, -1, 0, () => 1);
  assert.equal(s.map, "village");
  assert.equal(s.x, 18);
  s.x = 2;
  s.y = 2;
  assert.equal(walk(s, -1, 0), false);
  assert.equal(s.x, 2);
});
test("capture changes team, ends actions, saves/reloads and returns to healer", () => {
  const s = ready();
  startBattle(s, "daggla");
  battleAction(s, "attack");
  assert.ok(s.battle.enemy.hp < s.battle.enemy.maxHp);
  battleAction(s, "capture", undefined, () => 0);
  assert.equal(s.team.length, 2);
  assert.equal(s.flags.captured, true);
  assert.equal(battleAction(s, "attack"), false);
  finishBattle(s);
  const loaded = decodeSave(encodeSave(s));
  assert.equal(loaded.team.length, 2);
  loaded.x = 5;
  loaded.y = 6;
  loaded.facing = [0, -1];
  interact(loaded);
  assert.ok(loaded.team.every((c) => c.hp === c.maxHp));
  assert.ok(loaded.items.capsules >= 6);
});
test("switch and item consume one fair enemy turn; invalid actions consume none", () => {
  const s = ready();
  s.team.push(creature("knopp"));
  startBattle(s, "daggla");
  const hp = s.team[0].hp;
  assert.equal(battleAction(s, "switch", 0), false);
  assert.equal(s.team[0].hp, hp);
  battleAction(s, "switch", 1, () => 0);
  assert.ok(s.team[1].hp < s.team[1].maxHp);
  assert.equal(s.team[0].hp, hp);
  s.team[1].hp = 1;
  battleAction(s, "tonic", undefined, () => 0);
  assert.equal(s.items.tonics, 2);
  assert.ok(s.team[1].hp > 1);
});
test("loss restores full team and free retry supplies without deleting story progress", () => {
  const s = ready();
  s.flags.captured = true;
  s.team[0].hp = 1;
  s.items.tonics = 0;
  startBattle(s, "ljuskron", true);
  battleAction(s, "attack", undefined, () => 0);
  assert.equal(s.mode, "world");
  assert.equal(s.map, "village");
  assert.equal(s.team[0].hp, s.team[0].maxHp);
  assert.equal(s.flags.captured, true);
  assert.equal(s.items.tonics, 3);
});
test("forced replacement receives no second attack and trainer cannot be captured or fled", () => {
  const s = ready();
  s.team.push(creature("strila"));
  s.team[0].hp = 1;
  startBattle(s, "knopp", true);
  const hp = s.team[0].hp;
  assert.equal(battleAction(s, "flee"), false);
  assert.equal(battleAction(s, "capture"), false);
  assert.equal(s.team[0].hp, hp);
  battleAction(s, "attack", undefined, () => 0);
  assert.equal(s.team[0].hp, 0);
  const reserveHP = s.team[1].hp;
  battleAction(s, "switch", 1);
  assert.equal(s.team[1].hp, reserveHP);
});
test("trainer victory persists and type triangle creates meaningful differences", () => {
  const s = ready();
  startBattle(s, "knopp", true);
  for (let i = 0; i < 20 && !s.battle?.result && s.mode === "battle"; i++)
    battleAction(s, "typed", undefined, () => 0);
  assert.equal(s.battle.result, "win");
  finishBattle(s);
  assert.equal(decodeSave(encodeSave(s)).flags.rival, true);
  assert.ok(effectiveness("ember", "moss") > effectiveness("moss", "ember"));
});
test("save validation rejects malformed, unsupported and unsafe positions", () => {
  const s = ready();
  assert.throws(() => decodeSave("bad"));
  assert.throws(() => decodeSave('{"version":9}'));
  s.x = 0;
  s.y = 0;
  assert.throws(() => decodeSave(encodeSave(s)));
  const valid = ready();
  valid.team[0].hp = -1;
  assert.throws(() => decodeSave(encodeSave(valid)));
  startBattle(s, "daggla");
  assert.throws(() => encodeSave(s));
});

test("chapter gates, wrong bowl retry and solved puzzle persist without item requirements", () => {
  const s = ready();
  s.map = "route";
  s.x = 18;
  s.y = 8;
  assert.equal(walk(s, 1, 0), false);
  assert.equal(s.map, "route");
  s.flags.rival = true;
  walk(s, 1, 0);
  assert.equal(s.map, "ridge");
  s.x = 16;
  s.y = 5;
  assert.equal(walk(s, 0, -1), false);
  s.flags.trainer = true;
  s.rescued = ["reed", "shore"];
  walk(s, 0, -1);
  assert.equal(s.map, "cellar");
  const bowl = (x) => {
    s.x = x;
    s.y = 7;
    s.facing = [0, -1];
    interact(s);
  };
  bowl(10);
  assert.equal(s.bowlStep, 0);
  assert.equal(s.flags.puzzle, false);
  bowl(6);
  bowl(10);
  bowl(14);
  assert.equal(s.flags.puzzle, true);
  const loaded = decodeSave(encodeSave(s));
  assert.equal(loaded.flags.trainer, true);
  assert.equal(loaded.flags.puzzle, true);
  loaded.x = 16;
  loaded.y = 3;
  walk(loaded, 0, -1);
  assert.equal(loaded.map, "summit");
});
test("multi-creature trainer unlocks only after final opponent and keeper ending is saveable", () => {
  const s = ready();
  s.team[0] = creature("strila", 30);
  startBattle(s, "vippa", "edda");
  battleAction(s, "typed");
  assert.equal(s.battle.enemy.species, "kolkrabb");
  assert.equal(s.flags.trainer, false);
  assert.equal(s.battle.result, null);
  battleAction(s, "typed");
  assert.equal(s.flags.trainer, true);
  finishBattle(s);
  s.map = "summit";
  s.x = 9;
  s.y = 5;
  startBattle(s, "tuvling", "keeper");
  for (let i = 0; i < 20 && !s.battle.result; i++) battleAction(s, "attack");
  assert.equal(s.flags.complete, true);
  finishBattle(s);
  assert.equal(s.mode, "ending");
  const loaded = decodeSave(encodeSave(s));
  assert.equal(loaded.mode, "world");
  assert.equal(loaded.flags.complete, true);
});
test("every map exit and NPC has a reachable adjacent walkable tile", async () => {
  const { maps } = await import("../src/data.js");
  for (const [id, map] of Object.entries(maps)) {
    assert.equal(map.rows.length, 13, id);
    assert.ok(
      map.rows.every((row) => row.length === 20),
      id,
    );
    for (const exit of map.exits) {
      assert.ok(maps[exit.map], id);
      assert.ok(!"#TH".includes(map.rows[exit.y][exit.x]), id);
    }
    for (const npc of map.npcs)
      assert.ok(
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => {
          const tile = map.rows[npc.y + dy]?.[npc.x + dx];
          return tile && !"#TH".includes(tile);
        }),
        id + ":" + npc.id,
      );
  }
});

test("ember rescue supports retreat and capture, rewards once, and survives legacy saves", () => {
  const s = ready();
  s.map = "route";
  s.x = 10;
  s.y = 3;
  s.facing = [0, -1];
  interact(s);
  assert.equal(s.battle.rescueId, "reed");
  battleAction(s, "flee");
  finishBattle(s);
  assert.deepEqual(s.rescued, []);
  interact(s);
  battleAction(s, "capture", undefined, () => 0);
  assert.deepEqual(s.rescued, ["reed"]);
  finishBattle(s);
  const capsules = s.items.capsules;
  interact(s);
  assert.equal(s.mode, "world");
  assert.equal(s.items.capsules, capsules);
  assert.deepEqual(decodeSave(encodeSave(s)).rescued, ["reed"]);
  const legacy = JSON.parse(encodeSave(s));
  delete legacy.rescued;
  assert.deepEqual(decodeSave(JSON.stringify(legacy)).rescued, []);
});
