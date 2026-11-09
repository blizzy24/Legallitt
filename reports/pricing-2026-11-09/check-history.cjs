const fs=require('node:fs'),assert=require('node:assert/strict');
process.loadEnvFile('apps/api/.env.local');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const out='reports/pricing-2026-11-09';
(async()=>{
  const phase=process.argv[2];assert.ok(['before','after'].includes(phase));
  const password=await require('../../apps/api/dist/src/auth/demo').demoPassword();
  const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password})});
  assert.equal(login.status,201);const session=await login.json();
  const response=await fetch(base+'/api/v1/cases/a57919a4-2ee1-4431-b79b-6b9161947306',{headers:{Authorization:'Bearer '+session.tokens.idToken}});
  assert.equal(response.status,200);const c=await response.json();
  const record={id:c.id,reference:c.reference,status:c.status,pricing_id:c.pricing_id,pricing:c.pricing,client_fees:c.client_fees};
  if(phase==='after') {
    assert.deepEqual(record,JSON.parse(fs.readFileSync(out+'/historical-before.json')),'Historical case and receipt must not change');
    const quote=await fetch(base+'/api/v1/payments/quotes',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.tokens.idToken},body:JSON.stringify({case_id:c.id})});
    assert.equal(quote.status,201,'New quote endpoint is live');
    assert.equal((await quote.json()).code,'case_stage','Completed case cannot be charged again');
  }
  fs.writeFileSync(out+'/historical-'+phase+'.json',JSON.stringify(record,null,2)+'\n');
  console.log('PASS historical receipt '+phase+': '+record.reference+' = '+record.client_fees.total_paise+' paise');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
