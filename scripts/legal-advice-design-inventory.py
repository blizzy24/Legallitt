from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import json

root=Path('design/figma-2026-11-12')
out=Path('reports/legal-advice-20261114/design-inventory')
out.mkdir(parents=True, exist_ok=True)
inventory=[]
for side in ['Client','Advocate']:
    files=sorted((root/f'Legal-Advice-{side}-Side').glob('*.png'))
    for offset in range(0,len(files),12):
        batch=files[offset:offset+12]
        sheet=Image.new('RGB',(1200,1050),'#dedbd6')
        draw=ImageDraw.Draw(sheet)
        for i,file in enumerate(batch):
            with Image.open(file) as image:
                inventory.append({'side':side,'file':str(file),'width':image.width,'height':image.height})
                thumb=ImageOps.contain(image.convert('RGB'),(190,460))
                x=(i%6)*200;y=(i//6)*525
                sheet.paste(thumb,(x,y+35))
                draw.text((x+3,y+3),file.name[:30],fill='black')
        sheet.save(out/f'{side.lower()}-{offset:02}.jpg',quality=90)
(out/'index.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')
print('Inventoried',len(inventory),'Legal Advice screens')
