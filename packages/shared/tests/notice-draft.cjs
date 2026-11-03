const { test } = require('node:test');
const assert = require('node:assert/strict');
const { seedNoticeDraft, noticeDraftOnOpen, unchangedNoticeIntakeFields, NoticeDraftContentSchema, NOTICE_EDITABLE_DRAFT_FIELDS } = require('../dist');

const intake = {
  details: {
    client: { fullName: 'Test Sender', address: 'Test sender address', mobile: '2025550101', email: 'sender@example.invalid' },
    noticee: { fullName: 'Test Recipient', address: 'Test recipient address', email: 'recipient@example.invalid' },
  },
  parties: [{ kind: 'sender', age: 41, salutation: 'Ms.', relation: 'D/o', relative_name: 'Test Father' }],
  subject_line: 'Test invoice payment',
  subject_matter: 'The test invoice remains unpaid.\nThe client requested payment.',
  legal_demand: { selected: ['Pay ₹5,000.', 'Confirm payment in writing.'], custom: 'Return the test documents.' },
  drafts: [],
};

test('a new editor uses only its case intake and leaves advocate-authored sections blank', () => {
  const content = noticeDraftOnOpen(intake);
  assert.deepEqual(content, {
    sender: 'Ms. Test Sender D/o Shri Test Father\nAge 41\nTest sender address\n2025550101\nsender@example.invalid',
    recipient: 'Test Recipient\nTest recipient address\nrecipient@example.invalid',
    subject: intake.subject_line,
    facts: intake.subject_matter,
    demand: 'Pay ₹5,000.\nConfirm payment in writing.\nReturn the test documents.',
    closing: '', offences: '',
  });
  assert.equal(NoticeDraftContentSchema.safeParse(content).success, true);
  assert.deepEqual(intake.drafts, [], 'opening must not create a saved version');
});

test('sparse intake stays blank without labels, legal prose or another case\'s fixtures', () => {
  const sparse = { details: {}, parties: [], subject_line: null, subject_matter: null, legal_demand: null };
  const content = seedNoticeDraft(sparse);
  assert.deepEqual(content, { sender: '', recipient: '', subject: '', facts: '', demand: '', closing: '', offences: '' });
  assert.deepEqual(unchangedNoticeIntakeFields(sparse, content), []);
});

test('latest advocate writing wins, including deliberate blanks; read-only filing values match the PDF source', () => {
  const first = seedNoticeDraft(intake);
  const latest = { sender: '', recipient: 'Advocate corrected recipient', subject: '', facts: 'Corrected facts', demand: '', closing: 'Advocate closing' };
  assert.deepEqual(noticeDraftOnOpen({ ...intake, drafts: [{ content: first }, { content: latest }] }), {
    ...latest, sender: first.sender, recipient: first.recipient, subject: first.subject, demand: first.demand,
  });
  assert.equal(noticeDraftOnOpen({ ...intake, drafts: [{ content: { ...latest, facts: '' } }] }).facts, '');
  assert.equal(latest.sender, '', 'opening must not mutate a saved version');
});

test('intake indication follows untouched values, never changed, cleared or advocate-only sections', () => {
  const content = seedNoticeDraft(intake);
  assert.deepEqual(unchangedNoticeIntakeFields(intake, content), ['sender', 'recipient', 'subject', 'facts', 'demand']);
  const edited = { ...content, sender: 'Edited sender', facts: '', closing: 'Advocate closing', offences: 'Advocate offences' };
  assert.deepEqual(unchangedNoticeIntakeFields(intake, edited), ['recipient', 'subject', 'demand']);
  assert.equal(intake.details.client.fullName, 'Test Sender', 'editing a draft must not rewrite intake');
});

test('only facts and offences may be edited while the PDF uses the existing filing/template sources', () => {
  assert.deepEqual(NOTICE_EDITABLE_DRAFT_FIELDS, ['facts', 'offences']);
});
