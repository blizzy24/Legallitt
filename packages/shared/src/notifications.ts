import type { CaseStatus } from './lifecycle';
export type ApiNotification = {
  id: string; case_id: string | null; kind: string; title: string; body: string | null;
  created_at: string; read_at: string | null;
  case: {reference: string; status: CaseStatus} | null;
};
export type NotificationPage = {items: ApiNotification[]; next_cursor: string | null; unread_count: number};
export const NOTIFICATION_POLL_MS = 10_000;
/** Resolve against the case's current state, not the stale state when its alert was written. */
export function notificationDestination(row: ApiNotification, role: 'client' | 'advocate' | 'admin'): string | null {
  if (!row.case_id || !row.case) return null;
  const id = encodeURIComponent(row.case_id), status = row.case.status;
  if (role === 'admin') return `/legal-notices/${id}`;
  if (role === 'client') return `/legal-notice/${['dispatched','completed'].includes(status) ? 'delivery' : 'tracking'}?caseId=${id}`;
  const screen = ({assigned: 'fee', advocate_accepted: 'drafting', in_progress: 'draft',
    changes_requested: 'drafting', client_review: 'review', approved: 'final',
    dispatching: 'dispatch', dispatched: 'dispatch', completed: 'report'} as Partial<Record<CaseStatus, string>>)[status] ?? 'review';
  return `/advocate/notice/${id}/${screen}?caseId=${id}`;
}
