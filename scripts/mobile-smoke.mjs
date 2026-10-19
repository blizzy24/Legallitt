// Run after pnpm --filter @legalitt/mobile build. CHROME_PATH can override Chrome.
// Set SMOKE_BASE_URL to check an existing deployment instead of serving the export.
import puppeteer from 'puppeteer-core';
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(root, 'apps/mobile/app');
const dist = resolve(root, 'apps/mobile/dist');
function routesIn(dir, base = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (entry.isDirectory()) return routesIn(resolve(dir, entry.name), base + '/' + entry.name);
    if (!entry.name.endsWith('.tsx') || entry.name.startsWith('_')) return [];
    const name = entry.name.slice(0, -4);
    return [(name === 'index' ? base : base + '/' + name).replace(/\/\([^)]+\)/g, '') || '/'];
  });
}
const routes = [...new Set(routesIn(app))].sort().map(route => route.replace(/\[[^\]]+\]/g, '1'));
assert.equal(routes.length, 322, 'The monorepo move must preserve all 322 routes');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
let server;
let base = process.env.SMOKE_BASE_URL;
if (!base) {
  assert.ok(existsSync(resolve(dist, 'index.html')), 'Build mobile before running the smoke test');
  server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/fir/pay-placeholder') { res.writeHead(307, { Location: '/fir/payment' }); res.end(); return; }
    let file = resolve(dist, '.' + pathname);
    if (!file.startsWith(dist + sep) || !existsSync(file) || !statSync(file).isFile()) file = resolve(dist, 'index.html');
    res.setHeader('Content-Type', mime[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
}
let browser;
const failures = [];
let cursor = 0, done = 0;
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (cursor < routes.length) {
      const route = routes[cursor++];
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.setViewport({ width: 390, height: 900, isMobile: true });
        const response = await page.goto(base + route, { waitUntil: 'networkidle0', timeout: 30000 });
        if (!response?.ok()) errors.push(`HTTP ${response?.status()}`);
        const text = await page.evaluate(() => document.body.innerText.trim());
        if (text.length < 2 || text.includes('Unmatched Route')) errors.push('blank/unmatched route');
      } catch (error) { errors.push(error.message); }
      finally { await page.close(); }
      if (errors.length) failures.push({ route, errors });
      if (++done % 50 === 0) console.log(`${done}/${routes.length}`);
    }
  }));
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(JSON.stringify({ routes: routes.length, failures }, null, 2));
assert.equal(failures.length, 0, 'Every mobile route must render without errors');
