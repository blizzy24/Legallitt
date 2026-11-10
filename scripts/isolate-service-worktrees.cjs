// One-time, non-destructive local setup requested on 2026-11-10.
// Database credentials are read from ignored local settings, never printed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{parseEnv}=require('node:util'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),previous=path.resolve(root,'../wt-services'),target=path.resolve(root,'../Legallitt-documents');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const envPath=dir=>path.join(dir,'apps/api/.env.local');
function setValue(text,key,value){const line=key+'='+value,pattern=new RegExp('^(?:export\\s+)?'+key+'=.*$','m');return pattern.test(text)?text.replace(pattern,()=>line):text.trimEnd()+'\n'+line+'\n';}
function writeEnv(dir,text){const file=envPath(dir),backup=path.join(dir,'apps/api/.env.before-isolation.local');if(fs.existsSync(file)&&!fs.existsSync(backup))fs.copyFileSync(file,backup);fs.writeFileSync(file,text);}
(async()=>{
 assert.equal(git('branch','--show-current'),'services-consultation');
 const claudeCommit=git('rev-parse','services-documents');
 if(!fs.existsSync(target)){
  assert.equal(git('-C',previous,'status','--porcelain'),'','Claude worktree must remain clean');
  assert.equal(git('-C',previous,'rev-parse','HEAD'),claudeCommit);
  assert.equal(git('-C',previous,'branch','--show-current'),'services-documents');
  // Windows refused the directory rename. Preserve every old file, detach its
  // checkout, and attach the same branch to the requested new worktree.
  git('-C',previous,'switch','--detach',claudeCommit);
  git('worktree','add',target,'services-documents');
 }
 assert.equal(git('-C',target,'branch','--show-current'),'services-documents');assert.equal(git('-C',target,'rev-parse','HEAD'),claudeCommit);
 for(const file of ['apps/api/.env.local','apps/mobile/.env.local','apps/admin/.env.local','infra/local/.env.local']){const source=path.join(previous,file),destination=path.join(target,file);if(fs.existsSync(source)&&!fs.existsSync(destination)){fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(source,destination);}}
 const localText=fs.readFileSync(envPath(root),'utf8'),localEnv=parseEnv(localText),url=new URL(localEnv.DATABASE_URL);
 assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.equal(url.port,'55432');
 const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.toString()})});
 const names=['legalitt_consultation_test','legalitt_documents_test','legalitt_documents'];
 try{for(const name of names){assert.match(name,/^[a-z_]+$/);if(!(await db.$queryRaw`SELECT datname FROM pg_database WHERE datname=${name}`).length)await db.$executeRawUnsafe('CREATE DATABASE '+name);}}finally{await db.$disconnect();}
 const dbUrl=name=>{const value=new URL(url);value.pathname='/'+name;return value.toString();};
 writeEnv(root,setValue(localText,'LEGALITT_TEST_DATABASE_URL',dbUrl(names[0])));
 const documentsText=fs.existsSync(envPath(target))?fs.readFileSync(envPath(target),'utf8'):localText;
 const isolated=setValue(setValue(documentsText,'DATABASE_URL',dbUrl(names[2])),'LEGALITT_TEST_DATABASE_URL',dbUrl(names[1]));
 writeEnv(target,isolated);
 // The preserved old folder must not retain a pointer to the shared test DB.
 writeEnv(previous,isolated);
 console.log(JSON.stringify({root:{path:root,branch:'services-consultation',test_database:names[0]},documents:{path:target,branch:'services-documents',commit:claudeCommit,test_database:names[1],application_database:names[2]},preserved_detached_folder:previous,postgres:'127.0.0.1:55432',existing_databases_preserved:true},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
