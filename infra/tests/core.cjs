const test = require("node:test");
const assert = require("node:assert/strict");
const { App } = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { createFoundation } = require("../dist/stack");
const handlers = require("../lambda/auth.cjs");
const app = new App({
  context: { "@aws-cdk/core:validateAgainstDefaultRules": true },
});
createFoundation(app);
for (const [stage, env] of [
  ["LegalittDev", "dev"],
  ["LegalittProd", "prod"],
]) {
  test(`${stage} Core has no compute resources or dependencies`, () => {
    const core = app.node.findChild(stage).node.findChild("Core");
    const template = Template.fromStack(core);
    for (const type of [
      "AWS::EC2::VPC",
      "AWS::RDS::DBInstance",
      "AWS::ECS::Service",
      "AWS::SQS::Queue",
      "AWS::ElasticLoadBalancingV2::LoadBalancer",
    ])
      template.resourceCountIs(type, 0);
    template.resourceCountIs("AWS::Cognito::UserPool", 1);
    template.resourceCountIs("AWS::Cognito::UserPoolClient", 1);
    template.resourceCountIs("AWS::S3::Bucket", 1);
    template.resourceCountIs("AWS::SecretsManager::Secret", 2);
    template.resourceCountIs("AWS::Lambda::Function", 4);
    assert.equal(core.dependencies.length, 0);
    const json = template.toJSON();
    assert.ok(!JSON.stringify(json).includes("Fn::ImportValue"));
    const bucket = Object.values(template.findResources("AWS::S3::Bucket"))[0]
      .Properties;
    assert.ok(
      Object.values(bucket.PublicAccessBlockConfiguration).every(Boolean),
    );
    assert.equal(
      bucket.BucketEncryption.ServerSideEncryptionConfiguration[0]
        .ServerSideEncryptionByDefault.SSEAlgorithm,
      "aws:kms",
    );
    template.hasResourceProperties("AWS::Cognito::UserPool", {
      AutoVerifiedAttributes: ["email"],
      Schema: [
        {
          Name: "role",
          AttributeDataType: "String",
          Mutable: false,
          Required: false,
          StringAttributeConstraints: { MinLength: "5", MaxLength: "8" },
        },
      ],
    });
    for (const fn of Object.values(
      template.findResources("AWS::Lambda::Function"),
    ))
      assert.deepEqual(fn.Properties.Environment.Variables, {
        ENVIRONMENT: env,
        SMS_ENABLED: "false",
      });
  });
}
test("fixed OTP is dev-only, expires, and cannot grant public admin signup", async () => {
  const oldEnv = process.env.ENVIRONMENT,
    oldSms = process.env.SMS_ENABLED;
  try {
    const attempt = () => ({
      request: {
        challengeAnswer: "123456",
        privateChallengeParameters: { issuedAt: String(Date.now()) },
      },
      response: {},
    });
    process.env.ENVIRONMENT = "dev";
    process.env.SMS_ENABLED = "false";
    assert.equal(
      (await handlers.verify(attempt())).response.answerCorrect,
      true,
    );
    const expired = attempt();
    expired.request.privateChallengeParameters.issuedAt = String(
      Date.now() - 300001,
    );
    assert.equal(
      (await handlers.verify(expired)).response.answerCorrect,
      false,
    );
    for (const env of ["prod", "production", "", undefined]) {
      if (env === undefined) delete process.env.ENVIRONMENT;
      else process.env.ENVIRONMENT = env;
      assert.equal(
        (await handlers.verify(attempt())).response.answerCorrect,
        false,
      );
      assert.equal(
        (
          await handlers.define({
            request: {
              session: [
                { challengeName: "CUSTOM_CHALLENGE", challengeResult: true },
              ],
            },
            response: {},
          })
        ).response.issueTokens,
        false,
      );
    }
    process.env.ENVIRONMENT = "dev";
    process.env.SMS_ENABLED = "true";
    assert.equal(
      (await handlers.verify(attempt())).response.answerCorrect,
      false,
    );
    await assert.rejects(
      handlers.preSignup({
        triggerSource: "PreSignUp_SignUp",
        request: { userAttributes: { "custom:role": "admin" } },
      }),
    );
    await handlers.preSignup({
      triggerSource: "PreSignUp_SignUp",
      request: { userAttributes: { "custom:role": "advocate" } },
    });
  } finally {
    if (oldEnv === undefined) delete process.env.ENVIRONMENT;
    else process.env.ENVIRONMENT = oldEnv;
    if (oldSms === undefined) delete process.env.SMS_ENABLED;
    else process.env.SMS_ENABLED = oldSms;
  }
});
