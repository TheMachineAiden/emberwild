"""Deterministic production derivatives of retained polish raster sources."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'assets/source'
Image.open(source/'battle-coast-master.png').convert('RGB').resize((480,240),Image.Resampling.NEAREST).save(ROOT/'assets/world/battle-coast.png')
# The contact mark is authored as a fixed pixel matrix, not runtime geometry.
rows=['......xxxxxxxxxxxx......','...xxxxxxxxxxxxxxxxxx...','.xxxxxxxxxxxxxxxxxxxxxx.','xxxxxxxxxxxxxxxxxxxxxxxx','.xxxxxxxxxxxxxxxxxxxxxx.','...xxxxxxxxxxxxxxxxxx...','......xxxxxxxxxxxx......']
im=Image.new('RGBA',(24,7)); im.putdata([(12,31,37,140) if p=='x' else (0,0,0,0) for r in rows for p in r]); im.save(ROOT/'assets/world/battle-contact.png')
print('Coast and contact exported')
