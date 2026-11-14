const {test}=require('node:test'),assert=require('node:assert/strict');
const {adviceSessionAction:act,reconcileAdviceSession:tick,adviceElapsed}=require('../dist/src/consultations/legal-advice-session');
const {TestCallProvider}=require('../dist/src/consultations/call-provider');
const config={session_minutes:30,maximum_pause_minutes:10,join_before_minutes:10};
const start=Date.parse('2026-11-20T10:00:00Z'),slot=new Date(start).toISOString();
const fresh=()=>({state:'waiting',elapsed_ms:0});
const joined=()=>act(act(fresh(),config,slot,'client','join',start),config,slot,'advocate','join',start);
test('test call adapter explicitly transmits no media',async()=>{const r=await new TestCallProvider().room('booking');assert.equal(r.simulated,true);assert.equal(r.media_available,false);assert.match(r.label,/not transmitted/);});
test('both parties join; early join cannot consume paid minutes',()=>{
 assert.throws(()=>act(fresh(),config,slot,'client','join',start-600001),{status:409});
 const one=act(fresh(),config,slot,'client','join',start-600000);assert.equal(one.state,'waiting');
 const both=act(one,config,slot,'advocate','join',start-300000);assert.equal(both.started_at,slot);assert.equal(adviceElapsed(both,start-1),0);
});
test('server timer pauses, preserves remaining duration and automatically ends exactly at expiry',()=>{
 const paused=act(joined(),config,slot,'advocate','pause',start+600000);assert.equal(paused.elapsed_ms,600000);
 assert.equal(adviceElapsed(paused,start+900000),600000);
 const resumed=act(paused,config,slot,'advocate','resume',start+900000);
 assert.equal(tick(resumed,config,start+2099999).state,'active');
 const ended=tick(resumed,config,start+2100000);assert.equal(ended.state,'completed');assert.equal(ended.elapsed_ms,1800000);assert.equal(ended.ended_by,'timeout');
 assert.throws(()=>act(ended,config,slot,'client','join',start+2100001),{status:409});
});
test('only advocate pauses; only client ends; pause timeout interrupts rather than completing',()=>{
 const s=joined();assert.throws(()=>act(s,config,slot,'advocate','end',start+1),{status:403});
 assert.throws(()=>act(s,config,slot,'client','pause',start+1),{status:403});
 const ended=act(s,config,slot,'client','end',start+1000);assert.equal(ended.ended_by,'client');assert.equal(ended.elapsed_ms,1000);
 const paused=act(s,config,slot,'advocate','pause',start+1000);
 assert.equal(tick(paused,config,start+600999).state,'paused');
 const interrupted=tick(paused,config,start+601000);assert.equal(interrupted.state,'interrupted');assert.equal(interrupted.elapsed_ms,1000);
 assert.throws(()=>act(paused,config,slot,'advocate','resume',start+601000),{status:409});
});
