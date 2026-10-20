import {
  Stack,
  CfnResource,
  CfnOutput,
  Fn,
  RemovalPolicy,
  type StackProps,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
export class CoreStack extends Stack {
  readonly key: CfnResource;
  readonly bucket: CfnResource;
  readonly secret: CfnResource;
  readonly authConfig: CfnResource;
  readonly userPool: CfnResource;
  readonly demoCredentials?: CfnResource;
  constructor(
    scope: Construct,
    id: string,
    environment: "dev" | "prod",
    props: StackProps = {},
  ) {
    super(scope, id, props);
    const prefix = `legalitt-${environment}`;
    const resource = (
      id: string,
      type: string,
      properties: Record<string, unknown>,
    ) => {
      const tagged = [
        "AWS::KMS::Key",
        "AWS::S3::Bucket",
        "AWS::SecretsManager::Secret",
        "AWS::IAM::Role",
        "AWS::Lambda::Function",
        "AWS::Logs::LogGroup",
      ].includes(type);
      const r = new CfnResource(this, id, {
        type,
        properties: tagged
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
    const key = resource("EncryptionKey", "AWS::KMS::Key", {
      EnableKeyRotation: true,
      KeyPolicy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: Fn.sub("arn:${AWS::Partition}:iam::${AWS::AccountId}:root"),
            },
            Action: "kms:*",
            Resource: "*",
          },
        ],
      },
    });
    key.applyRemovalPolicy(RemovalPolicy.RETAIN);
    resource("KeyAlias", "AWS::KMS::Alias", {
      AliasName: `alias/${prefix}`,
      TargetKeyId: key.ref,
    });
    const bucket = resource("Documents", "AWS::S3::Bucket", {
      BucketName: Fn.sub(
        `${prefix}-documents-\${AWS::AccountId}-\${AWS::Region}`,
      ),
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: "aws:kms",
              KMSMasterKeyID: arn(key),
            },
            BucketKeyEnabled: true,
          },
        ],
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      OwnershipControls: {
        Rules: [{ ObjectOwnership: "BucketOwnerEnforced" }],
      },
      VersioningConfiguration: { Status: "Enabled" },
      ...(environment === "dev"
        ? {
            CorsConfiguration: {
              CorsRules: [
                {
                  AllowedOrigins: ["http://localhost:8081"],
                  AllowedMethods: ["POST", "GET", "HEAD"],
                  AllowedHeaders: ["Content-Type"],
                  ExposedHeaders: ["ETag"],
                  MaxAge: 300,
                },
              ],
            },
          }
        : {}),
    });
    bucket.applyRemovalPolicy(RemovalPolicy.RETAIN);
    const objects = Fn.join("", [arn(bucket), "/*"]);
    resource("DocumentsPolicy", "AWS::S3::BucketPolicy", {
      Bucket: bucket.ref,
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Deny",
            Principal: "*",
            Action: "s3:*",
            Resource: [arn(bucket), objects],
            Condition: { Bool: { "aws:SecureTransport": "false" } },
          },
        ],
      },
    });
    const secret = resource("DatabaseSecret", "AWS::SecretsManager::Secret", {
      Name: `${prefix}/database`,
      KmsKeyId: arn(key),
      GenerateSecretString: {
        SecretStringTemplate: JSON.stringify({ username: "legalitt" }),
        GenerateStringKey: "password",
        PasswordLength: 32,
        ExcludeCharacters: '"@/\\',
      },
    });
    secret.applyRemovalPolicy(RemovalPolicy.RETAIN);

    this.key = key;
    this.bucket = bucket;
    this.secret = secret;
    const logArn = Fn.sub(
      `arn:\${AWS::Partition}:logs:\${AWS::Region}:\${AWS::AccountId}:log-group:/aws/lambda/${prefix}-auth-*:log-stream:*`,
    );
    const statements = [
      {
        Effect: "Allow",
        Action: ["logs:CreateLogStream", "logs:PutLogEvents"],
        Resource: logArn,
      },
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
          ]
        : []),
    ];
    const boundary = resource("AuthBoundary", "AWS::IAM::ManagedPolicy", {
      PolicyDocument: { Version: "2012-10-17", Statement: statements },
    });
    const role = resource("AuthRole", "AWS::IAM::Role", {
      PermissionsBoundary: boundary.ref,
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { Service: "lambda.amazonaws.com" },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Policies: [
        {
          PolicyName: "auth-logs",
          PolicyDocument: { Version: "2012-10-17", Statement: statements },
        },
      ],
    });
    const code = readFileSync(join(__dirname, "../lambda/auth.cjs"), "utf8");
    const triggers: Record<string, CfnResource> = {};
    for (const name of ["preSignup"]) {
      const logs = resource(`${name}Logs`, "AWS::Logs::LogGroup", {
        LogGroupName: `/aws/lambda/${prefix}-auth-${name}`,
      });
      logs.applyRemovalPolicy(RemovalPolicy.RETAIN);
      const fn = resource(`${name}Trigger`, "AWS::Lambda::Function", {
        FunctionName: `${prefix}-auth-${name}`,
        Runtime: "nodejs22.x",
        Handler: `index.${name}`,
        Role: arn(role),
        Code: { ZipFile: code },
        Environment: {
          Variables: { ENVIRONMENT: environment },
        },
      });
      fn.addResourceDependency(logs);
      triggers[name] = fn;
    }
    const pool = resource("UserPool", "AWS::Cognito::UserPool", {
      UserPoolName: `${prefix}-users`,
      // The deployed dev pool has immutable username attributes from v3.0.
      // Retain it without replacement; no phone lookup or custom auth remains.
      UsernameAttributes:
        environment === "dev" ? ["email", "phone_number"] : ["email"],
      UsernameConfiguration: { CaseSensitive: false },
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
      UserPoolTags: { environment, application: "legalitt" },
      LambdaConfig: {
        PreSignUp: arn(triggers.preSignup),
      },
    });
    pool.applyRemovalPolicy(RemovalPolicy.RETAIN);
    for (const [name, fn] of Object.entries(triggers)) {
      resource(`${name}Invoke`, "AWS::Lambda::Permission", {
        FunctionName: arn(fn),
        Action: "lambda:InvokeFunction",
        Principal: "cognito-idp.amazonaws.com",
        SourceArn: arn(pool),
        SourceAccount: this.account,
      });
    }
    const client = resource("UserPoolClient", "AWS::Cognito::UserPoolClient", {
      UserPoolId: pool.ref,
      ClientName: `${prefix}-app`,
      GenerateSecret: false,
      ExplicitAuthFlows: [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
      PreventUserExistenceErrors: "ENABLED",
      EnableTokenRevocation: true,
      ReadAttributes: [
        "email",
        "email_verified",
        "phone_number",
        "phone_number_verified",
        "name",
        "custom:role",
      ],
      WriteAttributes: ["email", "phone_number", "name", "custom:role"],
    });
    const config = resource("AppConfiguration", "AWS::SecretsManager::Secret", {
      Name: `${prefix}/app-config`,
      KmsKeyId: arn(key),
      SecretString: Fn.toJsonString({
        userPoolId: pool.ref,
        clientId: client.ref,
        bucketName: bucket.ref,
        region: "ap-south-1",
      }),
    });
    config.applyRemovalPolicy(RemovalPolicy.RETAIN);
    if (environment === "dev") {
      this.demoCredentials = resource(
        "DemoCredentials",
        "AWS::SecretsManager::Secret",
        {
          Name: `${prefix}/demo-auth`,
          KmsKeyId: arn(key),
          GenerateSecretString: {
            SecretStringTemplate: "{}",
            GenerateStringKey: "password",
            PasswordLength: 32,
            ExcludeCharacters: '"@/\\',
            RequireEachIncludedType: true,
          },
        },
      );
      this.demoCredentials.applyRemovalPolicy(RemovalPolicy.RETAIN);
      new CfnOutput(this, "DemoCredentialsSecretArn", {
        value: this.demoCredentials.ref,
      });
    }
    this.authConfig = config;
    this.userPool = pool;
    new CfnOutput(this, "UserPoolId", { value: pool.ref });
    new CfnOutput(this, "ClientId", { value: client.ref });
    new CfnOutput(this, "BucketName", { value: bucket.ref });
    new CfnOutput(this, "ConfigurationSecretArn", { value: config.ref });
  }
}
