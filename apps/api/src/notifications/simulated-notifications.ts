import { appendCaseEvent } from '../cases/case-state-machine';
import type { Prisma } from '../generated/prisma/client';
import type { NotificationsPort, NotificationInput } from './notifications.port';
export class SimulatedNotifications implements NotificationsPort {
  async send(tx: Prisma.TransactionClient, input: NotificationInput) {
    const row = await tx.notification.create({data: {...input, channels: ['in_app'], simulated: true}});
    if (input.case_id) await appendCaseEvent(tx, {case_id: input.case_id, type: 'notification_created', source: 'simulated', payload: {notification_id: row.id}});
    return {id: row.id, simulated: true};
  }
}
