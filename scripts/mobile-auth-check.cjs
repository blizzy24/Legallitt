// Requires private dev test credentials in AUTH_TEST_FIXTURES and a running mobile build/API.
const puppeteer = require("puppeteer-core");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const fixtures = JSON.parse(
    fs.readFileSync(process.env.AUTH_TEST_FIXTURES, "utf8"),
  ).fixtures;
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 900, isMobile: true });
    async function click(label) {
      await page.evaluate((text) => {
        const button = [
          ...document.querySelectorAll('[role="button"],button'),
        ].find((el) => el.textContent.trim() === text);
        if (!button) throw new Error("Missing button " + text);
        button.click();
      }, label);
    }
    for (const role of ["client", "advocate"]) {
      const f = fixtures.find((f) => f.role === role);
      await page.goto(`${process.env.SMOKE_BASE_URL}/login`, {
        waitUntil: "networkidle0",
      });
      await page.type('input[placeholder="Email / Mobile No"]', f.email);
      await page.type('input[placeholder="Enter password"]', f.password);
      await click("Continue");
      const destination = role === "client" ? "/home" : "/dashboard";
      await page.waitForFunction(
        (path) => location.pathname === path,
        {},
        destination,
      );
      await page.goto(`${process.env.SMOKE_BASE_URL}/advocate/fir/review`, {
        waitUntil: "networkidle0",
      });
      if (role === "client") {
        assert.equal(new URL(page.url()).pathname, "/home");
        await page.goto(
          `${process.env.SMOKE_BASE_URL}/services/district-court/advocate/decide`,
          { waitUntil: "networkidle0" },
        );
        assert.equal(
          new URL(page.url()).pathname,
          "/services/district-court/advocate/decide",
        );
      } else assert.equal(new URL(page.url()).pathname, "/advocate/fir/review");
    }
    await page.evaluate(() =>
      sessionStorage.removeItem("legalitt.auth.tokens"),
    );
    await page.goto(`${process.env.SMOKE_BASE_URL}/advocate/fir/review`, {
      waitUntil: "networkidle0",
    });
    assert.notEqual(new URL(page.url()).pathname, "/advocate/fir/review");
    await page.goto(`${process.env.SMOKE_BASE_URL}/login`, {
      waitUntil: "networkidle0",
    });
    await page.type(
      'input[placeholder="Email / Mobile No"]',
      fixtures[0].phone,
    );
    await click("Continue");
    await page.waitForFunction(() => location.pathname === "/verify");
    for (let i = 0; i < 6; i++)
      await page.type(`input[aria-label="Digit ${i + 1}"]`, String(i + 1));
    await click("Verify & Continue");
    await page.waitForFunction(() => location.pathname === "/home");
    console.log(
      "PASS: browser email/password login both roles, client blocked from advocate review, client court-selection route accessible, advocate review accessible, anonymous advocate route blocked, phone 123456 login reaches client home.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
