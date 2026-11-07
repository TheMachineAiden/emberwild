import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  decodeSave,
  encodeSave,
  SAVE_KEY,
  moveInfo,
  battleAction,
  startBattle,
} from "../src/engine.js";
import { species, maps, trainers } from "../src/data.js";

test("released Swedish save keeps its team, supplies, position and progress under English names", () => {
  const raw = JSON.parse(
    readFileSync(new URL("./fixtures/swedish-v1-save.json", import.meta.url)),
  );
  const loaded = decodeSave(JSON.stringify(raw));
  for (const key of [
    "team",
    "items",
    "flags",
    "map",
    "x",
    "y",
    "active",
    "steps",
  ])
    assert.deepEqual(loaded[key], raw[key]);
  assert.equal(SAVE_KEY, "emberwild.save.v1");
  assert.equal(loaded.message, "Save loaded. Welcome back!");
  assert.equal(species[loaded.team[0].species].name, "Rillfin");
  assert.equal(maps[loaded.map].name, "Sedgeway");
  const progressed = {
    ...raw,
    flags: {
      captured: true,
      rival: true,
      trainer: true,
      puzzle: true,
      complete: true,
    },
    rescued: ["reed", "shore", "cliff"],
    bowlStep: 3,
  };
  const roundtrip = decodeSave(
    encodeSave(decodeSave(JSON.stringify(progressed))),
  );
  assert.deepEqual(roundtrip.flags, progressed.flags);
  assert.deepEqual(roundtrip.rescued, progressed.rescued);
  assert.equal(roundtrip.bowlStep, 3);
  assert.equal(trainers.liv.name, "Rowan");
});

test("shown move damage matches actual damage for every creature type pair", () => {
  const raw = readFileSync(
    new URL("./fixtures/swedish-v1-save.json", import.meta.url),
    "utf8",
  );
  for (const attacker of Object.keys(species))
    for (const defender of Object.keys(species))
      for (const typed of [false, true]) {
        const s = decodeSave(raw);
        s.team[0].species = attacker;
        startBattle(s, defender);
        const expected = moveInfo(s.team[0], s.battle.enemy, typed);
        let hit;
        battleAction(
          s,
          typed ? "typed" : "attack",
          undefined,
          () => 0,
          (frame) => {
            if (frame.kind === "player-hit") hit = frame;
          },
        );
        assert.equal(hit.damage, expected.damage);
      }
});
