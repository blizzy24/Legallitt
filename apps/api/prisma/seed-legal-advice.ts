import {LegalAdviceConfigSchema} from '@legalitt/shared';
import type {PrismaClient} from '../src/generated/prisma/client';
import {createDatabaseClient} from '../src/database';
import manifest from './legal-advice-rebuild.json';
import {adviceTariff} from '../src/consultations/legal-advice-rules';
/** Insert-only. Never updates an operator's policy, old bookings or credentials. */
export async function seedLegalAdvice(db:PrismaClient){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(731114002)::text`;
  if(await tx.legalAdvicePolicy.findFirst())return;
  const config=LegalAdviceConfigSchema.parse(manifest),policy=await tx.legalAdvicePolicy.create({data:{version:1,config,reason:'Confirmed Legal Advice answers, 14 November 2026. Non-Emerging tariffs NOT SET.'}});
  for(const t of config.tariffs)if(t.base_paise!==null)await adviceTariff(tx,policy.id,config,t.tier_code,t.mode);
  await adviceTariff(tx,policy.id,config,'emerging','chat',true);
 });
}
if(require.main===module)void(async()=>{const db=await createDatabaseClient();try{await seedLegalAdvice(db);const service=await db.service.findUniqueOrThrow({where:{code:'legal_advice'}});if(!('legal_advice_v2_enabled' in (service.config as object)))await db.service.update({where:{code:'legal_advice'},data:{config:{...service.config as object,legal_advice_v2_enabled:true}}});console.log('Legal Advice configuration seeded; existing policies/bookings preserved.');}finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
