import { simulatedDraft } from '../demo/simulated-draft';
import { SIMULATED_NOTICE_SUBJECT, SIMULATED_NOTICE_DEMANDS } from '@legalitt/shared';
import type { AiPort, AiRequest, AiResults, AiTask } from './ai.port';
import { decodeResponse, validateRequest } from './ai-response';

export class SimulatedAi implements AiPort {
  async generate<T extends AiTask>(request:AiRequest<T>):Promise<AiResults[T]> {
    validateRequest(request);
    if(request.response_format==='property_wording'){
      const source=JSON.parse(request.prompt.split('\n').at(-1)??'{}');
      return decodeResponse(request.task,String(source.text??''),true);
    }
    if(request.task==='notice'&&request.response_format==='notice_sections'){
      const source=JSON.parse(request.prompt.split('\n').at(-1)??'{}');
      const text=JSON.stringify(Object.fromEntries(['sender','recipient','subject','facts','demand','closing'].map(key=>[key,String(source.current?.[key]??'')])));
      return decodeResponse(request.task,text,true);
    }
    // Reuse the existing honest placeholder, not invented legal facts/remedies.
    // The demo timer continues using simulatedDraft directly, unchanged.
    const text=request.task==='subject' ? SIMULATED_NOTICE_SUBJECT
      : request.task==='demands' ? JSON.stringify({options:SIMULATED_NOTICE_DEMANDS})
      : Object.values(simulatedDraft).filter(Boolean).join('\n\n');
    return decodeResponse(request.task,text,true);
  }
}
