import {z} from 'zod';
import type {CaseStatus} from './lifecycle';

/** D-12. Every service shares these rules; the API is the authority. */
export const CANCELLATION_REASONS = [
  {code: 'no_longer_needed', label: 'No longer need this service'},
  {code: 'handle_another_way', label: 'Want to handle the case another way'},
  {code: 'cost', label: 'Cost is not suitable'},
  {code: 'found_another_option', label: 'Found another option'},
  {code: 'other', label: 'Other'},
] as const;
export type CancellationReasonCode = typeof CANCELLATION_REASONS[number]['code'];

/** unpaid: cancel with nothing to refund. self_serve: paid, no advocate has
 *  accepted — cancelled immediately with a full refund. request: an advocate has
 *  accepted — Legalitt decides the refund. closed: delivered/completed/sent. */
export type CancellationMode = 'unpaid' | 'self_serve' | 'request' | 'closed' | 'ended';
export const UNPAID_CANCEL_STATES: readonly `${CaseStatus}`[] = ['draft', 'submitted', 'payment_pending'];
export const SELF_SERVE_CANCEL_STATES: readonly `${CaseStatus}`[] = ['paid', 'assigning', 'assigned', 'advocate_declined'];
export const REQUEST_CANCEL_STATES: readonly `${CaseStatus}`[] = ['advocate_accepted', 'in_progress', 'client_review', 'changes_requested', 'approved'];
export function cancellationMode(status: `${CaseStatus}`): CancellationMode {
  if (UNPAID_CANCEL_STATES.includes(status)) return 'unpaid';
  if (SELF_SERVE_CANCEL_STATES.includes(status)) return 'self_serve';
  if (REQUEST_CANCEL_STATES.includes(status)) return 'request';
  if (status === 'cancelled' || status === 'refunded') return 'ended';
  return 'closed';
}

export const CancellationInputSchema = z.strictObject({
  reason: z.enum(CANCELLATION_REASONS.map(r => r.code) as [CancellationReasonCode, ...CancellationReasonCode[]]).nullable().optional(),
  note: z.string().trim().max(1000).optional(),
  confirm: z.literal(true),
});
export const CancellationDecisionSchema = z.strictObject({
  decision: z.enum(['approve', 'decline']),
  refund_amount_paise: z.string().regex(/^\d{1,15}$/).optional(),
  reason: z.string().trim().min(3).max(1000),
  advocate_entitlement_paise: z.string().regex(/^\d{1,15}$/).nullable().optional(),
});

export type ApiRefund = {id: string; payment_id: string; amount_paise: string; reason: string; simulated: boolean; created_at: string};
export type ApiCancellationRequest = {
  id: string; mode: 'self_serve' | 'admin_review'; status: 'pending' | 'approved' | 'declined' | 'completed';
  reason: string | null; note: string | null; status_at_request: string; refundable_paise: string;
  refund_amount_paise: string | null; decision_reason: string | null; requested_at: string; decided_at: string | null;
};
export type CaseCancellation = {
  case_id: string; reference: string; service_code: string; status: `${CaseStatus}`;
  mode: CancellationMode; refundable_paise: string; message: string;
  request: ApiCancellationRequest | null; refunds: ApiRefund[];
};
export type AdminCancellationRow = ApiCancellationRequest & {
  case_id: string; reference: string; service_code: string; case_status: string;
  client: {id: string; name: string}; advocate: {id: string; name: string} | null;
  advocate_entitlement_paise: string | null; refunds: ApiRefund[];
};
