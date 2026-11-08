# World activity and zone music checkpoint

The world update owns transient trainer perception/movement, ambient water and
underfoot rustle. Render reads poses; it does not roll detection or encounters.
Static map NPCs and version1 saves remain unchanged. A committed player arrival
can reserve trainer sight before a held direction starts its next tile. Notice
clears held keyboard/joystick/Sprint and disables exploration actions. A visible
native-text ! precedes a passable straight approach, then existing startBattle
and its genuine encounter lifecycle run once. Trainer actors reset on pause;
interrupted detection is suppressed until the player changes tiles. Directional
trainer art still needs integration with the final human set: controller-facing
rotation/detection works, but the old NPC bitmap does not yet depict that facing.

One cancelable requestAnimationFrame owner updates the controller and active
ambient time. It draws only a changed water/rustle/actor pose; player travel
keeps its own smooth interpolation and does not receive a duplicate world draw.
Hidden/Menu/dialogue/panel/battle/portrait/blur pauses cancel the clock and clear
transient effects. Stale canceled callbacks cannot replace a newer frame. Water
uses authored24×24 ripple rasters in0/1/2/1 order at350ms per keyframe. The small
foreground grass raster is drawn after the protagonist at its actual foot;
arrival records its exact final contact even when browser frames are sparse.
It expires within220ms; reduced motion uses static water and no rustle.

Exploration cue changes use420ms bus fades. Each bus pins its own score and loop
clock, so a queued zone cannot replace notes in the still-playing cue. Requests
during a crossfade coalesce to the latest zone. Native voices, gain nodes and
retiring buses have finite disposal, including a wall-clock fallback if the audio
clock is suspended. Battle entry bypasses a queued exploration transition and
retains its existing one-shot opening; musical events/levels/scores are unchanged.
Mute/hidden shortens retirement to35ms. Duplicate visible events do not restart
music. Audio tests cover100 rapid requests, stale loop callbacks and cleanup.
This is scheduling/lifecycle work, not an audition or a new composition.

## Functional observations

- Labelled saved start on Sedgeway11,8, followed by ordinary ArrowRight, reached
 12,8. Rowan noticed, approached16→13 over the path and started exactly one
  challenge; Fight focused. Extra ArrowRight during notice did not move the
  player. Console was clean. A late Menu probe opened after the encounter had
  already started; it is retained as that case, not a trainer-cancel success.
- A second ordinary Menu probe canceled while the trainer was still in notice:
  world mode retained, trainer inactive, frame=null, Save available. Back did
  not automatically restart notice or movement. Leaving/reentering the sight
  tile and waiting for the rotating facing produced one new encounter.
- Idle water observations saw all three raster names in1.63s with zero scene
  child mutations. A normal Menu pause produced zero drawImage calls and zero
  active-clock advance over500ms. Drawing this clock is not a full scene-DOM
  rebuild and does not advance world steps.
- Normal walk into grass and Shift+Right produced both rustle frames, followed
  by expiry. An initial sparse-frame observation left the final rustle behind
  the arrived foot; recording the real arrival corrected it. The corrected
 5,5 contact is world132,143 (tile5*24+12,5*24+23).
- Browser reduced-motion emulation844×390 plus ordinary ArrowUp observed only
  water.png, zero rustle touches and arrival5,5. This is browser emulation,
  not physical-device evidence.
- Gesture-enabled Sound, normal Shift+Right across Briarwick→Sedgeway and
  Shift+Left back generated the two correct cue replacements with retiring
  fades. A separately labelled direct100-cue native AudioContext diagnostic
  retained one retiring exploration bus and settled with no old voices;
  synthetic hidden/resume cleared voices/timers and resumed without an intro.
  A normal Sound-off click left0 nodes,0 retirees and no loop timer after100ms.
  No listening-quality claim is made.

Read-only observations and capture names are retained in the world-integration
QA inventory. Newly captured grass/notice rasters need visual inspection; numeric
or normal-input evidence does not establish their visual quality.64 tests pass.

## Remaining representative corrections

Keep the coastal composition and palette while tightening desktop height/grouping
and testing opaque creature feet/shadows against every biome crop. Reduce noisy
foreground contrast rather than making remaining environments busier. Add
restrained opposing arm/leg gait with stable head/contact, then review native
all-direction walk/Sprint before deriving the NPC set. These are draft follow-ups;
the present checkpoint is not final ten-outcome acceptance or a release.
