// Read-only deployed audit; existing zero-workload demo advocate, no new account.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {demoPassword}=require('../apps/api/dist/src/auth/demo');
const base=process.env.AUDIT_MOBILE_URL||'https://legalitt-5.vercel.app',api='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const out=path.resolve('reports/advocate-five-states-2026-11-04',process.env.AUDIT_PHASE||'before');
function routes(dir,base=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?routes(path.join(dir,e.name),base+'/'+e.name):e.name.endsWith('.tsx')&&!e.name.startsWith('_')?[(e.name==='index.tsx'?base:base+'/'+e.name.slice(0,-4)).replace(/\/\([^)]+\)/g,'')]:[]);}
(async()=>{
 fs.mkdirSync(out,{recursive:true});const res=await fetch(api+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-advocate-2@legalitt.invalid',password:await demoPassword()})});assert.equal(res.status,201);const session=await res.json();
 const response=await fetch(api+'/api/v1/cases',{headers:{Authorization:'Bearer '+session.tokens.idToken}});assert.equal(response.status,200);const cases=await response.json();assert.equal(cases.items.length,0,'audit account must have no cases');
 const all=[...routes('apps/mobile/app/advocate','/advocate'),...routes('apps/mobile/app/(advocate)')].sort();
 const missing='00000000-0000-4000-8000-000000000001',rows=[];const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});let index=0;
 try{await Promise.all(Array.from({length:2},async()=>{while(index<all.length){const route=all[index++],url=route.replace(/\[[^\]]+\]/g,missing);const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.setViewport({width:430,height:950});await page.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),session.tokens);
 await page.goto(base+url,{waitUntil:'networkidle0',timeout:45000});const text=await page.evaluate(()=>document.body.innerText.trim());
 rows.push({route,url:page.url(),text,errors});
 if(['/dashboard','/matters','/advocate/notifications','/earnings','/clients','/advocate/notice/[id]/fee','/advocate/notice/[id]/review','/advocate/notice/[id]/dispatch','/advocate/notice/[id]/draft'].includes(route))await page.screenshot({path:path.join(out,(route.replaceAll('/','_').replaceAll('[id]','case')||'root')+'.png')});
 }catch(e){rows.push({route,error:e.message,errors});}finally{await page.close();}if(rows.length%25===0)console.log(rows.length+'/'+all.length);}}));
 }finally{await browser.close();}
 rows.sort((a,b)=>a.route.localeCompare(b.route));fs.writeFileSync(path.join(out,'all-routes.json'),JSON.stringify({account:session.user.name,caseCount:0,routes:rows},null,2));console.log('Audited',rows.length,'advocate routes with zero cases');
})().catch(e=>{console.error(e.message);process.exitCode=1});
