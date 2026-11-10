// Read-only cross-client checks of the eight completed synthetic walkthroughs.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const root=path.resolve('reports/report-services-2026-11-11'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p))),wait=()=>new Promise(r=>setTimeout(r,500));
(async()=>{
 const cases=[...read('deployed/verification.json').results,...read('consultation-regression/deployed/verification.json').results,
  {service:'fir_draft',case_id:read('fir-regression/deployed/verification.json').case_id},
  {service:'legal_notice',case_id:read('legal-notice-deployed/verification.json').case.id}];
 assert.equal(new Set(cases.map(c=>c.service)).size,8);
 const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={};
 for(const role of ['client','client-isolation']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);const s=await r.json();api[role]=new ApiClient({baseUrl:base,fetch:require('./helpers/verification-fetch.cjs'),getTokens:async()=>s.tokens});await wait();}
 const results=[];
 for(const c of cases){
  const owned=await api.client.case(c.case_id);assert.equal(owned.status,'completed');await wait();
  const others=await api['client-isolation'].cases(undefined,c.service),other=others.items[0];assert.ok(other,'Second client has a '+c.service+' case');assert.notEqual(other.client_id,owned.client_id);await wait();
  await assert.rejects(api['client-isolation'].case(c.case_id),{status:404});await wait();
  await assert.rejects(api.client.case(other.id),{status:404});await wait();
  results.push({service:c.service,case_id:c.case_id,reference:owned.reference,foreign_case_id:other.id,other_client_to_completed_case:404,client_to_other_case:404});
 }
 fs.writeFileSync(path.join(root,'deployed-isolation.json'),JSON.stringify({checked_at:new Date().toISOString(),results},null,2)+'\n');
 console.log('PASS both directions return 404 for all eight services.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
