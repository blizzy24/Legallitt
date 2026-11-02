// Synthetic external-provider smoke. No cases, users, documents or database reads.
// Explicitly run from apps/api after building:
// node --env-file=.env.local scripts/verify-ai.cjs
const fs=require('node:fs'),path=require('node:path');
const {NestFactory}=require('@nestjs/core');
const {AI}=require('../dist/src/ai/ai.port');
const {AiModule}=require('../dist/src/ai/ai.module');
const requests=[
  {task:'subject',prompt:'Synthetic adapter test. Write a short subject line about returning a borrowed blue umbrella. No people, case, or real dispute exists.'},
  {task:'demands',prompt:'Synthetic adapter test. Offer two distinct polite options for returning a borrowed blue umbrella. No people, case, or real dispute exists.'},
  {task:'notice',prompt:'Synthetic adapter test, not legal advice. Write a short clearly labelled fictional notice requesting return of a borrowed blue umbrella. No people, case, or real dispute exists. Do not invent names, dates, statutes, deadlines or amounts.'},
];
(async()=>{
  if(process.env.ENVIRONMENT!=='dev'||process.env.NODE_ENV==='production')throw new Error('This verification is dev-only');
  const evidence={at:new Date().toISOString(),requests,results:[],guards:[]};
  for(const mode of ['simulated','gemini','bedrock']){
    process.env.AI_MODE=mode;
    let app;
    try{
      app=await NestFactory.createApplicationContext(AiModule,{logger:false,abortOnError:false});
      const ai=app.get(AI);
      for(const request of requests){
        try{evidence.results.push({mode,task:request.task,result:await ai.generate(request)});console.log(`${mode} ${request.task}: passed`);}
        catch(error){evidence.results.push({mode,task:request.task,error:error.message});console.log(`${mode} ${request.task}: ${error.message}`);}
      }
    }catch(error){evidence.results.push({mode,startupError:error.message});console.log(`${mode} startup: ${error.message}`);}
    finally{if(app)await app.close();}
  }
  for(const env of [{ENVIRONMENT:'prod',NODE_ENV:'development'},{ENVIRONMENT:'dev',NODE_ENV:'production'}]){
    Object.assign(process.env,env,{AI_MODE:'gemini'});
    let app;
    try{app=await NestFactory.createApplicationContext(AiModule,{logger:false,abortOnError:false});evidence.guards.push({...env,rejected:false});}
    catch(error){evidence.guards.push({...env,rejected:true,error:error.message});}
    finally{if(app)await app.close();}
  }
  const directory=path.resolve(__dirname,'../../..','reports/ai-providers');fs.mkdirSync(directory,{recursive:true});
  fs.writeFileSync(path.join(directory,'verification.json'),JSON.stringify(evidence,null,2)+'\n');
  // Fail if a provider or guard did not meet the requested verification; keep
  // the evidence, including the actual external blocker, for review.
  if(evidence.results.some(r=>r.error||r.startupError)||evidence.guards.some(g=>!g.rejected))process.exitCode=1;
})().catch(error=>{console.error(error.message);process.exitCode=1;});
