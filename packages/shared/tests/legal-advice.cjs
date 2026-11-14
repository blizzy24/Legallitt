const {test}=require('node:test');
const assert=require('node:assert/strict');
const {LegalAdviceConfigSchema,legalAdviceTierFor,legalAdviceRequestedSlots,legalAdviceSlotAllowed}=require('../dist');
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
test('requested IST slots enforce notice, working days, closing time and editable intervals',()=>{
 const c=LegalAdviceConfigSchema.parse(manifest),now=Date.parse('2026-11-16T05:30:00Z'); // Monday 11 AM IST.
 const slots=legalAdviceRequestedSlots('2026-11-16',c,now);
 assert.equal(slots[0],'2026-11-16T08:30:00.000Z'); // Earliest 2 PM.
 assert.equal(slots.at(-1),'2026-11-16T13:00:00.000Z'); // Last session ends 7 PM.
 assert.equal(legalAdviceSlotAllowed(Date.parse('2026-11-16T13:30:00Z'),c,now),false);
 assert.deepEqual(legalAdviceRequestedSlots('2026-11-22',c,now),[]); // Sunday.
 assert.deepEqual(legalAdviceRequestedSlots('2027-01-01',c,now),[]);
 const changed={...c,working_days:[0],opening_minute:660,closing_minute:720,slot_minutes:15};
 assert.equal(legalAdviceRequestedSlots('2026-11-22',changed,now).length,3);
});
