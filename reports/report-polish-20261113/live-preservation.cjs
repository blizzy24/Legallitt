// Read only. No names, contact details, document bodies or credentials in output.
const fs=require('fs'),assert=require('assert/strict'),{ApiClient}=require('../../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
(async()=>{const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',password=await require('../../apps/api/dist/src/auth/demo').demoPassword();
const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})});assert.equal(login.status,201);const session=await login.json(),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens}),cases=[];
for(const service of ['property_search','document_forensic']){let cursor;do{const page=await api.request('/cases?'+new URLSearchParams({service_code:service,limit:'100',...(cursor?{cursor}:{})}));for(const c of page.items)cases.push({id:c.id,service,status:c.status,sub_status:c.sub_status,updated_at:c.updated_at});cursor=page.next_cursor;}while(cursor);}
const root='reports/report-polish-20261113/deploy/',file=root+'existing-cases-before.json';
if(process.argv.includes('--verify')){const before=JSON.parse(fs.readFileSync(file));for(const prior of before){const current=cases.find(c=>c.id===prior.id);assert.deepEqual(current,prior,'Pre-existing case unchanged: '+prior.id);}fs.writeFileSync(root+'existing-cases-after.json',JSON.stringify({unchanged:before.length,checked_at:new Date().toISOString()},null,2)+'\n');console.log('PASS '+before.length+' pre-existing PS/DF cases retain status and update time');}
else{assert.ok(!fs.existsSync(file),'Do not replace the pre-deployment baseline');fs.writeFileSync(file,JSON.stringify(cases,null,2)+'\n');console.log('Recorded '+cases.length+' existing cases (read only)');}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
