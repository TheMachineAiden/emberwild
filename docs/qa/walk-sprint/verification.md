# Walking and held sprint verification

Baseline: a57f8a181abee333721ec503ad0b0c7d25ca9857. Draft source served on4394; exact committed review build will record its revision in version.json.

Ordinary movement uses280ms per tile (about3.6 tiles/s), with the previous145ms pace available only while holding Shift or the touch Sprint control. A tile snapshots its duration at departure. Arrival still commits the existing collision/encounter/progression state once. The walk cycle remains tied to the fraction of each step, so its cadence slows with walking. Menu, conversation, battle, blur, visibility, rotation and fullscreen changes clear held sprint along with movement. No save format or collection rule changes.

## Inventory and observed input

- Keyboard walk→Shift+ArrowRight→release→walk at667×375 passed. A read-only position wrapper logged280,145,280ms selected durations for three native key inputs; it did not generate input or alter state.
- Ordinary joystick→canvas drag moved7,8→9,8 at walking pace and stopped outside. An ordinary Sprint→canvas drag released its pressed appearance outside without moving the avatar by itself.
- Menu open/close, Mira conversation and battle arrival cleared sprint. Normal movement and Talk/battle actions supplied the gameplay transitions; the extra held Sprint pointer was synthetic, with pointer capture stubbed only for that diagnostic ID. Stale release did not re-arm sprint.
- Synthetic window blur cleared sprint. Portrait390×844 then landscape667×375 retained5,6 and cleared the held pointer; a stale release remained inactive.
- A labelled synthetic two-pointer integration began joystick walking, pressed a separate Sprint pointer mid-tile, released Sprint and finally released the joystick. The sampled step durations were280,145,280,280ms; both controls ended neutral. Capture was stubbed only for these synthetic IDs.
-39 Node tests pass. New tests cover frozen durations across mid-tile press/release, one encounter commit at sprint arrival, pointer ownership independent of keyboard and unrelated fingers, cancel/lost capture, reset and repeated-key rejection.

Pending this bounded pass: retained667×375/844×390/desktop control and corner screenshots, personal visual/motion judgment, final exact-build normal input and save/reload, final review, PR and authorized public smoke. No broad chapter replay is planned.

## Capture discoverability inspection

Existing wild capture is Bag→Spark Vessel; the card says “Catch a creature · weaken it first”. The battle commands show Bag with vessel/draught counts rather than an explicit Catch label. The field guide explains weakening a wild creature before using a vessel. The engine requires supplies and a free slot in the six-member team, and excludes trainer opponents. This pass changes none of those rules. A buried action label may contribute to poor discoverability; that is an inference from the UI, not a user comprehension test.

## Limits

Chrome DevTools exposes straight single-pointer drag and atomic key chords, not normal simultaneous multi-finger or sustained free-path holds. Native keyboard chords and individual pointer release are tested normally; combined joystick/Sprint and interruption ownership use labelled diagnostics and regression tests. No physical phone/iPhone/notch or audio-listening verdict.
