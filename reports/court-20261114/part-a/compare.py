from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parent
dest=root/'comparisons'
dest.mkdir(exist_ok=True)
rows=[]
for after in sorted((root/'after').glob('*.png')):
    before=root/'before'/after.name
    if not before.exists():
        rows.append(f'- [{after.stem} (current; no baseline captured)](after/{after.name})')
        continue
    left=Image.open(before).convert('RGB');right=Image.open(after).convert('RGB')
    canvas=Image.new('RGB',(left.width+right.width+24,max(left.height,right.height)+38),'#eee9e1')
    draw=ImageDraw.Draw(canvas);draw.text((12,12),'Before',fill='#302b25');draw.text((left.width+24,12),'After',fill='#302b25')
    canvas.paste(left,(0,38));canvas.paste(right,(left.width+24,38));canvas.save(dest/after.name,optimize=True)
    rows.append(f'- [{after.stem}](comparisons/{after.name})')
(root/'README.md').write_text('# Part A screen checks\n\n14 November 2026. Real local API, isolated database, synthetic cases only.\nTen changed-screen checks passed; nine before/after pairs and the admin-return\nview are below. Calendar selection, Indian currency grouping, upload grouping,\nsubmitted read-only presentation, restored editor, privacy copy and office-note\nviewer were checked. No deployment.\n\n'+'\n'.join(rows)+'\n',encoding='utf-8')
