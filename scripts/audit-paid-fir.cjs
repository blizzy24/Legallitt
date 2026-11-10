// Read-only development audit. Credentials stay in memory; no case mutations.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
async function main(){
 const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-admin@legalitt.invalid',password})});assert.equal(response.status,201);
 const session=await response.json(),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});
 const evidence=JSON.parse(fs.readFileSync('reports/fir-approval-2026-11-10/deployed/verification.json','utf8'));
 const rows=[];let cursor;
 do{const page=await api.adminCases({service:'fir_draft',limit:100,...(cursor?{cursor}:{})});rows.push(...page.items);cursor=page.next_cursor;}while(cursor);
 const cases=[];
 for(const row of rows){
  const detail=await api.adminCase(row.id),owner=detail.contacts.find(c=>c.role==='client'),payments=detail.payments.filter(p=>p.status==='captured');
  const known=evidence.case_id===row.id,synthetic=owner?.email==='demo-client@legalitt.invalid'&&known&&String(detail.intake.incident?.description??'').includes('TEST ONLY')&&payments.length>0&&payments.every(p=>p.simulated);
  cases.push({id:row.id,reference:row.reference,status:row.status,captured_payments:payments.length,all_payments_simulated:payments.length>0&&payments.every(p=>p.simulated),demo_owner:owner?.email==='demo-client@legalitt.invalid',matches_previous_walkthrough:known,confirmed_ours:synthetic});
 }
 const report={checked_at:new Date().toISOString(),source:base,eligible_case_count:cases.length,paid_case_count:cases.filter(c=>c.captured_payments>0).length,unfinished_paid_case_count:cases.filter(c=>c.captured_payments>0&&!['completed','cancelled','refunded'].includes(c.status)).length,unverified_cases:cases.filter(c=>!c.confirmed_ours).length,cases,mutation:'none'};
 const out='reports/fir-draft-2026-11-10';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'paid-case-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 if(report.unverified_cases)throw new Error('STOP: an eligible FIR case is not positively identified as our synthetic walkthrough. Do not mutate cases.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
