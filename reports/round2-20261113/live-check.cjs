const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const {ApiClient}=require('../../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const baseUrl='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const out='reports/round2-20261113/deploy';fs.mkdirSync(out,{recursive:true});
async function main(){
 const password=await require('../../apps/api/dist/src/auth/demo').demoPassword(),api={};
 for(const role of ['client','admin','advocate','advocate-2','client-isolation']){const r=await fetch(baseUrl+'/api/v1/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);const session=await r.json();api[role]=new ApiClient({baseUrl,getTokens:async()=>session.tokens});}
 const payments=await api.client.accountPayments();
 const hashes=Object.fromEntries(payments.items.map(p=>[p.id,crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex')]));
 if(process.argv.includes('--before')){fs.writeFileSync(out+'/existing-payment-hashes.json',JSON.stringify(hashes,null,2));console.log('Recorded '+Object.keys(hashes).length+' existing demo payment hashes; read-only.');return;}
 const before=JSON.parse(fs.readFileSync(out+'/existing-payment-hashes.json','utf8'));for(const[id,hash]of Object.entries(before))assert.equal(hashes[id],hash,'Existing payment '+id);
 console.log('PASS '+Object.keys(before).length+' existing payment records unchanged');
 const policy=await api.client.request('/support/settings');assert.deepEqual(policy.config.weekdays,[1,2,3,4,5,6]);assert.equal(policy.config.opens_at,'10:00');assert.equal(policy.config.closes_at,'19:00');assert.equal(policy.config.callback_hours,24);console.log('PASS authenticated support policy: Mon–Sat 10–19, callback within 24h');
 for(const[code,prices]of [['property_search',[49900,99900]],['document_forensic',[149900,299900]]]){
  const rows=await api.admin.request('/admin/report-tariffs/'+code);
  for(const[i,tier]of ['ordinary','urgent'].entries()){const row=rows.find(r=>r.tier===tier&&r.confirmed);assert.equal(Number(row.base_amount_paise),prices[i]);}
  for(const role of ['client','advocate'])await assert.rejects(api[role].request('/admin/report-tariffs/'+code),e=>e.status===403);
  console.log('PASS '+code+' confirmed tariffs and admin-only access');
 }
 const profile=await api.advocate.request('/account/signature');assert.ok(profile!==undefined);console.log('PASS signature profile route');
 const statePath='reports/round2-20261113/reports/live/state.json';
 if(fs.existsSync(statePath)){
  const state=JSON.parse(fs.readFileSync(statePath,'utf8')),c=state.cases.find(c=>c.service==='property_search'&&c.advocate);
  if(c){const advocateView=await api[c.advocate].case(c.id),clientView=await api.client.case(c.id),adminView=await api.admin.case(c.id);assert.equal(adminView.details.contact.mobile,'9000000000');assert.ok(!JSON.stringify(advocateView).includes('9000000000'),'Client intake phone remains private');assert.ok(!clientView.advocate?.phone,'Advocate phone remains private');await assert.rejects(api['client-isolation'].case(c.id),e=>e.status===404);const other=(await api['client-isolation'].cases()).items[0];assert.ok(other);await assert.rejects(api.client.case(other.id),e=>e.status===404);console.log('PASS live counterpart phone privacy and bidirectional client case isolation (404 both ways)');}
 }
 fs.writeFileSync(out+'/live-check.json',JSON.stringify({checked_at:new Date().toISOString(),existing_payments:Object.keys(before).length,tariffs:true,support:true,role_isolation:true},null,2)+'\n');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
