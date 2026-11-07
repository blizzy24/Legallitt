// Temporary browser CORS workaround. No auth, fixtures, retries or stored data.
const http = require('node:http');
const https = require('node:https');

const DEPLOYED_API = 'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const LOCAL_PROXY = 'http://127.0.0.1:3002';
const WEB_ORIGINS = new Set(['http://localhost:8081', 'http://127.0.0.1:8081']);

function createProxy(target = DEPLOYED_API) {
  const upstream = new URL(target);
  if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash)
    throw new Error('Proxy target must be an API origin without a path or credentials.');
  const transport = upstream.protocol === 'https:' ? https : http;
  return http.createServer((req, res) => {
    const json = (status, message) => {
      if (!res.headersSent) {
        res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
        res.end(JSON.stringify({message}));
      } else res.destroy();
    };
    const origin = req.headers.origin;
    if (origin && !WEB_ORIGINS.has(origin)) return json(403, 'This local proxy only accepts the local mobile web app.');
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Idempotency-Key');
    if (req.url === '/__local_proxy/health' && req.method === 'GET') {
      res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      return res.end(JSON.stringify({service: 'legalitt-local-api-proxy'}));
    }
    if (!req.url?.startsWith('/api/v1/')) return json(404, 'Only /api/v1/ requests are forwarded.');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return json(405, 'Unsupported API method.');
    const headers = {};
    for (const name of ['authorization', 'content-type', 'idempotency-key', 'accept']) {
      if (req.headers[name]) headers[name] = req.headers[name];
    }
    // Use the fixed target's host and the original path, never a caller's URL.
    // Stream request/response bytes; never log headers, bodies or credentials.
    const request = transport.request({
      protocol: upstream.protocol, hostname: upstream.hostname, port: upstream.port,
      path: req.url, method: req.method, headers,
    }, response => {
      res.statusCode = response.statusCode;
      for (const name of ['content-type', 'retry-after', 'content-disposition']) {
        if (response.headers[name]) res.setHeader(name, response.headers[name]);
      }
      res.setHeader('Cache-Control', 'no-store');
      response.on('error', () => res.destroy());
      response.pipe(res);
    });
    request.setTimeout(70_000, () => request.destroy(new Error('Upstream timeout')));
    request.on('error', () => json(502, 'The local API proxy is running, but it could not reach the deployed API. Check your internet connection and the deployed API, then retry.'));
    req.on('aborted', () => request.destroy());
    res.on('close', () => { if (!res.writableFinished) request.destroy(); });
    req.pipe(request);
  });
}

module.exports = {createProxy, DEPLOYED_API, LOCAL_PROXY};
