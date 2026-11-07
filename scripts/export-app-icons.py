"""Deterministic size/mask derivatives of the retained Emberwild icon master."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
master = Image.open(root / 'assets/source/app/wickit-emblem-master.png').convert('RGB')
target = root / 'assets/app'
target.mkdir(parents=True, exist_ok=True)
# Keep the whole authored image. The additional maskable margin places every
# essential ear/tail/flame pixel inside the central 80%-diameter safe circle.
background = master.getpixel((0, 0))
for name, size, fraction in [
    ('icon-192.png',192,1),('icon-512.png',512,1),
    ('maskable-192.png',192,.76),('maskable-512.png',512,.76),
    ('apple-touch-icon.png',180,1),('favicon-32.png',32,1),
]:
    image = Image.new('RGB',(size,size),background)
    side = round(size*fraction)
    image.paste(master.resize((side,side),Image.Resampling.LANCZOS),((size-side)//2,(size-side)//2))
    image.save(target/name,optimize=True)
    print(name,image.size,image.mode)
