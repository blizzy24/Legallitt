const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {demoPassword}=require('../apps/api/dist/src/auth/demo');
process.loadEnvFile('apps/api/.env.local');
const out=path.resolve('reports/deploy-92fd314-2026-11-09/isolation');fs.mkdirSync(out,{recursive:true});
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',mobile='https://legalitt-5.vercel.app';
async function main(){
 const password=await demoPassword();const clients={};
 for(const name of ['demo-client','demo-client-isolation']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:name+'@legalitt.invalid',password})});assert.equal(r.status,201,name+' login');clients[name]=await r.json();assert.equal(clients[name].user.role,'client');}
 assert.notEqual(clients['demo-client'].user.id,clients['demo-client-isolation'].user.id);
 const request=(name,suffix)=>fetch(base+'/api/v1'+suffix,{headers:{Authorization:'Bearer '+clients[name].tokens.idToken}});
 const primaryCase=JSON.parse(fs.readFileSync(path.resolve('reports/deploy-92fd314-2026-11-09/walk/case.json')));
 const secondListResponse=await request('demo-client-isolation','/cases?limit=100');assert.equal(secondListResponse.status,200);const secondList=await secondListResponse.json();
 assert.ok(secondList.items.length>=1,'Second client must own its seeded case');
 const isolationCase=secondList.items.find(c=>c.service_code==='legal_notice' && c.details.client?.fullName==='TEST ONLY Client Isolation');assert.ok(isolationCase,'Permanent isolation seed case');
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const results=[];
 try{
  for(const [name,ownCase,target]of [['demo-client-isolation',isolationCase,primaryCase],['demo-client',primaryCase,isolationCase]]){
   const own=await request(name,'/cases/'+ownCase.id);assert.equal(own.status,200);const ownRecord=await own.json();assert.equal(ownRecord.client_id,clients[name].user.id);
   const direct=await request(name,'/cases/'+target.id);assert.equal(direct.status,404);const refusal=await direct.json();
   const context=await browser.createBrowserContext(),p=await context.newPage();await p.setViewport({width:430,height:1000});await p.emulateTimezone('Asia/Kolkata');
   await p.goto(mobile+'/login',{waitUntil:'domcontentloaded',timeout:60000});await p.waitForSelector('input[placeholder="Email / Mobile No"]');await p.type('input[placeholder="Email / Mobile No"]',name+'@legalitt.invalid');await p.waitForSelector('input[aria-label="Password"]');await p.type('input[aria-label="Password"]',password);
   const button=await p.evaluateHandle(()=>[...document.querySelectorAll('button,[role="button"]')].find(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.textContent.trim()==='Continue'));assert.ok(button.asElement());await button.asElement().click();await button.dispose();await p.waitForFunction(()=>location.pathname.endsWith('/home'),{timeout:90000});
   const responses=[];p.on('response',r=>{if(r.url().startsWith(base+'/api/v1/cases/'+target.id))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
   const url=mobile+'/legal-notice/tracking?caseId='+target.id;
   await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
   await p.waitForFunction(()=>/not found|not available|unable|couldn.t|failed/i.test(document.body.innerText),{timeout:90000});
   const body=await p.evaluate(()=>document.body.innerText);assert.ok(!body.includes(target.reference),'Foreign reference hidden');assert.ok(responses.some(r=>r.status===404));
   await p.screenshot({path:path.join(out,name+'-foreign-case.png'),fullPage:true});fs.writeFileSync(path.join(out,name+'-foreign-case.txt'),body);
   results.push({client:name,ownCase:{id:ownCase.id,reference:ownCase.reference},ownCaseStatus:own.status,foreignCase:{id:target.id,reference:target.reference},directApiStatus:direct.status,directApiMessage:refusal.message,browserUrl:url,browserResponses:responses,foreignReferenceHidden:true});
   console.log('PASS',name,'own case 200; other client case API 404; browser refusal without case details');
   await context.close();
  }
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({commit:'92fd314',bidirectional:true,bothClientsOwnCases:true,results},null,2));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.name,e.message);process.exitCode=1;});
