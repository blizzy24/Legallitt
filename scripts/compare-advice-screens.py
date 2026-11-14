from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path('design/figma-2026-11-12'); out=Path('docs/flows/la-screens'); (out/'comparisons').mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
mapping={'client-landing':'Html → Body (9).png','client-info':'Html → Body (10).png','client-categories':'07.png','client-intake':'05.png','client-requested-slot':'09.png','client-review':'136.png','client-scan-pay':'Documents Forensic 19.png','client-payment-success':'12.png','client-slot-requested':'14.png','client-chat':'138.png','client-completed':'13.png','client-time-proposal':'14.png','client-video-room':'16.png','client-video-paused':'16.png','client-video-completed':'13.png','client-rating':'20.png','client-followup':'Html → Body (11).png','client-followup-selection':'157.png','advocate-request':'48.png','advocate-confirmed':'43.png','advocate-chat':'40.png','advocate-summary':'46.png','advocate-video-room':'36.png','advocate-video-paused':'53.png'}
rows=[]
for p in sorted((out/'built').glob('*.png')):
 if p.stem.startswith('failure-'):continue
 side='Advocate' if p.stem.startswith('advocate-') else 'Client'
 name=mapping.get(p.stem)
 if 'checkout' in p.stem:name='Documents Forensic 18.png'
 if 'advocates' in p.stem:name='03.png' if 'audio' in p.stem else '04.png' if 'video' in p.stem else '157.png'
 ref=root/f'Legal-Advice-{side}-Side'/name if name else None
 if ref and not ref.exists() and name.startswith('Html '):
  matches=list(ref.parent.glob('*'+name.split('Body',1)[1]+''))
  if len(matches)==1:ref=matches[0]
 if ref and not ref.exists():raise Exception(f'Missing mapped reference {ref}')
 images=[]
 for f in ([ref] if ref else [])+[p]:
  im=Image.open(f).convert('RGB');im.thumbnail((690 if p.stem.startswith('admin-') else 430,6000));images.append(im)
 width=1460 if p.stem.startswith('admin-') else 920
 canvas=Image.new('RGB',(width,max(im.height for im in images)+90),'#eee9e2');draw=ImageDraw.Draw(canvas)
 draw.text((20,15),'Supplied November design' if ref else 'Shared / undesigned screen (§9.2)',font=font,fill='black');draw.text((width//2+20,15),'Built · new synthetic local case',font=font,fill='black')
 if ref:canvas.paste(images[0],(20,65))
 canvas.paste(images[-1],(width//2+20,65));target=out/'comparisons'/(p.stem+'.jpg');canvas.save(target,quality=85,optimize=True)
 rows.append(f'| {p.stem} | [Capture](built/{p.name}) | [Comparison](comparisons/{target.name}) | {ref.as_posix() if ref else "Shared screen / existing admin style"} |')
(out/'README.md').write_text('# Legal Advice visual evidence\n\nActual browser captures from the isolated local acceptance database; all cases are newly labelled synthetic data. The 60-point answers override drawn fixed tier prices, independent advocate end-call controls and repeated KYC. Test calls transmit no media. Test checkout and preliminary AI output are labelled. Missing configuration and real empty profiles are not filled with fixtures. Admin screens use the existing panel style (architecture §9.2).\n\n| Screen | Built | Side-by-side | Reference |\n|---|---|---|---|\n'+'\n'.join(rows)+'\n',encoding='utf8')
print(f'{len(rows)} Legal Advice comparisons written')
