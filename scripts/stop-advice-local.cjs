const fs=require('node:fs');
const file='reports/legal-advice-20261114/local/server-pid.txt';
if(fs.existsSync(file)){const pid=Number(fs.readFileSync(file,'utf8'));if(!Number.isInteger(pid)||pid<1)throw Error('Invalid owned server PID');try{process.kill(pid,'SIGTERM');console.log('Stopped owned Advice verification server',pid);}catch(e){if(e.code!=='ESRCH')throw e;}}
