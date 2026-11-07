# Authored world pixels

`pixels.json` is the editable raster source: each character names one exact pixel color, each string is a row. Tiles are authored at 12×12 and exported nearest-neighbor to 24×24. Human sprites are 8×12 exported to 16×24, with feet at the bottom center. The exporter only maps the retained pixels to PNG; it does not invent texture or scene geometry. Reproduce with `.venv/bin/python scripts/export_world.py` (Pillow 11.3.0).

Ground, coast water, reeds, tree, copper roof, windowed house wall, stone floor/wall, stair, sealed stair, bowl and lit bowl are separate rasters. The player has front and rear head details. The world renderer composes PNGs on the existing map coordinates; labels are UI text. Källaren and summit use stone surfaces, outdoor maps coastal water and vegetation. Door/stair and puzzle light states use different raster assets.

This first world set requires rendered desktop/mobile review before final acceptance. Larger landmarks, natural terrain edges, actor readability and map-specific composition remain art review work.
