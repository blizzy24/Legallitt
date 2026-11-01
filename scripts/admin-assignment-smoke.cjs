const path=require('node:path'), fs=require('node:fs'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), out=path.join(root,'reports/admin-chunk-b');
const {demoPassword}=require(path.join(root,'apps/api/dist/src/auth/demo'));
const p=require('puppeteer-core');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const password=await demoPassword();
 async function request(route,token,body,headers={}) {
  const r=await fetch('http://127.0.0.1:3006/api/v1'+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await r.json();if(!r.ok)throw Error(route+': '+JSON.stringify(data));return data;
 }
 const client=await request('/auth/login',null,{email:'demo-client@legalitt.invalid',password});
 const token=client.tokens.idToken;
 const b=await p.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
  const page=await b.newPage();await page.setViewport({width:1600,height:1000});
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle0'});
  await page.type('input[name=email]','demo-admin@legalitt.invalid');await page.type('input[name=password]',password);await page.click('button[type=submit]');
  await page.waitForSelector('td.reference',{timeout:60000});
  await page.screenshot({path:out+'/demo-markers.png'});
  assert.ok(await page.$('td.documents .demo'));
  const source=await request('/cases/114e2ec1-fd06-47b8-b4a0-ffdc44e133f7',token);
  const c=await request('/cases',token,{service_code:'legal_notice',tier:source.tier,details:source.details,matter_type:source.matter_type});
  fs.writeFileSync(out+'/verification-case.json',JSON.stringify({id:c.id,reference:c.reference},null,2));
  await request('/cases/'+c.id+'/submit',token,{});
  await request('/payments/intents',token,{case_id:c.id,purpose:'service_fee'},{'Idempotency-Key':'admin-b:'+c.id});
  await page.goto('http://127.0.0.1:5173/legal-notices?bucket=open',{waitUntil:'networkidle0'});
  await page.waitForFunction(ref=>[...document.querySelectorAll('tr')].some(r=>r.textContent.includes(ref)&&r.querySelector('.assign')),{},c.reference);
  await page.screenshot({path:out+'/open.png'});
  await page.evaluate(ref=>[...document.querySelectorAll('tr')].find(r=>r.textContent.includes(ref)).querySelector('.assign').click(),c.reference);
  await page.waitForSelector('.advocate-option');
  await page.screenshot({path:out+'/picker.png'});console.log('Picker captured');
  const chosen=await page.$eval('.advocate-option .advocate-details strong',e=>e.textContent);
  await page.bringToFront();await page.evaluate(()=>document.querySelector('.advocate-option').click());await page.waitForFunction(()=>!document.querySelector('dialog'));
  await page.waitForFunction(ref=>![...document.querySelectorAll('td.reference')].some(r=>r.textContent.includes(ref)),{},c.reference);
  await page.screenshot({path:out+'/open-after-assignment.png'});
  const assigned=await request('/cases/'+c.id,token);
  assert.ok(assigned.advocate_id);assert.equal(assigned.status,'assigned');console.log('Human assignment confirmed');
  const mobile=await b.newPage();await mobile.setViewport({width:390,height:844});
  await mobile.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),client.tokens);
  const events=await request('/cases/'+c.id+'/events?limit=100',token);
  const assignedEvents=events.items.filter(e=>e.to_status==='assigned');
  assert.equal(assignedEvents.length,1);assert.equal(assignedEvents[0].source,'real');
  assert.equal(assignedEvents[0].actor_role,'admin');
  fs.writeFileSync(out+'/assignment-event.json',JSON.stringify(assignedEvents,null,2));
  await mobile.goto('http://localhost:8081/legal-notice/tracking?caseId='+c.id,{waitUntil:'networkidle0',timeout:90000});
  await mobile.waitForFunction(name=>document.body.innerText.includes(name),{timeout:60000},chosen);
  await mobile.screenshot({path:out+'/client-tracking.png',fullPage:true});
  await mobile.evaluate(name=>{const els=[...document.querySelectorAll('*')].filter(e=>e.textContent===name);els.at(-1)?.scrollIntoView({block:'center'});},chosen);
  await mobile.screenshot({path:out+'/client-advocate.png'});
  console.log(JSON.stringify({case:c.reference,id:c.id,advocate:chosen,status:assigned.status,advocate_id:assigned.advocate_id}));
  // Wait beyond the timer's assignment delay; it must not replace the advocate.
  await new Promise(r=>setTimeout(r,35000));
  const later=await request('/cases/'+c.id,token);assert.equal(later.advocate_id,assigned.advocate_id);
  console.log('Human assignment persists after demo timer tick; Open row removed; client tracking shows advocate.');
 } finally{await b.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
