import {
  species,
  starters,
  maps,
  trainers,
  rescues,
  typedMoves,
} from "./data.js";
export const SAVE_KEY = "emberwild.save.v1";
export function creature(id, level = 3) {
  const base = species[id];
  return {
    species: id,
    level,
    hp: base.hp + (level - 3) * 4,
    maxHp: base.hp + (level - 3) * 4,
    xp: 0,
  };
}
export function newGame() {
  return {
    version: 1,
    mode: "starter",
    map: "village",
    x: 4,
    y: 8,
    facing: [0, -1],
    team: [],
    active: 0,
    items: { capsules: 6, tonics: 3 },
    flags: {
      captured: false,
      rival: false,
      trainer: false,
      puzzle: false,
      complete: false,
    },
    rescued: [],
    bowlStep: 0,
    steps: 0,
    battle: null,
    message:
      "Stillglass Beacon has gone dark. Choose a companion and follow the embers along Sedgeway.",
  };
}
export function chooseStarter(s, id) {
  if (s.mode !== "starter" || !starters.includes(id)) return false;
  s.team = [creature(id)];
  s.mode = "world";
  s.message =
    "Your companion is ready. Perrin by the cottage knows the coast. Sedgeway lies to the east.";
  return true;
}
export function walk(s, dx, dy, rng = Math.random) {
  if (s.mode !== "world" || Math.abs(dx) + Math.abs(dy) !== 1) return false;
  s.facing = [dx, dy];
  const map = maps[s.map],
    x = s.x + dx,
    y = s.y + dy,
    tile = map.rows[y]?.[x];
  if (
    !tile ||
    "#TH".includes(tile) ||
    map.npcs.some((n) => n.x === x && n.y === y)
  )
    return false;
  const exit = map.exits.find((e) => e.x === x && e.y === y);
  if (exit?.requires && !s.flags[exit.requires]) {
    s.message = exit.locked;
    return false;
  }
  s.x = x;
  s.y = y;
  s.steps++;
  if (exit) {
    s.map = exit.map;
    [s.x, s.y] = exit.to;
    s.message = maps[s.map].name;
    return true;
  }
  if (tile === "g" && s.steps % 4 === 0 && rng() < 0.65) {
    const pool = map.encounters || ["vippa", "daggla", "tuvling"];
    startBattle(s, pool[Math.floor(rng() * pool.length)], false);
  }
  return true;
}
export function interact(s) {
  if (s.mode !== "world") return;
  const npc = maps[s.map].npcs.find(
    (n) => n.x === s.x + s.facing[0] && n.y === s.y + s.facing[1],
  );
  if (!npc) {
    s.message = "Stand next to someone and face them to talk.";
    return;
  }
  if (npc.id.startsWith("rescue-")) {
    const id = npc.id.slice(7),
      rescue = rescues[id];
    if (s.rescued.includes(id)) {
      s.message = rescue.clue;
      return;
    }
    startBattle(s, rescue.species);
    s.battle.enemy = creature(rescue.species, 3);
    s.battle.rescueId = id;
    s.battle.log = [
      `${rescue.title}: ${species[rescue.species].name} is sheltering a spark. Win its trust in battle or catch it. You can leave and return.`,
    ];
    return;
  }
  if (npc.id === "healer" || npc.id === "rest") {
    heal(s);
    s.items.capsules = Math.max(6, s.items.capsules);
    s.items.tonics = Math.max(3, s.items.tonics);
    s.message =
      "Everyone is rested. Your Spark Vessels and Mending Draughts are topped up. Come back whenever you need a hand.";
  }
  if (npc.id === "neighbor")
    s.message =
      "Perrin: Look for sheltered sparks along Sedgeway and Saltwind Rise. Weaken their guardians before catching them. Mira will heal your team for free.";
  if (npc.id === "neighbor" && s.flags.complete)
    s.message =
      "Perrin: The light reaches Briarwick again! You saw what those little creatures were trying to tell us. Thank you.";
  if (trainers[npc.id]) {
    const trainer = trainers[npc.id];
    if (s.flags[trainer.flag]) s.message = trainer.reward;
    else startBattle(s, trainer.team[0][0], npc.id);
  }
  if (npc.id === "lookout")
    s.message =
      "Tamsin: Alder shuttered the beacon when its embers vanished. But look at the creatures. They are shielding the sparks from the wind.";
  if (npc.id === "inscription")
    s.message =
      "The inscription reads: Tide feeds moss. Moss shelters ember. Light the bowls in that order. The creatures have kept these sparks alive in the vault.";
  if (npc.id === "reset") {
    s.bowlStep = 0;
    s.message = "The bowls are dark again. Begin with Tide.";
  }
  if (npc.id.startsWith("bowl-")) {
    if (s.flags.puzzle) {
      s.message =
        "The three bowls shine together. The northeast stairs are open.";
      return;
    }
    const order = ["tide", "moss", "ember"];
    if (npc.id === "bowl-" + order[s.bowlStep]) {
      s.bowlStep++;
      if (s.bowlStep === 3) {
        s.flags.puzzle = true;
        s.message =
          "The sparks join! The northeast stairs open. The creatures carry their light toward the lantern.";
      } else s.message = `${s.bowlStep}/3 bowls lit.`;
    } else {
      s.bowlStep = 0;
      s.message =
        "The sparks fade. Try Tide, Moss, then Ember. Nothing was used up.";
    }
  }
  if (npc.id === "beacon")
    s.message = s.flags.complete
      ? "Stillglass shines over Briarwick. A little light goes a long way when it is shared."
      : "The lantern is dark. Warden Alder waits just below it.";
}
export function heal(s) {
  for (const c of s.team) c.hp = c.maxHp;
  s.active = 0;
}
export function startBattle(s, id, trainer = false) {
  if (s.mode !== "world") return;
  if (!s.team[s.active] || s.team[s.active].hp <= 0)
    s.active = s.team.findIndex((c) => c.hp > 0);
  if (s.active < 0) {
    lose(s);
    return;
  }
  const trainerId = trainer === true ? "liv" : trainer || null;
  const definition = trainers[trainerId];
  const queue = definition
    ? definition.team.map(([kind, level]) => creature(kind, level))
    : [];
  s.mode = "battle";
  s.battle = {
    enemy: queue.shift() || creature(id, 2),
    queue,
    trainer: !!trainerId,
    trainerId,
    name: definition?.name,
    guard: false,
    result: null,
    log: [
      definition
        ? `${definition.name} challenges you!`
        : `A wild ${species[id].name} appears!`,
    ],
  };
}
export function effectiveness(attack, defense) {
  const beats = { ember: "moss", moss: "tide", tide: "ember" };
  if (beats[attack] === defense) return 1.6;
  if (beats[defense] === attack) return 0.7;
  return 1;
}
export function moveInfo(from, to, typed) {
  const type = typed ? species[from.species].type : "neutral";
  const mult = effectiveness(type, species[to.species].type);
  const damage = Math.max(
    1,
    Math.round((species[from.species].attack + from.level - 2) * mult),
  );
  return { type, damage, mult };
}
function hit(from, to, typed, guard = false) {
  const info = moveInfo(from, to, typed);
  // Round only once after guard, matching the original damage rule.
  const damage = Math.max(
    1,
    Math.round(
      (species[from.species].attack + from.level - 2) *
        info.mult *
        (guard ? 0.4 : 1),
    ),
  );
  to.hp = Math.max(0, to.hp - damage);
  return { damage, mult: info.mult };
}
function lose(s) {
  heal(s);
  s.mode = "world";
  s.map = "village";
  [s.x, s.y] = [5, 6];
  s.facing = [0, -1];
  s.battle = null;
  s.items.capsules = Math.max(6, s.items.capsules);
  s.items.tonics = Math.max(3, s.items.tonics);
  s.message =
    "Mira brought you home safely. Your whole team is rested and your supplies are topped up. You are ready to try again.";
}
function completeRescue(s) {
  const id = s.battle.rescueId;
  if (!id || s.rescued.includes(id)) return;
  s.rescued.push(id);
  s.battle.log.push(
    rescues[id].clue,
    `Sheltered sparks: ${s.rescued.length}/3. A new note is waiting in your field journal.`,
  );
}
function win(s) {
  const b = s.battle,
    c = s.team[s.active];
  c.xp += b.trainer ? 3 : 2;
  if (c.level >= 100) c.xp = 0;
  if (c.xp >= 4) {
    c.xp -= 4;
    c.level++;
    c.maxHp += 4;
    c.hp = Math.min(c.maxHp, c.hp + 8);
    b.log.push(`${species[c.species].name} grew to level ${c.level}!`);
  }
  if (b.queue.length) {
    b.enemy = b.queue.shift();
    b.log.push(`${b.name} sends out ${species[b.enemy.species].name}!`);
    return;
  }
  if (b.trainer) {
    s.flags[trainers[b.trainerId].flag] = true;
    s.items.capsules = Math.min(9999, s.items.capsules + 3);
  }
  completeRescue(s);
  b.result = "win";
  b.log.push(b.trainer ? trainers[b.trainerId].reward : "Battle won!");
}
export function battleAction(
  s,
  action,
  index,
  rng = Math.random,
  onFrame = () => {},
) {
  const emit = (kind, details = {}) =>
    onFrame({ kind, ...details, state: structuredClone(s) });
  if (s.mode !== "battle" || s.battle.result) return false;
  const b = s.battle,
    enemy = b.enemy;
  let c = s.team[s.active];
  b.log = [];
  const mustSwitch = c.hp === 0;
  if (mustSwitch && action !== "switch") {
    b.log = ["Choose a companion that can still battle."];
    return false;
  }
  if (action === "attack" || action === "typed") {
    const { damage, mult } = hit(c, enemy, action === "typed");
    b.log.push(
      `${species[c.species].name} uses ${action === "typed" ? typedMoves[species[c.species].type] : "Bump"}: ${damage} damage.${mult > 1 ? " A strong match!" : mult < 1 ? " The attack is resisted." : ""}`,
    );
    emit("player-hit", { actor: "ally", target: "enemy", damage, mult });
    if (enemy.hp === 0) {
      win(s);
      emit(b.result ? "victory" : "sendout", { actor: "enemy" });
      return true;
    }
  } else if (action === "guard") {
    b.guard = true;
    b.log.push("Your companion braces and recovers 3 HP.");
    c.hp = Math.min(c.maxHp, c.hp + 3);
    emit("guard", { actor: "ally" });
  } else if (action === "tonic") {
    if (!s.items.tonics || c.hp === c.maxHp) {
      b.log = ["No draught is needed, or your supply has run out."];
      return false;
    }
    s.items.tonics--;
    c.hp = Math.min(c.maxHp, c.hp + 22);
    b.log.push("A Mending Draught restores up to 22 HP.");
    emit("heal", { actor: "ally", target: "ally" });
  } else if (action === "capture") {
    if (b.trainer || s.team.length >= 6 || !s.items.capsules) {
      b.log = [
        b.trainer
          ? "Only wild creatures can join you in a Spark Vessel."
          : s.team.length >= 6
            ? "Your team is full. You can travel with six companions."
            : "No Spark Vessels left. Mira can give you more.",
      ];
      return false;
    }
    s.items.capsules--;
    if (rng() < 0.25 + 0.75 * (1 - enemy.hp / enemy.maxHp)) {
      s.team.push({ ...enemy, hp: Math.max(1, enemy.hp) });
      s.flags.captured = true;
      b.result = "capture";
      completeRescue(s);
      b.log.push(`${species[enemy.species].name} joins your team!`);
      emit("capture", { target: "enemy" });
      return true;
    }
    b.log.push("It broke free! A weakened creature is easier to catch.");
    emit("capture-miss", { target: "enemy" });
  } else if (action === "switch") {
    if (
      !Number.isInteger(index) ||
      !s.team[index] ||
      s.team[index].hp === 0 ||
      index === s.active
    ) {
      b.log = ["Choose another companion that can still battle."];
      return false;
    }
    s.active = index;
    c = s.team[index];
    b.log.push(`${species[c.species].name}, you are up!`);
    emit("switch", { actor: "ally" });
    if (mustSwitch) return true;
  } else if (action === "flee") {
    if (b.trainer) {
      b.log = [
        "You cannot leave a trainer challenge. Mira will help if your team is defeated.",
      ];
      return false;
    }
    b.result = "flee";
    b.log.push("You got away safely.");
    emit("flee");
    return true;
  } else return false;
  const { damage } = hit(enemy, c, rng() > 0.35, b.guard);
  b.guard = false;
  b.log.push(
    `${species[enemy.species].name} strikes back for ${damage} damage.`,
  );
  emit("enemy-hit", { actor: "enemy", target: "ally", damage });
  if (c.hp === 0) {
    if (s.team.every((m) => m.hp === 0)) {
      lose(s);
      emit("loss", { target: "ally" });
      return true;
    }
    b.log.push("Your companion is exhausted. Choose another team member.");
    emit("faint", { target: "ally" });
  }
  return true;
}
export function finishBattle(s) {
  if (s.mode !== "battle" || !s.battle.result) return false;
  const ending = s.battle.trainerId === "keeper" && s.battle.result === "win";
  s.message = s.battle.log.join(" ");
  s.battle = null;
  s.mode = ending ? "ending" : "world";
  return true;
}
export function encodeSave(s) {
  if (s.mode === "starter" || s.mode === "battle")
    throw new Error("Save while exploring, outside battle.");
  const copy = structuredClone(s);
  copy.mode = "world";
  copy.battle = null;
  return JSON.stringify(copy);
}
export function decodeSave(raw) {
  const s = JSON.parse(raw),
    validInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
  if (
    !s ||
    s.version !== 1 ||
    s.mode !== "world" ||
    !maps[s.map] ||
    !validInt(s.x, 0, 19) ||
    !validInt(s.y, 0, 12)
  )
    throw new Error("This save format is not supported.");
  if (
    !Array.isArray(s.team) ||
    s.team.length < 1 ||
    s.team.length > 6 ||
    !s.team.every(
      (c) =>
        c &&
        species[c.species] &&
        validInt(c.level, 1, 100) &&
        validInt(c.maxHp, 1, 1000) &&
        validInt(c.hp, 0, c.maxHp) &&
        validInt(c.xp, 0, 3),
    )
  )
    throw new Error("The saved team could not be read.");
  if (
    !s.items ||
    !validInt(s.items.capsules, 0, 9999) ||
    !validInt(s.items.tonics, 0, 9999) ||
    !s.flags ||
    typeof s.flags.captured !== "boolean" ||
    typeof s.flags.rival !== "boolean" ||
    !validInt(s.steps, 0, 1e9) ||
    !validInt(s.active, 0, s.team.length - 1)
  )
    throw new Error("This save could not be read.");
  if (
    "#TH".includes(maps[s.map].rows[s.y][s.x]) ||
    maps[s.map].npcs.some((n) => n.x === s.x && n.y === s.y)
  )
    throw new Error("The saved location could not be read.");
  // Reconstruct only known fields, including a safe facing; never trust arbitrary saved UI data.
  const clean = newGame();
  Object.assign(clean, {
    mode: "world",
    map: s.map,
    x: s.x,
    y: s.y,
    team: s.team.map((c) => ({
      species: c.species,
      level: c.level,
      hp: c.hp,
      maxHp: c.maxHp,
      xp: c.xp,
    })),
    active: s.active,
    items: { capsules: s.items.capsules, tonics: s.items.tonics },
    flags: {
      captured: s.flags.captured,
      rival: s.flags.rival,
      trainer: s.flags.trainer === true,
      puzzle: s.flags.puzzle === true,
      complete: s.flags.complete === true,
    },
    rescued: Array.isArray(s.rescued)
      ? [...new Set(s.rescued.filter((id) => Object.hasOwn(rescues, id)))]
      : [],
    bowlStep: s.flags.puzzle ? 3 : validInt(s.bowlStep, 0, 2) ? s.bowlStep : 0,
    steps: s.steps,
    message: "Save loaded. Welcome back!",
  });
  if (clean.team.every((c) => c.hp === 0)) lose(clean);
  return clean;
}
