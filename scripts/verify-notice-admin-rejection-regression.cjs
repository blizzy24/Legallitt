const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {PDFDocument,StandardFonts}=require('../apps/api/node_modules/pdf-lib');
const {demoPassword}=require('../apps/api/dist/src/auth/demo');
process.loadEnvFile('apps/api/.env.local');
const local=process.env.NOTICE_LOCAL==='1';
const out=path.resolve(process.env.NOTICE_REPORT_ROOT??'reports/consultation-services-2026-11-10',local?'legal-notice-local':'legal-notice-deployed');fs.mkdirSync(out,{recursive:true});
const mobile=local?'http://localhost:8083':'https://legalitt-5.vercel.app',panel=local?'http://localhost:5174':'https://legalitt-admin-panel.vercel.app',base=local?'http://127.0.0.1:3003':'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const save=(name,data)=>fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(data,null,2)+'\n');
async function click(p,label,role='button'){
 console.log('UI click:',label);await p.bringToFront();
 await p.waitForFunction((label,role)=>[...document.querySelectorAll(`[role="${role}"],button,a`)].some(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled),{timeout:90000,polling:200},label,role);
 const el=await p.evaluateHandle((label,role)=>[...document.querySelectorAll(`[role="${role}"],button,a`)].filter(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled).at(-1),label,role);
 await el.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await el.asElement().click();await el.dispose();
}
async function fill(p,label,value){
 const selector=`input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`;
 await p.waitForSelector(selector);const els=await p.$$(selector);let el;for(const e of els)if(await e.evaluate(e=>!e.closest('[aria-hidden="true"],[inert]')))el=e;
 assert.ok(el,label);await el.evaluate(e=>{e.scrollIntoView({block:'center'});e.focus();e.select();});await el.press('Backspace');if(value)await el.type(value,{delay:1});assert.equal(await el.evaluate(e=>e.value),value);await el.evaluate(e=>e.blur());
}
async function route(p,suffix){await p.waitForFunction(s=>location.pathname.endsWith(s),{timeout:90000,polling:200},suffix);await delay(600);console.log('UI route:',suffix);}
async function goto(p,url){
 const parsed=new URL(url),id=parsed.searchParams.get('caseId')??parsed.pathname.match(/\/(?:notice|legal-notices)\/([0-9a-f-]{36})/)?.[1];
 const loaded=id?p.waitForResponse(r=>r.request().method()==='GET'&&new URL(r.url()).pathname.endsWith('/cases/'+id)&&[200,304].includes(r.status()),{timeout:60000}):null;
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 if(loaded){await loaded;await delay(800);}
 console.log('Opened:',parsed.pathname);
}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
async function main(){
 const localServer=local?await require('./helpers/local-walkthrough.cjs')():null;
 const password=await demoPassword(),sessions={},api={},work={},errors=[],network=[];
 for(const role of ['client','advocate','admin']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-'+role+'@legalitt.invalid',password})});assert.equal(r.status,201,role+' API login');sessions[role]=await r.json();api[role]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[role].tokens});}
 let restoreProfile;
 if(local){const db=await require('../apps/api/dist/src/database').createDatabaseClient(),user_id=sessions.advocate.user.id,old=await db.advocateProfile.findUnique({where:{user_id}});await db.advocateProfile.upsert({where:{user_id},create:{user_id,verification:'approved',city:'Indore'},update:{verification:'approved',city:'Indore'}});restoreProfile=async()=>{try{if(old)await db.advocateProfile.update({where:{user_id},data:{verification:old.verification,city:old.city}});else await db.advocateProfile.delete({where:{user_id}});}finally{await db.$disconnect();}};}
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
 let record;const casePath=path.join(out,'case.json');
 try{
  for(const role of ['client','advocate','admin']){
   const context=await browser.createBrowserContext(),p=await context.newPage();work[role]=p;await localServer?.attach(p);
   await p.setViewport({width:role==='admin'?1440:430,height:1000});await p.emulateTimezone('Asia/Kolkata');
   p.on('dialog',async d=>d.accept());
   p.on('pageerror',e=>errors.push({role,message:e.message}));
   p.on('response',r=>{if(r.url().startsWith(base+'/api/v1/')&&r.request().method()!=='OPTIONS')network.push({role,method:r.request().method(),path:new URL(r.url()).pathname,status:r.status()});});
   await goto(p,role==='admin'?panel+'/sign-in':mobile+'/login');
   if(role==='admin'){await p.waitForSelector('input[name="email"]');await p.type('input[name="email"]','demo-admin@legalitt.invalid');await p.type('input[name="password"]',password);await click(p,'Sign in');await route(p,'/legal-notices');}
   else {await p.waitForSelector('input[placeholder="Email / Mobile No"]');await p.type('input[placeholder="Email / Mobile No"]','demo-'+role+'@legalitt.invalid');await fill(p,'Password',password);await click(p,'Continue');await route(p,role==='client'?'/home':'/dashboard');}
   await shot(p,role+'-signed-in');
  }
  const p=work.client,a=work.admin,v=work.advocate;
  if(fs.existsSync(casePath))record=await api.client.case(JSON.parse(fs.readFileSync(casePath)).id);
  else{await goto(p,mobile+'/legal-notice');await click(p,'Get Started');await route(p,'/step3');const id=new URL(p.url()).searchParams.get('caseId');assert.ok(id);record=await api.client.case(id);save('case',{id,reference:record.reference});}
  const id=record.id;const refresh=async()=>record=await api.client.case(id);
  const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);const sheet=pdf.addPage();
  sheet.drawText('SIMULATED - DEPLOYMENT VERIFICATION ONLY',{x:35,y:750,size:16,font});sheet.drawText('No actual dispute, dispatch or delivery occurred.',{x:35,y:715,size:12,font});sheet.drawText(record.reference,{x:35,y:680,size:12,font});
  const proofFile=path.join(out,'synthetic-verification.pdf');if(!fs.existsSync(proofFile))fs.writeFileSync(proofFile,await pdf.save());
  if(record.status==='draft'){
   if(!record.subject_line){await goto(p,mobile+'/legal-notice/step3?caseId='+id);await click(p,'Money Recovery');await fill(p,'Subject matter in dispute','TEST ONLY: deployment verification FIR-admin-rejection-regression. A synthetic invoice of INR 5,000 remains unpaid. No actual dispute exists.');await shot(p,'client-intake-subject');await click(p,'Continue');await route(p,'/step2');}
   else await goto(p,mobile+'/legal-notice/step2?caseId='+id);
   for(const[k,value]of Object.entries({'Noticee Full Name':'TEST ONLY Deployment Recipient','Mobile Number of Noticee':'2025550102','Email Id of Noticee':'recipient@example.invalid','Relationship':'Customer','Full Address':'Synthetic recipient address, Mumbai'}))await fill(p,k,value);
   await click(p,'Continue');await route(p,'/step1');
   for(const[k,value]of Object.entries({'Full Name':'TEST ONLY Deployment Sender','Age':'41','Father’s or husband’s name':'Test Father','Mobile Number':'2025550101','Email Address':'sender@example.invalid','Full Address':'Synthetic sender address, Mumbai'}))await fill(p,k,value);
   await click(p,'Continue');await route(p,'/demand');
   await fill(p,'Write your own demand','Pay the synthetic test invoice of INR 5,000. No real demand is being made.');
   await click(p,'Continue');await route(p,'/step4');
   await refresh();
   if(!record.documents.length){const[chooser]=await Promise.all([p.waitForFileChooser(),click(p,'Upload Agreement')]);await chooser.accept([proofFile]);for(let n=0;n<90;n++){await refresh();if(record.documents.length)break;await delay(1000);}assert.ok(record.documents.length,'Uploaded client document');}
   if(await p.evaluate(()=>document.body.innerText.includes('Verify identity')))/* D-46 */{await click(p,'Verify identity');await route(p,'/kyc/choose');await click(p,'Continue');await route(p,'/kyc/digilocker/connect');await click(p,'Continue to DigiLocker');await route(p,'/kyc/digilocker/verified');await click(p,'Continue');await route(p,'/step4');}
   await shot(p,'client-documents');await click(p,'Continue');await route(p,'/step4-review');await click(p,'Continue');await route(p,'/step5');await shot(p,'client-filing-review');await click(p,'Submit & Proceed to Pay');await route(p,'/step6');await refresh();
  }
  if(record.status==='payment_pending'){
   await goto(p,mobile+'/legal-notice/step6?caseId='+id);await shot(p,'client-payment');await click(p,'Pay');await route(p,'/scan-pay');await click(p,'Pay using UPI App');await route(p,'/success');await shot(p,'client-paid');await refresh();assert.equal(record.status,'paid');
  }
  if(['paid','assigning','advocate_declined'].includes(record.status)){
   await goto(a,panel+'/legal-notices/'+id);await a.waitForSelector('.admin-attention .assign');await a.click('.admin-attention .assign');const selector=`[aria-label="Assign to ${sessions.advocate.user.name}"]`;await a.waitForSelector(selector);await shot(a,'admin-assignment');await a.click(selector);await a.waitForFunction(()=>!document.querySelector('dialog'));await refresh();assert.equal(record.status,'assigned');
  }
  if(record.status==='assigned'){
   await goto(v,mobile+'/advocate/notice/'+id+'/fee');await click(v,'Accept & Schedule');await route(v,'/documents');await shot(v,'advocate-documents');await click(v,'Send');await route(v,'/drafting');await refresh();
  }
  if(['advocate_accepted','changes_requested'].includes(record.status)){
   await goto(v,mobile+'/advocate/notice/'+id+'/drafting');await click(v,'Continue with AI Generation');await route(v,'/draft');await refresh();
  }
  if(record.status==='in_progress'){
   await goto(v,mobile+'/advocate/notice/'+id+'/draft');await click(v,'Edit Background & Facts');await fill(v,'Background & Facts','1. TEST ONLY: the advocate reviewed a synthetic invoice.\n2. The test amount is INR 5,000.\n3. No actual dispute, dispatch or delivery is represented.');await fill(v,'Offences','');await shot(v,'advocate-edited-draft');
   const rendering=v.waitForResponse(r=>/\/drafts\/[^/]+\/pdf$/.test(r.url())&&r.request().method()==='POST',{timeout:90000});await click(v,'Generate Draft');const response=await rendering;assert.equal(response.status(),201,'PDF rendering');const rendered=await response.json();assert.ok(rendered.pdf_base64);fs.writeFileSync(path.join(out,'generated-notice.pdf'),Buffer.from(rendered.pdf_base64,'base64'));await route(v,'/response');await shot(v,'advocate-generated-notice');await click(v,'Share for Review');await route(v,'/review');await refresh();assert.equal(record.status,'client_review');
  }
  if(record.status==='client_review'&&!record.events.some(e=>e.type==='status_changed'&&e.to_status==='changes_requested')){
   await require('./helpers/notice-request-changes-walk.cjs')({p,v,api,id,mobile,goto,click,fill,route,shot,refresh,assert,save});
   await refresh();
  }
  if(record.status==='client_review'){
   await goto(p,mobile+'/legal-notice/tracking?caseId='+id);await shot(p,'client-draft-review');await click(p,'Approve & Proceed');for(let n=0;n<60;n++){await refresh();if(record.status==='approved')break;await delay(1000);}assert.equal(record.status,'approved');await shot(p,'client-approved');
  }
  if(['approved','dispatching'].includes(record.status)){
   const shipment=record.shipments.find(s=>s.direction==='to_recipient');
   if(!shipment?.waybill){
    await goto(v,mobile+'/advocate/notice/'+id+'/final');await click(v,'Continue to Send');await route(v,'/dispatch');await click(v,'Continue to Send');await route(v,'/send');await click(v,'Continue');await route(v,'/courier/self/details');
    const today=new Date().toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata'});
    for(const[label,value]of [['Courier Name','TEST ONLY - no real courier'],['Tracking Number','TEST-'+record.reference],['Dispatch Date',today]])await fill(v,label,value);
    await shot(v,'advocate-courier-details');await click(v,'Submit Delivery Details');await route(v,'/dispatch');
   }else await goto(v,mobile+'/advocate/notice/'+id+'/dispatch');
   await click(v,'Confirm Dispatch');for(let n=0;n<60;n++){await refresh();if(record.status==='dispatched')break;await delay(1000);}assert.equal(record.status,'dispatched');await shot(v,'advocate-dispatched');
  }
  if(record.status==='dispatched'){
   await goto(a,panel+'/legal-notices/'+id);await a.waitForSelector('.admin-attention .assign');await a.click('.admin-attention .assign');await a.waitForSelector('input[name="proof"]');await(await a.$('input[name="proof"]')).uploadFile(proofFile);await a.type('input[name="received_by"]','TEST ONLY Deployment Recipient');await a.waitForSelector('.uploaded',{timeout:90000});await shot(a,'admin-confirm-delivery');await a.click('.delivery-dialog button[type="submit"]');await a.waitForFunction(()=>!document.querySelector('.delivery-dialog'),{timeout:90000});await refresh();assert.equal(record.status,'completed');
  }
  assert.equal(record.status,'completed');
  await goto(a,panel+'/legal-notices/'+id);await shot(a,'admin-completed');
  await goto(p,mobile+'/legal-notice/delivery?caseId='+id);await click(p,'View Delivery Confirmation');await route(p,'/delivered');await p.waitForFunction(()=>document.body.innerText.includes('TEST ONLY Deployment Recipient'));await shot(p,'client-delivered');
  const outbound=record.shipments.find(s=>s.direction==='to_recipient');assert.equal(outbound.status,'delivered');
  const proof=record.documents.find(d=>d.id===outbound.pod_document_id);assert.ok(proof);
  const proofResponse=p.waitForResponse(r=>r.request().method()==='GET'&&r.url().includes('/documents/'+proof.id+'/url'));
  await click(p,'View Proof');const signed=await(await proofResponse).json();
  const bytes=await p.evaluate(async url=>{const r=await fetch(url);if(!r.ok)throw new Error('Proof download HTTP '+r.status);return [...new Uint8Array(await r.arrayBuffer())];},signed.url);
  const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(Buffer.from(bytes)),hash(fs.readFileSync(proofFile)));
  for(const status of ['assigned','advocate_accepted','in_progress','client_review','changes_requested','approved','dispatched','completed'])assert.equal(record.events.find(e=>e.type==='status_changed'&&e.to_status===status)?.source,'real',status+' UI actor provenance');
  save('verification',{commit:'FIR-admin-rejection-regression',case:{id,reference:record.reference,status:record.status},urls:{mobile,panel,base},uiSignInRoles:['client','advocate','admin'],allLifecycleMutationsThroughUi:true,proofDownloadedInClientBrowser:true,proofSha256:hash(Buffer.from(bytes)),statusEvents:record.events.filter(e=>e.type==='status_changed').map(e=>({from:e.from_status,to:e.to_status,source:e.source})),errors});
  assert.deepEqual(errors,[]);console.log('PASS deployed UI lifecycle:',record.reference,record.status);
 }catch(e){for(const[role,p]of Object.entries(work)){await shot(p,role+'-failure').catch(()=>{});fs.writeFileSync(path.join(out,role+'-failure.txt'),await p.evaluate(()=>document.body.innerText).catch(()=>''));}throw e;}
 finally{save('browser-network',network);const timer=setTimeout(()=>{browser.process()?.kill('SIGKILL');browser.disconnect();},5000);try{await browser.close();}finally{clearTimeout(timer);localServer?.close();await restoreProfile?.();}}
}
main().catch(e=>{console.error(e.name,e.message);process.exitCode=1;});
