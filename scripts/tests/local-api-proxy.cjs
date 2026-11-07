const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {createProxy} = require('../local-api-proxy.cjs');

async function listen(server, t) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  return `http://127.0.0.1:${server.address().port}`;
}

test('proxy forwards API methods, query, auth, idempotency and body; preserves upstream errors without retries', async t => {
  const received = [];
  const target = await listen(http.createServer(async (req, res) => {
    let body = ''; for await (const chunk of req) body += chunk;
    received.push({method: req.method, url: req.url, headers: req.headers, body});
    res.writeHead(401, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({message: 'Synthetic auth rejection'}));
  }), t);
  const local = await listen(createProxy(target), t);
  const response = await fetch(`${local}/api/v1/cases?limit=2`, {
    method: 'PATCH', headers: {Origin: 'http://localhost:8081', Authorization: 'Bearer synthetic-test-token',
      'Content-Type': 'application/json', 'Idempotency-Key': 'synthetic-key'}, body: '{"synthetic":true}',
  });
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  assert.equal((await response.json()).message, 'Synthetic auth rejection');
  assert.equal(received.length, 1);
  assert.equal(received[0].method, 'PATCH');
  assert.equal(received[0].url, '/api/v1/cases?limit=2');
  assert.equal(received[0].headers.authorization, 'Bearer synthetic-test-token');
  assert.equal(received[0].headers['idempotency-key'], 'synthetic-key');
  assert.equal(received[0].headers.origin, undefined);
  assert.equal(received[0].body, '{"synthetic":true}');
});

test('proxy restricts origins/routes and handles browser preflight without upstream calls', async t => {
  let calls = 0;
  const target = await listen(http.createServer((req, res) => { calls++; res.end(); }), t);
  const local = await listen(createProxy(target), t);
  const options = await fetch(`${local}/api/v1/auth/login`, {method: 'OPTIONS', headers: {Origin: 'http://localhost:8081'}});
  assert.equal(options.status, 204);
  assert.match(options.headers.get('access-control-allow-headers'), /Authorization/);
  assert.equal((await fetch(`${local}/api/v1/auth/login`, {headers: {Origin: 'https://untrusted.invalid'}})).status, 403);
  assert.equal((await fetch(`${local}/not-an-api`)).status, 404);
  assert.equal((await fetch(`${local}/api/v1/auth/login`, {method: 'PUT'})).status, 405);
  assert.equal((await (await fetch(`${local}/__local_proxy/health`)).json()).service, 'legalitt-local-api-proxy');
  assert.equal(calls, 0);
});

test('upstream connection failure explicitly identifies a running proxy and returns 502', async t => {
  const unavailable = http.createServer();
  const target = await listen(unavailable, t);
  await new Promise(resolve => unavailable.close(resolve));
  const local = await listen(createProxy(target), t);
  const response = await fetch(`${local}/api/v1/me`);
  assert.equal(response.status, 502);
  assert.match((await response.json()).message, /proxy is running.*deployed API/);
});

// Load the actual small TypeScript transport adapter without importing Expo.
function loadTs(filename, imports) {
  const ts = require('typescript');
  const code = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../..', filename), 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText;
  const module = {exports: {}};
  new Function('require', 'module', 'exports', code)(name => imports[name] ?? require(name), module, module.exports);
  return module.exports;
}

test('missing-proxy feedback reaches ApiClient; uploads, aborts and upstream errors retain their own failures', async () => {
  const shared = require('../../packages/shared/dist');
  const copy = loadTs('apps/mobile/copy/instructed.ts', {});
  const {withLocalProxyErrors} = loadTs('apps/mobile/lib/local-proxy-fetch.ts', {
    '@legalitt/shared': shared, '../copy/instructed': copy,
  });
  const failure = new TypeError('Synthetic network failure');
  const transport = withLocalProxyErrors('http://127.0.0.1:3002', async () => { throw failure; });
  const client = new shared.ApiClient({baseUrl: 'http://127.0.0.1:3002', fetch: transport});
  await assert.rejects(client.request('/auth/login', {}), error => error instanceof shared.ApiError &&
    error.code === 'offline' && error.message.includes('Run pnpm mobile:deployed') && error.message.includes('does not mean'));
  await assert.rejects(transport('https://uploads.invalid/file'), error => error === failure);
  await assert.rejects(transport('http://127.0.0.1:3002/api/v1/me', {signal: AbortSignal.abort()}), error => error === failure);
  const upstream = withLocalProxyErrors('http://127.0.0.1:3002', async () => new Response('{"message":"upstream unavailable"}', {status: 502}));
  assert.equal((await upstream('http://127.0.0.1:3002/api/v1/me')).status, 502);
});
