import type { NotificationDeliveryPort, NotificationInput } from './notifications.port';
/** No SNS, FCM, SMS or email call. The in-app writer has already persisted the notification. */
export class SimulatedNotifications implements NotificationDeliveryPort {
  async send(_input: NotificationInput) { return {simulated: true}; }
}
