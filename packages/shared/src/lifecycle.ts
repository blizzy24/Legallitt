// Canonical lifecycle from architecture §4.2 and §4.3.
export enum CaseStatus {
  draft = 'draft',
  submitted = 'submitted',
  payment_pending = 'payment_pending',
  paid = 'paid',
  assigning = 'assigning',
  assigned = 'assigned',
  advocate_accepted = 'advocate_accepted',
  advocate_declined = 'advocate_declined',
  in_progress = 'in_progress',
  client_review = 'client_review',
  changes_requested = 'changes_requested',
  approved = 'approved',
  dispatching = 'dispatching',
  dispatched = 'dispatched',
  completed = 'completed',
  cancelled = 'cancelled',
  refunded = 'refunded',
}

export type CaseBucket = 'active' | 'pending' | 'closed';

export const ADMIN_CASE_BUCKETS = ['open', 'pending', 'in_progress', 'completed', 'closed'] as const;
export type AdminCaseBucket = typeof ADMIN_CASE_BUCKETS[number];
export const ADMIN_CASE_BUCKET_LABELS: Record<AdminCaseBucket, string> = {
  open: 'Open', pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', closed: 'Closed',
};

// null deliberately excludes unpaid intake from admin counters and lists.
export function adminBucketFor(status: CaseStatus, service?: string, subStatus?: string | null): AdminCaseBucket | null {
  if(['legal_advice','district_court','high_court'].includes(service??'')){
    if(status===CaseStatus.in_progress&&subStatus==='awaiting_admin_approval')return 'open';
    if(status===CaseStatus.changes_requested)return 'in_progress';
  }
  if(service==='fir_draft'&&['assigned','advocate_accepted','in_progress','changes_requested'].includes(status)&&['identity_review_pending','multiple_corrections_required'].includes(subStatus??''))return 'open';
  if(service==='fir_draft'&&status==='changes_requested')return subStatus==='advocate_revision_required'?'in_progress':subStatus==='identity_replacement_required'?'pending':'open';
  if (service === 'fir_draft' && status === CaseStatus.in_progress && subStatus === 'awaiting_admin_approval') return 'open';
  // Report services (Property Search, Document Forensic, Court Marriage) share the admin approval wait.
  if (['property_search','document_forensic','court_marriage'].includes(service ?? '') && status === CaseStatus.in_progress && subStatus === 'awaiting_admin_approval') return 'open';
  switch (status) {
    case CaseStatus.draft:
    case CaseStatus.submitted:
    case CaseStatus.payment_pending: return null;
    case CaseStatus.paid:
    case CaseStatus.assigning:
    case CaseStatus.advocate_declined: return 'open';
    case CaseStatus.client_review:
    case CaseStatus.changes_requested: return 'pending';
    case CaseStatus.assigned:
    case CaseStatus.advocate_accepted:
    case CaseStatus.in_progress:
    case CaseStatus.approved:
    case CaseStatus.dispatching:
    case CaseStatus.dispatched: return 'in_progress';
    case CaseStatus.completed: return 'completed';
    case CaseStatus.cancelled:
    case CaseStatus.refunded: return 'closed';
    default: {
      const exhaustive: never = status;
      throw new Error(`Unknown lifecycle status: ${exhaustive}`);
    }
  }
}

// One-way display grouping. Buckets never imply a unique lifecycle state.
export function bucketFor(status: CaseStatus): CaseBucket {
  switch (status) {
    // Client confirmed both omitted states belong to pending.
    case CaseStatus.draft:
    case CaseStatus.advocate_declined:
    case CaseStatus.submitted:
    case CaseStatus.payment_pending:
    case CaseStatus.assigning:
    case CaseStatus.assigned:
    case CaseStatus.client_review:
      return 'pending';
    case CaseStatus.paid:
    case CaseStatus.advocate_accepted:
    case CaseStatus.in_progress:
    case CaseStatus.changes_requested:
    case CaseStatus.approved:
    case CaseStatus.dispatching:
    case CaseStatus.dispatched:
      return 'active';
    case CaseStatus.completed:
    case CaseStatus.cancelled:
    case CaseStatus.refunded:
      return 'closed';
    default: {
      const exhaustive: never = status;
      throw new Error(`Unknown lifecycle status: ${exhaustive}`);
    }
  }
}
