const {test}=require('node:test'),assert=require('node:assert/strict');
const {caseClientFees}=require('../dist/src/cases/client-fees');
const base={base_amount_paise:99900n,gst_bps:1800};
const addons=[{variant:'platform_fee',base_amount_paise:19900n,gst_bps:1800},{variant:'delivery_fee',base_amount_paise:17900n,gst_bps:1800}];
const payment={base_amount_paise:137700n,gst_paise:24786n,total_paise:162486n,simulated:true,captured_at:new Date()};
test('receipt-backed client fees never derive an advocate payout',()=>{
 assert.deepEqual(caseClientFees(base,payment,addons),{service_fee_paise:'99900',platform_fee_paise:'19900',delivery_fee_paise:'17900',gst_paise:'24786',total_paise:'162486',breakdown_complete:true,simulated:true});
});
test('historical case price, not current price, reconciles with its payment',()=>{
 const old={...base,base_amount_paise:137700n},receipt={...payment,base_amount_paise:175500n,gst_paise:31590n,total_paise:207090n};
 assert.equal(caseClientFees(old,receipt,addons).breakdown_complete,true);
 const result=caseClientFees(base,receipt,addons);assert.equal(result.breakdown_complete,false);assert.equal(result.platform_fee_paise,null);assert.equal(result.total_paise,'207090');
});
test('missing historical addons hide both charges, retaining recorded receipt amounts',()=>{
 const result=caseClientFees(base,payment,[]);assert.equal(result.platform_fee_paise,null);assert.equal(result.delivery_fee_paise,null);assert.equal(result.gst_paise,'24786');
});
test('unpaid/sparse case never turns unknown totals into zero',()=>{
 const result=caseClientFees(null,undefined,[]);assert.equal(result.service_fee_paise,null);assert.equal(result.total_paise,null);assert.equal(result.gst_paise,null);
});
test('real zero charge is a value, not missing',()=>{
 const zero={base_amount_paise:0n,gst_bps:1800};const result=caseClientFees(zero,{...payment,base_amount_paise:0n,gst_paise:0n,total_paise:0n},[{...zero,variant:'platform_fee'},{...zero,variant:'delivery_fee'}]);assert.equal(result.breakdown_complete,true);assert.equal(result.platform_fee_paise,'0');
});
