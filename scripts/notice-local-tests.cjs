const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
process.loadEnvFile(path.resolve('apps/api/.env.local'));
const testDatabase=process.env.NOTICE_TEST_DATABASE??'legalitt_notice_test';assert.match(testDatabase,/^legalitt_notice_test(?:_[a-z0-9_]+)?$/);
const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/'+testDatabase;
const env={...process.env,DATABASE_URL:url.href,LEGALITT_TEST_DATABASE_URL:url.href};delete env.DATABASE_SECRET_ARN;
const tests=process.argv.slice(2);assert.ok(tests.every(t=>/^tests\/[a-z0-9-]+\.cjs$/.test(t)),'Pass API test filenames only');
for(const file of tests)assert.ok(fs.existsSync(path.resolve('apps/api',file)),`Test file does not exist: ${file}`);
const result=spawnSync(process.execPath,['--test','--test-concurrency=1',...(tests.length?tests:['tests/*.cjs'])],{cwd:path.resolve('apps/api'),env,stdio:'inherit',windowsHide:true});
process.exitCode=result.status??1;
