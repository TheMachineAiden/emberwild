# Native compact Briarwick sample

Baseline is published PR8 dd29914. The sample changes the explorer, Mira/Perrin,
Briarwick cottage/tree and ground family. The remaining cast/maps are deliberately
not produced yet. Creatures, UI, music/effects, progression, map topology/collision,
engine/save IDs and PWA lifecycle code are unchanged.

Matched before/after844×390 and667×375 views use a labelled starting fixture at
Briarwick6,5, followed by a normal blocked Left turn toward Mira. The same camera,
logical actor16×24 frame and phone controls remain. Both humans stand at the
original door approach tiles; the nearer cottage and water/forest/path edge are
visible. At667 the second cottage is naturally outside the camera crop, while
Perrin remains visible at the right edge. No zoom or reduced viewport coverage
was introduced. See `a-before-*` and `a-native-*`.

The compact people are authored16×24 matrices, with dark swept hair, flat profiles,
teal/cream/russet explorer colors, distinct complexion/apron for Mira and grey
hair/moss coat for Perrin. `human-source-reviewed.png` is an enlarged source sheet,
not a game screenshot. Native terrain matrices and isolated generated cottage/tree
references have explicit production mappings; see `source-production-map.json`
and the source README. A first tree derivative was too busy; its palette was
bounded to12 colors before retaining the current captures.

Normal keyboard Up/Down/Left/Right from a labelled open-path8,6 fixture each
committed exactly one tile (steps1–4), used both matching walking poses, cleared
held input and kept the following actor at screenY171 with zero canvas reallocations.
`a-walk-*` captures are actual browser captures; `native-motion.json` records the
observed draw calls. Raw event/frame receipts are retained as `a-walk-*.json`.
A native joystick drag and Shift+Down also exercised the real control paths.
These observations do not establish physical 60/120Hz performance or multitouch.

`a-tree-behind.png` and `a-house-behind.png` are labelled visual position fixtures
at5,10 and5,2. Foot-depth ordering lets foreground art conceal the body with the
head peeking above it. Review this occlusion for readability before expanding the
art family; it is not proof that new terrain is traversable. Native collision is
unchanged. A normal Left/Enter from6,5 talks to Mira, heals/restocks and presents
English dialogue; normal Menu Save/reload retains exact save bytes and position.

70 existing tests pass, with the human anchor test now reading the active compact
source. No new mirrored art tests were added. All 32 matrix source/PNG pairs were
compared byte-for-byte after export, and both raster derivatives and retained
screenshots verified. Console error/warning check was empty. This is a reviewable
native pilot, not full-cast acceptance or a release. Broader scene/cast motion,
trainer/battle appearance and final offline/update regressions follow integration.
