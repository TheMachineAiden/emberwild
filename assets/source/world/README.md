# Retained world raster sources

The24×24 logical tile/collision grid remains authoritative. All active generated
people use24×30 frames with foot contact unchanged; retained matrix people use16×24.
Final visuals are PNGs; UI labels remain native text. Run
`.venv/bin/python scripts/export_world.py` with the pinned Pillow dependency.

The exporter reads named sources in order, each with its own palette. Later
entries supersede earlier matching IDs without recoloring other cast/map art:

1. `pixels.json`: original12×12 terrain and8×12 people, retained unchanged.
2. `humans.json`: PR8 human set, native16×24, retained unchanged.
3. `humans-compact.json`: compact explorer, Mira, Perrin, Rowan, Maren, Alder and
   Tamsin, each with four directions and idle/two walking poses, plus legacy
   aliases. These are authored native pixels,
   not crops of the conceptual board. Head rows0–10 remain fixed across each gait;
   bottom row23 keeps foot contact. Arms and legs oppose each other.
4. `compact-ground.json`: native24×24 meadow terrain, paths/edge overlays,
   water poses and small ground decorations, shared by Briarwick and Sedgeway.
5. `compact-biomes.json`: native24×24 coast sand/path variants, stone floors/walls,
   reeds, campfire, puzzle vessels, doors and stairs/seals. Foreground rustle strips
   are24×12 and retain the existing underfoot anchor and lifetime.

Matrix rasters export at2× source dimensions, rendered at their original logical
size with nearest-neighbour sampling. For example32×48 human PNGs draw16×24;
48×48 ground PNGs draw24×24. This keeps the same logical pixel scale and viewport.

`export_compact_world.py` also reads the retained isolated
`../compact-briarwick-master.png`: separate alpha-bounded cells for a cottage and
tree. They are sampled onto72×72 and40×40 native grids respectively, with binary
alpha and bounded palettes (20 cottage colors,12 tree colors), then exported at2×.
They are not cropped out of the full environment concept. The cottage stays in
its72×72 world frame with bottom threshold contact; the tree canopy draws40×40 at
(-8,-16) relative to its existing24×24 tile, so its root still meets tile bottom.
Depth ordering lets foreground roofs/canopies cover an actor standing behind.
Collision and map/path coordinates do not change. Review occlusion readability
throughout the broader environment set.

`../compact-landmarks-master.png` retains three separately framed generated
landmarks: lighthouse, closed dark beacon and open lit beacon. The exporter samples
the lighthouse onto72×96 and both beacon states onto72×72, with20-color palettes,
binary alpha and2× PNGs. The beacon cells are registered by their stone plinth
(the lit source is45 source pixels left of the dark cell), then sampled at the
same scale. Opening shutters must not move or resize the housing or foot anchor.
The source prompt is retained alongside the master. These are isolated derivatives,
not a high-resolution scene pasted over the map. Tower foundation tiles use warm
stone; the vault and Crown retain distinct cool stone walls and floors.

Source-to-production dimensions and hashes are retained in
`docs/qa/compact-world/source-production-map.json` for the pilot and
`docs/qa/compact-world/full-source-production-map.json` for the full cast/maps.
The sources, exporter and actual
native renders together establish the mapping; large concept art is not evidence
of native pixel precision, gameplay, contact or animation quality.

## Generated A people

The original `docs/art-direction/human-options-2026-11-08.png` A column is the
identity source. `../a-hero-extract-master.png` isolates that character;
`../a-hero-poses-master.png` is its generated four-direction idle/walk edit.
`../a-villagers-master.png` supplies Mira/Perrin as matching generated variants.
Prompts are retained alongside all three. Six matching directional atlases extend
this family to Mira, Perrin, Rowan, Maren, Alder and Tamsin. Maren's active source
is `a-maren-poses-master-v2.png`, a retained palette edit of the first atlas. All
active human appearances use these raster sources; older matrices remain history.
The hero and original Mira/Perrin idle PNGs stay byte-identical to the pilot.

`export_generated_people.py` samples those raster masters directly. It removes
transparent atlas gutters with alpha>128, registers the full figure to a common
30-pixel height, uses nearest-neighbour sampling and binary alpha, and exports a
24×30 native frame at2×. It does not redraw the human or reduce its palette.
`generated-people.json` records each source cell/crop and world offset(0,-6).
The frame's foot(12,30) therefore stays at the original tile center/bottom(12,24).
The small frame adaptation preserves the compact face/body while collision and
travel/camera code remain unchanged. Native captures and production hashes are in
`docs/qa/compact-world/generated-human-*`; generated sources alone do not prove
motion or integration quality. The full family has84 directional idle/walk poses
and7 static/fallback aliases (91 PNGs). Static villagers retain their existing
behavior; supplying source poses does not introduce wandering NPCs. Production
hashes and integrated observations are in `generated-cast-production-map.json`
and `generated-cast.md` under `docs/qa/compact-world/`.
