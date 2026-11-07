# Walking and held sprint verification

Baseline: a57f8a181abee333721ec503ad0b0c7d25ca9857. Draft source served on4394; exact committed review build will record its revision in version.json.

Ordinary movement uses 280ms per tile (about 3.6 tiles/s), with the previous 145ms pace available only while holding Shift or the touch Sprint control. A tile snapshots its duration at departure. Arrival still commits the existing collision/encounter/progression state once. The walk cycle remains tied to the fraction of each step, so its cadence slows with walking. Menu, conversation, battle, blur, visibility, rotation and fullscreen changes clear held sprint along with movement. No save format or collection rule changes.

## Inventory and observed input

- Keyboard walk→Shift+ArrowRight→release→walk at667×375 passed. A read-only position wrapper logged280,145,280ms selected durations for three native key inputs; it did not generate input or alter state.
- Ordinary joystick→canvas drag moved7,8→9,8 at walking pace and stopped outside. An ordinary Sprint→canvas drag released its pressed appearance outside without moving the avatar by itself.
- Menu open/close, Mira conversation and battle arrival cleared sprint. Normal movement and Talk/battle actions supplied the gameplay transitions; the extra held Sprint pointer was synthetic, with pointer capture stubbed only for that diagnostic ID. Stale release did not re-arm sprint.
- Synthetic window blur cleared sprint. Portrait390×844 then landscape667×375 retained5,6 and cleared the held pointer; a stale release remained inactive.
- A labelled synthetic two-pointer integration began joystick walking, pressed a separate Sprint pointer mid-tile, released Sprint and finally released the joystick. The sampled step durations were280,145,280,280ms; both controls ended neutral. Capture was stubbed only for these synthetic IDs.
- 39 Node tests pass. New tests cover frozen durations across mid-tile press/release, one encounter commit at sprint arrival, pointer ownership independent of keyboard and unrelated fingers, cancel/lost capture, reset and repeated-key rejection.

## Rendered review and final normal loop

Personally reopened the retained draft and corrected PNGs. Sprint initially sat above Talk and intruded on the lower coastal path. It now sits beside Talk at the bottom,96×64px, with a single-line Hold cue. At the seeded Sedgeway16,10 edge, the avatar, Spark and Rowan remain clear at667×375,844×390 and1280×800. On desktop the avatar center is1029,621; Sprint begins1038,712 and Talk1144,696. The camera and original terrain composition are unchanged. Neither required control clips or forces page scrolling. Conversation hides all three touch controls and keeps Continue reachable. Pressed Sprint has a readable green state; that held-state image uses a labelled synthetic pointer.

Use walk-sprint-{small,wide,desktop}-corner-reviewed.png, walk-sprint-dialogue-reviewed.png and walk-sprint-held-reviewed.png for the corrected result; the three *-draft.png captures retain the earlier vertical layout. All were validated and reopened from the repository. The edge setup was seeded for targeted composition checking; normal Shift+Right at the occupied adjacent tile stayed16,10, then Left→Shift+Right returned safely. A first diagnostic attempted a tree tile18,10 and correctly triggered invalid-save handling; those invalid setup images were discarded. A transient screenshot preview_browser_unavailable response was retried with fresh filenames before any file was retained.

A fresh ordinary Rillfin run repeated walk→Shift sprint→walk, joystick drag, Sprint drag/release, Menu→Save and reload. It retained village9,8, five committed steps,31/31HP, six vessels and three draughts. Sprint and joystick returned neutral; there was no document overflow or console warning/error. Slower ordinary travel reads as deliberate walking through normal chords and joystick drag;145ms remains the brisk optional pace. No unsupported sustained/multifinger motion observation is implied.

Remaining: final exact-build review, PR and authorized public smoke. No broad chapter replay is planned.

## Capture discoverability inspection

Existing wild capture is Bag→Spark Vessel; the card says “Catch a creature · weaken it first”. The battle commands show Bag with vessel/draught counts rather than an explicit Catch label. The field guide explains weakening a wild creature before using a vessel. The engine requires supplies and a free slot in the six-member team, and excludes trainer opponents. This pass changes none of those rules. A buried action label may contribute to poor discoverability; that is an inference from the UI, not a user comprehension test.

## Limits

Chrome DevTools exposes straight single-pointer drag and atomic key chords, not normal simultaneous multi-finger or sustained free-path holds. Native keyboard chords and individual pointer release are tested normally; combined joystick/Sprint and interruption ownership use labelled diagnostics and regression tests. No physical phone/iPhone/notch or audio-listening verdict.
