import {LegalAdviceConfigSchema} from '@legalitt/shared';
import type {PrismaClient} from '../src/generated/prisma/client';
import {createDatabaseClient} from '../src/database';
import manifest from './legal-advice-rebuild.json';
/** Insert-only. Never updates an operator's policy, old bookings or credentials. */
export async function seedLegalAdvice(db:PrismaClient){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(731114002)::text`;
  if(await tx.legalAdvicePolicy.findFirst())return;
  await tx.legalAdvicePolicy.create({data:{version:1,config:LegalAdviceConfigSchema.parse(manifest),reason:'Confirmed Legal Advice answers, 14 November 2026. Non-Emerging tariffs NOT SET.'}});
 });
}
if(require.main===module)void(async()=>{const db=await createDatabaseClient();try{await seedLegalAdvice(db);console.log('Legal Advice configuration seeded; existing policies/bookings preserved.');}finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
