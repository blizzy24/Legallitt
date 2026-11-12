// Docker Desktop's CloudFront TLS connection can fail while the Windows host works.
// Download the exact official ARM64 manifest, verify every digest, then docker load.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{Readable}=require('node:stream'),{pipeline}=require('node:stream/promises'),{createGunzip}=require('node:zlib'),{spawnSync}=require('node:child_process');
const root=path.resolve('reports/notice-polish-20261112/host-node');fs.mkdirSync(root,{recursive:true});
const hash=async file=>{const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))h.update(chunk);return 'sha256:'+h.digest('hex');};
async function main(){
 const token=(await (await fetch('https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/node:pull')).json()).token;
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.oci.image.index.v1+json, application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.list.v2+json, application/vnd.docker.distribution.manifest.v2+json'};
 const request=async suffix=>{const r=await fetch('https://registry-1.docker.io/v2/library/node/'+suffix,{headers,signal:AbortSignal.timeout(180000)});if(!r.ok)throw Error('Registry returned '+r.status);return r;};
 const index=await(await request('manifests/22-bookworm-slim')).json(),selected=index.manifests.find(x=>x.platform.os==='linux'&&x.platform.architecture==='arm64');if(!selected)throw Error('No ARM64 manifest');
 const manifestBytes=Buffer.from(await(await request('manifests/'+selected.digest)).arrayBuffer());if('sha256:'+crypto.createHash('sha256').update(manifestBytes).digest('hex')!==selected.digest)throw Error('Manifest digest mismatch');
 const manifest=JSON.parse(manifestBytes),download=async(digest,file)=>{
   if(fs.existsSync(file)&&await hash(file)===digest)return;
   for(let attempt=1;attempt<=3;attempt++){try{const r=await request('blobs/'+digest);await pipeline(Readable.fromWeb(r.body),fs.createWriteStream(file));if(await hash(file)!==digest)throw Error('Blob digest mismatch');return;}catch{console.log('Retry layer '+digest.slice(7,19)+' attempt '+attempt);}}
   throw Error('Could not fetch and verify layer '+digest.slice(7,19));
 };
 const configName=manifest.config.digest.slice(7)+'.json';await download(manifest.config.digest,path.join(root,configName));const config=JSON.parse(fs.readFileSync(path.join(root,configName)));if(config.architecture!=='arm64'||config.os!=='linux')throw Error('Wrong image architecture');
 const layers=[];for(const [i,layer]of manifest.layers.entries()){
   const dir=layer.digest.slice(7);fs.mkdirSync(path.join(root,dir),{recursive:true});const compressed=path.join(root,dir,'blob.gz'),file=path.join(root,dir,'layer.tar');await download(layer.digest,compressed);
   await pipeline(fs.createReadStream(compressed),createGunzip(),fs.createWriteStream(file));if(await hash(file)!==config.rootfs.diff_ids[i])throw Error('Uncompressed layer digest mismatch');layers.push(dir+'/layer.tar');console.log('Verified layer '+(i+1)+'/'+manifest.layers.length);
 }
 fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify([{Config:configName,RepoTags:['node:22-bookworm-slim'],Layers:layers}]));
 const archive=path.join(root,'node-arm64.tar'),tar=spawnSync('tar',['--force-local','-cf',archive,'-C',root,'manifest.json',configName,...layers],{stdio:'inherit',windowsHide:true});if(tar.status!==0)throw Error('Archive creation failed');
 const load=spawnSync('docker',['load','-i',archive],{stdio:'inherit',windowsHide:true});if(load.status!==0)throw Error('Docker load failed');
 console.log('Loaded official Node ARM64 manifest '+selected.digest);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
