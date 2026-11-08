// One cancelable world update owner. Hidden scenes do not schedule frames;
// active time pauses rather than making ambient art jump on resume.
export class WorldClock {
  constructor({ enabled, update, draw, pause = () => {},
    request = callback => requestAnimationFrame(callback),
    cancel = handle => cancelAnimationFrame(handle) }) {
    Object.assign(this, { enabled, update, draw, pause, request, cancel });
    this.frame = null;
    this.last = null;
    this.time = 0;
    this.generation = 0;
  }
  sync() {
    if (!this.enabled()) { this.stop(); return; }
    if (this.frame === null) {
      const token = this.generation;
      this.frame = this.request(time => {
        if (token === this.generation) this.tick(time);
      });
    }
  }
  stop() {
    this.generation++;
    if (this.frame !== null) this.cancel(this.frame);
    this.frame = null;
    this.last = null;
    this.pause();
  }
  tick(now) {
    this.frame = null;
    if (!this.enabled()) { this.stop(); return; }
    if (this.last !== null) this.time += Math.max(0, now - this.last);
    this.last = now;
    const dirty = this.update(now, this.time);
    if (dirty && this.enabled()) this.draw();
    this.sync();
  }
}

export const waterFrame = time => [0, 1, 2, 1][Math.floor(time / 350) % 4];

export class UnderfootGrass {
  touch(mapId, map, pose, time) {
    const x = Math.round(pose.x), y = Math.round(pose.y);
    if (map.rows[y]?.[x] !== "g") return;
    this.last = { map: mapId, x: pose.x * 24 + 12, y: pose.y * 24 + 23,
      at: time, frame: 1 + ((Math.floor(pose.progress * 4) + pose.stride) % 2) };
  }
  clear() { this.last = null; }
  pose(mapId, time, reduced = false) {
    if (reduced || !this.last || this.last.map !== mapId) return null;
    const age = Math.max(0, time - this.last.at);
    if (age >= 220) return null;
    return { ...this.last, alpha: 1 - age / 220 };
  }
}
