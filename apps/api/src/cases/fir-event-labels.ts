// Event labels for FIR timelines, the advocate's audit log (A6) and the latest
// note on the advocate's list card (A1). The client never sees the admin step or
// internal review events (C10); its own labels live in the flow service.
export const FIR_EVENT_LABELS: Record<string, string> = {
  fir_draft_saved: 'Draft saved', fir_draft_submitted: 'Sent to admin', fir_admin_returned: 'Admin returned the draft',
  fir_draft_approved: 'Admin approved', fir_sent_to_client: 'Sent to client', fir_client_approved: 'Client approved',
  fir_client_changes_requested: 'Client requested changes', fir_client_reminded: 'Client reminded',
  // Team timelines only (A6 audit log); the client's own timeline leaves it out.
  fir_client_viewed: 'Client viewed the draft',
  // History only: cases completed before the police step was removed (Q119, Q120).
  fir_police_submitted: 'Submitted to police',
  // Migration 202611130010: a case that waited for a police receipt completed on its client approval.
  fir_completed_on_client_approval: 'Completed on client approval',
  fir_advocate_reassigned: 'Advocate reassigned',
  fir_advocate_rejected: 'Advocate rejected · returned to admin', fir_released_to_client: 'Draft released to client · completed',
  fir_identity_reviewed: 'Identity document reviewed', fir_identity_replaced: 'Replacement identity uploaded',
  payment_captured: 'Payment received', case_cancelled: 'Request cancelled', refund_recorded: 'Refund recorded',
};
export const FIR_STATUS_LABELS: Record<string, string> = {
  submitted: 'Request submitted', paid: 'Payment received', assigned: 'Advocate assigned', advocate_accepted: 'Advocate accepted',
  advocate_declined: 'Advocate rejected · returned to admin', completed: 'Completed',
};
/** Why an advocate left a case, or was replaced, is appended for the admin only. */
export function firTeamEventLabel(e: {type: string; to_status: string | null; payload: unknown}, withReason: boolean): string | null {
  const p = (e.payload ?? {}) as {version?: number; reason?: string};
  const base = e.type === 'status_changed' ? FIR_STATUS_LABELS[e.to_status ?? ''] : FIR_EVENT_LABELS[e.type];
  if (!base) return null;
  return `${base}${p.version ? ` (v${p.version})` : ''}${p.reason && withReason ? `: ${p.reason}` : ''}`;
}
