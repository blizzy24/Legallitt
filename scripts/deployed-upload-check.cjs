// Explicit deployed browser check. Creates one labelled synthetic draft, uploads
// an actual PDF through the file picker, then opens it in the admin case detail.
// Never records credentials, POST policy fields or signed download URLs.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const puppeteer = require('puppeteer-core');
const { PDFDocument, StandardFonts } = require('../apps/api/node_modules/pdf-lib');
const { ApiClient } = require('../packages/shared/dist');
const { demoPassword, requireDemoMode } = require('../apps/api/dist/src/auth/demo');
const out = path.resolve('reports/deployed-upload-2026-11-03');
const client = 'https://legalitt-5.vercel.app', admin = 'https://legalitt-admin-panel.vercel.app';
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
  assert.equal(process.env.DEPLOYED_UPLOAD_CHECK, '1'); requireDemoMode(); fs.mkdirSync(out, { recursive: true });
  const password = await demoPassword();
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const priorFile = ['result.json', 'failure.json'].map(name => path.join(out, name)).find(file => fs.existsSync(file));
  const prior = process.env.DEPLOYED_UPLOAD_CASE_ID && priorFile ? JSON.parse(fs.readFileSync(priorFile, 'utf8')) : null;
  const errors = [], network = prior && (!prior.caseId || prior.caseId === process.env.DEPLOYED_UPLOAD_CASE_ID) ? prior.network : []; let mobile, panel;
  try {
    mobile = await (await browser.createBrowserContext()).newPage(); await mobile.setViewport({ width: 395, height: 950 });
    panel = await (await browser.createBrowserContext()).newPage(); await panel.setViewport({ width: 1440, height: 1000 });
    for (const [role, page] of [['client', mobile], ['admin', panel]]) {
      page.on('pageerror', e => errors.push({ role, message: e.message }));
      page.on('response', response => {
        const url = new URL(response.url());
        if (!url.hostname.endsWith('.s3.ap-south-1.amazonaws.com')) return;
        const headers = response.headers(), request = response.request(), sent = request.headers();
        network.push({ role, host: url.hostname, method: request.method(), status: response.status(), origin: sent.origin,
          contentType: sent['content-type'], requestHeaderNames: Object.keys(sent), allowedOrigin: headers['access-control-allow-origin'], responseType: headers['content-type'] });
      });
      page.on('console', message => { if (message.type() === 'error' && /CORS|cross-origin/i.test(message.text())) errors.push({ role, message: 'Browser reported a CORS error' }); });
    }
    await mobile.goto(client + '/login', { waitUntil: 'networkidle0' });
    await mobile.type('input[placeholder="Email / Mobile No"]', 'demo-client@legalitt.invalid'); await fill(mobile, 'Password', password); await click(mobile, 'Continue'); await route(mobile, '/home');
    const tokens = await mobile.evaluate(() => JSON.parse(sessionStorage.getItem('legalitt.auth.tokens')));
    const api = new ApiClient({ baseUrl: base, getTokens: async () => tokens });
    let id = process.env.DEPLOYED_UPLOAD_CASE_ID;
    if (!id) {
      await mobile.goto(client + '/legal-notice', { waitUntil: 'networkidle0' }); await click(mobile, 'Get Started'); await route(mobile, '/step3');
      id = new URL(mobile.url()).searchParams.get('caseId'); assert.ok(id);
      const record = await api.case(id); fs.writeFileSync(path.join(out, 'case.json'), JSON.stringify({ id, reference: record.reference }, null, 2));
      await click(mobile, 'Money Recovery'); await fill(mobile, 'Subject matter in dispute', 'Synthetic browser-upload verification only. No real dispute or delivery.'); await click(mobile, 'Continue'); await route(mobile, '/step2');
      for (const [label, value] of Object.entries({ 'Noticee Full Name': 'Upload Test Recipient', 'Mobile Number of Noticee': '2025550102', 'Email Id of Noticee': 'recipient@example.invalid', 'Relationship': 'Test only', 'Full Address': 'Synthetic test address, Mumbai' })) await fill(mobile, label, value);
      await click(mobile, 'Continue'); await route(mobile, '/step1');
      for (const [label, value] of Object.entries({ 'Full Name': 'Upload Test Sender', 'Age': '40', 'Father’s name (S/o Shri)': 'Test Father', 'Mobile Number': '2025550101', 'Email Address': 'sender@example.invalid', 'Full Address': 'Synthetic test address, Mumbai' })) await fill(mobile, label, value);
      await click(mobile, 'Continue'); await route(mobile, '/demand'); await mobile.waitForSelector('[role="checkbox"]');
      const option = await mobile.$eval('[role="checkbox"]', e => e.textContent.trim()); await click(mobile, option, 'checkbox'); await click(mobile, 'Continue'); await route(mobile, '/step4');
    } else { await mobile.goto(client + '/legal-notice/step4?caseId=' + id, { waitUntil: 'networkidle0' }); }
    const record = await api.case(id), filename = 'deployed-upload-verification.pdf', file = path.join(out, filename);
    let document = record.documents.find(d => d.filename === filename && d.status === 'uploaded');
    const pdf = await PDFDocument.create(), font = await pdf.embedFont(StandardFonts.Helvetica), sheet = pdf.addPage();
    sheet.drawText('DOCUMENT UPLOAD VERIFICATION', { x: 48, y: 740, size: 21, font });
    sheet.drawText('Synthetic development test. No actual dispute or delivery.', { x: 48, y: 700, size: 12, font });
    sheet.drawText(record.reference, { x: 48, y: 670, size: 15, font });
    const bytes = document ? fs.readFileSync(file) : Buffer.from(await pdf.save());
    let ticket;
    if (!document) {
    fs.writeFileSync(file, bytes);
    const presigned = mobile.waitForResponse(r => r.url().endsWith('/documents/presign') && r.request().method() === 'POST');
    const uploadResponse = mobile.waitForResponse(r => new URL(r.url()).hostname.endsWith('.s3.ap-south-1.amazonaws.com') && r.request().method() === 'POST', { timeout: 90000 });
    const [chooser] = await Promise.all([mobile.waitForFileChooser(), click(mobile, 'Upload Agreement')]); await chooser.accept([file]);
    ticket = await (await presigned).json(); assert.equal(ticket.upload.method, 'POST');
    const uploaded = await uploadResponse; assert.equal(uploaded.status(), 204); assert.equal(uploaded.headers()['access-control-allow-origin'], client);
    for (let n = 0; n < 60; n++) { document = (await api.case(id)).documents.find(d => d.id === ticket.document.id); if (document?.status === 'uploaded') break; await delay(1000); }
    }
    assert.equal(document.status, 'uploaded'); assert.equal(document.simulated, false); assert.equal(Number(document.size_bytes), bytes.length); assert.equal(document.page_count, 1);
    await delay(700); await mobile.screenshot({ path: path.join(out, 'client-uploaded.png') }); console.log(record.reference, 'S3 POST 204; document uploaded');
    await panel.goto(admin + '/sign-in', { waitUntil: 'networkidle0' }); await panel.type('input[name="email"]', 'demo-admin@legalitt.invalid'); await panel.type('input[name="password"]', password); await click(panel, 'Sign in'); await route(panel, '/legal-notices');
    await panel.goto(admin + '/legal-notices/' + id, { waitUntil: 'networkidle0' });
    await panel.waitForFunction(filename => document.querySelector('#documents')?.textContent.includes(filename), {}, filename);
    await panel.$eval('#documents', e => e.scrollIntoView({ block: 'center' })); await panel.screenshot({ path: path.join(out, 'admin-document.png') });
    const preview = panel.waitForResponse(r => r.url().endsWith('/documents/' + document.id + '/preview') && r.request().method() === 'GET');
    await click(panel, filename + ' ↗'); const link = await (await preview).json(); await panel.waitForSelector('dialog iframe');
    // Fetch from the ADMIN BROWSER to exercise the signed GET and that origin's
    // CORS as well as checking the same bytes, not merely an iframe element.
    const downloaded = await panel.evaluate(async url => { const r = await fetch(url); return { status: r.status, bytes: [...new Uint8Array(await r.arrayBuffer())] }; }, link.url);
    assert.equal(downloaded.status, 200); const hash = b => createHash('sha256').update(b).digest('hex'); assert.equal(hash(Buffer.from(downloaded.bytes)), hash(bytes));
    await delay(2000); await panel.screenshot({ path: path.join(out, 'admin-preview.png') });
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ reference: record.reference, caseId: id, clientUrl: client + '/legal-notice/step4?caseId=' + id,
      adminUrl: admin + '/legal-notices/' + id, document: { id: document.id, filename, status: document.status, pages: document.page_count, bytes: Number(document.size_bytes), simulated: document.simulated },
      uploadMethod: network.find(r => r.role === 'client' && r.method === 'POST')?.method, ...(ticket ? {uploadFormFieldNames: Object.keys(ticket.upload.fields)} : {}), network, previewStatus: downloaded.status, sha256Match: true, browserErrors: errors }, null, 2));
    console.log('Admin detail lists the client file; inline preview opened; browser GET 200 matches uploaded PDF');
  } catch (error) {
    for (const [role, page] of [['client', mobile], ['admin', panel]]) if (page) { await page.screenshot({ path: path.join(out, role + '-failure.png') }); console.error(role, await page.$$eval('[role="alert"]', els => els.map(e => e.textContent))); }
    fs.writeFileSync(path.join(out, 'failure.json'), JSON.stringify({ message: error.message, network, errors }, null, 2)); throw error;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
