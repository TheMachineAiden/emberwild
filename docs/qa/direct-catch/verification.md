# Direct Catch verification

Baseline: 9e1c40db21d49ed6190c9f1a9f1358fe7e282a88. Catch now appears beside Fight in the primary battle commands, with vessel count and weakening guidance. Bag contains healing draughts; Team and a full-width Run remain reachable. Trainer battles show disabled Catch with “Wild creatures only”; a six-member team shows “Team full (6/6)”; empty supply shows “0 vessels · Restock at Mira”. The existing capture action, odds, supply use, turn sequencing, roster and version1 save format are unchanged.

## Functional inventory

- Fresh Rillfin starter, ordinary Shift/arrow travel from Briarwick to Sedgeway grass and a wild Brambleboar encounter. Catch was visible immediately, before opening Bag. ArrowRight from Fight focused Catch; Enter invoked it directly. No injected input or random override was used in this run.
- Bump dealt 8 damage (28→20 enemy HP), then the first direct Catch failed naturally. The game showed “broke free”, consumed one vessel (6→5), locked commands during resolution and gave the opponent its reply.
- Bag remained reachable and supplied a Mending Draught. A second Bump brought the enemy to 12/28 HP; the second direct Catch succeeded naturally. “Brambleboar joins your team!” appeared, then Continue and Team showed the new companion.
- Ordinary Menu→Save and reload retained Rillfin 13/31 HP, Brambleboar 12/28 HP, four vessels, two draughts, captured flag and route 7,5 at 24 steps. There were no console warnings/errors.
- Labelled fixtures: six-member roster and zero-vessel world saves placed just before grass; an encounter-only random stub made the diagnostic approach deterministic and was restored before command inspection. Catch was disabled with the expected reason. Disabled Catch was skipped by ordinary keyboard ArrowRight, which reached Bag. These are fixture checks, not a normal full-roster/supply-exhaustion playthrough.
- A separate Rowan approach fixture used ordinary Talk to start a trainer challenge. Catch and Run remained disabled, with the wild-only/challenge explanations. No capture or collection rule was changed.
- 39 existing tests pass, including failed/successful capture sequencing, resolution locks, trainer restrictions and save compatibility.

## Render inventory

Captured 667×375 and 844×390 primary wild commands, 1280×800 ordinary and full-roster commands, 667×375 empty/full roster, 844×390 trainer, plus natural miss/success/Team states. Numeric checks found every primary command inside the viewport and no document overflow; smallest sampled primary targets were 53px tall, above 44px. Screenshots still require personal visual inspection before final signoff.

A matched 667×375 baseline capture uses the same seeded Rillfin/Lunamoth approach on the released build. The matching candidate capture and visual/copy review are the next finite step, followed by exact revision/build, final review, PR and authorized public smoke. No new chapter, balancing or physical-device verdict is implied.
