"""Bounded native derivatives of retained, separately framed raster masters."""
from PIL import Image

def export_rasters(root):
    path=root/'assets/source/compact-briarwick-master.png'
    if not path.exists():
        return
    image=Image.open(path).convert('RGBA')
    for index,(name,w,h) in enumerate((('a-cottage',72,72),('a-tree',40,40))):
        cell=image.crop((index*image.width//2,0,(index+1)*image.width//2,image.height))
        box=cell.getchannel('A').point(lambda a:255 if a>128 else 0).getbbox()
        if box is None:raise ValueError('Empty source cell: '+name)
        cell=cell.crop(box)
        scale=min(w/cell.width,h/cell.height)
        cell=cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.NEAREST)
        # Deliberate small palette and binary alpha, no interpolation/dither haze.
        alpha=cell.getchannel('A').point(lambda a:255 if a>128 else 0)
        rgb=cell.convert('RGB').quantize(colors=12 if name=='a-tree' else 20,dither=Image.Dither.NONE).convert('RGBA')
        rgb.putalpha(alpha)
        frame=Image.new('RGBA',(w,h));frame.alpha_composite(rgb,((w-rgb.width)//2,h-rgb.height))
        frame.resize((w*2,h*2),Image.Resampling.NEAREST).save(root/f'assets/world/{name}.png')
        print(name, 'source box',box,'native',(w,h),'opaque',frame.getbbox())
    landmarks=Image.open(root/'assets/source/compact-landmarks-master.png').convert('RGBA')
    for index,(name,w,h) in enumerate((('a-lighthouse',72,96),('a-beacon-dark',72,72),('a-beacon-lit',72,72))):
        cell=landmarks.crop((index*724,0,(index+1)*724,724))
        # The two lens states share the same origin and sampling grid. Shutter
        # opening must not recenter or resize the housing, plinth or contact.
        # The source's lit cell is translated 45 source pixels left. Register
        # its stone plinth to the dark cell before the common 560-square sample.
        box=((218,24,551,710),(82,139,642,699),(37,139,597,699))[index]
        cell=cell.crop(box)
        scale=min(w/cell.width,h/cell.height)
        cell=cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.NEAREST)
        alpha=cell.getchannel('A').point(lambda a:255 if a>128 else 0)
        rgb=cell.convert('RGB').quantize(colors=20,dither=Image.Dither.NONE).convert('RGBA')
        rgb.putalpha(alpha)
        frame=Image.new('RGBA',(w,h));frame.alpha_composite(rgb,((w-rgb.width)//2,h-rgb.height))
        frame.resize((w*2,h*2),Image.Resampling.NEAREST).save(root/f'assets/world/{name}.png')
        print(name,'source box',box,'native',(w,h),'opaque',frame.getbbox())
