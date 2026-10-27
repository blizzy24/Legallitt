import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { z } from "zod";
import { demoAccounts, demoPassword, requireDemoMode } from "../src/auth/demo";
import { createDatabaseClient } from "../src/database";

// Explicit operator command, never run by a request handler or in production.
async function main() {
  requireDemoMode();
  if (!process.env.AUTH_CONFIG_SECRET_ARN)
    throw new Error("Auth configuration required");
  const secrets = new SecretsManagerClient({ region: "ap-south-1" });
  const cognito = new CognitoIdentityProviderClient({ region: "ap-south-1" });
  const db = await createDatabaseClient();
  try {
    const config = await secrets.send(
      new GetSecretValueCommand({
        SecretId: process.env.AUTH_CONFIG_SECRET_ARN,
      }),
    );
    const { userPoolId } = z
      .object({ userPoolId: z.string().startsWith("ap-south-1_") })
      .parse(JSON.parse(config.SecretString ?? "{}"));
    const pool = await cognito.send(
      new DescribeUserPoolCommand({ UserPoolId: userPoolId }),
    );
    if (pool.UserPool?.UserPoolTags?.environment !== "dev")
      throw new Error("Demo accounts require a dev-tagged pool");
    const password = await demoPassword();
    for (const [role, account] of Object.entries({ ...demoAccounts, admin: { email: "demo-admin@legalitt.invalid", name: "Demo admin" } })) {
      const target = { UserPoolId: userPoolId, Username: account.email };
      try {
        await cognito.send(
          new AdminCreateUserCommand({
            ...target,
            MessageAction: "SUPPRESS",
            UserAttributes: [
              { Name: "email", Value: account.email },
              { Name: "email_verified", Value: "true" },
              { Name: "name", Value: account.name },
              { Name: "custom:role", Value: role },
            ],
          }),
        );
      } catch (error) {
        if ((error as { name?: string }).name !== "UsernameExistsException")
          throw error;
      }
      const user = await cognito.send(new AdminGetUserCommand(target));
      const attributes = Object.fromEntries(
        (user.UserAttributes ?? []).map((a) => [a.Name, a.Value]),
      );
      if (
        attributes["custom:role"] !== role ||
        attributes.email !== account.email ||
        attributes.email_verified !== "true" ||
        attributes.phone_number ||
        !attributes.sub
      ) {
        throw new Error(
          "Existing demo account does not match the specification",
        );
      }
      await cognito.send(
        new AdminSetUserPasswordCommand({
          ...target,
          Password: password,
          Permanent: true,
        }),
      );
      await db.user.upsert({
        where: { cognito_sub: attributes.sub },
        create: {
          cognito_sub: attributes.sub,
          full_name: account.name,
          email: account.email,
          email_verified: true,
          role: role as "client" | "advocate" | "admin",
        },
        update: {},
      });
    }
    console.log("Seeded three verified demo accounts; no mail or SMS sent.");
  } finally {
    secrets.destroy();
    cognito.destroy();
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error("Demo seed failed; check dev configuration and permissions.");
  process.exitCode = 1;
});
