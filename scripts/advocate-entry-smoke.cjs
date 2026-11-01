const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),p=require('puppeteer-core');
const {demoPassword,requireDemoMode}=require('../apps/api/dist/src/auth/demo');
const out=path.resolve('reports/advocate-chunk-1');fs.mkdirSync(out,{recursive:true});
const expected={assigned:['Review Request','fee'],advocate_accepted:['Continue Draft','drafting'],in_progress:['Continue Draft','draft'],changes_requested:['Continue Draft','drafting'],client_review:['Open Case','review'],approved:['Open Case','final'],dispatching:['Open Case','dispatch'],dispatched:['Open Case','dispatch'],completed:['Open Case','report']};
(async()=>{
 requireDemoMode();const password=await demoPassword();
 const b=await p.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 try{
 const page=await b.newPage();await page.setViewport({width:430,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&/cannot contain|cannot be a descendant|Unexpected text node/.test(m.text()))errors.push(m.text());});
 async function click(text){await page.evaluate(text=>{const el=[...document.querySelectorAll('[role=button],button')].find(el=>el.textContent.trim()===text);if(!el)throw Error('Missing button '+text);el.scrollIntoView({block:'nearest',inline:'nearest'});el.click();},text);}
 await page.goto('http://localhost:8081/login',{waitUntil:'networkidle0',timeout:90000});await page.waitForSelector('input[placeholder="Email / Mobile No"]');await page.type('input[placeholder="Email / Mobile No"]','demo-advocate@legalitt.invalid');await page.type('input[aria-label="Password"]',password);await click('Continue');
 await page.waitForFunction(()=>location.pathname==='/dashboard'&&document.body.innerText.includes('Arjun'),{timeout:60000});await page.waitForSelector('[data-testid="dashboard-stat-requests"]');
 const token=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('legalitt.auth.tokens')).idToken);
 async function read(route,auth=token){const r=await fetch('http://127.0.0.1:3001/api/v1'+route,{headers:{Authorization:'Bearer '+auth}});const data=await r.json();assert.equal(r.status,200,route);return data;}
 async function list(auth){let rows=[],cursor;do{const page=await read('/cases'+(cursor?'?cursor='+encodeURIComponent(cursor):''),auth);rows.push(...page.items);cursor=page.next_cursor;}while(cursor);return rows;}
 const cases=await list(token),states=cases.reduce((o,c)=>(o[c.status]=(o[c.status]??0)+1,o),{});
 const text=await page.evaluate(()=>document.body.innerText);assert.ok(!/Abhishek|10 Sep 2026|TODAY.S HEARINGS|CONSULTATION|TOTAL EARNINGS|TODAY.S SCHEDULE|8,500|HIGH COURT/.test(text));assert.equal(await page.$eval('[data-testid="dashboard-stat-requests"]',e=>e.innerText.match(/\d+/)?.[0]),String(states.assigned??0));await page.screenshot({path:out+'/dashboard.png'});
 await page.goto('http://localhost:8081/matters',{waitUntil:'networkidle0'});await page.waitForFunction(n=>document.querySelectorAll('[data-testid^="matter-"]:not([data-testid^="matter-stat"]):not([data-testid="matter-count"])').length===n,{},cases.length);
 const bucket=c=>['advocate_declined','completed','cancelled','refunded'].includes(c.status)?'Resolved':['draft','submitted','payment_pending','paid','assigning','assigned'].includes(c.status)?'Needs Review':'In Progress';
 const counts=Object.fromEntries(['Needs Review','In Progress','Resolved'].map(k=>[k,cases.filter(c=>bucket(c)===k).length]));
 for(const [label,kind] of [['REVIEW','Needs Review'],['PROGRESS','In Progress'],['RESOLVED','Resolved']])assert.equal(await page.$eval(`[data-testid="matter-stat-${label}"]`,e=>Number(e.innerText.match(/\d+/)?.[0])),counts[kind]);
 const evidence={identity:await read('/me'),total:cases.length,states,counts,filters:[],cards:[]};
 for(const c of cases){const card=await page.$(`[data-testid="matter-${c.id}"]`);assert.ok(card,c.reference);const text=await card.evaluate(e=>e.innerText);assert.ok(!text.includes('Upcoming'));const action=expected[c.status];if(action)assert.ok(text.includes(action[0]),c.reference+' '+action[0]);else assert.equal(await card.evaluate(e=>e.querySelectorAll('[role=button]').length),0);evidence.cards.push({reference:c.reference,status:c.status,action:action?.[0]??null});}
 for(const filter of ['All','Needs Review','In Progress','Waiting for Client','Resolved']){
  await click(filter);const n=cases.filter(c=>filter==='All'||(filter==='Waiting for Client'?c.status==='client_review':bucket(c)===filter)).length;
  await page.waitForFunction(n=>document.querySelector('[data-testid="matter-count"]')?.textContent===String(n),{},n);
  assert.equal(await page.$$eval('[data-testid^="matter-"]:not([data-testid^="matter-stat"]):not([data-testid="matter-count"])',els=>els.length),n);
  await page.screenshot({path:out+'/list-'+filter.toLowerCase().replaceAll(' ','-')+'.png'});evidence.filters.push({filter,count:n});
 }
 await click('All');
 const declined=cases.find(c=>c.status==='advocate_declined');
 if(declined){await page.$eval(`[data-testid="matter-${declined.id}"]`,e=>e.scrollIntoView({block:'center'}));await page.screenshot({path:out+'/declined-card.png'});}
 await click('Legal Notice');assert.equal(await page.$eval('[data-testid="matter-count"]',e=>e.textContent),String(cases.length));await page.screenshot({path:out+'/list-legal-notice.png'});
 const search=await page.$('input[placeholder="Search client, case, service or case ID..."]');await search.type(cases[0].reference);await page.waitForFunction(()=>document.querySelector('[data-testid="matter-count"]')?.textContent==='1');assert.equal(await page.$$eval('[data-testid^="matter-stat"]',es=>es.reduce((n,e)=>n+Number(e.innerText.match(/\d+/)?.[0]),0)),1);await search.click({clickCount:3});await page.keyboard.press('Backspace');
 // Open one real case per available state; no writes or lifecycle transitions.
 for(const status of [...new Set(cases.map(c=>c.status))]){
  const c=cases.find(c=>c.status===status),action=expected[status];if(!action)continue;
  await page.goto('http://localhost:8081/matters',{waitUntil:'networkidle0'});await page.waitForSelector(`[data-testid="matter-${c.id}"]`);await page.$eval(`[data-testid="matter-${c.id}"] [role=button]`,e=>e.click());await page.waitForFunction(({id,screen})=>location.pathname.endsWith('/'+screen)&&new URLSearchParams(location.search).get('caseId')===id,{}, {id:c.id,screen:action[1]});
 }
 // Existing additional seeded advocates exercise real assigned and drafting work.
 for(const number of [3,4]){
  const r=await fetch('http://127.0.0.1:3001/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-advocate-${number}@legalitt.invalid`,password})});const auth=await r.json();assert.ok(r.ok);const rows=await list(auth.tokens.idToken);const context=await b.createBrowserContext();const other=await context.newPage();await other.setViewport({width:430,height:1000});await other.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify({...tokens,expiresAt:Date.now()+tokens.expiresIn*1000})),auth.tokens);await other.goto('http://localhost:8081/matters',{waitUntil:'networkidle0'});
  for(const c of rows){await other.waitForSelector(`[data-testid="matter-${c.id}"]`);const text=await other.$eval(`[data-testid="matter-${c.id}"]`,e=>e.innerText);if(expected[c.status])assert.ok(text.includes(expected[c.status][0]));}
  await other.screenshot({path:out+`/list-advocate-${number}.png`});evidence[`advocate${number}`]={name:auth.user.name,states:rows.map(c=>({reference:c.reference,status:c.status,action:expected[c.status]?.[0]??null}))};
  const drafting=rows.find(c=>c.status==='in_progress');
  if(drafting){await other.$eval(`[data-testid="matter-${drafting.id}"] [role=button]`,e=>e.click());await other.waitForFunction(id=>location.pathname.endsWith('/draft')&&new URLSearchParams(location.search).get('caseId')===id,{},drafting.id);evidence[`advocate${number}`].openedDraft=drafting.reference;}
  await context.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/evidence.json',JSON.stringify(evidence,null,2));console.log(JSON.stringify({total:cases.length,counts,filters:evidence.filters,errors},null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
