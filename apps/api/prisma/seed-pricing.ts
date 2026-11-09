import { createDatabaseClient } from '../src/database';
import { PrismaClient } from '../src/generated/prisma/client';
import { seedId } from './seed-records';
import manifest from './confirmed-pricing.json';

export async function seedConfirmedPricing(db: PrismaClient) {
  const identity = (table: string, row: unknown) => seedId(table, {version: manifest.version, row});
  await db.$transaction(async tx => {
    // Serialise simultaneous operator retries. Existing versions are never rewritten.
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(731109001)::text`;
    const common = {confirmed: true, source_note: manifest.source_note, effective_from: new Date()};
    const pageId = identity('page_overage_policies', manifest.page_overage);
    await tx.pageOveragePolicy.upsert({where: {id: pageId}, update: {}, create: {
      ...manifest.page_overage, ...common, id: pageId, unit_amount_paise: BigInt(manifest.page_overage.unit_amount_paise),
    }});
    const deliveryId = identity('service_pricing', manifest.delivery);
    await tx.servicePricing.upsert({where: {id: deliveryId}, update: {}, create: {
      ...manifest.delivery, ...common, id: deliveryId, base_amount_paise: BigInt(manifest.delivery.base_amount_paise),
    }});
    for (const service of manifest.services) {
      const policy = {...manifest.fee_policy, service_code: service.service_code, pricing_mode: service.pricing_mode,
        delivery_pricing_id: service.service_code === manifest.delivery.service_code ? deliveryId : null,
        page_overage_policy_id: pageId};
      const policyId = identity('fee_policies', policy);
      await tx.feePolicy.upsert({where: {id: policyId}, update: {}, create: {...policy, ...common, id: policyId}});
      const commission = {service_code: service.service_code, rate_bps: service.rate_bps, confirmed: true};
      const commissionId = identity('commission_rates', commission);
      await tx.commissionRate.upsert({where: {id: commissionId}, update: {}, create: {...commission, id: commissionId, effective_from: common.effective_from}});
      for (const price of manifest.prices.filter(p => p.service_code === service.service_code)) {
        const row = {...price, fee_policy_id: policyId};
        const id = identity('service_pricing', row);
        await tx.servicePricing.upsert({where: {id}, update: {}, create: {
          ...row, ...common, id, base_amount_paise: BigInt(row.base_amount_paise),
        }});
      }
    }
  });
}

if (require.main === module) void (async () => {
  const db = await createDatabaseClient();
  try { await seedConfirmedPricing(db); console.log('Activated versioned confirmed pricing; historical rows unchanged; no standalone courier commission.'); }
  finally { await db.$disconnect(); }
})().catch(() => { console.error('Pricing seed failed; check database access and migrations.'); process.exitCode = 1; });
