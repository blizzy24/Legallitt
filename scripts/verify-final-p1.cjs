// Live P1 endpoint and isolation checks (11 Nov 2026). Read-only except none; no payouts recorded.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{ApiClient}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',log=[],ok=(n,d='')=>{console.log('PASS',n,d);log.push({n,d});};
const deny=async(p,n)=>{await assert.rejects(p,e=>[401,403,404].includes(e.status),n);ok(n);};
(async()=>{
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={};
 for(const role of ['client','advocate','admin']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});const s=await r.json();
  api[role]=new ApiClient({baseUrl:base,fetch:require('./helpers/verification-fetch.cjs'),getTokens:async()=>s.tokens});}
 const {client:c,advocate:a,admin:d}=api;
 const w=await a.wallet('month');ok('advocate wallet',JSON.stringify(w).slice(0,140));
 await a.bankAccount();ok('advocate bank account (masked)');
 const v=await a.verification();ok('advocate verification state',JSON.stringify(v).slice(0,120));
 const p=await d.adminPayouts('pending');ok('admin payouts queue',`pending=${p.counts.pending}`);
 const q=await d.adminAdvocateApprovals();ok('admin advocate approvals queue',JSON.stringify(q).slice(0,100));
 const del=await d.adminAccountDeletions('open');ok('admin account deletions queue',`${del.items.length} open`);
 await deny(c.wallet('month'),'client cannot read a wallet');
 await deny(c.adminPayouts('pending'),'client cannot read payouts queue');
 await deny(a.adminPayouts('pending'),'advocate cannot read payouts queue');
 await deny(a.adminAdvocateApprovals(),'advocate cannot read approvals queue');
 await deny(c.adminAccountDeletions('open'),'client cannot read deletion queue');
 await deny(c.verification(),'client has no advocate verification');
 fs.writeFileSync(path.resolve('reports/final-2026-11-11/live-p1-verification.json'),JSON.stringify({checked_at:new Date().toISOString(),log},null,2)+'\n');
 console.log('ALL P1 LIVE CHECKS PASSED');
})().catch(e=>{console.error('FAIL',e.status??'',e.message);process.exitCode=1;});
