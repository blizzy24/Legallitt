export const ADMIN_UI = Symbol('ADMIN_UI');
/** The admin's delivery confirmation, for as long as no admin panel exists. */
export interface AdminUiPort {
  confirmDelivery(caseId: string): Promise<void>;
}
