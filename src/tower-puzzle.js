// Stillglass's finite light-balance puzzle. Order is irrelevant; the inscription,
// reset tablet and individual rim marks supply complementary facts.
export const TOWER_PUZZLE_VERSION = 2;
export const towerBowls = [
  { id: "bowl-tide", strength: 6, mark: "six" },
  { id: "bowl-moss", strength: 3, mark: "three" },
  { id: "bowl-ember", strength: 2, mark: "two" },
];
export const towerInscription = "Three different bowls must shine with equal light. Each rim marks the light made by one wick notch. The reset tablet records the shared setting. Touch a bowl to raise its wick; after three, another touch lowers it to zero.";
export const towerReset = "The keeper's tablet shows six wick notches around three equal rays. The wicks are lowered. The lantern tests their balance when all six notches are set.";
export const towerTotal = state => state.bowlCharges.reduce((sum, n) => sum + n, 0);

export function restoreTowerPuzzle(saved) {
  const solved = saved.flags.puzzle === true;
  const valid = saved.towerPuzzleVersion === TOWER_PUZZLE_VERSION &&
    Array.isArray(saved.bowlCharges) && saved.bowlCharges.length === 3 &&
    saved.bowlCharges.every(n => Number.isInteger(n) && n >= 0 && n <= 3) &&
    saved.bowlCharges.reduce((sum,n) => sum+n,0) < 6;
  const bowlCharges = solved ? [1,2,3] : valid ? [...saved.bowlCharges] : [0,0,0];
  return { bowlCharges, bowlStep: solved ? 3 : bowlCharges.filter(Boolean).length,
    legacyReset: !solved && !valid && saved.bowlStep > 0 };
}

export function resetTowerPuzzle(state) {
  if (state.flags.puzzle) return "The bowls remain balanced. The northeast stairs are open.";
  state.bowlCharges = [0,0,0];
  state.bowlStep = 0;
  return towerReset;
}

export function touchTowerBowl(state, id) {
  if (state.flags.puzzle) return "The three bowls shine together. The northeast stairs are open.";
  const index = towerBowls.findIndex(b => b.id === id);
  state.bowlCharges[index] = (state.bowlCharges[index] + 1) % 4;
  state.bowlStep = state.bowlCharges.filter(Boolean).length;
  if (towerTotal(state) === 6) {
    const light = state.bowlCharges.map((n,i) => n * towerBowls[i].strength);
    if (light.every(n => n > 0 && n === light[0])) {
      state.flags.puzzle = true;
      state.bowlStep = 3;
      return "The three lights balance. The northeast stairs open, and the sparks drift toward the lantern.";
    }
    state.bowlCharges = [0,0,0];
    state.bowlStep = 0;
    return "The lantern flickers and the wicks fall. Their light was uneven. No supplies were spent.";
  }
  const bowl = towerBowls[index], count = state.bowlCharges[index];
  return `${id.slice(5).replace(/^./, c => c.toUpperCase())}: ${count}/3 notches. The rim reads: one notch, ${bowl.mark} measures of light.`;
}
