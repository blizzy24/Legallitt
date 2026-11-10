// Local prerequisites only. Never print connection strings or start a second DB.
const {spawn,execFileSync}=require('node:child_process');
const check=()=>{try{execFileSync('docker',['info'],{stdio:'ignore',windowsHide:true});return true;}catch{return false;}};
(async()=>{if(!check()){spawn('C:/Program Files/Docker/Docker/Docker Desktop.exe',[],{detached:true,stdio:'ignore',windowsHide:true}).unref();for(let n=0;n<60&&!check();n++)await new Promise(r=>setTimeout(r,2000));}if(!check())throw new Error('Docker Desktop Linux engine did not become ready.');execFileSync('docker',['compose','--env-file','infra/local/.env.local','-f','infra/local/compose.yaml','up','-d','--wait'],{stdio:'inherit',windowsHide:true});})().catch(e=>{console.error(e.message);process.exitCode=1;});
