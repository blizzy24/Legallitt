// Public deployment metadata and actual production bundles; no Vercel credential.
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const sha=process.argv[2];if(!/^[a-f0-9]{7,40}$/.test(sha??''))throw Error('Provide the reviewed commit SHA.');
const out=path.resolve('reports/report-services-2026-11-11');
(async()=>{const result={checked_at:new Date().toISOString(),commit:sha,sites:[]};
 const gh=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${sha}/status`,{headers:{Accept:'application/vnd.github+json'}});if(gh.ok){const v=await gh.json();result.github={state:v.state,sha:v.sha,statuses:v.statuses.map(s=>({context:s.context,state:s.state,url:s.target_url}))};}
 for(const [base,marker]of [['https://legalitt-5.vercel.app','This preview cannot save requests, accept payments or deliver documents.'],['https://legalitt-admin-panel.vercel.app','Clients receive only approved versions.']]){
  const r=await fetch(base,{headers:{'Cache-Control':'no-cache'}}),html=await r.text(),scripts=[...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>new URL(m[1],base).href);const files=[];let ready=false;
  for(const url of scripts){const response=await fetch(url),body=await response.text();ready ||= response.ok&&body.includes(marker);files.push({url,status:response.status,sha256:createHash('sha256').update(body).digest('hex'),contains_release_marker:body.includes(marker)});}
  result.sites.push({url:base,status:r.status,ready:r.ok&&ready,scripts:files});
 }
 const health=await fetch('https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com/health');result.api_health={status:health.status,body:await health.json()};
 fs.writeFileSync(path.join(out,'frontend-verification.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({commit:sha,github:result.github?.state,sites:result.sites.map(s=>({url:s.url,ready:s.ready})),api_status:health.status}));
 if(result.github?.state!=='success'||!result.sites.every(s=>s.ready)||!health.ok)process.exitCode=2;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
