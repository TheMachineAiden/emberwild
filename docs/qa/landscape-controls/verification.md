# Landscape and thumb-control verification

Build before final menu-resume correction:c063b8659f63a424b00db0f4f4b88a84965ce2dd at127.0.0.1:4393. The correction adds a render after the adventure dialog closes so the joystick's disabled styling follows the resumed world. It was tested on source4392. No rules, creature art, scores or save fields changed.

## Ordinary input

- Fresh starter→village→Sedgeway→grass→wild battle→two Bumps→Spark Vessel→Continue→team→Menu Save→reload passed with keyboard and normal button input. Wickit/Dewshell, HP16/28 and6/24, position7,5, five vessels and capture flag survived. This is a short regression loop, not a fresh complete chapter replay.
- Ordinary element-to-element pointer drag moved village4,8→6,8; release outside the stick left the knob centered and movement stopped. Repeated after denied-fullscreen fallback and closing Back: controls resumed,4,8→6,8 then remained still. This found and verified the dialog-close correction.
- Ordinary Talk beside Mira produced the full healing dialogue. Normal text drag across that message left no selection and scroll0,0. The full shell disables selection/callout, image drag and overscroll; internal menu/dialogue panes explicitly allow vertical touch scrolling.
- Portrait390×844 showed only the rotation gate. ArrowRight there did not move the avatar. Landscape844×390 resumed at5,6; portrait→landscape repeated safely. Native fullscreen entered from the explicit button, exited and re-entered. Rotation while native fullscreen was active still displayed the gate because the fullscreen root includes it. Browser orientation-lock availability is not inferred from successful fullscreen.
- A released Swedish v1 fixture was seeded, then loaded with ordinary Menu/Load. Rillfin(strila) and Brambleboar(tuvling), HP13/31 and12/28, position5,5, five vessels and capture progress were preserved; displayed names/message were English.
- Seeded keeper approach with a strong team is explicitly diagnostic setup. Ordinary Fight/Bump commands defeated all three keeper creatures and Continue reached the ending at667×375 and separately on desktop1280×800 with reduced motion. End text and Return button fit; ordinary return/reload preserves completion. These runs do not establish chapter balance or full-journey completion time.

## Pointer and platform diagnostics

30 Node tests pass, including vector bounds/dead zone/cardinal direction, single pointer ownership, direction changes without lifting, stale-gesture suppression after reset, DOM capture binding, cancel/lost capture/release outside, orientation gate and fullscreen success/denied/unsupported paths. Existing battle sequencing and original-save tests remain passing.

Browser integration used synthetic touch IDs with only setPointerCapture stubbed, since synthetic IDs are not native active touches. A separate action pointer during a northward step5,7→5,6 queued Talk and healed; the first gesture could not resume afterward. Cancel and lost capture stopped at6,6 and7,6 respectively, with no later movement and knob0,0. Blur stopped at6,6 and ignored the stale move. Direction changed east→south without lifting; returning to center stopped at8,7. Rotation cleared another held gesture, displayed the gate and ignored that stale ID after landscape resumed. These are labelled diagnostics, not physical multi-finger input.

Denied fullscreen and an absent requestFullscreen method were separately stubbed; ordinary button clicks showed the fallback explanation in the adventure menu, Back returned to the usable viewport. The denied path exposed the stale disabled joystick styling; the corrected source passed ordinary drag afterward. No unsupported API promise rejection escaped to the console.

## Rendered inventory

Personally reopened retained PNGs at actual sizes:

| Viewport | Retained states |
| --- | --- |
|844×390 touch emulation|draft-starter, draft-world-full, wide-dialogue, draft-battle-wide, moves-wide, fullteam-wide, dense-wide-expanded, ending-wide, draft-menu, fullscreen-fallback|
|667×375 touch emulation|small-world, small-dialogue, keeper-small, draft-moves-small, fullteam-small, dense-small-expanded, ending-small|
|1280×800 desktop, reduced motion|desktop-world, desktop-battle, desktop-fullteam, desktop-ending, desktop-summit-after-reload|
|390×844 phone portrait|draft-portrait, fullscreen-portrait|

Measured document bounds equal the viewport at844×390,667×375 and1280×800. In667×375 all six team rows fit between y123 and328; Back is y63–107. After internal journal scrolling Back remained at y59–103. Battle field and command regions fit within the stage; essential controls do not need document scrolling. Dense journal text scrolls intentionally beneath the pinned heading. Screenshots show the complete map/lantern silhouette, clear creature/HP hierarchy and readable actions; no accidental clipping, control overlap or horizontal overflow was found in the retained states. Desktop mobile-emulation mode changes reload the page; the save correctly restores world mode, which is why desktop-summit-after-reload is a world capture rather than ending text.

Browser console checks after interaction and diagnostics showed no warnings/errors. Two screenshot calls returned preview_browser_unavailable; only successful captures were retained/reopened, with fresh filenames for retries.

Limits:no physical iPhone or notch test, no real multi-finger or freely routed multi-segment normal gesture (the configured browser exposes element-to-element drag), no universal orientation-lock/native chrome-removal claim. Safe-area insets and dynamic viewport units are implemented and source-reviewed; emulated rectangular viewport fit does not establish notch behavior. No new listening assessment. Original full chapter evidence remains in the earlier English-polish QA; this pass targets presentation and input lifecycle.

## Message strip correction

The earlier world/dialogue captures reveal that the persistent cream message covered lower map tiles. The corrected shell gives the message its own fourth grid row and fits the complete map above it. Important dialogue stays available; no dismissal timer or story/input rules are added. Battle/team/ending panes span the remaining rows as before.

Targeted normal keyboard checks on source4392:Wickit starter→village7,10; return to Mira5,6→ordinary Talk→walk back to7,10 with the full healing message retained; walk through the village exit→Sedgeway1,8→lower route16,10 beside the shore spark at17,10. The NPC blocks walking into its tile as expected. Retained correction captures:strip-bottom-small/wide, strip-dialogue-small/wide, strip-bottom-dialogue-small and strip-route-npc-small/wide. The route pair shows the final position16,10; earlier failed capture retries were not substituted for that state.

At667×375, the initial status map stage ends at313.47 and message starts316.47; the longer healing dialogue stage ends296.20 and message starts299.20, with all72px of dialogue visible. At844×390 the route stage ends345.73 and message starts348.73. Document bounds equal both viewports; controls remain reachable. Escape/team still fills the stage49–371 in667×375, with Back63–107.30 regression tests pass and the browser console has no warnings/errors. Personally reopened all seven correction captures. The complete lower tree/water boundary, the avatar at7,10 and the route avatar16,10 beside spark17,10 remain visible above the separate message strip. The longer healing text fits in667×375, and the joystick and Talk targets stay clear of the actual map. The previous world/dialogue images document the earlier overlay; the strip-* captures supersede them for this region.
