// Explicit deployed browser verification. Creates only synthetic test data.
// Provider failure responses below are injected into this isolated browser;
// successful retries use the actual deployed API and Google adapter.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { ApiClient, SIMULATED_NOTICE_SUBJECT, SIMULATED_NOTICE_DEMANDS } = require('../packages/shared/dist');
const { demoPassword, requireDemoMode } = require('../apps/api/dist/src/auth/demo');
const out = path.resolve('reports/gemini-deployment-2026-11-03');
const client = 'https://legalitt-5.vercel.app';
const base = 'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function click(page, label, role = 'button') {
  await page.bringToFront();
  await page.waitForFunction((label, role) => [...document.querySelectorAll(`[role="${role}"],button,a`)].some(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === label || e.textContent.trim() === label)), { timeout: 45000 }, label, role);
  const element = await page.evaluateHandle((label, role) => [...document.querySelectorAll(`[role="${role}"],button,a`)].find(e =>
    !e.closest('[aria-hidden="true"],[inert]') && e.getClientRects().length && e.getAttribute('aria-disabled') !== 'true' &&
    (e.getAttribute('aria-label') === label || e.textContent.trim() === label)), label, role);
  await element.asElement().evaluate(e => e.scrollIntoView({ block: 'center' })); await element.asElement().click(); await element.dispose(); await delay(250);
}
async function fill(page, label, value) {
  const selector = `input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`;
  await page.waitForSelector(selector);
  const handle = await page.evaluateHandle(selector => [...document.querySelectorAll(selector)].find(e => !e.closest('[aria-hidden="true"],[inert]')), selector);
  const input = handle.asElement(); assert.ok(input, label);
  await input.evaluate(e => e.scrollIntoView({ block: 'center' })); await input.click({ clickCount: 3 }); await input.press('Backspace'); await input.type(value); await input.evaluate(e => e.blur()); await handle.dispose();
}
async function route(page, suffix) { await page.waitForFunction(suffix => location.pathname.endsWith(suffix), { timeout: 60000 }, suffix); await delay(400); console.log('Reached', suffix); }
async function main() {
  assert.equal(process.env.DEPLOYED_GEMINI_CHECK, '1'); requireDemoMode(); fs.mkdirSync(out, { recursive: true });
  const password = await demoPassword();
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const page = await browser.newPage(); await page.setViewport({ width: 395, height: 1050 });
  const errors = [], failures = new Set(['subject', 'demand-options']), injected = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => { errors.push('Unexpected blocking dialog'); void dialog.dismiss(); });
  const responseFor = name => page.waitForResponse(r => r.url().endsWith('/' + name) && r.request().method() === 'POST', { timeout: 90000 });
  async function errorVisible(name) {
    await page.waitForFunction(() => [...document.querySelectorAll('[role="alert"]')].some(e => e.textContent.includes('Couldn’t generate')), { timeout: 45000 });
    const message = await page.$eval('[role="alert"]', e => e.textContent);
    assert.ok(!/Gemini|RESOURCE_EXHAUSTED|gemini-/.test(message));
    await page.screenshot({ path: path.join(out, name + '-rate-limit.png'), fullPage: true });
    return message;
  }
  try {
    await page.goto(client + '/login', { waitUntil: 'networkidle0' });
    await page.type('input[placeholder="Email / Mobile No"]', 'demo-client@legalitt.invalid');
    await fill(page, 'Password', password); await click(page, 'Continue'); await route(page, '/home');
    const tokens = await page.evaluate(() => JSON.parse(sessionStorage.getItem('legalitt.auth.tokens')));
    const api = new ApiClient({ baseUrl: base, getTokens: async () => tokens });
    await page.setRequestInterception(true);
    page.on('request', request => {
      const name = new URL(request.url()).pathname.split('/').at(-1);
      if (request.url().startsWith(base + '/') && request.method() === 'POST' && failures.has(name)) {
        failures.delete(name); injected.push(name);
        void request.respond({ status: 502, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': client },
          body: JSON.stringify({ statusCode: 502, error: 'Bad Gateway', message: name === 'subject'
            ? 'Couldn’t generate the subject just now. Please try again.'
            : 'Couldn’t generate suggestions just now. Try again, or type your own.' }) });
      } else void request.continue();
    });
    if (process.env.DEPLOYED_GEMINI_CASE_ID) {
      await page.goto(client + '/legal-notice/step3?caseId=' + process.env.DEPLOYED_GEMINI_CASE_ID, { waitUntil: 'networkidle0' });
    } else {
      await page.goto(client + '/legal-notice', { waitUntil: 'networkidle0' }); await click(page, 'Get Started');
    }
    await route(page, '/step3');
    const id = new URL(page.url()).searchParams.get('caseId'); assert.ok(id);
    const subjectMatter = 'Synthetic testing case only. An unpaid invoice for ₹5,000 for website design services. The client requests payment of the outstanding invoice and written confirmation of settlement.';
    const first = await api.case(id); fs.writeFileSync(path.join(out, 'case.json'), JSON.stringify({ id, reference: first.reference }, null, 2));
    await click(page, 'Money Recovery'); await fill(page, 'Subject matter in dispute', subjectMatter); await click(page, 'Continue');
    const subjectError = await errorVisible('subject');
    assert.ok(new URL(page.url()).pathname.endsWith('/step3'));
    assert.equal(await page.$eval('textarea[aria-label="Subject matter in dispute"]', e => e.value), subjectMatter);
    const subjectResponse = responseFor('subject'); await click(page, 'Continue');
    const subjectHttp = await subjectResponse; assert.ok(subjectHttp.ok(), `Subject HTTP ${subjectHttp.status()}`); const subject = await subjectHttp.json();
    assert.equal(subject.simulated, false); assert.notEqual(subject.text, SIMULATED_NOTICE_SUBJECT); await route(page, '/step2');
    for (const [label, value] of Object.entries({ 'Noticee Full Name': 'Synthetic Test Recipient', 'Mobile Number of Noticee': '2025550102', 'Email Id of Noticee': 'recipient@example.invalid', 'Relationship': 'Test only', 'Full Address': 'Synthetic test address, Mumbai' })) await fill(page, label, value);
    await click(page, 'Continue'); await route(page, '/step1');
    for (const [label, value] of Object.entries({ 'Full Name': 'Synthetic Test Sender', 'Age': '40', 'Father’s name (S/o Shri)': 'Test Father', 'Mobile Number': '2025550101', 'Email Address': 'sender@example.invalid', 'Full Address': 'Synthetic test address, Mumbai' })) await fill(page, label, value);
    await click(page, 'Continue'); await route(page, '/demand');
    const demandsError = await errorVisible('demands');
    assert.equal(await page.$$eval('[role="checkbox"]', nodes => nodes.length), 0);
    // The custom field and navigation remain usable while generation is unavailable.
    await fill(page, 'Write your own demand', 'Written confirmation of payment.');
    const demandsResponse = responseFor('demand-options'); await click(page, 'Generate options');
    const demandsHttp = await demandsResponse; assert.ok(demandsHttp.ok(), `Demands HTTP ${demandsHttp.status()}`); const demands = await demandsHttp.json();
    assert.equal(demands.simulated, false); assert.notDeepEqual(demands.options, [...SIMULATED_NOTICE_DEMANDS]);
    await page.waitForSelector('[role="checkbox"]');
    assert.deepEqual(await page.$$eval('[role="checkbox"]', nodes => nodes.map(e => e.textContent.trim())), demands.options);
    await page.screenshot({ path: path.join(out, 'generated-demands.png'), fullPage: true });
    await click(page, demands.options[0], 'checkbox'); await click(page, 'Continue'); await route(page, '/step4');
    const saved = await api.case(id), events = (await api.events(id)).items.filter(e => ['subject_generated', 'demand_options_generated'].includes(e.type));
    assert.equal(saved.subject_line, subject.text);
    assert.deepEqual(saved.legal_demand.selected, [demands.options[0]]);
    assert.ok(events.some(e => e.type === 'subject_generated')); assert.ok(events.some(e => e.type === 'demand_options_generated'));
    assert.ok(events.every(e => e.source === 'real')); assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'intake-result.json'), JSON.stringify({ reference: saved.reference, caseId: id, subjectMatter, subject, demands,
      saved: { subject_line: saved.subject_line, legal_demand: saved.legal_demand }, events,
      failureChecks: { method: 'Browser-only injected HTTP 502 matching the API provider-error response; retries are real deployed requests', injected, subjectError, demandsError, subjectPreserved: true, demandsCustomInputUsable: true, recoveredTo: '/legal-notice/step4' }, browserErrors: errors }, null, 2));
    console.log(JSON.stringify({ reference: saved.reference, subject, demands, errors, recoveredTo: '/legal-notice/step4' }, null, 2));
  } catch (error) {
    await page.screenshot({ path: path.join(out, 'verification-failure.png'), fullPage: true });
    console.error(error.message); process.exitCode = 1;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
