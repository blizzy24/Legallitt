// Evidence composition only: untouched design beside an actual browser capture.
const fs=require('fs'),path=require('path'),puppeteer=require('puppeteer-core');
const D='design/figma-2026-11-12/';
const mapping=(service,name)=>{
 const ps=service==='ps',c=D+(ps?'Property-Search-Report':'Document-Forensic')+'-Client-Side/',a=D+(ps?'Property-Search-Report':'Document-Forensic')+'-Advocate-Side/';
 if(name==='landing'||name==='explore-client')return c+(ps?'Html → Body → Standalone Mobile App Screen (390px by 852px).png':'Html → Body.png');
 if(name==='information')return c+(ps?'Html → Body.png':'Documents Forensic 01.png');
 if(/^(intake|empty-intake|partial-intake)/.test(name))return c+(ps?'Property Search Report 16.png':'Html → Body (1).png');
 if(name.startsWith('review-'))return c+(ps?'Property Search Report 03.png':'Documents Forensic 12.png');
 if(name.startsWith('payment-')||name==='resumed-payment')return c+(ps?'Property Search Report 04.png':'Documents Forensic 04.png');
 if(name.startsWith('scan-')||name==='resumed-scan')return c+(ps?'Documents Forensic 29.png':'Documents Forensic 13.png');
 if(name.startsWith('success-'))return c+(ps?'Documents Forensic 33.png':'Documents Forensic 13.png');
 if(name.startsWith('tracking-'))return c+(ps?'Property Search Report 06.png':'Documents Forensic 15.png');
 if(name.startsWith('delivered-'))return c+(ps?'Documents Forensic 37.png':'Documents Forensic 38.png');
 if(name.includes('viewer'))return D+'Document-Viewer/iPhone 13 & 14 - 147.png';
 if(name.startsWith('advocate-request-'))return a+(ps?'02.png':'79.png');
 if(name.startsWith('accepted-'))return a+(ps?'03.png':'80.png');
 if(name==='editor-eight-sections')return a+'Html → Body.png';
 if(name==='upload-final-report')return a+'04.png';
 if(name.startsWith('send-'))return a+'05.png';
 if(name.startsWith('sent-'))return a+'06.png';
 if(name.startsWith('file-checklist-'))return a+'80.png';
 if(name.startsWith('waiting'))return a+'06.png';
 if(name.startsWith('report-'))return a+'Html → Body.png';
 if(name.startsWith('affidavit-'))return a+'Html → Body (1).png';
 if(name.startsWith('submit-')||name==='resubmit')return a+'Html → Body (2).png';
 if(name.startsWith('with-admin-'))return a+'Html → Body (3).png';
 if(ps&&name.includes('chat'))return c+'Html → Body (2).png';
 return null;
};
const uri=p=>'data:image/png;base64,'+fs.readFileSync(p).toString('base64'),esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
(async()=>{const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{const page=await browser.newPage();for(const service of ['ps','df']){const root=path.resolve('docs/flows/'+service+'-screens'),built=path.join(root,'built'),rows=[];for(const file of fs.readdirSync(built).filter(f=>f.endsWith('.png')&&!f.startsWith('explore-')).sort()){
 const name=file.slice(0,-4),design=mapping(service,name);if(design&&!fs.existsSync(design))throw new Error('Missing design: '+design);const admin=name.startsWith('admin-'),width=admin?1100:430,note=design?'Flow overrides applied: current tariff, human labels, honest simulations; removed claims stay out.':admin?'No admin design supplied; existing admin visual language (§9.2).':'Additional state or interaction; no separate drawing.';
 await page.setViewport({width:(design?width*2+24:width)+36,height:800});await page.setContent(`<body style="margin:0;font:14px Arial;background:white;color:#222"><header style="padding:18px;border-bottom:1px solid #ddd"><b>${esc(name)}</b><p>${esc(note)}</p></header><main style="display:flex;gap:24px;padding:18px;align-items:flex-start">${design?`<section><h3>DESIGN</h3><img style="width:${width}px" src="${uri(design)}"></section>`:''}<section><h3>LOCAL BUILD · synthetic data</h3><img style="width:${width}px" src="${uri(path.join(built,file))}"></section></main></body>`,{waitUntil:'load'});await page.screenshot({path:path.join(root,file),fullPage:true});rows.push(`| ${name} | [Comparison](${file}) | ${design?'`'+design+'`':'No separate design'} |`);
 }fs.writeFileSync(path.join(root,'README.md'),`# ${service==='ps'?'Property Search':'Document Forensic'}: design comparisons\n\nCaptured against the local API with synthetic cases and explicitly simulated payments/storage. Design is on the left; the running screen is on the right. Admin and additional states without a drawing are identified. These are evidence, not a claim of deployment. Generated with \`scripts/report-screens-compose.cjs\`; raw captures in \`built/\`.\n\n| Screen | Evidence | Source |\n|---|---|---|\n${rows.join('\n')}\n`);console.log(service+': '+rows.length+' comparisons');}}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
