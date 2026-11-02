import type { AiPort, AiRequest, AiResults, AiTask } from './ai.port';
import { decodeResponse, demandsJsonSchema, formatInstruction, validateRequest } from './ai-response';
import { AiProviderError, safeProviderMessage } from './ai-error';

type GeminiReply = {
  error?: {message?:string;status?:string};
  promptFeedback?: {blockReason?:string};
  candidates?: {finishReason?:string;content?:{parts?:{text?:string;thought?:boolean}[]}}[];
};
export type GeminiConfig = { apiKey:string; model:string; environment:string|undefined; nodeEnv:string|undefined };
export class GeminiAi implements AiPort {
  constructor(private readonly config:GeminiConfig, private readonly fetcher:typeof fetch=fetch) {
    if(config.environment!=='dev'||config.nodeEnv==='production') throw new Error('Gemini AI is development-only: ENVIRONMENT must be dev and NODE_ENV must not be production');
    if(!config.apiKey.trim()) throw new Error('AI_MODE=gemini requires GEMINI_API_KEY');
    if(!/^[a-zA-Z0-9._-]+$/.test(config.model)) throw new Error('GEMINI_MODEL must be a model ID, not a URL or path');
  }
  async generate<T extends AiTask>(request:AiRequest<T>):Promise<AiResults[T]> {
    validateRequest(request);
    const {apiKey,model}=this.config;
    let response:Response;
    try {
      response=await this.fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
        method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
        signal:AbortSignal.timeout(60_000),redirect:'error',
        body:JSON.stringify({
          systemInstruction:{parts:[{text:formatInstruction(request.task)}]},
          contents:[{role:'user',parts:[{text:request.prompt}]}],
          generationConfig:{maxOutputTokens:request.task==='notice'?4096:1024,
            ...(request.task==='demands'?{responseMimeType:'application/json',responseJsonSchema:demandsJsonSchema}:{})},
        }),
      });
    } catch(error) {
      const code=error instanceof Error?error.name:'TransportError';
      throw new AiProviderError('Gemini',model,request.task,code,'Request failed or timed out; no fallback was attempted');
    }
    let payload:GeminiReply;
    try { payload=await response.json() as GeminiReply; }
    catch { throw new AiProviderError('Gemini',model,request.task,`HTTP ${response.status}`,'Provider returned a non-JSON response'); }
    if(!response.ok) throw new AiProviderError('Gemini',model,request.task,payload.error?.status??`HTTP ${response.status}`,
      safeProviderMessage(payload.error?.message??'Request rejected',[apiKey,request.prompt]));
    const candidate=payload.candidates?.[0];
    if(payload.promptFeedback?.blockReason||candidate?.finishReason!=='STOP') {
      throw new AiProviderError('Gemini',model,request.task,'IncompleteResponse',
        `No complete response: ${payload.promptFeedback?.blockReason??candidate?.finishReason??'missing candidate'}`);
    }
    const text=candidate.content?.parts?.filter(p=>!p.thought).map(p=>p.text??'').join('')??'';
    try { return decodeResponse(request.task,text,false); }
    catch(error) { throw new AiProviderError('Gemini',model,request.task,'InvalidResponse',(error as Error).message); }
  }
}
