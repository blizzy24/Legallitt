process.loadEnvFile('apps/api/.env.local');
const assert=require('node:assert/strict'),url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';process.env.DATABASE_URL=url.href;delete process.env.DATABASE_SECRET_ARN;
async function main(){const db=await require('../apps/api/dist/src/database').createDatabaseClient();try{const seed=require('../apps/api/dist/prisma/seed-pricing');await seed.seedConfirmedPricing(db);await seed.seedProvisionalPricing(db);console.log('Versioned pricing ready in legalitt_report_local.');}finally{await db.$disconnect();}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
