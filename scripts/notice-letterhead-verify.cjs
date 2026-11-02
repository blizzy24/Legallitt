// Local-only, synthetic end-to-end letterhead verification. No tokens or
// passwords are written to the report. Run after rebuilding/restarting the API:
// NOTICE_LETTERHEAD_RUN=1 node --env-file=apps/api/.env.local scripts/notice-letterhead-verify.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { ApiClient } = require('../packages/shared/dist');
const { demoAccounts, demoPassword, requireDemoMode } = require('../apps/api/dist/src/auth/demo');

const apiBase = 'http://127.0.0.1:3001';
const mobileBase = 'http://localhost:8081';
const out = path.resolve('reports/notice-letterhead-2026-11-02');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  assert.equal(process.env.NOTICE_LETTERHEAD_RUN, '1', 'Set NOTICE_LETTERHEAD_RUN=1 to create a synthetic local case');
  requireDemoMode();
  fs.mkdirSync(out, { recursive: true });
  const password = await demoPassword();
  const sessions = {};
  for (const [role, email] of Object.entries({
    client: demoAccounts.client.email,
    advocate: demoAccounts.advocate.email,
    admin: 'demo-admin@legalitt.invalid',
  })) {
    const response = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(response.status, 201, `Seeded ${role} sign-in failed: HTTP ${response.status}`);
    sessions[role] = await response.json();
    assert.equal(sessions[role].user.role, role);
  }
  const clients = Object.fromEntries(Object.keys(sessions).map(role => [role,
    new ApiClient({ baseUrl: apiBase, getTokens: async () => sessions[role].tokens }),
  ]));
  const { client, advocate, admin } = clients;
  let record;
  if (process.env.NOTICE_LETTERHEAD_CASE_ID) {
    record = await client.case(process.env.NOTICE_LETTERHEAD_CASE_ID);
    assert.equal(record.details.client.fullName, 'Synthetic Sender Test', 'Resume only this verification case');
    assert.equal(record.advocate.id, sessions.advocate.user.id);
    assert.equal(record.status, 'in_progress');
  } else {
    record = await client.createCase({ service_code: 'legal_notice', tier: 'urgent', matter_type: 'money_recovery' });
    await client.saveIntake(record.id, {
      subject_matter: 'Synthetic verification only: an agreed invoice of Rs 5000 remains unpaid. No real dispute or delivery is represented.',
      sender: { age: 41, father_name: 'Synthetic Father Test' },
      details: {
        client: { fullName: 'Synthetic Sender Test', mobile: '2025550101', email: 'sender@example.invalid', address: 'Synthetic sender address, Mumbai' },
        noticee: { fullName: 'Synthetic Noticee Test', mobile: '2025550102', email: 'noticee@example.invalid', address: 'Synthetic noticee address, Mumbai', relationship: 'Customer' },
        issueType: 'money-recovery',
      },
    });
    const subject = await client.generateNoticeSubject(record.id);
    const demands = await client.generateNoticeDemands(record.id);
    assert.ok(subject.text);
    await client.saveIntake(record.id, { legal_demand: {
      selected: demands.options.slice(0, 2),
      custom: 'Pay the outstanding invoice amount of ₹5,000.',
    } });
    await client.submit(record.id);
    await client.pay(record.id);
    await admin.assign(record.id, sessions.advocate.user.id);
    await advocate.accept(record.id);
    await advocate.start(record.id);
    record = await client.case(record.id);
    fs.writeFileSync(path.join(out, 'case.json'), JSON.stringify({ id: record.id, reference: record.reference }, null, 2) + '\n');
  }
  assert.equal(record.status, 'in_progress');
  const facts = [
    'This is a synthetic verification case, created only to test the Legal Notice letterhead.',
    'The test sender and noticee details are not a real dispute or a real allegation.',
    'The supplied test invoice amount is ₹5,000.',
    'The client chose the demand options during the recorded intake.',
    'The advocate is testing a notice with more than five numbered facts.',
    'यह केवल परीक्षण के लिए है।',
    'No notice is being sent to an opposing party during this verification.',
  ];
  const content = {
    sender: 'Synthetic Sender Test\nSynthetic sender address, Mumbai',
    recipient: 'Synthetic Noticee Test\nSynthetic noticee address, Mumbai',
    subject: record.subject_line,
    facts: facts.join('\n'),
    demand: [...record.legal_demand.selected, record.legal_demand.custom].join('\n'),
    closing: 'Synthetic verification only.',
    offences: '',
  };
  await advocate.saveDraft(record.id, content);

  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  });
  const errors = [];
  let page;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900, isMobile: true });
    page.on('pageerror', error => errors.push(error.message));
    await page.evaluateOnNewDocument(tokens => sessionStorage.setItem('legalitt.auth.tokens', JSON.stringify(tokens)), sessions.advocate.tokens);
    await page.goto(`${mobileBase}/advocate/notice/${record.id}/draft?caseId=${record.id}`, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction(() => document.body.innerText.includes('Synthetic Sender Test'));
    await page.screenshot({ path: path.join(out, 'editor.png') });
    const offences = await page.waitForSelector('textarea[aria-label="Offences"],input[aria-label="Offences"]');
    await offences.evaluate(element => element.scrollIntoView({ block: 'center' }));
    await offences.click({ clickCount: 3 }); await offences.press('Backspace');
    await offences.type('not alleged in this synthetic verification case');
    await offences.evaluate(element => element.blur());
    await page.screenshot({ path: path.join(out, 'editor-offences.png') });
    const pdfResponse = page.waitForResponse(response => /\/drafts\/[0-9a-f-]+\/pdf$/.test(response.url()) && response.request().method() === 'POST', { timeout: 90000 });
    const button = await page.evaluateHandle(() => [...document.querySelectorAll('button,[role="button"]')].find(element =>
      !element.closest('[aria-hidden="true"],[inert]') && element.textContent.trim() === 'Generate Draft'));
    assert.ok(button.asElement(), 'Generate Draft button exists');
    await button.asElement().click(); await button.dispose();
    const response = await pdfResponse;
    assert.equal(response.status(), 201);
    const rendered = await response.json();
    assert.ok(rendered.filename && rendered.pdf_base64, 'Generate Draft returns the real template PDF');
    const pdfPath = path.join(out, 'Legal_Notice_Letterhead.pdf');
    const bytes = Buffer.from(rendered.pdf_base64, 'base64');
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    fs.writeFileSync(pdfPath, bytes);
    await page.waitForFunction(() => location.pathname.endsWith('/response'), { timeout: 90000 });
    await pause(600);
    await page.screenshot({ path: path.join(out, 'response.png') });
    await page.goto(`${mobileBase}/advocate/notice/response-editor?caseId=${record.id}`, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction(() => document.body.innerText.includes('Synthetic Sender Test'));
    const response267 = page.waitForResponse(response => /\/drafts\/[0-9a-f-]+\/pdf$/.test(response.url()) && response.request().method() === 'POST', { timeout: 90000 });
    const generate267 = await page.evaluateHandle(() => [...document.querySelectorAll('button,[role="button"]')].find(element =>
      !element.closest('[aria-hidden="true"],[inert]') && element.textContent.trim() === 'Generate Draft with AI'));
    assert.ok(generate267.asElement(), 'Design 267 Generate Draft with AI button exists');
    await generate267.asElement().click(); await generate267.dispose();
    const rendered267 = await response267; assert.equal(rendered267.status(), 201);
    assert.ok((await rendered267.json()).pdf_base64, 'Design 267 calls the real PDF render endpoint');
    assert.equal(new URL(page.url()).pathname, '/advocate/notice/response-editor', 'Design 267 does not submit for review');
    await page.screenshot({ path: path.join(out, 'response-editor-267.png') });
    const latest = await advocate.case(record.id);
    const draft = latest.drafts.at(-1);
    assert.equal(draft.content.offences, 'not alleged in this synthetic verification case');
    assert.equal(draft.content.facts.split('\n').length, 7);
    assert.equal(latest.status, 'in_progress', 'Generate Draft must not send or approve the case');
    assert.deepEqual(errors, []);
    const report = {
      id: latest.id, reference: latest.reference, status: latest.status, draft_id: draft.id,
      subject_line: latest.subject_line, legal_demand: latest.legal_demand,
      sender: latest.parties.find(party => party.kind === 'sender'),
      advocate: latest.advocate, offences: draft.content.offences,
      facts: facts.length, pdf: path.relative(process.cwd(), pdfPath), bytes: bytes.length,
      screenshots: ['editor.png', 'editor-offences.png', 'response.png', 'response-editor-267.png'],
      assertions: ['real sign-in for client/advocate/admin', 'intake persisted', 'service payment captured', 'admin assigned advocate', 'Generate Draft saved offences and returned PDF', 'design 267 Generate Draft with AI calls the render endpoint without submitting', 'seven facts retained', 'case remains in_progress', 'no browser errors'],
    };
    fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ id: record.id, reference: record.reference, pdf: report.pdf, status: latest.status }));
  } catch (error) {
    if (page) {
      await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {});
      fs.writeFileSync(path.join(out, 'failure.txt'), String(error) + '\n' + await page.evaluate(() => document.body.innerText).catch(() => ''));
    }
    throw error;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
