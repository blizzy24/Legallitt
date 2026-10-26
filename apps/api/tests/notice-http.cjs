const test = require("node:test"),
  assert = require("node:assert/strict");
const { ApiClient } = require("@legalitt/shared");
test("shared typed client exercises mounted notice routes; dev payment is unavailable in production", async () => {
  require("reflect-metadata");
  const { NestFactory } = require("@nestjs/core");
  const { AppModule } = require("../dist/src/app.module");
  const { AuthService } = require("../dist/src/auth/auth.service");
  const { CaseStateMachine } = require("../dist/src/cases/case-state-machine");
  const app = await NestFactory.create(AppModule, { logger: false });
  const actor = { id: "00000000-0000-4000-8000-000000000001", role: "client" };
  app.get(AuthService).identity = async () => actor;
  const state = app.get(CaseStateMachine);
  let calls = 0;
  state.submitForPayment = async (_actor, id) => {
    calls++;
    return { id, status: "payment_pending" };
  };
  const oldEnv = process.env.ENVIRONMENT,
    oldNode = process.env.NODE_ENV;
  try {
    await app.listen(0, "127.0.0.1");
    const client = new ApiClient({
      baseUrl: await app.getUrl(),
      getTokens: async () => ({
        idToken: "test-only",
        accessToken: "a",
        expiresIn: 3600,
      }),
    });
    assert.equal((await client.submit(actor.id)).status, "payment_pending");
    assert.equal(calls, 1);
    await assert.rejects(client.assign(actor.id, actor.id), { status: 403 });
    await assert.rejects(client.deliver(actor.id, actor.id), { status: 403 });
    await assert.rejects(
      client.request("/cases/" + actor.id + "/submit", { status: "paid" }),
      { status: 400 },
    );
    process.env.ENVIRONMENT = "prod";
    process.env.NODE_ENV = "production";
    await assert.rejects(client.request(`/dev/cases/${actor.id}/pay`, {}), { status: 404 });
  } finally {
    if (oldEnv === undefined) delete process.env.ENVIRONMENT;
    else process.env.ENVIRONMENT = oldEnv;
    if (oldNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldNode;
    await app.close();
  }
});
