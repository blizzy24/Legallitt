// Read-only deployed tariff verification. Existing demo credential stays in memory.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
(async()=>{
 const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
 const login=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo-client@legalitt.invalid',password})});
 assert.equal(login.status,201);const session=await login.json(),api=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens}),rows=[];
 for(const [code,expected]of Object.entries({property_search:[[249900,368603],[399900,589853]],document_forensic:[[399900,589853],[599900,884853]],court_marriage:[[599900,884853]]})){
  const pricing=await api.reportPricing(code);assert.equal(pricing.confirmed,false);assert.equal(pricing.tiers.length,expected.length);
  for(const [i,t]of pricing.tiers.entries()){assert.equal(Number(t.base_amount_paise),expected[i][0]);assert.equal(Number(t.total_paise),expected[i][1]);assert.equal(Number(t.platform_fee_paise),expected[i][0]/4);assert.equal(Number(t.gst_paise),Math.round(expected[i][0]*1.25*.18));assert.equal(t.included_pages,25);assert.equal(t.page_unit_paise,'2500');}
  rows.push(pricing);
 }
 fs.writeFileSync('reports/report-services-2026-11-11/deployed-pricing.json',JSON.stringify({checked_at:new Date().toISOString(),rows},null,2)+'\n');
 console.log('PASS all five deployed provisional tariffs, 25% platform fee, 18% GST and page allowance.');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
