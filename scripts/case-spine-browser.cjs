// Local build smoke test with intercepted API responses. Never contacts the deployed API.
// Run after both frontend builds: CHROME_PATH=... node scripts/case-spine-browser.cjs
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const puppeteer=require('puppeteer-core');
const root=path.resolve(__dirname,'..');
const chrome=process.env.CHROME_PATH??['C:/Program Files/Google/Chrome/Application/chrome.exe','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/usr/bin/google-chrome'].find(p=>fs.existsSync(p));
const tokens={idToken:'local-test-only',accessToken:'local-test-only',expiresIn:3600,expiresAt:Date.now()+3600000};
const row=(service_code)=>({id:service_code,service_code,reference:service_code==='legal_notice'?'LN-TEST-0001':'PROPERTY_SEARCH-TEST-0001',
  status:'in_progress',client_id:'client',advocate_id:'advocate',advocate:null,tier:null,matter_type:null,details:{},
  created_at:'2026-11-08T00:00:00Z',updated_at:'2026-11-08T00:00:00Z',documents:[]});
const rows=['legal_notice','property_search'].map(row);
const counts={open:1,pending:0,in_progress:0,completed:0,closed:0};
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
async function serve(app){
  const dist=path.join(root,'apps',app,'dist');assert.ok(fs.existsSync(path.join(dist,'index.html')),'Build '+app+' first');
  const server=http.createServer((req,res)=>{
    let file=path.resolve(dist,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(dist,'index.html');
    res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,base:`http://127.0.0.1:${server.address().port}`};
}
(async()=>{
  let browser;const servers=[];
  try{
    browser=await puppeteer.launch({executablePath:chrome,headless:true});
    for(const app of ['admin','mobile']){
      const {server,base}=await serve(app);servers.push(server);
      for(const role of app==='admin'?['admin']:['client','advocate']){
        const page=await browser.newPage(),errors=[],calls=[];let service='legal_notice',detailStatus='paid';
        page.on('pageerror',error=>errors.push(error.message));
        await page.setViewport({width:app==='admin'?1440:390,height:900});
        await page.evaluateOnNewDocument(({tokens,role})=>{
          sessionStorage.setItem('legalitt.admin.tokens',JSON.stringify(tokens));sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify(tokens));
          localStorage.setItem('legalitt.entry.onboarding','1');localStorage.setItem('legalitt.entry.role',role==='advocate'?'lawyer':'user');
        },{tokens,role});
        await page.setRequestInterception(true);
        page.on('request',async req=>{
          const url=new URL(req.url());
          if(url.pathname.startsWith('/api/v1/')){
            calls.push(url.pathname+url.search);let body;
            if(req.method()==='OPTIONS')body={};
            else if(url.pathname==='/api/v1/me')body={id:role,role,name:'Local browser test',email:null,phone:null};
            else if(url.pathname==='/api/v1/notifications')body={items:[],unread_count:0,next_cursor:null};
            else if(url.pathname==='/api/v1/cases')body={items:rows,next_cursor:null};
            else if(url.pathname==='/api/v1/admin/cases')body={items:[{...row(service),status:'paid',bucket:'open',client:{id:'client',name:'Test client'},parties:[],documents:{},simulated_documents:{},amount_paise:null}],counts,total:1,filtered_total:1,next_cursor:null};
            else if(url.pathname==='/api/v1/admin/advocates')body={items:[]};
            else if(url.pathname.startsWith('/api/v1/admin/cases/'))body={...row(service),status:detailStatus,advocate_id:null,contacts:[],pricing:null,intake:{},events:[],documents:[],drafts:[],payments:[],shipments:[]};
            else {errors.push('Unexpected API request: '+url.pathname);body={message:'Unexpected test request'};}
            return req.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'},body:JSON.stringify(body)});
          }
          if(url.origin===base||['data:','blob:'].includes(url.protocol))return req.continue();
          errors.push('Blocked external request: '+url.origin);return req.abort();
        });
        if(app==='admin'){
          for(service of ['legal_notice','property_search']){
            const list=service==='legal_notice'?'/legal-notices':`/services/${service}/cases`;
            await page.goto(base+list,{waitUntil:'networkidle0'});await page.waitForSelector('td.reference a');
            assert.equal(await page.$eval('main h1',e=>e.textContent),service==='legal_notice'?'Legal Notices':'Property Search Report');
            assert.ok(calls.some(c=>c.includes('/admin/cases?service='+service)));
            assert.equal(await page.$eval('td.reference a',e=>e.getAttribute('href')),list+'/'+service);
            await page.click('td.reference a');await page.waitForSelector('.case-overview');
            assert.equal(await page.$eval('.back-link',e=>e.getAttribute('href')),list);
            await page.click('.admin-attention .assign');await page.waitForSelector('dialog[open]');
            await page.waitForFunction(()=>document.querySelector('dialog')?.textContent.includes('No approved advocates available'));
            assert.ok(calls.includes('/api/v1/admin/advocates?service='+service));
            detailStatus='dispatched';await page.goto(base+list+'/'+service,{waitUntil:'networkidle0'});await page.waitForSelector('.case-overview');
            assert.equal(await page.$eval('main',e=>e.textContent.includes('Confirm delivery')),service==='legal_notice');detailStatus='paid';
          }
        }else{
          await page.goto(base+(role==='advocate'?'/matters':'/cases'),{waitUntil:'networkidle0'});
          await page.waitForFunction(()=>document.body.innerText.includes('LN-TEST-0001')&&document.body.innerText.includes('PROPERTY_SEARCH-TEST-0001'));
          assert.ok(calls.some(c=>c.startsWith('/api/v1/cases?')));
          await page.goto(base+(role==='advocate'?'/advocate/requests/property_search':'/cases/property_search')+'?service=property_search&caseId=property_search',{waitUntil:'networkidle0'});
          await page.waitForSelector('[data-testid="account-data-unavailable"]');
        }
        assert.deepEqual(errors,[]);console.log(`PASS ${app} ${role}: service lists, routes and workflow boundaries`);await page.close();
      }
    }
  }finally{await browser?.close();await Promise.all(servers.map(server=>new Promise(resolve=>server.close(resolve))));}
})().catch(error=>{console.error(error);process.exitCode=1;});
