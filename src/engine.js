import { species, starters, maps, trainers, rescues } from "./data.js";
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
      "Fyren har slocknat. Välj en följeslagare och sök efter glöden på Sävstigen.",
  };
}
export function chooseStarter(s, id) {
  if (s.mode !== "starter" || !starters.includes(id)) return false;
  s.team = [creature(id)];
  s.mode = "world";
  s.message =
    "Din följeslagare är redo! Bo vid huset vet mer. Sävstigen ligger österut.";
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
  if (exit?.rescues && !s.flags.complete && s.rescued.length < exit.rescues) {
    s.message =
      "Två glödspår behövs för att öppna fyren. Leta i Sävstigens norra vass och södra strand, eller på Vindryggens klipphylla.";
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
    s.message = "Gå fram till någon och vänd dig mot dem för att prata.";
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
      `${rescue.title}: en ${species[rescue.species].name} skyddar en gnista. Lugna den genom strid eller fånga den. Du kan återvända om du flyr.`,
    ];
    return;
  }
  if (npc.id === "healer" || npc.id === "rest") {
    heal(s);
    s.items.capsules = Math.max(6, s.items.capsules);
    s.items.tonics = Math.max(3, s.items.tonics);
    s.message =
      "Hela laget är utvilat. Här får du fler glödkapslar och läkebrygder. Kom tillbaka när du vill.";
  }
  if (npc.id === "neighbor")
    s.message =
      "Bo: Följ glödspåren på Sävstigen och Vindryggen. Lugna eller fånga varelserna där. Försvaga dem först — läkaren hjälper dig gratis.";
  if (npc.id === "neighbor" && s.flags.complete)
    s.message =
      "Bo: Ljuset är tillbaka! Varelsernas glöd syns ända hit. Tack för att du lyssnade på dem.";
  if (trainers[npc.id]) {
    const trainer = trainers[npc.id];
    if (s.flags[trainer.flag]) s.message = trainer.reward;
    else startBattle(s, trainer.team[0][0], npc.id);
  }
  if (npc.id === "lookout")
    s.message =
      "Utkiken: Signe stängde luckorna när glöden försvann. Men se — varelserna skyddar ljuset från vinden.";
  if (npc.id === "inscription")
    s.message =
      "Inskriften: Från havet växer mossan. Ur mossan stiger glöden. Tänd skålarna: vatten, mossa, glöd. Varelserna har hållit glöden levande här nere.";
  if (npc.id === "reset") {
    s.bowlStep = 0;
    s.message = "Skålarna är släckta. Börja med vattnet.";
  }
  if (npc.id.startsWith("bowl-")) {
    if (s.flags.puzzle) {
      s.message = "Skålarna lyser tillsammans. Trappan i nordost är öppen.";
      return;
    }
    const order = ["tide", "moss", "ember"];
    if (npc.id === "bowl-" + order[s.bowlStep]) {
      s.bowlStep++;
      if (s.bowlStep === 3) {
        s.flags.puzzle = true;
        s.message =
          "Glöden förenas! Trappan i nordost öppnas. Varelserna bär ljuset uppåt.";
      } else s.message = `Skålen lyser. ${s.bowlStep} av 3 tända.`;
    } else {
      s.bowlStep = 0;
      s.message =
        "Glöden falnar. Försök igen: vatten, mossa, glöd. Inget har förbrukats.";
    }
  }
  if (npc.id === "beacon")
    s.message = s.flags.complete
      ? "Fyren lyser över Glödvik. Glöden räcker när alla delar den."
      : "Fyrlinsen är mörk. Signe väntar söder om ljuset.";
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
        ? `${definition.name} vill utmana dig!`
        : `En vild ${species[id].name} dök upp!`,
    ],
  };
}
export function effectiveness(attack, defense) {
  const beats = { ember: "moss", moss: "tide", tide: "ember" };
  if (beats[attack] === defense) return 1.6;
  if (beats[defense] === attack) return 0.7;
  return 1;
}
function hit(from, to, typed, guard = false) {
  const type = typed ? species[from.species].type : "neutral";
  const mult = effectiveness(type, species[to.species].type);
  const damage = Math.max(
    1,
    Math.round(
      (species[from.species].attack + from.level - 2) *
        mult *
        (guard ? 0.4 : 1),
    ),
  );
  to.hp = Math.max(0, to.hp - damage);
  return { damage, mult };
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
    "Läkaren tog hand om er. Hela laget är utvilat och väskan är påfylld. Du kan försöka igen.";
}
function completeRescue(s) {
  const id = s.battle.rescueId;
  if (!id || s.rescued.includes(id)) return;
  s.rescued.push(id);
  s.battle.log.push(
    rescues[id].clue,
    `Glödspår: ${s.rescued.length}/3. Två räcker för att öppna fyren.`,
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
    b.log.push(`${species[c.species].name} nådde nivå ${c.level}!`);
  }
  if (b.queue.length) {
    b.enemy = b.queue.shift();
    b.log.push(`${b.name} skickar fram ${species[b.enemy.species].name}!`);
    return;
  }
  if (b.trainer) {
    s.flags[trainers[b.trainerId].flag] = true;
    s.items.capsules = Math.min(9999, s.items.capsules + 3);
  }
  completeRescue(s);
  b.result = "win";
  b.log.push(b.trainer ? trainers[b.trainerId].reward : "Ni vann striden!");
}
export function battleAction(s, action, index, rng = Math.random) {
  if (s.mode !== "battle" || s.battle.result) return false;
  const b = s.battle,
    enemy = b.enemy;
  let c = s.team[s.active];
  b.log = [];
  const mustSwitch = c.hp === 0;
  if (mustSwitch && action !== "switch") {
    b.log = ["Välj en utvilad följeslagare i laget."];
    return false;
  }
  if (action === "attack" || action === "typed") {
    const { damage, mult } = hit(c, enemy, action === "typed");
    b.log.push(
      `${species[c.species].name} gör ${damage} skada.${mult > 1 ? " Mycket effektivt!" : mult < 1 ? " Svag effekt." : ""}`,
    );
    if (enemy.hp === 0) {
      win(s);
      return true;
    }
  } else if (action === "guard") {
    b.guard = true;
    b.log.push("Du tar skydd och samlar kraft.");
    c.hp = Math.min(c.maxHp, c.hp + 3);
  } else if (action === "tonic") {
    if (!s.items.tonics || c.hp === c.maxHp) {
      b.log = ["Ingen brygd behövs, eller så är de slut."];
      return false;
    }
    s.items.tonics--;
    c.hp = Math.min(c.maxHp, c.hp + 22);
    b.log.push("Läkebrygden återställer upp till 22 HP.");
  } else if (action === "capture") {
    if (b.trainer || s.team.length >= 6 || !s.items.capsules) {
      b.log = [
        b.trainer
          ? "Du kan bara fånga vilda varelser."
          : s.team.length >= 6
            ? "Laget är fullt (6 varelser)."
            : "Kapslarna är slut. Läkaren har fler.",
      ];
      return false;
    }
    s.items.capsules--;
    if (rng() < 0.25 + 0.75 * (1 - enemy.hp / enemy.maxHp)) {
      s.team.push({ ...enemy, hp: Math.max(1, enemy.hp) });
      s.flags.captured = true;
      b.result = "capture";
      completeRescue(s);
      b.log.push(`${species[enemy.species].name} ansluter till ditt lag!`);
      return true;
    }
    b.log.push("Varelsen tog sig ur kapseln. Försvaga den mer!");
  } else if (action === "switch") {
    if (
      !Number.isInteger(index) ||
      !s.team[index] ||
      s.team[index].hp === 0 ||
      index === s.active
    ) {
      b.log = ["Välj en annan utvilad följeslagare."];
      return false;
    }
    s.active = index;
    c = s.team[index];
    b.log.push(`${species[c.species].name}, din tur!`);
    if (mustSwitch) return true;
  } else if (action === "flee") {
    if (b.trainer) {
      b.log = [
        "Den här utmaningen måste avgöras. Läkaren hjälper er om ni förlorar.",
      ];
      return false;
    }
    b.result = "flee";
    b.log.push("Ni kommer undan utan problem.");
    return true;
  } else return false;
  const { damage } = hit(enemy, c, rng() > 0.35, b.guard);
  b.guard = false;
  b.log.push(`${species[enemy.species].name} svarar: ${damage} skada.`);
  if (c.hp === 0) {
    if (s.team.every((m) => m.hp === 0)) {
      lose(s);
      return true;
    }
    b.log.push("Din följeslagare behöver vila. Välj en annan i laget.");
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
    throw new Error("Spara när du är ute och går.");
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
    throw new Error("Sparfilen har ett okänt format.");
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
    throw new Error("Laget kunde inte läsas.");
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
    throw new Error("Sparfilen är skadad.");
  if (
    "#TH".includes(maps[s.map].rows[s.y][s.x]) ||
    maps[s.map].npcs.some((n) => n.x === s.x && n.y === s.y)
  )
    throw new Error("Positionen kunde inte läsas.");
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
    message: "Sparningen är inläst. Välkommen tillbaka!",
  });
  if (clean.team.every((c) => c.hp === 0)) lose(clean);
  return clean;
}
