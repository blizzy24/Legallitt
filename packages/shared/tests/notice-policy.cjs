const test=require('node:test'),assert=require('node:assert/strict');
const {NoticePolicySchema,DEFAULT_NOTICE_POLICY,CompliancePeriodSchema,noticeClosing}=require('../dist');
test('whole positive periods only; retired criminal wording cannot return from historical policy snapshots',()=>{
  for(const value of [0,-1,1.5,'15',null,Infinity])assert.equal(CompliancePeriodSchema.safeParse(value).success,false);
  for(const value of [1,7,15,30])assert.equal(CompliancePeriodSchema.parse(value),value);
  for(const offences of ['', ' \n ']){
    const closing=noticeClosing(DEFAULT_NOTICE_POLICY,15,offences);
    assert.ok(closing.compliance.includes('within 15 days of receipt'));
    assert.equal(closing.consequence,'Failing which, my client shall be constrained to initiate appropriate civil proceedings against you.');
    assert.ok(!closing.consequence.includes('_'));
  }
  assert.ok(!noticeClosing(DEFAULT_NOTICE_POLICY,7,' Test offence ').consequence.includes('offence'));
  assert.equal(noticeClosing(DEFAULT_NOTICE_POLICY,null,'').compliance,'');
});
test('client decisions can change by settings without code; invalid templates are rejected',()=>{
  const policy=NoticePolicySchema.parse({default_compliance_period_days:30,criminal_clause:'omit',compliance_sentence:'Comply within {days} days.'});
  assert.equal(noticeClosing(policy,30,'Allegation').compliance,'Comply within 30 days.');
  assert.ok(!noticeClosing(policy,30,'Allegation').consequence.includes('criminal'));
  const required={...policy,criminal_clause:'required'};
  assert.equal(noticeClosing(required,15,'').consequence,policy.civil_consequence);
  assert.ok(!noticeClosing(required,15,'Offence').consequence.includes('Offence'));
  assert.equal(NoticePolicySchema.safeParse({compliance_sentence:'No placeholder'}).success,false);
  assert.equal(noticeClosing({...required,criminal_consequence:'Legacy offences {offences}'},15,'Example').consequence,policy.civil_consequence);
});
