// Explicit development verification setup, never invoked by the admin UI.
// Creates a case through real intake/payment/assignment/drafting endpoints.
const fs=require('node:fs');const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
(async()=>{
 requireDemoMode();const file='reports/admin-chunk-c/drafting-case.json';if(fs.existsSync(file)){console.log('Existing drafting verification case retained');return;}
 const password=await demoPassword();
 async function request(route,token,body,headers={}){const r=await fetch('http://127.0.0.1:3006/api/v1'+route,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});const result=await r.json();if(!r.ok)throw Error(route+': '+JSON.stringify(result));return result;}
 const signIn=async email=>(await request('/auth/login',null,{email,password})).tokens.idToken;
 const admin=await signIn('demo-admin@legalitt.invalid'), client=await signIn('demo-client@legalitt.invalid'), advocate=await signIn('demo-advocate-4@legalitt.invalid');
 const people=await request('/admin/advocates',admin), selected=people.items.find(p=>p.name==='Demo Advocate Meera');
 const source=await request('/cases/114e2ec1-fd06-47b8-b4a0-ffdc44e133f7',client);
 const c=await request('/cases',client,{service_code:'legal_notice',tier:source.tier,matter_type:source.matter_type,details:source.details});
 fs.writeFileSync(file,JSON.stringify({id:c.id,reference:c.reference},null,2));
 await request('/cases/'+c.id+'/submit',client,{});
 await request('/payments/intents',client,{case_id:c.id,purpose:'service_fee'},{'Idempotency-Key':'detail-verification:'+c.id});
 await request('/admin/cases/'+c.id+'/assign',admin,{advocate_id:selected.id});
 await request('/cases/'+c.id+'/accept',advocate,{});await request('/cases/'+c.id+'/start',advocate,{});
 // Reuse the existing simulator's explicitly labelled sample, never invent legal prose.
 const sample=await request('/admin/cases/464693c9-5cdd-44c7-95aa-a15e905e7543',admin);
 await request('/cases/'+c.id+'/drafts',advocate,{kind:'legal_notice',generated_by:'manual',content:sample.drafts[0].content});
 console.log('Created real intake → payment → human assignment → accepted → drafting case '+c.reference);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
