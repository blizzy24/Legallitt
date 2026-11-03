// Local fixed export, rendered in an isolated browser at the deployed origin.
// Reads the real deployed test case; intercepts only this browser's static files.
// This does not publish or modify the public Vercel deployment.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',mobile='https://legalitt-5.vercel.app';
const out=path.resolve('reports/demo-progression-2026-11-03/deployed'),dist=process.env.TIMELINE_EXPORT;
const id='65ca3bca-229d-4dc6-9d4a-c89ea420dcce';
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
async function main(){
 requireDemoMode();assert.ok(dist);assert.ok(fs.existsSync(path.join(dist,'index.html')));
 const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password:await demoPassword()})});assert.equal(login.status,201);const session=await login.json();
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const p=await browser.newPage();await p.setViewport({width:395,height:950});await p.emulateTimezone('Asia/Kolkata');const errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),session.tokens);
 await p.setRequestInterception(true);
 p.on('request',r=>{
  const u=new URL(r.url());if(u.origin!==mobile)return void r.continue();
  const pathname=decodeURIComponent(u.pathname),target=path.resolve(dist,'.'+pathname);
  if(!target.startsWith(path.resolve(dist)+path.sep))return void r.continue();
  const file=fs.existsSync(target)&&fs.statSync(target).isFile()?target:(!path.extname(pathname)?path.join(dist,'index.html'):null);
  if(file)return void r.respond({status:200,contentType:mime[path.extname(file)]??'application/octet-stream',body:fs.readFileSync(file)});
  void r.continue();
 });
 await p.goto(mobile+'/legal-notice/delivery?caseId='+id,{waitUntil:'networkidle0'});
 const completed=process.env.VERIFY_COMPLETED==='1';
 if(completed){
  await p.waitForFunction(()=>document.body.innerText.includes('View Delivery Confirmation'));
  assert.ok(!/ACTIVE/.test(await p.evaluate(()=>document.body.innerText)));
 }else{
  await p.waitForFunction(()=>document.body.innerText.includes('Out for Delivery  ACTIVE'));
  const text=await p.evaluate(()=>document.body.innerText);assert.ok(!text.includes('Delivered  ACTIVE'));assert.ok(!text.includes('View Delivery Confirmation'));
 }
 await p.evaluate(()=>[...document.querySelectorAll('*')].find(e=>e.textContent==='Delivery Progress')?.scrollIntoView({block:'start'}));
 await p.screenshot({path:path.join(out,completed?'client-delivered-timeline-fixed-local.png':'client-out-for-delivery-fixed-local.png')});
 fs.writeFileSync(path.join(out,completed?'timeline-completed-check.json':'timeline-waiting-check.json'),JSON.stringify({build:'Local export in isolated browser; public deployment unchanged',caseId:id,completed,active:completed?null:'Out for Delivery',errors},null,2));
 assert.deepEqual(errors,[]);console.log('PASS',completed?'Delivered complete, none active':'Out for Delivery active; Delivered pending');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
