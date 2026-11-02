/** Provider failures are explicit. Never attach requests, prompts or credentials
 * to an exception (they may reach application logs). */
export class AiProviderError extends Error {
  constructor(provider:string, model:string, task:string, code:string, detail:string, readonly requestId?:string) {
    super(`${provider} AI (${model}, task=${task}) ${code}: ${detail}`);
    this.name='AiProviderError';
  }
}
export function safeProviderMessage(message:string, secrets:string[]=[]):string {
  let value=message;
  for(const secret of secrets) if(secret) value=value.split(secret).join('[redacted]');
  return value.replace(/AIza[\w-]+/g,'[redacted]').slice(0,1500);
}
