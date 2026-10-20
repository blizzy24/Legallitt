const test = require("node:test");
const assert = require("node:assert/strict");
const { ApiClient, ApiError } = require("../dist");
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });
test("shared client refreshes once for concurrent expired sessions and attaches refreshed Cognito token", async () => {
  let tokens = {
    idToken: "old",
    accessToken: "access",
    refreshToken: "refresh",
    expiresIn: 1,
    expiresAt: 1,
  };
  let refreshes = 0;
  const seen = [];
  const client = new ApiClient({
    baseUrl: "https://api.invalid",
    getTokens: async () => tokens,
    setTokens: async (t) => {
      tokens = t;
    },
    fetch: async (url, options) => {
      if (url.endsWith("/auth/refresh")) {
        refreshes++;
        await new Promise((r) => setTimeout(r, 10));
        return json({
          tokens: { idToken: "new", accessToken: "newaccess", expiresIn: 3600 },
        });
      }
      seen.push(options.headers.Authorization);
      return json({ id: "case" });
    },
  });
  await Promise.all([client.case("a"), client.case("b")]);
  assert.equal(refreshes, 1);
  assert.deepEqual(seen, ["Bearer new", "Bearer new"]);
  assert.equal(tokens.refreshToken, "refresh");
});
test("401 retries once after refresh; expired refresh clears credentials; offline mutations are never retried", async () => {
  let tokens = {
    idToken: "old",
    accessToken: "a",
    refreshToken: "r",
    expiresIn: 3600,
  };
  let calls = 0;
  const client = new ApiClient({
    baseUrl: "https://api.invalid",
    getTokens: async () => tokens,
    setTokens: async (t) => {
      tokens = t;
    },
    fetch: async (url) => {
      calls++;
      return url.endsWith("/auth/refresh")
        ? json({ message: "Session expired" }, 401)
        : json({ message: "Unauthorized" }, 401);
    },
  });
  await assert.rejects(client.case("a"), { status: 401 });
  assert.equal(tokens, null);
  assert.equal(calls, 2);
  let failures = 0;
  const offline = new ApiClient({
    baseUrl: "https://api.invalid",
    fetch: async () => {
      failures++;
      throw new TypeError("offline");
    },
  });
  await assert.rejects(
    offline.createCase({ service_code: "legal_notice" }),
    (e) =>
      e instanceof ApiError &&
      e.code === "offline" &&
      e.message.includes("connection"),
  );
  assert.equal(failures, 1);
});
test("timeout and validation errors are visible; signed upload uses S3 directly with file last", async () => {
  const timeout = new ApiClient({
    baseUrl: "https://api.invalid",
    timeoutMs: 5,
    fetch: async (_, o) =>
      new Promise((_, reject) =>
        o.signal.addEventListener("abort", () => reject(new Error("abort"))),
      ),
  });
  await assert.rejects(timeout.case("a"), { code: "timeout" });
  const invalid = new ApiClient({
    baseUrl: "https://api.invalid",
    fetch: async () =>
      json({ message: ["Choose an issue", "Enter an address"] }, 400),
  });
  await assert.rejects(invalid.submit("a"), {
    message: "Choose an issue; Enter an address",
    status: 400,
  });
  const seen = [];
  const upload = new ApiClient({
    baseUrl: "https://api.invalid",
    fetch: async (url, o) => {
      seen.push([url, o]);
      return url.startsWith("https://storage.invalid")
        ? new Response(null, { status: 204 })
        : json({ page_count: 2 });
    },
  });
  const ticket = {
    document: { id: "d", filename: "evidence.pdf" },
    upload: {
      url: "https://storage.invalid",
      fields: { key: "cases/c/d/evidence.pdf", Policy: "policy" },
      method: "POST",
    },
  };
  assert.equal(
    (
      await upload.upload(
        ticket,
        new Blob(["pdf"], { type: "application/pdf" }),
      )
    ).page_count,
    2,
  );
  assert.equal([...seen[0][1].body.keys()].at(-1), "file");
  assert.equal(seen[0][1].headers, undefined);
  assert.ok(seen[1][0].endsWith("/documents/d/complete"));
});
test("a refresh finishing after sign-out cannot restore the old session", async () => {
  let tokens = {
    idToken: "old",
    accessToken: "a",
    refreshToken: "r",
    expiresIn: 1,
    expiresAt: 1,
  };
  let finish;
  const client = new ApiClient({
    baseUrl: "https://api.invalid",
    getTokens: async () => tokens,
    setTokens: async (t) => {
      tokens = t;
    },
    fetch: async () =>
      new Promise((resolve) => {
        finish = () =>
          resolve(
            json({
              tokens: { idToken: "new", accessToken: "a", expiresIn: 3600 },
            }),
          );
      }),
  });
  const request = client.case("a");
  while (!finish) await new Promise((r) => setTimeout(r, 1));
  tokens = null;
  finish();
  await assert.rejects(request, { status: 401 });
  assert.equal(tokens, null);
});
