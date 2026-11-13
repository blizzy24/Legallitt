import {CourtPolicySchema} from '@legalitt/shared';
import type {PrismaClient} from '../src/generated/prisma/client';
import {createDatabaseClient} from '../src/database';
import {seedId} from './seed-records';
import manifest from './court-representation.json';
/** Activate only after compatible API/frontends. Insert-only, preserving every
 * old case, consultation tariff, snapshot and later admin configuration. */
export async function seedCourtRepresentation(db:PrismaClient){
 await db.$transaction(async tx=>{await tx.$queryRaw`SELECT pg_advisory_xact_lock(731114001)::text`;
  for(const code of ['district_court','high_court'] as const){
   const fee=await tx.feePolicy.findFirst({where:{service_code:code,confirmed:true},orderBy:{effective_from:'desc'}});if(!fee)throw Error('Seed base pricing before court representation.');
   const policyId=seedId('court_policy',{code,version:manifest.version});
   if(!await tx.courtPolicy.findUnique({where:{id:policyId}})){
    const latest=await tx.courtPolicy.findFirst({where:{service_code:code},orderBy:{version:'desc'}});
    if(latest)continue; // Never replace operator configuration with a seed.
    await tx.courtPolicy.create({data:{id:policyId,service_code:code,version:manifest.version,config:CourtPolicySchema.parse(manifest.config),source_note:manifest.source_note}});
   }
   for(const tier of ['ordinary','urgent'] as const){const id=seedId('court_tariff',{code,tier,version:manifest.version});await tx.servicePricing.upsert({where:{id},update:{},create:{id,service_code:code,tier,variant:'representation',base_amount_paise:BigInt(manifest.prices[code][tier]),gst_bps:1800,fee_policy_id:fee.id,confirmed:true,source_note:manifest.source_note}});}
   for(const kind of ['effective','passive']){const id=seedId('court_hearing_rate',{code,kind,version:manifest.version});await tx.courtHearingRate.upsert({where:{id},update:{},create:{id,service_code:code,kind,version:1,amount_paise:null}});}
  }
 });
}
if(require.main===module)void(async()=>{const db=await createDatabaseClient();try{await seedCourtRepresentation(db);console.log('Court representation configured; hearing rates NOT SET; old cases and tariffs preserved.');}finally{await db.$disconnect();}})().catch(e=>{console.error('Court seed failed:',e.message);process.exitCode=1;});
