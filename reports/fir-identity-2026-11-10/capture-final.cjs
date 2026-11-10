// Read-only final audit. Credentials remain in memory; output is allowlisted.
const fs=require('node:fs'),assert=require('node:assert/strict');
process.loadEnvFile('apps/api/.env.local');
async function main(){
 const {ApiClient}=require('../../packages/shared/dist');
 const proof=JSON.parse(fs.readFileSync(__dirname+'/deployed/verification.json','utf8'));
 const password=await require('../../apps/api/dist/src/auth/demo').demoPassword();
 const baseUrl='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
 const response=await fetch(baseUrl+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})});
 assert.equal(response.status,201);const session=await response.json();
 const api=new ApiClient({baseUrl,getTokens:async()=>session.tokens});
 const record=await api.adminCase(proof.case_id);
 const service=await api.request('/services/fir_draft'),policy=service.config.fir_identity_policy;
 assert.equal(policy.required,true);assert.deepEqual(policy.accepted_documents.map(d=>d.code),['masked_aadhaar','passport','voter_id','driving_licence']);
 const identity=record.documents.filter(d=>d.kind==='id_proof');assert.equal(identity.length,1);
 assert.equal(identity[0].identity_evidence.document_type,'passport');
 assert.deepEqual(Object.keys(identity[0].identity_evidence).sort(),['declared_at','document_type','masked_copy','policy_version']);
 assert.equal(record.status,'completed');assert.equal(record.sub_status,null);
 assert.ok(record.approval.approved_at);assert.equal(record.approval.draft_id,proof.approval.draft_id);
 const events=record.events.filter(e=>['fir_draft_submitted','fir_draft_approved','fir_released_to_client'].includes(e.type));
 assert.equal(events.length,3);
 assert.equal(events.find(e=>e.type==='fir_draft_approved').actor.role,'admin');
 assert.equal(events.find(e=>e.type==='fir_released_to_client').to_status,'completed');
 fs.writeFileSync(__dirname+'/deployed/final-audit.json',JSON.stringify({id:record.id,reference:record.reference,status:record.status,sub_status:record.sub_status,approval:record.approval,events,identity_policy:policy,identity_evidence:identity.map(d=>({id:d.id,filename:d.filename,evidence:d.identity_evidence}))},null,2)+'\n');
 console.log('PASS persisted admin approval and client release audit for '+record.reference);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
