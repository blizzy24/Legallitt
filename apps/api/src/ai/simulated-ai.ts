import { simulatedDraft } from '../demo/simulated-draft';
import type { AiPort, AiRequest, AiResults, AiTask } from './ai.port';
import { decodeResponse, validateRequest } from './ai-response';

export class SimulatedAi implements AiPort {
  async generate<T extends AiTask>(request:AiRequest<T>):Promise<AiResults[T]> {
    validateRequest(request);
    // Reuse the existing honest placeholder, not invented legal facts/remedies.
    // The demo timer continues using simulatedDraft directly, unchanged.
    const text=request.task==='subject' ? simulatedDraft.subject
      : request.task==='demands' ? JSON.stringify({options:[simulatedDraft.subject,simulatedDraft.facts]})
      : Object.values(simulatedDraft).filter(Boolean).join('\n\n');
    return decodeResponse(request.task,text,true);
  }
}
