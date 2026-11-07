# Immersive viewport verification

Baseline:b959054e81ba189a8ea0aaefde3b3a1d5cf75aa9. Initial immersive draft7a1b8432519b483f8fd1d13098b9982ac42e845f was served on4395; final camera/clearance/storage corrections were exercised on source4394. Runtime revision is recorded by the clean build's version.json.

## Rendered result

Personally reopened all retained PNGs. The actual world raster reaches all four viewport edges. The visible map is cropped by a following camera at approximately2× native pixels on phones, rather than fitting the whole map within a frame. Only the small location label, Menu, joystick and Talk remain while exploring; sound, quest text, fullscreen and other secondary actions appear only inside Menu. The map, pixels, creatures and music are the existing authored assets.

Inspected667×375 and844×390 world/corner views, conversation, battle/moves, full six-member team and ending;1280×800 desktop world/battle/full team/ending with reduced motion;390×844 portrait gate. The village corner avatar2,10 stays clear of the joystick. Conversation pauses movement and places the avatar above readable text and Continue. Pinned Back stays visible during dense journal scrolling and is separate from Menu. No document scrolling or required-control clipping was found in these states.

Two material visual corrections were made:gradual upward framing reveals the full beacon/tower crown while approaching, without snapping between tiles; the first ending paragraph reserves space for the Menu button. Use summit-fixed/summit-wide and ending-*-clearance as corrected evidence. The explicitly named before-framing/before-clearance captures preserve the defects for comparison.

|Viewport|Retained captures|
|---|---|
|667×375|immersive-world-small-draft, immersive-dialogue-draft, immersive-menu-draft, immersive-battle-small-draft, corner-small, moves-small, dense-small, dense-small-expanded, summit-fixed, ridge-small, vault-small, loss-dialogue, ending-small-clearance, fullscreen-fallback|
|844×390|world-wide, corner-wide, moves-wide, dense-wide, summit-wide, ending-wide-clearance|
|1280×800|desktop-world, desktop-battle, desktop-dense, desktop-ending|
|390×844|portrait|

At667×375 the stage and canvas rectangles are exactly0,0,667,375; logical camera backing334×188. Header is absent and sound/quest are not visible outside Menu. All battle/move buttons remain inside the viewport. The conversation rectangle is18,239.56,631,119.44 and the inactive joystick is hidden. Full team Back after internal scrolling is512,10,56.83,44; Menu591,12,64,44. Numeric bounds supplement the reopened images.

## Ordinary input

Fresh Rillfin starter, village bottom corner, normal keyboard travel across the village exit, grass encounter, Fight/Bump twice, Mending Draught, Spark Vessel capture, Continue, team change to Brambleboar, menu Sound on/off and Save/reload passed. Retained save:Rillfin20/31HP, Brambleboar12/28HP, active1, five vessels, two draughts, captured flag and route position preserved. Damage previews were meaningful:Rill Rush was resisted against Brambleboar, while Bump did8 damage; the enemy reply did11, requiring healing before capture.

Mira Talk paused at5,6; ArrowRight did not move, and Escape dismissed the dialogue. Menu similarly blocked movement. Menu→Team exposed focused Back and Escape returned to play. Normal joystick drag5,6→7,6 released outside and stopped. Save confirmation stays within Menu. Native Full screen button entered successfully, closed Menu and preserved position. The unchanged fullscreen helper's exit/re-entry lifecycle is covered by existing tests and the prior landscape pass.

A released Swedish v1 fixture was seeded, then ordinary Menu/Load preserved Rillfin/Brambleboar IDs, HP13/31 and12/28, position5,5, supplies and capture progress while showing English names. The pause menu stays open to show load feedback. Portrait390×844 blocked ArrowRight; landscape resumed unchanged at5,5 with centered knob.

Explicit seeded setups:full six-member/three-observation roster for density; keeper approach with a strong team for ordinary Fight/Continue through three opponents to the ending on phone and desktop; weak one-member rescue approach for ordinary battle loss. Loss returned to Mira5,6, fully healed and restocked, with a paused explanation. ArrowRight remained blocked until dismissal, then normal movement resumed. The ridge approach setup used completed gate flags; normal ArrowUp crossed the door into Stillglass Vault3,10. These are targeted scene/interaction checks, not another complete chapter playthrough, balance verdict or duration measurement.

## Diagnostics and regressions

35 Node tests pass, retaining battle rules, sequencing, save compatibility, joystick ownership/cancellation and audio checks. New camera checks cover viewport coverage/readable scale, edge/corner control clearance, interpolated follow, dialogue clearance and gradual landmark framing.

Synthetic two-pointer integration, with native capture stubbed only for synthetic IDs:the northward stick began a step5,7→5,6 while a separate action pointer queued Talk. Dialogue appeared, knob recentered and the stale first pointer could not resume movement. Ordinary Escape restored controls. Prior labelled direction/dead-zone/cancel/lost-capture/blur/rotation diagnostic evidence remains applicable to the unchanged joystick controller; no physical multi-finger claim.

Fullscreen denial and missing requestFullscreen were separately stubbed; ordinary menu clicks displayed fallback feedback, Back restored the usable world and joystick. A stubbed quota failure displayed an explicit save error. Restoring storage and saving again initially left stale dialogue; corrected recovery now clears that specific error and resumes without an obsolete warning. Ordinary button retest passed. A native Sound click created one running AudioContext; on/off worked. No listening assessment.

Console checks across all QA contexts found no warnings/errors. A browser interruption required restarting local previews; previously retained artifacts were preserved and fresh contexts were identified separately. Tests do not imply physical-device support beyond the declared limits.

Limits:Chrome emulation only; no physical iPhone/notch, Safari long-press or real simultaneous multi-finger/free-path hold test. Native fullscreen/orientation locking remain browser-dependent. Safe-area offsets, dynamic viewport units, selection/callout/image-drag suppression and reduced-motion styles are implemented; rectangular viewport checks do not prove notch behavior. No fresh full-chapter or audio-listening verdict.
