// Real browser actions + API assertions. Synthetic cases only, existing demo
// credentials in memory. Local test adapters by default; live is explicit.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist'),{PDFDocument,StandardFonts}=require('../apps/api/node_modules/pdf-lib');
const kit=require('./helpers/fir-walk-kit.cjs'),{click,fill,text,at,go,shot,dump,chooseFile,delay}=kit;
process.loadEnvFile('apps/api/.env.local');
const live=process.argv.includes('--live'),base=live?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3004',mobile=live?'https://legalitt-5.vercel.app':'http://localhost:8084',adminWeb=live?'https://legalitt-admin-panel.vercel.app':'http://localhost:5175';
const out=path.resolve('reports/report-polish-20261113',live?'live':'local');fs.mkdirSync(out,{recursive:true});
const runName=process.argv.find(v=>v.startsWith('--run='))?.slice(6);if(runName&&!/^[a-z0-9-]+$/.test(runName))throw new Error('Invalid evidence run name');
const stateFile=path.join(out,runName?`state-${runName}.json`:'state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{cases:[],results:[]};
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n');
const pass=name=>{state.results.push({name,at:new Date().toISOString()});save();console.log('PASS',name);};
const arg=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.slice(name.length+3);
async function syntheticPdf(name){const d=await PDFDocument.create(),font=await d.embedFont(StandardFonts.Helvetica);d.addPage().drawText('TEST ONLY - '+name+' - no actual legal document',{x:35,y:750,size:12,font});const p=path.join(out,name+'.pdf');fs.writeFileSync(p,await d.save());return p;}
async function main(){let browser;const pages={},api={},users={},errors=[];
 try{
  const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
  for(const role of ['client','client-isolation','advocate','advocate-2','admin']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201,role+' sign-in');const session=await r.json();users[role]=session.user;api[role]=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});}
  if(!live){const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});try{for(const role of ['advocate','advocate-2'])await db.advocateProfile.upsert({where:{user_id:users[role].id},create:{user_id:users[role].id,verification:'approved',city:'Indore',bar_council_number:'TEST/2026/001'},update:{verification:'approved',city:'Indore',bar_council_number:'TEST/2026/001'}});}finally{await db.$disconnect();}}
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:120000});
  const page=async role=>pages[role]??(pages[role]=await kit.signIn(browser,{attach:async p=>{pages[role]=p;p.on('response',r=>{if(r.status()>=400&&r.url().includes('/api/'))console.log('HTTP',r.status(),new URL(r.url()).pathname);});}},{role,email:`demo-${role}@legalitt.invalid`,password,mobile,adminWeb,errors}));
  const snap=async(p,service,name)=>{const folder=live?path.join(out,service):path.resolve('docs/flows',service==='property_search'?'ps-screens':'df-screens','built');fs.mkdirSync(folder,{recursive:true});await shot(p,path.join(folder,name+'.png'),{width:p.url().startsWith(adminWeb)?1440:430});};
  const explore=arg('explore');if(explore){const [role,...rest]=explore.split(':'),p=await page(role);await go(p,(role==='admin'?adminWeb:mobile)+rest.join(':'));await dump(p,'Explore');await snap(p,rest.join(':').includes('forensic')?'document_forensic':'property_search','explore-'+role);return;}
  const stages=[],stage=(name,run)=>stages.push({name,run});
  stage('intakes',async()=>{
   const p=await page('client'),document=await syntheticPdf('report-intake'),reference=await syntheticPdf('reference-sample');
   for(const service of ['property_search','document_forensic'])for(const speed of ['ordinary','urgent']){
    const root='/'+service.replaceAll('_','-'),tag=service+'-'+speed;
    const existing=state.cases.find(c=>c.tag===tag);if(existing?.paid)continue;
    if(existing&&(await api.client.case(existing.id)).status!=='draft'){await go(p,mobile+root+'/payment?caseId='+existing.id);await payThroughUi(p,service,speed,existing);continue;}
    await go(p,mobile+root);await text(p,'Provisional prices');await snap(p,service,'landing');
    if(existing)await go(p,mobile+root+(service==='document_forensic'?'/upload':'/request')+'?caseId='+existing.id);
    else{if(speed==='urgent')await click(p,'Urgent',{contains:true});await click(p,'Continue →');await p.waitForFunction(()=>new URL(location.href).searchParams.has('caseId'));}
    const id=new URL(p.url()).searchParams.get('caseId');if(!existing)state.cases.push({id,service,speed,tag,paid:false});save();
    if(service==='property_search'){
     await fill(p,'Full Name','TEST ONLY Report Client');await fill(p,'Mobile Number','9000000000');await fill(p,'Email Address','report@example.invalid');
     await click(p,'State');await fill(p,'Search state','Maharashtra');await click(p,'Maharashtra');await click(p,'District');await fill(p,'Search district','Pune');await click(p,'Pune');
     await fill(p,'Property Address','TEST ONLY Plot 42, Pune, Maharashtra');await fill(p,'Ward Number','TEST Ward');await fill(p,'Tehsil / Village','TEST Haveli');await fill(p,'Colony','TEST Colony');await click(p,'Property type');await click(p,'Residential');await fill(p,'Survey No. / Plot No. / Khata No.','TEST-42');await click(p,'Purpose');await click(p,'Buying');await fill(p,'Owner names (one per line)','TEST Owner');await fill(p,'What would you like us to check?','TEST ONLY: check the supplied fictional title records.');await chooseFile(p,'Upload property document',document);
    }else{
     if(!(await api.client.case(id)).documents.some(d=>d.kind==='questioned_document'&&d.status==='uploaded'))await chooseFile(p,'Upload questioned document',document);await click(p,'Document type',{contains:true});await click(p,'Agreement / Contract');await click(p,'Signature verification');await fill(p,'Document description','TEST ONLY signature examination');await fill(p,'Target focus for document 1','TEST signature on page 1');
     if(speed==='ordinary'){if(!(await api.client.case(id)).documents.some(d=>d.kind==='reference_document'&&d.status==='uploaded'))await chooseFile(p,'Upload reference sample',reference);}else{await click(p,'I do not have a reference sample');await text(p,'cannot determine whether a signature is genuine');}
     await fill(p,'Instructions for the advocate','TEST ONLY: compare the fictional supplied scans and explain limitations.');
    }
    await snap(p,service,'intake-'+speed);await click(p,'Review request');await text(p,'Review your request');await p.reload({waitUntil:'networkidle0'});await text(p,'TEST ONLY');await snap(p,service,'review-'+speed);
    await click(p,'Continue to payment');await payThroughUi(p,service,speed,state.cases.find(c=>c.id===id));
   }
  });
  async function payThroughUi(p,service,speed,entry){const id=entry.id;await text(p,'Complete Payment');await text(p,'SELECT PAYMENT METHOD');await snap(p,service,'payment-'+speed);await click(p,'Pay →');await text(p,'Scan & Pay');await snap(p,service,'scan-'+speed);await click(p,'Simulate successful payment');await text(p,'Payment Successful');await snap(p,service,'success-'+speed);
    await click(p,'Start Tracking →');await text(p,'Stage');await snap(p,service,'tracking-paid-'+speed);const c=await api.client.case(id);assert.ok(!['draft','payment_pending'].includes(c.status));state.cases.find(c=>c.id===id).paid=true;save();pass(entry.tag+' intake persisted, exact quote paid, success and tracking');
  }
  const waitCase=async(id,check)=>{for(let n=0;n<60;n++){const c=await api.admin.case(id);if(check(c))return c;await delay(500);}throw new Error('Case did not reach the expected state: '+id);};
  const casePage=async(role,c,step='request')=>{const p=await page(role);await go(p,role==='admin'?`${adminWeb}/services/${c.service}/cases/${c.id}`:role==='client'?`${mobile}/${c.service.replaceAll('_','-')}/track?caseId=${c.id}`:`${mobile}/advocate/service-report?caseId=${c.id}&step=${step}`);return p;};
  const labelClick=async(p,label)=>{await p.waitForFunction(v=>[...document.querySelectorAll('label')].some(e=>e.textContent.includes(v)),{},label);await p.evaluate(v=>[...document.querySelectorAll('label')].find(e=>e.textContent.includes(v)).querySelector('input').click(),label);await delay(250);};
  const adminField=async(p,label,value)=>{const h=await p.evaluateHandle(v=>{const labels=[...document.querySelectorAll('label')];const l=labels.find(e=>e.textContent.trim()===v||e.textContent.startsWith(v));return l?.querySelector('textarea,input')??document.getElementById(l?.htmlFor);},label);assert.ok(h.asElement(),'Admin field '+label);await h.asElement().type(value);await h.dispose();};
  stage('assignment',async()=>{
   for(const c of state.cases.filter(c=>c.paid&&!c.cancel)){
    let r=await api.admin.case(c.id);if(['advocate_accepted','in_progress','completed'].includes(r.status))continue;
    let p=await casePage('admin',c);
    if(c.service==='property_search'&&['paid','assigning'].includes(r.status)){
     let w=await api.admin.request(`/service-reports/${c.id}/workflow`);
     if(c.speed==='ordinary'&&!w.tasks.length){await adminField(p,'What should the client provide?','TEST ONLY: confirm the full property address.');await click(p,'Send request to client');await text(p,'TEST ONLY: confirm');await snap(p,c.service,'admin-more-details');}
     w=await api.admin.request(`/service-reports/${c.id}/workflow`);
     if(w.tasks.some(t=>t.status==='requested')){const cp=await casePage('client',c);await text(cp,'We need more details');await fill(cp,'Your response','TEST ONLY: the supplied Pune address is complete.');await click(cp,'Send response');await text(cp,'waiting to be checked');await snap(cp,c.service,'client-more-details');p=await casePage('admin',c);await click(p,'Mark response checked');await text(p,'Resolved');}
     if(!w.verification){await click(p,'Confirm request verified');await text(p,'Assign advocate');}
    }
    r=await api.admin.case(c.id);if(['paid','assigning','advocate_declined'].includes(r.status)){
     p=await casePage('admin',c);await click(p,'+ Assign');await click(p,'Assign to '+users[r.status==='advocate_declined'?'advocate-2':'advocate'].name);await waitCase(c.id,x=>x.status==='assigned');await snap(p,c.service,'admin-assigned-'+c.speed);
    }
    r=await api.admin.case(c.id);let role=r.advocate_id===users.advocate.id?'advocate':'advocate-2';p=await casePage(role,c);await text(p,'Accept');await snap(p,c.service,'advocate-request-'+c.speed);
    if(c.service==='property_search'&&role==='advocate'){
     await click(p,'Decline');await snap(p,c.service,'decline-reason');await fill(p,'Reason for declining','TEST ONLY: unavailable for this search window.');await click(p,'Decline request');await waitCase(c.id,x=>x.status==='advocate_declined');p=await casePage('admin',c);await click(p,'+ Assign');await click(p,'Assign to '+users['advocate-2'].name);await waitCase(c.id,x=>x.advocate_id===users['advocate-2'].id);role='advocate-2';p=await casePage(role,c);
    }
    if(c.service==='document_forensic'&&c.speed==='ordinary'){
     await click(p,'Accept');await waitCase(c.id,x=>x.status==='advocate_accepted');
     let w=await api[role].request(`/service-reports/${c.id}/workflow`);if(!w.tasks.length){await click(p,'More options');await click(p,'Request more information');await fill(p,'What do you need from the client?','TEST ONLY: confirm which signature should be examined.');await click(p,'Send request to client');const cp=await casePage('client',c);await fill(cp,'Your response','TEST ONLY: examine the signature on page one.');await click(cp,'Send response');await snap(cp,c.service,'client-more-information');p=await casePage(role,c);await click(p,'Mark response checked');}
    }
    if((await api.admin.case(c.id)).status==='assigned')await click(p,'Accept');await waitCase(c.id,x=>x.status==='advocate_accepted');await snap(p,c.service,'accepted-'+c.speed);c.advocate=role;save();pass(c.tag+' assigned, request reviewed and accepted');
   }
  });
  stage('property',async()=>{
   for(const c of state.cases.filter(c=>c.service==='property_search'&&c.paid&&!c.cancel)){
    const role=c.advocate??'advocate-2';let r=await api.admin.case(c.id);if(r.status==='completed')continue;
    let p=await casePage(role,c);
    if(c.speed==='ordinary'){
     let w=await api[role].request(`/service-reports/${c.id}/workflow`);
     if(!w.tasks.some(t=>t.kind==='document'&&t.status==='resolved')){await click(p,'More options');await click(p,'Chat with client');await text(p,'Request Title Deed');if(!w.tasks.some(t=>t.kind==='document'))await click(p,'Request Title Deed');await snap(p,c.service,'advocate-chat-request');const cp=await casePage('client',c);await click(cp,'Chat with Advocate');await text(cp,'Requested document');await chooseFile(cp,'Upload requested document',await syntheticPdf('requested-title-deed'));await text(cp,'Document 1 uploaded');await fill(cp,'Your response','TEST ONLY requested deed supplied.');await click(cp,'Send response');await snap(cp,c.service,'client-chat-upload');await p.reload({waitUntil:'networkidle0'});await click(p,'Mark response checked');p=await casePage(role,c);}
     await click(p,'Start property report');
     const fields={'Client details':'TEST ONLY Applicant, Pune','Property details':'TEST ONLY Plot 42, Pune, Maharashtra','Total area':'120 square metres','Current owner, ownership type and previous transfer details':'TEST ONLY owner; historic transfer recorded in supplied deed.','Search date (YYYY-MM-DD)':'2026-11-13','Search period':'1996–2026','Records inspected':'TEST ONLY supplied title deed and registry index','Place / Registry Office':'TEST ONLY Pune registry','Additional search notes':'Synthetic walkthrough; no actual registry search was performed.','Ownership history':'TEST ONLY chain of title in supplied fictional records.','Findings summary':'TEST ONLY records are fictional. No legal opinion is offered.','Ownership':'TEST owner shown','Charges / encumbrances':'No examination of real records','Court cases':'Not independently searched','Property tax':'TEST receipt supplied','Title clearance opinion':'TEST ONLY limited to fictional records; not valid for a transaction.'};
     for(const [label,value]of Object.entries(fields))await fill(p,label,value);
     if(!(await api[role].case(c.id)).report.latest_draft?.content?.report?.documents_checked?.length)await click(p,'Add document record');await fill(p,'Document name 1','TEST title deed');await fill(p,'Registration number 1','TEST-42');await fill(p,'Registry office 1','TEST Pune');await click(p,'I checked this document');await click(p,'I personally checked this report and the findings recorded above.');await click(p,'Save report version');await kit.noText(p,'Changes are not saved');await snap(p,c.service,'editor-eight-sections');await click(p,'Generate PDF preview');await click(p,'View PDF preview');await text(p,'Document Viewer');await text(p,'Page 1 of');await snap(p,c.service,'editor-pdf-viewer');await p.goBack({waitUntil:'networkidle0'});await click(p,'Continue to Send Report');
    }else{
     await click(p,'Upload a prepared PDF instead');await chooseFile(p,'Upload final PDF',await syntheticPdf('property-final-report'));await text(p,'Final report PDF');await fill(p,'Client note','TEST ONLY uploaded report.');await click(p,'Save report version');await kit.noText(p,'Changes are not saved');await snap(p,c.service,'upload-final-report');await click(p,'Continue to Send Report');
    }
    await click(p,'I have checked and signed the final report and am ready to send it to the client.');await snap(p,c.service,'send-'+c.speed);await click(p,'Send Report to Client');await waitCase(c.id,x=>x.status==='completed');await snap(p,c.service,'sent-'+c.speed);pass(c.tag+' report delivered directly to client');
   }
  });
  async function forensicDraft(c,correction=false){
   const role=c.advocate??'advocate',p=await casePage(role,c);
   if(correction){await click(p,'Update report → Waiting for Specialist Report');await text(p,'Report Pending');}
   else if(!(await api[role].request(`/service-reports/${c.id}/workflow`)).checklist){for(const label of ['The files open successfully','All supplied pages are present','The supplied scans are legible'])await click(p,label);await snap(p,c.service,'file-checklist-'+c.speed);await click(p,'Continue');}
   await text(p,'Report Pending');await snap(p,c.service,correction?'waiting-correction':'waiting-'+c.speed);await click(p,'Prepare forensic report');
   for(const [label,value]of Object.entries({'What Was Checked?':'TEST ONLY signature on the first page of the supplied fictional copy.','How Was It Checked?':'Visual review of synthetic uploaded PDF copies only. No original examined.','Findings':correction?'TEST ONLY revised findings: explain the limits of comparing fictional samples.':'TEST ONLY insufficient material for a real authenticity finding.','Final Result':'Inconclusive; synthetic test material only.','Authenticity summary for the client':'TEST ONLY copies do not establish authenticity.'}))await fill(p,label,value);
   await click(p,'Inconclusive');await click(p,'Medium');await click(p,'Save report version');await kit.noText(p,'Changes are not saved');await snap(p,c.service,correction?'report-revised':'report-'+c.speed);await click(p,'Generate PDF preview');await click(p,'View PDF preview');await text(p,'Page 1 of');await snap(p,c.service,'report-preview-'+c.speed);await p.goBack({waitUntil:'networkidle0'});await click(p,'Continue to affidavit');
   await click(p,'Edit Text');await fill(p,'Advocate full name','TEST Advocate');await fill(p,'Bar Council enrolment number','TEST/2026/001');await fill(p,'Office address','TEST ONLY Pune office');await click(p,'Save');await text(p,'Edit Text');await fill(p,'Or type your signature','TEST Advocate');await click(p,'I confirm that I reviewed the report and affidavit and that this is my signature.');await snap(p,c.service,correction?'affidavit-resigned':'affidavit-'+c.speed);await click(p,'Save Draft');await kit.noText(p,'Changes are not saved');await snap(p,c.service,'affidavit-signed-'+c.speed);await click(p,'Preview');await text(p,'Page 1 of');await snap(p,c.service,'affidavit-preview-'+c.speed);await p.goBack({waitUntil:'networkidle0'});await click(p,'Continue to Review & Submit');await text(p,'Final Review & Submission');await click(p,'Generate PDF preview');await click(p,'View PDF preview',{nth:1});await text(p,'Page 1 of');await snap(p,c.service,'affidavit-viewer-'+c.speed);await p.goBack({waitUntil:'networkidle0'});await click(p,'I have checked the files and am ready to submit this version to admin.');await snap(p,c.service,correction?'resubmit':'submit-'+c.speed);await click(p,'Submit to Admin');await waitCase(c.id,x=>x.sub_status==='awaiting_admin_approval');await snap(p,c.service,'with-admin-'+c.speed);
  }
  stage('forensic',async()=>{
   for(const c of state.cases.filter(c=>c.service==='document_forensic'&&c.paid&&!c.cancel)){
    let r=await api.admin.case(c.id);if(r.status==='completed')continue;if(r.sub_status!=='awaiting_admin_approval')await forensicDraft(c,!!r.report.changes);
    let p=await casePage('admin',c);await text(p,'Review submitted version');await snap(p,c.service,'admin-review-'+c.speed);
    if(c.speed==='ordinary'&&!c.returned){await p.evaluate(()=>[...document.querySelectorAll('summary')].find(e=>e.textContent==='Request changes').click());await adminField(p,'Required correction','TEST ONLY: explain the examination limits in the findings.');r=await api.admin.case(c.id);await click(p,`Return version ${r.report.submission.version} for correction`);await waitCase(c.id,x=>x.report.stage==='changes_requested');c.returned=true;save();await forensicDraft(c,true);p=await casePage('admin',c);}
    for(const label of ['The report format is complete','The affidavit contains the advocate’s signature','The conclusion matches the findings','The report answers the client’s requested analysis','I reviewed all files in this version'])await labelClick(p,label);
    r=await api.admin.case(c.id);await snap(p,c.service,'admin-checklist-'+c.speed);await click(p,`Approve & release version ${r.report.submission.version}`);await waitCase(c.id,x=>x.status==='completed');pass(c.tag+' report and affidavit approved and released'+(c.returned?' after correction':''));
   }
  });
  stage('delivery',async()=>{
   for(const c of state.cases.filter(c=>c.paid&&!c.cancel)){
    const r=await api.client.case(c.id);assert.equal(r.status,'completed');const p=await casePage('client',c);await text(p,c.service==='document_forensic'?'Analysis Completed':'Report Ready');await snap(p,c.service,'delivered-'+c.speed);
    for(const [i,id]of r.report.released.document_ids.entries()){const d=r.documents.find(d=>d.id===id);await click(p,d.kind==='forensic_affidavit'?'View Affidavit':'View Report');await text(p,'Page 1 of');await snap(p,c.service,'received-viewer-'+c.speed+'-'+i);await click(p,'Download');await casePage('client',c);const url=await api.client.documentUrl(id);assert.equal((await fetch(url.url)).status,200);await assert.rejects(api['client-isolation'].documentUrl(id),e=>e.status===404);}
    const role=c.advocate??(c.service==='property_search'?'advocate-2':'advocate'),wallet=await api[role].wallet('all');assert.equal(wallet.entries.filter(e=>e.case_id===c.id).length,1);assert.equal(wallet.entries.find(e=>e.case_id===c.id).share_paise,r.client_fees.service_fee_paise);pass(c.tag+' client viewer/download, isolation and one wallet credit');
   }
  });


  stage('polish',async()=>{
   for(const c of state.cases.filter(c=>c.paid&&!c.cancel)){
    const p=await casePage('client',c);await text(p,c.service==='document_forensic'?'Analysis Completed':'Report Ready');
    let pullReads=0;const pulling=req=>{if(req.method()==='GET'&&new URL(req.url()).pathname==='/api/v1/cases/'+c.id)pullReads++;};p.on('request',pulling);const scroll=await p.$('[data-testid="report-scroll"]');assert.ok(scroll);await scroll.evaluate(e=>{e.scrollTop=0;});await delay(250);const rect=await scroll.boundingBox(),origin={x:rect.x+100,y:rect.y+60};const touchSession=await p.createCDPSession();await touchSession.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[origin]});await touchSession.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:origin.x,y:origin.y+130}]});await touchSession.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touchSession.detach();for(let n=0;n<30&&!pullReads;n++)await delay(100);assert.ok(pullReads>0,'Browser touch pull refresh reloads the saved case');p.off('request',pulling);await kit.noText(p,'Updating request…');
    await p.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:input=>input.files?.length===1});Object.defineProperty(navigator,'share',{configurable:true,value:async input=>{const file=input.files[0],bytes=new Uint8Array(await file.arrayBuffer());window.__shared={name:file.name,type:file.type,size:file.size,pdf:String.fromCharCode(...bytes.slice(0,4))};}});});
    await click(p,'Share Report');await p.waitForFunction(()=>window.__shared);const shared=await p.evaluate(()=>window.__shared);assert.equal(shared.pdf,'%PDF');assert.equal(shared.type,'application/pdf');assert.ok(shared.size>0);assert.equal(shared.name,c.service==='property_search'?'Property Search Report.pdf':'Forensic Report.pdf');
    await p.evaluate(()=>{Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});window.__download=null;document.addEventListener('click',async e=>{const a=e.target.closest('a[download]');if(a){e.preventDefault();const bytes=new Uint8Array(await(await fetch(a.href)).arrayBuffer());window.__download={name:a.download,pdf:String.fromCharCode(...bytes.slice(0,4))};}},true);});
    await click(p,'Share Report');await p.waitForFunction(()=>window.__download);assert.equal((await p.evaluate(()=>window.__download)).pdf,'%PDF');
    let reads=0;const observe=req=>{if(req.method()==='GET'&&new URL(req.url()).pathname==='/api/v1/cases/'+c.id)reads++;};p.on('request',observe);await p.evaluate(()=>window.dispatchEvent(new Event('focus')));await text(p,'Request details');for(let n=0;n<20&&!reads;n++)await delay(100);assert.ok(reads>0,'Focus reloads the saved case');p.off('request',observe);

    const body=await p.evaluate(()=>document.body.innerText);assert.ok(!/\b0 hours? (ago|elapsed)\b/.test(body));assert.ok(!/Reload saved|Refresh report/.test(body));assert.ok(!body.includes('Property Address'),'Request details collapsed initially');await click(p,'Request details');await snap(p,c.service,'delivered-details-'+c.speed);
    pass(c.tag+' shares real PDF file, falls back to download, refreshes on focus and collapses request details');
   }
  });
  stage('cancellation',async()=>{
   for(const service of ['property_search','document_forensic']){
    const tag=service+'-cancellation';let entry=state.cases.find(c=>c.tag===tag);
    if(!entry){const source=await api.client.case(state.cases.find(c=>c.service===service&&!c.cancel).id),created=await api.client.createCase({service_code:service});entry={id:created.id,service,speed:'ordinary',tag,cancel:true,paid:false};state.cases.push(entry);save();await api.client.saveReportIntake(entry.id,{tier:'ordinary',details:{...source.details,...service==='document_forensic'?{no_reference_sample:true,document_focus:{}}:{}}});if(service==='document_forensic'){const ticket=await api.client.presign({case_id:entry.id,kind:'questioned_document',filename:'TEST-cancellation.pdf',mime:'application/pdf'});await api.client.upload(ticket,new Blob([fs.readFileSync(await syntheticPdf('cancellation-document'))],{type:'application/pdf'}));}await api.client.submit(entry.id);}
    let r=await api.client.case(entry.id);if(r.status==='refunded')continue;const p=await page('client');if(r.status==='payment_pending'){await go(p,mobile+'/'+service.replaceAll('_','-')+'/payment?caseId='+entry.id);await payThroughUi(p,service,'cancellation',entry);}
    await casePage('client',entry);await click(p,'More options');await click(p,'Request cancellation');await text(p,'Before You Cancel');await fill(p,'Tell us why you want to cancel','TEST ONLY cancellation before advocate acceptance.');await click(p,'I understand that this will cancel my request.',{contains:true});await snap(p,service,'cancellation-before-acceptance');await click(p,'Cancel Request');await click(p,'Cancel Request');await text(p,'This request is cancelled');await snap(p,service,'cancellation-refunded');const cancellation=await api.client.caseCancellation(entry.id);assert.equal(cancellation.status,'refunded');assert.equal(cancellation.refunds.length,1);assert.equal(cancellation.refunds[0].simulated,true);r=await api.client.case(entry.id);assert.equal(cancellation.refunds[0].amount_paise,r.client_fees.total_paise);pass(service+' cancellation before acceptance records full simulated refund');
   }
  });
  stage('completion',async()=>{
   for(const c of state.cases.filter(c=>c.paid&&!c.cancel)){
    const role=c.advocate??(c.service==='property_search'?'advocate-2':'advocate'),p=await casePage(role,c);await text(p,'You receive');await text(p,'Back to Home');const record=await api[role].case(c.id),body=await p.evaluate(()=>document.body.innerText);
    for(const d of record.documents??[])if(d.filename&&/[_]|TEST-/i.test(d.filename))assert.ok(!body.includes(d.filename),'No internal filename on advocate completion');
    await snap(p,c.service,'advocate-completed-'+c.speed);pass(c.tag+' advocate completion uses human file labels and wallet confirmation');
   }
  });
  stage('gallery',async()=>{
   const {PNG}=require('pngjs'),png=new PNG({width:64,height:64});for(let i=0;i<png.data.length;i+=4){png.data[i]=40;png.data[i+1]=100;png.data[i+2]=160;png.data[i+3]=255;}const file=path.join(out,'TEST-gallery.png');fs.writeFileSync(file,PNG.sync.write(png));
   if(!state.gallery_case_id){state.gallery_case_id=(await api.client.createCase({service_code:'document_forensic'})).id;save();}const p=await page('client');await go(p,mobile+'/document-forensic/upload?caseId='+state.gallery_case_id);await chooseFile(p,'Gallery: Questioned document',file);await text(p,'Document to examine 1');const c=await api.client.case(state.gallery_case_id);assert.ok(c.documents.some(d=>d.mime_type==='image/png'&&d.status==='uploaded'));await snap(p,'document_forensic','gallery-upload');await click(p,'View file',{nth:0});await text(p,'1 image');await kit.noText(p,'Page 1 of');await snap(p,'document_forensic','image-viewer');pass('Document Forensic Gallery selection persists an image through the document pipeline');
  });
  stage('states',async()=>{
   const p=await page('client');for(const service of ['property_search','document_forensic']){
    const c=state.cases.find(c=>c.service===service&&!c.cancel),root=mobile+'/'+service.replaceAll('_','-');
    await go(p,root+'/info');await text(p,service==='property_search'?'Why Is a Property':'Why Is Document Forensics');await snap(p,service,'information');
    state.visuals??=[];let visual=state.visuals.find(v=>v.service===service);if(!visual){const created=await api.client.createCase({service_code:service});visual={id:created.id,service};state.visuals.push(visual);save();}await go(p,root+(service==='property_search'?'/request':'/upload')+'?caseId='+visual.id);await snap(p,service,'empty-intake');await api.client.saveReportIntake(visual.id,{tier:'ordinary',details:service==='property_search'?{contact:{fullName:'TEST Partial'}}:{questioned_description:'TEST Partial description'}});await p.reload({waitUntil:'networkidle0'});await p.waitForFunction(()=>[...document.querySelectorAll('input,textarea')].some(e=>e.value.startsWith('TEST Partial')));await snap(p,service,'partial-intake');
    let held;const handler=request=>{if(request.method()==='GET'&&new URL(request.url()).pathname==='/api/v1/cases/'+c.id){held=request;}else request.continue();};await p.setRequestInterception(true);p.on('request',handler);await p.goto(root+'/track?caseId='+c.id,{waitUntil:'domcontentloaded'});await text(p,'Loading your saved request');await snap(p,service,'loading');p.off('request',handler);if(held)await held.continue();await p.setRequestInterception(false);await text(p,c.service==='document_forensic'?'Analysis Completed':'Report Ready');
    const failure=request=>{if(request.method()==='GET'&&new URL(request.url()).pathname==='/api/v1/cases/'+c.id)request.respond({status:503,headers:{'Access-Control-Allow-Origin':new URL(mobile).origin},contentType:'application/json',body:JSON.stringify({message:'Local verification: request unavailable. Please retry.'})});else request.continue();};await p.setRequestInterception(true);p.on('request',failure);await go(p,root+'/track?caseId='+c.id);await text(p,'Local verification: request unavailable');await snap(p,service,'error-retry');p.off('request',failure);await p.setRequestInterception(false);await click(p,'Retry');await text(p,c.service==='document_forensic'?'Analysis Completed':'Report Ready');pass(service+' loading, error and retry states');
   }
  });
  stage('settings',async()=>{
   for(const service of ['property_search','document_forensic']){
    const c=state.cases.find(c=>c.service===service&&!c.cancel),p=await casePage('admin',c);await text(p,'Released to the client');await p.evaluate(()=>[...document.querySelectorAll('summary')].find(e=>e.textContent==='Turnaround & follow-up settings').click());await text(p,'Maximum file size (MB)');const prior=(await api.admin.request('/service-reports/settings/'+service))[0];
    const size=await p.evaluateHandle(()=>[...document.querySelectorAll('label')].find(e=>e.textContent.startsWith('Maximum file size (MB)')).querySelector('input'));assert.equal(Number(await size.asElement().evaluate(e=>e.value)),prior.config.max_upload_bytes/1_000_000);await snap(p,service,'admin-settings');
    if(!live){try{await size.asElement().click({clickCount:3});await size.asElement().press('Backspace');await size.asElement().type('24');await click(p,'Save settings for new requests');await text(p,'Settings saved as version');const row=(await api.admin.request('/service-reports/settings/'+service))[0];assert.equal(row.config.max_upload_bytes,24000000);const created=await api.client.createCase({service_code:service}),w=await api.client.request('/service-reports/'+created.id+'/workflow');assert.equal(w.policy.max_upload_bytes,24000000);assert.equal((await api.admin.request('/service-reports/'+c.id+'/workflow')).policy.max_upload_bytes,25000000);}finally{const current=(await api.admin.request('/service-reports/settings/'+service))[0];if(current.config.max_upload_bytes!==prior.config.max_upload_bytes)await api.admin.request('/service-reports/settings/'+service,{base_version:current.version,config:prior.config});}}
    await size.dispose();pass(service+' admin upload settings visible'+(live?'':' and versioned changes apply only to new cases'));
   }
  });
  stage('isolation',async()=>{
   for(const c of state.cases.filter(c=>c.paid&&!c.cancel)){
    const other=c.advocate==='advocate-2'?'advocate':'advocate-2';for(const role of ['client-isolation',other]){
     await assert.rejects(api[role].case(c.id),e=>e.status===404);await assert.rejects(api[role].request(`/service-reports/${c.id}/workflow`),e=>e.status===404);
     for(const action of ['verify','request-information','reply','resolve','file-checklist','begin-report','review-checklist','reassign','open-correction','reopen-chat'])await assert.rejects(api[role].request(`/service-reports/${c.id}/workflow/${action}`,{revision:0}),e=>e.status===404);
     await assert.rejects(api[role].request(`/service-reports/${c.id}/wording`,{}),e=>e.status===404);
    }
    const p=await page('client-isolation');await go(p,mobile+'/'+c.service.replaceAll('_','-')+'/track?caseId='+c.id);await text(p,'Case not found');await snap(p,c.service,'isolation-'+c.speed);pass(c.tag+' foreign client direct URL and all workflow endpoints reject foreign client/unassigned advocate');
   }
   for(const role of ['client','advocate'])for(const service of ['property_search','document_forensic']){await assert.rejects(api[role].request('/service-reports/settings/'+service),e=>e.status===403);await assert.rejects(api[role].request('/service-reports/settings/'+service,{}),e=>e.status===403);}pass('Workflow settings are admin-only');
  });
  stage('save-race',async()=>{
   state.save_races??=[];const p=await page('client');
   for(const service of ['property_search','document_forensic']){
    const created=await api.client.createCase({service_code:service});state.save_races.push({id:created.id,service});save();
    const df=service==='document_forensic',label=df?'Instructions for the advocate':'Property Address',field=df?'instructions':'property_address',trigger=df?'Upload questioned document':'Upload property document';
    await go(p,mobile+'/'+service.replaceAll('_','-')+(df?'/upload':'/request')+'?caseId='+created.id);
    let release,intercepted;const ready=new Promise(resolve=>{intercepted=resolve;});
    const handler=async request=>{if(request.method()==='GET'&&new URL(request.url()).pathname==='/api/v1/cases/'+created.id){const response=await fetch(request.url(),{headers:request.headers()}),body=await response.text();release=()=>request.respond({status:response.status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(mobile).origin},body});intercepted();}else await request.continue();};
    await p.setRequestInterception(true);p.on('request',handler);
    try{
     await chooseFile(p,trigger,await syntheticPdf('slow-upload-refresh'));await Promise.race([ready,delay(30000).then(()=>{throw Error('Upload did not refresh the case');})]);
     const first='TEST ONLY: typed while the upload refresh was pending.';await fill(p,label,first);await release();
     await p.waitForFunction(label=>[...document.querySelectorAll('[role="button"],button')].some(e=>(e.textContent.trim()===label||e.getAttribute('aria-label')===label)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled),{},trigger);
     assert.equal(await p.$eval('[aria-label="'+label+'"]',e=>e.value),first,'Upload refresh preserves newer input');
     p.off('request',handler);await p.setRequestInterception(false);
     const final=first+' Further edits must use the same save queue.';await fill(p,label,final);await click(p,'Review request');await text(p,final);await p.reload({waitUntil:'networkidle0'});await text(p,final);assert.equal((await api.client.case(created.id)).details[field],final);await snap(p,service,'save-during-upload');pass(service+' delayed upload refresh preserves typing and subsequent saved edits');
    }finally{p.off('request',handler);await p.setRequestInterception(false);}
   }
  });
  stage('legacy-payment',async()=>{
   state.legacy_pending??=[];
   for(const service of ['property_search','document_forensic']){
    let entry=state.legacy_pending.find(c=>c.service===service);if(!entry){const source=await api.client.case(state.cases.find(c=>c.service===service&&!c.cancel).id),created=await api.client.createCase({service_code:service});entry={id:created.id,service};state.legacy_pending.push(entry);save();await api.client.saveReportIntake(entry.id,{tier:'ordinary',details:{...source.details,...service==='document_forensic'?{no_reference_sample:true,document_focus:{}}:{}}});if(service==='document_forensic'){const ticket=await api.client.presign({case_id:entry.id,kind:'questioned_document',filename:'TEST-resumed-request.pdf',mime:'application/pdf'});await api.client.upload(ticket,new Blob([fs.readFileSync(await syntheticPdf('resumed-request'))],{type:'application/pdf'}));}await api.client.submit(entry.id);}
    const p=await casePage('client',entry);await text(p,'Complete Payment');await text(p,'SELECT PAYMENT METHOD');await snap(p,service,'resumed-payment');await click(p,'Pay →');await text(p,'Scan & Pay');await snap(p,service,'resumed-scan');pass(service+' payment-pending tracking link resumes the shared checkout and QR flow');
   }
  });


  stage('visual-polish',async()=>{
   for(const service of ['property_search','document_forensic']){
    const c=state.cases.find(c=>c.service===service&&!c.cancel),p=await casePage('client',c);
    await text(p,service==='property_search'?'Report Ready':'Analysis Completed');await snap(p,service,'delivered-'+c.speed);
    await click(p,'More options');await snap(p,service,'request-menu');await click(p,'Close');
    const admin=await page('admin');await go(admin,adminWeb+require('../packages/shared/dist').adminCaseListPath(service)+'?search='+encodeURIComponent((await api.client.case(c.id)).reference));await text(admin,(await api.client.case(c.id)).reference);await snap(admin,service,'admin-queue');
    await go(p,mobile+'/'+service.replaceAll('_','-')+'/payment?step=payment-success&caseId='+c.id);await text(p,'Payment Successful');await snap(p,service,'success-'+c.speed);
   }
   const source=state.cases.find(c=>c.service==='document_forensic'&&!c.cancel),original=await api[source.advocate].case(source.id);
   if(!state.affidavit_visual){
    const created=await api.client.createCase({service_code:'document_forensic'});state.affidavit_visual={id:created.id,service:'document_forensic',advocate:'advocate'};save();
    await api.client.saveReportIntake(created.id,{tier:'ordinary',details:{...original.details,no_reference_sample:true,document_focus:{},instructions:'TEST ONLY affidavit visual controls'}});
    const ticket=await api.client.presign({case_id:created.id,kind:'questioned_document',filename:'TEST-affidavit-controls.pdf',mime:'application/pdf'});await api.client.upload(ticket,new Blob([fs.readFileSync(await syntheticPdf('affidavit-controls'))],{type:'application/pdf'}));await api.client.submit(created.id);
    const q=await api.client.paymentQuote(created.id);assert.equal(q.status,'ready');assert.equal(q.simulated,true);const checkout=await api.client.request('/payments/checkouts',{case_id:created.id,quote_id:q.id});assert.equal(checkout.simulated,true);assert.equal(checkout.test_actions,true);await api.client.request('/payments/checkouts/'+checkout.id+'/simulate',{});
    await api.admin.assign(created.id,users.advocate.id);await api.advocate.accept(created.id);
    for(const [action,body]of [['file-checklist',{files_open:true,pages_complete:true,legible:true}],['begin-report',{}]]){const w=await api.advocate.request('/service-reports/'+created.id+'/workflow');await api.advocate.request('/service-reports/'+created.id+'/workflow/'+action,{revision:w.revision,...body});}
    const content=original.report.latest_draft.content;await api.advocate.saveReport(created.id,{base_draft_id:null,report:content.report,affidavit:{...content.affidavit,office_address:'',paragraphs:content.affidavit.paragraphs.map(v=>v.replaceAll(original.reference,created.reference))},signed:false,note:'TEST ONLY visual control check'});
   }
   const c=state.affidavit_visual,p=await casePage('advocate',c,'affidavit');await text(p,'AFFIDAVIT OF FORENSIC EXAMINATION');await snap(p,c.service,'affidavit-partial');await click(p,'Edit Text');await fill(p,'Office address','TEST ONLY Pune office');
   if(!(await api.advocate.case(c.id)).report.latest_draft.content.affidavit.paragraphs.includes('TEST ONLY added statement reaches the saved affidavit.')){await click(p,'Add Info');await fill(p,'Affidavit statement 5','TEST ONLY added statement reaches the saved affidavit.');}
   await click(p,'Save');await text(p,'Edit Text');if(await kit.has(p,'Re-sign'))await click(p,'Re-sign');await fill(p,'Or type your signature','TEST Advocate');await click(p,'I confirm that I reviewed the report and affidavit and that this is my signature.');await click(p,'Save Draft');await kit.noText(p,'Changes are not saved');await text(p,'KB');await snap(p,c.service,'affidavit-signed-ordinary');
   let record=await api.advocate.case(c.id);assert.ok(record.report.latest_draft.content.affidavit.paragraphs.includes('TEST ONLY added statement reaches the saved affidavit.'));const preview=await api.advocate.request('/service-reports/'+c.id+'/drafts/'+record.report.latest_draft.id+'/preview',{}),pdf=preview.files.find(f=>f.filename.includes('Affidavit'));assert.equal(pdf.size_bytes,String(Buffer.from(pdf.pdf_base64,'base64').length));const extracted=await require('../apps/api/tests/helpers/pdf-text.cjs').readPdfText(Buffer.from(pdf.pdf_base64,'base64'));assert.ok(extracted.text.includes('added statement reaches'));
   await click(p,'Preview');await text(p,'Page 1 of');await snap(p,c.service,'affidavit-preview-ordinary');await p.goBack({waitUntil:'networkidle0'});await click(p,'Re-sign');
   const pad=await p.$('[aria-label="Affidavit signature pad"]');await pad.evaluate(e=>e.scrollIntoView({block:'center'}));const b=await pad.boundingBox();await p.mouse.move(b.x+20,b.y+25);await p.mouse.down();await p.mouse.move(b.x+b.width*.45,b.y+90,{steps:12});await p.mouse.move(b.x+b.width*.8,b.y+30,{steps:12});await p.mouse.up();await click(p,'I confirm that I reviewed the report and affidavit and that this is my signature.');await click(p,'Save Draft');await kit.noText(p,'Changes are not saved');await text(p,'KB');record=await api.advocate.case(c.id);assert.ok(record.report.latest_draft.content.signature.length>0);assert.ok(!record.report.latest_draft.content.typed_signature);await snap(p,c.service,'affidavit-drawn-signature');
   await click(p,'Continue to Review & Submit');await text(p,'Final Review & Submission');await snap(p,c.service,'submit-controls');
   pass('Affidavit Edit Text/Add Info/Save persists to the PDF; typed and drawn Re-sign work; saved PDF page/size metadata displays');
  });

  stage('final-visuals',async()=>{
   for(const service of ['property_search','document_forensic']){const c=state.cases.find(c=>c.service===service&&!c.cancel),record=await api.client.case(c.id),p=await page('admin');await go(p,adminWeb+require('../packages/shared/dist').adminCaseListPath(service)+'?search='+encodeURIComponent(record.reference));await text(p,record.reference);await snap(p,service,'admin-queue');}
   if(!state.send_visual){const source=await api.client.case(state.cases.find(c=>c.service==='property_search'&&!c.cancel).id),created=await api.client.createCase({service_code:'property_search'});await api.client.saveReportIntake(created.id,{tier:'urgent',details:{...source.details,requirement:'TEST ONLY send-screen visual check'}});await api.client.submit(created.id);const q=await api.client.paymentQuote(created.id);assert.equal(q.status,'ready');assert.equal(q.simulated,true);const checkout=await api.client.request('/payments/checkouts',{case_id:created.id,quote_id:q.id});assert.ok(checkout.simulated&&checkout.test_actions);await api.client.request('/payments/checkouts/'+checkout.id+'/simulate',{});let w=await api.admin.request('/service-reports/'+created.id+'/workflow');await api.admin.request('/service-reports/'+created.id+'/workflow/verify',{revision:w.revision});await api.admin.assign(created.id,users['advocate-2'].id);await api['advocate-2'].accept(created.id);const ticket=await api['advocate-2'].presign({case_id:created.id,kind:'service_report',filename:'TEST-send-preview.pdf',mime:'application/pdf'}),doc=await api['advocate-2'].upload(ticket,new Blob([fs.readFileSync(await syntheticPdf('send-preview'))],{type:'application/pdf'}));await api['advocate-2'].saveReport(created.id,{base_draft_id:null,report_document_id:doc.id,note:'TEST ONLY uploaded report.'});state.send_visual={id:created.id,service:'property_search',advocate:'advocate-2'};save();}
   const c=state.send_visual,p=await casePage('advocate-2',c,'send');await text(p,'Send Report to Client');await click(p,'I have checked and signed the final report and am ready to send it to the client.');await snap(p,c.service,'send-urgent');
   const affidavit=state.affidavit_visual,adv=await casePage('advocate',affidavit);await text(adv,'Client');await snap(adv,'document_forensic','accepted-client-card');
   await go(p,mobile+'/matters');await text(p,'Your Matters');await snap(p,'property_search','advocate-case-list');
   pass('Final send action row, accepted client contact card, advocate list dates and admin queue date presentation checked');
  });
  const selected=arg('stage');for(const s of stages)if(s.name!=='settings'&&(!selected||selected===s.name))await s.run();
  fs.writeFileSync(path.join(out,'browser-errors.json'),JSON.stringify(errors,null,2)+'\n');
  assert.equal(errors.length,0,'No unhandled browser JavaScript errors');
  state.last_check={stage:selected??'all',passed:true,at:new Date().toISOString()};save();fs.writeFileSync(path.join(out,'latest-check.json'),JSON.stringify(state.last_check,null,2)+'\n');
 }catch(e){for(const [role,p]of Object.entries(pages)){await dump(p,'Failure '+role).catch(()=>{});await p.screenshot({path:path.join(out,role+'-failure.png'),fullPage:true}).catch(()=>{});}fs.writeFileSync(path.join(out,'failure.json'),JSON.stringify({message:e.message,at:new Date().toISOString()},null,2)+'\n');throw e;}
 finally{if(browser)await browser.close();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
