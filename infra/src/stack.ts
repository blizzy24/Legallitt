import {
  Stack,
  Stage,
  App,
  CfnResource,
  CfnParameter,
  CfnCondition,
  CfnOutput,
  Fn,
  RemovalPolicy,
  type StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { CoreStack } from "./core";

type Environment = "dev" | "prod";
// CloudFormation has no resource-level tag API for routes, associations, policies,
// listeners or aliases. Those receive environment metadata; their parents are tagged.
const TAGGABLE = new Set([
  "AWS::EC2::VPC",
  "AWS::EC2::Subnet",
  "AWS::EC2::InternetGateway",
  "AWS::EC2::RouteTable",
  "AWS::EC2::EIP",
  "AWS::EC2::NatGateway",
  "AWS::EC2::SecurityGroup",
  "AWS::RDS::DBSubnetGroup",
  "AWS::RDS::DBInstance",
  "AWS::KMS::Key",
  "AWS::S3::Bucket",
  "AWS::SecretsManager::Secret",
  "AWS::SQS::Queue",
  "AWS::IAM::Role",
  "AWS::Logs::LogGroup",
  "AWS::ECR::Repository",
  "AWS::ECS::Cluster",
  "AWS::ECS::TaskDefinition",
  "AWS::ECS::Service",
  "AWS::ElasticLoadBalancingV2::LoadBalancer",
  "AWS::ElasticLoadBalancingV2::TargetGroup",
]);

export class ComputeStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    environment: Environment,
    core: CoreStack,
    props: StackProps = {},
  ) {
    super(scope, id, props);
    const prefix = `legalitt-${environment}`;
    const parameter = (
      id: string,
      description: string,
      extra: Record<string, unknown> = {},
    ) => new CfnParameter(this, id, { type: "String", description, ...extra });
    // Unspecified deployment choices deliberately have no defaults.
    const cidr = parameter(
      "VpcCidr",
      "Approved VPC CIDR; dev and prod must not overlap.",
    );
    const subnetCidrs = [
      "PublicSubnet1Cidr",
      "PublicSubnet2Cidr",
      "PrivateSubnet1Cidr",
      "PrivateSubnet2Cidr",
    ].map((id) => parameter(id, "Approved subnet CIDR within this stage VPC."));
    const natMode = parameter(
      "NatMode",
      "Choose shared NAT or one NAT per AZ.",
      { allowedValues: ["single", "per_az"] },
    );
    const dbClass = parameter(
      "DatabaseInstanceClass",
      "Approved RDS instance class.",
      { allowedPattern: "db\\..+" },
    );
    const dbStorage = parameter(
      "DatabaseStorageGiB",
      "Approved initial RDS storage.",
      { type: "Number", minValue: 20 },
    );
    const dbVersion = parameter(
      "Postgres16Version",
      "Available Postgres 16 minor release in ap-south-1.",
      { allowedPattern: "16\\.[0-9]+" },
    );
    const cpu = parameter("TaskCpu", "Approved Fargate CPU units.", {
      allowedValues: ["256", "512", "1024", "2048", "4096", "8192", "16384"],
    });
    const memory = parameter(
      "TaskMemoryMiB",
      "Approved Fargate memory, valid for the chosen CPU.",
      { allowedPattern: "[0-9]+" },
    );
    const count = parameter("TaskCount", "Approved desired task count.", {
      type: "Number",
      minValue: 1,
    });
    const port = parameter(
      "ApiPort",
      "Container port; also passed to the API as PORT.",
      { type: "Number", minValue: 1, maxValue: 65535 },
    );
    const imageTag = parameter(
      "ApiImageTag",
      "Tag of the API image to publish to this stage ECR repository.",
    );
    const certificate = parameter(
      "CertificateArn",
      "ACM certificate ARN for the HTTPS ALB listener in ap-south-1.",
    );
    const perAz = new CfnCondition(this, "NatPerAz", {
      expression: Fn.conditionEquals(natMode.valueAsString, "per_az"),
    });
    const resource = (
      id: string,
      type: string,
      properties: Record<string, unknown>,
    ) => {
      const r = new CfnResource(this, id, {
        type,
        properties: TAGGABLE.has(type)
          ? {
              ...properties,
              Tags: [
                { Key: "environment", Value: environment },
                { Key: "application", Value: "legalitt" },
              ],
            }
          : properties,
      });
      r.addMetadata("environment", environment);
      return r;
    };
    const arn = (r: CfnResource, attr = "Arn") => r.getAtt(attr).toString();
    const vpc = resource("Vpc", "AWS::EC2::VPC", {
      CidrBlock: cidr.valueAsString,
      EnableDnsSupport: true,
      EnableDnsHostnames: true,
    });
    const gateway = resource(
      "InternetGateway",
      "AWS::EC2::InternetGateway",
      {},
    );
    const attached = resource(
      "GatewayAttachment",
      "AWS::EC2::VPCGatewayAttachment",
      { VpcId: vpc.ref, InternetGatewayId: gateway.ref },
    );
    const subnets = subnetCidrs.map((p, i) =>
      resource(`Subnet${i}`, "AWS::EC2::Subnet", {
        VpcId: vpc.ref,
        CidrBlock: p.valueAsString,
        AvailabilityZone: Fn.select(i % 2, Fn.getAzs("ap-south-1")),
        MapPublicIpOnLaunch: i < 2,
      }),
    );
    const tables = subnets.map((s, i) => {
      const table = resource(`RouteTable${i}`, "AWS::EC2::RouteTable", {
        VpcId: vpc.ref,
      });
      resource(
        `SubnetRouteTable${i}`,
        "AWS::EC2::SubnetRouteTableAssociation",
        { SubnetId: s.ref, RouteTableId: table.ref },
      );
      return table;
    });
    const publicRoutes = tables.slice(0, 2).map((table, i) => {
      const route = resource(`InternetRoute${i}`, "AWS::EC2::Route", {
        RouteTableId: table.ref,
        DestinationCidrBlock: "0.0.0.0/0",
        GatewayId: gateway.ref,
      });
      route.addResourceDependency(attached);
      return route;
    });
    const nats = subnets.slice(0, 2).map((s, i) => {
      const eip = resource(`NatIp${i}`, "AWS::EC2::EIP", { Domain: "vpc" });
      const nat = resource(`Nat${i}`, "AWS::EC2::NatGateway", {
        SubnetId: s.ref,
        AllocationId: arn(eip, "AllocationId"),
      });
      nat.addResourceDependency(attached);
      if (i === 1) {
        eip.cfnOptions.condition = perAz;
        nat.cfnOptions.condition = perAz;
      }
      return nat;
    });
    const privateRoutes = tables.slice(2).map((table, i) =>
      resource(`PrivateRoute${i}`, "AWS::EC2::Route", {
        RouteTableId: table.ref,
        DestinationCidrBlock: "0.0.0.0/0",
        NatGatewayId:
          i === 0
            ? nats[0].ref
            : Fn.conditionIf(perAz.logicalId, nats[1].ref, nats[0].ref),
      }),
    );
    const albSg = resource("AlbSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "HTTPS ingress to Legalitt",
      SecurityGroupIngress: [
        { IpProtocol: "tcp", FromPort: 443, ToPort: 443, CidrIp: "0.0.0.0/0" },
      ],
    });
    const taskSg = resource("TaskSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "ALB to API only",
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: port.valueAsNumber,
          ToPort: port.valueAsNumber,
          SourceSecurityGroupId: albSg.ref,
        },
      ],
    });
    const dbSg = resource("DatabaseSecurityGroup", "AWS::EC2::SecurityGroup", {
      VpcId: vpc.ref,
      GroupDescription: "API to Postgres only",
      SecurityGroupIngress: [
        {
          IpProtocol: "tcp",
          FromPort: 5432,
          ToPort: 5432,
          SourceSecurityGroupId: taskSg.ref,
        },
      ],
    });
    const { key, bucket, secret, authConfig } = core;
    const objects = Fn.join("", [arn(bucket), "/*"]);
    const dbSubnets = resource("DatabaseSubnets", "AWS::RDS::DBSubnetGroup", {
      DBSubnetGroupDescription: "Private database subnets",
      SubnetIds: subnets.slice(2).map((s) => s.ref),
    });
    const secretField = (field: string) =>
      Fn.join("", [
        "{{resolve:secretsmanager:",
        secret.ref,
        ":SecretString:",
        field,
        "}}",
      ]);
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
      MultiAZ: environment === "prod",
      PubliclyAccessible: false,
      DeletionProtection: true,
      MasterUsername: secretField("username"),
      MasterUserPassword: secretField("password"),
      DBSubnetGroupName: dbSubnets.ref,
      VPCSecurityGroups: [dbSg.ref],
      Port: "5432",
    });
    db.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const secretAttachment = resource(
      "SecretAttachment",
      "AWS::SecretsManager::SecretTargetAttachment",
      {
        SecretId: secret.ref,
        TargetId: db.ref,
        TargetType: "AWS::RDS::DBInstance",
      },
    );
    const queue = resource("Jobs", "AWS::SQS::Queue", {
      QueueName: `${prefix}-jobs`,
      SqsManagedSseEnabled: true,
    });
    const logs = resource("ApiLogs", "AWS::Logs::LogGroup", {
      LogGroupName: `/${prefix}/api`,
    });
    logs.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const repository = resource("ApiRepository", "AWS::ECR::Repository", {
      RepositoryName: `${prefix}-api`,
      ImageScanningConfiguration: { ScanOnPush: true },
      ImageTagMutability: "IMMUTABLE",
    });
    repository.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const allow = (actions: string[], resources: unknown[]) => ({
      Effect: "Allow",
      Action: actions,
      Resource: resources,
    });
    const runtimeStatements = [
      allow(["s3:ListBucket", "s3:ListBucketVersions"], [arn(bucket)]),
      allow(
        [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:DeleteObjectVersion",
        ],
        [objects],
      ),
      allow(
        [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey",
        ],
        [arn(key)],
      ),
      allow(
        ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        [
          secret.ref,
          authConfig.ref,
          ...(core.demoCredentials ? [core.demoCredentials.ref] : []),
        ],
      ),
      allow(
        [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:ChangeMessageVisibility",
          "sqs:GetQueueAttributes",
        ],
        [arn(queue)],
      ),
    ];
    const executionStatements = [
      allow(["ecr:GetAuthorizationToken"], ["*"]),
      allow(
        [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
        ],
        [arn(repository)],
      ),
      allow(["logs:CreateLogStream", "logs:PutLogEvents"], [arn(logs)]),
    ];
    const boundary = resource("RoleBoundary", "AWS::IAM::ManagedPolicy", {
      ManagedPolicyName: `${prefix}-boundary`,
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          ...runtimeStatements,
          ...executionStatements,
          // Explicit denial also protects against resource-policy grants to sessions.
          ...(environment === "dev"
            ? [
                {
                  Effect: "Deny",
                  Action: "*",
                  Resource: "*",
                  Condition: {
                    StringEquals: { "aws:ResourceTag/environment": "prod" },
                  },
                },
                {
                  Effect: "Deny",
                  Action: "*",
                  Resource: [
                    Fn.sub("arn:${AWS::Partition}:s3:::legalitt-prod-*"),
                    ...[
                      "ec2",
                      "rds",
                      "ecs",
                      "elasticloadbalancing",
                      "logs",
                      "kms",
                      "secretsmanager",
                      "sqs",
                      "iam",
                      "ecr",
                    ].map((service) =>
                      Fn.sub(
                        `arn:\${AWS::Partition}:${service}:*:*:*legalitt-prod*`,
                      ),
                    ),
                  ],
                },
              ]
            : []),
        ],
      },
    });
    const role = (id: string, statements: unknown[]) =>
      resource(id, "AWS::IAM::Role", {
        RoleName: `${prefix}-${id.toLowerCase()}`,
        PermissionsBoundary: boundary.ref,
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { Service: "ecs-tasks.amazonaws.com" },
              Action: "sts:AssumeRole",
            },
          ],
        },
        Policies: [
          {
            PolicyName: `${prefix}-${id.toLowerCase()}`,
            PolicyDocument: { Version: "2012-10-17", Statement: statements },
          },
        ],
      });
    const taskRole = role("ApiRole", runtimeStatements);
    const executionRole = role("ExecutionRole", executionStatements);
    const cluster = resource("Cluster", "AWS::ECS::Cluster", {
      ClusterName: `${prefix}-cluster`,
    });
    const task = resource("Task", "AWS::ECS::TaskDefinition", {
      Family: `${prefix}-api`,
      RequiresCompatibilities: ["FARGATE"],
      NetworkMode: "awsvpc",
      Cpu: cpu.valueAsString,
      Memory: memory.valueAsString,
      TaskRoleArn: arn(taskRole),
      ExecutionRoleArn: arn(executionRole),
      ContainerDefinitions: [
        {
          Name: "api",
          Image: Fn.join(":", [
            arn(repository, "RepositoryUri"),
            imageTag.valueAsString,
          ]),
          Essential: true,
          PortMappings: [
            { ContainerPort: port.valueAsNumber, Protocol: "tcp" },
          ],
          Environment: [
            { Name: "PORT", Value: port.valueAsString },
            { Name: "ENVIRONMENT", Value: environment },
            {
              Name: "NODE_ENV",
              Value: environment === "prod" ? "production" : "development",
            },
            {
              Name: "PHONE_AUTH_MODE",
              Value: environment === "dev" ? "demo" : "live",
            },
            ...(core.demoCredentials
              ? [
                  {
                    Name: "DEMO_AUTH_SECRET_ARN",
                    Value: core.demoCredentials.ref,
                  },
                ]
              : []),
            { Name: "AUTH_CONFIG_SECRET_ARN", Value: authConfig.ref },
            { Name: "AWS_REGION", Value: "ap-south-1" },
            { Name: "DATABASE_SECRET_ARN", Value: secret.ref },
            { Name: "DOCUMENT_BUCKET", Value: bucket.ref },
            { Name: "JOB_QUEUE_URL", Value: queue.ref },
          ],
          LogConfiguration: {
            LogDriver: "awslogs",
            Options: {
              "awslogs-group": logs.ref,
              "awslogs-region": "ap-south-1",
              "awslogs-stream-prefix": "api",
            },
          },
        },
      ],
    });
    const alb = resource(
      "LoadBalancer",
      "AWS::ElasticLoadBalancingV2::LoadBalancer",
      {
        Name: `${prefix}-api`,
        Scheme: "internet-facing",
        Type: "application",
        Subnets: subnets.slice(0, 2).map((s) => s.ref),
        SecurityGroups: [albSg.ref],
      },
    );
    const target = resource(
      "ApiTarget",
      "AWS::ElasticLoadBalancingV2::TargetGroup",
      {
        VpcId: vpc.ref,
        Protocol: "HTTP",
        Port: port.valueAsNumber,
        TargetType: "ip",
        HealthCheckPath: "/health",
        Matcher: { HttpCode: "200" },
      },
    );
    const listener = resource(
      "HttpsListener",
      "AWS::ElasticLoadBalancingV2::Listener",
      {
        LoadBalancerArn: alb.ref,
        Port: 443,
        Protocol: "HTTPS",
        Certificates: [{ CertificateArn: certificate.valueAsString }],
        DefaultActions: [{ Type: "forward", TargetGroupArn: target.ref }],
      },
    );
    const service = resource("ApiService", "AWS::ECS::Service", {
      ServiceName: `${prefix}-api`,
      Cluster: cluster.ref,
      LaunchType: "FARGATE",
      TaskDefinition: task.ref,
      DesiredCount: count.valueAsNumber,
      EnableECSManagedTags: true,
      PropagateTags: "SERVICE",
      NetworkConfiguration: {
        AwsvpcConfiguration: {
          AssignPublicIp: "DISABLED",
          Subnets: subnets.slice(2).map((s) => s.ref),
          SecurityGroups: [taskSg.ref],
        },
      },
      LoadBalancers: [
        {
          ContainerName: "api",
          ContainerPort: port.valueAsNumber,
          TargetGroupArn: target.ref,
        },
      ],
    });
    service.addResourceDependency(listener);
    service.addResourceDependency(secretAttachment);
    privateRoutes.forEach((route) => service.addResourceDependency(route));
    publicRoutes.forEach((route) => alb.addResourceDependency(route));
    new CfnOutput(this, "ApiHost", { value: arn(alb, "DNSName") });
    new CfnOutput(this, "DatabaseSecretArn", { value: secret.ref });
    new CfnOutput(this, "RepositoryUri", {
      value: arn(repository, "RepositoryUri"),
    });
  }
}

export function createFoundation(app: App): void {
  // Both stages inherit the same account; no account ID is invented or looked up.
  for (const [id, environment] of [
    ["LegalittDev", "dev"],
    ["LegalittProd", "prod"],
  ] as const) {
    const stage = new Stage(app, id, {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "ap-south-1" },
    });
    const core = new CoreStack(stage, "Core", environment, {
      stackName: `${id}-Core`,
      tags: { environment, application: "legalitt" },
    });
    new ComputeStack(stage, "Compute", environment, core, {
      stackName: `${id}-Compute`,
      tags: { environment, application: "legalitt" },
    });
  }
}
