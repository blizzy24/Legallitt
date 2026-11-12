// Read GitHub's deployment statuses using the existing Git credential helper.
// Credentials stay in memory and are never written to output or reports.
const {spawnSync}=require('node:child_process');
async function main(){
 const sha=process.argv[2];if(!/^[a-f0-9]{7,40}$/.test(sha??''))throw Error('Pass a commit SHA');
 const result=spawnSync('git',['credential','fill'],{input:'protocol=https\nhost=github.com\n\n',encoding:'utf8',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0'}});
 if(result.status!==0)throw Error('Existing GitHub credential unavailable');
 const values=Object.fromEntries(result.stdout.trim().split('\n').map(s=>{const at=s.indexOf('=');return[s.slice(0,at),s.slice(at+1)];}));
 const headers={Authorization:'Bearer '+values.password,Accept:'application/vnd.github+json','User-Agent':'Legalitt-deployment-verification'};
 const r=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${sha}/status`,{headers});if(!r.ok)throw Error('GitHub status read returned '+r.status);
 const data=await r.json();console.log(JSON.stringify({sha:data.sha,state:data.state,statuses:data.statuses.map(s=>({context:s.context,state:s.state,description:s.description,url:s.target_url}))},null,2));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
