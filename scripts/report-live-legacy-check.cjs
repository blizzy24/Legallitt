// Read-only post-migration check. Never changes an existing filing or its files.
const fs=require('fs'),assert=require('node:assert/strict'),{ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
(async()=>{
 const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})});assert.ok(login.ok);
 const session=await login.json(),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens}),counts={},released=[];
 for(const service of ['property_search','document_forensic']){counts[service]={};let cursor;do{
  const page=await api.request('/cases?'+new URLSearchParams({service_code:service,limit:'100',...(cursor?{cursor}:{})}));
  for(const item of page.items){const flow=await api.request('/service-reports/'+item.id+'/workflow');if(!flow.legacy)continue;const c=await api.case(item.id),key=c.status+(c.sub_status?' / '+c.sub_status:'');counts[service][key]=(counts[service][key]??0)+1;assert.ok(flow.stage.key);assert.equal(flow.policy_version,1);
   if(c.status==='completed'){assert.equal(flow.stage.key,'delivered');assert.ok(c.report.released.document_ids.length);for(const id of c.report.released.document_ids){const url=await api.documentUrl(id);assert.equal((await fetch(url.url)).status,200);}released.push({service,files:c.report.released.document_ids.length});}
  }cursor=page.next_cursor;
 }while(cursor);}
 const before=JSON.parse(fs.readFileSync('reports/report-flows-20261113/legacy-inventory.json','utf8'));assert.deepEqual(counts,before.counts);
 fs.mkdirSync('reports/report-flows-20261113/live',{recursive:true});const result={checked_at:new Date().toISOString(),passed:true,counts,released};fs.writeFileSync('reports/report-flows-20261113/live/legacy-check.json',JSON.stringify(result,null,2)+'\n');console.log('PASS all seven legacy cases retain their statuses; completed reports remain downloadable.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
