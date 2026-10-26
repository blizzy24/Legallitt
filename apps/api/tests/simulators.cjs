const test = require('node:test'), assert = require('node:assert/strict');
test('adapter registration defaults, demo alias and live startup failures', () => {
  const {paymentsAdapter} = require('../dist/src/payments/payments.module');
  const {notificationsAdapter} = require('../dist/src/notifications/notifications.module');
  const {phoneAuthAdapter} = require('../dist/src/phone-auth/phone-auth.module');
  const old = {...process.env};
  try {
    process.env.NODE_ENV='test'; process.env.ENVIRONMENT='dev';
    for(const [flag, factory] of [['PAYMENTS_MODE',paymentsAdapter], ['NOTIFY_MODE',notificationsAdapter], ['PHONE_AUTH_MODE',phoneAuthAdapter]]) {
      delete process.env[flag]; assert.ok(factory({}));
      process.env[flag]='live'; assert.throws(()=>factory({}), /requires .*credentials/);
      process.env[flag]='invalid'; assert.throws(()=>factory({}), /must be/);
      delete process.env[flag];
    }
    process.env.PHONE_AUTH_MODE='demo'; assert.ok(phoneAuthAdapter({}));
    process.env.NODE_ENV='production'; assert.throws(()=>phoneAuthAdapter({}), /forbidden/);
  } finally { for(const k of ['NODE_ENV','ENVIRONMENT','PAYMENTS_MODE','NOTIFY_MODE','PHONE_AUTH_MODE']) {if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];} }
});
test('phone audit allowlist never persists code, password or tokens', async () => {
  const {SimulatedPhoneAuth} = require('../dist/src/phone-auth/simulated-phone-auth');
  const demo = require('../dist/src/phone-auth/demo-accounts');
  const old = {env:process.env.ENVIRONMENT,node:process.env.NODE_ENV,password:demo.demoPassword};
  const rows=[];
  try {
    process.env.ENVIRONMENT='dev';process.env.NODE_ENV='test'; demo.demoPassword=async()=>'PrivatePassword123!';
    const adapter = new SimulatedPhoneAuth({getClient:async()=>({authEvent:{create:async({data})=>rows.push(data)}})});
    const input={phone:'9000000000',code:'123456',role:'client'};
    assert.equal((await adapter.request({phone:input.phone})).simulated,true);
    const result=await adapter.verify(input,async()=>({user:{id:'user-id',role:'client'},tokens:{idToken:'private-token'}}),[]);
    assert.equal(result.simulated,true);
    await assert.rejects(adapter.verify({...input,code:'999999'},async()=>{throw new Error('Must not sign in');},[]));
    assert.deepEqual(rows.map(r=>r.event),['otp_requested','otp_verified','otp_failed']);
    assert.equal(rows[1].user_id,'user-id'); assert.equal(rows[2].user_id,undefined);
    for(const row of rows)assert.deepEqual(Object.keys(row).sort(),['event','identifier','simulated','user_id']);
    for(const secret of ['123456','999999','PrivatePassword123!','private-token'])assert.ok(!JSON.stringify(rows).includes(secret));
  } finally {demo.demoPassword=old.password; for(const [key,value] of [['ENVIRONMENT',old.env],['NODE_ENV',old.node]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
