import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { PrismaClient } from "./generated/prisma/client";

const databaseSecret = z.object({
  host: z.string().min(1),
  // The RDS secret attachment writes host, port and engine; dbname comes from the
  // stack (DATABASE_NAME) when the secret does not carry it.
  port: z.coerce.number().int().min(1).max(65535),
  dbname: z.string().min(1).optional(),
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function createDatabaseClient(): Promise<PrismaClient> {
  const secretArn = process.env.DATABASE_SECRET_ARN;
  if (secretArn) {
    const secrets = new SecretsManagerClient({ region: "ap-south-1" });
    try {
      const result = await secrets.send(
        new GetSecretValueCommand({ SecretId: secretArn }),
      );
      if (!result.SecretString)
        throw new Error("Database secret must contain JSON");
      const secret = databaseSecret.parse(JSON.parse(result.SecretString));
      // Supply the RDS CA through Node's trust store before deployment.
      // Certificate verification is never disabled for the AWS database.
      return new PrismaClient({
        adapter: new PrismaPg({
          host: secret.host,
          port: secret.port,
          database: secret.dbname ?? process.env.DATABASE_NAME,
          user: secret.username,
          password: secret.password,
          ssl: { rejectUnauthorized: true },
        }),
      });
    } finally {
      secrets.destroy();
    }
  }
  // Transient process configuration for an isolated local database only.
  // No .env files or credentials are committed. ECS uses Secrets Manager above.
  if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }
  throw new Error(
    "DATABASE_SECRET_ARN is required (local development may supply DATABASE_URL)",
  );
}
