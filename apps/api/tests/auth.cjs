const test = require("node:test");
const assert = require("node:assert/strict");
const { generateKeyPairSync, sign } = require("node:crypto");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const {
  AuthService,
  registerSchema,
} = require("../dist/src/auth/auth.service");
const { AuthGuard } = require("../dist/src/auth/auth.controller");
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const pool = "ap-south-1_TestPool";
const client = "unit-test-client";
const issuer = `https://cognito-idp.ap-south-1.amazonaws.com/${pool}`;
function token(changes = {}, key = privateKey) {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", kid: "test-key" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      iss: issuer,
      aud: client,
      sub: "test-sub",
      token_use: "id",
      exp: Math.floor(Date.now() / 1000) + 600,
      name: "Test account",
      "custom:role": "client",
      email_verified: true,
      ...changes,
    }),
  ).toString("base64url");
  return `${header}.${body}.${sign("RSA-SHA256", Buffer.from(`${header}.${body}`), key).toString("base64url")}`;
}
function service() {
  const auth = new AuthService({
    getClient: async () => ({
      user: {
        upsert: async ({ create }) => ({
          id: "test-id",
          status: "active",
          ...create,
        }),
      },
    }),
  });
  auth.configuration = Promise.resolve({ userPoolId: pool, clientId: client });
  auth.verifier = CognitoJwtVerifier.create({
    userPoolId: pool,
    clientId: client,
    tokenUse: "id",
  });
  auth.verifier.cacheJwks({
    keys: [
      {
        ...publicKey.export({ format: "jwk" }),
        kid: "test-key",
        alg: "RS256",
        use: "sig",
      },
    ],
  });
  return auth;
}
test("JWT verifier rejects expiry, wrong issuer/audience/use/signature and invalid role", async () => {
  const auth = service();
  assert.equal((await auth.identity(token())).role, "client");
  for (const claims of [
    { exp: 1 },
    { iss: issuer + "wrong" },
    { aud: "other" },
    { token_use: "access" },
    { "custom:role": "owner" },
  ])
    await assert.rejects(auth.identity(token(claims)));
  const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
  await assert.rejects(auth.identity(token({}, other.privateKey)));
});
test("client cannot pass advocate guard or register as admin", async () => {
  const req = { headers: { authorization: `Bearer ${token()}` } };
  const guard = new AuthGuard(service(), {
    getAllAndOverride: () => ["advocate"],
  });
  const context = {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => () => {},
    getClass: () => class {},
  };
  await assert.rejects(guard.canActivate(context), { status: 403 });
  assert.equal(
    registerSchema.safeParse({
      email: "test@example.invalid",
      name: "Test",
      password: "Test123!",
      role: "admin",
    }).success,
    false,
  );
});
test("simulated phone entry rejects production regardless of fixed code", async () => {
  const old = {
    environment: process.env.ENVIRONMENT,
    node: process.env.NODE_ENV,
    sms: process.env.SMS_ENABLED,
  };
  try {
    const auth = service();
    process.env.ENVIRONMENT = "dev";
    process.env.SMS_ENABLED = "false";
    process.env.NODE_ENV = "production";
    await assert.rejects(
      auth.verifyOtp({ phone: "+12025550101", code: "123456" }),
      { status: 503 },
    );
    process.env.NODE_ENV = "development";
    process.env.ENVIRONMENT = "prod";
    await assert.rejects(auth.requestOtp({ phone: "+12025550101" }), {
      status: 503,
    });
  } finally {
    for (const [key, value] of Object.entries({
      ENVIRONMENT: old.environment,
      NODE_ENV: old.node,
      SMS_ENABLED: old.sms,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
