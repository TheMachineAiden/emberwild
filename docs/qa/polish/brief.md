# Emberwild visual and gameplay polish

Baseline: main13409b273cba9acde12bc43b059233121cadebfe (PR7). Preserve prior release/candidate/rollback evidence, version1 saves, current PWA scope/offline/version-pinning/update behavior, English chapter, creature rules, joystick/held Sprint and full-viewport landscape play. This is one finite pass with ten related outcomes, not a new engine or content expansion.

## Representative direction before asset production

A coastal pixel RPG with readable native-resolution UI, expressive small actors and grounded duels. Keep established dark teal, warm parchment/ember, moss and sea palettes. Text is UI: it must not inherit the world's nearest-neighbor scaling. Use actual device-pixel backing dimensions and deliberate sprite-to-screen scale. Do not solve blur by enlarging everything or shrinking the viewport.

Prototype one Sedgeway battle composition, one directional protagonist sample and the replacement Tide creature in a runnable preview before producing the full set. The battlefield needs a zone-specific horizon, middle ground and contact surfaces, with creature depth and fixed readable statistics/commands. Environment artwork will cover Briarwick/Sedgeway, Saltwind coast, Stillglass vault and Lantern Crown as actually encountered; avoid invented biomes. New sprites retain the existing logical collision tile. Source resolution may increase detail at the same displayed actor size. Feet/anchors must be shared across directional frames. Review native32/48-ish screen sizes, not only enlarged sheets.

The existing internal species daggla remains stable. Its current Dewshell front/back64×64 assets and story/journal references are the replacement target; original replacement design/name/lore will be authored after inspecting the existing image and retained art sources. No borrowed creature design, mechanics or roster expansion.

## Implementation boundaries

- Rendering may interpolate/animate; it must not award XP, move trainers, roll encounters or mutate saves. Keep once-per-tile engine commits and deterministic controller ownership.
- XP threshold is4. Current win awards2 wild/3 trainer per defeated opponent and can level with remainder. Derive blue-bar segments from actual before/after owned-creature snapshots; enemies receive no invented XP. Reward presentation must finish before Continue/next opponent.
- Trainer perception belongs to an update/controller step: explicit eligible facing/range, grid LOS, passable straight approach and one encounter reservation. Keep home positions/static map data immutable; transient approach offsets reset safely on interruption and do not block old save decoding. Rotation and detection do not run from render(). No general pathfinder.
- Grass rustle follows actual foot travel through g tiles, not extra movement/encounter calls. Water is a small coherent loop. Prefer one bounded world animation clock, paused when hidden/menu/dialogue/battle and when reduced motion requests static scenery.
- Crossfade only actual exploration-cue changes; same cue stays running. Battle warning remains once per encounter in its existing integrated composition. Retiring voices/buses must have bounded release/disposal and stop on mute/hide/early end. Native scheduling evidence is separate from listening.

## QA inventory

| Outcome | Visible check / evidence | Regression / interruption |
| --- | --- | --- |
| 1 Crisp text/UI | Same save+viewport before/after HUD, NPC labels, stats/log/commands, Team/Menu at667×375,844×390,desktop | DPR1/2; text outside low-resolution raster; exits reachable |
| 2 Full battle scene/entry | One integrated prototype before art batch; zone backdrops, contact platforms, opposing entrances and action/reward keyframes | Wild/trainer/boss; no repeated entry; reduced motion, Menu/blur/rotation/reload |
| 3 Owned blue XP | Real win crossing4, wrap/remainder/level and cap; Team progress | Derived from committed rewards; no duplicate award; sequence gates exit |
| 4 Underfoot grass | Normal walk/sprint through g; foot-anchored rustle and correct foreground layer | No extra tile commits or encounter rolls; reduced motion |
| 5 Trainer perception | !, straight approach, initiation, rotating facing; one full normal-input encounter | Occlusion, blocked approach, defeated flags, reentry, menu/dialogue/map change |
| 6 Water | Subtle coherent cycle in world and still readable obstacles | Hidden/paused clock and reduced motion; no full-DOM churn |
| 7 Zone music | Rapid actual zone/cue changes with native bus/voice observations | Finite retiring cleanup, mute, hidden/resume, battle entry/end; no hearing verdict from tests |
| 8 Human sprites | Directional protagonist walking/sprinting, relevant NPCs consistent, stable feet/scale | All directions, corners, foreground, interaction/approach; source/export inventory |
| 9 New Tide species | Front/back and in-context owned/caught render; matching English lore/journal references | Internal daggla save identity unchanged; old owned creature Save/reload |
| 10 Vertical stutter | Reproduce before changing code; log actor/camera screen coordinates and canvas reallocations from normal input | Walk/sprint/joystick, all directions, boundary/threshold, deterministic60/120Hz and actual browser sample |
| Cross-cutting release | Before/after matched viewport/save, exact preview and PR, actual normal catch/Team/Save/reload | Existing49 tests plus targeted checks; PWA offline cold load and cached update; exact accepted/public revision/assets |

Tool limits remain explicit: browser emulation is not physical iPhone/multifinger/install-window testing. Native audio scheduling/export inspection is not hearing. Preserve labelled fixture/keyframe evidence separately from ordinary input and real-time observation. Stop after the requested changes and public verification.
