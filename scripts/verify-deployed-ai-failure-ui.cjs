// Replays the actual HTTP 502 bodies returned by the approved isolated ECS task.
// Only the two failure responses are replayed; UI sign-in and retries use the
// public deployed API. RDS failure events are read back from that API afterward.
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const out=path.resolve('reports/notice-ai-errors-2026-11-03/isolated');
const client='https://legalitt-5.vercel.app',base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page, label, role = 'button') {
  await page.bringToFront();
  await page.waitForFunction((label, role) => [...document.querySelectorAll(`[role="${role}"],button,a`)].some(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === label || e.textContent.trim() === label)), { timeout: 45000 }, label, role);
  const element = await page.evaluateHandle((label, role) => [...document.querySelectorAll(`[role="${role}"],button,a`)].find(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === label || e.textContent.trim() === label)), label, role);
  await element.asElement().evaluate(e => e.scrollIntoView({ block: 'center' })); await element.asElement().click(); await element.dispose(); await delay(250);
}
async function fill(page, label, value) {
  const selector = `input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`;
  await page.waitForSelector(selector);
  const handle = await page.evaluateHandle(selector => [...document.querySelectorAll(selector)].find(e => !e.closest('[aria-hidden="true"],[inert]')), selector);
  const input = handle.asElement(); assert.ok(input, label);
  await input.evaluate(e => e.scrollIntoView({ block: 'center' })); await input.click({ clickCount: 3 }); await input.press('Backspace'); await input.type(value); await input.evaluate(e => e.blur()); await handle.dispose();
}
async function route(page, suffix) { await page.waitForFunction(suffix => location.pathname.endsWith(suffix), { timeout: 60000 }, suffix); await delay(400); console.log('Reached', suffix); }
async function main(){
 assert.equal(process.env.VERIFY_DEPLOYED_AI_FAILURE_UI,'1');requireDemoMode();
 const task=JSON.parse(fs.readFileSync(path.join(out,'task-result.json'))),id=task.id;
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await browser.newPage();await p.setViewport({width:395,height:1050});await p.emulateTimezone('Asia/Kolkata');
 const errors=[],replayed=[],messages={};p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{errors.push('Blocking dialog');void d.dismiss();});
 try {
  await p.goto(client+'/login',{waitUntil:'networkidle0'});
  await p.type('input[placeholder="Email / Mobile No"]','demo-client@legalitt.invalid');
  await fill(p,'Password',await demoPassword());await click(p,'Continue');await route(p,'/home');
  const tokens=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('legalitt.auth.tokens')));
  const api=new ApiClient({baseUrl:base,getTokens:async()=>tokens});
  const record=await api.case(id);assert.equal(record.status,'draft');assert.match(record.details.client.fullName,/^TEST ONLY/);
  await api.saveIntake(id,{legal_demand:{selected:[],custom:''}});
  const failures=new Map(task.results.map(r=>[r.endpoint,r]));
  await p.setRequestInterception(true);
  p.on('request',request=>{
   const endpoint=new URL(request.url()).pathname.split('/').at(-1);
   if(request.url()===base+'/api/v1/cases/'+id+'/'+endpoint&&request.method()==='POST'&&failures.has(endpoint)){
    const result=failures.get(endpoint);failures.delete(endpoint);replayed.push(endpoint);
    void request.respond({status:result.status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':client},body:JSON.stringify(result.response)});
   }else void request.continue();
  });
  async function checkError(endpoint,file){
   const expected=task.results.find(r=>r.endpoint===endpoint).response.message;
   await p.waitForFunction(text=>document.querySelector('[role="alert"]')?.textContent===text,{timeout:45000},expected);
   const text=await p.evaluate(()=>document.body.innerText);
   assert.doesNotMatch(text,/RESOURCE_EXHAUSTED|UNAVAILABLE|gemini-3|Controlled verification/);
   messages[endpoint]=expected;await p.screenshot({path:path.join(out,file)});
  }
  await p.goto(client+'/legal-notice/step3?caseId='+id,{waitUntil:'networkidle0'});
  await click(p,'Continue');await checkError('subject','deployed-subject-error.png');
  assert.equal(await p.$eval('textarea[aria-label="Subject matter in dispute"]',e=>e.value),record.subject_matter);
  await click(p,'Continue');await route(p,'/step2');
  await p.goto(client+'/legal-notice/demand?caseId='+id,{waitUntil:'networkidle0'});
  await checkError('demand-options','deployed-demand-error.png');
  await fill(p,'Write your own demand','TEST ONLY: written confirmation of the synthetic invoice payment.');
  await click(p,'Generate options');await p.waitForSelector('[role="checkbox"]',{timeout:90000});
  const choice=await p.$eval('[role="checkbox"]',e=>e.textContent.trim());await click(p,choice,'checkbox');
  await click(p,'Continue');await route(p,'/step4');
  const after=await api.case(id),events=(await api.events(id)).items.filter(e=>e.type.endsWith('_generation_failed'));
  assert.match(after.legal_demand.custom,/^TEST ONLY/);assert.deepEqual(replayed,['subject','demand-options']);
  assert.equal(events.length,2);assert.deepEqual(events.map(e=>e.payload.code),['RESOURCE_EXHAUSTED','UNAVAILABLE']);
  assert.ok(events.every(e=>e.source==='real'&&e.actor_role==='client'));assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({reference:after.reference,id,
   method:'Deployed site replays exact isolated-task HTTP responses; upstream faults injected only in that task; live Cognito/RDS/CloudWatch and normal public-API retries',
   messages,replayed,subjectPreserved:true,customDemandSaved:true,retries:'Both succeeded against the public Gemini API integration',reached:'/legal-notice/step4',events,errors},null,2)+'\n');
  console.log(JSON.stringify({reference:after.reference,messages,eventCodes:events.map(e=>e.payload.code),retries:'passed',errors},null,2));
 }catch(e){await p.screenshot({path:path.join(out,'browser-failure.png')}).catch(()=>{});throw e;}finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
