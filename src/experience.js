// Presentation follows the committed reward snapshots. No awards or balance
// rules live here: a threshold crossing is shown, reset, then its remainder.
export function experienceSteps(before, after) {
  if (!before || before.species !== after.species || before.level >= 100) return [];
  let level = before.level, value = before.xp;
  const result = [];
  while (level < after.level) {
    result.push({ kind: "xp", level, from: value, to: 4 });
    level++;
    result.push({ kind: "level-up", level, from: 0, to: 0 });
    value = 0;
  }
  if (after.xp > value)
    result.push({ kind: "xp", level, from: value, to: after.xp });
  return result;
}

export function withExperienceFrames(frames) {
  const result = [];
  for (const frame of frames) {
    const prior = result.at(-1)?.state;
    if (prior && ["victory", "sendout"].includes(frame.kind)) {
      const index = frame.state.active;
      const before = prior.team[index], after = frame.state.team[index];
      for (const xp of experienceSteps(before, after)) {
        // Keep the defeated opponent on screen until its reward has been read.
        // In particular, do not reveal a trainer's next creature prematurely.
        const state = structuredClone(prior);
        state.team[index] = {
          ...(xp.level > before.level ? after : before),
          level: xp.level, xp: xp.to,
        };
        state.battle.log = [xp.kind === "level-up"
          ? `Level ${xp.level}! Your companion grows stronger.`
          : "Experience gained!"];
        result.push({ kind: xp.kind, actor: "ally", xp, state });
      }
    }
    result.push(frame);
  }
  return result;
}
