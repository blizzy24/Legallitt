// Read-only browser isolation verification against the cases created by the live walk.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');process.loadEnvFile('apps/api/.env.local');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',mobile='https://legalitt-5.vercel.app',out=path.resolve('reports/consultation-services-2026-11-10/deployed');
async function main(){
 const proof=JSON.parse(fs.readFileSync(path.join(out,'verification.json'))),password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
 try{
  for(const role of ['client-isolation','client','advocate-2']){
   const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(response.status,201);
   const session=await response.json(),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens}),page=await(await browser.createBrowserContext()).newPage();
   await page.setViewport({width:430,height:1000});await page.goto(mobile+'/login',{waitUntil:'networkidle0'});await page.type('input[placeholder="Email / Mobile No"]',`demo-${role}@legalitt.invalid`);await page.type('input[aria-label=Password]',password);
   const button=await page.evaluateHandle(()=>[...document.querySelectorAll('[role=button],button')].find(e=>e.textContent.trim()==='Continue'));await button.asElement().click();await page.waitForFunction(()=>['/home','/dashboard'].includes(location.pathname));
   for(const record of proof.results){
    const id=role==='client'?record.isolation.other_case_id:record.case_id;
    await assert.rejects(api.case(id),{status:404});await assert.rejects(api.request(`/consultations/${id}`),{status:404});
    const route=role==='advocate-2'?`/advocate/consultation/${id}/room?caseId=${id}`:`${record.service==='legal_advice'?'/legal-advice/track':'/services/'+record.service.replaceAll('_','-')+'/case-details'}?step=track&caseId=${id}`;
    const requests=[];const collect=r=>{if(r.url().includes('/api/v1/')&&r.url().includes(id)&&r.request().method()==='GET')requests.push({path:new URL(r.url()).pathname,status:r.status()});};page.on('response',collect);
    await page.goto(mobile+route,{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.body.innerText.includes('Case not found'),{timeout:60000});page.off('response',collect);
    assert.ok(requests.length>=1);assert.ok(requests.every(r=>r.status===404));const body=await page.evaluate(()=>document.body.innerText);assert.ok(!body.includes('TEST ONLY Consultation Client'));assert.ok(!body.includes('TEST PRIVATE'));
    await page.screenshot({path:path.join(out,record.service+'-'+role+'-foreign-case.png'),fullPage:true});results.push({service:record.service,viewer:role,case_id:id,browser_url:mobile+route,requests,visible_message:'Case not found'});
   }
  }
  fs.writeFileSync(path.join(out,'browser-isolation.json'),JSON.stringify({results},null,2)+'\n');console.log('PASS browser isolation both client directions and unassigned advocate, all three services');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
