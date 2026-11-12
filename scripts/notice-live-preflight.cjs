const assert=require('node:assert/strict');
async function main(){
 const origin='https://legalitt-5.vercel.app';
 const r=await fetch('https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com/api/v1/notices/00000000-0000-4000-8000-000000000000/filing',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'authorization,content-type'}});
 const result={status:r.status,origin:r.headers.get('access-control-allow-origin'),methods:r.headers.get('access-control-allow-methods'),headers:r.headers.get('access-control-allow-headers')};console.log(JSON.stringify(result,null,2));assert.equal(result.origin,origin);assert.ok(result.methods.split(',').includes('PUT'),'Filing PUT must be allowed by browser preflight');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
