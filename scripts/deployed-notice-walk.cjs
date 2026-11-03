// Deployed synthetic verification: three isolated role profiles, UI sign-in,
// real UI mutations and real S3 uploads. Requires explicit deployed hostnames.
// No credentials, tokens or signed document URLs are written to the report.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {PDFDocument,StandardFonts}=require('../apps/api/node_modules/pdf-lib');
const {demoAccounts,demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const out=path.resolve('reports/deployed-api-cutover-2026-11-03/walk'),mobile='https://legalitt-5.vercel.app',panel=process.env.DEPLOYED_ADMIN_URL,base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page,label,role='button') {
 console.log('Click', label); await page.bringToFront();
 const matches=(label,role)=>[...document.querySelectorAll(`[role="${role}"],button,a`)].filter(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled);
 await page.waitForFunction((label,role)=>[...document.querySelectorAll(`[role="${role}"],button,a`)].some(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true'&&!e.disabled),{timeout:45000,polling:100},label,role);
 await delay(350);
 const el=await page.evaluateHandle(matches,label,role);const last=await el.evaluateHandle(a=>a.at(-1));await last.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await last.asElement().click();await el.dispose();await last.dispose();
}
async function fill(page,label,value){
 await page.bringToFront();
 const sel=`input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`;
 await page.waitForSelector(sel);const els=await page.$$(sel);let el;for(const e of els)if(await e.evaluate(e=>!e.closest('[aria-hidden="true"],[inert]')))el=e;
 assert.ok(el,label);await el.evaluate(e=>e.scrollIntoView({block:'center'}));await el.click({clickCount:3});await el.press('Backspace');await el.type(value,{delay:2});await el.evaluate(e=>e.blur());
}
async function route(page,suffix){await page.waitForFunction(s=>location.pathname.endsWith(s),{timeout:60000,polling:100},suffix);await delay(550);console.log('Route',suffix);}
async function main(){
 assert.equal(process.env.DEPLOYED_WALK,'1');assert.match(panel??'',/^https:\/\/[a-z0-9-]+\.vercel\.app$/);requireDemoMode();fs.mkdirSync(out,{recursive:true});
 const password=await demoPassword(),sessions={},api={};
 for(const role of ['client','advocate','admin']){
  const email=role==='admin'?'demo-admin@legalitt.invalid':demoAccounts[role].email;
  const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});assert.equal(r.status,201);sessions[role]=await r.json();assert.equal(sessions[role].user.role,role);
  api[role]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[role].tokens});
 }
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
 const observers={},work={},errors=[],evidence=[];let record;
 try{
  for(const role of ['client','advocate','admin']){
   const context=await browser.createBrowserContext();
   const make=async(injectSession)=>{const p=await context.newPage();await p.setViewport({width:role==='admin'?1400:395,height:950});await p.emulateTimezone('Asia/Kolkata');p.on('pageerror',e=>errors.push(role+': '+e.message));if(injectSession) await p.evaluateOnNewDocument(({tokens,key})=>sessionStorage.setItem(key,JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),{tokens:sessions[role].tokens,key:role==='admin'?'legalitt.admin.tokens':'legalitt.auth.tokens'});return p;};
   observers[role]=await make(true);work[role]=await make(false);
   const w=work[role];
   await w.goto(role==='admin'?panel+'/sign-in':mobile+'/login',{waitUntil:'networkidle0',timeout:120000});
   if(role==='admin'){
    await w.type('input[name="email"]','demo-admin@legalitt.invalid');await w.type('input[name="password"]',password);await click(w,'Sign in');await route(w,'/legal-notices');
   }else{
    await w.type('input[placeholder="Email / Mobile No"]',demoAccounts[role].email);await fill(w,'Password',password);await click(w,'Continue');await route(w,role==='client'?'/home':'/dashboard');
   }
   await w.screenshot({path:path.join(out,role+'-signed-in.png')});
   await observers[role].goto(role==='admin'?panel+'/legal-notices':mobile+(role==='client'?'/home':'/dashboard'),{waitUntil:'networkidle0',timeout:120000});
   await observers[role].waitForSelector('[data-testid="notifications-bell"]');
  }
  const count=async role=>Number((await observers[role].$eval('[data-testid="notifications-bell"]',e=>e.getAttribute('aria-label'))).match(/(\d+) unread/)[1]);
  const observe=async(role,before,event)=>{
   await observers[role].waitForFunction(before=>{const e=document.querySelector('[data-testid="notifications-bell"]');return Number(e?.getAttribute('aria-label')?.match(/(\d+) unread/)?.[1])>before;},{timeout:30000,polling:500},before);
   const unread=await count(role);evidence.push({event,role,before,unread,withoutReload:true});fs.writeFileSync(path.join(out,'observations.json'),JSON.stringify(evidence,null,2));console.log(event,role,unread);
   await observers[role].screenshot({path:path.join(out,role+'-bell.png')});
  };
  const openNotice=async(page,title,ref)=>{
   await page.bringToFront();
   await page.waitForFunction((title,ref)=>[...document.querySelectorAll('button,[role="button"]')].some(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.textContent.includes(title)&&e.textContent.includes(ref)),{timeout:30000,polling:100},title,ref);
   const el=await page.evaluateHandle((title,ref)=>[...document.querySelectorAll('button,[role="button"]')].find(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.textContent.includes(title)&&e.textContent.includes(ref)),title,ref);await el.asElement().click();await el.dispose();
  };
  const p=work.client;
  let id=process.env.DEPLOYED_CASE_ID;
  if (!id) {
  await p.goto(mobile+'/legal-notice',{waitUntil:'networkidle0',timeout:120000});await click(p,'Get Started');await route(p,'/step3');
  id=new URL(p.url()).searchParams.get('caseId');assert.ok(id);record=await api.client.case(id);fs.writeFileSync(path.join(out,'case.json'),JSON.stringify({id,reference:record.reference},null,2));
  await click(p,'Money Recovery');await fill(p,'Subject matter in dispute','Synthetic deployed verification: an invoice of ₹5,000 remains unpaid. No actual dispute or delivery.');await click(p,'Continue');await route(p,'/step2');
  for(const [k,v]of Object.entries({'Noticee Full Name':'Deployment Test Recipient','Mobile Number of Noticee':'2025550102','Email Id of Noticee':'noticee@example.invalid','Relationship':'Customer','Full Address':'Synthetic noticee address, Mumbai'}))await fill(p,k,v);
  await click(p,'Continue');await route(p,'/step1');
  for(const[k,v]of Object.entries({'Full Name':'Deployment Test Sender','Age':'41','Father’s name (S/o Shri)':'Test Father','Mobile Number':'2025550101','Email Address':'sender@example.invalid','Full Address':'Synthetic sender address, Mumbai'}))await fill(p,k,v);
  await click(p,'Continue');await route(p,'/demand');await p.waitForSelector('[role="checkbox"]');const option=await p.$eval('[role="checkbox"]',e=>e.textContent.trim());await click(p,option,'checkbox');await click(p,'Continue');await route(p,'/step4');
  } else {record=await api.client.case(id);assert.equal(record.status,'draft');await p.goto(mobile+'/legal-notice/step4?caseId='+id,{waitUntil:'networkidle0'});}
  const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);const sheet=pdf.addPage();sheet.drawText('MANUAL DEPLOYMENT VERIFICATION',{x:40,y:750,size:17,font});sheet.drawText('Synthetic development test. No actual delivery occurred.',{x:40,y:710,size:11,font});sheet.drawText(record.reference,{x:40,y:680,size:11,font});const file=path.join(out,'manual-verification.pdf');fs.writeFileSync(file,await pdf.save());
  if (!(await api.client.case(id)).documents.length) {
  const[chooser]=await Promise.all([p.waitForFileChooser(),click(p,'Upload Agreement')]);await chooser.accept([file]);
  for(let n=0;n<90;n++){if((await api.client.case(id)).documents.length)break;await delay(500);}assert.ok((await api.client.case(id)).documents.length);
  }
  if (!await p.evaluate(()=>document.body.innerText.includes('Identity verified'))) {
  await click(p,'Verify identity');await route(p,'/kyc/choose');await click(p,'Continue');await route(p,'/kyc/digilocker/connect');await click(p,'Continue to DigiLocker');await route(p,'/kyc/digilocker/verified');await click(p,'Continue');await route(p,'/step4');
  }
  await click(p,'Continue');await route(p,'/step4-review');await click(p,'Continue');await route(p,'/step5');await click(p,'Submit & Proceed to Pay');await route(p,'/step6');
  const adminBefore=await count('admin');await click(p,'Pay');await route(p,'/scan-pay');await click(p,'Pay using UPI App');await route(p,'/success');await observe('admin',adminBefore,'paid → assignment needed');
  const a=work.admin;await a.bringToFront();await a.goto(panel+'/notifications',{waitUntil:'networkidle0'});await openNotice(a,'A paid case needs an advocate',record.reference);await a.waitForSelector('.admin-attention .assign');await a.click('.admin-attention .assign');await a.waitForSelector(`[aria-label="Assign to ${sessions.advocate.user.name}"]`);
  const advocateBefore=await count('advocate'),clientAssigned=await count('client');await a.click(`[aria-label="Assign to ${sessions.advocate.user.name}"]`);await a.waitForFunction(()=>!document.querySelector('dialog'));await observe('advocate',advocateBefore,'assigned');await observe('client',clientAssigned,'advocate assigned');
  const v=work.advocate;await v.goto(mobile+'/advocate/notifications',{waitUntil:'networkidle0',timeout:120000});await openNotice(v,'A case assigned to you',record.reference);await route(v,'/fee');await click(v,'Accept & Schedule');await route(v,'/documents');await click(v,'Send');await route(v,'/drafting');await click(v,'Continue with AI Generation');await route(v,'/draft');
  // Enter the actual working draft through the designed editor.
  
  const values=['Deployment Test Sender\nSynthetic sender address, Mumbai','Deployment Test Recipient\nSynthetic noticee address, Mumbai',(await api.client.case(id)).subject_line,'1. Synthetic deployed verification only.\n2. The test invoice amount is ₹5,000.','Pay the test invoice amount of ₹5,000.','No real dispute or delivery is represented.'];
  const edits=await v.$$eval('[aria-label^="Edit "]',els=>els.filter(e=>!e.closest('[aria-hidden="true"],[inert]')).map(e=>e.getAttribute('aria-label')));
  assert.equal(edits.length,6);
  for(let n=0;n<edits.length;n++){await click(v,edits[n]);await fill(v,edits[n].slice(5),values[n]);}
  await fill(v,'Offences','Not alleged in this synthetic verification.');
  const rendering=v.waitForResponse(r=>/\/drafts\/[^/]+\/pdf$/.test(r.url())&&r.request().method()==='POST',{timeout:90000});await click(v,'Generate Draft');const rendered=await(await rendering).json();assert.ok(rendered.pdf_base64);fs.writeFileSync(path.join(out,'corrected-letterhead.pdf'),Buffer.from(rendered.pdf_base64,'base64'));await route(v,'/response');
  const clientBefore=await count('client');await click(v,'Share for Review');await route(v,'/review');await observe('client',clientBefore,'draft ready');
  await p.goto(mobile+'/notifications',{waitUntil:'networkidle0'});await openNotice(p,'Draft ready to review',record.reference);await route(p,'/tracking');
  const approvedBefore=await count('advocate');await click(p,'Approve & Proceed');await observe('advocate',approvedBefore,'client approved');
  await v.goto(mobile+'/advocate/notifications',{waitUntil:'networkidle0'});await openNotice(v,'Client approved',record.reference);await route(v,'/final');
  // Follow existing outbound hand-off; the booking form is the approved design-286 reuse.
  await click(v,'Continue to Send');await route(v,'/dispatch');await click(v,'Continue to Send');await route(v,'/send');
  const self=await v.$eval('[role="radio"]',e=>e.textContent.trim());assert.ok(self.includes('Send by Yourself'));await click(v,self,'radio');await click(v,'Continue');await route(v,'/courier/self/details');
  const today=new Date().toLocaleDateString('en-GB',{timeZone:'Asia/Kolkata'});
  for(const [label,value] of [['Courier Name','MANUAL DEPLOYMENT TEST'],['Tracking Number','TEST-'+record.reference],['Dispatch Date',today]])await fill(v,label,value);
  await click(v,'Submit Delivery Details');await route(v,'/dispatch');await v.screenshot({path:path.join(out,'advocate-dispatch.png')});
  const dispatchedAdmin=await count('admin'),dispatchedClient=await count('client');await click(v,'Confirm Dispatch');await observe('admin',dispatchedAdmin,'dispatched → delivery confirmation needed');await observe('client',dispatchedClient,'notice dispatched');
  await a.goto(panel+'/notifications',{waitUntil:'networkidle0'});await openNotice(a,'A case needs delivery confirmed',record.reference);await a.waitForSelector('.admin-attention .assign');await a.click('.admin-attention .assign');await a.waitForSelector('input[name="proof"]');await(await a.$('input[name="proof"]')).uploadFile(file);await a.type('input[name="received_by"]','Deployment Test Recipient');await a.waitForSelector('.uploaded',{timeout:90000});await a.screenshot({path:path.join(out,'confirm-delivery.png')});
  const deliveredBefore=await count('client');await a.click('.delivery-dialog button[type="submit"]');await a.waitForFunction(()=>!document.querySelector('.delivery-dialog'));await observe('client',deliveredBefore,'notice delivered');
  record=await api.client.case(id);assert.equal(record.status,'completed');
  const outbound=record.shipments.find(s=>s.direction==='to_recipient');assert.equal(outbound.simulated,false);
  const proof=record.documents.find(d=>d.id===outbound.pod_document_id);assert.equal(proof.simulated,false);
  for(const state of ['assigned','advocate_accepted','in_progress','client_review','approved','dispatched','completed']) {
   assert.equal(record.events.find(e=>e.type==='status_changed'&&e.to_status===state)?.source,'real',state+' must be performed through the signed-in UI');
  }
  for(const role of ['client','advocate','admin']){
   const page=work[role];await page.goto(role==='admin'?panel+'/notifications':mobile+(role==='client'?'/notifications':'/advocate/notifications'),{waitUntil:'networkidle0'});await page.waitForFunction(ref=>document.body.innerText.includes(ref),{},record.reference);await page.screenshot({path:path.join(out,role+'-notifications.png'),fullPage:role==='admin'});
   const rows=await api[role].request('/notifications?limit=100');fs.writeFileSync(path.join(out,role+'-rows.json'),JSON.stringify(rows.items.filter(n=>n.case_id===id),null,2));
  }
  // Opening an old assignment alert now must open the finished case, never acceptance.
  await openNotice(work.advocate,'A case assigned to you',record.reference);await route(work.advocate,'/report');
  await openNotice(work.client,'Notice delivered',record.reference);await route(work.client,'/delivery');
  await work.client.screenshot({path:path.join(out,'client-delivery-440.png')});
  await click(work.client,'View Delivery Confirmation');await route(work.client,'/delivered');
  await work.client.waitForFunction(()=>document.body.innerText.includes('Deployment Test Recipient'));
  await work.client.screenshot({path:path.join(out,'client-delivered-441.png')});
  const proofResponse=work.client.waitForResponse(r=>r.request().method()==='GET'&&r.url().includes('/documents/'+proof.id+'/url'));
  await click(work.client,'View Proof');
  const proofUrl=await(await proofResponse).json();
  const bytes=await work.client.evaluate(async url=>{const r=await fetch(url);if(!r.ok)throw new Error('POD HTTP '+r.status);return [...new Uint8Array(await r.arrayBuffer())];},proofUrl.url);
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash(Buffer.from(bytes)),hash(fs.readFileSync(file)),'The client must read the exact PDF the admin uploaded');
  await a.goto(panel+'/legal-notices/'+id,{waitUntil:'networkidle0'});await a.screenshot({path:path.join(out,'admin-case-completed.png'),fullPage:true});
  const after=await api.client.request('/notifications?limit=100');assert.ok(after.items.find(n=>n.case_id===id&&n.kind==='notice_delivered').read_at);
  const duplicate=await fetch(base+'/api/v1/cases/'+id+'/delivered',{method:'POST',headers:{Authorization:'Bearer '+sessions.admin.tokens.idToken,'Content-Type':'application/json'},body:JSON.stringify({pod_document_id:record.shipments[0].pod_document_id})});assert.equal(duplicate.status,409);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({urls:{mobile,admin:panel,api:base},case:{id,reference:record.reference,status:record.status},profiles:3,uiSignIn:true,uiCourierDetails:true,deliveryRoute:'/legal-notice/delivered',podBrowserVerified:true,observations:evidence,errors,duplicateDeliveryStatus:duplicate.status,observerReloads:0},null,2));
  for(const name of fs.readdirSync(out).filter(n=>n.includes('-failure.'))) fs.unlinkSync(path.join(out,name));
  console.log('PASS',record.reference,'three profiles; zero observer reloads');
 }catch(e){for(const[role,page]of Object.entries(work)){await page.screenshot({path:path.join(out,role+'-failure.png')}).catch(()=>{});fs.writeFileSync(path.join(out,role+'-failure.txt'),await page.evaluate(()=>document.body.innerText).catch(()=>''));}throw e;}finally{
  // Chrome's PDF viewer can hold Browser.close open after the read check.
  // This process belongs only to this test's temporary browser profiles.
  const cleanup=setTimeout(()=>{browser.process()?.kill('SIGKILL');browser.disconnect();},5000);
  try{await browser.close();}finally{clearTimeout(cleanup);}
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
