const fs=require('node:fs'),{execFileSync}=require('node:child_process');
process.loadEnvFile('apps/api/.env.local');
(async()=>{
  const password=await require('../../apps/api/dist/src/auth/demo').demoPassword();
  const files=execFileSync('git',['diff','--cached','--name-only','-z']).toString().split('\0').filter(Boolean);
  for(const file of files){
    if(!fs.existsSync(file))continue;
    const data=fs.readFileSync(file);
    if(data.includes(Buffer.from(password))||/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/.test(data.toString()))
      throw new Error('Credential-like value in staged file: '+file);
  }
  console.log('PASS credential scan of '+files.length+' staged files');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
