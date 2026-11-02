import {
  Stack,
  CfnResource,
  CfnParameter,
  CfnOutput,
  Fn,
  RemovalPolicy,
  type StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import type { CoreStack } from "./core";

// DEVELOPMENT ONLY (architecture §2.10). A dev-scale Compute at roughly
// INR 3,100/month: no NAT gateway, no load balancer, no Elastic IPs.
//
//   client --HTTPS--> API Gateway HTTP API (default execute-api domain)
//          --VPC link--> Cloud Map (SRV) --> one Fargate ARM64 task
//
// The task sits in a public subnet with a public IP so it reaches AWS APIs and
// ECR without a NAT; its security group admits only the VPC link. RDS stays in
// private subnets with no route to the internet, reachable only from the task's
// security group. The NAT and load balancer return with the production shape
// (ComputeStack) when there are real clients to protect.
//
// Core is untouched: this stack references exactly the six Core values the
// production-shaped Compute already does, so Core's exports do not change.

const ENVIRONMENT = "dev";
const PURPOSE = "development-only";
// Resource types whose CloudFormation Tags property is a [{Key, Value}] list.
const LIST_TAGGED = new Set([
  "AWS::EC2::VPC",
  "AWS::EC2::Subnet",
  "AWS::EC2::InternetGateway",
  "AWS::EC2::RouteTable",
  "AWS::EC2::SecurityGroup",
  "AWS::RDS::DBSubnetGroup",
  "AWS::RDS::DBInstance",
  "AWS::IAM::Role",
  "AWS::Logs::LogGroup",
  "AWS::ECR::Repository",
  "AWS::ECS::Cluster",
  "AWS::ECS::TaskDefinition",
  "AWS::ECS::Service",
  "AWS::ServiceDiscovery::PrivateDnsNamespace",
  "AWS::ServiceDiscovery::Service",
]);
// API Gateway v2 takes Tags as a {key: value} map.
const MAP_TAGGED = new Set([
  "AWS::ApiGatewayV2::Api",
  "AWS::ApiGatewayV2::VpcLink",
  "AWS::ApiGatewayV2::Stage",
]);
const TAGS = { environment: ENVIRONMENT, application: "legalitt", purpose: PURPOSE };

export class DevComputeStack extends Stack {
  constructor(scope: Construct, id: string, core: CoreStack, props: StackProps = {}) {
    super(scope, id, props);
    const prefix = `legalitt-${ENVIRONMENT}`;
    const parameter = (id: string, description: string, extra: Record<string, unknown> = {}) =>
      new CfnParameter(this, id, { type: "String", description, ...extra });
    // Deployment choices are parameters with no defaults; nothing is assumed.
    const cidr = parameter("VpcCidr", "Approved VPC CIDR; dev and prod must not overlap.");
    const subnetCidrs = ["PublicSubnet1Cidr", "PublicSubnet2Cidr", "PrivateSubnet1Cidr", "PrivateSubnet2Cidr"].map((id) =>
      parameter(id, "Approved subnet CIDR within this stage VPC."),
    );
    const dbClass = parameter("DatabaseInstanceClass", "Approved RDS instance class.", { allowedPattern: "db\\..+" });
    const dbStorage = parameter("DatabaseStorageGiB", "Approved initial RDS storage.", { type: "Number", minValue: 20 });
    const dbVersion = parameter("Postgres16Version", "Available Postgres 16 minor release in ap-south-1.", {
      allowedPattern: "16\\.[0-9]+",
    });
    const cpu = parameter("TaskCpu", "Fargate CPU units.", { allowedValues: ["256", "512", "1024"] });
    const memory = parameter("TaskMemoryMiB", "Fargate memory, valid for the chosen CPU.", { allowedPattern: "[0-9]+" });
    // 0 lets the stack exist before the first image is pushed.
    const count = parameter("TaskCount", "Desired API task count (0 or 1 in development).", {
      type: "Number",
      minValue: 0,
      maxValue: 1,
    });
    const port = parameter("ApiPort", "Container port; also passed to the API as PORT.", {
      type: "Number",
      minValue: 1,
      maxValue: 65535,
    });
    const imageTag = parameter("ApiImageTag", "Tag of the API image in this stage's ECR repository.");
    const userPoolId = parameter("UserPoolId", "Core's Cognito user pool id, for the ops task's demo seed only.", {
      allowedPattern: "ap-south-1_[A-Za-z0-9]+",
    });
    const corsOrigins = parameter("CorsOrigins", "Comma-separated browser origins the API admits; may be empty.");
    // false for the first create, so a rolled-back create can delete the instance;
    // set true once the stack is CREATE_COMPLETE.
    const dbProtection = parameter("DatabaseDeletionProtection", "RDS deletion protection (true after the first create).", {
      allowedValues: ["true", "false"],
    });

    const resource = (id: string, type: string, properties: Record<string, unknown>) => {
      const tags = LIST_TAGGED.has(type)
        ? { Tags: Object.entries(TAGS).map(([Key, Value]) => ({ Key, Value })) }
        : MAP_TAGGED.has(type)
          ? { Tags: TAGS }
          : {};
      const r = new CfnResource(this, id, { type, properties: { ...properties, ...tags } });
      r.addMetadata("environment", ENVIRONMENT);
      r.addMetadata("purpose", PURPOSE);
      return r;
    };
    const arn = (r: CfnResource, attr = "Arn") => r.getAtt(attr).toString();

    // ---- network: two public subnets (task, VPC link) and two isolated (RDS)
    const vpc = resource("Vpc", "AWS::EC2::VPC", {
      CidrBlock: cidr.valueAsString,
      EnableDnsSupport: true,
      EnableDnsHostnames: true,
    });
    const gateway = resource("InternetGateway", "AWS::EC2::InternetGateway", {});
    const attached = resource("GatewayAttachment", "AWS::EC2::VPCGatewayAttachment", {
      VpcId: vpc.ref,
      InternetGatewayId: gateway.ref,
    });
    const subnets = subnetCidrs.map((p, i) =>
      resource(`Subnet${i}`, "AWS::EC2::Subnet", {
        VpcId: vpc.ref,
        CidrBlock: p.valueAsString,
        AvailabilityZone: Fn.select(i % 2, Fn.getAzs("ap-south-1")),
        MapPublicIpOnLaunch: false,
      }),
    );
    const publicSubnets = subnets.slice(0, 2), privateSubnets = subnets.slice(2);
    const tables = subnets.map((s, i) => {
      const table = resource(`RouteTable${i}`, "AWS::EC2::RouteTable", { VpcId: vpc.ref });
      resource(`SubnetRouteTable${i}`, "AWS::EC2::SubnetRouteTableAssociation", { SubnetId: s.ref, RouteTableId: table.ref });
      return table;
    });
    // Only the public tables get a default route. The database subnets have none.
    const publicRoutes = tables.slice(0, 2).map((table, i) => {
      const route = resource(`InternetRoute${i}`, "AWS::EC2::Route", {
        RouteTableId: table.ref,
        DestinationCidrBlock: "0.0.0.0/0",
        GatewayId: gateway.ref,
      });
      route.addResourceDependency(attached);
      return route;
    });

    // ---- security groups: VPC link -> task -> database, nothing else inbound
    const linkSg = resource("VpcLinkSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "API Gateway VPC link (no inbound)",
    });
    const taskSg = resource("TaskSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "VPC link to API only",
      SecurityGroupIngress: [
        { IpProtocol: "tcp", FromPort: port.valueAsNumber, ToPort: port.valueAsNumber, SourceSecurityGroupId: linkSg.ref },
      ],
    });
    const dbSg = resource("DatabaseSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "API and ops tasks to Postgres only",
      SecurityGroupIngress: [{ IpProtocol: "tcp", FromPort: 5432, ToPort: 5432, SourceSecurityGroupId: taskSg.ref }],
    });

    // ---- database (single-AZ db.t4g.micro, encrypted, retained)
    const { key, bucket, secret, authConfig } = core;
    const objects = Fn.join("", [arn(bucket), "/*"]);
    const dbSubnets = resource("DatabaseSubnets", "AWS::RDS::DBSubnetGroup", {
      DBSubnetGroupDescription: "Private database subnets (no internet route)",
      SubnetIds: privateSubnets.map((s) => s.ref),
    });
    const secretField = (field: string) =>
      Fn.join("", ["{{resolve:secretsmanager:", secret.ref, ":SecretString:", field, "}}"]);
    const db = resource("Database", "AWS::RDS::DBInstance", {
      DBInstanceIdentifier: `${prefix}-database`,
      DBName: "legalitt",
      Engine: "postgres",
      EngineVersion: dbVersion.valueAsString,
      DBInstanceClass: dbClass.valueAsString,
      AllocatedStorage: dbStorage.valueAsString,
      StorageType: "gp3",
      StorageEncrypted: true,
      KmsKeyId: arn(key),
      MultiAZ: false,
      PubliclyAccessible: false,
      DeletionProtection: dbProtection.valueAsString,
      BackupRetentionPeriod: 1,
      CACertificateIdentifier: "rds-ca-rsa2048-g1",
      MasterUsername: secretField("username"),
      MasterUserPassword: secretField("password"),
      DBSubnetGroupName: dbSubnets.ref,
      VPCSecurityGroups: [dbSg.ref],
      Port: "5432",
    });
    // Retained on update and delete; a rolled-back first create removes it, so a
    // failed attempt never strands fixed-name resources that block the next one.
    db.applyRemovalPolicy(RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);
    const secretAttachment = resource("SecretAttachment", "AWS::SecretsManager::SecretTargetAttachment", {
      SecretId: secret.ref,
      TargetId: db.ref,
      TargetType: "AWS::RDS::DBInstance",
    });

    // ---- image, logs
    const logs = resource("ApiLogs", "AWS::Logs::LogGroup", {
      LogGroupName: `/${prefix}/api`,
      RetentionInDays: 14,
    });
    logs.applyRemovalPolicy(RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);
    const repository = resource("ApiRepository", "AWS::ECR::Repository", {
      RepositoryName: `${prefix}-api`,
      ImageScanningConfiguration: { ScanOnPush: true },
      ImageTagMutability: "IMMUTABLE",
      LifecyclePolicy: {
        LifecyclePolicyText: JSON.stringify({
          rules: [{ rulePriority: 1, description: "Keep the last 10 images", selection: { tagStatus: "any", countType: "imageCountMoreThan", countNumber: 10 }, action: { type: "expire" } }],
        }),
      },
    });
    repository.applyRemovalPolicy(RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);

    // ---- IAM: runtime, execution and one-off ops roles under one boundary
    const allow = (actions: string[], resources: unknown[]) => ({ Effect: "Allow", Action: actions, Resource: resources });
    const secretArns = [secret.ref, authConfig.ref, ...(core.demoCredentials ? [core.demoCredentials.ref] : [])];
    const runtimeStatements = [
      allow(["s3:ListBucket", "s3:ListBucketVersions"], [arn(bucket)]),
      allow(["s3:GetObject", "s3:GetObjectVersion", "s3:PutObject", "s3:DeleteObject", "s3:DeleteObjectVersion"], [objects]),
      allow(["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey", "kms:DescribeKey"], [arn(key)]),
      allow(["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"], secretArns),
    ];
    const userPoolArn = Fn.sub("arn:${AWS::Partition}:cognito-idp:ap-south-1:${AWS::AccountId}:userpool/${Pool}", {
      Pool: userPoolId.valueAsString,
    });
    // The demo seed (prisma/seed-demo.ts) provisions the fixed demo accounts.
    const opsStatements = [
      ...runtimeStatements,
      allow(
        ["cognito-idp:DescribeUserPool", "cognito-idp:AdminCreateUser", "cognito-idp:AdminGetUser", "cognito-idp:AdminSetUserPassword"],
        [userPoolArn],
      ),
    ];
    const executionStatements = [
      allow(["ecr:GetAuthorizationToken"], ["*"]),
      allow(["ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage"], [arn(repository)]),
      allow(["logs:CreateLogStream", "logs:PutLogEvents"], [arn(logs)]),
    ];
    const boundary = resource("RoleBoundary", "AWS::IAM::ManagedPolicy", {
      ManagedPolicyName: `${prefix}-boundary`,
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          ...opsStatements,
          ...executionStatements,
          { Effect: "Deny", Action: "*", Resource: "*", Condition: { StringEquals: { "aws:ResourceTag/environment": "prod" } } },
          {
            Effect: "Deny",
            Action: "*",
            Resource: [
              Fn.sub("arn:${AWS::Partition}:s3:::legalitt-prod-*"),
              ...["ec2", "rds", "ecs", "logs", "kms", "secretsmanager", "iam", "ecr", "cognito-idp"].map((service) =>
                Fn.sub(`arn:\${AWS::Partition}:${service}:*:*:*legalitt-prod*`),
              ),
            ],
          },
        ],
      },
    });
    const role = (id: string, statements: unknown[]) =>
      resource(id, "AWS::IAM::Role", {
        RoleName: `${prefix}-${id.toLowerCase()}`,
        PermissionsBoundary: boundary.ref,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [{ Effect: "Allow", Principal: { Service: "ecs-tasks.amazonaws.com" }, Action: "sts:AssumeRole" }],
        },
        Policies: [{ PolicyName: `${prefix}-${id.toLowerCase()}`, PolicyDocument: { Version: "2012-10-17", Statement: statements } }],
      });
    const taskRole = role("ApiRole", runtimeStatements);
    const opsRole = role("OpsRole", opsStatements);
    const executionRole = role("ExecutionRole", executionStatements);

    // ---- ECS: one ARM64 task, and an ops task family for migrate and seed
    const cluster = resource("Cluster", "AWS::ECS::Cluster", { ClusterName: `${prefix}-cluster` });
    const image = Fn.join(":", [arn(repository, "RepositoryUri"), imageTag.valueAsString]);
    const logging = (streamPrefix: string) => ({
      LogDriver: "awslogs",
      Options: { "awslogs-group": logs.ref, "awslogs-region": "ap-south-1", "awslogs-stream-prefix": streamPrefix },
    });
    const sharedEnvironment = [
      { Name: "ENVIRONMENT", Value: ENVIRONMENT },
      { Name: "NODE_ENV", Value: "development" },
      { Name: "AWS_REGION", Value: "ap-south-1" },
      { Name: "AUTH_CONFIG_SECRET_ARN", Value: authConfig.ref },
      ...(core.demoCredentials ? [{ Name: "DEMO_AUTH_SECRET_ARN", Value: core.demoCredentials.ref }] : []),
      { Name: "DATABASE_SECRET_ARN", Value: secret.ref },
      { Name: "DATABASE_NAME", Value: "legalitt" },
      { Name: "DOCUMENT_BUCKET", Value: bucket.ref },
    ];
    const runtimePlatform = { CpuArchitecture: "ARM64", OperatingSystemFamily: "LINUX" };
    const task = resource("Task", "AWS::ECS::TaskDefinition", {
      Family: `${prefix}-api`,
      RequiresCompatibilities: ["FARGATE"],
      NetworkMode: "awsvpc",
      RuntimePlatform: runtimePlatform,
      Cpu: cpu.valueAsString,
      Memory: memory.valueAsString,
      TaskRoleArn: arn(taskRole),
      ExecutionRoleArn: arn(executionRole),
      ContainerDefinitions: [
        {
          Name: "api",
          Image: image,
          Essential: true,
          PortMappings: [{ ContainerPort: port.valueAsNumber, Protocol: "tcp" }],
          Environment: [
            ...sharedEnvironment,
            { Name: "PORT", Value: port.valueAsString },
            { Name: "PHONE_AUTH_MODE", Value: "demo" },
            { Name: "CORS_ORIGINS", Value: corsOrigins.valueAsString },
            // §2.12: the demo progression, with the same intervals as local development.
            { Name: "DEMO_PROGRESSION", Value: "on" },
            { Name: "DEMO_ASSIGN_DELAY_MS", Value: "30000" },
            { Name: "DEMO_DRAFT_START_DELAY_MS", Value: "30000" },
            { Name: "DEMO_DRAFT_DONE_DELAY_MS", Value: "30000" },
            { Name: "DEMO_DISPATCH_DELAY_MS", Value: "30000" },
            { Name: "DEMO_SHIPMENT_STEP_MS", Value: "5000" },
          ],
          HealthCheck: {
            Command: [
              "CMD-SHELL",
              "node -e \"fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))\"",
            ],
            Interval: 30,
            Timeout: 5,
            Retries: 3,
            StartPeriod: 30,
          },
          LogConfiguration: logging("api"),
        },
      ],
    });
    const opsTask = resource("OpsTask", "AWS::ECS::TaskDefinition", {
      Family: `${prefix}-ops`,
      RequiresCompatibilities: ["FARGATE"],
      NetworkMode: "awsvpc",
      RuntimePlatform: runtimePlatform,
      Cpu: "256",
      Memory: "1024",
      TaskRoleArn: arn(opsRole),
      ExecutionRoleArn: arn(executionRole),
      ContainerDefinitions: [
        {
          Name: "ops",
          Image: image,
          Essential: true,
          // Run with a command override: migrate, seed or seed-demo. The default only reports.
          Command: ["node", "-e", "console.log('Legalitt ops task: pass a command override')"],
          Environment: sharedEnvironment,
          LogConfiguration: logging("ops"),
        },
      ],
    });

    // ---- service discovery: the VPC link finds the task through Cloud Map SRV
    const namespace = resource("Namespace", "AWS::ServiceDiscovery::PrivateDnsNamespace", {
      Name: `${prefix}.internal`,
      Vpc: vpc.ref,
      Description: "Development API discovery for the HTTP API VPC link",
    });
    const discovery = resource("ApiDiscovery", "AWS::ServiceDiscovery::Service", {
      Name: "api",
      NamespaceId: arn(namespace, "Id"),
      DnsConfig: { DnsRecords: [{ Type: "SRV", TTL: 10 }], RoutingPolicy: "MULTIVALUE" },
      HealthCheckCustomConfig: { FailureThreshold: 1 },
    });
    const service = resource("ApiService", "AWS::ECS::Service", {
      ServiceName: `${prefix}-api`,
      Cluster: cluster.ref,
      LaunchType: "FARGATE",
      TaskDefinition: task.ref,
      DesiredCount: count.valueAsNumber,
      EnableECSManagedTags: true,
      PropagateTags: "SERVICE",
      // A crash-looping task fails the update in minutes instead of hanging it.
      DeploymentConfiguration: {
        MinimumHealthyPercent: 0,
        MaximumPercent: 200,
        DeploymentCircuitBreaker: { Enable: true, Rollback: true },
      },
      NetworkConfiguration: {
        AwsvpcConfiguration: {
          AssignPublicIp: "ENABLED",
          Subnets: publicSubnets.map((s) => s.ref),
          SecurityGroups: [taskSg.ref],
        },
      },
      ServiceRegistries: [{ RegistryArn: arn(discovery), ContainerName: "api", ContainerPort: port.valueAsNumber }],
    });
    service.addResourceDependency(secretAttachment);
    publicRoutes.forEach((route) => service.addResourceDependency(route));

    // ---- HTTPS front door: the default execute-api domain, no certificate needed
    const api = resource("HttpApi", "AWS::ApiGatewayV2::Api", {
      Name: `${prefix}-api`,
      ProtocolType: "HTTP",
      Description: "Legalitt API, development only",
    });
    const link = resource("VpcLink", "AWS::ApiGatewayV2::VpcLink", {
      Name: `${prefix}-api`,
      SubnetIds: publicSubnets.map((s) => s.ref),
      SecurityGroupIds: [linkSg.ref],
    });
    const integration = resource("ApiIntegration", "AWS::ApiGatewayV2::Integration", {
      ApiId: api.ref,
      IntegrationType: "HTTP_PROXY",
      IntegrationMethod: "ANY",
      ConnectionType: "VPC_LINK",
      ConnectionId: link.ref,
      IntegrationUri: arn(discovery),
      PayloadFormatVersion: "1.0",
      TimeoutInMillis: 30000,
    });
    resource("DefaultRoute", "AWS::ApiGatewayV2::Route", {
      ApiId: api.ref,
      RouteKey: "$default",
      Target: Fn.join("", ["integrations/", integration.ref]),
    });
    resource("DefaultStage", "AWS::ApiGatewayV2::Stage", {
      ApiId: api.ref,
      StageName: "$default",
      AutoDeploy: true,
      // Caps the variable request charge on a public development endpoint.
      DefaultRouteSettings: { ThrottlingBurstLimit: 20, ThrottlingRateLimit: 10 },
    });

    new CfnOutput(this, "ApiUrl", { value: arn(api, "ApiEndpoint"), description: "HTTPS base URL (development only)" });
    new CfnOutput(this, "RepositoryUri", { value: arn(repository, "RepositoryUri") });
    new CfnOutput(this, "ClusterName", { value: cluster.ref });
    new CfnOutput(this, "OpsTaskDefinitionArn", { value: opsTask.ref });
    new CfnOutput(this, "TaskSubnetIds", { value: Fn.join(",", publicSubnets.map((s) => s.ref)) });
    new CfnOutput(this, "TaskSecurityGroupId", { value: taskSg.ref });
    new CfnOutput(this, "DatabaseSecretArn", { value: secret.ref });
  }
}
