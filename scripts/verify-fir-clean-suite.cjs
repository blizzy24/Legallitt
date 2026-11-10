// Isolate this lifecycle regression suite from leftovers in the developer's
// normal test database. The database is local and deliberately kept for audit.
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),assert=require('node:assert/strict');
process.loadEnvFile('apps/api/.env.local');
const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg');
(async()=>{
 const url=new URL(process.env.LEGALITT_TEST_DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.ok(url.pathname.includes('test'));
 const name='legalitt_fir_admin_test_'+Date.now(),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.toString()})});
 try{await db.$executeRawUnsafe('CREATE DATABASE '+name);}finally{await db.$disconnect();}
 url.pathname='/'+name;const env={...process.env,DATABASE_URL:url.toString(),LEGALITT_TEST_DATABASE_URL:url.toString()};delete env.DATABASE_SECRET_ARN;
 const run=args=>{const r=spawnSync(process.execPath,args,{cwd:'apps/api',env,stdio:'inherit',windowsHide:true});if(r.status!==0)throw Error('Verification command failed: '+args[0]);};
 console.log('Dedicated local verification database: '+name);
 run(['node_modules/prisma/build/index.js','migrate','deploy']);run(['dist/prisma/seed.js']);run(['scripts/test-preflight.cjs']);
 run(['--test','--test-concurrency=1',...fs.readdirSync('apps/api/tests').filter(n=>n.endsWith('.cjs')).map(n=>'tests/'+n)]);
})().catch(e=>{console.error(e.message);process.exitCode=1;});
