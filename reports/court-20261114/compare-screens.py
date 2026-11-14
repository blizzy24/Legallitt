from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path('design/figma-2026-11-12'); out=Path('docs/flows/court-screens'); (out/'comparisons').mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
def source(name):
 high=name.startswith('hc-'); role='Advocate' if '-advocate-' in name else 'Client'
 folder=root/(('High-Court-Representation-' if high else ('District-Court-Representation-' if role=='Advocate' else 'District-Court-Representaion-'))+role+'-Side')
 if '-admin-' in name:return None
 if any(k in name for k in ['wallet','final-viewer','terms-unavailable','private-note','rating','missing','information-reply']):return None
 dc_client=root/'District-Court-Representaion-Client-Side'
 hc_client=root/'High-Court-Representation-Client-Side'
 exact_client={'review':6,'pending-review':6,'under-review':7,'success':7,'free-change':12,'third-free-change':13,'cancel-paid':14,'cancel-unpaid':14}
 suffix=name.split('-client-',1)[-1]
 if role=='Client' and suffix in exact_client:return dc_client/f'Html → Body ({exact_client[suffix]}).png'
 if role=='Client' and suffix in ['path','pending-path']:return hc_client/'Html → Body (2).png'
 if role=='Advocate':
  suffix=name.split('-advocate-',1)[-1]
  fixed={'waiting':5 if not high else 4,'checklist':9 if not high else 8,'confirm-documents':10 if not high else 9,'preparation':12 if not high else 11,'process-fee':20 if not high else 19,'process-receipt':21 if not high else 20,'documents':1}
  if suffix in fixed:return folder/f'Html → Body ({fixed[suffix]}).png'
  if suffix in ['decline','summary']:return None
 if role=='Client' and suffix=='pickup-details':return folder/f'Html → Body ({15 if high else 18}).png'
 if role=='Client' and suffix in ['cancel-filed-blocked','reassigned-no-second-balance']:return None
 n=None
 pairs=([('request',0),('waiting',4),('checklist',8),('confirm-documents',9),('preparation',12),('court-fee',14 if high else 15),('fee-receipt',15 if high else 16),('prefiling',16 if high else 17),('filing',13 if high else 14),('add-hearing',22),('hearing-ready',24 if high else 23),('hearing-draft',25 if high else 24),('hearing-preview',26 if high else 25),('handover',28 if high else 29),('completion',31),('wallet',31),('decline',7)] if role=='Advocate' else [('landing',0),('assistance',0),('information',1),('path',2),('type-examples',3 if high else 2),('case-type',3 if high else 2),('details',4 if high else 3),('documents',5 if high else 4),('pricing',6 if high else 5),('review',21 if high else 25),('decision',10),('accepted',11),('under-review',7),('free-change',12),('third-free-change',12),('paid-change',28 if high else 31),('checklist',12 if high else 15),('pickup-details',15 if high else 18),('pickup-tracking',17 if high else 21),('prefiling',21 if high else 25),('court-fee',20 if high else 24),('filed',22 if high else 26),('hearing',26 if high else 29),('completed',31 if high else 34),('chat',9),('cancel',14),('success',7)])
 for key,value in pairs:
  if key in name:n=value;break
 if n is None:
  if any(k in name for k in ['payment','balance','deposit']):
   choices=sorted(folder.glob('Documents Forensic*.png'));return choices[0] if choices else None
  return None
 if 'pending-review' in name:n=7 if high else 6
 if 'pending-path' in name and not high:folder=root/'High-Court-Representation-Client-Side'
 p=folder/('Html → Body'+(f' ({n})' if n else '')+'.png');return p if p.exists() else None
rows=[]
for p in sorted((out/'built').glob('*.png')):
 if p.name.startswith('failure-'):continue
 ref=source(p.stem); built=Image.open(p).convert('RGB'); built.resize((430,max(1,round(built.height*430/built.width))))
 images=[]
 for image in ([Image.open(ref).convert('RGB')] if ref else [])+[built]:
  image.thumbnail((700 if '-admin-' in p.stem else 430,6000));images.append(image)
 width=1440 if '-admin-' in p.stem else 920;height=max(x.height for x in images)+100
 canvas=Image.new('RGB',(width,height),'#eee9e2');draw=ImageDraw.Draw(canvas);draw.text((20,15),'Design reference' if ref else 'No supplied design for this screen',font=font,fill='black');draw.text((width//2+20,15),'Local synthetic case — 14 Nov 2026',font=font,fill='black')
 if ref:canvas.paste(images[0],(20,65))
 else:draw.text((20,80),'Existing Legalitt style; see architecture §9.2.',font=font,fill='black')
 canvas.paste(images[-1],(width//2+20,65));target=out/'comparisons'/(p.stem+'.jpg');canvas.save(target,quality=82,optimize=True)
 rows.append(f'| {p.stem} | [{p.name}](built/{p.name}) | [Comparison](comparisons/{target.name}) | '+(str(ref).replace('\\','/') if ref else 'Undesigned / shared screen')+' |')
(out/'README.md').write_text('# Court screen comparisons — 14 November 2026\n\nAll captures use new synthetic cases in the isolated local application database. No real case was changed. The comparison includes the complete captured screen, scaled to fit; open the original for full resolution. The overnight answers override drawn prices, phone/call controls, payment timing and hearing payouts. Test checkout is explicit rather than presenting a payment QR as real. Admin screens use the existing panel style (§9.2).\n\nThe same engine renders both court levels. Case type, court selector, prices, deadlines and reference prefix come from their own configuration. Labels and empty states omit unavailable values. Legal policy copy remains awaiting the client; the linked pages say so.\n\n| Screen | Built | Side-by-side | Source |\n|---|---|---|---|\n'+'\n'.join(rows)+'\n',encoding='utf-8')
print(f'{len(rows)} indexed screen comparisons')
