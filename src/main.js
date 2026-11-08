import { Music, cueFor } from "./audio.js";
import { entryDuration } from "../music/scores.js";
import { EncounterIntro } from "./encounter-intro.js";
import {
  species,
  starters,
  typeNames,
  typedMoves,
  maps,
  trainers,
  rescues,
} from "./data.js";
import {
  newGame,
  chooseStarter,
  interact,
  startBattle,
  moveInfo,
  finishBattle,
  encodeSave,
  decodeSave,
  SAVE_KEY,
} from "./engine.js";
import { worldCamera } from "./camera.js";
import { rasterSize, projectWorldRect, WorldLabels } from "./world-view.js";
import { bindJoystick } from "./joystick.js";
import { bindSprint } from "./sprint.js";
import { portraitGate, toggleFullscreen } from "./display.js";
import { TileTravel, directionKey, WALK_DURATION, SPRINT_DURATION } from "./travel.js";
import { onPath, decorations, npcArt } from "./world-layout.js";
import { planBattleTurn, BattleSequence } from "./battle-sequence.js";
import { TrainerSight } from "./trainer-sight.js";
import { WorldClock, UnderfootGrass, waterFrame } from "./world-clock.js";
import { battleEffect } from "./sfx.js";
let state = newGame(),
  panel = null,
  dialogue = null;
const SAVE_FAILURE_MESSAGE = "Could not save on this device. Check your browser storage settings. You can keep playing.";
const music = new Music();
const sequence = new BattleSequence(undefined, () => music.effects.stop());
const encounter = new EncounterIntro();
const trainerSight = new TrainerSight(maps, trainers);
const grass = new UnderfootGrass();
const battleBusy = () => sequence.busy || encounter.busy;
let renderedMode = "starter";
let battleMenu = "commands",
  presentation = null,
  previousFrame = null;
const journalOpen = new Set();
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id),
  scene = $("scene"),
  canvas = $("world"),
  ctx = canvas.getContext("2d");
const worldLabels = new WorldLabels($("world-labels"));
let queuedInteraction = null;
let inputSuspended = false;
let explorationBlurred = false;
const worldEnabled = () => !inputSuspended && !explorationBlurred && !document.hidden && !$("game-menu").open &&
  state.mode === "world" && !panel && !dialogue && !battleBusy() && worldLoaded;
const canExplore = () => worldEnabled() && !trainerSight.busy;
const gameSoundReady = () => !document.hidden && !explorationBlurred &&
  !inputSuspended && !$("game-menu").open;
let ambientKey = "";
const worldClock = new WorldClock({
  enabled: worldEnabled,
  update: (now, time) => {
    const event = advanceTrainers(now, travel.busy);
    const poses = maps[state.map].npcs.filter(n => trainers[n.id]).map(n => trainerSight.pose(n, now));
    const rustle = grass.pose(state.map, now, reducedMotion());
    const key = JSON.stringify([reducedMotion() || ["cellar", "summit"].includes(state.map) ? 0 : waterFrame(time), poses,
      rustle && [rustle.frame, Math.round(rustle.alpha * 8)]]);
    const dirty = key !== ambientKey;
    ambientKey = key;
    if (event) render();
    return dirty;
  },
  draw: () => { if (!travel.busy) world(); },
  pause: () => { trainerSight.suspend(); grass.clear(); ambientKey = ""; },
});
function advanceTrainers(now, moving = false) {
  const events = trainerSight.tick(state, now, { enabled: worldEnabled(), moving });
  for (const event of events) {
    clearInput();
    if (event.type === "notice" && gameSoundReady()) music.effects.play("notice");
    if (event.type === "encounter") {
      // Keep the final approach pose in the frozen encounter image, then let
      // the existing genuine world→battle lifecycle own input/music/entry.
      world();
      startBattle(state, trainers[event.id].team[0][0], event.id);
    }
  }
  return events.length > 0;
}
const travel = new TileTravel({
  getDuration: () => sprint.active ? SPRINT_DURATION : WALK_DURATION,
  getState: () => state,
  canMove: () =>
    canExplore(),
  draw: (pose) => {
    if (!reducedMotion()) grass.touch(state.map, maps[state.map], pose, performance.now());
    if (pose.progress === 0) render();
    else world();
  },
  commit: (next, before) => {
    state = next;
    if (!reducedMotion() && next.map === before.map && next.steps !== before.steps)
      grass.touch(next.map, maps[next.map], { x: next.x, y: next.y,
        progress: 1, stride: travel.stride }, performance.now());
    if (next.mode === "world" && next.map === before.map && next.steps === before.steps && next.message !== before.message)
      dialogue = next.message;
    if (before.map !== next.map) {
      store();
      sceneTransition();
    }
    if (!queuedInteraction) advanceTrainers(performance.now());
    render();
    if (queuedInteraction) {
      const action = queuedInteraction;
      queuedInteraction = null;
      travel.clear();
      action();
    }
  },
});
function sceneTransition() {
  $("stage").classList.remove("scene-enter");
  void $("stage").offsetWidth;
  $("stage").classList.add("scene-enter");
}
function afterTravel(action) {
  clearInput();
  if (travel.busy)
    queuedInteraction = () => {
      if (state.mode === "world") action();
    };
  else action();
}
function node(tag, text, className) {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function button(text, fn, disabled = false, key = text, sound = "confirm") {
  const el = node("button", text);
  el.type = "button";
  el.disabled = disabled || battleBusy();
  el.dataset.focus = key;
  el.addEventListener("click", () => {
    if (!battleBusy()) {
      if (sound) music.effects.play(key === "back" ? "back" : sound);
      fn();
    }
  });
  return el;
}
function marker(id, pose = "front") {
  const el = node("img", null, "creature-sprite");
  el.src = `assets/creatures/${id}-${pose}.png`;
  el.alt = "";
  el.dataset.species = id;
  el.width = 64;
  el.height = 64;
  return el;
}
function store(announce = false) {
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(state));
    if (dialogue === SAVE_FAILURE_MESSAGE) dialogue = null;
    if (announce) {
      state.message = "Saved on this device.";
      $("display-status").textContent = state.message;
      music.effects.play("save");
    }
  } catch {
    if (announce) music.effects.play("unavailable");
    state.message = SAVE_FAILURE_MESSAGE;
    $("display-status").textContent = state.message;
    if (state.mode === "world") dialogue = state.message;
    else if (!$("game-menu").open) $("game-menu").showModal();
  }
}
function load() {
  if (battleBusy()) return;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state.message = "No saved adventure on this device yet.";
    } else {
      state = decodeSave(raw);
      panel = null;
      dialogue = null;
    }
  } catch {
    state.message =
      "Could not load that save. Your current adventure is still here.";
  }
  render();
}
const worldAssets = {};
let worldLoaded = false;
const worldIds = [
  "meadow",
  "path",
  "flowers",
  "pebbles",
  "cottage",
  "camp",
  "perrin",
  "rowan",
  "maren",
  "alder",
  "tamsin",
  ...["north", "south", "east", "west"].flatMap((dir) =>
    [0, 1, 2].map((step) => `player-${dir}${step ? "-" + step : ""}`),
  ),
  "sand",
  "ground",
  "water",
  "water-1",
  "water-2",
  "grass-front-1",
  "grass-front-2",
  "reeds",
  "tree",
  "roof",
  "house",
  "floor",
  "wall",
  "stairs",
  "seal",
  "bowl",
  "flame",
  "player",
  "player-back",
  "healer",
  "trainer",
  "lighthouse",
  "door",
  "lens",
  "lens-lit",
  "beacon-dark",
  "beacon-lit",
];
const worldReady = Promise.all(
  worldIds.map(
    (id) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          worldAssets[id] = image;
          resolve();
        };
        image.onerror = reject;
        image.src = `assets/world/${id}.png`;
      }),
  ),
);
function world() {
  const now = performance.now();
  const pose = travel.position(now);
  const px = pose?.x ?? state.x,
    py = pose?.y ?? state.y;
  const map = maps[state.map],
    inside = ["cellar", "summit"].includes(state.map);
  const cssWidth = $("stage").clientWidth, cssHeight = $("stage").clientHeight;
  const camera = worldCamera(cssWidth, cssHeight, px, py, {
    touch: matchMedia("(any-pointer: coarse)").matches || navigator.maxTouchPoints > 0,
    dialogue: !!dialogue,
    landmarkTop: state.map === "summit" ? 1 : state.map === "ridge" ? Math.min(1, Math.max(0, (px - 10) / 3)) : 0,
  });
  const cameraX = camera.x / 24, cameraY = camera.y / 24;
  const raster = rasterSize(cssWidth, cssHeight, devicePixelRatio);
  if (canvas.width !== raster.width) canvas.width = raster.width;
  if (canvas.height !== raster.height) canvas.height = raster.height;
  canvas.dataset.camera = JSON.stringify(camera);
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.imageSmoothingEnabled = false;
  if (!worldLoaded) return;
  worldLabels.begin();
  const draw = (id, x, y, width = 24, height = 24) =>
    ctx.drawImage(worldAssets[id], ...projectWorldRect(camera,raster,cssWidth,cssHeight,x,y,width,height));
  const water = reducedMotion() ? "water" : ["water", "water-1", "water-2"][waterFrame(worldClock.time)];
  // Authored boundary tiles fill the view when the camera extends past a map
  // edge. Collision and map transitions still use the original logical tiles.
  for (let y = Math.floor(cameraY); y <= Math.ceil((camera.y + camera.height) / 24); y++)
    for (let x = Math.floor(cameraX); x <= Math.ceil((camera.x + camera.width) / 24); x++)
      draw(inside ? "wall" : water, x * 24, y * 24);
  map.rows.forEach((row, y) =>
    [...row].forEach((tile, x) => {
      let id = inside ? "floor" : onPath(state.map, x, y) ? "path" : "meadow";
      if (tile === "#") id = inside ? "wall" : water;
      if (tile === "T" || tile === "g") id = "ground";
      if (tile === "H" && state.map !== "village")
        id =
          state.map === "ridge"
            ? "wall"
            : map.rows[y - 1]?.[x] === "H"
              ? "house"
              : "roof";
      draw(id, x * 24, y * 24);
      if (tile === "T") draw("tree", x * 24, y * 24);
      if (tile === "g") draw("reeds", x * 24, y * 24);
      if (tile === "h" && state.map !== "village") draw("door", x * 24, y * 24);
    }),
  );
  if (state.map === "village") {
    draw("cottage", 4 * 24, 2 * 24, 72, 72);
    draw("cottage", 12 * 24, 2 * 24, 72, 72);
  }
  for (const [id, x, y] of decorations[state.map] || [])
    draw(id, x * 24, y * 24);
  if (state.map === "ridge") draw("lighthouse", 15 * 24, 0, 72, 96);
  for (const exit of map.exits)
    draw(
      exit.requires && !state.flags[exit.requires] ? "seal" : "stairs",
      exit.x * 24,
      exit.y * 24,
    );
  for (const n of map.npcs) {
    const trainerPose = trainerSight.pose(n, now);
    const nx = trainerPose.x, ny = trainerPose.y;
    let id =
      npcArt[n.id] ||
      (n.id === "healer" || n.id === "rest" ? "healer" : "trainer");
    const actor =
      !n.id.startsWith("rescue-") &&
      !n.id.startsWith("bowl-") &&
      !["reset", "inscription", "beacon", "rest"].includes(n.id);
    if (n.id.startsWith("rescue-"))
      id = state.rescued.includes(n.id.slice(7)) ? "bowl" : "flame";
    if (n.id.startsWith("bowl-")) {
      const order = ["bowl-tide", "bowl-moss", "bowl-ember"];
      id =
        state.flags.puzzle || order.indexOf(n.id) < state.bowlStep
          ? "flame"
          : "bowl";
    }
    if (n.id === "beacon") {
      draw(
        state.flags.complete ? "beacon-lit" : "beacon-dark",
        n.x * 24 - 24,
        n.y * 24 - 48,
        72,
        72,
      );
      continue;
    }
    if (n.id === "reset" || n.id === "inscription") id = "seal";
    draw(id, nx * 24 + (actor ? 4 : 0), ny * 24, actor ? 16 : 24, 24);
    if (trainerPose.notice) worldLabels.place(`notice:${n.id}`, "!",
      (nx*24+12-camera.x)*camera.scale, (ny*24-camera.y)*camera.scale-32,
      cssWidth, { notice: true });
    if (actor) {
      if (Math.abs(px - nx) + Math.abs(py - ny) > 2) continue;
      const left = px > nx;
      const x = ((nx + (left ? 0 : 1)) * 24 - camera.x) * camera.scale + (left ? -6 : 6);
      worldLabels.place(n.id,n.label,x,(ny*24+5-camera.y)*camera.scale,cssWidth,{actor:true,left});
    } else {
      worldLabels.place(n.id,n.label,(n.x*24+12-camera.x)*camera.scale,
        (n.y*24-camera.y)*camera.scale-22,cssWidth);
    }
  }
  const direction =
    state.facing[0] === 1
      ? "east"
      : state.facing[0] === -1
        ? "west"
        : state.facing[1] === -1
          ? "north"
          : "south";
  const step = pose && !reducedMotion() ? (pose.progress < 0.5 ? 1 : 2) : 0;
  draw(
    `player-${direction}${step ? "-" + (((step + pose.stride) % 2) + 1) : ""}`,
    px * 24 + 4,
    py * 24,
    16,
    24,
  );
  const rustle = grass.pose(state.map, now, reducedMotion());
  if (rustle) {
    ctx.globalAlpha = rustle.alpha;
    draw(`grass-front-${rustle.frame}`, rustle.x - 12, rustle.y - 10, 24, 12);
    ctx.globalAlpha = 1;
  }
  worldLabels.end();
  canvas.setAttribute(
    "aria-label",
    `${map.name}. Position ${state.x}, ${state.y}.`,
  );
}

function renderTeam(inBattle = false) {
  const forced = inBattle && state.team[state.active].hp === 0;
  const heading = node("div", null, "panel-heading");
  heading.append(
    node(
      "h2",
      forced
        ? "Who will take their place?"
        : inBattle
          ? "Switch companion"
          : "Your team",
    ),
  );
  if (!forced)
    heading.append(
      button(
        "Back",
        () => {
          panel = null;
          battleMenu = "commands";
          render();
          if (state.mode === "world")
            $("menu-toggle").focus({ preventScroll: true });
        },
        false,
        "back",
      ),
    );
  scene.append(heading);
  if (inBattle)
    scene.append(
      node(
        "p",
        forced
          ? "Your next companion enters safely, without an extra enemy attack."
          : "Switching gives your opponent a turn.",
      ),
    );
  const list = node("div", null, "team-list");
  state.team.forEach((c, i) => {
    const row = node("div", null, "team-row");
    const details = node("div", null, "team-details");
    details.append(
      node("strong", species[c.species].name),
      node("small", `Lv. ${c.level} · ${typeNames[species[c.species].type]}`),
      node("span", `HP ${c.hp}/${c.maxHp}`),
      experienceMeter(c),
    );
    row.append(marker(c.species), details);
    row.append(
      button(
        i === state.active ? "Lead" : "Choose",
        () => {
          if (inBattle) {
            panel = null;
            act("switch", i);
          } else {
            state.active = i;
            store();
            render();
          }
        },
        c.hp === 0 || i === state.active,
        `team-${i}`,
        inBattle ? null : "confirm",
      ),
    );
    row
      .querySelector("button")
      .setAttribute(
        "aria-label",
        `${i === state.active ? "Lead" : "Choose"} ${species[c.species].name}`,
      );
    list.append(row);
  });
  scene.append(list);
  if (!inBattle) {
    scene.append(
      node("h3", "Field journal"),
      node("p", `${state.rescued.length} of 3 sparks found`, "journal-count"),
    );
    const titles = {
      reed: "Sedge shelter",
      shore: "Reef refuge",
      cliff: "Stone hearth",
    };
    for (const [id, rescue] of Object.entries(rescues)) {
      const found = state.rescued.includes(id);
      const entry = node(found ? "details" : "div", null, "journal-entry");
      const heading = node(found ? "summary" : "div", null, "journal-row");
      heading.append(
        node("span", titles[id]),
        node("small", found ? "Found" : "Unexplored", "journal-status"),
      );
      entry.append(heading);
      if (found) {
        entry.open = journalOpen.has(id);
        entry.append(node("p", rescue.clue));
        entry.addEventListener("toggle", () => {
          if (entry.open) journalOpen.add(id);
          else journalOpen.delete(id);
        });
      }
      scene.append(entry);
    }
  }
}
function experienceMeter(c, motion = null) {
  const meter = node("div", null, "experience");
  const capped = c.level >= 100 && !motion;
  const from = motion?.from ?? c.xp, to = motion?.to ?? c.xp;
  meter.append(node("small", capped ? "XP · Max level" : `XP ${to}/4`));
  const track = node("div", null, "xp-track");
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", "Experience");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", "4");
  track.setAttribute("aria-valuenow", String(capped ? 4 : to));
  const fill = node("div", null, "xp-fill");
  fill.style.width = `${(capped ? 4 : from) * 25}%`;
  track.append(fill); meter.append(track);
  if (motion && from !== to) requestAnimationFrame(() => {
    // Two frames give the newly inserted track a starting painted value.
    requestAnimationFrame(() => { fill.style.width = `${to * 25}%`; });
  });
  return meter;
}
function fighter(c, side) {
  const el = node("div", null, `fighter ${side}`);
  el.classList.toggle("defeated", c.hp === 0);
  const contact = node("img", null, "fighter-contact");
  contact.src = "assets/world/battle-contact.png";
  contact.alt = "";
  el.append(contact);
  el.append(marker(c.species, side === "ally" ? "back" : "front"));
  const stat = node("div", null, "stats");
  const heading = node("strong", species[c.species].name);
  heading.append(node("span", `Lv. ${c.level}`, "level"));
  stat.append(heading);
  const hp = node("progress");
  hp.max = c.maxHp;
  hp.value = c.hp;
  hp.setAttribute("aria-label", `HP ${c.hp} of ${c.maxHp}`);
  stat.append(
    hp,
    node(
      "span",
      `${c.hp}/${c.maxHp} HP · ${typeNames[species[c.species].type]}`,
    ),
  );
  const track = node("div", null, "hp-track"),
    fill = node("div", null, "hp-fill");
  const old =
    previousFrame &&
    (side === "enemy"
      ? previousFrame.battle?.enemy
      : previousFrame.team[previousFrame.active]);
  const oldHp = old?.species === c.species ? old.hp : c.hp;
  fill.style.width = `${(100 * oldHp) / c.maxHp}%`;
  fill.classList.toggle("low", c.hp <= c.maxHp / 4);
  track.setAttribute("aria-hidden", "true");
  track.append(fill);
  stat.insertBefore(track, hp);
  hp.className = "sr-only";
  if (side === "ally") stat.append(experienceMeter(c, presentation?.xp));
  requestAnimationFrame(() => {
    fill.style.width = `${(100 * c.hp) / c.maxHp}%`;
  });
  if (
    presentation?.target === side ||
    (presentation?.actor === side &&
      ["switch", "guard", "victory", "sendout", "level-up"].includes(presentation.kind))
  ) {
    el.classList.add(`effect-${presentation.kind}`);
    if (presentation.damage)
      el.append(node("span", `−${presentation.damage}`, "damage-number"));
  }
  el.append(stat);
  return el;
}
async function act(action, index) {
  if (battleBusy() || state.mode !== "battle") return;
  const plan = planBattleTurn(state, action, index);
  panel = null;
  const completed = await sequence.play(
    plan,
    (frame) => {
      previousFrame = state;
      state = frame.state;
      presentation = frame;
      render();
      if (gameSoundReady()) {
        const effect = battleEffect(frame);
        if (effect) music.effects.play(effect);
        if (frame.kind === "player-hit" && frame.state.battle.enemy.hp === 0)
          music.effects.play("defeat", {delay:reducedMotion() ? .09 : .18});
      }
    },
    reducedMotion(),
  );
  if (completed) state = plan.finalState;
  presentation = null;
  previousFrame = null;
  battleMenu = "commands";
  if (state.mode === "world") {
    store();
    if (plan.frames.some((frame) => frame.kind === "loss")) dialogue = state.message;
  }
  render();
  if (dialogue) $("dialogue-close").focus({preventScroll:true});
  else focusScene();
}
function focusScene(key) {
  const buttons = [...scene.querySelectorAll("button:not(:disabled)")];
  (
    buttons.find((b) => b.dataset.focus === key) ||
    buttons.find((b) => b.dataset.focus !== "back") ||
    buttons[0]
  )?.focus({
    preventScroll: true,
  });
}
function openBattleMenu(menu) {
  music.effects.play(menu === "commands" ? "back" : "confirm");
  battleMenu = menu;
  panel = menu === "team" ? "team" : null;
  render();
  focusScene();
}
function quantity(value, word) {
  return `${value} ${word}${value === 1 ? "" : "s"}`;
}
function command(title, detail, fn, disabled = false, key = title) {
  const el = button("", fn, disabled, key, null);
  el.append(node("strong", title), node("small", detail));
  return el;
}
function renderBattle() {
  const b = state.battle,
    c = state.team[state.active];
  scene.append(
    node("h2", b.trainer ? `Challenge · ${b.name}` : `Wild encounter · ${maps[state.map].name}`),
  );
  const field = node("div", null, "battlefield");
  // One representative coast scene establishes composition before the other
  // biomes are authored. Match actual coastal encounter positions.
  if (state.map === "ridge" || (state.map === "route" && state.x >= 13)) {
    const backdrop = node("img", null, "battle-backdrop");
    backdrop.src = "assets/world/battle-coast.png";
    backdrop.alt = "";
    field.append(backdrop);
    field.dataset.environment = "coast";
  }
  field.append(fighter(b.enemy, "enemy"), fighter(c, "ally"));
  scene.append(field);
  const log = node("div", null, "battle-log");
  log.setAttribute("role", "status");
  log.setAttribute("aria-live", "polite");
  const phases = {
    "player-hit": "Your move",
    xp: "Experience gained",
    "level-up": "Level up!",
    "enemy-hit": "Their reply",
    guard: "Bracing",
    heal: "Mending",
    capture: "A new companion!",
    "capture-miss": "Broke free",
    "capture-attempt": "Spark Vessel",
    switch: "Into the fray",
    flee: "Safe retreat",
    victory: "Victory",
    sendout: "Next opponent",
    faint: "Companion exhausted",
  };
  log.append(
    node(
      "span",
      presentation
        ? phases[presentation.kind] || "Resolving…"
        : b.result
          ? "Battle complete"
          : "Choose your next move",
      "turn-label",
    ),
  );
  for (const line of b.log.slice(-2)) log.append(node("p", line));
  scene.append(log);
  const actions = node("div", null, "actions command-grid");
  actions.classList.toggle("primary-commands", battleMenu === "commands");
  actions.setAttribute("aria-busy", String(battleBusy()));
  if (b.result && !battleBusy()) {
    actions.append(
      command(
        "Continue",
        b.result === "capture"
          ? "Meet your new companion in Team"
          : "Return to your adventure",
        () => {
          music.effects.play("confirm");
          finishBattle(state);
          store();
          render();
          if (state.mode === "ending") focusScene();
          else $("interact").focus({ preventScroll: true });
        },
      ),
    );
  } else if (battleMenu === "moves") {
    for (const [action, typed] of [
      ["attack", false],
      ["typed", true],
    ]) {
      const info = moveInfo(c, b.enemy, typed);
      actions.append(
        command(
          typed ? typedMoves[info.type] : "Bump",
          `${typeNames[info.type]} · ${info.damage} damage${info.mult > 1 ? " · Strong" : info.mult < 1 ? " · Resisted" : ""}`,
          () => act(action),
        ),
      );
    }
    actions.append(
      command("Brace", "Recover 3 HP · soften the next hit", () =>
        act("guard"),
      ),
    );
  } else if (battleMenu === "bag") {
    actions.append(
      command(
        `Mending Draught · ${state.items.tonics}`,
        "Restore up to 22 HP · uses a turn",
        () => act("tonic"),
        !state.items.tonics || c.hp === c.maxHp,
      ),
    );
  } else {
    const captureReason = b.trainer
      ? "Wild creatures only"
      : state.team.length >= 6
        ? "Team full (6/6)"
        : !state.items.capsules
          ? "Restock with Mira"
          : "";
    actions.append(
      command("Fight", "Choose a move", () => openBattleMenu("moves")),
      command(
        "Catch",
        `${quantity(state.items.capsules, "vessel")} · ${captureReason || "Weaken first"}`,
        () => act("capture"),
        !!captureReason,
      ),
      command(
        "Bag",
        `${quantity(state.items.tonics, "draught")} · Restore HP`,
        () => openBattleMenu("bag"),
      ),
      command(
        "Team",
        "Switch companion",
        () => openBattleMenu("team"),
        !state.team.some((m, i) => i !== state.active && m.hp > 0),
      ),
      command(
        "Run",
        b.trainer ? "Finish this challenge first" : "Leave safely",
        () => act("flee"),
        b.trainer,
      ),
    );
  }
  if (
    (!b.result || battleBusy()) &&
    battleMenu !== "commands" &&
    battleMenu !== "team"
  )
    actions.append(
      button("Back", () => openBattleMenu("commands"), false, "back", null),
    );
  scene.append(actions);
}
function beginEncounter() {
  clearInput();
  battleMenu = "commands";
  panel = null;
  dialogue = null;
  const duration = entryDuration(cueFor(state));
  const overlay = node("div", null, "encounter-overlay");
  overlay.setAttribute("aria-hidden", "true");
  const frozen = node("canvas", null, "encounter-world");
  frozen.width = canvas.width;
  frozen.height = canvas.height;
  frozen.getContext("2d").drawImage(canvas, 0, 0);
  overlay.append(frozen);
  $("game").append(overlay);
  document.body.style.setProperty("--takeover-ms", `${duration * 0.43}ms`);
  document.body.style.setProperty("--entrance-ms", `${duration * 0.57}ms`);
  music.setCue(cueFor(state), {intro:true});
  encounter.start({ duration,
    show(phase) {
      document.body.dataset.entry = phase;
      overlay.dataset.phase = phase;
      if (phase === "entrances") {
        render();
        if (gameSoundReady()) music.effects.play("sendout");
      }
    },
    done({interrupted}) {
      overlay.remove();
      delete document.body.dataset.entry;
      music.finishIntro(interrupted);
      clearInput();
      render();
      if (!inputSuspended && !document.hidden && !$("game-menu").open &&
          document.hasFocus() && state.mode === "battle") focusScene("Fight");
    },
  });
}
function interruptEntry() { music.effects.stop(); encounter.finish(); }
function render() {
  const enteringBattle = renderedMode === "world" && state.mode === "battle";
  renderedMode = state.mode;
  if (enteringBattle) {
    clearInput();
    if (!inputSuspended && !document.hidden && !$("game-menu").open) beginEncounter();
  }
  const enteringTeam =
    panel === "team" && !document.body.classList.contains("in-menu");
  const focusKey = scene.contains(document.activeElement)
    ? document.activeElement.dataset.focus
    : null;
  const wasBattle = document.body.classList.contains("in-battle");
  music.setCue(cueFor(state));
  $("stage").classList.toggle(
    "has-scene",
    state.mode !== "world" || panel !== null || battleBusy(),
  );
  document.body.classList.toggle("in-battle", state.mode === "battle");
  document.body.classList.toggle("playing", state.mode !== "starter");
  document.body.classList.toggle(
    "in-menu",
    panel !== null || state.mode === "starter" ||
      (state.mode === "battle" && !state.team[state.active].hp && !battleBusy()),
  );
  document.body.classList.toggle("at-ending", state.mode === "ending");
  world();
  scene.replaceChildren();
  $("objective").textContent = state.flags.complete
    ? "Stillglass shines again. Return to Briarwick or keep exploring."
    : !state.flags.rival
      ? "Follow Sedgeway east. Rowan is waiting near the far end."
      : !state.flags.trainer
        ? "Head east to Saltwind Rise. Find Maren near the beacon."
        : !state.flags.puzzle
          ? "Enter Stillglass. Read the inscription and light the three bowls."
          : "The stairs are open. Rest, then meet Alder at the Lantern Crown.";
  $("location").textContent = maps[state.map].name;
  $("message").textContent = dialogue || "";
  $("dialogue").hidden = !dialogue || state.mode !== "world" || panel !== null;
  document.body.classList.toggle("in-dialogue", !!dialogue && state.mode === "world" && !panel);
  $("save").disabled = state.mode !== "world" || battleBusy() || travel.busy || trainerSight.busy;
  $("load").disabled = state.mode === "battle" || battleBusy() || travel.busy || trainerSight.busy;
  $("restart").disabled = battleBusy() || travel.busy || trainerSight.busy;
  $("team-toggle").disabled =
    state.mode === "starter" ||
    state.mode === "ending" ||
    battleBusy() ||
    travel.busy ||
    trainerSight.busy ||
    (state.mode === "battle" &&
      (!state.team[state.active].hp || !!state.battle.result));
  $("interact").disabled =
    state.mode !== "world" ||
    panel !== null ||
    battleBusy() ||
    trainerSight.busy ||
    !worldLoaded || !!dialogue;
  $("joystick").setAttribute("aria-disabled", String(!canExplore()));
  $("sprint").disabled = !canExplore();
  if (!canExplore()) { joystick.reset(); sprint.reset(); }
  if (presentation?.kind === "loss") {
    scene.append(node("h2", "Safe at home"), node("p", state.message));
  } else if (state.mode === "starter") {
    scene.append(
      node("h2", "Who will travel with you?"),
      node(
        "p",
        "Stillglass Beacon has fallen dark, but wild creatures still carry its embers. Choose a friend and follow their light.",
      ),
    );
    const grid = node("div", null, "starter-grid");
    for (const id of starters) {
      const el = button(species[id].name, () => {
        chooseStarter(state, id);
        music.effects.play("sendout");
        store();
        render();
      }, false, species[id].name, null);
      el.prepend(marker(id));
      el.append(
        node("small", `${typeNames[species[id].type]} · ${species[id].hp} HP`),
      );
      grid.append(el);
    }
    scene.append(
      grid,
      node(
        "p",
        "Returning to the coast? Open Menu, then Load to restore a saved adventure.",
      ),
    );
  } else if (state.mode === "ending") {
    scene.append(
      node("h2", "A light worth sharing"),
      node(
        "p",
        "The creatures gather around the lantern. One by one, they offer their embers until a warm beam reaches across the sea.",
      ),
      node(
        "p",
        "Alder opens the shutters. Far below, the windows of Briarwick answer with tiny lights. The missing embers were never stolen. They were being kept safe.",
      ),
      node(
        "p",
        "Chapter complete. Your companions and the coast are still yours to explore.",
      ),
      button("Return to the coast", () => {
        state.mode = "world";
        store();
        render();
      }),
    );
  } else if (
    panel === "team" ||
    (state.mode === "battle" && !state.team[state.active].hp && !battleBusy())
  )
    renderTeam(state.mode === "battle");
  else if (state.mode === "battle") renderBattle();
  if (!battleBusy() && (focusKey || (!wasBattle && state.mode === "battle")))
    focusScene(focusKey);
  if (dialogue && !panel && state.mode === "world") $("dialogue-close").focus({preventScroll:true});
  if (enteringTeam) scene.scrollTop = 0;
  scene.setAttribute("aria-busy", String(battleBusy()));
  scene.inert = encounter.busy;
  worldClock.sync();
}
const sprint = bindSprint($("sprint"), { enabled: canExplore });
const joystick = bindJoystick($("joystick"), {
  enabled: canExplore,
  change: (direction) => {
    travel.release("joystick");
    if (direction) travel.press("joystick", direction);
  },
});
function clearInput() {
  joystick.reset();
  sprint.reset();
  travel.clear();
  queuedInteraction = null;
}
function updateDisplay() {
  interruptEntry();
  clearInput();
  worldClock.stop();
  inputSuspended = portraitGate(innerWidth, innerHeight,
    matchMedia("(any-pointer: coarse)").matches || navigator.maxTouchPoints > 0);
  $("rotate-gate").hidden = !inputSuspended;
  $("game").inert = inputSuspended;
  if (inputSuspended && $("game-menu").open) $("game-menu").close();
  $("fullscreen").textContent = document.fullscreenElement ? "Exit screen" : "Full screen";
  render();
}
$("fullscreen").addEventListener("click", async () => {
  music.effects.play("confirm");
  clearInput();
  const result = await toggleFullscreen(document.documentElement, document, screen.orientation);
  $("display-status").textContent = ['denied', 'unavailable'].includes(result)
    ? "Full screen is unavailable here. The game still fills your browser window."
    : "";
  if (['denied', 'unavailable'].includes(result)) {
    $("game-menu").showModal();
    $("menu-close").focus();
  }
  if (["entered", "exited"].includes(result) && $("game-menu").open) $("game-menu").close();
  updateDisplay();
});
document.addEventListener("fullscreenchange", updateDisplay);
$("menu-toggle").addEventListener("click", () => {
  interruptEntry();
  clearInput();
  $("game-menu").showModal();
  worldClock.stop();
  render();
  music.effects.play("confirm");
  $("menu-close").focus();
});
$("menu-close").addEventListener("click", () => { music.effects.play("back"); $("game-menu").close(); });
$("game-menu").addEventListener("close", () => {
  clearInput();
  render();
  if (panel) focusScene("back");
  else if (dialogue) $("dialogue-close").focus({preventScroll:true});
  else $("menu-toggle").focus({preventScroll:true});
});
for (const name of ["contextmenu", "selectstart", "dragstart"])
  $("game").addEventListener(name, (event) => event.preventDefault());
function closeDialogue() {
  music.effects.play("back");
  clearInput();
  dialogue = null;
  render();
  $("interact").focus({preventScroll:true});
}
$("dialogue-close").addEventListener("click", closeDialogue);
function talk() {
  if (!canExplore()) return;
  afterTravel(() => {
    const npc = maps[state.map].npcs.find(n => n.x === state.x + state.facing[0] && n.y === state.y + state.facing[1]);
    const bowl = state.bowlStep, solved = state.flags.puzzle;
    interact(state);
    if (state.mode === "world") {
      const effect = !npc ? "unavailable" : ["healer", "rest"].includes(npc.id) ? "heal"
        : !solved && state.flags.puzzle ? "reward"
        : state.bowlStep > bowl ? "light"
        : npc.id === "reset" || (npc.id.startsWith("bowl-") && !solved && state.bowlStep === 0) ? "reset" : "interact";
      music.effects.play(effect);
      store();
      dialogue = state.message;
    }
    render();
  });
}
$("interact").addEventListener("click", () => {
  if (battleBusy()) return;
  talk();
});
$("team-toggle").addEventListener("click", () => {
  if (battleBusy()) return;
  clearInput();
  music.effects.play(panel ? "back" : "confirm");
  battleMenu = "commands";
  panel = panel ? null : "team";
  if ($("game-menu").open) $("game-menu").close();
  render();
  if (panel) focusScene();
});
$("save").addEventListener("click", () => {
  store(true);
  render();
});
$("load").addEventListener("click", () => {
  music.effects.play("confirm");
  load();
  $("display-status").textContent = state.message;
});
$("restart").addEventListener("click", () => {
  if (battleBusy()) return;
  if (
    confirm(
      "Start a new adventure? Your current save will be replaced when you choose a companion.",
    )
  ) {
    music.effects.play("confirm");
    $("game-menu").close();
    clearInput();
    state = newGame();
    panel = null;
    dialogue = null;
    render();
  }
});
$("sound").addEventListener("click", async () => {
  try {
    const enabled = await music.toggle();
    $("sound").textContent = enabled ? "Sound on" : "Sound off";
    $("sound").setAttribute("aria-pressed", String(enabled));
    if (enabled) music.effects.play("confirm");
  } catch {
    $("sound").textContent = "Sound unavailable";
  }
});
document.addEventListener("visibilitychange", () => {
  music.setHidden(document.hidden);
  if (document.hidden) { interruptEntry(); clearInput(); worldClock.stop(); }
  else worldClock.sync();
});
const directions = {
  ArrowUp: [0, -1],
  w: [0, -1],
  ArrowDown: [0, 1],
  s: [0, 1],
  ArrowLeft: [-1, 0],
  a: [-1, 0],
  ArrowRight: [1, 0],
  d: [1, 0],
};
document.addEventListener("keyup", (event) => {
  travel.release(directionKey(event.key));
  if (event.key === "Shift") sprint.release("keyboard");
});
window.addEventListener("blur", () => { explorationBlurred = true; interruptEntry(); clearInput(); worldClock.stop(); });
window.addEventListener("focus", () => { explorationBlurred = false; render(); });
document.addEventListener("keydown", (event) => {
  if (inputSuspended) { event.preventDefault(); return; }
  if (event.key === "Shift") {
    if (canExplore() && !event.repeat) sprint.press("keyboard");
    return;
  }
  if ($("game-menu").open) {
    if (!event.repeat && event.key === "Tab") music.effects.play("navigate");
    if (!event.repeat && event.key === "Escape") music.effects.play("back");
    return;
  }
  if (event.key === "Tab" && !event.repeat && !battleBusy()) music.effects.play("navigate");
  if (
    (event.key === "Enter" || event.key === " ") &&
    (event.repeat || battleBusy())
  ) {
    event.preventDefault();
    return;
  }
  if (dialogue && state.mode === "world" && !panel) {
    if (event.key === "Escape") {event.preventDefault();closeDialogue();}
    else if (["Enter", " "].includes(event.key) && !event.target.closest?.("button")) {
      event.preventDefault();closeDialogue();
    } else if (directions[directionKey(event.key)]) event.preventDefault();
    return;
  }
  if (battleBusy()) {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape"].includes(
        event.key,
      )
    )
      event.preventDefault();
    return;
  }
  if (event.target.closest?.("#field-guide")) {
    if (event.key === "Escape") {
      event.preventDefault();
      music.effects.play("back");
      $("field-guide").open = false;
      if (state.mode === "world" && !panel)
        $("interact").focus({ preventScroll: true });
      else focusScene("back");
    }
    return;
  }
  if (
    scene.contains(event.target) &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    const choices = [...scene.querySelectorAll("button:not(:disabled)")];
    const index = choices.indexOf(document.activeElement);
    if (index >= 0) {
      event.preventDefault();
      const grid = document.activeElement.closest(
        ".command-grid, .starter-grid",
      );
      const columns = grid
        ? getComputedStyle(grid).gridTemplateColumns.split(" ").length
        : 1;
      if (grid?.classList.contains("primary-commands") &&
          ["ArrowDown", "ArrowUp"].includes(event.key)) {
        // Follow visible rows, including the spanning Run button and disabled
        // slots. Counting enabled buttons loses the grid's spatial order.
        const rows = choices.map(button => ({button, rect: button.getBoundingClientRect()}));
        const current = rows[index].rect;
        const down = event.key === "ArrowDown";
        const ahead = rows.filter(({rect}) => down
          ? rect.top > current.top + 1 : rect.top < current.top - 1);
        const candidates = ahead.length ? ahead : rows;
        const top = (down ? Math.min : Math.max)(...candidates.map(({rect}) => rect.top));
        const center = (current.left + current.right) / 2;
        candidates.filter(({rect}) => Math.abs(rect.top - top) < 1)
          .sort((a,b) => Math.abs((a.rect.left + a.rect.right) / 2 - center) -
            Math.abs((b.rect.left + b.rect.right) / 2 - center))[0].button.focus();
        if (!event.repeat) music.effects.play("navigate");
        return;
      }
      const delta =
        event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowDown"
              ? columns
              : -columns;
      choices[(index + delta + choices.length) % choices.length]?.focus();
      if (!event.repeat) music.effects.play("navigate");
    }
    return;
  }
  if (event.key === "Escape") {
    if (state.mode === "starter" || state.mode === "ending") return;
    event.preventDefault();
    if (state.mode === "battle") {
      if (!state.team[state.active].hp || state.battle.result) return;
      if (panel || battleMenu !== "commands") openBattleMenu("commands");
      return;
    }
    afterTravel(() => {
      music.effects.play(panel ? "back" : "confirm");
      panel = panel ? null : "team";
      render();
      if (panel) focusScene();
      else $("menu-toggle").focus({ preventScroll: true });
    });
    return;
  }
  if (state.mode !== "world" || panel) return;
  const key = directionKey(event.key),
    dir = directions[key];
  if (!canExplore()) { if (dir) event.preventDefault(); return; }
  if (dir) {
    event.preventDefault();
    if (!event.repeat) travel.press(key, dir);
  }
  if (
    (event.key === "Enter" || event.key === " ") &&
    !event.target.closest?.("button, summary, a, input, select, textarea")
  ) {
    event.preventDefault();
    if (event.repeat) return;
    talk();
  }
});
document.addEventListener("pointerdown", event => {
  const target = event.target.closest?.("button:disabled");
  if (target && event.button === 0 && !battleBusy()) music.effects.play("unavailable");
}, true);
document.addEventListener("click", event => {
  if (event.target.closest?.("summary")) music.effects.play("confirm");
});
try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) state = decodeSave(saved);
} catch {
  state.message =
    "The previous save could not be read. Choose a companion to begin a new adventure.";
  $("display-status").textContent = state.message;
  requestAnimationFrame(() => $("game-menu").showModal());
}
render();
worldReady
  .then(() => {
    worldLoaded = true;
    render();
  })
  .catch(() => {
    state.message = "The world artwork could not load. Try reloading the page.";
    dialogue = state.message;
    $("display-status").textContent = state.message;
    if (state.mode !== "world" && !$("game-menu").open) $("game-menu").showModal();
    render();
  });

window.addEventListener("resize", updateDisplay);
window.visualViewport?.addEventListener("resize", updateDisplay);
screen.orientation?.addEventListener("change", updateDisplay);
updateDisplay();
