// Uses existing demo credentials in memory only. Synthetic cases; simulated payment.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {createServer}=require('node:http'),{spawn}=require('node:child_process'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {PDFDocument}=require('../apps/api/node_modules/pdf-lib');
process.loadEnvFile('apps/api/.env.local');
const deployed=process.env.FIR_DEPLOYED==='1',base=deployed?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3003';
const mobile=deployed?'https://legalitt-5.vercel.app':'http://localhost:8083',adminWeb=deployed?'https://legalitt-admin-panel.vercel.app':'http://localhost:5174';
const out=path.resolve('reports/fir-draft-2026-11-10',deployed?'deployed':'local');fs.mkdirSync(out,{recursive:true});
const json=(name,data)=>fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page,text){await page.waitForFunction(text=>[...document.querySelectorAll('[role="button"],[role="checkbox"],[role="radio"],button,a')].some(e=>e.getClientRects().length&&e.textContent.trim()===text&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'),{timeout:60000},text);const h=await page.evaluateHandle(text=>[...document.querySelectorAll('[role="button"],[role="checkbox"],[role="radio"],button,a')].find(e=>e.getClientRects().length&&e.textContent.trim()===text&&!e.disabled&&e.getAttribute('aria-disabled')!=='true'),text);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await h.asElement().click();await h.dispose();if(text==='Done')await page.waitForFunction(()=>![...document.querySelectorAll('input')].some(e=>['Complainant name','Accused name','Witness name'].includes(e.getAttribute('aria-label'))&&e.getClientRects().length),{timeout:60000});}
async function selectorClick(page,selector){await page.waitForSelector(selector,{visible:true,timeout:60000});const h=await page.$(selector);await h.evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await h.click();await h.dispose();}
async function fill(page,label,value){
 const visible=label=>[...document.querySelectorAll('input,textarea')].find(e=>e.getAttribute('aria-label')===label&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));
 await page.waitForFunction(visible,{timeout:60000},label);const h=await page.evaluateHandle(visible,label);
 await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await h.asElement().click({clickCount:3});await h.asElement().type(value);assert.equal(await h.asElement().evaluate(e=>e.value),value,'Entered field: '+label);await h.dispose();
}
async function text(page,value){await page.waitForFunction(value=>document.body.innerText.includes(value),{timeout:60000},value);}
function serve(root,port){const server=createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));});return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));}
async function main(){let browser,apiProcess,restoreProfile;const servers=[],pages=[];let caseId;
 try{
  if(!deployed){assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));assert.ok(!process.env.DATABASE_SECRET_ARN);
   const db=await require('../apps/api/dist/src/database').createDatabaseClient();try{await require('../apps/api/dist/prisma/seed-pricing').seedConfirmedPricing(db);}finally{await db.$disconnect();}
   apiProcess=spawn(process.execPath,['dist/src/main.js'],{cwd:path.resolve('apps/api'),env:{...process.env,PORT:'3003',CORS_ORIGINS:mobile+','+adminWeb},stdio:'ignore',windowsHide:true});
   servers.push(await serve(path.resolve('apps/mobile/dist/fir-verification'),8083),await serve(path.resolve('apps/admin/dist/fir-verification'),5174));
   for(let i=0;i<60;i++){if(apiProcess.exitCode!==null)throw new Error('Local API failed to start');try{if((await fetch(base+'/health')).ok)break;}catch{}await delay(1000);}
  }
  const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={},clients={};
  for(const role of ['client','advocate','admin','client-isolation']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);sessions[role]=await r.json();clients[role]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[role].tokens});}
  if(!deployed){
   // Isolated local test fixture only. Authentication sync does not run the dev
   // workload/profile seed. Never rotate credentials or modify deployed profiles.
   const db=await require('../apps/api/dist/src/database').createDatabaseClient(),user_id=sessions.advocate.user.id;
   const previous=await db.advocateProfile.findUnique({where:{user_id}});
   await db.advocateProfile.upsert({where:{user_id},create:{user_id,verification:'approved',city:'Indore'},update:{verification:'approved',city:'Indore'}});
   restoreProfile=async()=>{try{if(previous)await db.advocateProfile.update({where:{user_id},data:{verification:previous.verification,city:previous.city}});else await db.advocateProfile.delete({where:{user_id}});}finally{await db.$disconnect();}};
  }
  browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:90000});
  const errors=[];
  async function login(role){const page=await(await browser.createBrowserContext()).newPage();pages.push([role,page]);page.on('dialog',async dialog=>{console.log('Browser confirmation: '+dialog.type());await dialog.accept();});page.on('pageerror',e=>errors.push({role,message:e.message}));await page.setViewport({width:role==='admin'?1440:430,height:1100});await page.goto((role==='admin'?adminWeb+'/sign-in':mobile+'/login'),{waitUntil:'networkidle0'});if(role==='admin'){await page.type('input[name="email"]',`demo-${role}@legalitt.invalid`);await page.type('input[name="password"]',password);await click(page,'Sign in');await page.waitForFunction(()=>location.pathname==='/legal-notices');}else{await page.type('input[placeholder="Email / Mobile No"]',`demo-${role}@legalitt.invalid`);await page.type('input[aria-label="Password"]',password);await click(page,'Continue');await page.waitForFunction(()=>location.pathname.endsWith('/home')||location.pathname.endsWith('/dashboard'));}return page;}
  const client=await login('client');await client.goto(mobile+'/fir',{waitUntil:'networkidle0'});await click(client,'Start FIR Request');await text(client,'Quick Submission');
  caseId=new URL(client.url()).searchParams.get('caseId');json('case-created.json',{case_id:caseId});
  await fill(client,'Full Name','TEST ONLY FIR Complainant');await fill(client,'Mobile Number','2025550101');await click(client,'Theft');await selectorClick(client,'[aria-label="State"]');await fill(client,'Search state','Maharashtra');await click(client,'Maharashtra');await selectorClick(client,'[aria-label="District"]');await fill(client,'Search district','Mumbai');await click(client,'Mumbai');await fill(client,'Police Station','TEST ONLY Station');await click(client,'Continue');await text(client,'Incident Details');
  await fill(client,'Incident Date','10/11/2026');await fill(client,'Incident Time','09:00');await fill(client,'Incident Location','TEST ONLY synthetic location');await fill(client,'What happened','TEST ONLY synthetic verification. No real offence or police filing.');await click(client,'Continue to People Involved');await text(client,'People Involved');
  await selectorClick(client,'[aria-label="Edit complainant"]');
  for(const [label,value]of [['Registered residence','TEST Registered Street 11'],['Father’s name','TEST Father Rao'],['Age','37'],['Gender','Woman'],['Occupation','TEST Teacher'],['Present address','TEST Present Street 22']])await fill(client,label,value);
  await click(client,'Done');console.log('Client personal facts saved; reloading');await client.reload({waitUntil:'networkidle0'});await text(client,'TEST Father Rao');await text(client,'TEST Present Street 22');console.log('Client personal facts resumed');
  await click(client,'+ Add Accused / Opposite Party');await click(client,'☐ Identity unknown');await fill(client,'Other known details','TEST unknown blue coat');await click(client,'Done');
  await click(client,'+ Add Witness');await fill(client,'Witness name','TEST Witness One');await fill(client,'Contact number','2025550102');await fill(client,'Witness role / relationship','TEST passerby');await fill(client,'When present','TEST at start');await fill(client,'Statement note','TEST original witness note');await click(client,'Done');
  await client.screenshot({path:path.join(out,'client-personal-facts.png'),fullPage:true});await click(client,'Continue to Evidence & Documents');await text(client,'Documents & Evidence');
  // Upload through the same real API/storage pipeline; browser checks uploaded evidence.
  for(const [pages,kind,filename]of [[25,'supporting_document','TEST-FIR-25-pages.pdf'],[1,'supporting_document','TEST-FIR-extra-page.pdf']]){
   const pdf=await PDFDocument.create();for(let i=0;i<pages;i++)pdf.addPage();const bytes=await pdf.save();const ticket=await clients.client.presign({case_id:caseId,kind,filename,mime:'application/pdf'});await clients.client.upload(ticket,new Blob([bytes],{type:'application/pdf'}));
  }
  await client.reload({waitUntil:'networkidle0'});await text(client,'TEST-FIR-25-pages.pdf');await text(client,'TEST-FIR-extra-page.pdf');await click(client,'Continue Draft');await text(client,'Review Your Request');await click(client,'Proceed To Pay');await text(client,'₹1,498.53');await client.screenshot({path:path.join(out,'client-quote.png'),fullPage:true});await click(client,'Pay using UPI App');await text(client,'Paid ₹1,498.53');
  console.log('PASS client intake, uploaded 26 pages, quote and simulated payment');
  const admin=await login('admin');await admin.goto(adminWeb+'/services/fir_draft/cases/'+caseId,{waitUntil:'networkidle0'});await click(admin,'+ Assign');await admin.waitForSelector('.advocate-option');const chosen=await admin.$(`[aria-label="Assign to ${sessions.advocate.user.name}"]`);assert.ok(chosen);await chosen.click();await text(admin,sessions.advocate.user.name);
  const adv=await login('advocate');await adv.goto(mobile+'/advocate/fir/draft?caseId='+caseId,{waitUntil:'networkidle0'});let holdContext=true,releaseContext,failSave=false;
  await adv.setRequestInterception(true);adv.on('request',request=>{
   if(holdContext&&request.url().endsWith('/draft-context')){releaseContext=()=>request.continue();return;}
   if(failSave&&request.method()==='POST'&&request.url().endsWith('/drafts')){failSave=false;return request.respond({status:503,contentType:'application/json',headers:{'Access-Control-Allow-Origin':mobile},body:JSON.stringify({message:'TEST transient save failure. Retry Save Draft.'})});}
   return request.continue();
  });
  await click(adv,'Accept Request');await text(adv,'Loading saved draft and client filing');await adv.screenshot({path:path.join(out,'advocate-loading.png'),fullPage:true});holdContext=false;assert.ok(releaseContext);await releaseContext();await text(adv,'FORM I');await text(adv,'No saved draft yet');await text(adv,'From client’s filing');await text(adv,'TEST Father Rao');
  assert.equal(await adv.$('input[aria-label="Father’s name"]'),null);
  await text(adv,'PDF not ready');await text(adv,'Add at least one complete legal section.');await adv.screenshot({path:path.join(out,'advocate-incomplete.png'),fullPage:true});
  await fill(adv,'Distance / direction from police station','TEST 2 km north');
  for(const label of ['Alias / identifying information','Phone','Other details','Vehicle used','Suspected reason / motive']){
   if(label==='Other details')continue;
   await selectorClick(adv,'[aria-label="Accused 1: '+label+': Unknown"]');
  }
  await click(adv,'Add Another Accused');await fill(adv,'Accused 2 name','TEST Second Suspect');
  for(const [label,value]of [['Alias / identifying information','TEST second alias'],['Phone','2025550105'],['Other details','TEST second jacket'],['Vehicle used','TEST bicycle'],['Suspected reason / motive','TEST motive recorded']])await fill(adv,'Accused 2: '+label,value);
  await click(adv,'Add Legal Section');for(const [label,value]of [['act','TEST Act (synthetic)'],['section','TEST 123'],['description','TEST manually selected provision']])await fill(adv,'Legal section 1: '+label,value);
  await fill(adv,'Statement of Facts','TEST ONLY advocate edited narrative. हिंदी कथन। No real offence or police filing.');
  await fill(adv,'Witness 1: Statement note','TEST edited witness note');await click(adv,'Add Witness');await fill(adv,'Witness 2 name','TEST Witness Two');
  for(const [label,value]of [['Phone','2025550106'],['Role / relationship','TEST shopkeeper'],['When present','TEST at end'],['Statement note','TEST second witness note']])await fill(adv,'Witness 2: '+label,value);
  await selectorClick(adv,'[aria-label="Include TEST-FIR-extra-page.pdf"]');await selectorClick(adv,'[aria-label="Include TEST-FIR-25-pages.pdf"]');
  await click(adv,'Save Draft');await text(adv,'Saved v1');await adv.screenshot({path:path.join(out,'advocate-structured-draft.png'),fullPage:true});
  const stale=await login('advocate');await stale.goto(mobile+'/advocate/fir/draft?caseId='+caseId,{waitUntil:'networkidle0'});await text(stale,'Saved v1');
  await fill(adv,'Statement of Facts','TEST ONLY advocate final edited narrative. हिंदी कथन। No real offence or police filing.');failSave=true;await click(adv,'Save Draft');await text(adv,'TEST transient save failure');assert.ok((await adv.$eval('[aria-label="Statement of Facts"]',e=>e.value)).includes('final edited narrative'));await adv.screenshot({path:path.join(out,'advocate-save-error.png'),fullPage:true});await click(adv,'Save Draft');await text(adv,'Saved v2');
  await fill(stale,'Statement of Facts','TEST unsaved stale tab text retained');await click(stale,'Save Draft');await text(stale,'A newer FIR draft was saved');assert.equal(await stale.$eval('[aria-label="Statement of Facts"]',e=>e.value),'TEST unsaved stale tab text retained');await stale.screenshot({path:path.join(out,'advocate-stale-save.png'),fullPage:true});
  await click(adv,'Generate PDF Preview');await text(adv,'Open PDF Preview');
  const draftContext=await clients.advocate.firDraftContext(caseId),pdfPreview=await clients.advocate.previewFirDraft(caseId,draftContext.latest_draft_id);
  const previewBytes=Buffer.from(pdfPreview.pdf_base64,'base64');fs.writeFileSync(path.join(out,'preview.pdf'),previewBytes);
  const pdfText=await require('../apps/api/tests/helpers/pdf-text.cjs').readPdfText(previewBytes);
  for(const value of ['TEST Father Rao','TEST Present Street 22','TEST Registered Street 11','TEST 2 km north','Unknown suspect','TEST Second Suspect','TEST second alias','TEST bicycle','TEST manually selected provision','TEST ONLY advocate final edited narrative.','हिंदी कथन।','TEST edited witness note','TEST Witness Two','TEST second witness note'])assert.ok(pdfText.text.includes(value),value);
  assert.ok(pdfText.text.indexOf('TEST-FIR-extra-page.pdf')<pdfText.text.indexOf('TEST-FIR-25-pages.pdf'));
  assert.ok(!pdfText.text.includes('Identity document:'));assert.equal((await clients.client.case(caseId)).documents.filter(d=>d.kind==='id_proof').length,0);
  await click(adv,'Send for Admin Approval');await text(adv,'Awaiting Admin Approval');await adv.screenshot({path:path.join(out,'advocate-waiting.png'),fullPage:true});
  const pending=await clients.admin.adminCase(caseId),approval=pending.approval;assert.ok(approval);assert.equal(pending.sub_status,'awaiting_admin_approval');
  await assert.rejects(clients.advocate.sendFirDraft(caseId,approval.draft_id),{status:409});await assert.rejects(clients.client.approveFirDraft(caseId,approval.draft_id),{status:403});
  await assert.rejects(clients.client.documentUrl(approval.document_id),{status:404});await assert.rejects(clients['client-isolation'].case(caseId),{status:404});
  const isolation=await clients['client-isolation'].createCase({service_code:'fir_draft'});await assert.rejects(clients.client.case(isolation.id),{status:404});
  await client.reload({waitUntil:'networkidle0'});await text(client,'Awaiting Admin Approval');assert.ok(!(await client.evaluate(()=>document.body.innerText)).includes('View FIR Draft'));
  const preview=await clients.admin.adminDocumentPreview(approval.document_id),original=Buffer.from(await(await fetch(preview.url)).arrayBuffer());fs.writeFileSync(path.join(out,'submitted-draft.pdf'),original);assert.deepEqual(original,previewBytes);
  await admin.goto(adminWeb+'/services/fir_draft/cases?queue=approval',{waitUntil:'networkidle0'});await text(admin,pending.reference);await text(admin,'Only action: approve. No rejection path.');await admin.screenshot({path:path.join(out,'admin-waiting-queue.png'),fullPage:true});
  await admin.goto(adminWeb+'/services/fir_draft/cases/'+caseId,{waitUntil:'networkidle0'});await text(admin,'Original intake');await text(admin,'TEST ONLY Station');await admin.waitForSelector('iframe[title="Submitted FIR draft"]');await admin.waitForFunction(()=>!document.querySelector('.fir-confirm input').disabled);await admin.screenshot({path:path.join(out,'admin-review.png'),fullPage:true});await admin.click('.fir-confirm input');await click(admin,'Approve and send to client');await admin.waitForFunction(()=>!document.querySelector('[aria-label="FIR draft approval"]'));await text(admin,'Completed');
  const done=await clients.client.case(caseId);assert.equal(done.status,'completed');assert.equal(done.drafts.length,1);assert.equal(done.drafts[0].id,approval.draft_id);assert.equal(done.client_fees.total_paise,'149853');
  const finalUrl=await clients.client.documentUrl(approval.document_id),final=Buffer.from(await(await fetch(finalUrl.url)).arrayBuffer());assert.deepEqual(final,original);
  await client.reload({waitUntil:'networkidle0'});await text(client,'Your FIR Draft Is Ready');await text(client,'View FIR Draft');await client.screenshot({path:path.join(out,'client-completed.png'),fullPage:true});
  await adv.reload({waitUntil:'networkidle0'});await text(adv,'FIR Draft Completed');assert.deepEqual(errors,[]);
  let historicalPdfUnchanged=null;
  if(deployed){const previous=require('../reports/fir-approval-2026-11-10/deployed/verification.json'),old=await clients.client.case(previous.case_id);assert.equal(old.status,'completed');assert.equal(old.approval.document_id,previous.approval.document_id);const url=await clients.client.documentUrl(old.approval.document_id),bytes=Buffer.from(await(await fetch(url.url)).arrayBuffer());assert.equal(createHash('sha256').update(bytes).digest('hex'),previous.pdf_sha256);historicalPdfUnchanged={case_id:old.id,sha256:previous.pdf_sha256};}
  json('verification.json',{historical_pdf_unchanged:historicalPdfUnchanged,case_id:caseId,reference:pending.reference,approval,total_paise:done.client_fees.total_paise,completed_status:done.status,pdf_sha256:createHash('sha256').update(final).digest('hex'),second_submission:409,client_approval:403,unapproved_client_pdf:404,isolation:{other_client_to_case:404,client_to_other_case:404,other_case_id:isolation.id},browser_errors:errors,optional_id:{uploaded:0,submission:true,pdf:true},client_facts_read_only:true,stale_save:409,preview_equals_released_pdf:true,editable_values_in_actual_pdf:true,screen_states:{loading:true,empty:true,partial:true,error_and_retry:true,ideal:true}});
  console.log('PASS advocate draft → admin frozen-version review → client exact PDF → completed; duplicate send and private access refused');
 }catch(e){console.error('Original failure: '+e.stack);for(const [role,page]of pages)if(!page.isClosed()){await page.screenshot({path:path.join(out,role+'-failure.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(out,role+'-failure.txt'),await page.evaluate(()=>document.body.innerText));}throw e;}
 finally{await browser?.close();for(const server of servers)server.close();apiProcess?.kill();await restoreProfile?.();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
