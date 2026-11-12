// Keep demo credentials and auth sessions in memory, never in CLI arguments/files.
const {spawn}=require('node:child_process');
process.loadEnvFile('apps/api/.env.local');
(async()=>{
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={};
 for(const role of ['client','advocate']){const response=await fetch('http://127.0.0.1:3004/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});if(!response.ok)throw new Error(role+' smoke sign-in failed');sessions[role]=await response.json();}
 const child=spawn(process.execPath,['scripts/mobile-smoke.mjs'],{stdio:'inherit',env:{...process.env,CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',SMOKE_BASE_URL:'http://localhost:8084',SMOKE_SESSIONS_JSON:JSON.stringify(sessions)}});child.on('exit',code=>{process.exitCode=code??1;});
})().catch(error=>{console.error(error.message);process.exitCode=1;});
