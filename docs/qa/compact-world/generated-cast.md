# Generated compact cast: integrated review

This records the cast milestone. The following HUD/tower revision is recorded in
`../hud-tower/review.md`.

All seven people now share the generated A raster family and its native24×30
frame. The accepted hero and Mira/Perrin idle PNGs remain byte-identical. Matching
generated atlases supply four-direction idle/two walking poses for every person,
plus static and fallback aliases:84 poses and7 aliases. Static villagers do not
gain new behavior. Rowan wears russet field clothes with a green satchel/notebook;
Maren has a warm copper-brown complexion, tied dark hair, navy jacket and russet
scarf; Alder has silver hair/beard and a brass lens pendant; Tamsin wears moss-green
field clothes with a shoulder strap/pouch. Mira's bun/apron and Perrin's grey hair,
moustache and moss coat remain distinct. Sources/prompts and Maren's first atlas
are retained; her second atlas changes only the complexion palette.

The common draw offset(0,-6) preserves the old tile contact(12,24), collision,
camera scale and movement timing. The trainer notice label moves up by the same
six logical pixels so it clears the taller head. Engine, map data, controls, UI,
creatures, music/effects and PWA lifecycle code do not change. The environment is
unchanged from the corrected human pilot. Frozen encounter takeovers now include
the new humans; battles retain the existing creature composition and trainer names,
without adding a portrait system.

| Area | Actual render/input evidence | Result |
| --- | --- | --- |
| Native cast identity/directions | `generated-cast-native.png` is a source sheet at the phone's2× sprite scale; compare with the selected A board and retained pilot |91 production PNGs inspected/verified; all have binary alpha and stable top/contact rows |
| Village/desktop | `generated-cast-desktop.png`, labelled6,5 save then normal blocked Left; original844/667 generated pilot captures remain current | Full viewport1280×720; people, doors and feet retain contact |
| Meadow / Rowan | Native Right from labelled route11,8; `generated-rowan-notice844.png`, `generated-rowan-takeover844.png`, `generated-rowan-battle844.png` | Visible notice, both west walking poses, one normal challenge; native takeover capture was not paused |
| Coast / Maren and Tamsin | `generated-cast-coast844.png`, `generated-cast-maren667.png`; normal Down/Right/Down/blocked Right/Enter | Both actors readable at their original tiles; Maren's existing dialogue opens |
| Notice interruption/reentry | Native Right from ridge13,9, immediate Menu during notice, Back, Left/Right; `generated-maren-notice667.png` and takeover capture | Controls recover; no automatic battle on Back; reentry yields normal approach/encounter |
| Crown / Alder | `generated-cast-crown667.png`; native Right from8,6; `generated-alder-notice667.png` and battle capture | Both south walking poses; vertical foot movement is monotonic; correct Crown battle |
| Vault / hero and puzzle states | `generated-cast-vault667.png`, labelled10,8 with first vessel lit | New hero grounded; vessel/wall/readability retained |
| Functional and source checks |70 existing tests;91 PNG geometry/transparency checks;261 deterministic world exports | Pass; all14 accepted pilot PNGs unchanged |
| Final candidate regressions | Existing save/species identity, normal wild Catch+Save/reload, offline/update, portrait/reduced motion, longer input/menu interruption | Pending on exact candidate before release |

Map/flag starting fixtures are diagnostic access, not campaign-completion claims.
Input after each fixture uses native keyboard, click or joystick tools. Actual
draw traces are summarized in `generated-cast-motion.json`: Rowan63 draws with a
constant screen foot219 and horizontal approach652→508; Alder32 draws with foot
178→226; Maren89 draws with foot87→183. All three show idle and both matching walk
poses, and the vertical approaches never reverse. Camera motion during the initial
player step also shifts actor screen X; it is not actor sidestepping. Raw event and
draw receipts are retained locally. Console check after the coast interaction was
empty. Checked667/844/1280 document bounds equal their viewport bounds.

These short native gestures and frame observations do not establish sustained
physical-device refresh, multitouch or audio audition. Overall exact-build review,
the final focused regressions and public verification remain release requirements.
