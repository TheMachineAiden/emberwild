# Coast and character representative draft

This checkpoint establishes one actual coastal battle before the remaining biome
and NPC production. It is not final ten-outcome signoff.

## Retained art and integration

- `assets/source/battle-coast-master.png` and `battle-coast-prompt.txt`: original
  built-in image generation; deterministic480×240 nearest-neighbor derivative
  at `assets/world/battle-coast.png` via `scripts/export_polish.py`.
- `assets/source/brinecrest-poses.png` and `brinecrest-prompt.txt`: original
  built-in generation of one two-pose creature, with transparent alpha. Existing
  `export_sprites.py daggla` produces64×64 front/back, common bottom-center
  contact at y60, preserving the stable internal `daggla` identity. Portraits
  and generic action animations use those same runtime rasters. Original snail
  source remains retained; only the active source manifest changes.
- `assets/source/world/humans.json`: explicitly authored16×24 pixel matrices,
 32×48 production PNGs at the existing logical16×24 actor scale. Reproduce with
  `scripts/export_world.py`. The protagonist is the first human sample; NPCs
  and more expressive gait articulation remain to follow the sample review.
- Shore rescue name/journal lore is now Brinecrest / Reef refuge. No species
  stats, capture odds, rewards or internal species keys have changed.

## Visible observations

World before/after renders were personally inspected at844×390. The restored
single projection preserves the camera/controls/actor scale; the first new hero
has a clearer hat/face/scarf/satchel silhouette at that same footprint. Old NPCs
still visibly need the matching treatment. The before/after image by itself is
not proof of smooth motion; numeric and normal-input evidence remains separate
in motion-findings.md.

`battle-first-844.png`, `battle-first-667.png`, `battle-first-desktop.png` were
personally inspected from actual runtime at844×390,667×375,1280×800. Both
creatures stand over the coast ledges with contact marks; separate stat panels
keep body silhouettes visible. HP/owned blue XP, log and all five commands fit;
text is native UI at12px or larger for body information. Document equals the
viewport; no essential clipping observed. `battle-takeover-first-844.png` is an
actual normal-input initial takeover keyframe, not a settled scene.

The labelled matched world fixture is shore-battle-save.json; blocked ArrowDown
then ordinary Talk initiates the shore guardian. Ready controls focus Fight.
The desktop emulation recreated the document: its first transitional empty-world
capture was replaced with the actual ready-state battle image. No claim that an
empty transient screenshot passed review.

## Experience presentation

The planner adds presentation-only frames derived from committed before/after
owned XP. Fill to4, reset with the new real level, then fill remainder; no enemy
XP. The defeated opponent remains until those phases finish, including trainer
sendouts. Capture creates no XP. Continue/commands stay gated by the existing
sequence. Tests cover actual reward planning, remainder and gating; actual
browser level-up animation/reward exit still needs retained normal-input evidence.

57 tests pass at this draft. Existing movement, capture, save, score, PWA build
and worker tests pass. Final preview/build/offline/update, full asset set,
trainer perception, ambient grass/water, crossfade and new intro polish remain
pending. No physical-device or listening verdict is claimed.
