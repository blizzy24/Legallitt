import { Module } from '@nestjs/common';
import { PAYMENTS, type PaymentsPort } from './payments.port';
import { SimulatedPayments } from './simulated-payments';
export function paymentsAdapter(): PaymentsPort {
  const mode = process.env.PAYMENTS_MODE ?? 'simulated';
  if (mode === 'live') throw new Error('PAYMENTS_MODE=live requires Razorpay credentials and a live payments adapter; neither is configured');
  if (mode !== 'simulated') throw new Error('PAYMENTS_MODE must be simulated or live');
  return new SimulatedPayments();
}
@Module({providers: [{provide: PAYMENTS, useFactory: paymentsAdapter}], exports: [PAYMENTS]})
export class PaymentsModule {}
