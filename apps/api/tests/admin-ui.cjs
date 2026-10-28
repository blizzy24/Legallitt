const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {SystemTrigger} = require('../dist/src/admin-ui/system-trigger');
test('system provenance cannot grant a role or cross case/document boundaries', () => {
  const triggers = new SystemTrigger();
  const admin = {id: randomUUID(), role: 'admin'};
  const caseId = randomUUID(), documentId = randomUUID();
  const token = triggers.issue(admin.id, caseId);
  const input = {case_id: caseId, kind: 'proof_of_delivery'};
  assert.deepEqual(triggers.verify(token, admin, '/api/v1/documents/presign', input), {trigger: 'system', source: 'simulated'});
  for (const user of [{...admin, role: 'client'}, {...admin, id: randomUUID()}])
    assert.throws(() => triggers.verify(token, user, '/api/v1/documents/presign', input), {status: 401});
  assert.throws(() => triggers.verify(token, admin, '/api/v1/documents/presign', {...input, case_id: randomUUID()}), {status: 401});
  assert.throws(() => triggers.verify(token, admin, `/api/v1/cases/${caseId}/delivered`, {pod_document_id: documentId}), {status: 401});
  triggers.document(token, documentId);
  assert.equal(triggers.verify(token, admin, `/api/v1/documents/${documentId}/complete`, {}).source, 'simulated');
  assert.equal(triggers.verify(token, admin, `/api/v1/cases/${caseId}/delivered`, {pod_document_id: documentId}).source, 'simulated');
  assert.throws(() => triggers.verify(token, admin, `/api/v1/documents/${randomUUID()}/complete`, {}), {status: 401});
  triggers.revoke(token);
  assert.throws(() => triggers.verify(token, admin, '/api/v1/documents/presign', input), {status: 401});
});

test('a demo-progression ticket is one identity, one case and only its routes', () => {
  const triggers = new SystemTrigger();
  const advocate = {id: randomUUID(), role: 'advocate'};
  const caseId = randomUUID();
  const token = triggers.issueScoped(advocate, caseId, [new RegExp(`^/api/v1/cases/${caseId}/(accept|start)$`)]);
  assert.deepEqual(triggers.verify(token, advocate, `/api/v1/cases/${caseId}/accept`, {}), {trigger: 'system', source: 'simulated'});
  for (const user of [{...advocate, role: 'admin'}, {...advocate, id: randomUUID()}])
    assert.throws(() => triggers.verify(token, user, `/api/v1/cases/${caseId}/start`, {}), {status: 401});
  for (const path of [`/api/v1/cases/${randomUUID()}/accept`, `/api/v1/cases/${caseId}/decline`, `/api/v1/admin/cases/${caseId}/assign`])
    assert.throws(() => triggers.verify(token, advocate, path, {}), {status: 401});
  triggers.revoke(token);
  assert.throws(() => triggers.verify(token, advocate, `/api/v1/cases/${caseId}/start`, {}), {status: 401});
});
test('demo progression: on locally by default, off elsewhere, intervals required', () => {
  const {demoProgressionConfig} = require('../dist/src/demo/demo-config');
  const local = {ENVIRONMENT: 'dev', NODE_ENV: 'development'};
  const intervals = {DEMO_ASSIGN_DELAY_MS: '30000', DEMO_DRAFT_START_DELAY_MS: '30000', DEMO_DRAFT_DONE_DELAY_MS: '30000', DEMO_SHIPMENT_STEP_MS: '5000'};
  assert.deepEqual(demoProgressionConfig({...local, ...intervals}), {assignDelayMs: 30000, draftStartDelayMs: 30000, draftDoneDelayMs: 30000, shipmentStepMs: 5000});
  assert.equal(demoProgressionConfig({...intervals, ENVIRONMENT: 'dev', NODE_ENV: 'test'}), null);
  assert.equal(demoProgressionConfig({...intervals, NODE_ENV: 'production'}), null);
  assert.equal(demoProgressionConfig({...local, ...intervals, DEMO_PROGRESSION: 'off'}), null);
  assert.throws(() => demoProgressionConfig({...local}), /DEMO_ASSIGN_DELAY_MS/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_SHIPMENT_STEP_MS: '5s'}), /DEMO_SHIPMENT_STEP_MS/);
  assert.throws(() => demoProgressionConfig({...intervals, DEMO_PROGRESSION: 'on', ENVIRONMENT: 'prod', NODE_ENV: 'production'}), /only permitted/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, ADMIN_UI_MODE: 'live'}), /ADMIN_UI_MODE=simulated/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_PROGRESSION: 'yes'}), /on or off/);
});
