import { BedrockRuntimeClient, ConverseCommand, type ConverseCommandOutput } from '@aws-sdk/client-bedrock-runtime';
import type { AiPort, AiRequest, AiResults, AiTask } from './ai.port';
import { decodeResponse, formatInstruction, validateRequest } from './ai-response';
import { AiProviderError, safeProviderMessage } from './ai-error';

export type BedrockConfig = { region:string; models:Record<AiTask,string> };
type Runtime = {send(command:ConverseCommand, options:{abortSignal:AbortSignal}):Promise<ConverseCommandOutput>;destroy():void};
// GetInferenceProfile audited 2026-11-02: these three definitions contain only
// Mumbai and Hyderabad. Explicit IDs, not a blanket allowance of any profile.
// Sonnet stays configurable for the day the client's AWS Sales request succeeds.
const indiaProfiles=new Set([
  'in.anthropic.claude-haiku-4-5-20251001-v1:0',
  'in.anthropic.claude-sonnet-5',
  'in.anthropic.claude-opus-5',
]);
export function validateBedrockConfig(config:BedrockConfig):void {
  if(config.region!=='ap-south-1') throw new Error('Bedrock AI calls must originate in ap-south-1; client data must stay in India');
  for(const [task,model] of Object.entries(config.models)) {
    if(indiaProfiles.has(model)) continue;
    // Direct foundation IDs remain supported. Unreviewed profiles, ARNs,
    // and all geographic/global profiles that can leave India are rejected.
    if(!/^[a-z0-9-]+\.[a-z0-9][a-z0-9.:-]*$/.test(model)||/^(apac|us|eu|global|au|jp|in|ca)\./.test(model))
      throw new Error(`Bedrock ${task} model must be a direct foundation model ID or an approved India-only profile; other routing is forbidden`);
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
