const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{spawnSync}=require('node:child_process');
process.loadEnvFile(path.resolve('apps/api/.env.local'));
const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_test';
const env={...process.env,DATABASE_URL:url.href,LEGALITT_TEST_DATABASE_URL:url.href};delete env.DATABASE_SECRET_ARN;
const tests=process.argv.slice(2);assert.ok(tests.every(t=>/^tests\/[a-z0-9-]+\.cjs$/.test(t)));for(const file of tests)assert.ok(fs.existsSync(path.resolve('apps/api',file)));
const run=spawnSync(process.execPath,['--test','--test-concurrency=1',...(tests.length?tests:['tests/*.cjs'])],{cwd:path.resolve('apps/api'),env,stdio:'inherit',windowsHide:true});process.exitCode=run.status??1;
