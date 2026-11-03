// Real Dev case and public browsers; tokens stay in memory. Never contacts a noticee.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const {readPdfText}=require('../apps/api/tests/helpers/pdf-text.cjs');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',mobile='https://legalitt-5.vercel.app';
const out=path.resolve('reports/notice-closing-2026-11-04');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function click(page,label){
 const handle=await page.evaluateHandle(label=>[...document.querySelectorAll('button,[role="button"]')].find(e=>!e.closest('[inert],[aria-hidden="true"]')&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)),label);
 assert.ok(handle.asElement(),label);await handle.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await handle.asElement().click();await handle.dispose();
}
async function fill(page,label,value){
 const el=await page.waitForSelector(`input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`);
 await el.evaluate(e=>e.scrollIntoView({block:'center'}));await el.click();await el.evaluate(e=>e.select());await el.press('Backspace');if(value)await el.type(value);
 assert.equal(await el.evaluate(e=>e.value),value);await el.evaluate(e=>e.blur());
}
async function shot(page,name,height=2400){await page.setViewport({width:430,height});await wait(250);await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});await page.setViewport({width:430,height:950});}
async function main(){
 requireDemoMode();fs.mkdirSync(out,{recursive:true});
 const password=await demoPassword(),sessions={},api={};
 for(const role of ['client','advocate']){
  const res=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});
  assert.equal(res.status,201);sessions[role]=await res.json();api[role]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[role].tokens});
 }
 const id=JSON.parse(fs.readFileSync('reports/notice-draft-seeding-2026-11-03/case.json')).id;
 let record=await api.advocate.case(id);assert.equal(record.status,'in_progress');assert.match(record.details.client.fullName,/TEST ONLY/);
 const startVersions=record.drafts.length,errors=[];
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const advocate=await browser.createBrowserContext(),client=await browser.createBrowserContext();
  async function pageFor(context,role){const p=await context.newPage();await p.setViewport({width:430,height:950});p.on('pageerror',e=>errors.push(e.message));await p.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),sessions[role].tokens);return p;}
  const page=await pageFor(advocate,'advocate'),clientPage=await pageFor(client,'client');
  const go=async()=>{await page.goto(`${mobile}/advocate/notice/${id}/draft`,{waitUntil:'networkidle0',timeout:90000});await page.waitForSelector('[aria-label="Compliance period (days)"]');};
  await go();assert.equal(await page.$eval('[aria-label="Compliance period (days)"]',e=>e.value),'15');
  assert.equal((await api.advocate.case(id)).drafts.length,startVersions,'open creates no draft');
  await shot(page,'advocate-default-15');
  // Invalid input remains on this screen, with a visible error and no save.
  await fill(page,'Compliance period (days)','1.5');await click(page,'Generate Draft');
  await page.waitForFunction(()=>document.body.innerText.includes('Enter a whole number of days, at least 1.'));
  assert.equal((await api.advocate.case(id)).drafts.length,startVersions);
  await fill(page,'Compliance period (days)','7');
  await fill(page,'Offences','TEST ONLY: alleged deception in this synthetic example. No actual offence is alleged.');
  await wait(6200);assert.equal(await page.$eval('[aria-label="Compliance period (days)"]',e=>e.value),'7');
  async function generate(name,criminal){
   const pending=page.waitForResponse(r=>/\/drafts\/[^/]+\/pdf$/.test(r.url())&&r.request().method()==='POST',{timeout:90000});
   await click(page,'Generate Draft');const res=await pending;assert.equal(res.status(),201);const result=await res.json();const bytes=Buffer.from(result.pdf_base64,'base64');
   fs.writeFileSync(path.join(out,name+'.pdf'),bytes);const {text,pages}=await readPdfText(bytes);const compact=text.replace(/\s/g,'');
   assert.ok(compact.includes('within7daysofreceiptofthisnotice.'));assert.equal(compact.includes('criminalcomplaint/FIR'),criminal);assert.equal(compact.includes('fortheoffencesof'),criminal);assert.ok(!text.includes('____'));
   fs.writeFileSync(path.join(out,name+'.txt'),text);await page.waitForFunction(()=>location.pathname.endsWith('/response'));
   return {pages:pages.length,filename:result.filename};
  }
  const withOffence=await generate('notice-with-offence',true);record=await api.advocate.case(id);const first=record.drafts.at(-1);
  assert.equal(record.compliance_period_days,7);assert.equal(first.compliance_period_days,7);assert.equal(first.closing_policy.criminal_clause,'when_offences');
  await go();assert.equal(await page.$eval('[aria-label="Compliance period (days)"]',e=>e.value),'7');await fill(page,'Offences','');await shot(page,'advocate-civil-only');
  const withoutOffence=await generate('notice-without-offence',false);record=await api.advocate.case(id);const last=record.drafts.at(-1);assert.equal(last.content.offences,'');
  assert.equal(record.drafts.find(d=>d.id===first.id).content.offences,first.content.offences,'earlier PDF version unchanged');
  // Send the civil draft through the real pipeline; client sees its period, not an unsent value.
  await api.advocate.sendDraft(id,last.id);
  await clientPage.goto(`${mobile}/legal-notice/tracking?caseId=${id}`,{waitUntil:'networkidle0',timeout:90000});
  await clientPage.waitForFunction(()=>document.body.innerText.includes('7 days from receipt of notice'));
  await shot(clientPage,'client-tracking-period',1700);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({case:{id,reference:record.reference},defaultDays:15,savedDays:7,invalidFractionRejected:true,unsavedEditsSurvivedPolling:true,withOffence,withoutOffence,clientSawSentPeriod:true,errors},null,2));
  console.log('PASS deployed',record.reference,'7 days; both PDFs generated; client tracking correct');
 }finally{const cleanup=setTimeout(()=>{browser.process()?.kill('SIGKILL');browser.disconnect();},5000);try{await browser.close();}finally{clearTimeout(cleanup);}}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
