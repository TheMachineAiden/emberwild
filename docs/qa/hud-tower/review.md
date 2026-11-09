# Compact HUD and Stillglass deduction

The generated human cast and environment remain unchanged. Inline grid-based SVG
icons replace the visible Sprint/Talk blocks and Menu text. A music button sits
beside the gear, with a clear note/mute mark, warm enabled border and English
accessible name/pressed state. Top targets are48×48 and bottom targets64×64.
The112×112 joystick keeps its input geometry and uses translucent layers plus a
two-tone contour to remain legible over pale paths and dark masonry. Native text
and the world camera retain their existing scale. No platform emoji are used.

Music and sound effects are independent. The existing Music/WebAudio engine owns
both preferences under `emberwild.music.v1` and `emberwild.effects.v1`; no earlier
audio preference was stored. Music starts off, effects start on after a trusted
gesture, and both choices persist independently. Restoring an enabled preference
creates no AudioContext until a gesture. A first action that mutes music does not
briefly start it. The menu's Sound effects control changes only effects. Existing
cue crossfades, hidden-page cleanup and the one-time battle warning are retained.
Suspended/pending contexts cannot queue music or stale effects.

The vault now asks for an allocation rather than an ordered list. Its inscription,
reset tablet and individual rim marks provide complementary constraints. The
player can adjust each wick and read its state; cached native-text labels update
only when values change, including failure/reset. The apparatus tests a complete
setting. Wrong trials lower the wicks without spending inventory or HP. Ordinary
objectives, NPC guidance, reset and error text no longer provide an ordered answer.
There is no new hint system, dungeon, art batch or quest platform.

Version1 saves remain supported. A new puzzle marker and small wick-state array
preserve current partial arrangements. Old partial ordered sequences safely settle
to an empty apparatus with an explanatory load message; earned solved/completed
flags retain the open summit and their progress. The old bowlStep field remains
for compatibility, while current rendering/actions use the wick state.

| Check | Evidence | Result |
| --- | --- | --- |
| Light/dark phone HUD | `hud-light844.png`, `hud-light667.png`, `hud-dark667.png` | Full viewport, readable icons and translucent joystick; touch targets retain generous bounds |
| Independent native music/SFX | Native music on/off then Menu confirmation; actual context/voice observations | Music mute retires its voices while confirmation SFX still schedule |
| Persisted preferences and gesture gate | Reload with music enabled/effects disabled; first trusted Shift input | Restored states match;0 contexts before gesture,1 running context afterward |
| First action is mute | Reload enabled music, native music click before gameplay | Preference becomes off with0 AudioContexts created |
| Sprint/interaction | Native Shift+Down, pointer click on sprint, speech-icon click on a bowl |145ms sprint tile; button and held input release; interaction opens correct feedback |
| Clues/reset/error | Normal navigation from a labelled unsolved4,4 starting save | All clue sources and harmless wrong trial exercised; small dialogue fits667×375 |
| Current partial save | Native Menu Save and ordinary reload mid-puzzle | Exact saved bytes and partial arrangement preserved |
| Solve and legacy states | Normal-input solve; focused engine save/reset/old solved tests | Correct outcome and summit access; no supplies/HP cost; prior earned resolution preserved |
| Automated regression |79 existing/focused tests | Pass, including music independence/persistence/pending resume and puzzle wrong/reset/order independence/save compatibility |
| Final local regression | Native wild Catch/Save/reload, PR8 waiting update,332 offline runtime hashes, legacy solved summit, portrait/reduced motion and desktop | Pass; `final-regression.json` records the checks and retained evidence digests |
| Release acceptance | Exact integrated review, reviewed PR and public identity/control/save/offline smoke | Pending |

Starting map/flag fixtures are diagnostic access, not a fresh campaign completion.
All subsequent interactions used native keys/clicks. JavaScript observed context,
draw/input state and saved data; it did not supply the signoff actions. Raw receipts
remain in the local QA cache, summarized in `native-checks.json`. Audio observations
establish scheduling/lifecycle behavior, not audition quality. Physical-device
refresh and multitouch remain unverified.

Final-copy dialogue screenshots use labelled position/setting fixtures and native
Enter; the full navigation, partial Save/reload, wrong trial and solve receipts
were recorded separately with normal input. A stale-label defect found during
rendered review was corrected and verified against both incremented and reset
saved state.


Counter clearance follow-up, runtime `121acdb55346dcbd0f5330495b6544eb900117fc`:
world apparatus labels avoid the actual Music/Menu group and location-title bounds.
Labels move only when they intersect these persistent regions; camera, collisions
and puzzle rules are unchanged. At vault position10,9, all three counters fit and
remain unoccluded at667×375 and844×390, with music on and off. The five retained
`121-counters*.png` images show the two states and a live partial arrangement.
`counter-clearance.json` records bounds, hashes and native checks. Save/reload
preserves the partial counter and exact bytes; reset visibly returns all counters
to zero.79 tests pass. The isolated local review-entry helper is outside the game
build and service-worker scope; it is not shipped. Independent puzzle acceptance
and final publication checks remain pending.
