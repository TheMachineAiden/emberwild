// Transient trainer presentation/controller state. Static map NPC positions and
// version-1 saves remain unchanged; there is no pathfinder or encounter RNG.
export const trainerSight = {
  liv: { facing: [-1, 0], range: 4, turnEvery: 3200 },
  edda: { facing: [0, 1], range: 4, turnEvery: 4000 },
  keeper: { facing: [0, 1], range: 4, turnEvery: 0 },
};
const directions = [[0, 1], [-1, 0], [0, -1], [1, 0]];
const same = (a, b) => a[0] === b[0] && a[1] === b[1];
const playerKey = (s) => `${s.map}:${s.x},${s.y}`;

export function trainerTileOpen(map, x, y, id) {
  const tile = map.rows[y]?.[x];
  return !!tile && !"#TH".includes(tile) &&
    !map.npcs.some(n => n.id !== id && n.x === x && n.y === y) &&
    !map.exits.some(e => e.x === x && e.y === y);
}

export function inTrainerSight(map, actor, player, facing, range) {
  const dx = player.x - actor.x, dy = player.y - actor.y;
  const distance = Math.abs(dx) + Math.abs(dy);
  if (!distance || distance > range ||
      dx !== facing[0] * distance || dy !== facing[1] * distance) return false;
  for (let step = 1; step < distance; step++)
    if (!trainerTileOpen(map, actor.x + facing[0] * step,
      actor.y + facing[1] * step, actor.id)) return false;
  return true;
}

export class TrainerSight {
  constructor(maps, trainers, definitions = trainerSight) {
    Object.assign(this, { maps, trainers, definitions });
    this.map = null;
    this.elapsed = 0;
    this.lastTime = null;
    this.active = null;
    this.suppressed = null;
  }
  get busy() { return !!this.active; }
  facing(id) {
    const config = this.definitions[id];
    if (!config) return [0, 1];
    const index = directions.findIndex(d => same(d, config.facing));
    const turns = config.turnEvery ? Math.floor(this.elapsed / config.turnEvery) : 0;
    return directions[(index + turns) % directions.length];
  }
  suspend() {
    if (this.active) this.suppressed = this.active.player;
    this.active = null;
    this.lastTime = null;
  }
  // Called by the world update, and once at a committed player arrival. Drawing
  // calls pose() only. Movement must be gated while busy; moving skips detection
  // so no trainer can reserve a player's half-completed tile.
  tick(state, time, { enabled = true, moving = false } = {}) {
    if (this.map !== state.map) {
      this.suspend(); this.map = state.map; this.elapsed = 0;
      this.suppressed = null;
    }
    if (!enabled || state.mode !== "world") { this.suspend(); return []; }
    if (this.lastTime !== null) this.elapsed += Math.max(0, time - this.lastTime);
    this.lastTime = time;
    const key = playerKey(state), map = this.maps[state.map];
    if (this.suppressed !== key) this.suppressed = null;
    const a = this.active;
    if (a) {
      if (a.player !== key || state.flags[this.trainers[a.id].flag]) {
        this.suspend(); return [];
      }
      if (a.phase === "engaged") return [];
      if (a.phase === "notice") {
        if (time - a.started < 450) return [];
        a.phase = "approach";
      }
      if (a.step) {
        if (time - a.step.start < 280) return [];
        a.x = a.step.x; a.y = a.step.y; a.step = null;
      }
      if (Math.abs(state.x - a.x) + Math.abs(state.y - a.y) === 1) {
        a.phase = "engaged";
        return [{ type: "encounter", id: a.id }];
      }
      const x = a.x + a.facing[0], y = a.y + a.facing[1];
      if (!trainerTileOpen(map, x, y, a.id)) {
        this.suspend(); return [{ type: "blocked", id: a.id }];
      }
      a.step = { x, y, start: time };
      return [];
    }
    if (moving || this.suppressed === key) return [];
    for (const npc of map.npcs) {
      const config = this.definitions[npc.id], trainer = this.trainers[npc.id];
      if (!config || !trainer || state.flags[trainer.flag]) continue;
      const facing = this.facing(npc.id);
      if (!inTrainerSight(map, npc, state, facing, config.range)) continue;
      this.active = { id: npc.id, x: npc.x, y: npc.y, facing: [...facing],
        phase: "notice", started: time, player: key, step: null };
      return [{ type: "notice", id: npc.id }];
    }
    return [];
  }
  pose(npc, time) {
    const a = this.active;
    if (!a || a.id !== npc.id) return { x: npc.x, y: npc.y, facing: this.facing(npc.id), notice: false };
    const progress = a.step ? Math.max(0, Math.min(1, (time - a.step.start) / 280)) : 0;
    return {
      x: a.x + (a.step ? a.step.x - a.x : 0) * progress,
      y: a.y + (a.step ? a.step.y - a.y : 0) * progress,
      facing: a.facing, notice: a.phase === "notice", moving: !!a.step,
      frame: progress < .5 ? 1 : 2,
    };
  }
}
