"""Export authored pixel matrices, with no generated geometry or runtime drawing."""
import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'assets/source/world/pixels.json').read_text())
for group in ('tiles','characters'):
    for name,rows in source[group].items():
        width=len(rows[0])
        assert all(len(row)==width for row in rows),name
        image=Image.new('RGBA',(width,len(rows)))
        image.putdata([tuple(bytes.fromhex(source['palette'][pixel][1:])) if len(source['palette'][pixel])==9 else (*bytes.fromhex(source['palette'][pixel][1:]),255) for row in rows for pixel in row])
        image.resize((width*2,len(rows)*2),Image.Resampling.NEAREST).save(root/f'assets/world/{name}.png')
        if name=='player':
            back=rows.copy();back[3]='ooccccoo';back[4]='.occco..'
            image.putdata([(*bytes.fromhex(source['palette'][pixel][1:]),255) if pixel!='.' else (0,0,0,0) for row in back for pixel in row])
            image.resize((width*2,len(rows)*2),Image.Resampling.NEAREST).save(root/'assets/world/player-back.png')
print('Authored world raster exports complete')
