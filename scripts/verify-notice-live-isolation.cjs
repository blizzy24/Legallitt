const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist'),kit=require('./helpers/fir-walk-kit.cjs');
process.loadEnvFile('apps/api/.env.local');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',mobile='https://legalitt-5.vercel.app',out=path.resolve('reports/notice-polish-20261112/live');
async function main(){
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={},api={};
 for(const name of ['client','client-isolation','advocate']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${name}@legalitt.invalid`,password})});assert.equal(r.status,201);sessions[name]=await r.json();api[name]=new ApiClient({baseUrl:base,getTokens:async()=>sessions[name].tokens});}
 const primaryState=JSON.parse(fs.readFileSync(path.join(out,'state.json'))).cases[0];assert.ok(primaryState?.id);
 const primary=await api.client.case(primaryState.id);assert.ok(primary.reference,'Primary case reference is required for browser leak assertion');
 const isolation=(await api['client-isolation'].request('/cases?limit=100')).items.find(c=>c.service_code==='legal_notice');assert.ok(isolation?.id);assert.ok(isolation.reference,'Other client case reference is required for browser leak assertion');
 const get=(role,suffix)=>fetch(base+'/api/v1'+suffix,{headers:{Authorization:'Bearer '+sessions[role].tokens.idToken}}),results=[],errors=[];
 const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  for(const [role,own,foreign]of [['client',primary,isolation],['client-isolation',isolation,primary]]){
   assert.equal((await get(role,'/cases/'+own.id)).status,200);
   for(const suffix of ['/cases/'+foreign.id,'/notices/'+foreign.id+'/flow']){const r=await get(role,suffix);assert.equal(r.status,404);results.push({role,path:suffix,status:404});}
   const p=await kit.signIn(browser,null,{role,email:`demo-${role}@legalitt.invalid`,password,mobile,errors});await kit.go(p,mobile+'/legal-notice/tracking?caseId='+foreign.id);
   await p.waitForFunction(()=>/not found|not available|couldn.t|failed/i.test(document.body.innerText));const text=await p.evaluate(()=>document.body.innerText);assert.ok(!text.includes(foreign.reference));await p.screenshot({path:path.join(out,role+'-foreign-case.png'),fullPage:true});
   results.push({role,browser:'foreign case refused without reference or case details'});
  }
  assert.equal((await get('advocate','/cases/'+primary.id)).status,404);results.push({role:'replaced advocate',status:404});
  const list=(await api.client.request('/cases?limit=100')).items.filter(c=>c.service_code==='legal_notice');let legacy=0;
  for(const c of list.filter(c=>c.id!==primary.id&&['approved','dispatching','dispatched','completed'].includes(c.status))){const f=await api.client.request('/notices/'+c.id+'/flow');assert.equal(f.case_id,c.id);assert.ok(f.stage.client);legacy++;}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'isolation.json'),JSON.stringify({checked_at:new Date().toISOString(),bidirectional:true,legacy_dispatch_cases_opened:legacy,results,page_errors:errors},null,2)+'\n');
  console.log('PASS bidirectional direct URLs, flow endpoints, replaced advocate denial and '+legacy+' existing dispatch/completed cases');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
