"""Deterministic sprite derivatives from retained RGBA raster sources."""
from pathlib import Path
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT / 'assets/source/creatures.json').read_text())
for name in (sys.argv[1:] or manifest.keys()):
    source = Image.open(ROOT / 'assets/source' / manifest[name]).convert('RGBA')
    width, height = source.size
    for index, pose in enumerate(('front', 'back')):
        cell = source.crop((index * (width // 2), 0, (index + 1) * (width // 2), height))
        # Ignore nearly transparent generation speckles when choosing the contact box.
        box = cell.getchannel('A').point(lambda alpha: 255 if alpha > 128 else 0).getbbox()
        if box is None:
            raise ValueError('Empty source pose')
        cropped = cell.crop(box)
        factor = min(56 / cropped.width, 56 / cropped.height)
        sprite = cropped.resize((round(cropped.width * factor), round(cropped.height * factor)), Image.Resampling.NEAREST)
        frame = Image.new('RGBA', (64, 64))
        frame.alpha_composite(sprite, ((64 - sprite.width) // 2, 60 - sprite.height))
        frame.save(ROOT / f'assets/creatures/{name}-{pose}.png')
        print(f'{name}-{pose}.png: 64x64, source crop {box}')
