"""Deterministic native derivatives of the retained generated A people rasters.

No pixel matrix recreation: every visible pixel samples the generated raster.
Crop/registration removes atlas gutters, binary alpha cleans transparent noise,
and one native30px height preserves the selected large-head/short-body ratio.
"""
import json
from pathlib import Path
from PIL import Image

def export_people(root):
    records=[]
    def export(cell,name,source,source_cell):
        mask=cell.getchannel('A').point(lambda a:255 if a>128 else 0)
        bounds=mask.getbbox()
        if not bounds:raise ValueError('Empty person cell: '+name)
        sprite=cell.crop(bounds)
        # Common contact line, fixed native height and no blur/palette reduction.
        width=round(sprite.width*30/sprite.height)
        if width>24:raise ValueError('Person exceeds native frame: '+name)
        sprite=sprite.resize((width,30),Image.Resampling.NEAREST)
        sprite.putalpha(sprite.getchannel('A').point(lambda a:255 if a>128 else 0))
        frame=Image.new('RGBA',(24,30));frame.alpha_composite(sprite,((24-width)//2,0))
        path=root/f'assets/world/{name}.png';frame.resize((48,60),Image.Resampling.NEAREST).save(path)
        records.append({'id':name,'source':source,'source_cell':source_cell,'alpha_crop':bounds,
                        'logical_size':[24,30],'png_size':[48,60],'foot_anchor':[12,30],
                        'world_offset':[0,-6],'production':f'assets/world/{name}.png'})
    atlas_name='assets/source/a-hero-poses-master.png';atlas=Image.open(root/atlas_name).convert('RGBA')
    for row,direction in enumerate(('south','north','east','west')):
        for col in range(3):
            box=(col*362,row*362,(col+1)*362,(row+1)*362)
            name=f'a-player-{direction}'+(f'-{col}' if col else '')
            export(atlas.crop(box),name,atlas_name,box)
    villager_source='assets/source/a-villagers-master.png'
    villager_atlas=Image.open(root/villager_source).convert('RGBA')
    for col,person in enumerate(('healer','perrin')):
        box=(col*887,0,(col+1)*887,887)
        export(villager_atlas.crop(box),'a-'+person,villager_source,box)
    for person in ('rowan','maren','alder','tamsin','healer','perrin'):
        source=f'assets/source/a-{person}-poses-master'+('-v2' if person=='maren' else '')+'.png'
        poses=Image.open(root/source).convert('RGBA')
        if poses.size!=(1086,1448):raise ValueError('Unexpected atlas dimensions: '+source)
        for row,direction in enumerate(('south','north','east','west')):
            for col in range(3):
                box=(col*362,row*362,(col+1)*362,(row+1)*362)
                pose=f'a-{person}-{direction}'+(f'-{col}' if col else '')
                if person in ('healer','perrin') and row==0 and col==0:
                    # The accepted village idle stays byte-identical; retain its
                    # original raster source rather than substituting a redraw.
                    source_box=((0,0,887,887) if person=='healer' else (887,0,1774,887))
                    export(villager_atlas.crop(source_box),pose,villager_source,source_box)
                else:export(poses.crop(box),pose,source,box)
        if person not in ('healer','perrin'):
            original=next(r for r in records if r['id']==f'a-{person}-south')
            alias=f'a-{person}'
            (root/f'assets/world/{alias}.png').write_bytes((root/original['production']).read_bytes())
            records.append({**original,'id':alias,'production':f'assets/world/{alias}.png'})
    original=next(r for r in records if r['id']=='a-rowan-south')
    (root/'assets/world/a-trainer.png').write_bytes((root/original['production']).read_bytes())
    records.append({**original,'id':'a-trainer','production':'assets/world/a-trainer.png'})
    (root/'assets/source/world/generated-people.json').write_text(json.dumps(records,indent=2)+'\n')
    print('Generated raster people:',len(records),'native24x30, foot12,30')

if __name__=='__main__':export_people(Path(__file__).resolve().parents[1])
