# Motion and native-resolution foundation

Baseline13409b273cba9acde12bc43b059233121cadebfe. The source preview is served on loopback4404; no new public release has been made. The complete pass inventory is in brief.md. This slice does not claim completion of new artwork, battle staging, XP, trainers or ambient animation.

## Reproduction before the change

A labelled world save places Wickit at Briarwick9,8. Normal ArrowUp input moves three tiles to9,5 at844×390, DPR1. The observer delegates the real TileTravel.position and Canvas draw calls and records the final image's CSS screen coordinate. motion-before-844.json has16 intermediate moving samples. The same following avatar oscillates between screenY170 and172 even while the same north-facing PNG is being drawn;38 canvas width/height setter calls occur during the run. The frame rasters all have a common24px foot extent; this establishes a projection defect independent of replacing the artwork. The retained matrices are authored at8×12 and enlarged to16×24, explaining coarse silhouettes separately from the motion issue.

At this height the logical viewport is195px tall and its center is97.5. The old renderer independently rounds camera y and actor y in world pixels, before subtraction. The half-pixel difference changes tie-break as the actor travels. Horizontal following has an integer center at this viewport and does not exhibit the same two-CSS-pixel alternation. The old canvas also resamples ceil-sized world dimensions to the full CSS viewport (e.g.667/334), giving uneven pixel scale at some sizes. Reassigning canvas width/height clears/reallocates its state each draw. No claim is made that this instrumented sample establishes physical60/120Hz performance.

## Bounded correction

Camera coordinates retain floating-point precision and viewport units use exact CSS width/scale. projectWorldRect subtracts actor/camera positions before one stable physical-pixel quantization, including consistent half-pixel tie-breaks. Terrain shares projected edges to avoid fractional-DPR seams. The canvas backing size follows real device pixels and changes only on actual resize; it is cleared without reallocating on ordinary draws. Logical tile/collision/encounter/save coordinates remain intact.

NPC/object labels are native13px DOM text, outside the pixelated artwork canvas. Their cached elements and unchanged transforms are reused. No world-canvas text is enlarged as pixel art. HUD, battle and other UI typography still await the integrated visual pass.

Held travel carries the fractional frame remainder into the next already-planned step instead of resetting its start to the arrival frame. A delayed frame still commits at most one tile per tick; release finishes only the in-flight step and the next step freezes its own walk/Sprint duration. This removes a small timing pause without changing nominal280/145ms movement or engine rolls.

## Evidence after the change

- Same save/viewport and three ordinary up steps: motion-after-844.json records17 moving samples at screenY171 only, zero canvas reallocations, final9,5.
- DPR2: motion-after-dpr2.json records24 intermediate north-walk/south-Sprint samples at screenY171 only, zero reallocations, final9,8. The backing raster is1688×780 for844×390CSS.
- Normal pointer joystick drag upward to the location HUD and release: motion-joystick-after.json retains the native draw samples, returned knob/held state and settled position. This is emulated pointer input, not a physical multifinger claim.
- Pure regressions cover following in all cardinal directions at60/120Hz, DPR1/2 and667×375/844×390/desktop; monotonic camera-threshold motion; fractional-DPR adjacent terrain edges; held-step timing and single commits. These deterministic sample rates do not claim a120Hz physical-device playtest.
- Existing tests plus four new regressions total53 passing tests. Browser console after the source motion run has no errors/warnings. New actor frame anchoring and full normal-input camera/collision/joystick coverage remain part of final integration acceptance.

## Before/after artifacts and next visual pass

world-before-844.png and world-after-projection-844.png use the same initial9,8 save and844×390 viewport. Their rendering/actor appearance remains to be personally inspected under visual judgment; numeric evidence is not a visual-quality verdict. The published PR7 shore fixture is retained in shore-battle-save.json: route17,9, normal blocked ArrowDown then Talk reaches the existing Dewshell guardian. battle-before-844.png and shore-world-before-844.png retain the old battle/actor reference for the next composition/Tide redesign. One transient screenshot request reported preview_browser_unavailable; it was retried under a fresh filename and only the successful ready-state capture is retained as the battle baseline.

Next: inspect these renders and original Dewshell/art sources, choose the original Tide replacement and create one integrated battlefield/protagonist/Tide preview for composition critique before the remaining art batch. Independent XP/trainer/music lifecycle work can proceed while that preview is reviewed. No game-rule, chapter, species identity or PWA update has changed in this slice.
