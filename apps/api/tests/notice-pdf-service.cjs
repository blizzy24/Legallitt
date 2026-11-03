const test = require('node:test'), assert = require('node:assert/strict');
const pdfModule = require('../dist/src/documents/notice-pdf');
const {NoticePdfService} = require('../dist/src/cases/notice-pdf.service');
const {DEFAULT_NOTICE_POLICY}=require('@legalitt/shared');
const actor = {id: 'advocate-id', role: 'advocate'};
const content = {sender: 'Editor sender must not replace intake', recipient: 'Editor recipient must not replace intake',
  subject: 'Editor subject must not replace AI subject', facts: 'Advocate facts', demand: 'Editor demand must not replace client demand',
  closing: 'Editor closing', offences: 'Advocate offences'};

function harness() {
  const record = {id: 'case-id', reference: 'LN-2026-0046', status: 'in_progress', advocate_id: actor.id,
    pricing_id: 'historic-price', pricing_id_relation: {base_amount_paise: 137700n},
    details: {client: {fullName: 'Client name', address: 'Client address'}, noticee: {fullName: 'Noticee name', address: 'Noticee address'}},
    subject_line: 'Persisted AI subject', legal_demand: {selected: ['First client demand', 'Second client demand'], custom: 'Custom client demand'},
    case_parties_case_id_relations: [{kind: 'sender', age: 41, father_name: 'Client father'}],
    advocate_id_relation: {full_name: 'Assigned advocate', advocate_profiles_user_id_relations: {
      education: 'B.A., LL.B.', bar_council_number: 'MH/1234/2020', city: 'Mumbai'}}};
  const draft = {compliance_period_days:7,closing_policy:DEFAULT_NOTICE_POLICY,id: 'latest-draft', version: 3, content, created_at: new Date('2026-11-02T10:00Z')};
  let caseQuery, draftQuery;
  const db = {case: {findFirst: async query => {
    caseQuery = query;
    return (query.where.AND[0].advocate_id === actor.id || query.where.AND[0].client_id === 'client-id') ? record : null;
  }}, draft: {findFirst: async query => {draftQuery = query; return draft;}}};
  const documents = new Proxy({}, {get() {throw new Error('Preview must not upload, publish or mutate a document');}});
  return {record, draft, service: new NoticePdfService({getClient: async () => db}, documents),
    queries: () => ({caseQuery, draftQuery})};
}

test('letterhead preview binds intake, assigned profile and the case historical base fee; editor supplies facts/offences only', async () => {
  const h = harness(), original = pdfModule.renderNoticePdf;
  let supplied;
  pdfModule.renderNoticePdf = async input => {supplied = input; return Uint8Array.from([37,80,68,70]);};
  try {
    const result = await h.service.preview(actor, 'case-id', 'latest-draft');
    assert.equal(result.filename, 'Legal_Notice_Draft_v3.pdf');
    assert.equal(Buffer.from(result.pdf_base64, 'base64').toString(), '%PDF');
    assert.equal(supplied.compliancePeriodDays,7);
    assert.deepEqual(supplied.closingPolicy,DEFAULT_NOTICE_POLICY);
    h.record.compliance_period_days=30;
    assert.equal(supplied.compliancePeriodDays,7,'PDF takes selected draft snapshot, not later case edits');
    assert.equal(supplied.reference, h.record.reference);
    assert.equal(supplied.date, h.draft.created_at);
    assert.equal(supplied.subject, 'Persisted AI subject');
    assert.deepEqual(supplied.sender, {name: 'Client name', father: 'Client father', age: 41, address: 'Client address'});
    assert.deepEqual(supplied.recipient, {name: 'Noticee name', address: 'Noticee address'});
    assert.deepEqual(supplied.demands, ['First client demand', 'Second client demand', 'Custom client demand']);
    assert.equal(supplied.serviceFeePaise, 137700n);
    assert.deepEqual(supplied.advocate, {name: 'Assigned advocate', qualifications: 'B.A., LL.B.', enrolment: 'MH/1234/2020'});
    assert.equal(supplied.place, 'Mumbai');
    assert.equal(supplied.content.facts, 'Advocate facts');
    assert.equal(supplied.content.offences, 'Advocate offences');
    const {caseQuery, draftQuery} = h.queries();
    assert.deepEqual(caseQuery.where.AND, [{service_code: 'legal_notice', advocate_id: actor.id}, {id: 'case-id'}]);
    assert.ok(caseQuery.include.pricing_id_relation);
    assert.deepEqual(draftQuery.orderBy, {version: 'desc'});

  } finally {pdfModule.renderNoticePdf = original;}
});

test('render-only preview refuses clients, admins, another advocate, stale drafts and non-editable states', async () => {
  const h = harness();
  for (const role of ['client', 'admin']) await assert.rejects(h.service.preview({id: 'other', role}, 'case-id', 'latest-draft'), {status: 403});
  await assert.rejects(h.service.preview({id: 'other-advocate', role: 'advocate'}, 'case-id', 'latest-draft'), {status: 409});
  await assert.rejects(h.service.preview(actor, 'case-id', 'old-draft'), {status: 409});
  for (const status of ['assigned', 'client_review', 'approved', 'dispatched', 'completed']) {
    h.record.status = status;
    await assert.rejects(h.service.preview(actor, 'case-id', 'latest-draft'), {status: 409});
  }
});


test('preview, send and final reject every missing field before rendering or touching S3', async () => {
  for (const operation of ['preview','draft','final']) {
    const h=harness();
    h.record.details={client:{fullName:' ',address:''}};
    h.record.subject_line=null; h.record.pricing_id_relation=null;
    h.record.advocate_id_relation.advocate_profiles_user_id_relations.city=null;
    if(operation==='final')h.record.status='client_review';
    await assert.rejects(h.service[operation](operation==='final'?{id:'client-id',role:'client'}:actor,'case-id','latest-draft',new Date()), error=>{
      assert.equal(error.status,400);
      const response=error.getResponse();
      assert.equal(response.code,'notice_fields_missing');
      assert.deepEqual(response.missing_fields,['subject','sender_name','sender_address','recipient_name','recipient_address','service_fee','place']);
      for(const label of ['Subject line','Sender name','Sender address','Recipient name','Recipient address','Service fee','Place'])assert.ok(response.message.includes(label));
      return true;
    });
  }
});
