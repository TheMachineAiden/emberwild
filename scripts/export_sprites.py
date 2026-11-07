"""Deterministic sprite derivatives from retained RGBA raster sources."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = Image.open(ROOT / 'assets/source/glimra-poses.png').convert('RGBA')
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
    frame.save(ROOT / f'assets/creatures/glimra-{pose}.png')
    print(f'glimra-{pose}.png: 64x64, source crop {box}')
