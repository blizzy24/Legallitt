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
test('demo progression defaults to courier milestones only, with explicit opt-in for each human action', () => {
  const {demoProgressionConfig} = require('../dist/src/demo/demo-config');
  const local = {ENVIRONMENT: 'dev', NODE_ENV: 'development'};
  const intervals = {DEMO_ASSIGN_DELAY_MS: '30000', DEMO_DRAFT_START_DELAY_MS: '30000', DEMO_DRAFT_DONE_DELAY_MS: '30000', DEMO_DISPATCH_DELAY_MS: '30000', DEMO_SHIPMENT_STEP_MS: '5000'};
  const expected = {assignDelayMs: null, draftStartDelayMs: null, draftDoneDelayMs: null, dispatchDelayMs: null, shipmentStepMs: 5000, deliveryConfirmDelayMs: null};
  assert.deepEqual(demoProgressionConfig({...local, ...intervals}), expected);
  assert.deepEqual(demoProgressionConfig({...local, DEMO_SHIPMENT_STEP_MS: '5000', ADMIN_UI_MODE: 'live'}), expected);
  for (const [flag, field, interval] of [
    ['DEMO_ASSIGNMENT', 'assignDelayMs', 'DEMO_ASSIGN_DELAY_MS'],
    ['DEMO_DRAFT_START', 'draftStartDelayMs', 'DEMO_DRAFT_START_DELAY_MS'],
    ['DEMO_DRAFT_SUBMIT', 'draftDoneDelayMs', 'DEMO_DRAFT_DONE_DELAY_MS'],
    ['DEMO_DISPATCH', 'dispatchDelayMs', 'DEMO_DISPATCH_DELAY_MS'],
    ['DEMO_DELIVERY_CONFIRMATION', 'deliveryConfirmDelayMs', 'DEMO_SHIPMENT_STEP_MS'],
  ]) {
    assert.deepEqual(demoProgressionConfig({...local, ...intervals, [flag]: 'on'}), {...expected, [field]: Number(intervals[interval])});
    assert.throws(() => demoProgressionConfig({...local, ...intervals, [flag]: 'on', [interval]: ''}), new RegExp(interval));
    assert.throws(() => demoProgressionConfig({...local, ...intervals, [flag]: 'yes'}), new RegExp(flag));
  }
  assert.equal(demoProgressionConfig({...intervals, ENVIRONMENT: 'dev', NODE_ENV: 'test'}), null);
  assert.equal(demoProgressionConfig({...intervals, NODE_ENV: 'production'}), null);
  assert.equal(demoProgressionConfig({...local, ...intervals, DEMO_PROGRESSION: 'off'}), null);
  assert.throws(() => demoProgressionConfig({...local}), /DEMO_SHIPMENT_STEP_MS/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_SHIPMENT_STEP_MS: '5s'}), /DEMO_SHIPMENT_STEP_MS/);
  assert.throws(() => demoProgressionConfig({...intervals, DEMO_PROGRESSION: 'on', ENVIRONMENT: 'prod', NODE_ENV: 'production'}), /only permitted/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_DELIVERY_CONFIRMATION: 'on', ADMIN_UI_MODE: 'live'}), /DEMO_DELIVERY_CONFIRMATION=on requires ADMIN_UI_MODE=simulated/);
  assert.equal(demoProgressionConfig({...local, DEMO_SHIPMENT_MILESTONES: 'off'}), null);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_SHIPMENT_MILESTONES: 'yes'}), /DEMO_SHIPMENT_MILESTONES/);
  assert.throws(() => demoProgressionConfig({...local, ...intervals, DEMO_PROGRESSION: 'yes'}), /on or off/);
});
