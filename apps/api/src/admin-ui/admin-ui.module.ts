import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ADMIN_UI, type AdminUiPort } from './admin-ui.port';
import { SimulatedAdminUi } from './simulated-admin-ui';
import { SystemTrigger } from './system-trigger';

export function adminUiAdapter(prisma: PrismaService, trigger: SystemTrigger): AdminUiPort {
  const mode = process.env.ADMIN_UI_MODE ?? 'simulated';
  // Live: a real admin confirms delivery through the normal endpoint.
  if (mode === 'live') {
    if (!process.env.AUTH_CONFIG_SECRET_ARN) throw new Error('ADMIN_UI_MODE=live requires AUTH_CONFIG_SECRET_ARN for admin authentication');
    return {async confirmDelivery() { throw new Error('Delivery is confirmed by an admin, not simulated, when ADMIN_UI_MODE=live'); }};
  }
  if (mode !== 'simulated') throw new Error('ADMIN_UI_MODE must be simulated or live');
  return new SimulatedAdminUi(prisma, trigger);
}
@Module({providers: [SystemTrigger, {provide: ADMIN_UI, useFactory: adminUiAdapter, inject: [PrismaService, SystemTrigger]}], exports: [ADMIN_UI, SystemTrigger]})
export class AdminUiModule {}
