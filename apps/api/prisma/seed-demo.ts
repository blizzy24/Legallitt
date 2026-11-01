import { seedDevelopmentNotice } from '../src/cases/case-state-machine';
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
  // Design 433's About and Professional Details. Its "Rahul Sharma" is a
  // placeholder name (question 9, closed), so the bio names this advocate.
  bio: "Adv. Arjun Sharma is an experienced legal professional with expertise in civil, criminal, and property matters. He focuses on providing clear legal guidance and professional representation tailored to each client's needs.",
  education: "LL.B., LL.M.",
  courts: ["District Court", "High Court"],
  languages: ["Hindi", "English"],
};

// Synthetic development accounts authorised for testing the multi-row picker.
// No portraits, ratings, credentials or personal contact numbers are invented.
const extraAdvocates = [
  {role: 'advocate', email: 'demo-advocate-2@legalitt.invalid', name: 'Demo Advocate Asha', practice_areas: ['Consumer Law'], city: 'Mumbai', load: 0},
  {role: 'advocate', email: 'demo-advocate-3@legalitt.invalid', name: 'Demo Advocate Kabir', practice_areas: ['Family Law', 'Civil Law'], city: 'Jaipur', load: 1},
  {role: 'advocate', email: 'demo-advocate-4@legalitt.invalid', name: 'Demo Advocate Meera', practice_areas: ['Property Law', 'Tenancy'], city: 'Pune', load: 3},
];
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
    const accounts = [...Object.entries({...demoAccounts, admin: {email: "demo-admin@legalitt.invalid", name: "Demo admin"}}).map(([role, account]) => ({role, ...account})), ...extraAdvocates];
    for (const account of accounts) {
      const {role} = account;
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
      if (role === "advocate" && account.email === demoAccounts.advocate.email)
        await db.advocateProfile.upsert({
          where: { user_id: row.id },
          create: { user_id: row.id, ...demoAdvocateProfile },
          update: demoAdvocateProfile,
        });
      const extra = extraAdvocates.find(a => a.email === account.email);
      if (extra) {
        const profile = {verification: 'approved' as const, practice_areas: extra.practice_areas, city: extra.city};
        await db.advocateProfile.upsert({where: {user_id: row.id}, create: {user_id: row.id, ...profile}, update: profile});
      }
    }
    const client = await db.user.findUniqueOrThrow({where: {email: demoAccounts.client.email}});
    const pricing = await db.servicePricing.findFirstOrThrow({where: {service_code: 'legal_notice', tier: 'ordinary', effective_to: null}, orderBy: {effective_from: 'desc'}});
    const samples: {key: string; advocate_id?: string; status: 'in_progress' | 'assigning'; sparse?: boolean}[] = [];
    for (const extra of extraAdvocates) {
      const advocate = await db.user.findUniqueOrThrow({where: {email: extra.email}});
      for (let i = 0; i < extra.load; i++) samples.push({key: extra.email + ':' + i, advocate_id: advocate.id, status: 'in_progress'});
    }
    samples.push({key: 'waiting', status: 'assigning'}, {key: 'sparse', status: 'assigning', sparse: true});
    for (const sample of samples) {
      await seedDevelopmentNotice(db, {seedKey: sample.key, clientId: client.id, advocateId: sample.advocate_id,
        status: sample.status, sparse: sample.sparse, pricingId: pricing.id});
    }
    console.log("Seeded six dev accounts and idempotent demo workload cases; no mail or SMS sent.");
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
