// Read-only client observer: public bundle + real API, no response interception.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const out=path.resolve('reports/demo-progression-2026-11-03/live-after-fix'),base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const {id}=JSON.parse(fs.readFileSync(path.join(out,'case.json'))),delay=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 requireDemoMode();
 const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password:await demoPassword()})});assert.equal(r.status,201);const session=await r.json();
 const api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});
 let dispatched=false;for(let n=0;n<240;n++){const c=await api.case(id);if(c.status==='dispatched'){dispatched=true;break;}await delay(1000);}assert.ok(dispatched);
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 try{
 const p=await browser.newPage();await p.setViewport({width:395,height:950});await p.emulateTimezone('Asia/Kolkata');const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),session.tokens);
 await p.goto('https://legalitt-5.vercel.app/legal-notice/delivery?caseId='+id,{waitUntil:'networkidle0'});
 const observations=[];let arrived=false;
 for(let n=0;n<90;n++){
  const active=await p.evaluate(()=>document.body.innerText.split('\n').find(t=>t.includes('ACTIVE'))?.trim()??null);
  if(observations.at(-1)?.active!==active){observations.push({at:new Date().toISOString(),active});console.log('Client timeline',active);}
  assert.ok(!active?.startsWith('Delivered'));
  if(active?.startsWith('Out for Delivery')){arrived=true;break;}await delay(1000);
 }
 assert.ok(arrived);assert.ok(observations.some(o=>o.active&&!o.active.startsWith('Out for Delivery')),'Must observe an earlier milestone without reloading');
 await delay(15000);
 const text=await p.evaluate(()=>document.body.innerText);assert.match(text,/Out for Delivery\s+ACTIVE/);assert.doesNotMatch(text,/Delivered\s+ACTIVE|View Delivery Confirmation/);
 await p.evaluate(()=>[...document.querySelectorAll('*')].find(e=>e.textContent==='Delivery Progress')?.scrollIntoView({block:'start'}));
 await p.screenshot({path:path.join(out,'client-live-polling-out-for-delivery.png')});
 const c=await api.case(id),s=c.shipments.find(s=>s.direction==='to_recipient');assert.equal(c.status,'dispatched');assert.equal(s.status,'out_for_delivery');assert.equal(s.pod_document_id,null);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'client-live-polling.json'),JSON.stringify({id,url:p.url(),observations,reloads:0,responseInterception:false,shipment:s.status,pod:s.pod_document_id,errors},null,2));console.log('PASS current milestone advanced without refresh, then held Out for Delivery');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
