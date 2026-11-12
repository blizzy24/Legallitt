// Dedicated local-only Legal Notice databases; never alter another worktree's DB.
// Reads the existing local connection credentials without printing them. Creates
// databases if absent, applies migrations and the base seed. Does not reset data.
const assert=require('node:assert/strict'),path=require('node:path');
const {spawnSync}=require('node:child_process');
process.loadEnvFile(path.resolve('apps/api/.env.local'));
const {Client}=require('../apps/api/node_modules/pg');
async function main(){
 const original=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(original.hostname),'local PostgreSQL only');
 const admin=new URL(original);admin.pathname='/postgres';
 const connection=new Client({connectionString:admin.href});await connection.connect();
 try{
  const testDatabase=process.env.NOTICE_TEST_DATABASE??'legalitt_notice_test';assert.match(testDatabase,/^legalitt_notice_test(?:_[a-z0-9_]+)?$/);
  for(const name of process.argv.includes('--test-only')?[testDatabase]:['legalitt_notice_local',testDatabase]){
   if(!(await connection.query('SELECT 1 FROM pg_database WHERE datname=$1',[name])).rowCount)await connection.query(`CREATE DATABASE "${name}"`);
   const target=new URL(original);target.pathname='/'+name;
   const env={...process.env,DATABASE_URL:target.href};delete env.DATABASE_SECRET_ARN;
   const cwd=path.resolve('apps/api');
   const prisma=path.join(cwd,'node_modules/prisma/build/index.js');
   // This opt-in only repairs our new local databases after a failed draft
   // migration; it neither drops data nor marks an unapplied migration applied.
   if(process.argv.includes('--retry-local-migration')){
    const targetDb=new Client({connectionString:target.href});await targetDb.connect();
    let failed=false;try{failed=!!(await targetDb.query("SELECT 1 FROM _prisma_migrations WHERE migration_name='202611130020_notice_admin_dispatch' AND finished_at IS NULL AND rolled_back_at IS NULL")).rowCount;}catch{}finally{await targetDb.end();}
    if(failed){const resolved=spawnSync(process.execPath,[prisma,'migrate','resolve','--rolled-back','202611130020_notice_admin_dispatch'],{cwd,env,stdio:'inherit',windowsHide:true});assert.equal(resolved.status,0);}
   }
   for(const args of [[prisma,'migrate','deploy'],['dist/prisma/seed.js']]){
    const run=spawnSync(process.execPath,args,{cwd,env,stdio:'inherit',windowsHide:true});assert.equal(run.status,0,`${name}: ${args.at(-1)}`);
   }
   console.log(`Ready: ${name} on ${target.hostname}:${target.port}`);
  }
 }finally{await connection.end();}
}
main().catch(e=>{console.error(e.name+': '+(e.message.includes('postgresql://')?'Local database setup failed.':e.message));process.exitCode=1;});
