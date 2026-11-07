import { battleAction } from "./engine.js";

// Resolve randomness once on a copy. Presentation may reveal these snapshots over
// time without rerolling a turn or mutating a save halfway through an animation.
export function planBattleTurn(state, action, index, rng = Math.random) {
  const finalState = structuredClone(state);
  const frames = [];
  const accepted = battleAction(finalState, action, index, rng, (frame) =>
    frames.push(frame),
  );
  return { accepted, frames, finalState };
}

const durations = {
  "player-hit": 320,
  "enemy-hit": 340,
  guard: 260,
  heal: 300,
  capture: 650,
  "capture-miss": 380,
  switch: 300,
  flee: 200,
  victory: 500,
  sendout: 400,
  faint: 360,
  loss: 450,
};

export class BattleSequence {
  constructor(
    wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  ) {
    this.wait = wait;
    this.busy = false;
    this.generation = 0;
  }

  cancel() {
    this.generation++;
    this.busy = false;
  }

  async play(plan, show, reducedMotion = false) {
    if (this.busy) return false;
    if (!plan.accepted) {
      show({ kind: "notice", state: plan.finalState });
      return false;
    }
    const token = ++this.generation;
    this.busy = true;
    try {
      for (const frame of plan.frames) {
        if (token !== this.generation) return false;
        show(frame);
        await this.wait(reducedMotion ? 160 : durations[frame.kind] || 260);
      }
      return token === this.generation;
    } finally {
      if (token === this.generation) this.busy = false;
    }
  }
}
