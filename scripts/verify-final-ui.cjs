// Live browser pass over the P0 screens (11 Nov 2026). Signs in through the UI with
// existing demo identities; stores no tokens. Screenshots to reports/final-2026-11-11/ui.
const fs=require('node:fs'),path=require('node:path'),puppeteer=require('puppeteer-core');
process.loadEnvFile('apps/api/.env.local');
const mobile='https://legalitt-5.vercel.app',panel='https://legalitt-admin-panel.vercel.app',out=path.resolve('reports/final-2026-11-11/ui');fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const clientRoutes=['/home','/profile','/profile/edit','/requests','/documents','/payments','/notifications','/notification-preferences','/privacy','/account/security','/account/sessions','/account/password','/language','/account/privacy-settings','/account/data','/account/delete','/help','/advocates','/messages','/support','/callback','/support-chat','/services','/privacy-policy'];
const adminRoutes=['/support','/cancellations','/legal-notices'];
const bad=/Something went wrong|Unexpected error|Cannot read prop|undefined is not|is not available in this version|isn.t available yet in this app/i;
(async()=>{
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const results=[];
 async function visit(p,role,base,route){
  const errors=[];const onErr=e=>errors.push(e.message);p.on('pageerror',onErr);
  await p.goto(base+route,{waitUntil:'networkidle0',timeout:90000}).catch(e=>errors.push('nav '+e.message));
  await delay(2500);
  const text=await p.evaluate(()=>document.body.innerText);
  const loading=/Loading|Checking session/i.test(text)&&text.length<200;
  const ok=!errors.length&&text.trim().length>40&&!bad.test(text)&&!loading;
  await p.screenshot({path:path.join(out,`${role}${route.replace(/[\/?=&]/g,'_')}.png`)});
  p.off('pageerror',onErr);
  results.push({role,route,ok,errors,head:text.replace(/\s+/g,' ').slice(0,160)});
  console.log(ok?'OK  ':'FAIL',role,route,errors.join('; ').slice(0,200),ok?'':text.replace(/\s+/g,' ').slice(0,200));
 }
 for(const role of ['client','client-isolation']){
  const ctx=await browser.createBrowserContext(),p=await ctx.newPage();await p.setViewport({width:430,height:1000});
  await p.goto(mobile+'/login',{waitUntil:'networkidle0',timeout:90000});
  await p.type('input[placeholder="Email / Mobile No"]',`demo-${role}@legalitt.invalid`);await p.type('input[aria-label=Password]',password);
  await p.evaluate(()=>[...document.querySelectorAll('[role=button],button')].find(e=>e.textContent.trim()==='Continue').click());
  await p.waitForFunction(()=>location.pathname.endsWith('/home'),{timeout:60000});
  for(const r of clientRoutes)await visit(p,role,mobile,r);
  await ctx.close();
 }
 const ctx=await browser.createBrowserContext(),p=await ctx.newPage();await p.setViewport({width:1440,height:1000});
 await p.goto(panel+'/sign-in',{waitUntil:'networkidle0'});await p.type('input[name=email]','demo-admin@legalitt.invalid');await p.type('input[name=password]',password);
 await p.evaluate(()=>[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Sign in').click());await p.waitForFunction(()=>location.pathname==='/legal-notices',{timeout:60000});
 for(const r of adminRoutes)await visit(p,'admin',panel,r);
 await browser.close();
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checked_at:new Date().toISOString(),results},null,2)+'\n');
 const failed=results.filter(r=>!r.ok);console.log(`${results.length-failed.length}/${results.length} screens OK`);if(failed.length)process.exitCode=1;
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
