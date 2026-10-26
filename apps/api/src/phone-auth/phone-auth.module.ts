import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PHONE_AUTH, type PhoneAuthPort } from './phone-auth.port';
import { SimulatedPhoneAuth } from './simulated-phone-auth';
export function phoneAuthAdapter(prisma: PrismaService): PhoneAuthPort {
  const mode = process.env.PHONE_AUTH_MODE ?? 'simulated';
  // `demo` is the existing §2.9 spelling; both select the same adapter.
  if (mode === 'live') throw new Error('PHONE_AUTH_MODE=live requires DLT/SMS credentials and a live phone-auth adapter; neither is configured');
  if (!['simulated', 'demo'].includes(mode)) throw new Error('PHONE_AUTH_MODE must be simulated, demo or live');
  if (process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'prod') throw new Error('Simulated phone auth is forbidden in production (§2.9)');
  return new SimulatedPhoneAuth(prisma);
}
@Module({providers: [{provide: PHONE_AUTH, useFactory: phoneAuthAdapter, inject: [PrismaService]}], exports: [PHONE_AUTH]})
export class PhoneAuthModule {}
