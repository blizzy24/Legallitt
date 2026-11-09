const fs=require('node:fs'),{createHash}=require('node:crypto');
(async()=>{
  const sha=process.argv[2];if(!/^[a-f0-9]{7,40}$/.test(sha))throw new Error('Commit required');
  const status=await fetch(`https://api.github.com/repos/blizzy24/Legallitt/commits/${sha}/status`,{headers:{Accept:'application/vnd.github+json'}});
  if(status.ok)fs.writeFileSync('reports/pricing-2026-11-09/vercel-status.json',JSON.stringify(await status.json(),null,2)+'\n');
  const results=[];
  for(const origin of ['https://legalitt-5.vercel.app','https://legalitt-admin-panel.vercel.app']) {
    const response=await fetch(origin,{cache:'no-store'});if(!response.ok)throw new Error('Frontend unavailable: '+origin);
    const html=await response.text();
    const paths=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m=>m[1]);
    const bundles=[];
    for(const pathname of paths) {
      const url=new URL(pathname,origin).href;if(!url.startsWith(origin))continue;
      const js=await (await fetch(url)).text();
      bundles.push({url,sha256:createHash('sha256').update(js).digest('hex'),quoteEndpoint:js.includes('/payments/quotes'),blockedCopy:js.includes('Retry price calculation')});
    }
    results.push({origin,status:response.status,bundles});
  }
  fs.writeFileSync('reports/pricing-2026-11-09/frontend-assets.json',JSON.stringify(results,null,2)+'\n');
  if(!results[0].bundles.some(b=>b.quoteEndpoint&&b.blockedCopy))throw new Error('Main mobile frontend is still awaiting the pricing build');
  console.log('PASS deployed mobile bundle contains the quote endpoint and blocked-quote UI; both sites respond 200');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
