// Local real HTTP/DB/PDF verification. Synthetic identities in the isolated test
// database replace Cognito only; no deployed record is modified. API responses
// are forwarded unchanged into the built app, including structured HTTP 400s.
process.env.AI_MODE='simulated';
process.env.DEMO_PROGRESSION='off';
process.env.ADMIN_UI_MODE='simulated';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const puppeteer=require('puppeteer-core');
const {NestFactory}=require('../apps/api/node_modules/@nestjs/core');
const {AppModule}=require('../apps/api/dist/src/app.module');
const {PrismaService}=require('../apps/api/dist/src/prisma.service');
const {AuthService}=require('../apps/api/dist/src/auth/auth.service');
const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client');
const {PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg');
const {ApiClient,NOTICE_PDF_FIELD_LABELS}=require('../packages/shared/dist');
const {readPdfText}=require('../apps/api/tests/helpers/pdf-text.cjs');
const out=path.resolve('reports/notice-completeness-2026-11-04');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page,label){const h=await page.evaluateHandle(label=>[...document.querySelectorAll('[role="button"],button')].find(e=>!e.closest('[inert],[aria-hidden="true"]')&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)),label);assert.ok(h.asElement(),label);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await h.asElement().click();await h.dispose();}
async function fill(page,label,value){const h=await page.waitForSelector(`[aria-label="${label}"]`);await h.evaluate(e=>e.scrollIntoView({block:'center'}));await h.click();await h.evaluate(e=>e.select());await h.press('Backspace');if(value)await h.type(value);await h.evaluate(e=>e.blur());}
async function main(){
 assert.ok(process.env.LEGALITT_TEST_DATABASE_URL,'Isolated test database required');fs.mkdirSync(out,{recursive:true});
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const advocate={id:randomUUID(),role:'advocate',name:'TEST ONLY Advocate'},client={id:randomUUID(),role:'client',name:'TEST ONLY Client'};
 const caseId=randomUUID();let app,server,browser;
 try{
  for(const a of [advocate,client])await db.user.create({data:{id:a.id,role:a.role,full_name:a.name,cognito_sub:'completeness-test-'+a.id}});
  await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved'}});
  await db.case.create({data:{id:caseId,reference:'LN-TEST-PDF-'+Date.now(),service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status:'in_progress',tier:'urgent',details:{},subject_matter:'TEST ONLY synthetic legacy record for missing-field validation.'}});
  app=await NestFactory.create(AppModule,{logger:false,abortOnError:false});app.get(PrismaService).getClient=async()=>db;
  app.get(AuthService).identity=async token=>{assert.equal(token,advocate.id);return advocate;};
  await app.listen(0,'127.0.0.1');const apiUrl=await app.getUrl();
  const tokens={idToken:advocate.id,accessToken:advocate.id,expiresIn:3600,expiresAt:Date.now()+3600000};
  const api=new ApiClient({baseUrl:apiUrl,getTokens:async()=>tokens});
  const dist=path.resolve('apps/mobile/dist');
  const mime={'.html':'text/html','.js':'application/javascript','.png':'image/png','.ttf':'font/ttf','.css':'text/css'};
  server=http.createServer((req,res)=>{let file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(dist,'index.html');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});const page=await browser.newPage();await page.setViewport({width:430,height:950});
  const errors=[],blocks=[];page.on('pageerror',e=>errors.push(e.message));
  await page.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify(tokens)),tokens);
  await page.setRequestInterception(true);
  page.on('request',async req=>{try{
   const url=new URL(req.url());if(!url.pathname.startsWith('/api/v1/'))return req.continue();
   if(req.method()==='OPTIONS')return req.respond({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'Authorization,Content-Type,Idempotency-Key','access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS'}});
   const headers={authorization:'Bearer '+advocate.id,'content-type':'application/json'};
   const response=await fetch(apiUrl+url.pathname+url.search,{method:req.method(),headers,body:req.postData()});const body=await response.text();
   if(response.status===400&&url.pathname.endsWith('/pdf'))blocks.push(JSON.parse(body));
   await req.respond({status:response.status,headers:{'content-type':'application/json','access-control-allow-origin':'*'},body});
  }catch(e){errors.push(e.message);await req.abort();}});
  const go=async route=>{await page.goto(base+route,{waitUntil:'networkidle0'});};
  const draftRoute=`/advocate/notice/${caseId}/draft`;
  await go(draftRoute);await page.waitForSelector('[aria-label="Compliance period (days)"]');
  await click(page,'Edit Background & Facts');await fill(page,'Background & Facts','TEST ONLY: unsaved advocate facts must survive the error and chat navigation.');
  await click(page,'Generate Draft');
  await page.waitForSelector('[data-testid="notice-draft-feedback"]');await pause(6500);
  const feedback=await page.$eval('[data-testid="notice-draft-feedback"]',e=>e.innerText);
  for(const label of Object.values(NOTICE_PDF_FIELD_LABELS))assert.ok(feedback.includes(label),label);
  assert.equal(blocks.length,1);assert.equal(blocks[0].missing_fields.length,7);
  assert.ok(page.url().includes('/draft'));assert.equal((await api.case(caseId)).drafts.at(-1).content.facts,'TEST ONLY: unsaved advocate facts must survive the error and chat navigation.');
  await page.screenshot({path:path.join(out,'all-missing-next-to-generate.png')});
  await click(page,'Open client chat');await page.waitForFunction(()=>location.pathname.endsWith('/chat'));assert.equal(new URL(page.url()).searchParams.get('caseId'),caseId);
  await go(`/advocate/notice/draft-editor?caseId=${caseId}`);await click(page,'Preview');await page.waitForSelector('[data-testid="notice-draft-feedback"]');await pause(500);await page.screenshot({path:path.join(out,'missing-next-to-preview.png')});
  // Repair only the synthetic test record to exercise the exact same endpoint
  // successfully. No production repair API or advocate override is invented.
  const price=await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'urgent',effective_to:null}});
  await db.case.update({where:{id:caseId},data:{pricing_id:price.id,subject_line:'TEST ONLY: request for return of an unpaid advance',details:{client:{fullName:'TEST ONLY Sender',address:'1 Synthetic Street, Indore'},noticee:{fullName:'TEST ONLY Recipient',address:'2 Synthetic Street, Mumbai'}},legal_demand:{selected:['Return the unpaid advance of ₹5,000.'],custom:''}}});
  await db.advocateProfile.update({where:{user_id:advocate.id},data:{city:'Indore'}});
  const pdfs=[];
  for(const offence of [false,true]){
   await go(draftRoute);await page.waitForSelector('[aria-label="Compliance period (days)"]');await fill(page,'Compliance period (days)','7');await fill(page,'Offences',offence?'TEST ONLY: allegation supplied by the advocate for this synthetic example.':'');
   const responsePromise=page.waitForResponse(r=>r.url().endsWith('/pdf')&&r.request().method()==='POST');await click(page,'Generate Draft');const response=await responsePromise;assert.equal(response.status(),201);const result=await response.json(),bytes=Buffer.from(result.pdf_base64,'base64');
   const name='notice-'+(offence?'with':'without')+'-offence.pdf';fs.writeFileSync(path.join(out,name),bytes);
   const {text}=await readPdfText(bytes);assert.ok(!text.includes('____'));assert.ok(!text.includes('S/o Shri'));assert.ok(!text.includes('Age '));assert.equal(text.includes('criminal complaint'),offence);assert.ok(text.replace(/\s/g,'').includes('within7daysofreceiptofthisnotice'));pdfs.push(name);
   await page.waitForFunction(()=>location.pathname.endsWith('/response'));
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'missing-fields-response.json'),JSON.stringify(blocks[0],null,2));
  fs.writeFileSync(path.join(out,'local-verification.json'),JSON.stringify({realHttp:true,isolatedTestDatabase:true,syntheticAuthentication:true,missingFields:blocks[0].missing_fields,errorSurvivesPolling:true,chatPreservesCaseId:true,factsSavedBeforeChat:true,pdfs,errors},null,2));console.log('PASS completeness HTTP, DB, editor errors, chat and both PDFs');
 }finally{
  if(browser){const timeout=setTimeout(()=>browser.process()?.kill('SIGKILL'),5000);try{await browser.close();}finally{clearTimeout(timeout);}}
  if(server)await new Promise(r=>server.close(r));if(app)await app.close();
  // Only records created above, exclusively in LEGALITT_TEST_DATABASE_URL.
  await db.message.deleteMany({where:{thread_id_relation:{case_id:caseId}}});
  await db.messageThread.deleteMany({where:{case_id:caseId}});
  await db.caseEvent.deleteMany({where:{case_id:caseId}});await db.draft.deleteMany({where:{case_id:caseId}});await db.case.deleteMany({where:{id:caseId}});
  await db.advocateProfile.deleteMany({where:{user_id:advocate.id}});await db.user.deleteMany({where:{id:{in:[advocate.id,client.id]}}});await db.$disconnect();
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
