// Documents, shared by My Documents (design/56), Case Documents (design/52) and the
// viewer (design/57).
//
// ─────────────────────────────────────────────────────────────────────────────
// ONE LIST, TWO PRESENTATIONS.
// designs 52 and 56 draw overlapping sets of the same files with different chips and
// different footer lines. Rather than two lists that would drift apart, each document
// is defined once and carries a `vault` block (design/56's wording) and a `caseView`
// block (design/52's). A document with no caseView does not appear on design/52.
//
// Where the two files disagree on the same fact, one value is chosen and the variant
// recorded on the field.
// ─────────────────────────────────────────────────────────────────────────────

export type DocFilter = 'all' | 'cases' | 'legal-advice' | 'other';
export type CaseDocFilter = 'all' | 'court' | 'legal' | 'evidence';

/** Footer tone on the document cards. */
export type FooterTone = 'verified' | 'neutral' | 'advocate';

export type DocumentItem = {
  id: string;
  name: string;
  size: string;
  uploaded: string;
  /** Long form shown on the viewer's Document Information card (design/57). */
  format: string;
  vaultId: string;
  uploadedAt: string;
  pages: number;
  /** Which chip the My Documents filter row matches this against. */
  filter: Exclude<DocFilter, 'all'>;
  /** design/56's presentation. */
  vault: { chip: string; footer: string; tone: FooterTone };
  /** design/52's presentation. Absent means the file is not drawn on that screen. */
  caseView?: { chip: string; footer: string; tone: FooterTone; filter: Exclude<CaseDocFilter, 'all'> };
};

export const DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-property-sale',
    name: 'Property Sale Agreement.pdf',
    size: '2.4 MB',
    uploaded: '08 Sep 2026',
    format: 'PDF Document (v1.7)',
    vaultId: '#DOC-VAULT-9182',
    uploadedAt: '08 Sep 2026, 11:20 AM',
    pages: 6,
    filter: 'cases',
    vault: { chip: 'Property Dispute', footer: 'Verified Copy', tone: 'verified' },
    caseView: {
      chip: 'Property Document',
      footer: 'Verified by Advocate',
      tone: 'verified',
      filter: 'legal',
    },
  },
  {
    id: 'doc-court-order',
    name: 'Previous Court Order.pdf',
    size: '1.1 MB',
    uploaded: '30 Aug 2026',
    format: 'PDF Document',
    vaultId: '#DOC-VAULT-9183',
    uploadedAt: '30 Aug 2026',
    pages: 4,
    filter: 'cases',
    vault: { chip: 'District Court Case', footer: 'Indore Dist. Bench', tone: 'neutral' },
    caseView: {
      chip: 'Court Order',
      footer: 'District Court, Indore',
      tone: 'neutral',
      filter: 'court',
    },
  },
  {
    id: 'doc-legal-notice',
    // design/56 prints 540 KB and design/52 prints 780 KB for the same file.
    // design/56 is the documents screen proper, so its figure is used.
    size: '540 KB',
    name: 'Legal Notice.pdf',
    uploaded: '20 Aug 2026',
    format: 'PDF Document',
    vaultId: '#DOC-VAULT-9184',
    uploadedAt: '20 Aug 2026',
    pages: 3,
    filter: 'legal-advice',
    vault: { chip: 'Legal Notice Service', footer: 'Served to Respondent', tone: 'verified' },
    caseView: { chip: 'Legal Notice', footer: 'Adv. Priya Sharma', tone: 'advocate', filter: 'legal' },
  },
  {
    // design/52 does not draw this one, so it has no caseView.
    id: 'doc-fir-draft',
    name: 'FIR Draft.pdf',
    size: '880 KB',
    uploaded: '18 Aug 2026',
    format: 'PDF Document',
    vaultId: '#DOC-VAULT-9185',
    uploadedAt: '18 Aug 2026',
    pages: 5,
    filter: 'other',
    vault: { chip: 'FIR Draft Service', footer: 'Advocate Final Draft', tone: 'advocate' },
  },
];

export const caseDocuments = () => DOCUMENTS.filter((d) => d.caseView);

export const documentById = (id: string) => DOCUMENTS.find((d) => d.id === id);

/** design/56's filter row. The count chip counts the whole list. */
export const DOC_FILTERS: { key: DocFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cases', label: 'Cases' },
  { key: 'legal-advice', label: 'Legal Advice' },
  { key: 'other', label: 'Other' },
];

/** design/52's filter row. Its "All (3)" count is baked into the label there. */
export const CASE_DOC_FILTERS: { key: CaseDocFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'court', label: 'Court' },
  { key: 'legal', label: 'Legal' },
  { key: 'evidence', label: 'Evidence' },
];

/** design/52's case header card. */
export const CASE_MATTER = {
  label: 'ACTIVE CASE MATTER',
  // design/52 clips this to "Rahul Sharma vs. Amit Ver"; the full name is used here.
  title: 'Rahul Sharma vs. Amit Verma',
  chip: 'Property Dispute',
  caseId: 'LGL-2026-IND-0241',
};

/**
 * The visible page of design/57. Only page 1 is drawn, so paging changes the page
 * number and nothing else — see the note in app/documents/[id].tsx.
 */
export const VIEWER_PAGE = {
  formNo: 'FORM NO. 16-B • STAMP DUTY PAID',
  reg: 'Reg. #MP-IND-2026/884',
  title: 'AGREEMENT TO SALE OF IMMOVABLE PROPERTY',
  subtitle: 'Executed under Section 54 of the Transfer of Property Act, 1882',
  dateLine: '08th day of September, 2026  at Indore, Madhya Pradesh by and between:',
  parties: [
    'PARTY OF THE FIRST PART (VENDOR): Shri Ramesh Chandra Sharma, s/o Late B. L. Sharma, resident of 42, Saket Nagar, Indore (M.P.).',
    'PARTY OF THE SECOND PART (PURCHASER): Shri Rahul Sharma, s/o Shri Satish Sharma, resident of Vijay Nagar, Indore (M.P.).',
  ],
  recital:
    'WHEREAS the Vendor is the absolute and lawful owner of the residential plot bearing No. 108-B, measuring 2,400 sq. ft., situated in Scheme No. 54, Indore…',
  signature: 'Digital Signatures Verified (Aadhaar e-Sign)',
};

/** design/57's Related Case / Service card. */
export const VIEWER_RELATED = {
  chip: 'Active Matter',
  label: 'PROPERTY DISPUTE & TITLE VERIFICATION',
  title: 'District Representation • Docket #DR-4402',
  counsel: 'Assigned Counsel: Adv. Neha Verma (Indore Bench)',
};
