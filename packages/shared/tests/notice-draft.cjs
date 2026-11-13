const { test } = require('node:test');
const assert = require('node:assert/strict');
const { seedNoticeDraft, noticeDraftOnOpen, unchangedNoticeIntakeFields, NoticeDraftContentSchema, NOTICE_EDITABLE_DRAFT_FIELDS, DEFAULT_NOTICE_POLICY } = require('../dist');

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

test('a new editor uses its case intake and the approved default closing, without saving a version', () => {
  const content = noticeDraftOnOpen(intake);
  assert.deepEqual(content, {
    sender: 'Ms. Test Sender D/o Shri Test Father\nTest sender address\nsender@example.invalid',
    recipient: 'Test Recipient\nTest recipient address\nrecipient@example.invalid',
    subject: intake.subject_line,
    facts: intake.subject_matter,
    demand: 'Pay ₹5,000.\nConfirm payment in writing.\nReturn the test documents.',
    closing: DEFAULT_NOTICE_POLICY.civil_consequence,
  });
  assert.equal(NoticeDraftContentSchema.safeParse(content).success, true);
  assert.deepEqual(intake.drafts, [], 'opening must not create a saved version');
});

test('sparse intake stays blank except the shared closing; no invented facts or another case\'s fixtures', () => {
  const sparse = { details: {}, parties: [], subject_line: null, subject_matter: null, legal_demand: null };
  const content = seedNoticeDraft(sparse);
  assert.deepEqual(content, { sender: '', recipient: '', subject: '', facts: '', demand: '', closing: DEFAULT_NOTICE_POLICY.civil_consequence });
  assert.deepEqual(unchangedNoticeIntakeFields(sparse, content), []);
});

test('all six saved advocate sections win, including deliberate blanks; opening cannot overwrite corrections', () => {
  const first = seedNoticeDraft(intake);
  const latest = { sender: '', recipient: 'Advocate corrected recipient', subject: '', facts: 'Corrected facts', demand: '', closing: 'Advocate closing' };
  assert.deepEqual(noticeDraftOnOpen({ ...intake, drafts: [{ content: first }, { content: latest }] }), latest);
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

test('the six drawn sections are editable; legacy offences are not reopened', () => {
  assert.deepEqual(NOTICE_EDITABLE_DRAFT_FIELDS, ['sender','recipient','subject','facts','demand','closing']);
  assert.equal('offences' in noticeDraftOnOpen({...intake,drafts:[{content:{...seedNoticeDraft(intake),offences:'Legacy'}}]}),false);
});
