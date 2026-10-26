import type { Prisma } from '../generated/prisma/client';
export const NOTIFICATIONS = Symbol('NOTIFICATIONS');
export type NotificationInput = {user_id: string; case_id?: string; kind: string; title: string; body?: string};
export interface NotificationsPort {
  send(tx: Prisma.TransactionClient, input: NotificationInput): Promise<{id: string; simulated: boolean}>;
}
