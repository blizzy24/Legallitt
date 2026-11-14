import {parentPort,workerData} from 'node:worker_threads';
void(async()=>{const {extractText}=await import('unpdf');const result=await extractText(new Uint8Array(workerData),{mergePages:true});parentPort!.postMessage(String(result.text).slice(0,30000));})().catch(()=>process.exit(1));
