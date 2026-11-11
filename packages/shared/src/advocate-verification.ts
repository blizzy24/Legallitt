import {z} from 'zod';

// D-35 advocate verification (designs 233–244). Status is the advocate profile's
// verification enum; details are what the advocate entered, stored as entered.
export const VERIFICATION_DOCUMENTS = [
  {kind: 'verification_identity', label: 'Identity proof', hint: 'Aadhaar must be masked (last four digits only). Passport, voter ID or driving licence also accepted.'},
  {kind: 'verification_enrolment', label: 'Bar Council enrolment certificate', hint: 'PDF, JPG or PNG up to 25 MB.'},
  {kind: 'verification_practice', label: 'Certificate of practice', hint: 'PDF, JPG or PNG up to 25 MB.'},
] as const;
export type VerificationDocumentKind = typeof VERIFICATION_DOCUMENTS[number]['kind'];
export const VerificationDocumentKindSchema = z.enum(VERIFICATION_DOCUMENTS.map(d => d.kind) as [VerificationDocumentKind, ...VerificationDocumentKind[]]);

export const PRACTICE_AREAS = ['Civil', 'Criminal', 'Property', 'Family', 'Corporate', 'Consumer', 'Labour', 'Tax', 'Cheque Bounce', 'Cyber', 'Constitutional', 'Other'] as const;

const t = (max: number) => z.string().trim().max(max);
export const VerificationDetailsSchema = z.strictObject({
  personal: z.strictObject({full_name: t(120).optional(), date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
    gender: t(40).optional(), phone: t(20).optional()}).default({}),
  professional: z.strictObject({years_experience: z.number().int().min(0).max(70).nullable().optional(), education: t(200).optional(),
    courts: z.array(t(120)).max(10).optional(), languages: z.array(t(40)).max(10).optional()}).default({}),
  bar_council: z.strictObject({state: t(80).optional(), number: t(60).optional(), enrolment_year: z.number().int().min(1950).max(2100).nullable().optional()}).default({}),
  practice: z.strictObject({areas: z.array(t(60)).max(12).optional(), city: t(80).optional(), state: t(80).optional(), bio: t(1000).optional()}).default({}),
});
export type VerificationDetails = z.infer<typeof VerificationDetailsSchema>;

export type VerificationDocument = {id: string; kind: VerificationDocumentKind; filename: string; mime_type: string; size_bytes: string; page_count: number | null; created_at: string};
export type VerificationState = {
  status: 'not_started' | 'in_review' | 'approved' | 'rejected' | 'needs_update';
  details: VerificationDetails;
  documents: VerificationDocument[];
  submitted_at: string | null;
  decision: {decision: string; reason: string | null; decided_at: string} | null;
  problems: {field: string; message: string}[];
};

/** What must be present before submission. Partial saves are always allowed. */
export function verificationProblems(details: VerificationDetails, documents: {kind: string}[]) {
  const out: {field: string; message: string}[] = [];
  const need = (ok: boolean, field: string, message: string) => { if (!ok) out.push({field, message}); };
  const blank = (v?: string | null) => !v || !v.trim();
  need(!blank(details.personal.full_name), 'personal.full_name', 'Enter your full name as enrolled.');
  need(!blank(details.personal.phone), 'personal.phone', 'Enter your mobile number.');
  need(details.professional.years_experience != null, 'professional.years_experience', 'Enter your years of practice.');
  need(!blank(details.bar_council.state), 'bar_council.state', 'Enter the State Bar Council.');
  need(!blank(details.bar_council.number), 'bar_council.number', 'Enter your enrolment number.');
  need(details.bar_council.enrolment_year != null, 'bar_council.enrolment_year', 'Enter your enrolment year.');
  need(!!details.practice.areas?.length, 'practice.areas', 'Choose at least one practice area.');
  need(!blank(details.practice.city), 'practice.city', 'Enter the city you practise in.');
  for (const d of VERIFICATION_DOCUMENTS) need(documents.some(x => x.kind === d.kind), d.kind, `Upload your ${d.label.toLowerCase()}.`);
  return out;
}

export const VerificationDecisionSchema = z.strictObject({
  decision: z.enum(['approved', 'needs_update', 'rejected']),
  reason: z.string().trim().max(1000).optional(),
}).refine(v => v.decision === 'approved' || !!v.reason, {message: 'Give a reason the advocate will see', path: ['reason']});

export type AdvocateApprovalRow = {user_id: string; name: string; email: string | null; city: string | null; status: VerificationState['status'];
  submitted_at: string | null; bar_council: {state?: string; number?: string}};
export type AdvocateApprovalDetail = VerificationState & {user_id: string; name: string; email: string | null; phone: string | null};
