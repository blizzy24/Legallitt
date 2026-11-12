// Supply short-lived local test sessions in memory, never in a source or report file.
const {spawn}=require('node:child_process');
process.loadEnvFile('apps/api/.env.local');
async function main(){
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),sessions={};
 for(const role of ['client','advocate']){const r=await fetch('http://127.0.0.1:3003/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});if(r.status!==201)throw Error('Local sign-in failed');sessions[role]=await r.json();}
 const child=spawn(process.execPath,['scripts/mobile-smoke.mjs'],{stdio:'inherit',windowsHide:true,env:{...process.env,CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',SMOKE_BASE_URL:'http://localhost:8083',SMOKE_SESSIONS_JSON:JSON.stringify(sessions)}});
 child.on('exit',code=>{process.exitCode=code??1;});
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
