// Pace read-only verification against the development gateway (10 requests/s).
// Do not retry writes: a walkthrough must observe each user action once.
module.exports=async function verificationFetch(input,init){
 const read=(init?.method??'GET').toUpperCase()==='GET';
 for(let attempt=0;;attempt++){
  const response=await fetch(input,init);
  if(!read||response.status!==429||attempt===5)return response;
  const seconds=Number(response.headers.get('retry-after'));
  await response.arrayBuffer();
  await new Promise(resolve=>setTimeout(resolve,Math.min(30000,Math.max(1500*(attempt+1),Number.isFinite(seconds)?seconds*1000:0))));
 }
};
