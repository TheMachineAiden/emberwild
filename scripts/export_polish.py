"""Deterministic production derivatives of retained polish raster sources."""
from pathlib import Path
import sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'assets/source'
if '--drafts' in sys.argv:
    destination=ROOT/'.cache/polish/biome-previews'
    destination.mkdir(parents=True,exist_ok=True)
    for name in ('coast-calm','meadow','crown'):
        image=Image.open(source/f'battle-{name}-master.png').convert('RGB')
        image.resize((240,120),Image.Resampling.NEAREST).resize((480,240),Image.Resampling.NEAREST).save(destination/f'{name}.png')
    print('Battle draft previews exported; runtime artwork unchanged')
    raise SystemExit(0)
Image.open(source/'battle-coast-master.png').convert('RGB').resize((480,240),Image.Resampling.NEAREST).save(ROOT/'assets/world/battle-coast.png')
# The contact mark is authored as a fixed pixel matrix, not runtime geometry.
rows=['......xxxxxxxxxxxx......','...xxxxxxxxxxxxxxxxxx...','.xxxxxxxxxxxxxxxxxxxxxx.','xxxxxxxxxxxxxxxxxxxxxxxx','.xxxxxxxxxxxxxxxxxxxxxx.','...xxxxxxxxxxxxxxxxxx...','......xxxxxxxxxxxx......']
im=Image.new('RGBA',(24,7)); im.putdata([(12,31,37,140) if p=='x' else (0,0,0,0) for r in rows for p in r]); im.save(ROOT/'assets/world/battle-contact.png')
print('Coast and contact exported')
