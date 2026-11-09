# Compact people and places: integrated review

Historical matrix checkpoint. Active human sources and current observations are
recorded in `generated-human-pilot.md` and `generated-cast.md`.

The full set extends the Briarwick native sample across the existing five maps.
People retain16×24 frames, fixed directional head rows and contact row23. The
explorer and accepted Mira/Perrin fronts and all Briarwick terrain remain identical
to the pilot. Rowan has chestnut hair/russet field clothes, Maren darker tied hair,
navy work clothes and a russet scarf, Alder silver hair/beard and a cream/teal coat,
and Tamsin moss field clothes with a small russet pouch. No new NPC behavior or
human battle portrait system was added. Trainers appear in the world and frozen
encounter takeover; the existing battle scene continues with their creatures.

The coast uses pale sand/worn paths, while the vault and Crown use cool masonry.
Trees, reeds, shorelines, campfire, puzzle vessels and stairs share the compact
palette and pixel density. The lighthouse and beacon use retained isolated raster
sources and registered derivatives. One integration correction replaces the old
dark tower foundations with warm stone, preserving their blocked tiles. Beacon
states share their plinth position and scale; the shutters open without recentering.

Source-preview captures use844×390 and667×375 touch emulation at DPR1. They are
actual browser renders, with labelled save fixtures for map access/composition.
Fixtures are diagnostic starting states, not proof of campaign completion.

| Requirement | Visible check / retained evidence | Status |
| --- | --- | --- |
| Entire human cast, idle/directional gait | `full-cast-review.png` source sheet; pilot normal4-direction captures; `full-maren667.png`, `full-crown*.png`, `full-rowan-notice844.png` actual actors | Integrated; exact preview review follows |
| Village architecture/doors/trees/paths/water | Pilot matched before/after844/667, roof/canopy fixtures; `full-village844.png` | Pilot accepted; preserved |
| Meadow/coast identity, readable obstacles | `full-rowan-notice844.png`, `full-ridge844.png`, `full-ridge667.png`; native Down/Right/Down to13,6, blocked Right against Maren | Visible/native input pass |
| Stone rooms/puzzle states/landmarks | `full-vault844.png` first vessel lit; `full-crown844.png`, `full-crown-lit844.png`, `full-crown667.png` dark/lit comparison | Visible state pass; normal puzzle/ending regression pending |
| Trainer notice/approach/encounter | Normal Right from route11,8 into sight; `full-native-motion.json` and notice/battle captures | One encounter; both walking poses, fixed screen foot219, monotonic approach |
| Existing creature battle composition | `full-rowan-battle844.png` | Preserved; Catch/save regression pending |
| Phone legibility and coverage |667/844 actual captures; document bounds equal viewport at checked coast states | No overflow in checked views; final desktop/portrait/reduced-motion pending |
| Movement/camera/collision and interrupts | Existing70 tests; source/PNG anchor checks across seven families; normal coast walking/blocked actor | Pass at source checkpoint; final native holds/menu/tree interrupts pending |
| Saves/species IDs, offline/update | Engine, map data, camera/travel, UI/audio/PWA lifecycle code unchanged | Final exact candidate regression pending |

The Rowan trace records46 actor draws with west idle and both walking poses,
screen foot219 and horizontal position660→516 without reversal. Player input is
ordinary keyboard Right; the initial route position is a labelled save fixture.
The live update enters exactly one Challenge · Rowan and gates travel while the
trainer approaches. On the coast, normal blocked Right/Enter at13,6 opens Maren's
existing post-challenge dialogue; the new sprite retains the same interaction tile.
Console checks after these interactions were empty.

All132 current native matrix/PNG pairs were byte-verified. Five isolated raster
derivatives have checked dimensions and binary alpha. Re-exporting all170 world
PNGs produced identical hashes. The existing directional anchor test now covers
all seven families, with no additional mirrored test suite. Full release acceptance
requires exact running-build review and the remaining focused regressions above.
Browser emulation does not establish physical-device refresh, multitouch, audio
audition or installation quality.
