// Migrate and base-seed only the local databases assigned to these worktrees.
// No demo credential or deployed database is touched.
const fs=require('node:fs'),path=require('node:path'),{parseEnv}=require('node:util'),{spawnSync}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),documents=process.argv[2]==='documents',dir=documents?path.resolve(root,'../Legallitt-documents'):root;
const settings=parseEnv(fs.readFileSync(path.join(dir,'apps/api/.env.local'),'utf8'));
const names=documents?['legalitt_documents','legalitt_documents_test']:['legalitt_consultation_test'];
const urls=documents?[settings.DATABASE_URL,settings.LEGALITT_TEST_DATABASE_URL]:[settings.LEGALITT_TEST_DATABASE_URL];
for(let i=0;i<urls.length;i++){
 const url=new URL(urls[i]);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.equal(url.port,'55432');assert.equal(url.pathname,'/'+names[i]);
 const env={...process.env,...settings,DATABASE_URL:url.toString()};delete env.DATABASE_SECRET_ARN;
 for(const args of [['node_modules/prisma/build/index.js','migrate','deploy'],['dist/prisma/seed.js']]){const r=spawnSync(process.execPath,args,{cwd:path.join(dir,'apps/api'),env,stdio:'inherit',windowsHide:true});assert.equal(r.status,0,'Local migration/base seed failed');}
}
const env={...process.env,...settings,DATABASE_URL:settings.LEGALITT_TEST_DATABASE_URL};delete env.DATABASE_SECRET_ARN;
for(const args of [['scripts/test-preflight.cjs'],['--test','tests/database.cjs']]){const r=spawnSync(process.execPath,args,{cwd:path.join(dir,'apps/api'),env,stdio:'inherit',windowsHide:true});assert.equal(r.status,0,'Local database verification failed');}
console.log('PASS isolated database setup: '+names.join(', '));
