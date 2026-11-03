// One-off dev ECS ops task, using the exact deployed image. Run via `node -e`
// from /repo/apps/api. Requires explicit approval to launch the verification task.
// It changes no running service or credentials. Only a labelled synthetic draft
// receives two failure audit events. The upstream transport alone is injected;
// Cognito, HTTP guards, controllers, CloudWatch and the RDS audit are real.
const assert = require('node:assert/strict');
process.env.AI_MODE = 'simulated';
process.env.DEMO_PROGRESSION = 'off';
process.env.ADMIN_UI_MODE = 'live';
const {NestFactory} = require('@nestjs/core');
const {AppModule} = require('./dist/src/app.module');
const {AI} = require('./dist/src/ai/ai.port');
const {GeminiAi} = require('./dist/src/ai/gemini-ai');
const {demoPassword} = require('./dist/src/phone-auth/demo-accounts');
async function main() {
  assert.equal(process.env.ENVIRONMENT, 'dev');
  assert.equal(process.env.VERIFY_NOTICE_AI_FAILURES, '1');
  const id = process.env.VERIFY_CASE_ID;
  assert.match(id, /^[0-9a-f-]{36}$/);
  const app = await NestFactory.create(AppModule);
  const ai = app.get(AI);
  ai.generate = request => new GeminiAi({apiKey:'synthetic-verification-key', model:'gemini-3.5-flash-lite', environment:'dev', nodeEnv:'development'},
    async () => Response.json({error:{status: request.task === 'subject' ? 'RESOURCE_EXHAUSTED' : 'UNAVAILABLE', message:'Controlled verification: upstream unavailable'}},
      {status: request.task === 'subject' ? 429 : 503})).generate(request);
  try {
    await app.listen(0, '127.0.0.1');
    const base = await app.getUrl();
    const login = await fetch(base + '/api/v1/auth/login', {method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:'demo-client@legalitt.invalid',password:await demoPassword()})});
    assert.equal(login.status, 201);
    const session = await login.json(); assert.equal(session.user.role, 'client');
    const headers = {'Content-Type':'application/json', Authorization:'Bearer ' + session.tokens.idToken};
    const read = async path => {const r = await fetch(base + path, {headers});assert.ok(r.ok);return r.json();};
    const record = await read('/api/v1/cases/' + id);
    assert.equal(record.status, 'draft');assert.equal(record.client_id, session.user.id);
    assert.match(record.subject_matter, /^Synthetic testing case only\./);
    const results = [];
    for (const endpoint of ['subject', 'demand-options']) {
      const r = await fetch(base + '/api/v1/cases/' + id + '/' + endpoint, {method:'POST',headers,body:'{}'});
      const response = await r.json();assert.equal(r.status, 502);
      assert.match(response.message, /^Couldn’t generate/);
      assert.doesNotMatch(response.message, /RESOURCE_EXHAUSTED|UNAVAILABLE|Gemini/);
      results.push({endpoint,status:r.status,response});
    }
    const after = await read('/api/v1/cases/' + id);
    assert.equal(after.status, record.status);assert.equal(after.subject_line, record.subject_line);
    assert.deepEqual(after.legal_demand, record.legal_demand);
    const events = (await read('/api/v1/cases/' + id + '/events')).items.filter(e=>e.type.endsWith('_generation_failed'));
    assert.ok(events.some(e=>e.payload.code==='RESOURCE_EXHAUSTED'));
    assert.ok(events.some(e=>e.payload.code==='UNAVAILABLE'));
    console.log('NOTICE_AI_FAILURE_CHECK ' + JSON.stringify({id,reference:record.reference,
      method:'Isolated ECS task, deployed image, injected upstream 429/503, real Cognito/HTTP/RDS/CloudWatch; main API unmodified',results,events}));
  } finally {await app.close();}
}
main().catch(e=>{console.error('NOTICE_AI_FAILURE_CHECK_FAILED', e.name, e.message);process.exitCode=1;});
