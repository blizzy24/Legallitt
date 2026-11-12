process.loadEnvFile('apps/api/.env.local');
const assert=require('node:assert/strict'),url=new URL(process.env.DATABASE_URL);
assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_notice_local';process.env.DATABASE_URL=url.href;delete process.env.DATABASE_SECRET_ARN;
require('./helpers/notice-local-environment.cjs')().then(env=>{
 console.log('Local Legal Notice verification: API :3003, mobile :8083, admin :5174. Storage, payments, AI and external email are test adapters.');
 const stop=async()=>{await env.close();process.exit(0);};process.on('SIGINT',stop);process.on('SIGTERM',stop);
}).catch(error=>{console.error('Local verification environment failed:',error.message);process.exit(1);});
