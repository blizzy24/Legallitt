const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {demoPassword}=require('../apps/api/dist/src/auth/demo');
const base=process.env.VERIFY_MOBILE_URL||'https://legalitt-5.vercel.app',api='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const exported=process.env.VERIFY_EXPORT&&path.resolve(process.env.VERIFY_EXPORT);
const mime={'.html':'text/html','.js':'application/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
const out=path.resolve('reports/advocate-five-states-2026-11-04',process.env.VERIFY_PHASE||'deployed');
(async()=>{fs.mkdirSync(out,{recursive:true});const password=await demoPassword();
 const sessions={};for(const key of ['demo-advocate','demo-advocate-2','demo-advocate-3']){const r=await fetch(api+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:key+'@legalitt.invalid',password})});assert.equal(r.status,201);sessions[key]=await r.json();}
 const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const evidence=[];async function pageFor(account){const page=await browser.newPage();await page.setViewport({width:430,height:1000});await page.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),sessions[account].tokens);
 await page.setRequestInterception(true);page.on('request',req=>{const u=new URL(req.url());
 if(page.auditLoading && u.pathname==='/api/v1/cases')return;
 if(page.auditPartial && u.pathname==='/api/v1/cases/'+page.auditPartial.id)return void req.respond({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify(page.auditPartial)});
 if(page.auditFault && u.pathname==='/api/v1/cases')return void req.respond({status:503,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(base).origin},body:JSON.stringify({message:'Test unavailable'})});
 if(exported&&u.origin===new URL(base).origin){const target=path.resolve(exported,'.'+decodeURIComponent(u.pathname));if(target.startsWith(exported+path.sep)){const file=fs.existsSync(target)&&fs.statSync(target).isFile()?target:!path.extname(u.pathname)?path.join(exported,'index.html'):null;if(file)return void req.respond({status:200,contentType:mime[path.extname(file)]??'application/octet-stream',body:fs.readFileSync(file)});}}
 void req.continue();});return page;}
 async function capture(page,route,name,expected){await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:45000});if(expected)await page.waitForFunction(text=>document.body.innerText.includes(text),{timeout:30000},expected);else await page.waitForNetworkIdle({idleTime:600,timeout:8000}).catch(()=>{});const text=await page.evaluate(()=>document.body.innerText);await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});evidence.push({name,route,text});return text;}
 try{
  const empty=await pageFor('demo-advocate-2');await capture(empty,'/dashboard','dashboard-empty','No cases assigned yet');await capture(empty,'/matters','matters-empty','No cases assigned yet');await capture(empty,'/advocate/notifications','notifications-empty');
  await capture(empty,'/advocate/notice/00000000-0000-4000-8000-000000000001/fee','fee-unavailable','This case could not be loaded');await empty.close();
  const page=await pageFor('demo-advocate');await capture(page,'/dashboard','dashboard-work','RESOLVED');
  const live=await(await fetch(api+'/api/v1/cases?limit=100',{headers:{Authorization:'Bearer '+sessions['demo-advocate'].tokens.idToken}})).json();
  const grouped={'Needs Review':['assigned','draft','submitted','payment_pending','paid','assigning'],'In Progress':['advocate_accepted','in_progress','changes_requested','client_review','approved','dispatching','dispatched'],'Resolved':['completed','cancelled','refunded','advocate_declined']};
  for(const [group,statuses] of Object.entries(grouped)){const count=live.items.filter(c=>statuses.includes(c.status)).length;const text=await page.$eval('[data-testid="dashboard-stat-'+group+'"]',e=>e.textContent);assert(text.endsWith(String(count)));evidence.push({group,count});}

  for(const filter of ['Needs Review','In Progress','Resolved']){await page.goto(base+'/dashboard',{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-testid="dashboard-stat-'+filter+'"]');await page.click('[data-testid="dashboard-stat-'+filter+'"]');await page.waitForFunction(()=>location.pathname==='/matters');assert.equal(new URL(page.url()).searchParams.get('filter'),filter);await page.waitForNetworkIdle({idleTime:500,timeout:8000}).catch(()=>{});await page.screenshot({path:path.join(out,'matters-'+filter.toLowerCase().replaceAll(' ','-')+'.png'),fullPage:true});}
  for(const account of ['demo-advocate','demo-advocate-3']){const r=await fetch(api+'/api/v1/cases?limit=100',{headers:{Authorization:'Bearer '+sessions[account].tokens.idToken}});const cases=await r.json();
    const target=cases.items.find(c=>c.status==='assigned')||cases.items.find(c=>c.status==='in_progress')||cases.items[0];if(!target)continue;
    const p=await pageFor(account),data=await (await fetch(api+'/api/v1/cases/'+target.id,{headers:{Authorization:'Bearer '+sessions[account].tokens.idToken}})).json();
    assert(data.client_fees,'deployed API must supply client fee metadata');
    const text=await capture(p,'/advocate/notice/'+target.id+'/fee','fee-'+account,'The payout split isn’t configured yet.');if(data.client_fees?.total_paise)assert(text.includes('₹'+Number((BigInt(data.client_fees.total_paise)+50n)/100n).toLocaleString('en-IN')));
    const review=cases.items.find(c=>c.status==='client_review')||target;if(review){const t=await capture(p,'/advocate/notice/'+review.id+'/review','client-review-'+account);assert(!t.includes('MESSAGE SENT TO CLIENT'));}
    evidence.push({account,case:target.reference,clientFees:data.client_fees});
    if(data.client_fees?.total_paise!=null){p.auditPartial={...data,matter_type:null,client_fees:{...data.client_fees,platform_fee_paise:null,delivery_fee_paise:null,breakdown_complete:false}};
      const partial=await capture(p,'/advocate/notice/'+target.id+'/fee','fee-partial','Some historical charges could not be verified');assert(!partial.includes('Platform Fee'));assert(!partial.includes('Delivery Fee'));}
    await p.close();}
  // Browser-only fault injection: no API or database changes.
  const failed=await pageFor('demo-advocate-2');failed.auditFault=true;await capture(failed,'/dashboard','dashboard-error','Couldn’t load your cases. Try again.');failed.auditFault=false;await failed.evaluate(()=>[...document.querySelectorAll('[role=button]')].find(e=>e.textContent==='Try again').click());await failed.waitForFunction(()=>document.body.innerText.includes('No cases assigned yet'));await failed.close();
  const loading=await pageFor('demo-advocate-2');loading.auditLoading=true;await capture(loading,'/dashboard','dashboard-loading','Loading your cases…');await loading.close();
  await page.close();
 }finally{await browser.close();}
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({build:exported?'Local export in isolated browser; deployed API unchanged':'Deployed site',evidence},null,2));console.log('Verified empty/work/error dashboard, filtered links, missing case and recorded fees.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
