// Explicit dev-only integration check. Runs the scoped seed twice against local
// PostgreSQL and verifies Cognito modification times without printing secrets.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const {SecretsManagerClient,GetSecretValueCommand}=require('../apps/api/node_modules/@aws-sdk/client-secrets-manager');
const {CognitoIdentityProviderClient,AdminGetUserCommand}=require('../apps/api/node_modules/@aws-sdk/client-cognito-identity-provider');
const {Client}=require('../apps/api/node_modules/pg');
process.loadEnvFile('apps/api/.env.local');
async function main(){
 assert.equal(process.env.ENVIRONMENT,'dev');assert.equal(process.env.DATABASE_SECRET_ARN,undefined);assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));
 const sm=new SecretsManagerClient({region:'ap-south-1'}),cognito=new CognitoIdentityProviderClient({region:'ap-south-1'}),db=new Client({connectionString:process.env.DATABASE_URL});
 try{
  const config=await sm.send(new GetSecretValueCommand({SecretId:process.env.AUTH_CONFIG_SECRET_ARN}));const {userPoolId}=JSON.parse(config.SecretString);
  const prefixes=['demo-client','demo-advocate','demo-admin','demo-advocate-2','demo-advocate-3','demo-advocate-4'];
  const dates=async names=>{const result={};for(const prefix of names){const r=await cognito.send(new AdminGetUserCommand({UserPoolId:userPoolId,Username:prefix+'@legalitt.invalid'}));result[prefix]=r.UserLastModifiedDate.toISOString();}return result;};
  const before=await dates(prefixes);
  await db.connect();
  const query=async()=>{const r=await db.query("SELECT c.id, c.reference, c.client_id, u.email, c.status FROM case_events e JOIN cases c ON c.id=e.case_id JOIN users u ON u.id=c.client_id WHERE e.type='development_seed' AND e.payload->>'seed_key'='client-isolation-legal-notice'");return r.rows;};
  const run=()=>{const r=spawnSync(process.execPath,['--env-file=apps/api/.env.local','apps/api/dist/prisma/seed-demo.js','--client-isolation-only'],{stdio:'inherit'});assert.equal(r.status,0,'Scoped seed');};
  run();const first=await query();assert.equal(first.length,1);assert.equal(first[0].email,'demo-client-isolation@legalitt.invalid');assert.equal(first[0].status,'draft');
  const all=[...prefixes,'demo-client-isolation'];const afterFirst=await dates(all);for(const prefix of prefixes)assert.equal(before[prefix],afterFirst[prefix]);
  run();const second=await query();assert.deepEqual(second,first);const afterSecond=await dates(all);assert.deepEqual(afterSecond,afterFirst);
  const evidence={localCase:first[0],rerunPreservedCase:true,existingSixCognitoAccountsUnchanged:true,allSevenCognitoModificationTimesUnchangedOnRerun:true};
  fs.writeFileSync(path.resolve('reports/deploy-92fd314-2026-11-09/seed-local-verification.json'),JSON.stringify(evidence,null,2));
  console.log('PASS scoped seed: one owned draft, rerun preserved it, six original accounts unchanged, no credential writes on rerun.');
 }finally{sm.destroy();cognito.destroy();await db.end();}
}
main().catch(e=>{console.error(e.name,e.message);process.exitCode=1;});
