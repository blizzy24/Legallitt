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
    template.resourceCountIs(
      "AWS::SecretsManager::Secret",
      env === "dev" ? 3 : 2,
    );
    template.resourceCountIs("AWS::Lambda::Function", 1);
    assert.equal(core.dependencies.length, 0);
    const json = template.toJSON();
    assert.ok(!JSON.stringify(json).includes("Fn::ImportValue"));
    const bucket = Object.values(template.findResources("AWS::S3::Bucket"))[0]
      .Properties;
    if (env === "dev")
      assert.deepEqual(bucket.CorsConfiguration.CorsRules[0].AllowedOrigins, [
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "https://legalitt-5.vercel.app",
        "https://legalitt-admin-panel.vercel.app",
      ]);
    else assert.equal(bucket.CorsConfiguration, undefined);
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
      });
  });
}
test("public signup cannot grant admin; Cognito has no custom OTP handlers", async () => {
  assert.deepEqual(Object.keys(handlers), ["preSignup"]);
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
  for (const stage of ["LegalittDev", "LegalittProd"]) {
    const template = Template.fromStack(
      app.node.findChild(stage).node.findChild("Core"),
    );
    const pool = Object.values(
      template.findResources("AWS::Cognito::UserPool"),
    )[0].Properties;
    assert.deepEqual(Object.keys(pool.LambdaConfig), ["PreSignUp"]);
    const client = Object.values(
      template.findResources("AWS::Cognito::UserPoolClient"),
    )[0].Properties;
    assert.ok(!client.ExplicitAuthFlows.includes("ALLOW_CUSTOM_AUTH"));
  }
});
