// Temporary loopback-only build proxy for Docker Desktop download failures.
// TLS remains end-to-end; only public dependency hosts are permitted. No logging
// of URLs, headers, payloads or credentials. No application traffic uses it.
const http=require('node:http'),net=require('node:net');
const allowed=host=>['debian.org','npmjs.org','nodejs.org','prisma.sh','pki.rds.amazonaws.com'].some(d=>host===d||host.endsWith('.'+d));
const server=http.createServer((req,res)=>{
 let url;try{url=new URL(req.url);}catch{res.writeHead(400).end();return;}
 if(url.protocol!=='http:'||!allowed(url.hostname)||!['GET','HEAD'].includes(req.method)){res.writeHead(403).end();return;}
 const upstream=http.request(url,{method:req.method,headers:{...req.headers,connection:'close'},family:4},reply=>{res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);});
 upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502);res.end();});req.pipe(upstream);
});
server.on('connect',(req,socket,head)=>{
 const [host,port]=req.url.split(':');if(port!=='443'||!allowed(host)){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return;}
 const upstream=net.connect({host,port:443,family:4},()=>{socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');if(head.length)upstream.write(head);upstream.pipe(socket);socket.pipe(upstream);});
 upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy());socket.on('close',()=>upstream.destroy());
});
server.listen(3017,'127.0.0.1',()=>console.log('Temporary public-dependency build proxy on loopback :3017'));
