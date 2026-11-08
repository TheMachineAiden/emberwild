"""Export authored pixel matrices, with no generated geometry or runtime drawing."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'assets/source/world/pixels.json').read_text())
human_source=root/'assets/source/world/humans.json'
humans=json.loads(human_source.read_text()) if human_source.exists() else {'palette':{},'characters':{}}
for group in ('tiles','characters','humans'):
    pixels=humans['characters'] if group=='humans' else source[group]
    palette=humans['palette'] if group=='humans' else source['palette']
    for name,rows in pixels.items():
        if group=='characters' and name in humans['characters']:
            continue
        width=len(rows[0])
        assert all(len(row)==width for row in rows),name
        image=Image.new('RGBA',(width,len(rows)))
        image.putdata([tuple(bytes.fromhex(palette[pixel][1:])) if len(palette[pixel])==9 else (*bytes.fromhex(palette[pixel][1:]),255) for row in rows for pixel in row])
        image.resize((width*2,len(rows)*2),Image.Resampling.NEAREST).save(root/f'assets/world/{name}.png')
        if name=='player':
            back=rows.copy();back[3]='ooccccoo';back[4]='.occco..'
            image.putdata([(*bytes.fromhex(source['palette'][pixel][1:]),255) if pixel!='.' else (0,0,0,0) for row in back for pixel in row])
            image.resize((width*2,len(rows)*2),Image.Resampling.NEAREST).save(root/'assets/world/player-back.png')
print('Authored world raster exports complete')
