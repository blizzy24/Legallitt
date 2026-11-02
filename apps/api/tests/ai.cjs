const test=require('node:test'), assert=require('node:assert/strict');
const {NestFactory}=require('@nestjs/core');
const {AiModule,aiAdapter}=require('../dist/src/ai/ai.module');
const {AI}=require('../dist/src/ai/ai.port');
const {SimulatedAi}=require('../dist/src/ai/simulated-ai');
const {GeminiAi}=require('../dist/src/ai/gemini-ai');
const {BedrockAi,validateBedrockConfig}=require('../dist/src/ai/bedrock-ai');
const {simulatedDraft}=require('../dist/src/demo/simulated-draft');
const tasks=['subject','demands','notice'];
const geminiConfig={apiKey:'test-key-not-real',model:'gemini-3.5-flash-lite',environment:'dev',nodeEnv:'test'};
const bedrockConfig={region:'ap-south-1',models:{subject:'amazon.nova-lite-v1:0',demands:'amazon.nova-lite-v1:0',notice:'anthropic.claude-3-5-sonnet-20240620-v1:0'}};
const resultText=task=>task==='demands'?JSON.stringify({options:['First synthetic option','Second synthetic option']}):'Synthetic response';
async function withEnv(values,work) {
  const old=Object.fromEntries(Object.keys(values).map(k=>[k,process.env[k]]));
  try {for(const [k,v]of Object.entries(values)){if(v===undefined)delete process.env[k];else process.env[k]=v;}return await work();}
  finally{for(const[k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
}
test('AI default registration is simulated and preserves task-specific shapes',async()=>{
  await withEnv({AI_MODE:undefined},async()=>{
    const app=await NestFactory.createApplicationContext(AiModule,{logger:false,abortOnError:false});
    try {
      const ai=app.get(AI);assert.ok(ai instanceof SimulatedAi);
      assert.deepEqual(await ai.generate({task:'subject',prompt:'synthetic'}),{text:simulatedDraft.subject,simulated:true});
      assert.deepEqual(await ai.generate({task:'demands',prompt:'synthetic'}),{options:[simulatedDraft.subject,simulatedDraft.facts],simulated:true});
      assert.deepEqual(await ai.generate({task:'notice',prompt:'synthetic'}),{text:Object.values(simulatedDraft).filter(Boolean).join('\n\n'),simulated:true});
      await assert.rejects(ai.generate({task:'subject',prompt:' '}),/non-empty prompt/);
      await assert.rejects(ai.generate({task:'unknown',prompt:'synthetic'}),/supported task/);
    }finally{await app.close();}
  });
});
test('Gemini refuses registration outside dev, in production, or without credentials',async()=>{
  for(const environment of [undefined,'prod','staging']) {
    await withEnv({AI_MODE:'gemini',ENVIRONMENT:environment,NODE_ENV:'test',GEMINI_API_KEY:'test-key'},async()=>{
      await assert.rejects(NestFactory.createApplicationContext(AiModule,{logger:false,abortOnError:false}),/development-only/);
    });
  }
  await withEnv({AI_MODE:'gemini',ENVIRONMENT:'dev',NODE_ENV:'production',GEMINI_API_KEY:'test-key'},async()=>{
    await assert.rejects(aiAdapter(),/development-only/);
  });
  await withEnv({AI_MODE:'gemini',ENVIRONMENT:'dev',NODE_ENV:'test',GEMINI_API_KEY:undefined},async()=>{
    await assert.rejects(NestFactory.createApplicationContext(AiModule,{logger:false,abortOnError:false}),/requires GEMINI_API_KEY/);
  });
  await withEnv({AI_MODE:'live'},async()=>{await assert.rejects(aiAdapter(),/simulated, gemini or bedrock/);});
});
test('Gemini calls fixed Google host with structured options and no key in URL',async()=>{
  const calls=[];
  for(const task of tasks){
    const ai=new GeminiAi(geminiConfig,async(url,init)=>{
      calls.push({url,init});
      return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'Do not return hidden thought'},{text:resultText(task)}]}}]});
    });
    const result=await ai.generate({task,prompt:'Synthetic prompt'});
    assert.equal(result.simulated,false);
    if(task==='demands'){assert.deepEqual(result.options,['First synthetic option','Second synthetic option']);assert.equal(result.text,undefined);}
    else assert.equal(result.text,'Synthetic response');
    const {url,init}=calls.at(-1),body=JSON.parse(init.body);
    assert.equal(url,'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent');
    assert.equal(init.headers['x-goog-api-key'],'test-key-not-real');assert.equal(init.redirect,'error');
    assert.equal(body.contents[0].parts[0].text,'Synthetic prompt');
    assert.equal(body.generationConfig.responseMimeType,task==='demands'?'application/json':undefined);
    if(task==='demands')assert.equal(body.generationConfig.responseJsonSchema.properties.options.minItems,2);
  }
  assert.equal(calls.length,3);
});
test('Gemini errors are actionable, redact credentials/prompts, and never fall back',async()=>{
  let calls=0;
  const ai=new GeminiAi(geminiConfig,async()=>{calls++;return Response.json({error:{status:'RESOURCE_EXHAUSTED',message:'quota: test-key-not-real Synthetic private prompt'}},{status:429});});
  await assert.rejects(ai.generate({task:'subject',prompt:'Synthetic private prompt'}),e=>{
    assert.match(e.message,/RESOURCE_EXHAUSTED.*quota/);assert.ok(!e.message.includes(geminiConfig.apiKey));assert.ok(!e.message.includes('Synthetic private prompt'));return true;
  });assert.equal(calls,1);
  for(const payload of [{promptFeedback:{blockReason:'SAFETY'}},{candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'partial'}]}}]}]){
    await assert.rejects(new GeminiAi(geminiConfig,async()=>Response.json(payload)).generate({task:'notice',prompt:'test'}),/IncompleteResponse/);
  }
  for(const text of ['plain prose','{"options":["one"]}','{"options":["one",""]}','{"options":["same","same"]}']){
    const ai=new GeminiAi(geminiConfig,async()=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]}));
    await assert.rejects(ai.generate({task:'demands',prompt:'test'}),/InvalidResponse/);
  }
});
test('Bedrock stays in Mumbai, rejects routing profiles, and uses independent task models',async()=>{
  assert.throws(()=>validateBedrockConfig({...bedrockConfig,region:'us-east-1'}),/ap-south-1/);
  for(const model of ['apac.amazon.nova-lite-v1:0','global.anthropic.claude-sonnet','arn:aws:bedrock:ap-south-1:123:inference-profile/example','https://elsewhere/model']){
    assert.throws(()=>validateBedrockConfig({...bedrockConfig,models:{...bedrockConfig.models,subject:model}}),/direct foundation model ID/);
  }
  const config={...bedrockConfig,models:{subject:'amazon.subject-model:0',demands:'amazon.demands-model:0',notice:'anthropic.notice-model:0'}};
  const calls=[];let task,closed=false;
  const ai=new BedrockAi(config,{async send(command,options){calls.push(command.input);assert.ok(options.abortSignal);return{stopReason:'end_turn',output:{message:{content:[{text:resultText(task)}]}}};},destroy(){closed=true;}});
  for(task of tasks){const result=await ai.generate({task,prompt:'Synthetic prompt'});assert.equal(result.simulated,false);assert.equal(calls.at(-1).modelId,config.models[task]);if(task==='demands')assert.equal(result.options.length,2);else assert.equal(result.text,'Synthetic response');}
  assert.equal(calls.length,3);ai.onModuleDestroy();assert.equal(closed,true);
});
test('Bedrock exposes region/model rejection and does not retry with another model',async()=>{
  let calls=0;
  const ai=new BedrockAi(bedrockConfig,{async send(){calls++;throw Object.assign(new Error('On-demand throughput is not supported'),{name:'ValidationException',$metadata:{requestId:'synthetic-id'}});},destroy(){}});
  await assert.rejects(ai.generate({task:'notice',prompt:'Synthetic prompt'}),e=>{
    assert.match(e.message,/ap-south-1.*On-demand throughput is not supported/);assert.match(e.message,/No alternate region, model or inference profile/);assert.equal(e.requestId,'synthetic-id');return true;
  });assert.equal(calls,1);
  await assert.rejects(new BedrockAi(bedrockConfig,{async send(){return{stopReason:'max_tokens'};},destroy(){}}).generate({task:'notice',prompt:'test'}),/IncompleteResponse/);
});
test('Bedrock missing AWS credentials fails module registration',()=>{
  const {spawnSync}=require('node:child_process'),{mkdtempSync,writeFileSync,rmSync}=require('node:fs'),{tmpdir}=require('node:os'),path=require('node:path');
  const dir=mkdtempSync(path.join(tmpdir(),'legalitt-ai-no-credentials-'));const empty=path.join(dir,'empty');writeFileSync(empty,'');
  try {
    const env={...process.env};for(const k of Object.keys(env))if(k.startsWith('AWS_'))delete env[k];
    Object.assign(env,{AI_MODE:'bedrock',AWS_REGION:'ap-south-1',AWS_EC2_METADATA_DISABLED:'true',AWS_SHARED_CREDENTIALS_FILE:empty,AWS_CONFIG_FILE:empty});
    const run=spawnSync(process.execPath,['-e',`require('./dist/src/ai/ai.module').aiAdapter().then(()=>{process.exitCode=2},e=>{console.log(e.message);process.exitCode=1})`],{cwd:path.resolve(__dirname,'..'),env,encoding:'utf8',timeout:15000});
    assert.equal(run.status,1);assert.match(run.stdout,/AI_MODE=bedrock requires AWS credentials/);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('AI port compile-time contract gives demand options and text only for text tasks',()=>{
  const ts=require('typescript'),path=require('node:path');
  const program=ts.createProgram([path.join(__dirname,'types/ai.ts')],{strict:true,noEmit:true,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.NodeNext,moduleResolution:ts.ModuleResolutionKind.NodeNext,skipLibCheck:true});
  const diagnostics=ts.getPreEmitDiagnostics(program);
  assert.deepEqual(diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')),[]);
});
