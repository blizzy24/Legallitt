import type {PrismaClient} from '../src/generated/prisma/client';
import {createDatabaseClient} from '../src/database';
/** Existing explicitly fictional multi-advocate accounts only. No auth/Cognito,
 * passwords, verification, availability, real profile or case is changed. */
export async function seedLegalAdviceDemoProfiles(db:PrismaClient){
 const changed:string[]=[];
 await db.$transaction(async tx=>{for(const email of ['demo-advocate-2@legalitt.invalid','demo-advocate-3@legalitt.invalid']){
  const user=await tx.user.findFirst({where:{email,role:'advocate'}});
  if(!user||!user.full_name.startsWith('Demo Advocate'))throw new Error('Expected the existing fictional demo advocate accounts. No account was created.');
  const result=await tx.advocateProfile.updateMany({where:{user_id:user.id,years_experience:null},data:{years_experience:3}});if(result.count)changed.push(email);
 }});return changed;
}
if(require.main===module)void(async()=>{if(process.env.ENVIRONMENT!=='dev'||process.env.NODE_ENV==='production')throw Error('Fictional profile fixtures are development-only');const db=await createDatabaseClient();try{const changed=await seedLegalAdviceDemoProfiles(db);console.log(`Configured missing experience on ${changed.length} existing fictional demo profiles. Credentials and cases unchanged.`);}finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
