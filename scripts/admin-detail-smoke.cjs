const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),p=require('puppeteer-core');
const root=path.resolve(__dirname,'..'),out=path.join(root,'reports/admin-chunk-c');fs.mkdirSync(out,{recursive:true});
const {demoPassword}=require(path.join(root,'apps/api/dist/src/auth/demo'));
(async()=>{
 const password=await demoPassword();
 const login=await fetch('http://127.0.0.1:3006/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})}).then(r=>r.json());
 const request=async route=>{const r=await fetch('http://127.0.0.1:3006/api/v1'+route,{headers:{Authorization:'Bearer '+login.tokens.idToken}});assert.equal(r.status,200,route);return r.json();};
 const list=await request('/admin/cases?limit=100');const details=await Promise.all(list.items.map(c=>request('/admin/cases/'+c.id)));
 const waiting=details.find(c=>c.status==='assigning'&&c.pricing), sparse=details.find(c=>c.status==='assigning'&&!c.pricing), drafting=details.find(c=>c.status==='in_progress'), delivered=details.find(c=>c.status==='completed'&&c.shipments.length&&c.documents.some(d=>d.final));
 const review=details.find(c=>c.status==='client_review'&&c.drafts.length);
 assert.ok(waiting&&sparse&&drafting&&delivered&&review);
 const b=await p.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try {
  const page=await b.newPage();await page.setViewport({width:1600,height:1100});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.type('input[name=email]','demo-admin@legalitt.invalid');await page.type('input[name=password]',password);await page.click('button[type=submit]');await page.waitForSelector('td.reference',{timeout:60000});
  await page.goto('http://127.0.0.1:5173/legal-notices?bucket=open',{waitUntil:'networkidle0'});
  await page.click(`a[href="/legal-notices/${waiting.id}"]`);await page.waitForSelector('.case-heading');
  const writes=[];page.on('request',r=>{if(r.url().includes('/api/v1/')&&!['GET','OPTIONS'].includes(r.method())&&!r.url().includes('/auth/'))writes.push(r.method());});
  for(const [name,c] of Object.entries({waiting,drafting,delivered,sparse,review})){
   await page.goto('http://127.0.0.1:5173/legal-notices/'+c.id,{waitUntil:'networkidle0'});await page.waitForSelector('.case-heading');
   assert.ok(await page.$eval('h1',(e,ref)=>e.textContent.includes(ref),c.reference));
   await page.screenshot({path:out+'/'+name+'.png',fullPage:true});
   if(name==='waiting'){
    await page.click('.admin-attention .assign');await page.waitForFunction(()=>document.querySelectorAll('.advocate-option').length===4);
    await page.screenshot({path:out+'/picker.png'});await page.click('[aria-label="Close advocate picker"]');
   }
   if(name==='sparse'){
    const text=await page.$eval('.case-detail',e=>e.innerText);
    for(const absent of ['Base fee','GST','Tier','Documents','Payments','Shipment','Address','Phone'])assert.ok(!text.includes(absent),'Sparse case shows '+absent);
   }
  }
  // Read every uploaded document on the delivered case using the real URL endpoint.
  for(const doc of delivered.documents.filter(d=>d.status==='uploaded')){
   const signed=await request('/admin/cases/documents/'+doc.id+'/preview');
   const r=await fetch(signed.url);assert.equal(r.status,200,'S3 open '+doc.filename);assert.ok((await r.arrayBuffer()).byteLength>0);
   assert.match(r.headers.get('content-disposition'),/inline/);
  }
  await page.goto('http://127.0.0.1:5173/legal-notices/'+delivered.id,{waitUntil:'networkidle0'});await page.waitForSelector('.document-row .text-button');await page.evaluate(()=>[...document.querySelectorAll('.document-group')].find(g=>g.querySelector('h3')?.textContent.startsWith('Admin')).querySelector('.text-button').click());await page.waitForSelector('.document-dialog iframe');
  await new Promise(r=>setTimeout(r,1500));await page.screenshot({path:out+'/document-preview.png'});await page.click('[aria-label="Close document"]');
  const client=await fetch('http://127.0.0.1:3006/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password})}).then(r=>r.json());
  for(const endpoint of ['/admin/cases/'+delivered.id,'/admin/cases/documents/'+delivered.documents[0].id+'/preview'])assert.equal((await fetch('http://127.0.0.1:3006/api/v1'+endpoint,{headers:{Authorization:'Bearer '+client.tokens.idToken}})).status,403);
  assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);
  const advocates=await request('/admin/advocates');
  fs.writeFileSync(out+'/evidence.json',JSON.stringify({cases:Object.fromEntries(Object.entries({waiting,drafting,delivered,sparse,review}).map(([key,c])=>[key,{id:c.id,reference:c.reference,status:c.status}])),advocates:advocates.items,documentsOpened:delivered.documents.length,clientRefused:true},null,2));
  console.log('Four-advocate picker; waiting/drafting/delivered/sparse/review screenshots; real S3 documents open; client refused; no browser runtime errors.');
 }finally{await b.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
