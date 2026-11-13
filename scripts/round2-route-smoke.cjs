// Auth stays in process memory; checks the API-backed local export.
const assert=require('node:assert/strict'),{spawn}=require('node:child_process');
process.loadEnvFile('apps/api/.env.local');
(async()=>{const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={};
for(const role of ['client','advocate']){const r=await fetch('http://127.0.0.1:3004/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);sessions[role]=await r.json();}
const child=spawn(process.execPath,['scripts/mobile-smoke.mjs'],{stdio:'inherit',windowsHide:true,env:{...process.env,SMOKE_BASE_URL:'http://localhost:8084',SMOKE_SESSIONS_JSON:JSON.stringify(sessions),CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'}});process.exitCode=await new Promise(resolve=>child.on('exit',resolve));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
