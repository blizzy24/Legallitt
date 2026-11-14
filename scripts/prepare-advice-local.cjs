// Isolated local acceptance fixtures only. Never rotates a password or creates
// a Cognito account. Existing fictional demo profiles get missing test experience.
const fs=require('node:fs'),assert=require('node:assert/strict');
process.loadEnvFile('apps/api/.env.local');
const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';
process.env.DATABASE_URL=url.href;delete process.env.DATABASE_SECRET_ARN;
const {spawnSync}=require('node:child_process'),path=require('node:path');
const migration=spawnSync(process.execPath,[path.resolve('apps/api/node_modules/prisma/build/index.js'),'migrate','deploy'],{cwd:path.resolve('apps/api'),env:process.env,stdio:'inherit',windowsHide:true});if(migration.status!==0)process.exit(migration.status??1);
(async()=>{const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg');const db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});try{
 const {LegalAdviceConfigSchema}=require('../packages/shared/dist'),manifest=require('../apps/api/prisma/legal-advice-rebuild.json');
 const old=await db.legalAdvicePolicy.findFirst({orderBy:{version:'desc'}});
 if(!old)await require('../apps/api/dist/prisma/seed-legal-advice').seedLegalAdvice(db);
 else if(!LegalAdviceConfigSchema.safeParse(old.config).success){const version=old.version+1;await db.legalAdvicePolicy.create({data:{version,config:{...manifest,version},reason:'TEST local acceptance: current Legal Advice policy shape; old local fixture retained.'}});}
 const service=await db.service.findUniqueOrThrow({where:{code:'legal_advice'}});await db.service.update({where:{code:'legal_advice'},data:{config:{...service.config,legal_advice_v2_enabled:true}}});
 const changed=[];const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),auth=new (require('../apps/api/dist/src/auth/auth.service').AuthService)({getClient:async()=>db},{});
 for(const email of ['demo-advocate-2@legalitt.invalid','demo-advocate-3@legalitt.invalid']){await auth.login({email,password});const u=await db.user.findFirst({where:{email,role:'advocate'},include:{advocate_profiles_user_id_relations:true}});assert.ok(u&&u.full_name.startsWith('Demo Advocate'),'Expected existing fictional demo account');if(!u.advocate_profiles_user_id_relations){await db.advocateProfile.create({data:{user_id:u.id,verification:'approved',years_experience:3,practice_areas:['General Consultation']}});changed.push(email);}else if(u.advocate_profiles_user_id_relations.years_experience==null){await db.advocateProfile.update({where:{user_id:u.id},data:{years_experience:3}});changed.push(email);}}
 console.log(JSON.stringify({database:'legalitt_report_local',synthetic_profiles_with_test_experience:changed,credentials_changed:false}));
}finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
