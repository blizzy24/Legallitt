// FIR Draft full flow, end to end as client, advocate and admin
// (docs/flows/FIR-DRAFT-FLOW.md). Local by default: the candidate bundles in
// apps/*/dist/fir-verification, the local API on :3003 and the local database.
// Existing demo identities sign in through the UI; the password stays in memory.
// Synthetic TEST ONLY data, simulated payment. Screenshots go to
// docs/flows/fir-screens/built/.
//
//   node scripts/verify-fir-full-flow.cjs --fresh         full walk on a new request
//   FIR_DEPLOYED=1 node scripts/verify-fir-full-flow.cjs --fresh   the same walk on the live sites (deployed dev)
//   node scripts/verify-fir-full-flow.cjs --from=<stage>  resume at a stage (state.json keeps the case ids)
//   node scripts/verify-fir-full-flow.cjs --explore=client:/fir  print what a screen shows
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist');
const {PDFDocument,StandardFonts}=require('../apps/api/node_modules/pdf-lib');
const kit=require('./helpers/fir-walk-kit.cjs'),{delay,click,fill,text,noText,has,at,dump,shot,chooseFile,go}=kit;
process.loadEnvFile('apps/api/.env.local');
// Deployed mode drives the live sites and API; it never touches a database directly.
const deployed=process.env.FIR_DEPLOYED==='1';
const base=deployed?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3003';
const mobile=deployed?'https://legalitt-5.vercel.app':'http://localhost:8083',adminWeb=deployed?'https://legalitt-admin-panel.vercel.app':'http://localhost:5174';
const out=path.resolve('reports/fir-flow-2026-11-12',deployed?'deployed':'local'),shots=deployed?path.join(out,'screens'):path.resolve('docs/flows/fir-screens/built');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(shots,{recursive:true});
const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const statePath=path.join(out,'state.json'),state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{};
const save=()=>fs.writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');
// --fresh forgets the earlier case ids, so the walk starts a new request.
if(process.argv.includes('--fresh')){for(const key of Object.keys(state))delete state[key];save();}
const results=[],pass=(name,detail='')=>{results.push({name,detail});console.log('PASS',name,detail);};
const S=name=>path.join(shots,name+'.png');

async function pdf(name,lines,pages=1){
  const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);
  for(let p=0;p<pages;p++){const page=doc.addPage([595,842]);lines.forEach((l,i)=>page.drawText(l,{x:50,y:780-i*22,size:12,font}));page.drawText(`Page ${p+1} of ${pages}`,{x:50,y:60,size:10,font});}
  const file=path.join(out,name);fs.writeFileSync(file,await doc.save());return file;
}

/** A small valid PNG (a flat synthetic image) for the photo slot. */
function png(name,w=96,h=96){
  const zlib=require('node:zlib'),row=w*3+1,raw=Buffer.alloc(row*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const o=y*row+1+x*3;raw[o]=196;raw[o+1]=160;raw[o+2]=120;}
  const chunk=(type,data)=>{const body=Buffer.concat([Buffer.from(type),data]),len=Buffer.alloc(4),crc=Buffer.alloc(4);len.writeUInt32BE(data.length);crc.writeUInt32BE(zlib.crc32(body)>>>0);return Buffer.concat([len,body,crc]);};
  const head=Buffer.alloc(13);head.writeUInt32BE(w,0);head.writeUInt32BE(h,4);head[8]=8;head[9]=2;
  const file=path.join(out,name);fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));return file;
}

const STAGES=[];
const stage=(name,run)=>STAGES.push({name,run});

async function main(){
  if(!deployed)assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname),'local database only');
  const env=deployed?null:await require('./helpers/local-walkthrough.cjs')();
  let browser;const errors=[],pages={};
  try{
    const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={},users={};
    for(const role of ['client','advocate','advocate-2','admin']){
      const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});
      assert.equal(r.status,201,`${role} sign-in`);const s=await r.json();users[role]=s.user;
      api[role]=new ApiClient({baseUrl:base,fetch:require('./helpers/verification-fetch.cjs'),getTokens:async()=>s.tokens});
    }
    // Local fixture only: sign-in does not run the profile seed, so both demo
    // advocates get an approved local profile. Deployed profiles are never touched.
    if(!deployed){
      const db=await require('../apps/api/dist/src/database').createDatabaseClient();
      try{for(const role of ['advocate','advocate-2'])await db.advocateProfile.upsert({where:{user_id:users[role].id},create:{user_id:users[role].id,verification:'approved',city:'Indore'},update:{verification:'approved',city:'Indore'}});
        await require('../apps/api/dist/prisma/seed-pricing').seedConfirmedPricing(db);}finally{await db.$disconnect();}
    }
    browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:120000,args:['--use-fake-ui-for-media-stream']});
    const page=async role=>pages[role]??=await kit.signIn(browser,env,{role,email:`demo-${role}@legalitt.invalid`,password,mobile,adminWeb,errors});
    const ctx={api,users,page,env,state,save,pdf,png};

    const explore=arg('explore');
    if(explore){const [role,...rest]=explore.split(':'),p=await page(role);let n=0;
      for(const route of rest.join(':').split(',')){await go(p,(role==='admin'?adminWeb:mobile)+route);await delay(2500);await dump(p,'explore');await shot(p,path.join(out,`explore-${++n}.png`),{width:role==='admin'?1440:430});}
      return;}

    require('./helpers/fir-walk-stages.cjs')(stage,{...ctx,kit,S,pass,mobile,adminWeb,out,assert});
    const from=arg('from'),only=arg('only');let started=!from;
    for(const s of STAGES){
      if(s.name===from)started=true;
      if(!started||(only&&s.name!==only))continue;
      console.log(`\n=== ${s.name}`);
      try{await s.run();}
      catch(e){console.error(`FAIL at stage ${s.name}: ${e.message}`);
        for(const [role,p]of Object.entries(pages)){await dump(p,`${role} at failure`).catch(()=>{});await p.screenshot({path:path.join(out,`failure-${role}.png`)}).catch(()=>{});}
        throw e;}
    }
    const pageErrors=errors.filter(e=>!/ResizeObserver/.test(e.message));
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({checked_at:new Date().toISOString(),target:deployed?{api:base,mobile,admin:adminWeb}:'local',case:state,page_errors:pageErrors,results},null,2)+'\n');
    assert.deepEqual(pageErrors,[],'no uncaught page errors');
    console.log(`\nALL ${results.length} FIR FLOW CHECKS PASSED`);
  }finally{await browser?.close().catch(()=>{});env?.close();}
}
main().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
