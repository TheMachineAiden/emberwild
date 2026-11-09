"""Export retained native pixel matrices and selected raster derivatives."""
import json
from pathlib import Path
from PIL import Image
from export_compact_world import export_rasters
from export_generated_people import export_people
root=Path(__file__).resolve().parents[1]
# Each source owns its palette; a new family cannot recolor older map/cast art.
# Later named entries explicitly supersede the earlier retained source.
assets={}
for filename in ('pixels.json','humans.json','humans-compact.json','compact-ground.json','compact-biomes.json'):
    path=root/'assets/source/world'/filename
    if not path.exists():
        continue
    source=json.loads(path.read_text())
    for group in ('tiles','characters'):
        for name,rows in source.get(group,{}).items():
            assets[name]=(rows,source['palette'])
for name,(rows,palette) in assets.items():
    width=len(rows[0])
    assert all(len(row)==width for row in rows),name
    image=Image.new('RGBA',(width,len(rows)))
    image.putdata([tuple(bytes.fromhex(palette[p][1:])) if len(palette[p])==9 else (*bytes.fromhex(palette[p][1:]),255) for row in rows for p in row])
    image.resize((width*2,len(rows)*2),Image.Resampling.NEAREST).save(root/f'assets/world/{name}.png')
export_rasters(root)
export_people(root)
print('Retained world raster exports complete')
