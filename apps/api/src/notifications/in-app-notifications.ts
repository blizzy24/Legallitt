import {redactPrivatePhones} from '@legalitt/shared';
import {counterpartPhones} from '../cases/contact-privacy';
import { appendCaseEvent } from '../cases/case-state-machine';
import { notificationCategory } from '@legalitt/shared';
import type { Prisma } from '../generated/prisma/client';
import type { NotificationInput, NotificationsPort, NotificationDeliveryPort } from './notifications.port';

/** The inbox is real regardless of how external delivery is configured. */
export class InAppNotifications implements NotificationsPort {
  constructor(private readonly delivery: NotificationDeliveryPort) {}
  async send(tx: Prisma.TransactionClient, input: NotificationInput) {
    const recipient=await tx.user.findUnique({where:{id:input.user_id},select:{id:true,role:true}});
    if(recipient&&input.case_id)input=redactPrivatePhones(input,await counterpartPhones(tx,recipient,input.case_id));
    // D-20/D-70: a quieted category still files the row (nothing is lost) but arrives read, so it raises no badge.
    const prefs = await tx.userPreference.findUnique({where: {user_id: input.user_id}, select: {notifications: true}});
    const service = input.case_id && prefs ? (await tx.case.findUnique({where: {id: input.case_id}, select: {service_code: true}}))?.service_code : null;
    const quiet = prefs && (prefs.notifications as Record<string, boolean>)[notificationCategory(input.kind, service)] === false;
    const row = await tx.notification.create({data: {...input, channels: ['in_app'], simulated: false, ...(quiet ? {read_at: new Date()} : {})}});
    if (input.case_id) await appendCaseEvent(tx, {case_id: input.case_id, type: 'notification_created', source: 'real',
      payload: {notification_id: row.id}});
    // Only outside delivery is simulated. A real inbox row must not make a human case look fake.
    const delivered = await this.delivery.send(input);
    return {id: row.id, simulated: delivered.simulated};
  }
}
