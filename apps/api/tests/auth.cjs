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
    mode: process.env.PHONE_AUTH_MODE,
  };
  try {
    const auth = service();
    process.env.ENVIRONMENT = "dev";
    process.env.PHONE_AUTH_MODE = "demo";
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
      PHONE_AUTH_MODE: old.mode,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("demo OTP ignores phone, selects only fixed accounts and uses password auth", async () => {
  const demo = require("../dist/src/auth/demo");
  const oldPassword = demo.demoPassword;
  const old = {
    ENVIRONMENT: process.env.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    PHONE_AUTH_MODE: process.env.PHONE_AUTH_MODE,
  };
  try {
    Object.assign(process.env, {
      ENVIRONMENT: "dev",
      NODE_ENV: "development",
      PHONE_AUTH_MODE: "demo",
    });
    demo.demoPassword = async () => "test-secret-not-a-real-password";
    const auth = service();
    const calls = [];
    auth.cognito.send = async (command) => {
      calls.push(command);
      const role = command.input.AuthParameters.USERNAME.includes("advocate")
        ? "advocate"
        : "client";
      return {
        AuthenticationResult: {
          IdToken: token({ "custom:role": role }),
          AccessToken: "access",
          RefreshToken: "refresh",
          ExpiresIn: 3600,
        },
      };
    };
    assert.deepEqual(await auth.requestOtp({ phone: "ignored" }), {
      requested: true,
    });
    assert.equal(calls.length, 0);
    for (const role of ["client", "advocate"]) {
      const result = await auth.verifyOtp({
        phone: "any number",
        code: "123456",
        role,
      });
      assert.equal(result.user.role, role);
      assert.equal(calls.at(-1).input.AuthFlow, "USER_PASSWORD_AUTH");
      assert.equal(
        calls.at(-1).input.AuthParameters.USERNAME,
        `demo-${role}@legalitt.invalid`,
      );
      assert.ok(!JSON.stringify(calls.at(-1)).includes("any number"));
      assert.equal(result.tokens.refreshToken, "refresh");
    }
    const count = calls.length;
    for (const code of ["", "12345", "abcdef"]) {
      await assert.rejects(
        auth.verifyOtp({ phone: "ignored", code, role: "client" }),
        { status: 400 },
      );
    }
    await assert.rejects(
      auth.verifyOtp({ phone: "", code: "000000", role: "client" }),
      { status: 401 },
    );
    await assert.rejects(
      auth.verifyOtp({ phone: "", code: "123456", role: "admin" }),
      { status: 400 },
    );
    await assert.rejects(auth.verifyOtp({ phone: "", code: "123456" }), {
      status: 400,
    });
    assert.equal(calls.length, count);
    for (const config of [
      { ENVIRONMENT: "prod", NODE_ENV: "development", PHONE_AUTH_MODE: "demo" },
      { ENVIRONMENT: "dev", NODE_ENV: "production", PHONE_AUTH_MODE: "demo" },
      { ENVIRONMENT: "dev", NODE_ENV: "development", PHONE_AUTH_MODE: "live" },
      { ENVIRONMENT: "", NODE_ENV: "development", PHONE_AUTH_MODE: "demo" },
      { ENVIRONMENT: "dev", NODE_ENV: "development", PHONE_AUTH_MODE: "" },
    ]) {
      Object.assign(process.env, config);
      await assert.rejects(auth.requestOtp({ phone: "ignored" }), {
        status: 503,
      });
      await assert.rejects(
        auth.verifyOtp({ phone: "ignored", code: "123456", role: "client" }),
        { status: 503 },
      );
    }
    assert.equal(calls.length, count);
  } finally {
    demo.demoPassword = oldPassword;
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("registration validates password policy and logs actionable errors without credentials in dev and prod", async () => {
  const old = {
    ENVIRONMENT: process.env.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
  };
  const input = {
    email: "registration@example.invalid",
    name: "Registration Test",
    role: "client",
    password: "Example123!",
  };
  try {
    for (const env of [
      { ENVIRONMENT: "dev", NODE_ENV: "development", detailed: true },
      { ENVIRONMENT: "dev", NODE_ENV: "production", detailed: false },
      { ENVIRONMENT: "prod", NODE_ENV: "development", detailed: false },
    ]) {
      process.env.ENVIRONMENT = env.ENVIRONMENT;
      process.env.NODE_ENV = env.NODE_ENV;
      const auth = service(),
        logs = [];
      auth.logger = { error: (value) => logs.push(value) };
      let sends = 0;
      auth.cognito.send = async () => {
        sends++;
        return {};
      };
      for (const [password, expected] of [
        ["Ab1!", "Password must be at least 8 characters"],
        ["Example123", "Password must include a symbol"],
        ["example123!", "Password must include an uppercase letter"],
        ["EXAMPLE123!", "Password must include a lowercase letter"],
        ["Example!!!", "Password must include a number"],
      ]) {
        await assert.rejects(auth.register({ ...input, password }), {
          status: 400,
          message: env.detailed
            ? expected
            : "Registration could not be completed",
        });
        assert.ok(logs.at(-1).reason.includes(expected));
        assert.ok(!JSON.stringify(logs.at(-1)).includes(password));
      }
      assert.equal(sends, 0, "invalid passwords must not call Cognito");
      assert.deepEqual(await auth.register(input), {
        confirmationRequired: true,
      });
      assert.equal(sends, 1);
      for (const [name, reason, expected] of [
        [
          "InvalidPasswordException",
          "Password must have symbol characters",
          "Password must include a symbol",
        ],
        [
          "UsernameExistsException",
          "User already exists",
          "An account with this email already exists",
        ],
        [
          "CodeDeliveryFailureException",
          "SES delivery failure",
          "The verification email could not be sent. Please try again later",
        ],
        [
          "UnexpectedLambdaException",
          "Trigger failure",
          "Registration service is unavailable. Check the API logs",
        ],
      ]) {
        auth.cognito.send = async () => {
          throw Object.assign(
            new Error(`${reason}: ${input.email} ${input.password}`),
            {
              name,
              $metadata: {
                requestId: "diagnostic-request-id",
                httpStatusCode: 400,
              },
            },
          );
        };
        await assert.rejects(auth.register(input), {
          status: 400,
          message: env.detailed
            ? expected
            : "Registration could not be completed",
        });
        const log = logs.at(-1);
        assert.equal(log.error, name);
        assert.equal(log.requestId, "diagnostic-request-id");
        assert.equal(log.httpStatus, 400);
        assert.ok(log.reason.includes(reason));
        assert.ok(!JSON.stringify(log).includes(input.email));
        assert.ok(!JSON.stringify(log).includes(input.password));
      }
    }
  } finally {
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("one auth policy logs confirmation, resend and demo failures with safe environment-specific responses", async () => {
  const demo = require("../dist/src/auth/demo");
  const oldPassword = demo.demoPassword;
  const old = {
    ENVIRONMENT: process.env.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    PHONE_AUTH_MODE: process.env.PHONE_AUTH_MODE,
  };
  try {
    for (const production of [false, true]) {
      Object.assign(process.env, {
        ENVIRONMENT: "dev",
        NODE_ENV: production ? "production" : "development",
        PHONE_AUTH_MODE: "demo",
      });
      const auth = service(),
        logs = [];
      auth.logger = { error: (value) => logs.push(value) };
      for (const [name, reason, expected] of [
        [
          "CodeMismatchException",
          "Exceed max confirmation code attempts. Please resend confirmation code and retry.",
          "Too many incorrect email codes",
        ],
        [
          "CodeMismatchException",
          "Invalid verification code provided",
          "Incorrect email verification code",
        ],
        [
          "ExpiredCodeException",
          "Invalid code provided, please request a code again.",
          "The email verification code has expired",
        ],
      ]) {
        auth.cognito.send = async () => {
          throw Object.assign(new Error(reason), {
            name,
            $metadata: {
              requestId: "confirmation-request",
              httpStatusCode: 400,
            },
          });
        };
        await assert.rejects(
          auth.confirm({ email: "test@example.invalid", code: "123456" }),
          (e) => {
            assert.equal(e.status, 400);
            if (production) assert.equal(e.message, "Verification failed");
            else assert.ok(e.message.startsWith(expected));
            return true;
          },
        );
        assert.equal(logs.at(-1).event, "auth.confirmation.failed");
        assert.equal(logs.at(-1).reason, reason);
        assert.equal(logs.at(-1).requestId, "confirmation-request");
      }
      auth.cognito.send = async () => {
        throw Object.assign(new Error("Email delivery failed"), {
          name: "CodeDeliveryFailureException",
        });
      };
      if (production)
        assert.deepEqual(await auth.resend({ email: "test@example.invalid" }), {
          requested: true,
        });
      else
        await assert.rejects(
          auth.resend({ email: "test@example.invalid" }),
          /verification email could not be sent/,
        );
      assert.equal(logs.at(-1).event, "auth.resend.failed");
      if (!production) {
        demo.demoPassword = async () => "PrivateDemoPassword!";
        auth.cognito.send = async () => {
          throw Object.assign(new Error("PrivateDemoPassword! was rejected"), {
            name: "NotAuthorizedException",
            $metadata: { requestId: "demo-request" },
          });
        };
        const count = logs.length;
        await assert.rejects(
          auth.verifyOtp({ phone: "ignored", code: "123456", role: "client" }),
          /Demo Cognito sign-in failed/,
        );
        assert.equal(logs.length, count + 1);
        assert.equal(logs.at(-1).event, "auth.otp.verify.failed");
        assert.equal(logs.at(-1).requestId, "demo-request");
        assert.ok(
          !JSON.stringify(logs.at(-1)).includes("PrivateDemoPassword!"),
        );
      } else {
        await assert.rejects(
          auth.verifyOtp({ phone: "ignored", code: "123456", role: "client" }),
          { status: 503, message: "Verification failed" },
        );
        assert.equal(logs.at(-1).event, "auth.otp.verify.failed");
      }
    }
  } finally {
    demo.demoPassword = oldPassword;
    for (const [key, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
