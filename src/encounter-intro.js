// Presentation only: the engine has already committed exactly one encounter.
// Independent absolute timers keep a slow frame from extending the entrance.
export class EncounterIntro {
  constructor({ setTimer = (fn, ms) => setTimeout(fn, ms),
    clearTimer = id => clearTimeout(id) } = {}) {
    Object.assign(this, {setTimer, clearTimer});
    this.phase = null;
    this.generation = 0;
    this.timers = [];
  }
  get busy() { return this.phase !== null; }
  start({ duration, show, done }) {
    if (this.busy) return false;
    const token = ++this.generation;
    this.done = done;
    this.phase = "takeover";
    show(this.phase);
    this.timers.push(this.setTimer(() => {
      if (token !== this.generation) return;
      this.phase = "entrances";
      show(this.phase);
    }, duration * 0.43));
    this.timers.push(this.setTimer(() => {
      if (token === this.generation) this.finish(false);
    }, duration));
    return true;
  }
  finish(interrupted = true) {
    if (!this.busy) return false;
    this.generation++;
    for (const timer of this.timers) this.clearTimer(timer);
    this.timers = [];
    this.phase = null;
    const done = this.done;
    this.done = null;
    done({interrupted});
    return true;
  }
}
