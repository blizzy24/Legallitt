import {z} from 'zod';

// docs/flows/FIR-DRAFT-FLOW.md. The C10 mapping below is the single source of
// truth for the FIR state shown to client, advocate and admin.
export const FIR_CLIENT_CHANGES = 'client_changes_requested';
// Q119, Q120 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): there is no police-submission
// step. Client approval completes the case; migration 202611130010 completed the cases
// that were left at 'approved' / 'awaiting_police_submission'.

export const FIR_CLIENT_STAGES = ['Request Submitted', 'Information Review', 'Draft Preparation', 'Awaiting Your Approval', 'Draft Ready'] as const;
export type FirAdvocateScreen = 'request' | 'documents' | 'draft' | 'status' | 'completed';
export type FirStageView = {
  /** Client stage 1–5 (C10). `done` marks the last stage complete. */
  client: {stage: 1 | 2 | 3 | 4 | 5; label: string; status: string; note: string | null; done: boolean; decision_due: boolean};
  advocate: {chip: string; action: string | null; screen: FirAdvocateScreen | null};
  admin: {label: string};
};

export function firStage(input: {status: string; sub_status?: string | null; advocate_id?: string | null}): FirStageView {
  const {status, sub_status: sub = null} = input;
  const client = (stage: 1 | 2 | 3 | 4 | 5, statusText: string, note: string | null = null, done = false, decision_due = false) =>
    ({stage, label: FIR_CLIENT_STAGES[stage - 1], status: statusText, note, done, decision_due});
  const advocate = (chip: string, action: string | null, screen: FirAdvocateScreen | null) => ({chip, action, screen});
  const redraft = sub === FIR_CLIENT_CHANGES ? client(3, 'Draft being updated', 'Advocate is updating your draft') : sub ? client(3, 'Draft being prepared', 'Drafting team assigned') : null;
  switch (status) {
    case 'draft': return {client: client(1, 'Draft – not submitted'), advocate: advocate('Draft', null, null), admin: {label: 'Not submitted'}};
    case 'submitted': case 'payment_pending': return {client: client(1, 'Awaiting payment'), advocate: advocate('Awaiting payment', null, null), admin: {label: 'Awaiting payment'}};
    case 'paid': case 'assigning': return {client: client(2, 'Under Review'), advocate: advocate('New Request', null, null), admin: {label: 'New request · assign an advocate'}};
    case 'advocate_declined': return {client: redraft ? {...redraft, note: null} : client(2, 'Under Review'), advocate: advocate('Returned to admin', null, null), admin: {label: 'Advocate rejected · reassign'}};
    // A case reassigned after drafting began keeps its marker: the client's timeline never goes backwards.
    case 'assigned': return {client: redraft ?? client(2, 'Under Review', 'Drafting team assigned'), advocate: advocate('New Request', 'Review Request', 'request'), admin: {label: 'Assigned · awaiting advocate'}};
    case 'advocate_accepted': return {client: redraft ?? client(2, 'Under Review', 'Drafting team assigned'), advocate: advocate('Accepted', 'Review Documents', 'documents'), admin: {label: 'Accepted by advocate'}};
    case 'in_progress':
      if (sub === 'awaiting_admin_approval') return {client: client(3, 'Draft being prepared'), advocate: advocate('Sent to Admin', 'View Status', 'status'), admin: {label: 'Awaiting admin approval'}};
      if (sub === FIR_CLIENT_CHANGES) return {client: client(3, 'Draft being updated', 'Advocate is updating your draft'), advocate: advocate('Client Changes', 'Continue Draft', 'draft'), admin: {label: 'Advocate revising after client changes'}};
      return {client: client(3, 'Draft being prepared'), advocate: advocate('Draft Preparation', 'Continue Draft', 'draft'), admin: {label: 'Drafting'}};
    case 'changes_requested':
      if (sub === FIR_CLIENT_CHANGES) return {client: client(3, 'Draft being updated', 'Advocate is updating your draft'), advocate: advocate('Client Changes', 'Continue Draft', 'draft'), admin: {label: 'Client asked for changes'}};
      // Q114: identity is no longer collected. Older identity-return sub-statuses
      // (identity_replacement_required, identity_review_pending,
      // multiple_corrections_required) block nothing and read as an ordinary return.
      return {client: client(3, 'Draft being prepared'), advocate: advocate('Admin Returned', 'Continue Draft', 'draft'), admin: {label: 'Returned to advocate'}};
    case 'client_review': return {client: client(4, 'Awaiting your approval', null, false, true), advocate: advocate('Waiting for Client', 'View Status', 'status'), admin: {label: 'Sent to client'}};
    // Q119, Q120: 'approved' is no longer produced for FIR; any such case reads as completed.
    case 'approved': case 'completed': return {client: client(5, 'Completed', null, true), advocate: advocate('Completed', 'View', 'completed'), admin: {label: 'Completed'}};
    case 'cancelled': case 'refunded': return {client: client(1, status === 'refunded' ? 'Cancelled and refunded' : 'Cancelled'), advocate: advocate('Cancelled', null, null), admin: {label: status === 'refunded' ? 'Cancelled · refunded' : 'Cancelled'}};
    default: return {client: client(1, 'Status unavailable'), advocate: advocate('Status unavailable', null, null), admin: {label: status}};
  }
}

// C12 Select Section chips (F7). Codes are stored on the review.
export const FIR_REVIEW_SECTIONS = [
  {code: 'complainant', label: 'Complainant Info'},
  {code: 'incident', label: 'Incident Details'},
  {code: 'date_time_place', label: 'Date, Time, Place'},
  {code: 'people', label: 'People Involved'},
  {code: 'missing_data', label: 'Missing Data'},
  {code: 'other', label: 'Other Clarification'},
] as const;
export type FirReviewSection = typeof FIR_REVIEW_SECTIONS[number]['code'];
const sectionCode = z.enum(FIR_REVIEW_SECTIONS.map(s => s.code) as [FirReviewSection, ...FirReviewSection[]]);
export const firSectionLabel = (code: string) => FIR_REVIEW_SECTIONS.find(s => s.code === code)?.label ?? code;

export const FirClientApproveSchema = z.strictObject({draft_id: z.uuid()});
export const FirClientChangesSchema = z.strictObject({
  draft_id: z.uuid(),
  sections: z.array(sectionCode).min(1, 'Pick at least one section').max(FIR_REVIEW_SECTIONS.length).refine(v => new Set(v).size === v.length, 'Each section once'),
  comment: z.string().trim().min(1, 'Describe the changes you need').max(600, 'Use up to 600 characters'),
  attachment_document_id: z.uuid().nullable().optional(),
});
export const FirAdvocateRejectSchema = z.strictObject({reason: z.string().trim().min(1, 'Enter a reason').max(2000)});
/** The promised turnaround, from the FIR policy. Nothing about the police: there is no police step (Q119, Q120). */
export type FirSettings = {turnaround: {min_hours: number; max_hours: number}};
export const firTurnaroundText = (s: Pick<FirSettings, 'turnaround'>) => `${s.turnaround.min_hours}–${s.turnaround.max_hours} Hours`;
export const FIR_REMIND_HOURS = 24;

// C6 upload slots (design 45). `kind` is stored on the document.
export const FIR_UPLOAD_SLOTS = [
  {kind: 'fir_primary', title: 'Primary Documents', hint: 'Agreements, notices, receipts, stamps', required: true, max: 20, accept: ['application/pdf', 'image/jpeg', 'image/png']},
  {kind: 'fir_scene', title: 'Scene Photos & Video', hint: 'JPEG, PNG, MP4 · up to 50 MB each', required: false, max: 5, accept: ['image/jpeg', 'image/png', 'video/mp4']},
  {kind: 'fir_communications', title: 'Digital Communications', hint: 'WhatsApp logs, emails, SMS', required: false, max: 20, accept: ['application/pdf', 'image/jpeg', 'image/png']},
  {kind: 'fir_other', title: 'Ancillary / Other Records', hint: 'Audio, bank statements, affidavits', required: false, max: 20, accept: ['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg']},
] as const;
export const FIR_CUSTOM_SLOT_KIND = 'fir_custom';
export const FIR_CHANGE_ATTACHMENT_KIND = 'fir_change_attachment';
/** Dormant (Q119, Q120): nobody can upload a police receipt any more, and stored ones are never shown to the client. */
export const FIR_POLICE_RECEIPT_KIND = 'fir_police_receipt';
export const FIR_CHANGE_ATTACHMENT_MAX_BYTES = 10_000_000;
export const FIR_MEDIA_KINDS: Record<string, readonly string[]> = {fir_scene: ['video/mp4'], fir_other: ['audio/mpeg']};
export const maskedIdentity = (last4: string | null | undefined) => last4 ? `XXXX-XXXX-${last4}` : null;
// Legacy pre-acceptance contact presentation. The API privacy projection always
// removes client phone numbers; accepting a request never reveals a phone number.
export const firContactMasked = (role: string, status: string) => role === 'advocate' && status === 'assigned';
export function maskMobile(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const digits = value.replace(/\D/g, ''), national = digits.length > 10 ? digits.slice(-10) : digits;
  if (national.length < 4) return '••••';
  const middle = '•'.repeat(national.length - 4);
  return national.length === 10 ? `+91 ${national.slice(0, 2)}${middle}${national.slice(-2)}` : `${national.slice(0, 2)}${middle}${national.slice(-2)}`;
}
export function maskEmail(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const at = value.lastIndexOf('@');
  return at > 0 ? `${value.slice(0, Math.min(2, at))}••••${value.slice(at)}` : '••••';
}
/** The FIR filing with the client's mobile and email masked (contact and the complainant's own phone). */
export function maskFirContact<T>(details: T): T {
  const d = (details ?? {}) as {contact?: {mobile?: string; email?: string}; people?: {kind?: string; phone?: string}[]};
  return {...d,
    ...(d.contact ? {contact: {...d.contact, ...(d.contact.mobile !== undefined ? {mobile: maskMobile(d.contact.mobile) ?? ''} : {}), ...(d.contact.email !== undefined ? {email: maskEmail(d.contact.email) ?? ''} : {})}} : {}),
    ...(Array.isArray(d.people) ? {people: d.people.map(p => p.kind === 'complainant' && p.phone ? {...p, phone: maskMobile(p.phone) ?? ''} : p)} : {}),
  } as T;
}
// Step 1 incident-type chips: the filing stores the id, documents show the label.
export const FIR_INCIDENT_LABELS: Record<string, string> = {theft: 'Theft', fraud: 'Fraud', assault: 'Assault', harassment: 'Harassment', 'property-dispute': 'Property Dispute', 'cyber-crime': 'Cyber Crime', other: 'Other'};
export const firIncidentLabel = (type: string | null | undefined) => (type && FIR_INCIDENT_LABELS[type]) || type || '';

export type FirFlowDocument = {id: string; filename: string; mime_type: string; size_bytes: string; page_count: number | null};
export type FirFlowReview = {role: 'admin' | 'client'; decision: 'approved' | 'returned' | 'changes_requested'; comment: string | null;
  sections: string[]; attachment: FirFlowDocument | null; version: number | null; created_at: string};
export type FirFlowEvent = {type: string; label: string; actor: 'client' | 'advocate' | 'admin' | 'system'; created_at: string};
export type FirFlowView = {
  case_id: string; reference: string; status: string; sub_status: string | null; stage: FirStageView;
  settings: FirSettings; created_at: string; submitted_at: string | null; paid_at: string | null; completed_at: string | null;
  incident_type: string | null; police_station: string | null; city: string | null;
  /** From the filing's jurisdiction (A6 header "PS <station>, <district>"; client city line "<city> (<state>)"). */
  district: string | null; state: string | null;
  /** Draft requests only: the intake step the client last reached (1–5). */
  intake_step: number | null;
  client: {name: string; mobile: string | null; email: string | null; city: string | null} | null;
  /** `photo_key`: the advocate profile photo key (mobile resolves it); null shows initials. */
  advocate: {id: string; name: string; verified: boolean; photo_key: string | null} | null;
  /** Client: the latest admin-approved draft. Advocate/admin: the latest generated draft. */
  draft: {draft_id: string; version: number; document: FirFlowDocument; created_by: string; created_at: string; sections: number; files: number} | null;
  reviews: FirFlowReview[];
  remind: {allowed: boolean; next_at: string | null; last_at: string | null} | null;
  share_paise: string | null;
  events: FirFlowEvent[];
};
