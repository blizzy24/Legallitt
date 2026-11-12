// Local acceptance environment. Real Nest handlers, PostgreSQL, PDF renderer and
// upload inspection; explicit in-memory object-storage and email test adapters.
// Existing demo authentication is used unchanged. Never contacts SES or S3.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createServer}=require('node:http'),{randomUUID,createHash}=require('node:crypto');
module.exports=async function start(){
 const url=new URL(process.env.DATABASE_URL);assert.ok(['127.0.0.1','localhost'].includes(url.hostname));assert.equal(url.pathname,'/legalitt_notice_local');assert.ok(!process.env.DATABASE_SECRET_ARN);
 process.env.AI_MODE='simulated';process.env.PAYMENTS_MODE='simulated';process.env.ENVIRONMENT='dev';process.env.DEMO_PROGRESSION='off';
 const origins=['http://localhost:8083','http://localhost:5174'],servers=[],objects=new Map(),caps=new Map(),sent=[];
 const cache='reports/notice-flow-20261112/local/storage-cache.json';
 if(fs.existsSync(cache))for(const entry of JSON.parse(fs.readFileSync(cache,'utf8'))){const bytes=Buffer.from(entry.bytes,'base64');objects.set(entry.key,{bytes,mime:entry.mime,version:randomUUID(),etag:createHash('sha256').update(bytes).digest('hex')});}
 const blob=createServer(async(req,res)=>{try{
   if(req.headers.origin&&!origins.includes(req.headers.origin)){res.writeHead(403).end();return;}
   if(req.headers.origin)res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
   if(req.method==='OPTIONS'){res.writeHead(204).end();return;}
   const cap=caps.get(req.url);if(!cap||Date.now()>cap.expires||req.method!==cap.method){res.writeHead(404).end();return;}
   if(req.method==='GET'){const object=objects.get(cap.key);if(!object){res.writeHead(404).end();return;}res.setHeader('Content-Type',object.mime);res.setHeader('Content-Disposition',`${cap.inline?'inline':'attachment'}; filename="test-document.pdf"`);res.end(object.bytes);return;}
   const chunks=[];let size=0;for await(const part of req){size+=part.length;if(size>27*1024*1024)throw Error('Too large');chunks.push(part);}
   const request=new Request('http://127.0.0.1/upload',{method:'POST',headers:{'Content-Type':req.headers['content-type']},body:Buffer.concat(chunks)}),form=await request.formData(),file=form.get('file');
   if(!file||file.size>cap.maxBytes){res.writeHead(400).end();return;}
   const bytes=Buffer.from(await file.arrayBuffer());objects.set(cap.key,{bytes,mime:cap.mime,version:randomUUID(),etag:createHash('sha256').update(bytes).digest('hex')});res.writeHead(204).end();
 }catch{res.writeHead(400).end('Local test upload failed');}});
 await new Promise(resolve=>blob.listen(0,'127.0.0.1',resolve));servers.push(blob);const blobBase=`http://127.0.0.1:${blob.address().port}`;
 const capability=(key,method,extra={})=>{const route='/'+randomUUID();caps.set(route,{key,method,expires:Date.now()+300000,...extra});return blobBase+route;};
 require('../../apps/api/node_modules/reflect-metadata');const {NestFactory}=require('../../apps/api/node_modules/@nestjs/core'),{AppModule}=require('../../apps/api/dist/src/app.module'),{DocumentStorage,stagingKey}=require('../../apps/api/dist/src/documents/document-storage'),{NOTICE_EMAIL}=require('../../apps/api/dist/src/cases/notice-email');
 const app=await NestFactory.create(AppModule,{logger:['error']});
 const storage=app.get(DocumentStorage);
 storage.upload=async(key,mime,maxBytes=25*1024*1024)=>({url:capability(stagingKey(key),'POST',{mime,maxBytes}),fields:{}});
 storage.head=async key=>{const o=objects.get(key);return o?{size:o.bytes.length,mime:o.mime,version:o.version,etag:o.etag}:null;};
 storage.read=async(key,info)=>{const o=objects.get(key);assert.ok(o&&o.version===info.version,'test storage version changed');return o.bytes;};
 storage.promote=async(key,info,mime)=>{const o=objects.get(stagingKey(key));assert.ok(o&&o.version===info.version);objects.set(key,{...o,mime,version:randomUUID()});};
 storage.download=async(key,filename,inline)=>capability(key,'GET',{inline});
 storage.discard=async(key,info)=>{if(objects.get(key)?.version===info.version)objects.delete(key);};storage.remove=async key=>{objects.delete(key);};
 app.get(NOTICE_EMAIL).assertReady=()=>{};
 app.get(NOTICE_EMAIL).send=async input=>{assert.ok(input.to.endsWith('.invalid'),'Only synthetic recipients in local walkthrough');sent.push({to:input.to,reference:input.reference,attemptId:input.attemptId,pdfBytes:input.pdf.length});return {messageId:'local-test-'+randomUUID(),simulated:true};};
 app.enableCors(require('../../apps/api/dist/src/http-cors').httpCorsOptions(origins));await app.listen(3003,'127.0.0.1');
 for(const [folder,port]of [['apps/mobile/dist/notice-verification',8083],['apps/admin/dist/notice-verification',5174]]){
   const root=path.resolve(folder),server=createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf','.wasm':'application/wasm'})[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));});
   await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));servers.push(server);
 }
 return {app,sent,objects,attach:async()=>{},async close(){await app.close();for(const server of servers)await new Promise(resolve=>server.close(resolve));}};
};
