import { walk } from "./engine.js";

// A tile is planned once, then committed at arrival. Rendering can interpolate
// freely without moving collisions, rolling encounters twice or saving mid-step.
export const directionKey = (key) =>
  key.length === 1 ? key.toLowerCase() : key;

export class TileTravel {
  constructor({
    getState,
    canMove,
    commit,
    draw,
    now = () => performance.now(),
    requestFrame = (callback) => requestAnimationFrame(callback),
    duration = 145,
    rng = Math.random,
  }) {
    Object.assign(this, {
      getState,
      canMove,
      commit,
      draw,
      now,
      requestFrame,
      duration,
      rng,
    });
    this.held = new Map();
    this.motion = null;
    this.scheduled = false;
    this.retryAt = 0;
    this.stride = 0;
  }
  get busy() {
    return !!this.motion;
  }
  press(key, direction) {
    if (this.held.has(key)) return;
    this.held.set(key, direction);
    this.retryAt = 0;
    this.tick(this.now());
  }
  release(key) {
    this.held.delete(key);
  }
  clear() {
    this.held.clear();
  }
  tap(direction) {
    this.press("tap", direction);
    this.release("tap");
  }
  position(time = this.now()) {
    if (!this.motion) return null;
    const m = this.motion,
      progress = Math.min(1, Math.max(0, (time - m.start) / this.duration));
    return {
      x: m.x + m.dx * progress,
      y: m.y + m.dy * progress,
      progress,
      stride: this.stride,
    };
  }
  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    this.requestFrame((time) => {
      this.scheduled = false;
      this.tick(time);
    });
  }
  tick(time) {
    if (this.motion) {
      const pose = this.position(time);
      if (pose.progress < 1) {
        this.draw(pose);
        this.schedule();
        return;
      }
      const { next, before } = this.motion;
      this.motion = null;
      this.commit(next, before);
      if (!this.canMove()) this.clear();
    }
    if (this.held.size && this.canMove() && time >= this.retryAt) {
      const [dx, dy] = [...this.held.values()].at(-1);
      const before = this.getState(),
        next = structuredClone(before);
      const moved = walk(next, dx, dy, this.rng);
      // Facing changes immediately, even when the destination is blocked.
      before.facing = [...next.facing];
      if (moved) {
        this.stride++;
        this.motion = {
          x: before.x,
          y: before.y,
          dx,
          dy,
          next,
          before,
          start: time,
        };
        this.draw(this.position(time));
      } else {
        this.commit(next, before);
        this.retryAt = time + this.duration;
      }
    }
    if (this.motion || (this.held.size && this.canMove())) this.schedule();
  }
}
