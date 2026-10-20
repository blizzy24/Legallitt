const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
const { App, Stack, BootstraplessSynthesizer } = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const { CfnInclude } = require("aws-cdk-lib/cloudformation-include");
const { createFoundation } = require("../dist/stack");
const app = new App({
  context: { "@aws-cdk/core:validateAgainstDefaultRules": true },
});
createFoundation(app);
for (const [stage, environment] of [
  ["LegalittDev", "dev"],
  ["LegalittProd", "prod"],
]) {
  const stack = app.node.findChild(stage).node.findChild("Foundation");
  const template = Template.fromStack(stack);
  const json = template.toJSON();
  test(`${stage}: requested resources, isolated networking and encryption`, () => {
    assert.equal(stack.region, "ap-south-1");
    for (const type of [
      "AWS::EC2::VPC",
      "AWS::RDS::DBInstance",
      "AWS::ECS::Service",
      "AWS::S3::Bucket",
      "AWS::KMS::Key",
      "AWS::SecretsManager::Secret",
      "AWS::SQS::Queue",
      "AWS::ElasticLoadBalancingV2::LoadBalancer",
    ])
      template.resourceCountIs(type, 1);
    template.resourceCountIs("AWS::EC2::Subnet", 4);
    template.hasResourceProperties("AWS::RDS::DBInstance", {
      Engine: "postgres",
      MultiAZ: environment === "prod",
      PubliclyAccessible: false,
      StorageEncrypted: true,
    });
    template.hasResourceProperties("AWS::ECS::TaskDefinition", {
      RequiresCompatibilities: ["FARGATE"],
      NetworkMode: "awsvpc",
    });
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", {
      Protocol: "HTTPS",
      Port: 443,
    });
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
    for (const resource of Object.values(json.Resources)) {
      assert.equal(resource.Metadata.environment, environment);
      if (resource.Properties?.Tags)
        assert.ok(
          resource.Properties.Tags.some(
            (t) => t.Key === "environment" && t.Value === environment,
          ),
        );
    }
  });
  test(`${stage}: bounded task roles and no invented deployment settings`, () => {
    const boundary = Object.values(
      template.findResources("AWS::IAM::ManagedPolicy"),
    )[0].Properties.PolicyDocument.Statement;
    for (const role of Object.values(template.findResources("AWS::IAM::Role")))
      assert.ok(role.Properties.PermissionsBoundary);
    for (const statement of boundary.filter((s) => s.Effect === "Allow")) {
      if (statement.Resource.includes("*"))
        assert.deepEqual(statement.Action, ["ecr:GetAuthorizationToken"]);
    }
    if (environment === "dev")
      assert.ok(
        boundary.some(
          (s) =>
            s.Effect === "Deny" &&
            s.Condition?.StringEquals?.["aws:ResourceTag/environment"] ===
              "prod",
        ),
      );
    for (const [name, p] of Object.entries(json.Parameters))
      if (name !== "BootstrapVersion") assert.equal(p.Default, undefined, name);
  });
  test(`${stage}: template parses through CDK CloudFormation resource schemas`, () => {
    const folder = fs.mkdtempSync(
      path.join(os.tmpdir(), "legalitt-cfn-check-"),
    );
    const file = path.join(folder, "template.json");
    fs.writeFileSync(file, JSON.stringify(json));
    const validationApp = new App({
      outdir: path.join(folder, "out"),
      context: { "@aws-cdk/core:validateAgainstDefaultRules": true },
    });
    new CfnInclude(
      new Stack(validationApp, "Validation", {
        synthesizer: new BootstraplessSynthesizer(),
      }),
      "Imported",
      { templateFile: file },
    );
    validationApp.synth();
  });
}
