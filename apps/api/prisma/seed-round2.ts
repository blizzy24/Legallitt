import {ReportWorkflowPolicySchema} from '@legalitt/shared';
import {createDatabaseClient} from '../src/database';
import type {PrismaClient} from '../src/generated/prisma/client';
import {seedId} from './seed-records';
import manifest from './round2-built-services.json';

/** Activate after the compatible API and frontends are serving. Insert-only and
 * idempotent: never rewrite a case, quote, historical tariff or admin override. */
export async function seedRound2BuiltServices(db:PrismaClient){
 await db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(731109001)::text`;
  const at=new Date();
  for(const code of ['property_search','document_forensic'] as const){
   const old=await tx.feePolicy.findFirst({where:{service_code:code},orderBy:{effective_from:'desc'}});
   if(!old)throw Error('Base and pricing seeds must run before round 2 activation');
   const policyId=seedId('round2_fee_policy',{version:manifest.version,code});
   const {id:oldId,effective_to,effective_from,source_note,confirmed,...terms}=old;
   await tx.feePolicy.upsert({where:{id:policyId},update:{},create:{...terms,id:policyId,confirmed:true,source_note:manifest.source_note,effective_from:at}});
   for(const price of manifest.prices.filter(p=>p.service_code===code)){
    const id=seedId('round2_tariff',{version:manifest.version,price});
    await tx.servicePricing.upsert({where:{id},update:{},create:{id,...price,base_amount_paise:BigInt(price.base_amount_paise),variant:null,gst_bps:1800,confirmed:true,fee_policy_id:policyId,source_note:manifest.source_note,effective_from:at}});
   }
   const id=seedId('round2_report_policy',{version:manifest.version,code});
   if(!await tx.reportWorkflowPolicy.findUnique({where:{id}})){
    const previous=await tx.reportWorkflowPolicy.findFirst({where:{service_code:code},orderBy:{version:'desc'}});
    if(!previous)throw Error('Report workflow migration must run first');
    const config=ReportWorkflowPolicySchema.parse({...previous.config as object,turnaround:manifest.turnaround[code]});
    await tx.reportWorkflowPolicy.create({data:{id,service_code:code,version:previous.version+1,config,effective_from:at}});
   }
  }
 });
}
if(require.main===module)void(async()=>{const db=await createDatabaseClient();try{await seedRound2BuiltServices(db);console.log('Round 2 PS/DF tariffs and turnaround activated; existing cases and price snapshots unchanged.');}finally{await db.$disconnect();}})().catch(()=>{console.error('Round 2 activation failed; check migrations and base pricing.');process.exitCode=1;});
