#!/usr/bin/env node
// Dev only. Secret values travel in memory, never in argv, output, or files.
const {spawnSync}=require('node:child_process');
const {resolve}=require('node:path');
const {createInterface}=require('node:readline');
const {Writable}=require('node:stream');
const {SecretsManagerClient,GetSecretValueCommand,PutSecretValueCommand}=require('../../apps/api/node_modules/@aws-sdk/client-secrets-manager');
const {CognitoIdentityProviderClient,DescribeUserPoolCommand}=require('../../apps/api/node_modules/@aws-sdk/client-cognito-identity-provider');
const root=resolve(__dirname,'../..');
function run(command,args){const r=spawnSync(command,args,{cwd:root,stdio:'inherit',env:process.env});if(r.status!==0)throw new Error(`${command} failed. The rotation is incomplete; run pnpm demo:password --resume after fixing it. Do not change the secret again.`);}
function hiddenQuestion(label){return new Promise(resolve=>{let muted=false;const output=new Writable({write(chunk,encoding,next){if(!muted)process.stderr.write(chunk,encoding);next();}});const rl=createInterface({input:process.stdin,output,terminal:true});rl.question(label,value=>{muted=false;rl.close();process.stderr.write('\n');resolve(value);});muted=true;});}
async function main(){
  if(process.versions.node.split('.')[0]!=='22')throw new Error('Use the repository Node 22 version.');
  process.chdir(root);process.loadEnvFile('apps/api/.env.local');
  const args=process.argv.slice(2);if(args.some(a=>!['--resume','--check'].includes(a))||args.length>1)throw new Error('Usage: pnpm demo:password [--resume|--check]. Never pass a password as an argument.');
  if(process.env.ENVIRONMENT!=='dev'||process.env.NODE_ENV==='production')throw new Error('Password rotation is dev only.');
  const url=new URL(process.env.DATABASE_URL||'');if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw new Error('The local API DATABASE_URL must point at local Postgres.');
  const region='ap-south-1',sm=new SecretsManagerClient({region}),cognito=new CognitoIdentityProviderClient({region});
  try {
    const secret=await sm.send(new GetSecretValueCommand({SecretId:process.env.DEMO_AUTH_SECRET_ARN}));
    if(!secret.ARN?.includes(':026379630400:secret:legalitt-dev/demo-auth-'))throw new Error('Refusing any secret outside the existing Legalitt dev account.');
    const config=await sm.send(new GetSecretValueCommand({SecretId:process.env.AUTH_CONFIG_SECRET_ARN}));
    if(!config.ARN?.includes(':026379630400:secret:legalitt-dev/app-config-'))throw new Error('Local auth configuration must use the deployed dev pool.');
    const {userPoolId}=JSON.parse(config.SecretString||'{}');const pool=await cognito.send(new DescribeUserPoolCommand({UserPoolId:userPoolId}));
    if(pool.UserPool?.UserPoolTags?.environment!=='dev')throw new Error('Refusing a pool without the dev environment tag.');
    const dbCheck=spawnSync(process.execPath,['-e',"const {Client}=require('./apps/api/node_modules/pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>c.end()).catch(()=>process.exit(1));"],{cwd:root,stdio:'pipe'});
    if(dbCheck.status!==0)throw new Error('Start local Postgres before rotating; local seed must be able to run.');
    if(args.includes('--check')){console.log('Dev secret, pool, Node version and local database checks passed. Nothing changed.');return;}
    if(!args.includes('--resume')){
      if(!process.stdin.isTTY)throw new Error('Use an interactive terminal for the hidden password prompt.');
      const password=await hiddenQuestion('New dev demo password (hidden): '),again=await hiddenQuestion('Confirm password (hidden): ');
      if(password!==again)throw new Error('Passwords did not match. Nothing changed.');
      const policy=pool.UserPool.Policies?.PasswordPolicy||{};
      if(password.length<(policy.MinimumLength||8)||policy.RequireUppercase&&!/[A-Z]/.test(password)||policy.RequireLowercase&&!/[a-z]/.test(password)||policy.RequireNumbers&&!/[0-9]/.test(password)||policy.RequireSymbols&&!/[^a-zA-Z0-9\s]/.test(password))throw new Error('Password does not meet the dev pool password policy. Nothing changed.');
      await sm.send(new PutSecretValueCommand({SecretId:secret.ARN,SecretString:JSON.stringify({...JSON.parse(secret.SecretString||'{}'),password})}));
      console.log('Dev secret updated; synchronizing both databases now.');
    }
    run('bash',['infra/scripts/dev-ops-task.sh','seed-demo']);
    run('pnpm',['--filter','@legalitt/api','db:seed-demo']);
    // Re-read after both seeds; prove Cognito and the API use this exact value.
    const value=await sm.send(new GetSecretValueCommand({SecretId:secret.ARN}));const {password}=JSON.parse(value.SecretString);
    for(const prefix of ['demo-client','demo-advocate','demo-admin','demo-advocate-2','demo-advocate-3','demo-advocate-4','demo-client-isolation']){
      const response=await fetch('https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:prefix+'@legalitt.invalid',password})});
      if(response.status!==201)throw new Error(`${prefix} sign-in failed (${response.status}). Rotation is incomplete; use --resume.`);
      console.log(`${prefix}: sign-in verified`);
    }
    console.log('Both databases seeded and all seven deployed sign-ins verified.');
  }finally{sm.destroy();cognito.destroy();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
