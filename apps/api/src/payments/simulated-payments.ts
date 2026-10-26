import { createHash } from 'node:crypto';
import type { PaymentsPort } from './payments.port';
export class SimulatedPayments implements PaymentsPort {
  async capture(input: {idempotencyKey: string; totalPaise: bigint}) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {paymentId: 'pay_' + createHash('sha256').update(input.idempotencyKey).digest('hex').slice(0,24), simulated: true, source: 'simulated' as const};
  }
}
