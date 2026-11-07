import { Music, cueFor } from "./audio.js";
import {
  species,
  starters,
  typeNames,
  typedMoves,
  maps,
  rescues,
} from "./data.js";
import {
  newGame,
  chooseStarter,
  interact,
  moveInfo,
  finishBattle,
  encodeSave,
  decodeSave,
  SAVE_KEY,
} from "./engine.js";
import { TileTravel } from "./travel.js";
import { onPath, decorations, npcArt } from "./world-layout.js";
import { planBattleTurn, BattleSequence } from "./battle-sequence.js";
let state = newGame(),
  panel = null;
const music = new Music();
const sequence = new BattleSequence();
let battleMenu = "commands",
  presentation = null,
  previousFrame = null;
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id),
  scene = $("scene"),
  canvas = $("world"),
  ctx = canvas.getContext("2d");
let queuedInteraction = null;
const travel = new TileTravel({
  getState: () => state,
  canMove: () =>
    state.mode === "world" && !panel && !sequence.busy && worldLoaded,
  draw: (pose) => {
    if (pose.progress === 0) render();
    else world();
  },
  commit: (next, before) => {
    state = next;
    if (before.map !== next.map) {
      store();
      sceneTransition();
    }
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
  travel.clear();
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
function button(text, fn, disabled = false, key = text) {
  const el = node("button", text);
  el.type = "button";
  el.disabled = disabled || sequence.busy;
  el.dataset.focus = key;
  el.addEventListener("click", () => {
    if (!sequence.busy) fn();
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
    if (announce) state.message = "Saved on this device.";
  } catch {
    state.message =
      "Could not save on this device. Check your browser storage settings. You can keep playing.";
  }
}
function load() {
  if (sequence.busy) return;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state.message = "No saved adventure on this device yet.";
    } else {
      state = decodeSave(raw);
      panel = null;
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
  const pose = travel.position();
  const px = pose?.x ?? state.x,
    py = pose?.y ?? state.y;
  const map = maps[state.map],
    inside = ["cellar", "summit"].includes(state.map);
  const narrow = innerWidth <= 600,
    columns = narrow ? 12 : 20,
    rows = narrow ? 9 : 13;
  canvas.width = columns * 24;
  canvas.height = rows * 24;
  const cameraX = Math.max(
      0,
      Math.min(20 - columns, px - Math.floor(columns / 2)),
    ),
    cameraY =
      narrow && ["ridge", "summit"].includes(state.map) && state.y <= 6
        ? 0
        : Math.max(
            0,
            Math.min(
              13 - rows,
              py - (state.map === "village" ? 7 : Math.floor(rows / 2)),
            ),
          );
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.translate(-Math.round(cameraX * 24), -Math.round(cameraY * 24));
  if (!worldLoaded) return;
  const draw = (id, x, y, width = 24, height = 24) =>
    ctx.drawImage(worldAssets[id], x, y, width, height);
  map.rows.forEach((row, y) =>
    [...row].forEach((tile, x) => {
      let id = inside ? "floor" : onPath(state.map, x, y) ? "path" : "meadow";
      if (tile === "#") id = inside ? "wall" : "water";
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
    let id =
      npcArt[n.id] ||
      (n.id === "healer" || n.id === "rest" ? "healer" : "trainer");
    const actor =
      !n.id.startsWith("rescue-") &&
      !n.id.startsWith("bowl-") &&
      !["reset", "inscription", "beacon"].includes(n.id);
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
    draw(id, n.x * 24 + (actor ? 4 : 0), n.y * 24, actor ? 16 : 24, 24);
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#20323b";
    ctx.fillText(n.label, n.x * 24 + 13, n.y * 24 - 2);
    ctx.fillStyle = "#f5e7c0";
    ctx.fillText(n.label, n.x * 24 + 12, n.y * 24 - 3);
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
    Math.round(px * 24) + 4,
    Math.round(py * 24),
    16,
    24,
  );
  canvas.setAttribute(
    "aria-label",
    `${map.name}. Position ${state.x}, ${state.y}.`,
  );
}

function renderTeam(inBattle = false) {
  const forced = inBattle && state.team[state.active].hp === 0;
  scene.append(
    node(
      "h2",
      forced
        ? "Who will take their place?"
        : inBattle
          ? "Switch companion"
          : "Your team",
    ),
  );
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
    row.append(
      marker(c.species),
      node(
        "span",
        `${species[c.species].name} · Lv. ${c.level} · ${typeNames[species[c.species].type]}\nHP ${c.hp}/${c.maxHp}${i === state.active ? " · Lead" : ""}`,
      ),
    );
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
      ),
    );
    list.append(row);
  });
  scene.append(list);
  if (!inBattle) {
    scene.append(
      node("h3", `Field journal · ${state.rescued.length}/3 sheltered sparks`),
    );
    for (const [id, rescue] of Object.entries(rescues))
      scene.append(
        node(
          "p",
          state.rescued.includes(id)
            ? rescue.title + ": " + rescue.clue
            : rescue.title + ": not yet found.",
        ),
      );
  }
  if (!forced)
    scene.append(
      button(
        "Back",
        () => {
          panel = null;
          battleMenu = "commands";
          render();
          if (state.mode === "world")
            $("team-toggle").focus({ preventScroll: true });
        },
        false,
        "back",
      ),
    );
}
function fighter(c, side) {
  const el = node("div", null, `fighter ${side}`);
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
  requestAnimationFrame(() => {
    fill.style.width = `${(100 * c.hp) / c.maxHp}%`;
  });
  if (
    presentation?.target === side ||
    (presentation?.actor === side &&
      ["switch", "guard", "victory", "sendout"].includes(presentation.kind))
  ) {
    el.classList.add(`effect-${presentation.kind}`);
    if (presentation.damage)
      el.append(node("span", `−${presentation.damage}`, "damage-number"));
  }
  el.append(stat);
  return el;
}
async function act(action, index) {
  if (sequence.busy || state.mode !== "battle") return;
  const plan = planBattleTurn(state, action, index);
  panel = null;
  const completed = await sequence.play(
    plan,
    (frame) => {
      previousFrame = state;
      state = frame.state;
      presentation = frame;
      render();
    },
    reducedMotion(),
  );
  if (completed) state = plan.finalState;
  presentation = null;
  previousFrame = null;
  battleMenu = "commands";
  if (state.mode === "world") store();
  render();
  focusScene();
}
function focusScene(key) {
  const buttons = [...scene.querySelectorAll("button:not(:disabled)")];
  (buttons.find((b) => b.dataset.focus === key) || buttons[0])?.focus({
    preventScroll: true,
  });
}
function openBattleMenu(menu) {
  battleMenu = menu;
  panel = menu === "team" ? "team" : null;
  render();
  focusScene();
}
function command(title, detail, fn, disabled = false, key = title) {
  const el = button("", fn, disabled, key);
  el.append(node("strong", title), node("small", detail));
  return el;
}
function renderBattle() {
  const b = state.battle,
    c = state.team[state.active];
  scene.append(
    node("h2", b.trainer ? `Challenge · ${b.name}` : "Wild encounter"),
  );
  const field = node("div", null, "battlefield");
  field.append(fighter(b.enemy, "enemy"), fighter(c, "ally"));
  scene.append(field);
  const log = node("div", null, "battle-log");
  log.setAttribute("role", "status");
  log.setAttribute("aria-live", "polite");
  const phases = {
    "player-hit": "Your move",
    "enemy-hit": "Their reply",
    guard: "Bracing",
    heal: "Mending",
    capture: "A new companion!",
    "capture-miss": "Broke free",
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
  actions.setAttribute("aria-busy", String(sequence.busy));
  if (b.result && !sequence.busy) {
    actions.append(
      command(
        "Continue",
        b.result === "capture"
          ? "Meet your new companion in Team"
          : "Return to your adventure",
        () => {
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
    const noCapture =
      b.trainer || !state.items.capsules || state.team.length >= 6;
    actions.append(
      command(
        `Spark Vessel · ${state.items.capsules}`,
        b.trainer
          ? "Wild creatures only"
          : state.team.length >= 6
            ? "Your team is full"
            : "Catch a creature · weaken it first",
        () => act("capture"),
        noCapture,
      ),
    );
    actions.append(
      command(
        `Mending Draught · ${state.items.tonics}`,
        "Restore up to 22 HP · uses a turn",
        () => act("tonic"),
        !state.items.tonics || c.hp === c.maxHp,
      ),
    );
  } else {
    actions.append(
      command("Fight", "Choose a move", () => openBattleMenu("moves")),
      command(
        "Bag",
        `${state.items.capsules} vessels · ${state.items.tonics} draughts`,
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
    (!b.result || sequence.busy) &&
    battleMenu !== "commands" &&
    battleMenu !== "team"
  )
    actions.append(
      button("Back", () => openBattleMenu("commands"), false, "back"),
    );
  scene.append(actions);
}
function render() {
  const focusKey = scene.contains(document.activeElement)
    ? document.activeElement.dataset.focus
    : null;
  const wasBattle = document.body.classList.contains("in-battle");
  music.setCue(cueFor(state));
  $("stage").classList.toggle(
    "has-scene",
    state.mode !== "world" || panel !== null || sequence.busy,
  );
  document.body.classList.toggle("in-battle", state.mode === "battle");
  document.body.classList.toggle(
    "in-menu",
    panel !== null || state.mode === "starter",
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
  $("message").textContent = state.message;
  $("save").disabled = state.mode !== "world" || sequence.busy || travel.busy;
  $("load").disabled = state.mode === "battle" || sequence.busy || travel.busy;
  $("restart").disabled = sequence.busy || travel.busy;
  $("team-toggle").disabled =
    state.mode === "starter" ||
    state.mode === "ending" ||
    sequence.busy ||
    travel.busy ||
    (state.mode === "battle" &&
      (!state.team[state.active].hp || !!state.battle.result));
  $("interact").disabled =
    state.mode !== "world" || panel !== null || sequence.busy || travel.busy;
  document
    .querySelectorAll("[data-dir]")
    .forEach(
      (b) =>
        (b.disabled =
          state.mode !== "world" || panel !== null || sequence.busy),
    );
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
        store();
        render();
      });
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
        "Returning to the coast? Use Load to restore a saved adventure.",
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
    (state.mode === "battle" && !state.team[state.active].hp && !sequence.busy)
  )
    renderTeam(state.mode === "battle");
  else if (state.mode === "battle") renderBattle();
  if (!sequence.busy && (focusKey || (!wasBattle && state.mode === "battle")))
    focusScene(focusKey);
  scene.setAttribute("aria-busy", String(sequence.busy));
}
document.querySelectorAll("[data-dir]").forEach((button) => {
  const direction = button.dataset.dir.split(",").map(Number);
  button.addEventListener("pointerdown", (event) => {
    if (button.disabled || event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    travel.press(`pointer-${event.pointerId}`, direction);
  });
  const release = (event) => travel.release(`pointer-${event.pointerId}`);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  // Keyboard activation has no pointer event; keep native accessible buttons.
  button.addEventListener("click", (event) => {
    if (event.detail === 0 && !button.disabled) travel.tap(direction);
  });
});
function talk() {
  afterTravel(() => {
    interact(state);
    if (state.mode === "world") store();
    render();
  });
}
$("interact").addEventListener("click", () => {
  if (sequence.busy) return;
  talk();
});
$("team-toggle").addEventListener("click", () => {
  if (sequence.busy) return;
  battleMenu = "commands";
  panel = panel ? null : "team";
  render();
  if (panel) focusScene();
});
$("save").addEventListener("click", () => {
  store(true);
  render();
});
$("load").addEventListener("click", load);
$("restart").addEventListener("click", () => {
  if (sequence.busy) return;
  if (
    confirm(
      "Start a new adventure? Your current save will be replaced when you choose a companion.",
    )
  ) {
    state = newGame();
    panel = null;
    render();
  }
});
$("sound").addEventListener("click", async () => {
  try {
    const enabled = await music.toggle();
    $("sound").textContent = enabled ? "Sound on" : "Sound off";
    $("sound").setAttribute("aria-pressed", String(enabled));
  } catch {
    $("sound").textContent = "Sound unavailable";
  }
});
document.addEventListener("visibilitychange", () => {
  music.setHidden(document.hidden);
  if (document.hidden) travel.clear();
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
document.addEventListener("keyup", (event) => travel.release(event.key));
window.addEventListener("blur", () => travel.clear());
document.addEventListener("keydown", (event) => {
  if (
    (event.key === "Enter" || event.key === " ") &&
    (event.repeat || sequence.busy)
  ) {
    event.preventDefault();
    return;
  }
  if (sequence.busy) {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape"].includes(
        event.key,
      )
    )
      event.preventDefault();
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
      const delta =
        event.key === "ArrowRight"
          ? 1
          : event.key === "ArrowLeft"
            ? -1
            : event.key === "ArrowDown"
              ? columns
              : -columns;
      choices[(index + delta + choices.length) % choices.length]?.focus();
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
      panel = panel ? null : "team";
      render();
      if (panel) focusScene();
      else $("team-toggle").focus({ preventScroll: true });
    });
    return;
  }
  if (state.mode !== "world" || panel) return;
  const dir = directions[event.key];
  if (dir) {
    event.preventDefault();
    if (!event.repeat) travel.press(event.key, dir);
  }
  if (
    (event.key === "Enter" || event.key === " ") &&
    event.target.tagName !== "BUTTON"
  ) {
    event.preventDefault();
    if (event.repeat) return;
    talk();
  }
});
try {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) state = decodeSave(saved);
} catch {
  state.message =
    "The previous save could not be read. Choose a companion to begin a new adventure.";
}
render();
worldReady
  .then(() => {
    worldLoaded = true;
    render();
  })
  .catch(() => {
    state.message = "The world artwork could not load. Try reloading the page.";
    render();
  });

window.addEventListener("resize", () => render());
