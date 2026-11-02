import { InAppNotifications } from './in-app-notifications';
import { Module } from '@nestjs/common';
import { NOTIFICATIONS, type NotificationsPort } from './notifications.port';
import { SimulatedNotifications } from './simulated-notifications';
export function notificationsAdapter(): NotificationsPort {
  const mode = process.env.NOTIFY_MODE ?? 'simulated';
  if (mode === 'live') throw new Error('NOTIFY_MODE=live requires SNS/FCM credentials and a live notifications adapter; neither is configured');
  if (mode !== 'simulated') throw new Error('NOTIFY_MODE must be simulated or live');
  return new InAppNotifications(new SimulatedNotifications());
}
@Module({providers: [{provide: NOTIFICATIONS, useFactory: notificationsAdapter}], exports: [NOTIFICATIONS]})
export class NotificationsModule {}
