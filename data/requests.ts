// Requests, from My Requests (design/53) and Request Details (design/54).

export type RequestStatus = 'confirmed' | 'awaiting' | 'accepted';

/** A labelled row on the request card. Some values are plain, some are chips. */
export type RequestRow = { label: string; value: string; chip?: boolean };

export type RequestItem = {
  id: string;
  service: string;
  status: RequestStatus;
  /**
   * design/53 labels the first card "Reference ID: #REQ-9218" and the two
   * representation cards "Case Application #DR-4402". Kept per card as drawn.
   */
  reference: string;
  rows: RequestRow[];
};

export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: 'active' | 'pending' }> = {
  confirmed: { label: 'Confirmed', tone: 'active' },
  awaiting: { label: 'Awaiting Review', tone: 'pending' },
  accepted: { label: 'Accepted', tone: 'active' },
};

export const REQUESTS: RequestItem[] = [
  {
    id: 'REQ-9218',
    service: 'Legal Advice',
    status: 'confirmed',
    reference: 'Reference ID: #REQ-9218',
    rows: [
      { label: 'Assigned Advocate', value: 'Adv. Priya Sharma' },
      { label: 'Consultation Mode', value: 'Video Call', chip: true },
      { label: 'Requested Date', value: '09 Sep 2026' },
    ],
  },
  {
    id: 'DR-4402',
    service: 'District Representation',
    status: 'awaiting',
    reference: 'Case Application #DR-4402',
    rows: [
      { label: 'Assigned Advocate', value: 'Adv. Neha Verma' },
      { label: 'Court Forum', value: 'District Court, Indore', chip: true },
      { label: 'Requested Date', value: '07 Sep 2026' },
    ],
  },
  {
    id: 'HC-1190',
    service: 'High Court Representation',
    status: 'accepted',
    reference: 'Case Application #HC-1190',
    rows: [
      { label: 'Assigned Advocate', value: 'Adv. Rohan Mehta' },
      { label: 'Court Forum', value: 'High Court of MP', chip: true },
      { label: 'Requested Date', value: '04 Sep 2026' },
    ],
  },
];

export type RequestFilter = 'all' | 'pending' | 'accepted' | 'confirmed';

/**
 * design/53's chip row. The fourth chip is drawn clipped at the screen edge as the
 * horizontal-scroll cue, so its full label is inferred as "Confirmed".
 *
 * NAMING CONFLICT: the chip reads "Pending" while the card it counts reads
 * "Awaiting Review". Both are rendered as drawn; `match` is what ties them together.
 */
export const REQUEST_FILTERS: { key: RequestFilter; label: string; match?: RequestStatus }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending', match: 'awaiting' },
  { key: 'accepted', label: 'Accepted', match: 'accepted' },
  { key: 'confirmed', label: 'Confirmed', match: 'confirmed' },
];

export const requestById = (id: string) => REQUESTS.find((r) => r.id === id);

export const REQUESTS_NOTE =
  'Advocates respond to representation requests within 24–48 working hours. Direct urgent queries via client support.';

// ── Request details (design/54) ──

export const REQUEST_DETAIL = {
  docket: 'DOCKET #DR-4402',
  filingId: 'Filing ID #DR-4402',
  statusLabel: 'Awaiting Advocate Review',
  title: 'District Representation',
  subtitle: 'Commercial & Private Land Registry Litigation',
  stats: [
    { label: 'Category', value: 'Property' },
    { label: 'Requested', value: "09 Sep '26" },
    { label: 'Forum', value: 'Dist. Indore' },
  ],
  advocate: {
    initials: 'NV',
    name: 'Adv. Neha Verma',
    barId: 'Bar ID: MP/2014/891',
    rating: '4.8',
    briefs: '120+ client briefs',
    attributes: ['10+ Years Experience', 'District Court Practice', 'Indore, Madhya Pradesh'],
  },
  caseSubject: 'Property Dispute & Title Verification',
  briefDescription:
    'Dispute relating to ancestral boundary ownership and discrepancies in municipal land registry documents. Needs immediate appearance on upcoming call list.',
  forum: 'District Court, Indore (Bench 4)',
  forumChip: 'CIVIL',
  documents: [
    { name: 'Property_Documents_V2.pdf', meta: '2.4 MB • Certified Registry Copy' },
    { name: 'Previous_Court_Order_2024.pdf', meta: '1.1 MB • Sub-Divisional Order' },
  ],
  timeline: [
    {
      title: 'Request Submitted',
      body: 'Filing brief received on 09 Sep 2026, 10:30 AM',
      state: 'done' as const,
      tag: '',
    },
    {
      title: 'Under Advocate Review',
      body: 'Adv. Neha Verma is evaluating docket files and scheduling conflict',
      state: 'active' as const,
      tag: 'IN PROGRESS',
    },
    {
      title: 'Advocate Decision Pending',
      body: 'Representation acceptance or preliminary query response',
      state: 'pending' as const,
      tag: '',
    },
  ],
  footerNote:
    'You will be notified immediately via push & SMS once Adv. Neha Verma accepts or responds to this request.',
};
