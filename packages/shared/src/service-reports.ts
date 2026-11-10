import {z} from 'zod';
import type {ServiceCode} from './services';

/**
 * Property Search, Document Forensic and Court Marriage share one "report
 * service" lifecycle (architecture §9.2, services-documents chunk):
 *
 *   draft → submitted → payment_pending → paid → assigning → assigned →
 *   advocate_accepted → in_progress → [awaiting_admin_approval ⇄
 *   admin_changes_requested] → completed
 *
 * Per-service differences are configuration, never branches in handlers.
 */
export const REPORT_SERVICES = ['property_search', 'document_forensic', 'court_marriage'] as const;
export type ReportServiceCode = typeof REPORT_SERVICES[number];
export const isReportService = (code: string | null | undefined): code is ReportServiceCode =>
  (REPORT_SERVICES as readonly string[]).includes(code ?? '');
export const REPORT_AWAITING_APPROVAL = 'awaiting_admin_approval';
export const REPORT_CHANGES_REQUESTED = 'admin_changes_requested';

/** 'upload': the advocate uploads a finished PDF (designs 210/211).
 *  'forensic': the advocate fills four findings sections and an affidavit; the
 *  platform renders both PDFs (designs 226–228). */
export type ReportProduction = 'upload' | 'forensic' | 'property';
export type ReportServiceConfig = {
  code: ReportServiceCode;
  /** Route prefix of the client screens. */
  clientPath: string;
  reportNoun: string;
  production: ReportProduction;
  /** Design 211 sends the Property Search report straight to the client; designs
   *  228–231 put Document Forensic through admin review. Court Marriage has no
   *  design and follows the admin-reviewed default (assumption A-CM-3). */
  requiresAdminApproval: boolean;
  tiers: readonly ('ordinary' | 'urgent')[];
  /** Estimated delivery printed on review/submitted screens (designs 76, 85, 88). */
  estimate: Record<string, string>;
};
export const REPORT_SERVICE_CONFIG: Record<ReportServiceCode, ReportServiceConfig> = {
  property_search: {code: 'property_search', clientPath: '/property-search', reportNoun: 'Property Search Report',
    production: 'upload', requiresAdminApproval: false, tiers: ['ordinary', 'urgent'],
    estimate: {ordinary: '3 - 5 Working Days', urgent: '1 - 2 Working Days'}},
  document_forensic: {code: 'document_forensic', clientPath: '/document-forensic', reportNoun: 'Document Forensic Report',
    production: 'forensic', requiresAdminApproval: true, tiers: ['ordinary', 'urgent'],
    estimate: {ordinary: '24 - 48 Hours', urgent: '12 - 24 Hours'}},
  court_marriage: {code: 'court_marriage', clientPath: '/court-marriage', reportNoun: 'Court Marriage Application',
    production: 'upload', requiresAdminApproval: true, tiers: [],
    estimate: {default: '5 - 7 Working Days (application); the Special Marriage Act notice period then applies'}},
};
export const reportConfig = (code: ServiceCode) => isReportService(code) ? REPORT_SERVICE_CONFIG[code] : null;

const text = (max: number) => z.string().trim().max(max);
const opt = (max: number) => text(max).optional();

// ---------------- Property Search (designs 74, 75, 76) ----------------
export const PROPERTY_TYPES = [
  {code: 'residential', label: 'Residential'}, {code: 'commercial', label: 'Commercial'},
  {code: 'agricultural', label: 'Agricultural'}, {code: 'plot_land', label: 'Plot / Land'},
  {code: 'industrial', label: 'Industrial'}, {code: 'apartment_flat', label: 'Apartment / Flat'},
  {code: 'other', label: 'Other'},
] as const;
export const SEARCH_DURATIONS = [
  {code: '15_years', label: '15 Years'}, {code: '30_years', label: '30 Years'}, {code: 'full_record', label: 'Full Record'},
] as const;
const propertyType = z.enum(PROPERTY_TYPES.map(p => p.code) as [string, ...string[]]);
const duration = z.enum(SEARCH_DURATIONS.map(p => p.code) as [string, ...string[]]);
export const PropertySearchIntakeSchema = z.strictObject({
  contact: z.strictObject({fullName: opt(120), mobile: opt(20), email: opt(200)}).default({}),
  jurisdiction: z.strictObject({state_code: opt(10), state: opt(80), district_code: opt(10), district: opt(80),
    ward: opt(80), tehsil: opt(120), colony: opt(160)}).default({}),
  property_address: opt(500),
  property_type: propertyType.optional(),
  survey_number: opt(120),
  search_duration: duration.optional(),
  requirement: opt(2000),
});
export type PropertySearchIntake = z.infer<typeof PropertySearchIntakeSchema>;

// ---------------- Document Forensic (designs 84, 85) ----------------
export const FORENSIC_DOCUMENT_TYPES = [
  {code: 'agreement_contract', label: 'Agreement / Contract'}, {code: 'property_deed', label: 'Property Deed'},
  {code: 'will_testament', label: 'Will / Testament'}, {code: 'cheque', label: 'Cheque'},
  {code: 'affidavit', label: 'Affidavit'}, {code: 'government_document', label: 'Government Document'},
  {code: 'letter', label: 'Letter / Correspondence'}, {code: 'other', label: 'Other'},
] as const;
export const DocumentForensicIntakeSchema = z.strictObject({
  document_type: z.enum(FORENSIC_DOCUMENT_TYPES.map(p => p.code) as [string, ...string[]]).optional(),
  questioned_description: opt(200),
  no_reference_sample: z.boolean().optional(),
  instructions: opt(2000),
});
export type DocumentForensicIntake = z.infer<typeof DocumentForensicIntakeSchema>;

// ---------------- Court Marriage (no design: assumptions A-CM-1..6) ----------------
export const MARITAL_STATUSES = [
  {code: 'never_married', label: 'Never married'}, {code: 'divorced', label: 'Divorced'}, {code: 'widowed', label: 'Widowed'},
] as const;
const party = z.strictObject({full_name: opt(120), date_of_birth: opt(10),
  address: opt(500), marital_status: z.enum(MARITAL_STATUSES.map(m => m.code) as [string, ...string[]]).optional()}).default({});
export const CourtMarriageIntakeSchema = z.strictObject({
  contact: z.strictObject({mobile: opt(20), email: opt(200)}).default({}),
  party_one: party, party_two: party,
  jurisdiction: z.strictObject({state_code: opt(10), state: opt(80), district_code: opt(10), district: opt(80)}).default({}),
  preferred_date: opt(10),
  notes: opt(2000),
});
export type CourtMarriageIntake = z.infer<typeof CourtMarriageIntakeSchema>;

export const REPORT_INTAKE_SCHEMAS = {
  property_search: PropertySearchIntakeSchema,
  document_forensic: DocumentForensicIntakeSchema,
  court_marriage: CourtMarriageIntakeSchema,
} as const;
export type ReportIntake = PropertySearchIntake | DocumentForensicIntake | CourtMarriageIntake;

export const ReportIntakeSaveSchema = z.strictObject({
  tier: z.enum(['ordinary', 'urgent']).nullable().optional(),
  details: z.record(z.string(), z.unknown()),
  expected_updated_at: z.iso.datetime().optional(),
});

/** Document kinds each service accepts from the client during intake. */
export const REPORT_CLIENT_DOCUMENT_KINDS: Record<ReportServiceCode, readonly string[]> = {
  property_search: ['property_document'],
  document_forensic: ['questioned_document', 'reference_document'],
  court_marriage: ['id_proof', 'photograph', 'address_proof', 'supporting_document'],
};
/** Kinds the assigned advocate may upload. Platform-rendered PDFs use their own kinds. */
export const REPORT_ADVOCATE_DOCUMENT_KINDS: Record<ReportServiceCode, readonly string[]> = {
  property_search: ['service_report'], document_forensic: [], court_marriage: ['service_report'],
};
export const REPORT_GENERATED_KINDS = ['forensic_report', 'forensic_affidavit'] as const;

export type ReportProblem = {field: string; message: string};
const blank = (v?: string | null) => !v || !v.trim();
const iso = (v?: string) => !!v && !Number.isNaN(Date.parse(v + 'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
function age(dob: string, at: Date) {
  const d = new Date(dob + 'T00:00:00Z');
  let years = at.getUTCFullYear() - d.getUTCFullYear();
  if (at.getUTCMonth() < d.getUTCMonth() || at.getUTCMonth() === d.getUTCMonth() && at.getUTCDate() < d.getUTCDate()) years--;
  return years;
}
/** What blocks submission. Partial intakes remain saveable. */
export function reportIntakeProblems(code: ReportServiceCode, details: unknown, tier: string | null,
  documents: {kind: string}[], now = new Date()): ReportProblem[] {
  const out: ReportProblem[] = [];
  const need = (ok: boolean, field: string, message: string) => { if (!ok) out.push({field, message}); };
  const config = REPORT_SERVICE_CONFIG[code];
  if (config.tiers.length) need(!!tier && (config.tiers as readonly string[]).includes(tier), 'tier', 'Choose a service speed.');
  const parsed = REPORT_INTAKE_SCHEMAS[code].safeParse(details ?? {});
  if (!parsed.success) return [{field: 'details', message: 'Some entries are invalid. Review the form and save again.'}];
  const kinds = documents.map(d => d.kind);
  if (code === 'property_search') {
    const v = parsed.data as PropertySearchIntake;
    need(!blank(v.contact.fullName), 'contact.fullName', 'Enter your full name.');
    need(!blank(v.contact.mobile), 'contact.mobile', 'Enter your mobile number.');
    need(!blank(v.jurisdiction.state) && !blank(v.jurisdiction.district), 'jurisdiction', 'Choose the state and district.');
    need(!blank(v.property_address), 'property_address', 'Enter the property address.');
    need(!!v.property_type, 'property_type', 'Choose the property type.');
    need(!!v.search_duration, 'search_duration', 'Choose the search duration.');
  } else if (code === 'document_forensic') {
    const v = parsed.data as DocumentForensicIntake;
    need(kinds.includes('questioned_document'), 'questioned_document', 'Upload the document to examine.');
    need(kinds.filter(k => k === 'questioned_document').length <= 1, 'questioned_document', 'Upload only one questioned document. Remove the extra file.');
    need(!!v.document_type, 'document_type', 'Choose the document type.');
    need(kinds.includes('reference_document') || v.no_reference_sample === true, 'reference_document',
      'Upload a reference document or confirm you do not have a reference sample.');
  } else {
    const v = parsed.data as CourtMarriageIntake;
    if(v.preferred_date)need(iso(v.preferred_date),'preferred_date','Enter a valid preferred date (YYYY-MM-DD).');
    for (const [key, label] of [['party_one', 'first party'], ['party_two', 'second party']] as const) {
      const p = v[key];
      need(!blank(p.full_name), `${key}.full_name`, `Enter the ${label}'s full name.`);
      need(iso(p.date_of_birth), `${key}.date_of_birth`, `Enter the ${label}'s date of birth.`);
      need(!blank(p.address), `${key}.address`, `Enter the ${label}'s address.`);
      need(!!p.marital_status, `${key}.marital_status`, `Choose the ${label}'s marital status.`);
    }
    // Special Marriage Act s.4(c): 21 years for the groom and 18 for the bride.
    // The form does not ask gender (A-CM-5), so both parties must be at least 18;
    // the advocate confirms statutory eligibility before filing.
    for (const [key, label] of [['party_one', 'first party'], ['party_two', 'second party']] as const) {
      const dob = v[key].date_of_birth;
      if (iso(dob) && age(dob!, now) < 18) out.push({field: `${key}.date_of_birth`, message: `The ${label} must be at least 18 years old.`});
    }
    need(!blank(v.jurisdiction.state) && !blank(v.jurisdiction.district), 'jurisdiction', 'Choose the state and district where you will marry.');
    need(!blank(v.contact.mobile), 'contact.mobile', 'Enter a mobile number for the advocate to reach you.');
    need(kinds.filter(k => k === 'id_proof').length >= 2, 'id_proof', 'Upload an identity / age proof for each party (two files).');
  }
  return out;
}

// ---------------- Advocate output ----------------
export const ReportNoteSchema = z.string().trim().max(300);
/** Design 208. Client and property facts come from the frozen filing; only
 * research fields are editable. Every field below is rendered in the preview. */
export const PropertyReportSchema = z.strictObject({
  owner_details: text(2000),
  documents_checked: z.array(z.strictObject({description:text(500),reference:text(200)})).max(30),
  search_date:text(10), search_period:text(120), records_inspected:text(2000), registry_office:text(500), search_notes:text(3000),
  ownership_history:text(4000), findings:text(6000), conclusion:text(4000),
});
export type PropertyReport = z.infer<typeof PropertyReportSchema>;
export const PropertyReportSaveSchema=z.strictObject({production:z.literal('property'),base_draft_id:z.uuid().nullable(),report:PropertyReportSchema,note:ReportNoteSchema.default('')});
export const emptyPropertyReport=():PropertyReport=>({owner_details:'',documents_checked:[],search_date:'',search_period:'',records_inspected:'',registry_office:'',search_notes:'',ownership_history:'',findings:'',conclusion:''});
export function propertyReportProblems(r:PropertyReport):ReportProblem[]{
 const required:([keyof PropertyReport,string])[]=[['owner_details','Owner details'],['search_date','Search date'],['search_period','Search period'],['records_inspected','Records inspected'],['registry_office','Registry office'],['ownership_history','Ownership history'],['findings','Search findings'],['conclusion','Search conclusion']];
 const issues=required.filter(([k])=>!String(r[k]).trim()).map(([k,label])=>({field:String(k),message:`Complete ${label.toLowerCase()}.`}));
 if(r.search_date&&!iso(r.search_date))issues.push({field:'search_date',message:'Enter a valid search date (YYYY-MM-DD).'});
 if(!r.documents_checked.length||r.documents_checked.some(d=>!d.description.trim()))issues.push({field:'documents_checked',message:'Record the documents checked, with a description for each.'});
 return issues;
}
export const UploadReportSaveSchema = z.strictObject({
  base_draft_id: z.uuid().nullable(),
  report_document_id: z.uuid(),
  note: ReportNoteSchema.default(''),
});
const section = z.string().trim().max(4000);
export const ForensicReportSchema = z.strictObject({
  what_checked: section, how_checked: section, findings: section, final_result: section,
});
export const AffidavitSchema = z.strictObject({
  deponent_name: text(120), enrolment_number: text(60), age: z.number().int().min(21).max(100).nullable(),
  office_address: text(300),
  paragraphs: z.array(z.string().trim().max(2000)).min(1).max(8),
});
export const ReportSignatureSchema=z.array(z.array(z.strictObject({x:z.number().min(0).max(1),y:z.number().min(0).max(1)})).min(2).max(1000)).min(1).max(30);
export type ReportSignature=z.infer<typeof ReportSignatureSchema>;
/** Design 227's drawn mark is stored with this exact version. It is not a
 *  digital-certificate signature or a notarised/oath-administered affidavit. */
export const ForensicReportSaveSchema = z.strictObject({
  base_draft_id: z.uuid().nullable(),
  report: ForensicReportSchema,
  affidavit: AffidavitSchema,
  signed: z.boolean(),
  signature: ReportSignatureSchema.optional(),
  note: ReportNoteSchema.default(''),
});
export type ForensicReport = z.infer<typeof ForensicReportSchema>;
export type Affidavit = z.infer<typeof AffidavitSchema>;
export type ReportDraftContent =
  | {production: 'upload'; report_document_id: string; note: string}
  | {production: 'property'; report:PropertyReport; note:string}
  | {production: 'forensic'; report: ForensicReport; affidavit: Affidavit; signature?:ReportSignature; signed_at: string | null; note: string};

export const FORENSIC_SECTIONS: {key: keyof ForensicReport; title: string; tag: string}[] = [
  {key: 'what_checked', title: 'What Was Checked?', tag: 'Scope'},
  {key: 'how_checked', title: 'How Was It Checked?', tag: 'Method'},
  {key: 'findings', title: 'Findings', tag: 'Observations'},
  {key: 'final_result', title: 'Final Result', tag: 'Conclusion'},
];
export function forensicProblems(content: {report: ForensicReport; affidavit: Affidavit; signature?:ReportSignature; signed_at: string | null}): ReportProblem[] {
  const out: ReportProblem[] = [];
  for (const s of FORENSIC_SECTIONS) if (blank(content.report[s.key])) out.push({field: `report.${s.key}`, message: `Complete “${s.title}”.`});
  const a = content.affidavit;
  if (blank(a.deponent_name)) out.push({field: 'affidavit.deponent_name', message: 'Enter the deponent advocate’s name.'});
  if (blank(a.enrolment_number)) out.push({field: 'affidavit.enrolment_number', message: 'Enter the Bar Council enrolment number.'});
  if (blank(a.office_address)) out.push({field: 'affidavit.office_address', message: 'Enter the office address.'});
  if (!a.paragraphs.some(p => !blank(p))) out.push({field: 'affidavit.paragraphs', message: 'The affidavit needs at least one statement.'});
  if (!content.signed_at) out.push({field: 'signed', message: 'Sign the affidavit declaration before submitting.'});
  if (!content.signature?.some(stroke=>stroke.length>1)) out.push({field:'signature',message:'Draw your signature on the affidavit before submitting.'});
  return out;
}
/** Design 227's four statements, with the case's own values bound in. */
export function defaultAffidavitParagraphs(v: {reference: string; client: string; document: string}) {
  return [
    `Scope & Engagement: That I was engaged under Request ID #${v.reference} by client ${v.client} to examine the submitted document titled ${v.document}, within the scope and limitations recorded in my report.`,
    'Methodology: That the materials available to me, the methods I used and their limitations are described in the accompanying Preliminary Forensic Examination Report.',
    'Confirmation: That the findings set forth in the Preliminary Forensic Examination Report represent my true and honest professional evaluation without fear, bias, or external influence.',
    'Verification: That the contents of this affidavit are true to my personal professional knowledge and nothing material has been concealed therein.',
  ];
}

export const ChangeItemsSchema = z.strictObject({
  items: z.array(z.strictObject({title: text(120).min(1), detail: text(600).default('')})).min(1).max(10),
});
export type ChangeItem = z.infer<typeof ChangeItemsSchema>['items'][number];

/** Projection of the report lifecycle returned with GET /cases/:id. */
export type ReportState = {
  property_draft?:{id:string;version:number;report:PropertyReport}|null;
  production: ReportProduction;
  requires_admin_approval: boolean;
  stage: 'not_started' | 'preparing' | 'awaiting_admin_approval' | 'changes_requested' | 'released';
  latest_draft: {id: string; version: number; content: ReportDraftContent; created_at: string} | null;
  submission: {draft_id: string; version: number; document_ids: string[]; submitted_at: string} | null;
  changes: {items: ChangeItem[]; requested_at: string} | null;
  released: {document_ids: string[]; note: string; released_at: string} | null;
};

/** Provisional tariffs with their computed client totals (no documents yet). */
export type ReportPricing = {
  service_code: ReportServiceCode; confirmed: boolean;
  tiers: {tier: 'ordinary' | 'urgent' | null; pricing_id: string; base_amount_paise: string; platform_fee_paise: string;
    gst_paise: string; total_paise: string; included_pages: number; page_unit_paise: string}[];
};

// Labels for display; a missing value takes its label with it (§1a).
export const labelOf = (list: readonly {code: string; label: string}[], code?: string | null) =>
  list.find(i => i.code === code)?.label ?? null;
