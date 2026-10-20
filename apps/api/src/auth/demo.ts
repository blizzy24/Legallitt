import { ServiceUnavailableException } from "@nestjs/common";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { z } from "zod";

// Architecture v3.2 §2.9: these are fixed accounts, never derived from a phone.
export const demoAccounts = {
  client: { email: "demo-client@legalitt.invalid", name: "Demo client" },
  advocate: { email: "demo-advocate@legalitt.invalid", name: "Demo advocate" },
} as const;
export function requireDemoMode() {
  if (
    process.env.ENVIRONMENT !== "dev" ||
    process.env.NODE_ENV === "production" ||
    process.env.PHONE_AUTH_MODE !== "demo"
  ) {
    throw new ServiceUnavailableException("Phone sign-in is not configured");
  }
}
export async function demoPassword(): Promise<string> {
  requireDemoMode();
  if (!process.env.DEMO_AUTH_SECRET_ARN)
    throw new ServiceUnavailableException("Demo sign-in is not configured");
  const secrets = new SecretsManagerClient({ region: "ap-south-1" });
  try {
    const result = await secrets.send(
      new GetSecretValueCommand({
        SecretId: process.env.DEMO_AUTH_SECRET_ARN,
      }),
    );
    return z
      .object({ password: z.string().min(8) })
      .parse(JSON.parse(result.SecretString ?? "{}")).password;
  } finally {
    secrets.destroy();
  }
}
