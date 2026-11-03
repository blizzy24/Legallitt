// Explicit dev verification after reseeding. Creates ONE labelled synthetic case;
// only client submission/payment/approval are driven here. The deployed timers
// must perform assignment, drafting, dispatch and delivery through their real APIs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ApiClient, SIMULATED_NOTICE_DEMANDS } = require('../packages/shared/dist');
const { demoPassword, requireDemoMode } = require('../apps/api/dist/src/auth/demo');
const cloud = 'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const out = path.resolve('reports/guest-auth-return-2026-11-03');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  assert.equal(process.env.VERIFY_DEPLOYED_DEMO, '1'); requireDemoMode();
  const password = await demoPassword(), auth = [], sessions = {};
  const accounts = [
    ['demo-client@legalitt.invalid', 'client'], ['demo-advocate@legalitt.invalid', 'advocate'], ['demo-admin@legalitt.invalid', 'admin'],
    ...[2, 3, 4].map(n => [`demo-advocate-${n}@legalitt.invalid`, 'advocate']),
  ];
  for (const base of ['http://127.0.0.1:3001', cloud]) {
    for (const [email, role] of accounts) {
      const response = await fetch(base + '/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      assert.equal(response.status, 201, `${base}: ${email}`);
      const result = await response.json(); assert.equal(result.user.role, role);
      auth.push({ base, account: email, role, status: response.status });
      if (base === cloud && ['demo-client@legalitt.invalid', 'demo-advocate@legalitt.invalid'].includes(email)) sessions[role] = result;
    }
    for (const role of ['client', 'advocate']) {
      const response = await fetch(base + '/api/v1/auth/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: '+912025550100', code: '123456', role }) });
      assert.equal(response.status, 201); const result = await response.json(); assert.equal(result.user.role, role); assert.equal(result.simulated, true);
      auth.push({ base, role, path: 'otp/verify', status: response.status, simulated: result.simulated });
    }
  }
  fs.writeFileSync(path.join(out, 'reseed-auth-checks.json'), JSON.stringify(auth, null, 2));
  console.log('All six accounts and both OTP roles authenticate against both databases');
  const api = new ApiClient({ baseUrl: cloud, getTokens: async () => sessions.client.tokens });
  let record = await api.createCase({ service_code: 'legal_notice', tier: 'ordinary', matter_type: 'money_recovery', details: {
    issueType: 'money-recovery',
    client: { fullName: 'Synthetic Guest Return Test', mobile: '2025550101', email: 'sender@example.invalid', address: 'Synthetic development test address, Mumbai' },
    noticee: { fullName: 'Synthetic Test Recipient', mobile: '2025550102', email: 'recipient@example.invalid', address: 'Synthetic development test address, Mumbai', relationship: 'Test only' },
  } });
  const id = record.id;
  fs.writeFileSync(path.join(out, 'simulator-case.json'), JSON.stringify({ id, reference: record.reference }, null, 2));
  await api.saveIntake(id, { subject_matter: 'Synthetic development verification of seeded simulator authentication. No actual dispute or delivery occurred.', sender: { age: 40, father_name: 'Synthetic Test Father' }, legal_demand: { selected: [SIMULATED_NOTICE_DEMANDS[0]], custom: '' } });
  const subject = await api.generateNoticeSubject(id); assert.equal(subject.simulated, true);
  await api.submit(id); const payment = await api.pay(id); assert.equal(payment.simulated, true);
  const observed = [], start = Date.now(); let approved = false, previous;
  while (Date.now() - start < 300_000) {
    record = await api.case(id);
    if (record.status !== previous) { observed.push({ status: record.status, at: new Date().toISOString() }); console.log(record.reference, record.status); previous = record.status; }
    if (record.status === 'client_review' && !approved) {
      assert.equal(record.advocate_id, sessions.advocate.user.id);
      const draft = record.drafts.at(-1); assert.ok(draft); await api.approve(id, draft.id); approved = true;
    }
    if (record.status === 'completed') break;
    await delay(2000);
  }
  assert.equal(record.status, 'completed', 'Deployed simulators must finish the case without manual advocate/admin actions');
  const events = (await api.events(id)).items;
  for (const status of ['assigned', 'in_progress', 'client_review', 'dispatched', 'completed']) {
    const event = events.find(e => e.to_status === status); assert.ok(event, status); assert.equal(event.source, 'simulated', status);
  }
  const completed = events.find(e => e.to_status === 'completed'); assert.equal(completed.actor_id, null); assert.equal(completed.actor_role, null); assert.equal(completed.payload.actor, 'system');
  const shipment = record.shipments.find(s => s.direction === 'to_recipient'); assert.equal(shipment.status, 'delivered'); assert.equal(shipment.simulated, true);
  const pod = record.documents.find(d => d.id === shipment.pod_document_id); assert.ok(pod); assert.equal(pod.simulated, true);
  const signed = await api.documentUrl(pod.id), response = await fetch(signed.url); assert.equal(response.status, 200);
  const pdf = Buffer.from(await response.arrayBuffer()); assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  fs.writeFileSync(path.join(out, 'simulated-proof-of-delivery.pdf'), pdf);
  fs.writeFileSync(path.join(out, 'simulator-verification.json'), JSON.stringify({ id, reference: record.reference, observed, events: events.map(({ type, from_status, to_status, source, actor_role, payload, created_at }) => ({ type, from_status, to_status, source, actor_role, actor: payload.actor, created_at })), shipment: { status: shipment.status, simulated: shipment.simulated, milestones: shipment.milestones }, pod: { id: pod.id, owner_id: pod.owner_id, simulated: pod.simulated, downloaded: true } }, null, 2));
  console.log('Deployed progression and admin delivery simulator passed with a real validated S3 POD');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
