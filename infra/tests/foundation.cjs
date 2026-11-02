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
  const stack = app.node.findChild(stage).node.findChild("Compute");
  const template = Template.fromStack(stack);
  const json = template.toJSON();
  test(`${stage}: requested resources, isolated networking and encryption`, () => {
    assert.equal(stack.region, "ap-south-1");
    for (const type of ["AWS::EC2::VPC", "AWS::RDS::DBInstance", "AWS::ECS::Service"])
      template.resourceCountIs(type, 1);
    template.resourceCountIs("AWS::EC2::Subnet", 4);
    if (environment === "prod") {
      template.resourceCountIs("AWS::SQS::Queue", 1);
      template.resourceCountIs("AWS::ElasticLoadBalancingV2::LoadBalancer", 1);
      template.hasResourceProperties("AWS::ElasticLoadBalancingV2::Listener", { Protocol: "HTTPS", Port: 443 });
    } else {
      // Development-only shape (§2.10): no NAT, no load balancer, no Elastic IP.
      for (const type of ["AWS::EC2::NatGateway", "AWS::EC2::EIP", "AWS::ElasticLoadBalancingV2::LoadBalancer"])
        template.resourceCountIs(type, 0);
      template.hasResourceProperties("AWS::ApiGatewayV2::Api", { ProtocolType: "HTTP" });
      template.hasResourceProperties("AWS::ApiGatewayV2::Integration", { ConnectionType: "VPC_LINK", IntegrationType: "HTTP_PROXY" });
      template.hasResourceProperties("AWS::ServiceDiscovery::Service", { DnsConfig: { DnsRecords: [{ Type: "SRV", TTL: 10 }] } });
      template.hasResourceProperties("AWS::ECS::TaskDefinition", { RuntimePlatform: { CpuArchitecture: "ARM64" } });
      // The task is reachable only from the VPC link, the database only from the task.
      const groups = template.findResources("AWS::EC2::SecurityGroup");
      for (const group of Object.values(groups))
        for (const rule of group.Properties.SecurityGroupIngress ?? []) {
          assert.equal(rule.CidrIp, undefined);
          assert.ok(rule.SourceSecurityGroupId);
        }
      const db = Object.values(template.findResources("AWS::RDS::DBInstance"))[0].Properties;
      const dbSubnets = Object.values(template.findResources("AWS::RDS::DBSubnetGroup"))[0].Properties.SubnetIds.map((s) => s.Ref);
      const routes = Object.values(template.findResources("AWS::EC2::Route")).map((r) => r.Properties.RouteTableId.Ref);
      const associations = Object.values(template.findResources("AWS::EC2::SubnetRouteTableAssociation")).map((a) => a.Properties);
      for (const subnet of dbSubnets)
        assert.ok(!associations.some((a) => a.SubnetId.Ref === subnet && routes.includes(a.RouteTableId.Ref)), "database subnet has no internet route");
      assert.equal(db.PubliclyAccessible, false);
      assert.match(stack.stackName, /DevelopmentOnly/);
      assert.equal(stack.tags.tagValues().purpose, "development-only");
    }
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
    for (const resource of Object.values(json.Resources)) {
      assert.equal(resource.Metadata.environment, environment);
      const tags = resource.Properties?.Tags;
      if (tags)
        assert.ok(Array.isArray(tags) ? tags.some((t) => t.Key === "environment" && t.Value === environment) : tags.environment === environment);
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
