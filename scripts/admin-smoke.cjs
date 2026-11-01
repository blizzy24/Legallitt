const path=require('node:path');
const root=path.resolve(__dirname,'..');
const p=require('puppeteer-core');
const {demoPassword}=require(path.join(root,'apps/api/dist/src/auth/demo'));
const assert=require('node:assert/strict');
const out=path.join(root,'reports/admin-chunk-a');
require('node:fs').mkdirSync(out,{recursive:true});
(async()=>{
const password=await demoPassword();
const b=await p.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await b.newPage();await page.setViewport({width:1600,height:1000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
 await page.waitForSelector('input[name=email]');
 await page.type('input[name=email]','demo-admin@legalitt.invalid');await page.type('input[name=password]',password);
 await page.click('button[type=submit]');
 await page.waitForSelector('table tbody .reference',{timeout:60000});
 await page.screenshot({path:out+'/notices-list.png'});
 console.log('Admin Cognito sign-in: pass');
 const data=await page.evaluate(async()=>{
 const tokens=JSON.parse(sessionStorage.getItem('legalitt.admin.tokens'));
 const r=await fetch('/api/v1/admin/cases?service=legal_notice&limit=100',{headers:{Authorization:'Bearer '+tokens.idToken}});
 return {status:r.status,data:await r.json()};
 });
 assert.equal(data.status,200);console.log('Real case counts:',JSON.stringify(data.data.counts));
 assert.ok(data.data.items.length);assert.ok(data.data.items.every(r=>!['draft','submitted','payment_pending'].includes(r.status)));
 for(const bucket of ['Open','Pending','In Progress','Completed','Closed']){
  await page.evaluate(bucket=>[...document.querySelectorAll('.counter')].find(b=>b.textContent.startsWith(bucket)).click(),bucket);
  await page.waitForFunction(()=>document.querySelector('[aria-busy]')?.getAttribute('aria-busy')==='false');
  console.log('Bucket',bucket,'rows',await page.$$eval('td.reference',rows=>rows.length));
  await page.screenshot({path:out+'/'+bucket.toLowerCase().replaceAll(' ','-')+'.png',fullPage:true});
 }
 // Search from the real list by reference, client name and matter type.
 for(const term of [data.data.items[0].reference, data.data.items[0].client.name, 'Money Recovery']) {
  await page.goto('http://127.0.0.1:5173/legal-notices',{waitUntil:'networkidle0'});
  await page.waitForSelector('input[aria-label="Search notices"]');
  await page.type('input[aria-label="Search notices"]',term);
  const response=page.waitForResponse(r=>r.url().includes('/admin/cases?')&&r.url().includes('search=')&&r.status()===200);
  await page.click('form[role=search] button'); await response;
  await page.waitForFunction(()=>document.querySelector('[aria-busy]')?.getAttribute('aria-busy')==='false');
  assert.ok(await page.$('td.reference')); console.log('Search',term,': pass');
 }
 await page.reload({waitUntil:'networkidle0'});await page.waitForSelector('table');console.log('Admin refresh: pass');
 await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Sign out').click());
 await page.waitForSelector('input[name=email]');
 await page.type('input[name=email]','demo-client@legalitt.invalid');await page.type('input[name=password]',password);await page.click('button[type=submit]');
 await page.waitForFunction(()=>document.querySelector('[role=alert]')?.textContent.includes('Admin access required'),{timeout:60000});
 await page.screenshot({path:out+'/client-refused.png',fullPage:true});
 assert.equal(await page.evaluate(()=>sessionStorage.getItem('legalitt.admin.tokens')),null);
 assert.equal(await page.$('table'),null);console.log('Client Cognito sign-in refused visibly; no token retained: pass');
 // Also test the endpoint with a real client token, independent of the UI guard.
 const client=await fetch('http://127.0.0.1:3006/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password})}).then(r=>r.json());
 const refused=await fetch('http://127.0.0.1:3006/api/v1/admin/cases',{headers:{Authorization:'Bearer '+client.tokens.idToken}});
 assert.equal(refused.status,403);console.log('Real client token GET /admin/cases: 403');
 await page.evaluate(tokens=>sessionStorage.setItem('legalitt.admin.tokens',JSON.stringify(tokens)),client.tokens);
 await page.goto('http://127.0.0.1:5173/legal-notices',{waitUntil:'networkidle0'});
 await page.waitForFunction(()=>document.querySelector('[role=alert]')?.textContent.includes('Admin access required'));
 assert.equal(await page.$('table'),null);console.log('Cold-loaded client token refused before rendering list: pass');
 const advocate=await fetch('http://127.0.0.1:3006/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-advocate@legalitt.invalid',password})}).then(r=>r.json());
 const advRefused=await fetch('http://127.0.0.1:3006/api/v1/admin/cases',{headers:{Authorization:'Bearer '+advocate.tokens.idToken}});
 assert.equal(advRefused.status,403);console.log('Real advocate token GET /admin/cases: 403');
 assert.deepEqual(errors,[]);console.log('Browser runtime errors: none');
}finally{await b.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
