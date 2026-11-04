// Read-only navigation audit, real sessions; optional local export served in an isolated browser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {demoPassword}=require('../apps/api/dist/src/auth/demo');
const base='https://legalitt-5.vercel.app',api='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const phase=process.env.AUDIT_PHASE||'before',out=path.resolve('reports/navigation-data-2026-11-04',phase),exported=process.env.AUDIT_EXPORT&&path.resolve(process.env.AUDIT_EXPORT);
const paths={advocate:['/dashboard','/matters','/clients','/earnings','/advocate/analytics','/advocate/settings','/advocate/settings/bank','/advocate/settings/devices','/advocate/settings/security','/advocate/reviews','/advocate/calendar','/advocate/clients/rahul','/advocate/wallet/withdraw','/advocate/notifications'],client:['/home','/cases','/advocates','/profile','/messages','/documents','/documents/sample','/payments','/profile/edit','/requests','/notifications','/privacy','/language','/support-chat','/legal-advice','/fir','/property-search','/legal-notice']};
(async()=>{fs.mkdirSync(out,{recursive:true});const password=await demoPassword(),browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true}),rows=[];
try{await Promise.all(Object.entries(paths).map(async([role,routes])=>{const r=await fetch(api+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:(role==='client'?'demo-client':'demo-advocate-2')+'@legalitt.invalid',password})});assert.equal(r.status,201);const session=await r.json(),context=await browser.createBrowserContext(),page=await context.newPage();await page.setViewport({width:430,height:950});await page.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),session.tokens);
const errors=[];page.on('pageerror',e=>errors.push(e.message));if(exported){await page.setRequestInterception(true);page.on('request',req=>{const u=new URL(req.url()),file=path.resolve(exported,'.'+u.pathname);if(u.origin===base&&file.startsWith(exported+'/')){const target=fs.existsSync(file)&&fs.statSync(file).isFile()?file:!path.extname(u.pathname)?path.join(exported,'index.html'):null;if(target)return void req.respond({status:200,contentType:({'.js':'application/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf'})[path.extname(target)]||'application/octet-stream',body:fs.readFileSync(target)});}void req.continue();});}
for(const route of routes){await page.goto(base+route,{waitUntil:'networkidle0',timeout:45000});const text=await page.evaluate(()=>document.body.innerText);await page.screenshot({path:path.join(out,role+route.replaceAll('/','-')+'.png'),fullPage:true});rows.push({role,route,text,errors:errors.splice(0)});
if(phase!=='before') {
 const real=role==='advocate'?['/dashboard','/matters','/advocate/settings','/advocate/notifications']:['/home','/cases','/profile','/requests','/notifications','/legal-notice'];
 if(!real.includes(route))assert(text.includes('Not available yet'),route+' must gate fixtures');
 if(route==='/profile'||route==='/advocate/settings'){assert(text.includes(session.user.name));assert(!/rahul.sharma@example.com|Priya.sharma@gmail.com|3 Active|System Default/.test(text));}
 if(route==='/home')assert(text.includes('Hello, '+session.user.name.split(' ')[0]));
 if(route==='/cases')assert(!text.includes('HEARINGS'));
}
console.log(role,route);}
if(phase!=='before'){
 // Follow actual tabs, not only direct URLs. Gates must retain a usable exit.
 await page.goto(base+(role==='advocate'?'/dashboard':'/home'),{waitUntil:'networkidle0'});
 for(const label of role==='advocate'?['Clients','Earnings','Matters','Dashboard']:['Advocates','Profile','Cases','Home']){
 console.log('Tap',role,label);const selector='[role="tab"][aria-label="'+label+'"]';await page.waitForSelector(selector);let clicked=false;for(const element of await page.$$(selector)){const box=await element.boundingBox();if(box&&box.width>0&&box.height>0&&box.x>=0&&box.x<430&&box.y>=0&&box.y<950){await element.click();clicked=true;break;}}assert(clicked,'visible tab '+label);await page.waitForNetworkIdle({idleTime:350,timeout:8000}).catch(()=>{});
 }
 if(role==='client'){
 const list=await(await fetch(api+'/api/v1/cases?limit=100',{headers:{Authorization:'Bearer '+session.tokens.idToken}})).json();
 const c=list.items.find(c=>c.advocate_id);
 assert(c,'a real assigned case is needed');
 for(const route of ['/legal-notice/tracking?caseId='+c.id,'/advocates/'+c.advocate_id+'?caseId='+c.id,'/chat/advocate?notice=1&caseId='+c.id]){
 await page.goto(base+route,{waitUntil:'networkidle0'});assert.equal(await page.$('[data-testid="account-data-unavailable"]'),null,'real Notice path must stay available');
 const text=await page.evaluate(()=>document.body.innerText);assert(text.trim().length>40);rows.push({role,route,text,errors:errors.splice(0)});
 }
 }
}
await context.close();}));}finally{await browser.close();}
fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({source:exported?'Isolated local export, deployed API':'Deployed site',rows},null,2));assert(rows.every(r=>!r.errors.length),'browser exceptions');console.log('Captured',rows.length,'routes');})().catch(e=>{console.error(e.message);process.exitCode=1});
