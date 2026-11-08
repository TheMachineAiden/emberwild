# Original gameplay chip effects

Short, dry square/triangle gestures share the Music user-unlocked AudioContext,
Sound toggle and hidden state. Sound off constructs no extra context or timer.
The master effect gain is0.75; per-voice peaks are0.008–0.04, with eight scheduled
voices maximum. Budget overflow is dropped, never queued. Each effect has a
finite envelope, onended cleanup and wall-clock fallback. Delayed impact/defeat
voices are stopped and disconnected on interruption, including before start.
No continuous water sound or per-frame/held-repeat footstep sound is added.

| Semantic edge | Effect / audible construction | Ownership |
| --- | --- | --- |
| Command/Team keyboard navigation | Quiet single E tick | Explicit non-repeat navigation key; no focus/render handler |
| Menu/selection/Continue confirm | Small A→E chip | Accepted click/action only |
| Back/dialogue dismissal | Soft descending triangle | Accepted back action only |
| Unavailable command/interaction | Low brief two-pulse dissonance | Rejected action notice or fresh disabled pointerdown; never busy input spam |
| Explicit successful Save | E→A pair | After localStorage succeeds; autosaves remain silent |
| NPC/inscription/journal interaction | Short rising triangle | Actual world interact result |
| Bowl light/reset/puzzle reward | Glass-like E/B taps or low reset drop | Actual bowlStep/flag transition, including wrong first bowl |
| Trainer notice ! | Single short high chip | Controller notice event once; rotation/render stays silent |
| Encounter entrances/sendout/switch | Low rising sweep / out-and-in pair | Entrance phase edge or committed switch/sendout frame |
| Neutral cast→impact/damage | E→A cast, low triangle impact | Actual player/enemy hit frame |
| Ember cast→impact/damage | Two climbing square crackles, low square impact | Actual moveType metadata from the resolved action |
| Tide cast→impact/damage | Rounded descending droplets and low splash contour | Same |
| Moss cast→impact/damage | Hollow lower triangle answer and short woody impact | Same |
| Gale cast→impact/damage | High narrow falling pulses, lighter impact | Same; internal move type wind |
| Defeated enemy / companion faint | Short falling triangle | Actual zero-HP hit or faint frame; no render check triggering audio |
| Brace / Mending Draught / field rest | Low rounded block / A–C–E healing taps | Actual guard/heal frame or rest interaction |
| Capture attempt | Two gathering pulses and descending vessel sweep | Its own accepted260ms presentation frame before outcome |
| Capture failure | Broken descending pair | Actual capture-miss frame, before enemy reply |
| Capture success | Small vessel closure contact | Actual capture frame; the existing capture MUSIC supplies celebration |
| XP fill / level reset | Brief rising tick pair / E–A–E chirp | Each actual XP phase / actual level-up frame, never bar RAF |
| Victory / trainer supply reward | Small settling contact | Victory frame; existing victory MUSIC supplies fanfare |
| Loss / escape | Restrained falling contour | Actual loss/flee frame |

Planner snapshots remain silent. Engine changes only expose the chosen move type;
no additional RNG, capture odds, damage, reward or supply rule is introduced.
The capture-attempt snapshot uses the real consumed vessel count, keeps the
uncaptured team and gates input. Its short phase is260ms in normal and reduced
motion, allowing its sound to finish before the verdict. Other reduced-motion
phases retain their existing short sequencing. A canceled sequence retires its
voices; hidden/Menu/orientation/blur skip future battle SFX without accumulating
replay. Muting also stops them. UI feedback remains available inside Menu.

## Review exports

Run scripts/export-sfx-browser.js through the same-origin source browser. It uses
fresh module URLs to avoid retaining old score data from a long-lived preview,
and the exact same scheduleEffect / scheduleEvents renderers and gain settings.
Decode the returned WAV fields. sfx-export.json retains source hashes, timeline,
PCM metadata, file SHA256, peak and RMS. Its score proof confirms the current
healing middle pitch523Hz. Exports contain no runtime dependencies or services.

- sfx-palette.wav:6.99s, all28 effect programs with short gaps.
- sfx-battle-mix.wav:9s, illustrative integrated battle opening, opposing casts,
  Brace, defeat, XP wrap/level-up and existing victory music. This is a composed
  review timeline, not a recording of normal play. Capture outcomes appear in
  the separate palette and native gameplay evidence.

Most type gestures use the existing A/E harmonic vocabulary; healing uses A/C/E.
Tide is rounded and falling, Ember sharper and rising, Moss low/hollow, Gale thin
and descending. The victory/capture effects are physical closures rather than
additional melodies. Peak/RMS and score construction do not establish perceived
balance, harshness or enjoyment. No audition is claimed; browser rendering may
differ across platforms, so retained hashes identify these exact exported files.

## Functional evidence and limits

68 tests pass: finite/quiet effect score, distinct type profiles, bounded voices,
muted/suspended silence, stopped-clock cleanup, generation cancellation, silent
planning, normal/reduced capture phases, XP routing and no added enemy RNG roll.

Gesture-enabled native browser checks on844×390 reduced motion observed:
- Sound on, Save and Back emitted their respective effect once. Idle updates
  added no effects; completed voices returned to zero.
- A labelled level50/XP3 shore setup followed ordinary Talk/Fight/Wickflare.
  The real attack/defeat→XP→level-up→remainder→victory edges each scheduled once;
  final level51/XP1. This is not ordinary chapter progression.
- A level3 Rillfin shore start followed ordinary Rill Rush, Bump, healing and
  Catch. The enemy weakened28→12HP. Capture succeeded, its attempt and closure
  each scheduled once; type/neutral damage and heal effects were observed.
  Team showed Brinecrest12/28; Save/reload preserved the exact save, Rillfin24/31,
 5 vessels,2 draughts and internal daggla identity. This weakened native attempt succeeded; the later normal-motion full-health
  attempt broke free, as detailed in the additional edge checks below.
- A labelled native diagnostic scheduled a delayed effect, then dispatched
  synthetic window blur and Music hidden/resume. Both voices were retired,
  hidden effects were ignored, and focus/resume queued no burst. The effect
  and music context identities matched. This is not physical backgrounding.
- Normal Sound off left zero effect voices; console remained clean.

Final world interaction/reward edges and the integrated audiovisual review
continue with the complete revised visual pass. These checks and exports are not a listening-quality verdict.

## Additional native edge verification

Normal-motion checks now cover full-health capture failure, Brace, voluntary
switch, escape, multi-opponent sendout and final-companion loss. Starting saves
are labelled, while every action uses ordinary controls and the actual engine.
`edge-checks/` retains semantic frame/audio traces. A missed capture consumed one
vessel and caused one reply. Switching to Brinecrest caused exactly one reply.
A1HP final companion lost, then returned to Mira healed with recovery supplies.
No extra random choices or duplicate result sounds appeared; voices retired.

A level100 Maren fixture isolates a sendout with no XP phase. Normal motion's
outgoing defeat ended before the actual incoming frame. Reduced motion exposed
69ms of outgoing defeat tail after the next creature had appeared. New fighter
edges (sendout/switch) now retire outgoing SFX before playing the incoming effect;
the repeated native trace records1 outgoing voice→0 at that boundary and one
fresh sendout. Music and its warning/loop are untouched. This is scheduling and
visible-enemy identity evidence, not an audition of the transition.

The same check found2176 drawImage calls to the hidden world while opening Fight
and resolving one hit/sendout. Battle/panel renders now skip that hidden work;
genuine entry captures the committed arrival once. Repeated native observation
records0 hidden-world draws through the corresponding action sequence. This
supports removing wasted rendering, not a physical FPS claim.

A normal-motion Menu opened during a failed capture sequence. The actual enemy
reply frame occurred with Menu open and its SFX was skipped. Back produced no
queued result/reply burst; commands became usable and effect voices were0. The
retained fresh-UID capture probe is the authoritative interruption case. Final
world puzzle/reward sound edges and the complete revised visual candidate still
need their integrated review. Source/export suitability is not release or
listening-quality acceptance.
