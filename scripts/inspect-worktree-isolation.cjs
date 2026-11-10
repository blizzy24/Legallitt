const fs=require('node:fs'),path=require('node:path'),{parseEnv}=require('node:util'),{execFileSync}=require('node:child_process');
for(const dir of [process.cwd(),path.resolve('../wt-services'),path.resolve('../Legallitt-documents')]){
 if(!fs.existsSync(dir))continue;
 const envFile=path.join(dir,'apps/api/.env.local'),env=fs.existsSync(envFile)?parseEnv(fs.readFileSync(envFile,'utf8')):{};
 const databases=Object.fromEntries(['DATABASE_URL','LEGALITT_TEST_DATABASE_URL'].map(key=>{if(!env[key])return[key,null];const u=new URL(env[key]);return[key,{host:u.hostname,port:u.port,database:u.pathname.slice(1)}];}));
 const links=Object.fromEntries(['node_modules','apps/api/node_modules','apps/api/node_modules/@legalitt/shared','packages/shared/dist'].map(p=>[p,fs.existsSync(path.join(dir,p))?fs.realpathSync(path.join(dir,p)):null]));
 console.log(JSON.stringify({dir,branch:execFileSync('git',['-C',dir,'branch','--show-current'],{encoding:'utf8'}).trim(),status:execFileSync('git',['-C',dir,'status','--porcelain'],{encoding:'utf8'}).trim(),databases,links},null,2));
}
