// Isolated report-flow databases. Never resets or drops a database.
const assert=require('node:assert/strict'),path=require('node:path'),{spawnSync}=require('node:child_process');
process.loadEnvFile(path.resolve('apps/api/.env.local'));
const {Client}=require('../apps/api/node_modules/pg');
async function main(){
 const source=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(source.hostname));const admin=new URL(source);admin.pathname='/postgres';
 const connection=new Client({connectionString:admin.href});await connection.connect();
 try{for(const name of ['legalitt_report_local','legalitt_report_test']){
  if(!(await connection.query('SELECT 1 FROM pg_database WHERE datname=$1',[name])).rowCount)await connection.query(`CREATE DATABASE "${name}"`);
  const url=new URL(source);url.pathname='/'+name;const env={...process.env,DATABASE_URL:url.href};delete env.DATABASE_SECRET_ARN;
  const cwd=path.resolve('apps/api');for(const args of [[path.join(cwd,'node_modules/prisma/build/index.js'),'migrate','deploy'],['dist/prisma/seed.js']]){const r=spawnSync(process.execPath,args,{cwd,env,stdio:'inherit',windowsHide:true});assert.equal(r.status,0,name+': '+args.at(-1));}
  console.log('Ready: '+name);
 }}finally{await connection.end();}
}
main().catch(e=>{console.error(e.name+': '+(e.message.includes('postgresql://')?'Local database setup failed':e.message));process.exitCode=1;});
