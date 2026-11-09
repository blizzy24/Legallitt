const fs=require('node:fs'),{createHash}=require('node:crypto');
const out=__dirname;
async function main(){
 const tag=process.argv[2];if(!/^[a-f0-9]{7,40}$/.test(tag??''))throw new Error('Commit required');
 const status=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${tag}/status`);
 if(status.ok)fs.writeFileSync(out+'/vercel-status.json',JSON.stringify(await status.json(),null,2)+'\n');
 const results=[];
 for(const [site,expected]of [['https://legalitt-5.vercel.app','Send for Admin Approval'],['https://legalitt-admin-panel.vercel.app','Approve and send to client']]){
  const response=await fetch(site),html=await response.text();if(response.status!==200)throw new Error(site+' unavailable');
  const assets=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>new URL(m[1],site).href);
  let found=false;const scripts=[];
  for(const url of assets){const js=await(await fetch(url)).text();if(js.includes(expected))found=true;scripts.push({url,sha256:createHash('sha256').update(js).digest('hex')});}
  results.push({site,status:response.status,approved_fir_ui:found,scripts});
 }
 fs.writeFileSync(out+'/frontend-assets.json',JSON.stringify(results,null,2)+'\n');
 if(results.some(r=>!r.approved_fir_ui))throw new Error('Waiting for the FIR build on both deployed frontends');
 console.log('PASS both deployed frontends contain the approved FIR workflow');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
