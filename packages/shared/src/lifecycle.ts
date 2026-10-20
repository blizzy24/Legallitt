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
