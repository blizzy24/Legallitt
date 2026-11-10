// Real browser journeys with existing demo identities; no credential is written.
// Local and deployed runs use actual case/chat/document APIs and simulated payments.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {spawn}=require('node:child_process'),{createServer}=require('node:http'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const deployed=process.env.CONSULTATION_DEPLOYED==='1',base=deployed?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3003',mobile=deployed?'https://legalitt-5.vercel.app':'http://localhost:8083',panel=deployed?'https://legalitt-admin-panel.vercel.app':'http://localhost:5174';
const out=path.resolve(process.env.CONSULTATION_REPORT_ROOT??'reports/consultation-services-2026-11-10',deployed?'deployed':'local');fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms)),save=(name,v)=>fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x,2)+'\n');
async function text(p,value){await p.waitForFunction(v=>document.body.innerText.includes(v),{timeout:90000},value);}
async function click(p,label){console.log('UI:',label);await p.bringToFront();const find=label=>[...document.querySelectorAll('[role="button"],[role="radio"],button,a')].filter(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'&&(e.textContent.trim()===label||e.getAttribute('aria-label')===label)).at(-1);await p.waitForFunction(find,{timeout:90000},label);const h=await p.evaluateHandle(find,label);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await h.asElement().click();await h.dispose();}
async function fill(p,label,value){const find=label=>[...document.querySelectorAll('input,textarea')].find(e=>e.getAttribute('aria-label')===label&&!e.closest('[aria-hidden="true"],[inert]')&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));await p.waitForFunction(find,{timeout:60000},label);const h=await p.evaluateHandle(find,label);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await h.asElement().click({clickCount:3});await h.asElement().press('Backspace');await h.asElement().type(value,{delay:1});assert.equal(await h.asElement().evaluate(e=>e.value),value,'Entered '+label);await h.asElement().evaluate(e=>e.blur());await h.dispose();}
async function goto(p,url){await p.goto(url,{waitUntil:'networkidle0',timeout:90000});}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
async function eventually(read,check,label){for(let i=0;i<100;i++){const value=await read();if(check(value))return value;await delay(300);}throw new Error('Timed out: '+label);}
function serve(root,port){const server=createServer((req,res)=>{let f=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())f=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf'})[path.extname(f)]??'application/octet-stream');res.end(fs.readFileSync(f));});return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));}
async function main(){let browser,apiProcess,restoreProfiles;const servers=[],pages=[],errors=[],results=[];let activeCase;
 try{
  if(!deployed){assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));assert.ok(!process.env.DATABASE_SECRET_ARN);
   const db=await require('../apps/api/dist/src/database').createDatabaseClient();try{await require('../apps/api/dist/prisma/seed-pricing').seedConfirmedPricing(db);}finally{await db.$disconnect();}
   apiProcess=spawn(process.execPath,['dist/src/main.js'],{cwd:path.resolve('apps/api'),env:{...process.env,PORT:'3003',CORS_ORIGINS:mobile+','+panel},stdio:'ignore',windowsHide:true});
   servers.push(await serve(path.resolve('apps/mobile/dist/fir-verification'),8083),await serve(path.resolve('apps/admin/dist/fir-verification'),5174));
   for(let i=0;i<60;i++){if(apiProcess.exitCode!==null)throw new Error('Local API failed to start');try{if((await fetch(base+'/health')).ok)break;}catch{}await delay(1000);}
  }
  const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={},api={};
  for(const role of ['client','advocate','admin','client-isolation']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);sessions[role]=await r.json();api[role]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[role].tokens});}
  if(!deployed){const db=await require('../apps/api/dist/src/database').createDatabaseClient(),user_id=sessions.advocate.user.id,old=await db.advocateProfile.findUnique({where:{user_id}});await db.advocateProfile.upsert({where:{user_id},create:{user_id,verification:'approved',city:'Indore'},update:{verification:'approved',city:'Indore'}});restoreProfiles=async()=>{try{if(old)await db.advocateProfile.update({where:{user_id},data:{verification:old.verification,city:old.city}});else await db.advocateProfile.delete({where:{user_id}});}finally{await db.$disconnect();}};}
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:120000,args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
  async function login(role){const p=await(await browser.createBrowserContext()).newPage();pages.push([role,p]);p.on('pageerror',e=>errors.push({role,message:e.message}));p.on('dialog',d=>d.accept());await p.setViewport({width:role==='admin'?1440:430,height:1000});await goto(p,role==='admin'?panel+'/sign-in':mobile+'/login');if(role==='admin'){await p.type('input[name=email]','demo-admin@legalitt.invalid');await p.type('input[name=password]',password);await click(p,'Sign in');await p.waitForFunction(()=>location.pathname==='/legal-notices');}else{await p.type('input[placeholder="Email / Mobile No"]',`demo-${role}@legalitt.invalid`);await p.type('input[aria-label=Password]',password);await click(p,'Continue');await p.waitForFunction(()=>location.pathname.endsWith('/home')||location.pathname.endsWith('/dashboard'));}return p;}
  const client=await login('client'),adv=await login('advocate'),admin=await login('admin');
  await goto(adv,mobile+'/advocate/availability');await text(adv,'Weekly schedule');
  const oldHours=await api.advocate.request('/consultations/availability');
  // Publish hours through the actual advocate screen. Existing intervals are retained.
  for(const name of ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']){await click(adv,name);const body=await adv.evaluate(()=>document.body.innerText);if(body.includes('No bookable hours on this day.'))await click(adv,'Add time period');}
  await click(adv,'Save availability');await text(adv,'Weekly availability saved.');await shot(adv,'advocate-weekly-availability');
  save('availability',{previous_version:oldHours.version,published_version:(await api.advocate.request('/consultations/availability')).version});
  const view=(role,id)=>api[role].request(`/consultations/${id}`);
  const openAdv=id=>goto(adv,mobile+`/advocate/consultation/${id}/room?caseId=${id}`);
  async function approve(id,service){await goto(admin,panel+`/services/${service}/cases/${id}`);await text(admin,'awaiting approval');await admin.waitForSelector('iframe.fir-pdf');await admin.waitForFunction(()=>[...document.querySelectorAll('input[type=checkbox]')].some(e=>!e.disabled));const boxes=await admin.$$('input[type=checkbox]');for(const box of boxes)if(!await box.evaluate(e=>e.disabled))await box.click();const pending=(await view('admin',id)).reports.find(r=>r.status==='submitted');await shot(admin,service+'-admin-review-v'+pending.version);await click(admin,`Approve & release report v${pending.version}`);await text(admin,'No report currently awaits approval.');return pending;}
  async function brief(id,service,kind){
   await openAdv(id);await fill(adv,'Internal notes','TEST PRIVATE advocate preparation note. Never client-facing.');await click(adv,'Save internal notes');
   await eventually(()=>view('advocate',id),v=>v.internal_notes.includes('TEST PRIVATE'),'internal notes saved');
   await text(adv,kind==='completion'?'Completion summary':'Client consultation brief');
   await fill(adv,'Key points discussed','TEST ONLY: discussed the supplied facts and available documents. No real legal advice is being provided.');
   await fill(adv,'Next steps','TEST ONLY: preserve the relevant correspondence and consult about court options.');
   await fill(adv,'Outcome','TEST ONLY: client understands the agreed next step.');
   const before=(await view('advocate',id)).reports[0]?.version??0;await click(adv,'Save report version');
   const saved=await eventually(()=>view('advocate',id),v=>v.reports[0]?.version>before,'report saved');
   const r=saved.reports[0];await click(adv,`Generate PDF & send v${r.version} to admin`);await text(adv,'Awaiting admin approval');
   const pending=(await view('admin',id)).reports[0];await assert.rejects(api.client.documentUrl(pending.document_id),{status:404});assert.doesNotMatch(JSON.stringify(await view('client',id)),/TEST PRIVATE/);
   const submitted=await approve(id,service),url=await api.client.documentUrl(submitted.document_id),bytes=Buffer.from(await(await fetch(url.url)).arrayBuffer());
   const extracted=await require('../apps/api/tests/helpers/pdf-text.cjs').readPdfText(bytes);
   for(const part of ['TEST ONLY: discussed','preserve the relevant','client understands'])assert.ok(extracted.text.includes(part),part);assert.ok(!extracted.text.includes('TEST PRIVATE'));
   fs.writeFileSync(path.join(out,`${service}-${kind}.pdf`),bytes);return {version:submitted.version,document_id:submitted.document_id,sha256:createHash('sha256').update(bytes).digest('hex')};
  }
  for(const service of ['legal_advice','district_court','high_court']){
   const root=service==='legal_advice'?'/legal-advice':'/services/'+service.replaceAll('_','-');
   const resume=process.env.CONSULTATION_RESUME==='1'&&service==='legal_advice';let id;
   if(resume){id=JSON.parse(fs.readFileSync(path.join(out,service+'-case.json'))).case_id;activeCase=id;}
   else{
   await goto(client,mobile+root);await click(client,'Book consultation');await client.waitForFunction(()=>!!new URL(location.href).searchParams.get('caseId'));id=new URL(client.url()).searchParams.get('caseId');activeCase=id;save(service+'-case',{case_id:id});
   if(service!=='legal_advice'){await click(client,'Civil');await click(client,'Continue to details');}
   for(const [label,value]of [['Full Name','TEST ONLY Consultation Client'],['Mobile Number','2025550101'],['Email Address','consultation@example.invalid']])await fill(client,label,value);
   // An idle save followed by a blur with no edits must not jam later autosaves.
   await text(client,'Saved');await delay(600);await fill(client,'Email Address','consultation@example.invalid');
   if(service!=='legal_advice'){
    await fill(client,'Case Title','TEST ONLY Client v Example Party');await fill(client,'Other Party Name','TEST ONLY Example Party');await fill(client,'Your City','Mumbai');await click(client,'State');await fill(client,'Search state','Maharashtra');await click(client,'Maharashtra');await click(client,'District');await fill(client,'Search district','Mumbai');await click(client,'Mumbai');if(service==='high_court')await click(client,'I don’t know the exact bench');
   }
   const narrative='TEST ONLY synthetic consultation walkthrough. A fictional civil matter needs advice. No real dispute or filing.';
   await fill(client,service==='legal_advice'?'Brief Description of Concern':'What happened?',narrative);await click(client,'Continue to documents');await text(client,'No documents uploaded yet.');await client.reload({waitUntil:'networkidle0'});
   const filing=(await api.client.case(id)).details;assert.equal(filing.full_name,'TEST ONLY Consultation Client');assert.equal(filing.description,narrative,'Narrative persisted after idle save');if(service!=='legal_advice'){assert.equal(filing.state,'Maharashtra');assert.equal(filing.district,'Mumbai');}
   await shot(client,service+'-documents-empty');
   const pdf=await require('../apps/api/node_modules/pdf-lib').PDFDocument.create();pdf.addPage().drawText('TEST ONLY consultation supporting document. No real client data.');const bytes=await pdf.save(),file=path.join(out,service+'-supporting.pdf');fs.writeFileSync(file,bytes);
   if(deployed){const[chooser]=await Promise.all([client.waitForFileChooser(),click(client,'Upload document')]);await chooser.accept([file]);await text(client,service+'-supporting.pdf');await text(client,'1 pages');}
   else{const ticket=await api.client.presign({case_id:id,kind:'supporting_document',filename:service+'-supporting.pdf',mime:'application/pdf'});await api.client.upload(ticket,new Blob([bytes],{type:'application/pdf'}));await client.reload({waitUntil:'networkidle0'});await text(client,service+'-supporting.pdf');}
   await click(client,'Continue');await text(client,'Choose your advocate');await click(client,sessions.advocate.user.name);
   const day=new Date(Date.now()+86400_000+330*60_000).getUTCDate();await click(client,String(day));await text(client,'Available time slots');await client.waitForFunction(()=>[...document.querySelectorAll('[role=radio]')].some(e=>/\d{1,2}:\d{2}/.test(e.textContent)&&!e.textContent.includes('Booked')&&e.getAttribute('aria-disabled')!=='true'));
   const slot=await client.evaluate(()=>[...document.querySelectorAll('[role=radio]')].find(e=>/\d{1,2}:\d{2}/.test(e.textContent)&&!e.textContent.includes('Booked')&&e.getAttribute('aria-disabled')!=='true').textContent.trim());await click(client,slot);await shot(client,service+'-booking');await click(client,'Reserve time & review');await text(client,'Check your request');await text(client,'TEST ONLY synthetic consultation');await click(client,'I confirm my information is correct and agree to submit this request.');await shot(client,service+'-review');await click(client,'Continue to payment');await text(client,'Total amount to pay');await text(client,'885.00');await shot(client,service+'-payment');await click(client,'Pay now (demo)');await text(client,'Your consultation is booked.');
   await goto(admin,panel+`/services/${service}/cases/${id}`);await text(admin,'Booked appointment');await click(admin,`Assign booked advocate: ${sessions.advocate.user.name}`);await eventually(()=>api.client.case(id),v=>v.status==='assigned','admin assignment');await text(admin,'No report currently awaits approval.');
   }
   await goto(client,mobile+root+(service==='legal_advice'?'/track':'/case-details')+`?step=track&caseId=${id}`);
   const session=(await view('client',id)).session;await click(client,session.status==='scheduled'?'Join chat consultation':'Open case chat');await client.waitForSelector('input[aria-label="Type a message…"]');await openAdv(id);
   if(session.status==='scheduled'){await click(adv,'Start consultation');await eventually(()=>view('advocate',id),v=>v.session.status==='in_progress','session started');}
   await click(adv,'Open case chat');await text(adv,'End consultation & prepare brief');await text(client,'Session: in progress');
   await fill(client,'Type a message…','TEST ONLY client asks for advice on the fictional matter.');await click(client,'Send');
   await text(adv,'TEST ONLY client asks');const input=await adv.$('textarea[placeholder="Type a message…"],input[placeholder="Type a message…"]');assert.ok(input);await input.type('TEST ONLY advocate discusses the fictional options and next steps.');await click(adv,'Send');await text(client,'TEST ONLY advocate discusses');await shot(client,service+'-client-chat');await shot(adv,service+'-advocate-chat');await click(adv,'End consultation & prepare brief');await eventually(()=>view('advocate',id),v=>v.session.status==='completed','session ended');
   await text(client,'Session: completed');const consultation=await brief(id,service,'consultation');let completion,quote;
   if(service!=='legal_advice'){
    await openAdv(id);await fill(adv,'Your base fee (rupees)','1000');await fill(adv,'Scope of representation','TEST ONLY preparation and representation through the first fictional hearing.');await fill(adv,'Exclusions (write None if none)','Court fees and expenses are separate and paid offline.');await click(adv,'Send representation quote');await text(adv,'Quote v1');
    await goto(client,mobile+root+(service==='legal_advice'?'/track':'/case-details')+`?step=track&caseId=${id}`);await click(client,'Review full price & accept quote');await text(client,'1,475.00');await shot(client,service+'-representation-checkout');await click(client,'Accept quote & pay (demo)');await text(client,'Your representation payment is complete.');quote=(await view('client',id)).quotes[0];assert.equal(quote.status,'paid');
    await openAdv(id);for(const stage of ['preparation','filed','hearing','decision']){await click(adv,stage);await fill(adv,'Client-facing update',`TEST ONLY offline ${stage} milestone. No actual court filing or hearing occurred.`);await fill(adv,'Court / bench','TEST ONLY fictional court');await fill(adv,'Court case number','TEST-COURT-2026');await fill(adv,'Next step','TEST ONLY preserve the synthetic order.');if(stage==='hearing'){await fill(adv,'Hearing date & time (YYYY-MM-DD HH:mm IST)','2026-11-10 11:00');await fill(adv,'Court room','TEST Room 3');await click(adv,`Share ${service}-supporting.pdf`);}const count=(await view('advocate',id)).progress.length;await click(adv,'Publish court update');await eventually(()=>view('advocate',id),v=>v.progress.length>count,'court update');}
    completion=await brief(id,service,'completion');
   }
   const final=await view('client',id);assert.equal(final.case.status,'completed');assert.equal(final.payments.length,service==='legal_advice'?1:2);
   await goto(client,mobile+root+(service==='legal_advice'?'/track':'/case-details')+`?step=track&caseId=${id}`);await text(client,'Your case is complete.');await shot(client,service+'-completed');await click(client,`Download approved PDF v${final.reports[0].version}`);
   await assert.rejects(api['client-isolation'].case(id),{status:404});await assert.rejects(api['client-isolation'].request(`/consultations/${id}`),{status:404});const other=await api['client-isolation'].createCase({service_code:service});await assert.rejects(api.client.case(other.id),{status:404});await assert.rejects(api.client.request(`/consultations/${other.id}`),{status:404});
   results.push({service,case_id:id,reference:final.case.reference,status:final.case.status,consultation,completion,quote:quote?{version:quote.version,base_amount_paise:quote.base_amount_paise,status:quote.status}:null,payments:final.payments,isolation:{other_client_to_case:404,client_to_other_case:404,other_case_id:other.id}});save('verification',{deployed,results,browser_errors:errors});
  }
  assert.deepEqual(errors,[]);console.log('PASS all three consultation service browser journeys');
 }catch(e){console.error(e.stack);save('failure',{case_id:activeCase,error:e.message});for(const [role,p]of pages){await shot(p,role+'-failure').catch(()=>{});fs.writeFileSync(path.join(out,role+'-failure.txt'),await p.evaluate(()=>document.body.innerText).catch(()=>''));}throw e;}
 finally{await browser?.close();for(const s of servers)s.close();apiProcess?.kill();await restoreProfiles?.();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
