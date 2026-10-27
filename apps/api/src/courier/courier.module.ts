import { Module } from '@nestjs/common';
import { COURIER, type CourierPort } from './courier.port';
import { SimulatedCourier } from './simulated-courier';
export function courierAdapter(): CourierPort {
  const mode = process.env.COURIER_MODE ?? 'simulated';
  if (mode === 'live') throw new Error('COURIER_MODE=live requires carrier credentials and a live courier adapter; neither is configured');
  if (mode !== 'simulated') throw new Error('COURIER_MODE must be simulated or live');
  return new SimulatedCourier();
}
@Module({providers: [{provide: COURIER, useFactory: courierAdapter}], exports: [COURIER]})
export class CourierModule {}
