// Enumerate every mobile route against the candidate API build. Tokens exist
// only in a private temporary directory and are never written into evidence.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
process.loadEnvFile('apps/api/.env.local');
async function main(){let server;const temp=fs.mkdtempSync(path.join(os.tmpdir(),'legalitt-route-sessions-'));try{
 assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
 server=await require('./helpers/local-walkthrough.cjs')();
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),env={...process.env,SMOKE_BASE_URL:'http://localhost:8083',CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe'};
 for(const role of ['client','advocate']){const r=await fetch('http://127.0.0.1:3003/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);const file=path.join(temp,role+'.json');fs.writeFileSync(file,JSON.stringify(await r.json()),{mode:0o600});env['SMOKE_'+role.toUpperCase()+'_SESSION']=file;}
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,['scripts/mobile-smoke.mjs'],{env,stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('Route smoke failed: '+code)));});
 }finally{server?.close();for(const role of ['client','advocate']){const file=path.join(temp,role+'.json');if(fs.existsSync(file))fs.unlinkSync(file);}fs.rmdirSync(temp);}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
