export const ADMIN_UI = Symbol('ADMIN_UI');
export interface AdminUiPort {
  dispatched(caseId: string): void;
}
