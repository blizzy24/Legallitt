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
