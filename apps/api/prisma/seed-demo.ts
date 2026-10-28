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

// Design 437's advocate card, value for value. bar_council_state is not drawn
// anywhere, so it is not invented.
const demoAdvocateProfile = {
  years_experience: 8,
  practice_areas: ["Property Law"],
  bar_council_number: "D/1842/2016",
  enrolment_year: 2016,
  rating_avg: "4.9",
  rating_count: 142,
  verification: "approved" as const,
  verified_at: new Date("2026-05-01T00:00:00Z"),
  city: "Indore",
  state: "Madhya Pradesh",
  photo_key: "advocate-05",
};

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
      const row = await db.user.upsert({
        where: { cognito_sub: attributes.sub },
        create: {
          cognito_sub: attributes.sub,
          full_name: account.name,
          email: account.email,
          email_verified: true,
          role: role as "client" | "advocate" | "admin",
        },
        update: { full_name: account.name },
      });
      // Dev seed data only, behind the same guards as the accounts (§9.1): the
      // facts design 437 draws for its advocate. A seeded 4.9 from 142 reviews
      // must never reach a production stage.
      if (role === "advocate")
        await db.advocateProfile.upsert({
          where: { user_id: row.id },
          create: { user_id: row.id, ...demoAdvocateProfile },
          update: demoAdvocateProfile,
        });
    }
    console.log("Seeded three verified demo accounts and the advocate's profile; no mail or SMS sent.");
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
