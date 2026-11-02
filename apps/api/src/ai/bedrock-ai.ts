import { BedrockRuntimeClient, ConverseCommand, type ConverseCommandOutput } from '@aws-sdk/client-bedrock-runtime';
import type { AiPort, AiRequest, AiResults, AiTask } from './ai.port';
import { decodeResponse, formatInstruction, validateRequest } from './ai-response';
import { AiProviderError, safeProviderMessage } from './ai-error';

export type BedrockConfig = { region:string; models:Record<AiTask,string> };
type Runtime = {send(command:ConverseCommand, options:{abortSignal:AbortSignal}):Promise<ConverseCommandOutput>;destroy():void};
export function validateBedrockConfig(config:BedrockConfig):void {
  if(config.region!=='ap-south-1') throw new Error('Bedrock AI must run in ap-south-1; cross-region routing is forbidden');
  for(const [task,model] of Object.entries(config.models)) {
    // Only direct foundation IDs. No inference-profile ARNs, prompt ARNs,
    // provisioned/custom-model ARNs, or geographic/global routing prefixes.
    if(!/^[a-z0-9-]+\.[a-z0-9][a-z0-9.:-]*$/.test(model)||/^(apac|us|eu|global|au|jp|in|ca)\./.test(model))
      throw new Error(`Bedrock ${task} model must be a direct foundation model ID; inference profiles and cross-region routing are forbidden`);
  }
}
export class BedrockAi implements AiPort {
  constructor(private readonly config:BedrockConfig, private readonly runtime:Runtime) { validateBedrockConfig(config); }
  static async create(config:BedrockConfig):Promise<BedrockAi> {
    validateBedrockConfig(config);
    const runtime=new BedrockRuntimeClient({region:config.region,
      endpoint:'https://bedrock-runtime.ap-south-1.amazonaws.com',maxAttempts:1});
    try { await runtime.config.credentials(); }
    catch { runtime.destroy(); throw new Error('AI_MODE=bedrock requires AWS credentials from the standard AWS credential chain'); }
    return new BedrockAi(config,runtime);
  }
  onModuleDestroy():void { this.runtime.destroy(); }
  async generate<T extends AiTask>(request:AiRequest<T>):Promise<AiResults[T]> {
    validateRequest(request);
    const model=this.config.models[request.task];
    let response:ConverseCommandOutput;
    try {
      response=await this.runtime.send(new ConverseCommand({modelId:model,
        system:[{text:formatInstruction(request.task)}],
        messages:[{role:'user',content:[{text:request.prompt}]}],
        inferenceConfig:{maxTokens:request.task==='notice'?4096:1024},
      }),{abortSignal:AbortSignal.timeout(60_000)});
    } catch(error) {
      const failure=error as {name?:string;message?:string;$metadata?:{requestId?:string}};
      throw new AiProviderError('Bedrock',model,request.task,failure.name??'RequestError',
        `ap-south-1: ${safeProviderMessage(failure.message??'Request failed',[request.prompt])}. No alternate region, model or inference profile was attempted.`,failure.$metadata?.requestId);
    }
    if(response.stopReason!=='end_turn') throw new AiProviderError('Bedrock',model,request.task,'IncompleteResponse',`No complete response: ${response.stopReason??'missing stop reason'}`);
    const text=response.output?.message?.content?.map(p=>'text' in p?p.text??'':'').join('')??'';
    try { return decodeResponse(request.task,text,false); }
    catch(error) { throw new AiProviderError('Bedrock',model,request.task,'InvalidResponse',(error as Error).message); }
  }
}
