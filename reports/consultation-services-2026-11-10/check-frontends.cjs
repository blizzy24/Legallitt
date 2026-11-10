const fs=require('node:fs'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const save=(name,value)=>{if(process.env.CONSULTATION_CHECK_READONLY!=='1')fs.writeFileSync(__dirname+'/'+name,JSON.stringify(value,null,2)+'\n');};
async function main(){
 const tag=process.argv[2];assert.match(tag??'',/^[a-f0-9]{7,40}$/);
 const status=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${tag}/status`);
 let deploymentReady=false;
 if(status.ok){const state=await status.json();save('vercel-status.json',state);deploymentReady=state.statuses.filter(s=>s.context.startsWith('Vercel')).length>=2&&state.statuses.filter(s=>s.context.startsWith('Vercel')).every(s=>s.state==='success');}
 const results=[];
 for(const [site,markers]of [
  ['https://legalitt-5.vercel.app',['Weekly availability saved.','Reserve time & review','Your representation payment is complete.','Refresh fee breakdown','Send replacement for review:','Session: ']],
  ['https://legalitt-admin-panel.vercel.app',['Assign booked advocate:','Approve & release report v','Return report for correction','Visible to any advocate who works this case.','Reassign case']]
 ]){
  const response=await fetch(site),html=await response.text();assert.equal(response.status,200,site);
  const assets=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>new URL(m[1],site).href),scripts=[];let source='';
  for(const url of assets){const response=await fetch(url);assert.equal(response.status,200);const js=await response.text();source+=js;scripts.push({url,sha256:createHash('sha256').update(js).digest('hex')});}
  results.push({site,status:response.status,current_ui:markers.every(m=>source.includes(m)),markers:markers.map(marker=>({marker,present:source.includes(marker)})),scripts});
 }
 save('frontend-assets.json',results);
 assert.ok(deploymentReady&&results.every(r=>r.current_ui),'Waiting for deployed consultation and FIR frontends');
 console.log('PASS deployed mobile and admin contain consultation services and FIR rejection');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
