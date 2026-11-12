process.loadEnvFile('apps/api/.env.local');
const assert=require('node:assert/strict'),url=new URL(process.env.DATABASE_URL);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';process.env.DATABASE_URL=url.href;delete process.env.DATABASE_SECRET_ARN;
require('./helpers/notice-local-environment.cjs')({database:'legalitt_report_local',apiPort:3004,mobilePort:8084,adminPort:5175,mobileFolder:'apps/mobile/dist/report-verification',adminFolder:'apps/admin/dist/report-verification',cache:'reports/report-flows-20261113/local/storage-cache.json',persist:true}).then(env=>{
 console.log('Report verification: API :3004, mobile :8084, admin :5175. Local test storage, payment, AI and email adapters.');
 const stop=async()=>{await env.close();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);
}).catch(e=>{console.error('Local report environment failed:',e.message);process.exitCode=1;});
