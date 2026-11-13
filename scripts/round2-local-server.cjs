process.loadEnvFile('apps/api/.env.local');
const assert=require('node:assert/strict'),url=new URL(process.env.DATABASE_URL);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';process.env.DATABASE_URL=url.href;delete process.env.DATABASE_SECRET_ARN;
(async()=>{
 const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});
 try{await require('../apps/api/dist/prisma/seed-round2').seedRound2BuiltServices(db);}finally{await db.$disconnect();}
 const env=await require('./helpers/notice-local-environment.cjs')({database:'legalitt_report_local',apiPort:3004,mobilePort:8084,adminPort:5175,mobileFolder:'apps/mobile/dist/report-verification',adminFolder:'apps/admin/dist/report-verification',cache:'reports/round2-20261113/local/storage-cache.json',persist:true});
 require('node:fs').writeFileSync('reports/round2-20261113/server-pid.txt',String(process.pid));
 console.log('Round 2 local verification: API :3004, mobile :8084, admin :5175. Test adapters; isolated application database.');
 const stop=async()=>{await env.close();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);
})().catch(e=>{console.error('Round 2 local environment failed:',e.message);process.exitCode=1;});
