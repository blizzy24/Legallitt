import {Worker} from 'node:worker_threads';
import {join} from 'node:path';
/** Bounded worker, no network/fonts/OCR and no extracted-text persistence. Only
 * specifically permitted supporting PDFs are passed here by the caller. */
export function extractAdvicePdf(bytes:Uint8Array):Promise<string>{return new Promise((resolve,reject)=>{
 const worker=new Worker(join(__dirname,'advice-extract-worker.js'),{workerData:bytes,resourceLimits:{maxOldGenerationSizeMb:128},stdout:true,stderr:true});let done=false;
 const finish=(error?:Error,text='')=>{if(done)return;done=true;clearTimeout(timer);void worker.terminate();error?reject(error):resolve(text);};
 const timer=setTimeout(()=>finish(new Error('Document text extraction timed out.')),10000);
 worker.once('message',value=>finish(undefined,typeof value==='string'?value:''));worker.once('error',()=>finish(new Error('Document text could not be extracted.')));worker.once('exit',code=>{if(!done)finish(new Error('Document text could not be extracted.'));});
});}
