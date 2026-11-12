const test=require('node:test'),assert=require('node:assert/strict');
require('reflect-metadata');
const {NestFactory}=require('@nestjs/core'),{Module}=require('@nestjs/common');
const {httpCorsOptions}=require('../dist/src/http-cors');

test('browser filing preflight permits PUT only from configured origins',async()=>{
 class BrowserContractModule{};Module({})(BrowserContractModule);
 const app=await NestFactory.create(BrowserContractModule,{logger:false});
 app.enableCors(httpCorsOptions(['https://legalitt-5.vercel.app']));
 await app.listen(0,'127.0.0.1');
 try{
  for(const origin of ['https://legalitt-5.vercel.app','https://untrusted.invalid']){
   const r=await fetch(await app.getUrl()+'/api/v1/notices/example/filing',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'PUT','Access-Control-Request-Headers':'authorization,content-type'}});
   assert.equal(r.status,204);
   if(origin==='https://untrusted.invalid'){assert.equal(r.headers.get('access-control-allow-origin'),null);continue;}
   assert.equal(r.headers.get('access-control-allow-origin'),origin);
   const methods=r.headers.get('access-control-allow-methods').split(',');
   for(const method of ['PUT','POST','PATCH','GET','DELETE'])assert.ok(methods.includes(method),method+' allowed');
   assert.match(r.headers.get('access-control-allow-headers'),/Authorization/i);
  }
 }finally{await app.close();}
});
