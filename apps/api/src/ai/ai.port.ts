export const AI = Symbol('AI');
export type AiTask = 'subject' | 'demands' | 'notice';
export type AiRequest<T extends AiTask = AiTask> = { task: T; prompt: string; response_format?: 'notice_sections' };
export type AiResults = {
  subject: { text: string; simulated: boolean };
  demands: { options: string[]; simulated: boolean };
  notice: { text: string; simulated: boolean };
};
/** The task discriminates the response at compile time; no caller splits prose
 * into demand options or knows the selected provider. No case writes live here. */
export interface AiPort {
  generate<T extends AiTask>(request: AiRequest<T>): Promise<AiResults[T]>;
}
