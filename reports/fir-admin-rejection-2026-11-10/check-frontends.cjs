const fs=require('node:fs'),{createHash}=require('node:crypto');
async function main(){
 const tag=process.argv[2];if(!/^[a-f0-9]{7,40}$/.test(tag??''))throw new Error('Commit required');
 const status=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${tag}/status`);
 if(status.ok)fs.writeFileSync(__dirname+'/vercel-status.json',JSON.stringify(await status.json(),null,2)+'\n');
 const results=[];
 for(const [site,markers]of [['https://legalitt-5.vercel.app',['Send replacement for review:','Open returned draft v','draft rejections on your current assignment.']],['https://legalitt-admin-panel.vercel.app',['Return for correction','Visible to any advocate who works this case.','Accept identity document','Reassign case','Overdue']]]){
  const response=await fetch(site),html=await response.text();if(response.status!==200)throw new Error(site+' unavailable');
  const assets=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>new URL(m[1],site).href),scripts=[];let source='';
  for(const url of assets){const js=await(await fetch(url)).text();source+=js;scripts.push({url,sha256:createHash('sha256').update(js).digest('hex')});}
  results.push({site,status:response.status,current_ui:markers.every(m=>source.includes(m)),markers:markers.map(marker=>({marker,present:source.includes(marker)})),scripts});
 }
 fs.writeFileSync(__dirname+'/frontend-assets.json',JSON.stringify(results,null,2)+'\n');
 if(results.some(r=>!r.current_ui))throw new Error('Waiting for the deployed intake frontend');
 console.log('PASS deployed mobile and admin contain the combined FIR rejection lifecycle');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
