# Emberwild

A Swedish-language browser creature RPG about a silent lighthouse and creatures carrying embers.

## Development

Requires Node.js 22 or newer. No packages to install.

```sh
npm start
```

Open `http://127.0.0.1:4387`. Set `EMBERWILD_PORT` to use another port. Run `npm test` for game-rule and save validation tests.

## Current prototype

Choose one of three starters, walk east from Glödvik to Sävstigen, enter tall grass, battle and capture a creature, inspect your team, save/load, and return to the free village healer. Liv offers a trainer battle. Use arrows/WASD and Enter, or the on-screen controls. Battle and menu buttons support native keyboard focus and activation.

This is a greybox chapter with temporary world markers and one integrated creature art sample. Defeat Liv to reach Vindryggen, earn Edda’s trust to enter the lighthouse, solve the ember bowls and challenge keeper Signe to restore the beacon. Final raster artwork and original music are still in production. The intended 20–30 minute duration has not been measured. See [the game brief](docs/brief.md) and [level progression](docs/levels.md).

Local saves use a versioned, validated browser-storage record. Saving is available outside battles; map transitions and completed battles also save. Invalid storage leaves the current game intact. Losing heals the team and returns it to Glödvik with retry supplies.

## Structure

- `src/engine.js`: deterministic state transitions with injectable encounter randomness
- `src/data.js`: creatures, types, maps and fixed collision coordinates
- `src/main.js`: canvas prototype world, DOM menus and normal input
- `test/engine.test.js`: progression, battle, recovery and save scenarios
- `docs/brief.md`: chapter, art and audio direction

Static files need no backend, accounts or network services.
