# Battle environment raster sources

The runtime uses the following three environment masters through export_polish.py.
The earlier battle-coast-master.png is retained as the first composition study. Built-in image generation created the
originals, with the first coast as the style/composition reference. Prompt files
retain the full production request. No game collision or encounter data changes.

| Active source | Role | Prompt |
| --- | --- | --- |
| battle-coast-calm-master.png | Saltwind coast / eastern Sedgeway, reduced foreground texture | battle-coast-calm-prompt.txt |
| battle-meadow-master.png | Western Sedgeway sedge and path | battle-meadow-prompt.txt |
| battle-crown-master.png | Lantern Crown shuttered lighthouse chamber | battle-crown-prompt.txt, battle-crown-clean-prompt.txt |

The chamber correction removes outdoor reeds/flowers from the interior while
retaining its stone platforms, shutters and lens. Selected raster masters are
authoritative; AI regeneration need not be byte-identical. Production derivatives
are deterministic nearest-neighbor240×120 logical pixels enlarged to480×240.
Run `.venv/bin/python scripts/export_polish.py --drafts` to write review previews
in .cache/polish/biome-previews without replacing runtime artwork.

Actual chapter battles occur on Sedgeway, Saltwind Rise and at the Lantern Crown.
The vault has no grass encounters or trainer battle trigger. No extra encounter
or unused vault-specific battle scene is introduced. The Crown image depicts the
existing chamber with shutters still closed before the ending.

Do not assume the prompted platform percentages establish creature contact.
Review the runtime crop and each front/back opaque foot/shadow anchor at667×375,
844×390 anddesktop, and set each environment's contact positions from that
rendered evidence. Keep backdrop pixel detail subordinate to64px creature art.

Runtime contacts are in src/battle-scene.js in the480×240 image coordinate system.
The cover projection follows each actual field size. Exported creature poses share
opaque bottom row59 (contact at60/64 of frame height), confirmed for all16 front/back
exports. Desktop and minimum landscape renders are retained in docs/qa/polish/scenes.
