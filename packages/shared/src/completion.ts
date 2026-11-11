import {z} from 'zod';
import type {ServiceCode} from './services';

/** D-07: the advocate's view of a finished case. */
export type AdvocateCompletion = {
  service_code: ServiceCode; reference: string; status: string; completed: boolean; completed_at: string | null;
  delivery: {delivered_at: string | null; received_by: string | null; carrier: string | null; waybill: string | null} | null;
  documents: {id: string; filename: string; mime_type: string; page_count: number | null; simulated: boolean; label: string}[];
  /** Sum of advocate_entitlement_paise from captured client price snapshots; null when none recorded. */
  entitlement_paise: string | null;
  /** False when a captured payment predates snapshots, so the sum may be incomplete. */
  entitlement_complete: boolean;
};

/** D-24/D-85: admin decision on an account deletion request. Never erases data in this build. */
export const AdminDeletionDecisionSchema = z.strictObject({
  decision: z.enum(['complete', 'reactivate']),
  note: z.string().trim().min(3).max(1000),
});
export type AdminDeletionRow = {
  id: string; status: string; reason: string | null; requested_at: string; decided_at: string | null; decision_note: string | null;
  user: {id: string; name: string; email: string | null; phone: string | null; role: string | null; account_status: string | null};
  cases: {id: string; reference: string; service_code: string; status: string}[];
  blockers: {id: string; reference: string; service_code: string; status: string}[];
};

/** D-07 wording per service; "Delivered" is true only for Legal Notice delivery. */
export function completionHeadline(service: ServiceCode) {
  if (service === 'legal_notice') return 'Delivered — case complete';
  if (service === 'fir_draft') return 'Draft approved and released — case complete';
  if (['property_search', 'document_forensic', 'court_marriage'].includes(service)) return 'Report released — case complete';
  if (service === 'legal_advice') return 'Brief approved — consultation complete';
  return 'Case complete';
}
