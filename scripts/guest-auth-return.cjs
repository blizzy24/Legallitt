// Browser regression: real UI authentication, no injected session. API mode uses
// existing demo accounts; fixture mode also exercises sign-up without creating users.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const puppeteer = require('puppeteer-core');
const mode = process.env.AUTH_RETURN_MODE ?? 'fixtures';
const out = path.resolve(process.env.AUTH_RETURN_REPORT ?? `reports/guest-auth-return-2026-11-03/${mode}`);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let base = process.env.SMOKE_BASE_URL;
let server;
async function click(page, text) {
  await page.waitForFunction(text => [...document.querySelectorAll('[role="button"],button,[role="link"],[role="radio"]')].some(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === text || e.textContent.replace(/\s/g, '') === text.replace(/\s/g, ''))), {}, text);
  const handle = await page.evaluateHandle(text => [...document.querySelectorAll('[role="button"],button,[role="link"],[role="radio"]')].find(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === text || e.textContent.replace(/\s/g, '') === text.replace(/\s/g, ''))), text);
  await handle.asElement().click(); await handle.dispose(); await pause(200);
}
async function at(page, target) {
  await page.waitForFunction(target => location.pathname + location.search === target, { timeout: 45000 }, target);
  await pause(250);
  console.log('Reached', target);
}
async function card(page, title) {
  await page.waitForFunction(title => [...document.querySelectorAll('div')].some(e => !e.children.length && e.textContent.trim() === title), {}, title);
  const handle = await page.evaluateHandle(title => [...document.querySelectorAll('div')].find(e => !e.children.length && e.textContent.trim() === title)?.closest('[tabindex="0"]'), title);
  assert.ok(handle.asElement(), `Service card ${title}`);
  await handle.asElement().evaluate(e => e.scrollIntoView({ block: 'center' }));
  await handle.asElement().click(); await handle.dispose();
}
async function main() {
  assert.ok(['api', 'fixtures'].includes(mode)); fs.mkdirSync(out, { recursive: true });
  if (!base) {
    const dist = path.resolve('apps/mobile/dist');
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
    server = http.createServer((req, res) => {
      let file = path.resolve(dist, '.' + new URL(req.url, 'http://localhost').pathname);
      if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(dist, 'index.html');
      res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream'); res.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = `http://127.0.0.1:${server.address().port}`;
  }
  let password = 'Fixture123!', caseId = 'a1dffec9-35ab-45b8-bee5-c1f15feb3846';
  if (mode === 'api') {
    const { demoPassword } = require('../apps/api/dist/src/auth/demo'); password = await demoPassword();
    caseId = process.env.AUTH_RETURN_CASE_ID ?? caseId;
  }
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const results = [], errors = [], apiCalls = [];
  let lastPage;
  const fresh = async () => {
    const context = await browser.createBrowserContext(), page = await context.newPage();
    lastPage = page;
    await page.setViewport({ width: 395, height: 950 }); page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (r.url().includes('/api/v1/')) apiCalls.push(new URL(r.url()).pathname); });
    return { page, context };
  };
  const emailLogin = async page => {
    await page.waitForSelector('input[placeholder="Email / Mobile No"]');
    await page.type('input[placeholder="Email / Mobile No"]', 'demo-client@legalitt.invalid');
    await page.type('input[placeholder="Enter password"]', password); await click(page, 'Continue');
  };
  const code = async (page, value) => {
    for (let i = 0; i < 6; i++) { const input = await page.$(`[aria-label="Digit ${i + 1}"]`); await input.click({ clickCount: 3 }); await input.press('Backspace'); await input.type(value[i]); }
  };
  try {
    // First visit, completed onboarding, subsequent visits, and role-selection detour.
    {
      const { page, context } = await fresh(); await page.goto(base, { waitUntil: 'networkidle0' }); await at(page, '/onboarding');
      for (let i = 0; i < 6; i++) { await click(page, 'Next'); await pause(400); }
      await at(page, '/role'); await click(page, 'User Get Legal Services'); await click(page, 'Next'); await at(page, '/home');
      await page.reload({ waitUntil: 'networkidle0' }); await at(page, '/home');
      await page.goto(base, { waitUntil: 'networkidle0' }); await at(page, '/home');
      await page.goto(base + '/role?next=login', { waitUntil: 'networkidle0' }); await click(page, 'User Get Legal Services'); await click(page, 'Next'); await at(page, '/login');
      results.push('Onboarding once; reload/root visit retain guest home; role detour returns to login'); await context.close();
    }
    for (const [title, target] of [['Legal Notice', '/legal-notice'], ['Legal Advice', '/legal-advice'], ['FIR Draft', '/fir'], ['Property Search', '/property-search']]) {
      const { page, context } = await fresh(); await page.goto(base + '/home', { waitUntil: 'networkidle0' }); await at(page, '/home');
      await card(page, title); await at(page, '/login');
      // The auth destination must survive a refresh, with no credential persisted.
      await page.reload({ waitUntil: 'networkidle0' }); await at(page, '/login');
      if (title === 'Legal Notice') await page.screenshot({ path: path.join(out, 'guest-service-sign-in.png') });
      await emailLogin(page); await at(page, target);
      assert.equal(await page.evaluate(() => sessionStorage.getItem('legalitt.entry.destination')), null);
      if (title === 'Legal Notice') await page.screenshot({ path: path.join(out, 'service-after-sign-in.png') });
      await page.goto(base + '/home', { waitUntil: 'networkidle0' }); await card(page, title); await at(page, target);
      results.push(`${title}: guest → login → refresh → email sign-in → ${target}; signed-in tap direct`); await context.close();
    }
    // Exact case URL on a first visit; invalid OTP and empty-field validation stay intact.
    {
      const { page, context } = await fresh(), target = '/legal-notice/tracking?caseId=' + caseId;
      await page.goto(base + target, { waitUntil: 'networkidle0' }); await at(page, '/login');
      await page.screenshot({ path: path.join(out, 'deep-link-sign-in.png') });
      await click(page, 'Continue'); await page.waitForSelector('[role="alert"]');
      assert.match(await page.$eval('[role="alert"]', e => e.textContent), /Enter your email/);
      await page.type('input[placeholder="Email / Mobile No"]', '2025550100'); await click(page, 'Continue'); await at(page, '/verify');
      await click(page, 'Verify & Continue'); assert.match(await page.$eval('[role="alert"]', e => e.textContent), /six-digit/);
      await code(page, '654321'); await click(page, 'Verify & Continue'); assert.match(await page.$eval('[role="alert"]', e => e.textContent), /Invalid verification code/);
      await code(page, '123456'); await click(page, 'Verify & Continue'); await at(page, target);
      await page.waitForFunction(() => document.body.innerText.includes('Legal Notice'), { timeout: 30000 }); await pause(1500);
      await page.screenshot({ path: path.join(out, 'case-after-sign-in.png') });
      if (mode === 'api') assert.match(await page.evaluate(() => document.body.innerText), /LN-2026-/);
      await page.reload({ waitUntil: 'networkidle0' }); await at(page, target);
      results.push('Cold case URL → login → valid OTP → exact case URL; empty/wrong OTP rejected; authenticated refresh works'); await context.close();
    }
    // Cancellation must not cause a later unrelated login to resume the old service.
    {
      const { page, context } = await fresh(); await page.goto(base + '/services', { waitUntil: 'networkidle0' });
      await card(page, 'Property Search'); await at(page, '/login'); await click(page, 'Back'); await at(page, '/home');
      assert.equal(await page.evaluate(() => sessionStorage.getItem('legalitt.entry.destination')), null);
      await page.goto(base + '/login', { waitUntil: 'networkidle0' }); await emailLogin(page); await at(page, '/home');
      results.push('All Services uses same sign-in gate; cancelling clears destination'); await context.close();
    }
    if (mode === 'fixtures') {
      for (const [title, target] of [['Document Forensic', '/document-forensic'], ['High Court Rep.', '/services/high-court'], ['District Court Rep.', '/services/district-court']]) {
        const { page, context } = await fresh(); await page.goto(base + '/services', { waitUntil: 'networkidle0' });
        await card(page, title); await at(page, '/login'); await emailLogin(page); await at(page, target);
        results.push(`${title}: All Services → login → ${target}`); await context.close();
      }
      const { page, context } = await fresh(); await page.goto(base + '/home', { waitUntil: 'networkidle0' });
      await card(page, 'FIR Draft'); await at(page, '/login'); await click(page, 'Sign Up'); await at(page, '/signup');
      await page.type('input[placeholder="Enter your name"]', 'Fixture Test'); await page.type('input[placeholder="Enter email address"]', 'fixture@example.invalid');
      await page.type('input[placeholder="Enter password"]', password); await click(page, 'Create Account'); await at(page, '/signup-verify');
      await code(page, '123456'); await click(page, 'Verify & Continue'); await at(page, '/signup-success');
      await page.reload({ waitUntil: 'networkidle0' }); await at(page, '/signup-success'); await click(page, 'Get Started'); await at(page, '/fir');
      results.push('Sign-up → verification → success → refresh → Get Started resumes FIR'); await context.close();
      assert.equal(apiCalls.length, 0, 'Fixture auth never calls the API');
    } else {
      assert.ok(apiCalls.includes('/api/v1/auth/login')); assert.ok(apiCalls.includes('/api/v1/auth/otp/verify'));
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ mode, base, results, pageErrors: errors, apiCalled: apiCalls.length > 0 }, null, 2));
    console.log(results.join('\n'));
  } catch (error) {
    if (lastPage && !lastPage.isClosed()) {
      await lastPage.screenshot({ path: path.join(out, 'failure.png') });
      console.error('Failure at', new URL(lastPage.url()).pathname, 'Visible errors:', await lastPage.$$eval('[role="alert"]', els => els.map(e => e.textContent)));
    }
    console.error('API request paths', [...new Set(apiCalls)]);
    throw error;
  } finally { await browser.close(); if (server) server.close(); }
}
main().catch(e => { console.error(e.message); if (server) server.close(); process.exitCode = 1; });
