export const PAYMENTS = Symbol('PAYMENTS');
export interface PaymentsPort {
  capture(input: {idempotencyKey: string; totalPaise: bigint}): Promise<{paymentId: string; simulated: boolean; source: 'real' | 'simulated'}>;
}
