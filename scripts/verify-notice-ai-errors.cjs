// Local-only browser check: real controller/database, test identity, injected
// upstream 429/503. No deployed API, credential change or external AI request.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto'), puppeteer=require('puppeteer-core');
process.env.AI_MODE='simulated';process.env.DEMO_PROGRESSION='off';process.env.ADMIN_UI_MODE='live';
const {NestFactory}=require('../apps/api/node_modules/@nestjs/core');
const {AppModule}=require('../apps/api/dist/src/app.module');
const {PrismaService}=require('../apps/api/dist/src/prisma.service');
const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client');
const {PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg');
const {AuthService}=require('../apps/api/dist/src/auth/auth.service');
const {AI}=require('../apps/api/dist/src/ai/ai.port');
const {GeminiAi}=require('../apps/api/dist/src/ai/gemini-ai');
const {ApiClient}=require('../packages/shared/dist');
const out=path.resolve('reports/notice-ai-errors-2026-11-03');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
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
  assert.ok(process.env.LEGALITT_TEST_DATABASE_URL);fs.mkdirSync(out,{recursive:true});
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
  const actor={id:randomUUID(),role:'client',full_name:'Local AI error test'};
  const app=await NestFactory.create(AppModule,{logger:false});
  app.get(PrismaService).getClient=async()=>db;
  app.get(AuthService).identity=async token=>token===actor.id?actor:undefined;
  const logs=[];app.useLogger({error:m=>logs.push(String(m)),log(){},warn(){}});
  const ai=app.get(AI),original=ai.generate.bind(ai),failures=new Set(['subject','demands']);
  ai.generate=request=>{
    if(!failures.delete(request.task))return original(request);
    const quota=request.task==='subject';
    return new GeminiAi({apiKey:'synthetic-test-key',model:'gemini-3.5-flash-lite',environment:'dev',nodeEnv:'test'},
      async()=>Response.json({error:{status:quota?'RESOURCE_EXHAUSTED':'UNAVAILABLE',message:quota?'Quota exceeded':'Provider unavailable'}},{status:quota?429:503})).generate(request);
  };
  let browser,id;
  try {
    await db.user.create({data:{...actor,cognito_sub:'browser-ai-error-'+actor.id}});
    await app.listen(0,'127.0.0.1');const apiUrl=await app.getUrl();
    const tokens={idToken:actor.id,accessToken:actor.id,expiresIn:3600,expiresAt:Date.now()+3600000};
    const api=new ApiClient({baseUrl:apiUrl,getTokens:async()=>tokens});
    const c=await api.createCase({service_code:'legal_notice',tier:'urgent'});id=c.id;
    await api.saveIntake(id,{matter_type:'money_recovery',subject_matter:'Synthetic local UI test: an unpaid invoice.'});
    browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
    const p=await browser.newPage();await p.setViewport({width:395,height:1000});
    const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{errors.push('Blocking dialog');void d.dismiss();});
    await p.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify(tokens)),tokens);
    await p.setRequestInterception(true);
    p.on('request',async r=>{
      const url=new URL(r.url());
      if(!url.pathname.startsWith('/api/v1/'))return void r.continue();
      try {
        if(r.method()==='OPTIONS')return void r.respond({status:204,headers:{'Access-Control-Allow-Origin':'http://localhost:8081','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'}});
        const response=await fetch(apiUrl+url.pathname+url.search,{method:r.method(),headers:{'Content-Type':'application/json',Authorization:'Bearer '+actor.id},...(r.postData()?{body:r.postData()}:{})});
        await r.respond({status:response.status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'http://localhost:8081'},body:await response.text()});
      }catch{errors.push('Local proxy failed');await r.abort();}
    });
    await p.goto('http://localhost:8081/legal-notice/step3?caseId='+id,{waitUntil:'networkidle0',timeout:90000});
    await click(p,'Continue');
    const expectedSubject='Couldn’t generate the subject just now. Please try again.';
    await p.waitForFunction(text=>document.querySelector('[role="alert"]')?.textContent===text,{},expectedSubject);
    assert.ok(!(await p.evaluate(()=>document.body.innerText)).includes('RESOURCE_EXHAUSTED'));
    await p.screenshot({path:path.join(out,'subject-friendly-error.png')});
    await click(p,'Continue');await route(p,'/step2');
    await p.goto('http://localhost:8081/legal-notice/demand?caseId='+id,{waitUntil:'networkidle0'});
    const expectedDemands='Couldn’t generate suggestions just now. Try again, or type your own.';
    await p.waitForFunction(text=>document.querySelector('[role="alert"]')?.textContent===text,{},expectedDemands);
    assert.ok(!(await p.evaluate(()=>document.body.innerText)).includes('UNAVAILABLE'));
    await p.screenshot({path:path.join(out,'demands-friendly-error.png')});
    await fill(p,'Write your own demand','Keep my own demand.');await click(p,'Generate options');await p.waitForSelector('[role="checkbox"]');
    await click(p,'Continue');await route(p,'/step4');
    const saved=await api.case(id),events=(await api.events(id)).items.filter(e=>e.type.endsWith('_generation_failed'));
    assert.equal(saved.legal_demand.custom,'Keep my own demand.');assert.equal(events.length,2);
    assert.deepEqual(events.map(e=>e.payload.code),['RESOURCE_EXHAUSTED','UNAVAILABLE']);assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({verification:'Local UI + real local HTTP handlers/database; upstream failures injected; existing simulator used only for successful retry',subjectMessage:expectedSubject,demandsMessage:expectedDemands,recoveredTo:'/legal-notice/step4',customDemand:saved.legal_demand.custom,events,logs,errors},null,2)+'\n');
    console.log('Both friendly errors visible; provider codes only in logs/events; both retries work; custom demand saved.');
  }finally{
    if(browser)await browser.close();ai.generate=original;await app.close();
    if(id){await db.caseEvent.deleteMany({where:{case_id:id}});await db.caseParty.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});}
    await db.user.deleteMany({where:{id:actor.id}});await db.$disconnect();
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
