const test = require('node:test'), assert = require('node:assert/strict');
const {DemoProgression} = require('../dist/src/demo/demo-progression');
const {demoProgressionConfig} = require('../dist/src/demo/demo-config');
const local = {ENVIRONMENT: 'dev', NODE_ENV: 'development', DEMO_SHIPMENT_STEP_MS: '0'};
const statuses = ['paid', 'assigned', 'advocate_accepted', 'changes_requested', 'in_progress', 'approved'];
const row = (status, shipment) => ({id: status + (shipment ?? ''), status, advocate_id: 'seeded-advocate',
  shipments_case_id_relations: shipment ? [{status: shipment}] : [],
  case_events_case_id_relations: [{created_at: new Date(0)}]});
function timer(config, rows) {
  return new DemoProgression({getClient: async () => ({case: {findMany: async () => rows}})}, {}, {}, config);
}

test('defaults leave all human actions alone and stop courier progression before delivery', async () => {
  const rows = [...statuses.map(s => row(s)), ...['draft', 'booked', 'dispatched', 'pickup_booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].map(s => row('dispatched', s))];
  const t = timer(demoProgressionConfig(local), rows), actions = [], signins = [];
  t.session = async role => {signins.push(role);return {id: 'seeded-' + role, role};};
  t.act = async id => {actions.push(id);};
  await t.tick();
  assert.deepEqual(actions, ['dispatcheddispatched', 'dispatchedpickup_booked', 'dispatchedpicked_up', 'dispatchedin_transit']);
  assert.deepEqual(signins, ['admin', 'admin', 'admin', 'admin']);
});

test('each human action can be enabled independently without enabling another step', async () => {
  for (const [flag, interval, matching] of [
    ['DEMO_ASSIGNMENT','DEMO_ASSIGN_DELAY_MS',['paid']],
    ['DEMO_DRAFT_START','DEMO_DRAFT_START_DELAY_MS',['assigned','advocate_accepted','changes_requested']],
    ['DEMO_DRAFT_SUBMIT','DEMO_DRAFT_DONE_DELAY_MS',['in_progress']],
    ['DEMO_DISPATCH','DEMO_DISPATCH_DELAY_MS',['approved']],
    ['DEMO_DELIVERY_CONFIRMATION','DEMO_SHIPMENT_STEP_MS',['dispatched']],
  ]) {
    const rows = [...statuses.map(s => row(s)), row('dispatched','in_transit'), row('dispatched','out_for_delivery')];
    const t = timer(demoProgressionConfig({...local, DEMO_SHIPMENT_MILESTONES: 'off', [flag]: 'on', [interval]: '0'}), rows), actions = [];
    t.session = async role => ({id: 'seeded-' + role, role});
    t.act = async (id, status) => {actions.push(status);};
    await t.tick(); assert.deepEqual(actions, matching, flag);
  }
});

test('milestone call uses the real endpoint; a shipment that reaches delivery while polling is never auto-confirmed by default', async () => {
  const t = timer(demoProgressionConfig(local), []), calls = [], confirmed = [];
  t.adminUi = {confirmDelivery: async id => {confirmed.push(id);}};
  const session = {id:'admin', role:'admin'};
  t.call = async (_session, _id, _paths, action) => action(async (path, body) => {calls.push({path, body});});
  for (const [status, next] of [['dispatched','pickup_booked'], ['pickup_booked','picked_up'], ['picked_up','in_transit'], ['in_transit','out_for_delivery']]) {
    t.read = async () => ({shipments:[{direction:'to_recipient',status}]});
    await t.act('case', 'dispatched', session);
    assert.deepEqual(calls.at(-1), {path:'/api/v1/admin/cases/case/shipment/status', body:{status:next}});
  }
  t.read = async () => ({shipments:[{direction:'to_recipient',status:'out_for_delivery'}]});
  await t.act('case', 'dispatched', session);
  assert.equal(calls.length, 4); assert.deepEqual(confirmed, []);
  t.config = demoProgressionConfig({...local, DEMO_DELIVERY_CONFIRMATION:'on', DEMO_SHIPMENT_MILESTONES:'off'});
  await t.act('case', 'dispatched', session);
  assert.deepEqual(confirmed, ['case']);
});

test('master off does not poll or sign in, even when step flags are on', async () => {
  const config = demoProgressionConfig({...local, DEMO_PROGRESSION:'off', DEMO_ASSIGNMENT:'on'});
  const t = new DemoProgression({getClient: async () => {throw Error('Must not poll');}}, {}, {}, config);
  await t.tick();
});
