import type { AuthService } from '../auth/auth.service';
export const PHONE_AUTH = Symbol('PHONE_AUTH');
export type PhoneSession = Awaited<ReturnType<AuthService['login']>>;
export interface PhoneAuthPort {
  readonly responseMetadata: {simulated: boolean};
  request(body: unknown): Promise<{ requested: true; simulated: boolean }>;
  verify(body: unknown, signIn: (input: { email: string; password: string }) => Promise<PhoneSession>, secrets: string[]): Promise<PhoneSession & { simulated: boolean }>;
}
