const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
test('Legal Advice routes mount behind auth and enforce roles before reaching persistence',async()=>{
 require('reflect-metadata');
 const {NestFactory}=require('@nestjs/core'),{AppModule}=require('../dist/src/app.module'),{AuthService}=require('../dist/src/auth/auth.service');
 const {LegalAdviceSettings}=require('../dist/src/consultations/legal-advice-settings');
 const app=await NestFactory.create(AppModule,{logger:false});let actor={id:randomUUID(),role:'client'};
 app.get(AuthService).identity=async()=>actor;
 app.get(LegalAdviceSettings).read=async()=>({version:1,config:{}});
 try{
  await app.listen(0,'127.0.0.1');const base=(await app.getUrl())+'/api/v1/consultations/legal-advice';
  const request=(path,method='GET',body,auth=true)=>fetch(base+path,{method,headers:{...(auth?{Authorization:'Bearer TEST'}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal((await request('/settings','GET',undefined,false)).status,401);
  assert.equal((await request('/settings')).status,200);
  assert.equal((await request('/settings','PATCH',{})).status,403);
  assert.equal((await request('/invitations')).status,403);
  assert.equal((await request('/'+randomUUID()+'/invitations','POST',{})).status,403);
  assert.equal((await request('/invitations/'+randomUUID()+'/decision','POST',{})).status,403);
  assert.equal((await request('/slots?date=invalid')).status,400);
  actor={...actor,role:'advocate'};
  assert.equal((await request('/slots?date=2026-11-20')).status,403);
  assert.equal((await request('/settings','PATCH',{})).status,403);
  actor={...actor,role:'admin'};
  assert.equal((await request('/settings','PATCH',{})).status,400);
 }finally{await app.close();}
});
