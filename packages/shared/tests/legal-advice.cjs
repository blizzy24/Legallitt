const {test}=require('node:test');
const assert=require('node:assert/strict');
const {LegalAdviceConfigSchema,legalAdviceTierFor}=require('../dist');
const manifest=require('../../../apps/api/prisma/legal-advice-rebuild.json');
test('Legal Advice seed policy is complete, preserves explicit unpriced tariffs and integer paise',()=>{
 const config=LegalAdviceConfigSchema.parse(manifest);
 assert.equal(config.tariffs.length,12);
 assert.equal(config.tariffs.filter(t=>t.base_paise===null).length,9);
 assert.deepEqual(config.tariffs.filter(t=>t.tier_code==='emerging').map(t=>t.base_paise),['49900','69900','99900']);
 assert.equal(config.minimum_notice_minutes,180);
 assert.equal(config.written_advice_base_paise,'10000');
});
test('Experience boundaries have exactly one tier; unknown experience is not priced as Emerging',()=>{
 const {tiers}=LegalAdviceConfigSchema.parse(manifest);
 for(const [years,tier] of [[0,'emerging'],[4.99,'emerging'],[5,'experienced'],[10,'highly_experienced'],[15,'veteran'],[60,'veteran']])assert.equal(legalAdviceTierFor(years,tiers)?.code,tier);
 for(const years of [null,undefined,-1,NaN,Infinity])assert.equal(legalAdviceTierFor(years,tiers),null);
});
test('Admin config rejects missing, overlapping or duplicate tier prices and invalid hours',()=>{
 const invalid=mutate=>{const v=structuredClone(manifest);mutate(v);assert.equal(LegalAdviceConfigSchema.safeParse(v).success,false);};
 invalid(v=>v.tariffs.pop());
 invalid(v=>v.tariffs.push(v.tariffs[0]));
 invalid(v=>v.tariffs[0].base_paise='499.00');
 invalid(v=>v.tiers[0].maximum_years=6);
 invalid(v=>v.tiers[3].maximum_years=20);
 invalid(v=>v.opening_minute=v.closing_minute);
 invalid(v=>v.working_days.push(1));
});
