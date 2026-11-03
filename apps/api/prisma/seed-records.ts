import { createHash } from "node:crypto";
import {
  SERVICE_CODES,
  DEFAULT_NOTICE_POLICY,
  SERVICE_NAMES,
  type ServiceCode,
} from "@legalitt/shared";
import { PrismaClient } from "../src/generated/prisma/client";
import data from "./seed-data.json";

/** Stable UUIDv5 in the standard URL namespace; a changed record gets a new ID. */
export function seedId(table: string, record: unknown): string {
  const namespace = Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex");
  const bytes = createHash("sha1")
    .update(namespace)
    .update(`legalitt:seed:${table}:${JSON.stringify(record)}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const seedManifest = data;

export async function seed(client: PrismaClient) {
  // One atomic transaction. Reruns leave existing versions and dates untouched.
  // These are source observations, not a "latest row wins" pricing policy.
  await client.$transaction(async (tx) => {
    for (const code of SERVICE_CODES) {
      await tx.service.upsert({
        where: { code },
        create: { code, name: SERVICE_NAMES[code], ...(code === 'legal_notice' ? {config: {notice_policy: DEFAULT_NOTICE_POLICY}} : {}) },
        update: {},
      });
    }
    for (const row of data.prices) {
      if (!SERVICE_CODES.includes(row.service_code as ServiceCode)) {
        throw new Error(`Unknown seed service ${row.service_code}`);
      }
      if (!/^\d+$/.test(row.base_amount_paise)) {
        throw new Error(
          "Seed amounts must be non-negative integer paise strings",
        );
      }
      const id = seedId("service_pricing", row);
      await tx.servicePricing.upsert({
        where: { id },
        create: {
          ...row,
          id,
          base_amount_paise: BigInt(row.base_amount_paise),
        },
        update: {},
      });
    }
    for (const row of data.commissions) {
      // The authoritative DDL has no source_note here. Keep the citation in the
      // versioned manifest and ID input, without inventing a database column.
      const { source_note: _citation, ...columns } = row;
      const id = seedId("commission_rates", row);
      await tx.commissionRate.upsert({
        where: { id },
        create: { ...columns, id },
        update: {},
      });
    }
  });
}
