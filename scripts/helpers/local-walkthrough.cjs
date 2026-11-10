// Local verification only: serve the candidate bundles and API. The S3 relay
// forwards actual signed uploads without changing bucket CORS or browser security.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('node:http'),{spawn}=require('node:child_process'),{randomUUID}=require('node:crypto');
module.exports=async function start(){
 assert.ok(['localhost','127.0.0.1'].includes(new URL(process.env.DATABASE_URL).hostname));assert.ok(!process.env.DATABASE_SECRET_ARN);
 const servers=[],targets=new Map(),origins=['http://localhost:8083','http://localhost:5174'];
 const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
 for(const [folder,port]of [['apps/mobile/dist/fir-verification',8083],['apps/admin/dist/fir-verification',5174]]){
  const root=path.resolve(folder),server=createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));});
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));servers.push(server);
 }
 const relay=createServer(async(req,res)=>{try{
  // A signed PDF opened in a browser tab has no Origin header. The random
  // capability URL still resolves only to a signed target issued in this run.
  if(!origins.includes(req.headers.origin)&&!(req.method==='GET'&&!req.headers.origin)){res.writeHead(403).end();return;}
  if(req.headers.origin)res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204).end();return;}
  const target=targets.get(req.url);if(!target){res.writeHead(404).end();return;}
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const response=await fetch(target,{method:req.method,headers:req.headers['content-type']?{'Content-Type':req.headers['content-type']}:{},...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
  res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')??'application/octet-stream'});res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(502).end('Local verification storage relay failed');}});
 const relayPort=await listen(relay);servers.push(relay);
 const api=spawn(process.execPath,['dist/src/main.js'],{cwd:path.resolve('apps/api'),env:{...process.env,PORT:'3003',CORS_ORIGINS:origins.join(',')},stdio:'ignore',windowsHide:true});
 for(let i=0;i<60;i++){if(api.exitCode!==null)throw new Error('Local API failed to start');try{if((await fetch('http://127.0.0.1:3003/health')).ok)break;}catch{}await new Promise(r=>setTimeout(r,1000));}
 return {async attach(page){await page.setRequestInterception(true);page.on('request',async req=>{
  if(!req.url().startsWith('http://127.0.0.1:3003/api/v1/documents/')||!(/\/presign$/.test(req.url())||/\/url$/.test(req.url()))||req.method()==='OPTIONS'){await req.continue();return;}
  try{const response=await fetch(req.url(),{method:req.method(),headers:req.headers(),...(req.postData()?{body:req.postData()}:{})}),body=await response.json();
   const object=body.upload??body;if(response.ok&&typeof object.url==='string'&&new URL(object.url).hostname.endsWith('.amazonaws.com')){const key='/'+randomUUID();targets.set(key,object.url);object.url=`http://127.0.0.1:${relayPort}${key}`;}
   await req.respond({status:response.status,contentType:'application/json',headers:{'Access-Control-Allow-Origin':new URL(page.url()).origin},body:JSON.stringify(body)});
  }catch{await req.abort('failed');}
 });},close(){api.kill();for(const server of servers)server.close();}};
};
