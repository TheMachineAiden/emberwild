# Emberwild · The Sheltered Flame

An original English-language creature-collecting browser RPG about a dark coastal beacon and the small creatures sheltering its missing embers.

Choose Wickit, Rillfin or Buddle in Briarwick, explore Sedgeway and Saltwind Rise, and build a team through wild encounters. Help three optional spark guardians, challenge Rowan and Maren, solve the Stillglass Vault bowls and face Warden Alder at the Lantern Crown. The chapter has an ending, with the coast remaining open afterward. First-player duration has not been measured.

## Play and controls

Use arrows/WASD to walk and Enter to talk or inspect. Hold Shift to sprint. On touch screens, drag the joystick and hold Sprint with another finger to run. Hold a direction to keep walking; release finishes the current tile. Each step keeps the pace it started with; sprint changes apply to the next tile. Escape opens your team while exploring and goes back in battle menus. Tab or arrow keys navigate commands; Enter/Space activates them. The Field guide contains type, item and recovery help.

Battles separate your move, the enemy reply and the return to commands. Fight shows damage and matchup information. Bag holds Spark Vessels and Mending Draughts. Switching normally gives the opponent a turn; replacing an exhausted companion does not. Inputs lock during brief resolution. Reduced motion removes impact/walk effects and shortens battle feedback.

Saves use the existing version1 browser-storage key and stable creature/map IDs. Adventures from the Swedish release retain their team and progress under the English display names. Saves resume automatically; saving is available outside battle, with automatic saves at transitions and completed battles. Free recovery at Mira and the camps prevents supply exhaustion from trapping a run.

Original raster art has editable sources and deterministic PNG exporters. Seven original chiptune cues share a motif across village, routes, landmark, battles and short victory/capture cues. Sound starts only after its button is pressed; it can be muted at any time. Audio lifecycle checks do not establish a listening verdict.

## Development

Requires Node.js 22 or newer; no runtime packages or backend.

```sh
npm start
npm test
```

Open `http://127.0.0.1:4387`. Set `EMBERWILD_PORT` to use another port. Tests cover battle ordering, repeated input, recovery, progression, save compatibility, travel timing and audio lifecycle.

Build a clean checkout with `npm run build`. The runtime-only `dist/` includes `version.json` with the exact source revision. Serve it with `EMBERWILD_ROOT=dist EMBERWILD_PORT=4388 npm start`. The build rejects uncommitted changes.

For artwork reproduction, install `requirements-art.txt` in a Python environment, then run `scripts/export_world.py` and `scripts/export_sprites.py`. World matrices live in `assets/source/world/pixels.json`; creature source crops are described by `assets/source/creatures.json`. Independently editable musical events and cue structure live in `music/scores.js`.

## Structure

- `src/engine.js`: game rules, deterministic turn snapshots and validated saves
- `src/battle-sequence.js`: planned turn presentation and resolution locking
- `src/travel.js`: tile interpolation and held-direction lifecycle
- `src/world-layout.js`: visual paths and decoration independent of collision
- `src/main.js`: rendered world, menus, commands and input
- `docs/qa/english-polish/`: matched comparisons and scoped playtest evidence

No accounts, multiplayer or live services are required. The published chapter and review branches are separate; opening a pull request does not deploy it.
