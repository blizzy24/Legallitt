// Read-only browser checks against the completed synthetic walkthrough cases.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createHash}=require('node:crypto'),puppeteer=require('puppeteer-core');
process.loadEnvFile('apps/api/.env.local');
const deployed=process.env.REPORT_DEPLOYED==='1',out=path.resolve('reports/report-services-2026-11-11',deployed?'deployed':'local'),mobile=deployed?'https://legalitt-5.vercel.app':'http://localhost:8083';
async function main(){let browser,server,p;try{
 if(!deployed)server=await require('./helpers/local-walkthrough.cjs')();
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
 p=await browser.newPage();if(server)await server.attach(p);await p.setViewport({width:430,height:1000});
 await p.goto(mobile+'/login',{waitUntil:'networkidle0'});await p.type('input[placeholder="Email / Mobile No"]','demo-client@legalitt.invalid');await p.type('input[aria-label=Password]',password);await p.evaluate(()=>[...document.querySelectorAll('[role=button]')].find(e=>e.textContent.trim()==='Continue').click());await p.waitForFunction(()=>location.pathname==='/home');
 const cases=JSON.parse(fs.readFileSync(path.join(out,'verification.json'))).results,results=[];
 for(const c of cases){
  await p.bringToFront();await p.goto(mobile+'/'+c.service.replaceAll('_','-')+'/track?caseId='+c.case_id,{waitUntil:'networkidle0'});
  for(const file of c.files){
   console.log('Client download:',c.service,file.name);await p.bringToFront();
   const label='Download '+file.name,find=t=>[...document.querySelectorAll('[role=button]')].find(e=>e.textContent.trim()===t&&!e.closest('[aria-hidden=true],[inert]')&&e.getClientRects().length&&e.getAttribute('aria-disabled')!=='true');
   await p.waitForFunction(find,{timeout:60000},label);const h=await p.evaluateHandle(find,label);await h.asElement().evaluate(e=>e.scrollIntoView({block:'center'}));await new Promise(r=>setTimeout(r,350));
   const [response]=await Promise.all([p.waitForResponse(r=>r.request().method()==='GET'&&new URL(r.url()).pathname.endsWith('/documents/'+file.id+'/url'),{timeout:60000}),h.asElement().click()]);
   const signed=await response.json();assert.ok(signed.url);await p.bringToFront();
   const bytes=await p.evaluate(async url=>{const r=await fetch(url);if(!r.ok)throw Error('PDF download HTTP '+r.status);return [...new Uint8Array(await r.arrayBuffer())];},signed.url);
   const hash=createHash('sha256').update(Buffer.from(bytes)).digest('hex');assert.equal(hash,file.sha256);
   results.push({service:c.service,document_id:file.id,clientButtonClicked:true,downloadedInBrowser:true,sha256:hash});await h.dispose();
  }
 }
 fs.writeFileSync(path.join(out,'client-downloads.json'),JSON.stringify(results,null,2)+'\n');console.log('PASS client download buttons and browser PDF hashes for all released files.');
 }catch(e){if(p){await p.screenshot({path:path.join(out,'download-failure.png')}).catch(()=>{});fs.writeFileSync(path.join(out,'download-failure.txt'),await p.evaluate(()=>document.body.innerText).catch(()=>''));}throw e;}
 finally{await browser?.close();server?.close();}}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
