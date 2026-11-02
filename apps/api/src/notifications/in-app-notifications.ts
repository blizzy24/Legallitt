import { appendCaseEvent } from '../cases/case-state-machine';
import type { Prisma } from '../generated/prisma/client';
import type { NotificationInput, NotificationsPort, NotificationDeliveryPort } from './notifications.port';

/** The inbox is real regardless of how external delivery is configured. */
export class InAppNotifications implements NotificationsPort {
  constructor(private readonly delivery: NotificationDeliveryPort) {}
  async send(tx: Prisma.TransactionClient, input: NotificationInput) {
    const row = await tx.notification.create({data: {...input, channels: ['in_app'], simulated: false}});
    if (input.case_id) await appendCaseEvent(tx, {case_id: input.case_id, type: 'notification_created', source: 'real',
      payload: {notification_id: row.id}});
    // Only outside delivery is simulated. A real inbox row must not make a human case look fake.
    const delivered = await this.delivery.send(input);
    return {id: row.id, simulated: delivered.simulated};
  }
}
