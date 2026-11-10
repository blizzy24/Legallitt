// Targeted live privacy check on the existing synthetic isolation-client case.
// No payment, deletion, credential change or message to an external person.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ApiClient,ConsultationIntakeSchema}=require('../packages/shared/dist');
const {PDFDocument}=require('../apps/api/node_modules/pdf-lib');process.loadEnvFile('apps/api/.env.local');
const out=path.resolve('reports/consultation-services-2026-11-10/deployed'),baseUrl='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
async function main(){
 const proof=JSON.parse(fs.readFileSync(path.join(out,'verification.json'))),id=proof.results.find(r=>r.service==='legal_advice').isolation.other_case_id;
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={},sessions={},unfinished=[];
 for(const role of ['client-isolation','advocate','admin']){const r=await fetch(baseUrl+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);sessions[role]=await r.json();api[role]=new ApiClient({baseUrl,getTokens:async()=>sessions[role].tokens});}
 const client=api['client-isolation'];let record=await client.case(id);assert.equal(record.service_code,'legal_advice');
 if(record.status==='draft'){
  await client.request(`/consultations/${id}/intake`,{expected_updated_at:record.updated_at,intake:ConsultationIntakeSchema.parse({full_name:'TEST ONLY privacy verification client',phone:'2025550101',email:'privacy@example.invalid',matter_type:'General Consultation',description:'TEST ONLY unpublished upload error verification. No real matter or consultation.',consent:true})},'PATCH');
  const date=new Date(Date.now()+86400_000+330*60_000).toISOString().slice(0,10),advocate_id=sessions.advocate.user.id;
  const slots=await client.request(`/consultations/advocates/${advocate_id}/slots?date=${date}`),slot=slots.items.find(s=>s.available);assert.ok(slot);
  await client.request(`/consultations/${id}/reserve`,{advocate_id,scheduled_at:slot.scheduled_at});await client.request(`/consultations/${id}/submit`,{});
 }else assert.equal(record.status,'payment_pending');
 const pdf=await PDFDocument.create();pdf.addPage().drawText('TEST ONLY synthetic upload privacy verification. No actual client information.');const bytes=await pdf.save();
 const upload=async row=>{await row.api.upload(row.ticket,new Blob([bytes],{type:'application/pdf'}));row.done=true;};
 try{
  const ticket=await api.admin.presign({case_id:id,kind:'supporting_document',filename:'TEST PRIVATE review-team upload.pdf',mime:'application/pdf'}),privateRow={api:api.admin,ticket,done:false};unfinished.push(privateRow);
  const hidden=await client.request(`/consultations/${id}/payment-quote`,{purpose:'service_fee'});
  assert.equal(hidden.status,'blocked');assert.equal(hidden.code,'advocate_upload_pending');assert.equal(hidden.documents.length,0);assert.match(hidden.message,/case chat/);assert.ok(!JSON.stringify(hidden).includes(ticket.document.id));assert.ok(!JSON.stringify(hidden).includes('TEST PRIVATE'));
  await upload(privateRow);await assert.rejects(client.documentUrl(ticket.document.id),{status:404});
  const ownTicket=await client.presign({case_id:id,kind:'supporting_document',filename:'TEST client upload.pdf',mime:'application/pdf'}),ownRow={api:client,ticket:ownTicket,done:false};unfinished.push(ownRow);
  const own=await client.request(`/consultations/${id}/payment-quote`,{purpose:'service_fee'});assert.equal(own.status,'blocked');assert.equal(own.code,'document_pages_unresolved');assert.ok(own.documents.some(d=>d.id===ownTicket.document.id&&d.filename==='TEST client upload.pdf'));assert.ok(!JSON.stringify(own).includes('TEST PRIVATE'));
  await upload(ownRow);const ready=await client.request(`/consultations/${id}/payment-quote`,{purpose:'service_fee'});assert.equal(ready.status,'ready');assert.equal(ready.breakdown.total_paise,'88500');
  const view=await client.request(`/consultations/${id}`);assert.equal(view.payments.length,0);assert.ok(!view.uploads.some(d=>d.id===ticket.document.id));
  fs.writeFileSync(path.join(out,'private-upload-errors.json'),JSON.stringify({case_id:id,private_upload_hidden:true,private_download_status:404,hidden_error:hidden,client_owned_error:own,ready_total_paise:ready.breakdown.total_paise,pdf_pages:ready.breakdown.total_pages,payments:0},null,2)+'\n');console.log('PASS private upload errors opaque; client upload errors actionable; no payment captured');
 }finally{for(const row of unfinished)if(!row.done)await upload(row);}
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
