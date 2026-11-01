const test = require('node:test');
const assert = require('node:assert/strict');
const {CaseStatus, adminBucketFor} = require('../dist');
test('all lifecycle states map to the approved admin buckets; unpaid states are excluded', () => {
  const groups = {
    open: ['paid','assigning','advocate_declined'], pending: ['client_review','changes_requested'],
    in_progress: ['assigned','advocate_accepted','in_progress','approved','dispatching','dispatched'],
    completed: ['completed'], closed: ['cancelled','refunded'],
    unpaid: ['draft','submitted','payment_pending'],
  };
  assert.deepEqual(Object.values(groups).flat().sort(), Object.values(CaseStatus).sort());
  for (const [bucket, statuses] of Object.entries(groups))
    for (const status of statuses) assert.equal(adminBucketFor(status), bucket === 'unpaid' ? null : bucket, status);
});
