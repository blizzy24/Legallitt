// Intake-only browser proof. Existing demo credentials stay in memory.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('node:http'),{spawn}=require('node:child_process'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const deployed=process.env.FIR_DEPLOYED==='1',base=deployed?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3003';
const mobile=deployed?'https://legalitt-5.vercel.app':'http://localhost:8083';
const out=path.resolve('reports/fir-intake-2026-11-10',deployed?'deployed':'local');fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function text(page,value){await page.waitForFunction(value=>document.body.innerText.includes(value),{timeout:45000},value);}
async function click(page,label,aria=false){
 const find=(label,aria)=>[...document.querySelectorAll('[role="button"],[role="checkbox"],button,a')].find(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&(aria?e.getAttribute('aria-label'):e.textContent.trim())===label&&!e.disabled&&e.getAttribute('aria-disabled')!=='true');
 await page.waitForFunction(find,{timeout:45000},label,aria);const h=await page.evaluateHandle(find,label,aria);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await h.asElement().click();await h.dispose();
}
async function fill(page,label,value){
 const find=label=>[...document.querySelectorAll('input,textarea')].find(e=>e.getAttribute('aria-label')===label&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));
 await page.waitForFunction(find,{timeout:45000},label);const h=await page.evaluateHandle(find,label);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await delay(350);await h.asElement().click({clickCount:3});await h.asElement().press('Backspace');await h.asElement().type(value);await h.asElement().press('Tab');await h.dispose();
}
async function saved(page){await page.waitForFunction(()=>[...document.querySelectorAll('[role="status"]')].some(e=>e.textContent.includes(' · Saved')),{timeout:45000});}
function serve(root,port){const server=createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));});return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));}
async function main(){let browser,api,server,page;const proof={};
 try{
  if(!deployed){assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));assert.ok(!process.env.DATABASE_SECRET_ARN);
   api=spawn(process.execPath,['dist/src/main.js'],{cwd:path.resolve('apps/api'),env:{...process.env,PORT:'3003',CORS_ORIGINS:mobile},stdio:'ignore',windowsHide:true});
   server=await serve(path.resolve('apps/mobile/dist/fir-verification'),8083);
   for(let i=0;i<60;i++){if(api.exitCode!==null)throw new Error('Local API failed to start');try{if((await fetch(base+'/health')).ok)break;}catch{}await delay(1000);}
  }
  const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),clients={};
  for(const role of ['client','client-isolation','admin']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);const session=await r.json();clients[role]=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});}
  browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-first-run'],defaultViewport:{width:430,height:932,deviceScaleFactor:1}});
  page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(mobile+'/login',{waitUntil:'networkidle0'});await page.type('input[placeholder="Email / Mobile No"]','demo-client@legalitt.invalid');await page.type('input[aria-label="Password"]',password);await click(page,'Continue');await page.waitForFunction(()=>location.pathname.endsWith('/home'));
  await page.goto(mobile+'/fir',{waitUntil:'networkidle0'});await click(page,'Start FIR Request');await text(page,'Quick Submission');
  const id=new URL(page.url()).searchParams.get('caseId');proof.case_id=id;fs.writeFileSync(path.join(out,'case-created.json'),JSON.stringify({case_id:id})+'\n');
  await click(page,'Continue');await text(page,'Enter your full name.');assert.ok(page.url().includes('/step1'));
  await fill(page,'Full Name','TEST ONLY Intake Complainant');await saved(page);await page.reload({waitUntil:'networkidle0'});await page.waitForFunction(()=>document.querySelector('input[aria-label="Full Name"]')?.value==='TEST ONLY Intake Complainant');
  proof.partial_autosave_reload=true;
  let failSave=true,holdLoad=false,releaseLoad;await page.setRequestInterception(true);
  page.on('request',r=>{if(r.method()==='PATCH'&&r.url().endsWith('/fir/'+id+'/intake')&&failSave)return void r.respond({status:503,headers:{'access-control-allow-origin':mobile},contentType:'application/json',body:JSON.stringify({message:'TEST save unavailable. Retry saving.'})});if(holdLoad&&r.method()==='GET'&&r.url().endsWith('/cases/'+id)){releaseLoad=()=>r.continue();return;}void r.continue();});
  await fill(page,'Mobile Number','2025550100');await text(page,'TEST save unavailable');assert.equal(await page.$eval('input[aria-label="Mobile Number"]',e=>e.value),'2025550100');failSave=false;await click(page,'Retry save');await saved(page);proof.save_error_retry=true;
  await fill(page,'Email Address','fir-intake@example.invalid');await click(page,'Theft');
  await click(page,'State',true);await fill(page,'Search state','no such state');await text(page,'No matching state');await fill(page,'Search state','Maharashtra');await click(page,'Maharashtra',true);
  await click(page,'District',true);await fill(page,'Search district','Mumbai');await click(page,'Mumbai',true);await fill(page,'Police Station','TEST ONLY free text station');await saved(page);
  await click(page,'State',true);await fill(page,'Search state','Goa');await click(page,'Goa',true);
  assert.equal(await page.$eval('input[aria-label="Police Station"]',e=>e.value),'');await text(page,'[ Select district ]');
  await click(page,'State',true);await fill(page,'Search state','Maharashtra');await click(page,'Maharashtra',true);await click(page,'District',true);await fill(page,'Search district','Mumbai');await click(page,'Mumbai',true);await fill(page,'Police Station','TEST ONLY free text station');await saved(page);proof.state_change_clears_dependents=true;
  await page.screenshot({path:path.join(out,'step1.png'),fullPage:true});await click(page,'Continue');await text(page,'Tell Us What Happened');
  await fill(page,'Incident Date','31/02/2026');await fill(page,'Incident Time','25:99');await click(page,'Continue to People Involved');await text(page,'Enter a valid date');await text(page,'Enter a valid time');
  await fill(page,'Incident Date','10/11/2026');await fill(page,'Incident Time','09:30');await fill(page,'Incident Location','TEST ONLY public location');await fill(page,'What happened','TEST ONLY narrative entered by the client. No real incident or police filing.');await fill(page,'Additional details','TEST ONLY additional context retained on review.');await saved(page);
  // A second session edits the same revision. The open form must keep its own unsaved input.
  const before=await clients.client.case(id);await clients.client.saveFirIntake(id,{...before.details,incident:{...before.details.incident,additional:'TEST other session saved context'}},before.updated_at);
  await fill(page,'Additional details','TEST local unsaved conflict text');await text(page,'changed in another session');assert.equal(await page.$eval('textarea[aria-label="Additional details"]',e=>e.value),'TEST local unsaved conflict text');await click(page,'Reload saved intake…');await text(page,'Copy any entries');await click(page,'Reload and replace unsaved entries');await saved(page);
  assert.equal(await page.$eval('textarea[aria-label="Additional details"]',e=>e.value),'TEST other session saved context');proof.concurrent_edit_conflict=true;
  await fill(page,'Additional details','TEST ONLY additional context retained on review.');await saved(page);await page.screenshot({path:path.join(out,'step2.png'),fullPage:true});await click(page,'Continue to People Involved');await text(page,'No accused or suspects added.');
  await click(page,'Edit complainant',true);await fill(page,'Registered residence','TEST ONLY residence');for(const [label,value]of [['Father’s name','TEST Father'],['Age','37'],['Gender','Woman'],['Occupation','TEST Teacher'],['Present address','TEST Present Address']])await fill(page,label,value);await click(page,'Done');
  await click(page,'+ Add Accused / Opposite Party');await click(page,'☐ Identity unknown');await fill(page,'Alias / identifying information','TEST ONLY unidentified person in blue');await fill(page,'Other known details','TEST ONLY unknown suspect description');await click(page,'Done');
  await click(page,'+ Add Accused / Opposite Party');await fill(page,'Accused name','TEST ONLY named accused');await fill(page,'Contact number','2025550102');await click(page,'☐ Primary accused');await click(page,'Done');
  await click(page,'+ Add Witness');await fill(page,'Witness name','TEST ONLY witness');await fill(page,'Contact number','2025550103');await fill(page,'Witness role / relationship','TEST passerby');await fill(page,'When present','TEST at incident');await fill(page,'Statement note','TEST witness statement note');await click(page,'Done');await saved(page);await page.screenshot({path:path.join(out,'step3.png'),fullPage:true});
  await click(page,'Continue to Evidence & Documents');await text(page,'No files attached in this category.');await saved(page);
  const elapsedUrl=page.url();await delay(6000);assert.equal(page.url(),elapsedUrl);proof.no_timer_navigation=true;
  await page.goto(mobile+'/fir/status?caseId='+id,{waitUntil:'networkidle0'});await click(page,'Continue intake');await text(page,'Documents & Evidence');assert.ok(page.url().includes('/step4'));proof.resume_through_existing_status_url=true;
  // Actual upload control, synthetic PNG only; no draft/PDF generation or AI.
  const fixture=path.join(out,'TEST-intake-evidence.png');fs.copyFileSync('apps/mobile/assets/legalitt-mark.png',fixture);
  await page.click('[aria-label="Identity type: Passport"]');
  if(deployed){const choosing=page.waitForFileChooser();await click(page,'Upload Identity Proof');await(await choosing).accept([fixture]);proof.browser_file_upload=true;await text(page,'Identity document attached.');}
  else{
   // 8083 is an isolated test origin outside the existing S3 CORS allowlist.
   // Keep browser security and cloud settings intact; deployed proof uses the button.
   const ticket=await clients.client.presign({case_id:id,kind:'id_proof',filename:'TEST-intake-evidence.png',mime:'image/png',identity:{document_type:'passport',masked_copy:false}});await clients.client.upload(ticket,new Blob([fs.readFileSync(fixture)],{type:'image/png'}));await page.reload({waitUntil:'networkidle0'});proof.local_upload='API upload; isolated browser origin not allowed by existing S3 CORS';
  }
  const identity=(await clients.client.case(id)).documents.find(d=>d.kind==='id_proof'&&d.status==='uploaded');assert.ok(identity);await text(page,identity.filename);await text(page,'Identity evidence');await page.screenshot({path:path.join(out,'step4.png'),fullPage:true});
  await click(page,'Continue Draft');await text(page,'Review Your Request');
  for(const value of ['TEST ONLY Intake Complainant','TEST ONLY free text station','TEST ONLY narrative entered by the client.','TEST ONLY additional context retained on review.','Unknown suspect','TEST ONLY named accused','TEST ONLY witness','TEST witness statement note',identity.filename])await text(page,value);
  await page.screenshot({path:path.join(out,'step5.png'),fullPage:true});const body=await page.evaluate(()=>document.body.innerText);assert.ok(!body.includes('Verified KYC'));proof.review_actual_values=true;
  const stored=await clients.client.case(id);assert.equal(stored.details.people.length,4);assert.equal(stored.details.people.filter(p=>p.kind==='accused').length,2);assert.equal(stored.details.people.find(p=>p.unknown).name,'');
  const adminDetail=await clients.admin.adminCase(id);assert.deepEqual(adminDetail.intake.people,stored.details.people);assert.equal(adminDetail.intake.incident.additional,stored.details.incident.additional);proof.admin_original_intake=true;
  // Loading is distinguishable from emptiness; deliberately fail a read, then recover.
  holdLoad=true;await page.reload({waitUntil:'domcontentloaded'});await text(page,'Loading saved FIR intake');holdLoad=false;assert.ok(releaseLoad);await releaseLoad();await text(page,'Review Your Request');proof.loading_state=true;
  const other=await clients['client-isolation'].createCase({service_code:'fir_draft'});await assert.rejects(clients['client-isolation'].case(id),{status:404});await assert.rejects(clients.client.case(other.id),{status:404});proof.isolation={other_client_to_case:404,client_to_other_case:404,other_case_id:other.id};
  await page.goto(mobile+'/fir/step5?caseId='+other.id,{waitUntil:'networkidle0'});await text(page,'Retry loading intake');assert.ok(!(await page.evaluate(()=>document.body.innerText)).includes('TEST ONLY Intake Complainant'));proof.load_error_no_leak=true;
  await page.goto(mobile+'/fir/step5?caseId='+id,{waitUntil:'networkidle0'});await text(page,'Review Your Request');await click(page,'Proceed To Pay');await text(page,'Complete Payment');const final=await clients.client.case(id);assert.equal(final.status,'payment_pending');assert.equal(final.drafts.length,0);proof.status=final.status;proof.reference=final.reference;proof.no_draft=true;proof.browser_errors=errors;assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(proof,null,2)+'\n');console.log('PASS saved intake, five states, conflict/retry, real review, resume, isolation and submit; no payment/draft/PDF/AI performed');
 }catch(e){if(page&&!page.isClosed()){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});fs.writeFileSync(path.join(out,'failure.txt'),await page.evaluate(()=>document.body.innerText));}throw e;}
 finally{await browser?.close();server?.close();api?.kill();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
