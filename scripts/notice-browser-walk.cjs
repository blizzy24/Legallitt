// Requires a local API-mode export on localhost:8081 and private real sessions.
// Synthetic test case only; uses design-188 text, never invented legal content.
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const puppeteer = require("puppeteer-core");
const { ApiClient } = require("../packages/shared/dist");
const { PDFDocument } = require("../apps/api/node_modules/pdf-lib");
(async () => {
  const sessions = JSON.parse(
    fs.readFileSync(process.env.NOTICE_WALK_SESSIONS, "utf8"),
  );
  const root = path.resolve(__dirname, "..");
  const drawn = fs
    .readFileSync(path.join(root, "apps/mobile/data/advocateSide.ts"), "utf8")
    .split("export const ADV_NOTICE_DRAFT =")[1]
    .split("  ai:")[0];
  const sections = [
    ...drawn.matchAll(/title: '([^']+)',\s*body: '([^']*)'/g),
  ].map((m) => ({ title: m[1], body: m[2] }));
  assert.equal(sections.length, 6);
  const admin = new ApiClient({
    baseUrl: process.env.NOTICE_WALK_API_URL ?? "http://localhost:3001",
    getTokens: async () => sessions.admin.tokens,
  });
  const pdf = await PDFDocument.create();
  pdf.addPage();
  pdf.addPage();
  const bytes = await pdf.save();
  const fixture = "/private/tmp/legalitt-step7-supporting.pdf";
  fs.writeFileSync(fixture, bytes);
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const errors = [];
  let client, advocate, caseId;
  try {
    async function pageFor(role) {
      const p = await browser.newPage();
      p.on("pageerror", (e) => errors.push(e.message));
      await p.setViewport({ width: 390, height: 900, isMobile: true });
      await p.evaluateOnNewDocument(
        (tokens) =>
          sessionStorage.setItem(
            "legalitt.auth.tokens",
            JSON.stringify(tokens),
          ),
        sessions[role].tokens,
      );
      return p;
    }
    client = await pageFor("client");
    advocate = await pageFor("advocate");
    async function click(p, label) {
      await p.bringToFront();
      await p.waitForFunction(
        (label) =>
          [...document.querySelectorAll('[role="button"],button')].some(
            (e) =>
              !e.closest('[aria-hidden="true"],[inert]') &&
              e.getClientRects().length &&
              (e.getAttribute("aria-label") === label ||
                e.textContent.trim() === label) &&
              e.getAttribute("aria-disabled") !== "true",
          ),
        { timeout: 30000, polling: 100 },
        label,
      );
      const handle = await p.evaluateHandle(
        (label) =>
          [...document.querySelectorAll('[role="button"],button')]
            .filter(
              (e) =>
                !e.closest('[aria-hidden="true"],[inert]') &&
                e.getClientRects().length &&
                (e.getAttribute("aria-label") === label ||
                  e.textContent.trim() === label) &&
                e.getAttribute("aria-disabled") !== "true",
            )
            .at(-1),
        label,
      );
      await handle.asElement().click();
      await handle.dispose();
    }
    async function fill(p, label, value) {
      await p.bringToFront();
      await p.waitForFunction(
        (label) =>
          [...document.querySelectorAll("input,textarea")].some(
            (e) =>
              e.getAttribute("aria-label") === label &&
              !e.closest('[aria-hidden="true"],[inert]') &&
              !e.disabled,
          ),
        { timeout: 30000, polling: 100 },
        label,
      );
      const handle = await p.evaluateHandle(
        (label) =>
          [...document.querySelectorAll("input,textarea")]
            .filter(
              (e) =>
                e.getAttribute("aria-label") === label &&
                !e.closest('[aria-hidden="true"],[inert]') &&
                !e.disabled,
            )
            .at(-1),
        label,
      );
      const element = handle.asElement();
      await element.click({ clickCount: 3 });
      await element.press("Backspace");
      await element.type(value);
      await handle.dispose();
    }
    async function route(p, part) {
      await p.bringToFront();
      await p.waitForFunction(
        (part) => location.pathname === part,
        { timeout: 30000, polling: 100 },
        part,
      );
    }
    async function text(p, value) {
      await p.bringToFront();
      await p.waitForFunction(
        (value) => document.body.innerText.includes(value),
        { timeout: 30000, polling: 100 },
        value,
      );
    }
    await client.goto("http://localhost:8081/legal-notice/detail", {
      waitUntil: "networkidle0",
    });
    await click(client, "Send a Legal Notice");
    await route(client, "/legal-notice/step1");
    caseId = new URL(client.url()).searchParams.get("caseId");
    assert.ok(caseId);
    fs.writeFileSync("/private/tmp/legalitt-step7-case-id", caseId, {
      mode: 0o600,
    });
    for (const [label, value] of Object.entries({
      "Full Name": "Rahul Sharma",
      "Mobile Number": "2025550101",
      "Email Address": "client@example.invalid",
      "Full Address": "Indore, Madhya Pradesh",
    }))
      await fill(client, label, value);
    await click(client, "Continue");
    await route(client, "/legal-notice/step2");
    for (const [label, value] of Object.entries({
      "Full Name": "Amit Verma",
      "Mobile Number": "2025550102",
      "Email Address": "noticee@example.invalid",
      "Full Address": "Commercial Enclave, Indore",
      Relationship: "Proprietor",
    }))
      await fill(client, label, value);
    await click(client, "Continue");
    await route(client, "/legal-notice/step3");
    await client.evaluate(() =>
      [...document.querySelectorAll('[role="radio"]')]
        .find(
          (el) =>
            el.textContent.includes("Money Recovery") &&
            !el.closest('[aria-hidden="true"]'),
        )
        .click(),
    );
    await click(client, "Continue");
    await route(client, "/legal-notice/step4");
    const chooser = client.waitForFileChooser();
    await click(client, "Agreement");
    await (await chooser).accept([fixture]);
    await text(client, "legalitt-step7-supporting.pdf");
    await text(client, "2 page(s)");
    await click(client, "Continue");
    await route(client, "/legal-notice/step5");
    await click(client, "Submit & Proceed to Pay");
    await route(client, "/legal-notice/step6");
    await click(client, "Pay");
    await route(client, "/legal-notice/tracking");
    console.log(
      "Client browser: intake, direct S3 upload (2 pages), submit and development payment passed",
    );
    const paid = await admin.case(caseId);
    assert.equal(paid.status, "paid");
    await admin.assign(caseId, sessions.advocate.user.id);
    await advocate.goto("http://localhost:8081/requests", {
      waitUntil: "networkidle0",
    });
    await click(advocate, paid.reference);
    await click(advocate, "Accept");
    await route(advocate, `/advocate/notice/${caseId}/draft`);
    for (const section of sections)
      await fill(advocate, section.title, section.body);
    await click(advocate, "Save Draft");
    await route(advocate, `/advocate/notice/${caseId}/send`);
    await click(advocate, "Send to Client for Review");
    await route(advocate, `/advocate/notice/${caseId}/review`);
    await click(client, "Review & Approve Draft");
    await route(client, "/legal-notice/request-submitted");
    await click(client, "Request Changes");
    await route(client, "/legal-notice/request-changes");
    await fill(client, "Requested changes", "Client Suggestion recieve here.");
    await click(client, "Submit Changes");
    await route(client, "/legal-notice/tracking");
    await text(advocate, "Changes Requested");
    await click(advocate, "Draft Legal Notice");
    await route(advocate, `/advocate/notice/${caseId}/draft`);
    // Preserve all drawn text; changing a paragraph break is enough to prove a new version.
    await fill(
      advocate,
      sections[3].title,
      sections[3].body.replace(". ", ".\n\n"),
    );
    await click(advocate, "Save Draft");
    await route(advocate, `/advocate/notice/${caseId}/send`);
    await click(advocate, "Send to Client for Review");
    await route(advocate, `/advocate/notice/${caseId}/review`);
    await click(client, "Review & Approve Draft");
    await click(client, "Approve Draft");
    await route(client, "/legal-notice/delivery");
    console.log(
      "Both browsers: advocate accepts/drafts/sends; client requests changes; advocate revises; client approves version 2",
    );
    await click(advocate, "View Final Notice");
    await route(advocate, `/advocate/notice/${caseId}/final`);
    await click(advocate, "Dispatch");
    await route(advocate, `/advocate/notice/${caseId}/dispatch`);
    await fill(advocate, "Carrier", "Blue Dart");
    await fill(advocate, "Waybill", "TEST-STEP7");
    await click(advocate, "Mark Dispatched");
    await route(advocate, `/advocate/notice/${caseId}/tracking`);
    await text(client, "Notice Dispatched");
    const ticket = await admin.presign({
      case_id: caseId,
      kind: "delivery_proof",
      filename: "synthetic-delivery-proof.pdf",
      mime: "application/pdf",
    });
    const proof = await admin.upload(
      ticket,
      new Blob([bytes], { type: "application/pdf" }),
    );
    await admin.deliver(caseId, proof.id);
    await click(client, "Delivery Confirmed");
    await route(client, "/legal-notice/delivered");
    await text(advocate, "Delivery Confirmed");
    const result = await admin.case(caseId);
    assert.equal(result.status, "completed");
    assert.equal(result.drafts.length, 2);
    assert.equal(result.reviews.length, 2);
    const events = (await admin.events(caseId)).items;
    const expected = [
      "draft",
      "submitted",
      "payment_pending",
      "paid",
      "assigning",
      "assigned",
      "advocate_accepted",
      "in_progress",
      "draft_saved",
      "client_review",
      "changes_requested",
      "in_progress",
      "draft_saved",
      "client_review",
      "approved",
      "dispatching",
      "dispatched",
      "completed",
    ];
    assert.deepEqual(
      events.map((e) =>
        e.type === "draft_saved" ? "draft_saved" : e.to_status,
      ),
      expected,
    );
    assert.deepEqual(errors, []);
    const report = {
      reference: result.reference,
      caseId,
      clientLands: new URL(client.url()).pathname,
      advocateLands: new URL(advocate.url()).pathname,
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        from: e.from_status,
        to: e.to_status,
        actor: e.actor_role,
        at: e.created_at,
      })),
    };
    fs.writeFileSync(
      path.join(root, "reports/backend-steps/step7-events.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report, null, 2));
    await client.screenshot({
      path: "/private/tmp/legalitt-step7-client-delivered.png",
      fullPage: true,
    });
    await advocate.screenshot({
      path: "/private/tmp/legalitt-step7-advocate-complete.png",
      fullPage: true,
    });
  } catch (e) {
    if (client) {
      console.error("Client URL:", client.url());
      console.error(
        (await client.evaluate(() => document.body.innerText)).slice(-2200),
      );
      await client.screenshot({
        path: "/private/tmp/legalitt-step7-failure.png",
        fullPage: true,
      });
    }
    throw e;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
