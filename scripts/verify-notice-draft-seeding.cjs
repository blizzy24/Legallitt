// Synthetic Dev case, real API and advocate browser. No credentials/tokens in
// evidence. Local mode intercepts only static files in this isolated browser;
// deployed mode verifies the public application and saves real draft versions.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { ApiClient, seedNoticeDraft } = require('../packages/shared/dist');
const { demoPassword, requireDemoMode } = require('../apps/api/dist/src/auth/demo');
const base = 'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com';
const mobile = 'https://legalitt-5.vercel.app';
const out = path.resolve('reports/notice-draft-seeding-2026-11-03');
const phase = process.env.NOTICE_EDITOR_PHASE;
const dist = process.env.NOTICE_EDITOR_EXPORT;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const labels = ['Sender Details', 'Recipient Details', 'Subject', 'Background & Facts', 'Legal Demand', 'Response Time & Closing'];
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
async function click(page, label) {
  const el = await page.evaluateHandle(label => [...document.querySelectorAll('button,[role="button"]')].find(e =>
    !e.closest('[aria-hidden="true"],[inert]') && (e.getAttribute('aria-label') === label || e.textContent.trim() === label)), label);
  assert.ok(el.asElement(), label); await el.asElement().evaluate(e => e.scrollIntoView({ block: 'center' }));
  await el.asElement().click(); await el.dispose();
}
async function fill(page, label, value) {
  const el = await page.waitForSelector(`textarea[aria-label=${JSON.stringify(label)}],input[aria-label=${JSON.stringify(label)}]`);
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click({ clickCount: 3 });
  await el.press('Backspace'); if (value) await el.type(value, { delay: 1 }); await el.evaluate(e => e.blur());
}
async function sections(page) {
  return page.evaluate(labels => labels.map((label, i) => {
    const title = [...document.querySelectorAll('div')].find(e => !e.childElementCount && e.textContent === `${i + 1}. ${label}`);
    const card = title?.parentElement?.parentElement;
    return card?.lastElementChild?.innerText ?? null;
  }), labels);
}
async function shot(page, name) {
  // Capture the full scrollable editor without changing its width or styles.
  await page.setViewport({ width: 430, height: 2600 }); await delay(250);
  await page.screenshot({ path: path.join(out, name + '.png'), fullPage: true });
  await page.setViewport({ width: 430, height: 950 });
}
async function main() {
  assert.ok(['before', 'local', 'deployed'].includes(phase));
  requireDemoMode(); fs.mkdirSync(out, { recursive: true });
  const password = await demoPassword(), api = {}, sessions = {};
  for (const role of ['client', 'admin', 'advocate']) {
    const response = await fetch(base + '/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `demo-${role}@legalitt.invalid`, password }) });
    assert.equal(response.status, 201, role + ' sign-in'); sessions[role] = await response.json();
    api[role] = new ApiClient({ baseUrl: base, getTokens: async () => sessions[role].tokens });
  }
  let record;
  const casePath = path.join(out, 'case.json');
  if (fs.existsSync(casePath)) record = await api.advocate.case(JSON.parse(fs.readFileSync(casePath)).id);
  else {
    assert.equal(phase, 'before');
    record = await api.client.createCase({ service_code: 'legal_notice', tier: 'urgent', matter_type: 'money_recovery', details: {
      client: { fullName: 'TEST ONLY Editor Sender', address: 'Synthetic sender address, Mumbai', mobile: '2025550101', email: 'sender@example.invalid' },
      noticee: { fullName: 'TEST ONLY Editor Recipient', address: 'Synthetic noticee address, Mumbai', mobile: '2025550102', email: 'recipient@example.invalid' },
      issueType: 'money-recovery',
    } });
    fs.writeFileSync(casePath, JSON.stringify({ id: record.id, reference: record.reference }, null, 2));
    await api.client.saveIntake(record.id, { subject_matter: 'TEST ONLY editor verification. A synthetic invoice of ₹5,000 remains unpaid. No actual dispute exists.', sender: { age: 41, father_name: 'Test Father' }, legal_demand: { selected: ['Pay the test invoice of ₹5,000.', 'Confirm payment in writing.'], custom: 'Return the test documents.' } });
    await api.client.generateNoticeSubject(record.id);
    await api.client.submit(record.id); await api.client.pay(record.id);
    await api.admin.assign(record.id, sessions.advocate.user.id);
    await api.advocate.accept(record.id); await api.advocate.start(record.id);
    record = await api.advocate.case(record.id);
  }
  const seed = seedNoticeDraft(record), errors = [];
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const page = await browser.newPage(); await page.setViewport({ width: 430, height: 950 });
    await page.emulateTimezone('Asia/Kolkata'); page.on('pageerror', e => errors.push(e.message));
    await page.evaluateOnNewDocument(tokens => sessionStorage.setItem('legalitt.auth.tokens', JSON.stringify({ ...tokens, expiresAt: Date.now() + tokens.expiresIn * 1000 })), sessions.advocate.tokens);
    if (phase === 'local') {
      assert.ok(dist && fs.existsSync(path.join(dist, 'index.html')));
      await page.setRequestInterception(true);
      page.on('request', request => {
        const u = new URL(request.url()); if (u.origin !== mobile) return void request.continue();
        const pathname = decodeURIComponent(u.pathname), target = path.resolve(dist, '.' + pathname);
        if (!target.startsWith(path.resolve(dist) + path.sep)) return void request.continue();
        const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : !path.extname(pathname) ? path.join(dist, 'index.html') : null;
        if (file) return void request.respond({ status: 200, contentType: mime[path.extname(file)] ?? 'application/octet-stream', body: fs.readFileSync(file) });
        void request.continue();
      });
    }
    const route = suffix => page.goto(mobile + suffix, { waitUntil: 'networkidle0', timeout: 90000 });
    const draftRoute = `/advocate/notice/${record.id}/draft`;
    const editorRoute = `/advocate/notice/draft-editor?caseId=${record.id}`;
    await route(draftRoute);
    await page.waitForFunction(() => document.body.innerText.includes('TEST ONLY Editor Sender'));
    if (phase === 'before') {
      assert.equal(record.drafts.length, 0);
      const bodies = await sections(page); assert.deepEqual(bodies, ['', '', '', '', '', '']);
      await shot(page, 'before-draft-188');
      await route(editorRoute); await page.waitForFunction(() => document.body.innerText.includes('TEST ONLY Editor Sender'));
      await shot(page, 'before-editor-266');
      fs.writeFileSync(path.join(out, 'before.json'), JSON.stringify({ case: record.reference, drafts: record.drafts.length, sections: bodies }, null, 2));
      console.log('PASS before: six blank sections; no draft created on open', record.reference); return;
    }
    await page.waitForFunction(() => document.body.innerText.includes('From client’s filing'));
    assert.deepEqual((await sections(page)).slice(0, 5), [seed.sender, seed.recipient, seed.subject, seed.facts, seed.demand]);
    const text = await page.evaluate(() => document.body.innerText);
    assert.equal(text.split('From client’s filing').length - 1, 4);
    assert.ok(text.includes('From client intake — review before use'));
    assert.ok(text.includes('Fixed template text — not editable'));
    assert.ok(!text.includes('Amit Verma') && !text.includes('₹2,85,000'));
    const edits = await page.$$eval('[aria-label^="Edit "]', els => els.map(e => e.getAttribute('aria-label')));
    assert.deepEqual(edits, ['Edit Background & Facts']);
    for (const label of labels.filter(l => l !== 'Background & Facts')) assert.equal(await page.$(`textarea[aria-label=${JSON.stringify(label)}],input[aria-label=${JSON.stringify(label)}]`), null);
    assert.equal(await page.$eval('[aria-label="Offences"]', e => e.value), '');
    await shot(page, phase + '-draft-188-seeded');
    assert.equal((await api.advocate.case(record.id)).drafts.length, 0, 'opening does not create a record');
    await route(editorRoute); await page.waitForFunction(() => document.body.innerText.includes('From client’s filing'));
    await shot(page, phase + '-editor-266-seeded');
    await route(draftRoute); await page.waitForFunction(() => document.body.innerText.includes('From client’s filing'));
    await click(page, 'Edit Background & Facts');
    const facts = '1. TEST ONLY: advocate reviewed the synthetic invoice.\n2. The test amount remains ₹5,000.';
    const offences = 'No offence alleged in this synthetic verification.';
    await fill(page, 'Background & Facts', facts); await fill(page, 'Offences', offences);
    await delay(6200);
    assert.equal(await page.$eval('[aria-label="Background & Facts"]', e => e.value), facts);
    assert.ok(!(await page.evaluate(() => document.body.innerText)).includes('From client intake — review before use'));
    assert.equal((await api.advocate.case(record.id)).drafts.length, 0, 'unsaved edits remain local');
    if (phase === 'deployed') {
      const rendered = page.waitForResponse(r => /\/drafts\/[^/]+\/pdf$/.test(r.url()) && r.request().method() === 'POST', { timeout: 90000 });
      await click(page, 'Generate Draft'); const response = await rendered; assert.equal(response.status(), 201);
      const pdf = await response.json(); fs.writeFileSync(path.join(out, 'generated-edited-notice.pdf'), Buffer.from(pdf.pdf_base64, 'base64'));
      await page.waitForFunction(() => location.pathname.endsWith('/response'));
      record = await api.advocate.case(record.id); const saved = record.drafts.at(-1).content;
      assert.deepEqual(saved, { ...seed, facts, offences });
      await route(editorRoute); await page.waitForFunction(value => document.body.innerText.includes(value), {}, offences);
      await click(page, 'Edit Background & Facts'); await fill(page, 'Background & Facts', '');
      const saving = page.waitForResponse(r => r.url().endsWith(`/cases/${record.id}/drafts`) && r.request().method() === 'POST');
      await click(page, 'Save Draft'); assert.equal((await saving).status(), 201);
      await route(draftRoute); await page.waitForFunction(value => document.body.innerText.includes(value), {}, offences);
      assert.equal((await sections(page))[3], '', 'intentional blank is not re-seeded');
      assert.equal((await api.advocate.case(record.id)).drafts.at(-1).content.facts, '');
      await shot(page, 'deployed-draft-preserved-blank');
      // Leave the test in a useful reviewed state; retain the blank version as evidence.
      await route(editorRoute); await page.waitForFunction(value => document.body.innerText.includes(value), {}, offences);
      await click(page, 'Edit Background & Facts'); await fill(page, 'Background & Facts', facts);
      const restoring = page.waitForResponse(r => r.url().endsWith(`/cases/${record.id}/drafts`) && r.request().method() === 'POST');
      await click(page, 'Save Draft'); assert.equal((await restoring).status(), 201);
      await page.reload({ waitUntil: 'networkidle0' }); await page.waitForFunction(value => document.body.innerText.includes(value), {}, offences);
      await shot(page, 'deployed-editor-266-saved');
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(out, phase + '.json'), JSON.stringify({ case: { id: record.id, reference: record.reference }, publicDeployment: phase === 'deployed', seededSections: 5, editable: ['Background & Facts', 'Offences'], readOnly: labels.filter(l => l !== 'Background & Facts'), pollingPreservedEdits: true, savedAndReloaded: phase === 'deployed', deliberateBlankPreserved: phase === 'deployed', errors }, null, 2));
    console.log('PASS', phase, record.reference, 'seeded, two editable sections, no fixture leakage');
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
