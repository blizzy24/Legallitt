import { z } from 'zod';
import type { AiRequest, AiResults, AiTask } from './ai.port';

const requestSchema = z.strictObject({task:z.enum(['subject','demands','notice']),prompt:z.string().trim().min(1)});
const optionsSchema = z.strictObject({options:z.array(z.string().trim().min(1)).min(2)});
export const demandsJsonSchema = {
  type:'object', properties:{options:{type:'array',items:{type:'string'},minItems:2}},
  required:['options'], additionalProperties:false,
};
export function validateRequest(request: AiRequest): void {
  if (!requestSchema.safeParse(request).success) throw new Error('AI request requires a supported task and a non-empty prompt');
}
export function formatInstruction(task: AiTask): string {
  return task === 'demands'
    ? 'Return only a JSON object with an options array containing at least two distinct non-empty strings. No markdown fences or surrounding prose.'
    : 'Return only the requested text. Do not invent facts absent from the prompt.';
}
export function decodeResponse<T extends AiTask>(task:T, text:string, simulated:boolean): AiResults[T] {
  if (task === 'demands') {
    let parsed:unknown;
    try { parsed=JSON.parse(text); } catch { throw new Error('AI returned invalid JSON for demand options'); }
    const result=optionsSchema.safeParse(parsed);
    if (!result.success) throw new Error('AI must return at least two non-empty demand options in an options array');
    if (new Set(result.data.options).size !== result.data.options.length) throw new Error('AI returned duplicate demand options');
    return {...result.data,simulated} as AiResults[T];
  }
  if (!text.trim()) throw new Error('AI returned an empty text response');
  return {text:text.trim(),simulated} as AiResults[T];
}
