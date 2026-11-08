# Battle environment raster candidates

The current runtime still uses battle-coast-master.png through export_polish.py.
The following replacement candidates are retained for contact/composition review;
they are not yet the active battle set. Built-in image generation created the
originals, with the first coast as the style/composition reference. Prompt files
retain the full production request. No game collision or encounter data changes.

| Candidate source | Role | Prompt |
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
