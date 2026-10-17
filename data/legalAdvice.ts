// Legal Advice service data.
//
// ─────────────────────────────────────────────────────────────────────────────
// FILE NUMBERING IS SHIFTED — READ THIS BEFORE USING ANY DESIGN REFERENCE BELOW.
//
// The brief's design numbers are one lower than the files that actually hold the
// screens. Verified at seven points:
//
//     brief "design/101" landing        -> design/102-la-info.png
//     brief "design/102" info           -> design/103-la-choose-consult.png
//     brief "design/103" choose-consult -> design/104-la-your-details.png
//     brief "design/104" your-details   -> design/105-la-select-matter.png
//     brief "design/105" select-matter  -> design/106-la-review.png
//     brief "design/121-123" experience -> design/122, 123, 124
//
// design/101-la-landing.png is NOT a screen: it is a 1572x858 board holding the
// landing's Chat-selected and Audio-selected inset states only.
// design/121-la-experience-chat.png is NOT an experience screen: it is "Request a
// Callback".
//
// Every design reference in this file and in app/legal-advice/* names the file that
// actually contains the artwork, not the number the brief used.
// ─────────────────────────────────────────────────────────────────────────────
//
// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT: the consultation selected on design/104 sets the checkout amount via
// its choosePrice. Design/107 draws no platform fee, GST or other checkout line
// item, so charge the consultation alone. Its ₹25/page upload note is conditional
// overage copy, not a checkout line item or a flat surcharge.
//
// There are two contradictory price tables for the same three consultation types:
//
//     design/102 (landing)       Chat ₹499   Video ₹999   Audio ₹699
//     design/104 (choose)        Chat ₹499   Audio ₹999   Video ₹1,499
//
// Video and Audio swap rank between them, and Video's price nearly doubles. Both
// are recorded below and each screen renders its own, exactly as drawn.
//
// There is also a SECOND pricing axis that no screen reconciles with the first:
// advocate experience tiers (design/122-124), priced ₹999 / ₹799 / ₹599 / ₹499
// "Starting at". How consultation type and experience combine — whether experience
// replaces the type price, adds to it, or sets a floor the type price must clear —
// is not specified anywhere in the batch. They are modelled as two independent
// selections and nothing multiplies, adds or resolves them.
//
// Two further figures that no tier produces:
//     design/117 (follow-up)  fee ₹1,500 with a ₹99 platform fee, where every
//                             other service in the app charges ₹199
//     design/116 (completed)  a "Written Legal Advice & Action Plan" upsell at ₹100
//
// Shared Scan & Pay / success carry the selected consultation and its price.
// Experience tiers do not add a surcharge.

/** Client question: design/108 draws ₹1,377 (₹999 service + ₹179 GST + ₹199
 * platform). It matches the forensic template on design/279 and is probably a
 * copy error. Retained here for review only; it is NOT the checkout amount.
 */
export const LA_PAYMENT_SERVICE = 'Legal Advice';

export type LaConsultTypeId = 'chat' | 'audio' | 'video';

export type LaConsultType = {
  id: LaConsultTypeId;
  label: string;
  /** Detail-card title on the landing screen. */
  title: string;
  /** Price as drawn on design/102 (the landing). */
  landingPrice: number;
  /** Price as drawn on design/104 (the choose screen). Differs for audio & video. */
  choosePrice: number;
  /** Landing detail-card description. */
  description: string;
  /** Choose-screen description. */
  chooseDescription: string;
  duration: string;
  /** Choose-screen upload allowance note — two lines, as drawn. */
  uploadNote: [string, string];
  /**
   * Choose-screen bottom strip. The brief describes three labels; design/104 draws
   * TWO (duration, privacy). Built as drawn.
   */
  strip: [string, string];
  popular: boolean;
};

export const LA_CONSULT_TYPES: LaConsultType[] = [
  {
    id: 'chat',
    label: 'Chat',
    title: 'Chat Consultation',
    landingPrice: 499,
    choosePrice: 499,
    // design/101's inset renders this as "Quick legal guidancethrough secure chat" —
    // a missing space where two text runs were joined. Rendered with the space.
    description: 'Quick legal guidance through secure chat',
    chooseDescription: 'Get quick answer to your legal queries through secure chat',
    duration: '30 Mins Session',
    uploadNote: ['Up to 25 pages — FREE Upload', 'Additional pages: ₹25 per page'],
    // design/104 gives chat SEVEN DAYS where the landing's detail card says a 30-minute
    // session. Two different units for the same product; both rendered as drawn.
    strip: ['Up to 7 days', 'Private & Secure'],
    popular: true,
  },
  {
    id: 'audio',
    label: 'Audio',
    title: 'Audio Consultation',
    landingPrice: 699,
    choosePrice: 999,
    description: 'Discuss your legal matter directly with an advocate over a secure audio call.',
    chooseDescription: 'Speak directly with a legal expert and get legal solution',
    duration: '30 Mins Session',
    uploadNote: ['Up to 25 pages — FREE Upload', 'Additional pages: ₹25 per page'],
    strip: ['Up to 30 mins', 'Private & Secure'],
    popular: false,
  },
  {
    id: 'video',
    label: 'Video',
    title: 'Video Consultation',
    landingPrice: 999,
    choosePrice: 1499,
    description: 'Discuss your matter directly with an advocate',
    chooseDescription: 'Face-to-face consultation with our legal experts from anywhere',
    duration: '30 Mins Session',
    uploadNote: ['Up to 25 pages — FREE Upload', 'Additional pages: ₹25 per page'],
    strip: ['Up to 30 mins', 'Secure & Confidential'],
    popular: false,
  },
];

export const LA_INCLUSION = 'Court Admissible Summary Included';

/** design/102 marks Video popular; design/104 marks the FIRST card (Chat) popular. */
export const LA_LANDING_POPULAR: LaConsultTypeId = 'video';
export const LA_CHOOSE_POPULAR: LaConsultTypeId = 'chat';

/**
 * Display order on the landing (design/102): Chat, Video, Audio — not the order the
 * array is declared in, and not the choose screen's order either.
 */
/**
 * design/104's order: Chat, Audio, Video — different again from the landing's
 * Chat, Video, Audio.
 */
export const LA_CHOOSE_ORDER: LaConsultTypeId[] = ['chat', 'audio', 'video'];

export const LA_LANDING_ORDER: LaConsultTypeId[] = ['chat', 'video', 'audio'];

export function laConsultType(id: LaConsultTypeId): LaConsultType {
  return LA_CONSULT_TYPES.find((t) => t.id === id) ?? LA_CONSULT_TYPES[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Advocate experience tiers (design/122, 123, 124 — one per consultation type,
// otherwise identical). "Starting at" prices, which is the second pricing axis.
// ─────────────────────────────────────────────────────────────────────────────

export type LaExperienceId = 'veteran' | 'highly-experienced' | 'experienced' | 'emerging';

export type LaExperienceTier = {
  id: LaExperienceId;
  title: string;
  /** Small caps line above the title, beside a briefcase icon. */
  years: string;
  description: string;
  /** "Starting at ₹X" — NOT combined with the consultation-type price anywhere. */
  startingAt: number;
  strip: [string, string];
  /** Right-hand caption under the price. */
  caption: string;
};

export const LA_EXPERIENCE_TIERS: LaExperienceTier[] = [
  {
    id: 'veteran',
    title: 'Veteran Advocate',
    years: '15+ Years Experience',
    description: 'Get quick answer to your legal queries through secure',
    startingAt: 999,
    strip: ['Up to 30 mins', 'Secure & Private'],
    caption: 'Quick Easy Private',
  },
  {
    id: 'highly-experienced',
    title: 'Highly Experienced Advocate',
    // design/123 sets this as "10 - 15Years Experience" — missing space. Fixed.
    years: '10 - 15 Years Experience',
    description: 'Get quick answer to your legal queries through secure',
    startingAt: 799,
    strip: ['Up to 30 mins', 'Secure & Private'],
    caption: 'Quick Easy Private',
  },
  {
    id: 'experienced',
    title: 'Experienced Advocate',
    years: '5 - 10 Years Experience',
    description: 'Get quick answer to your legal queries through secure',
    startingAt: 599,
    strip: ['Up to 30 mins', 'Secure & Private'],
    caption: 'Quick Easy Private',
  },
  {
    id: 'emerging',
    title: 'Emerging Advocate',
    years: 'Experience of practice upto 5 years',
    description: 'Get quick answer to your legal queries through secure',
    startingAt: 499,
    strip: ['Up to 30 mins', 'Secure & Private'],
    caption: 'Quick Easy Private',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Legal matter categories (design/106).
//
// REPORTED — design/106 uses a DIFFERENT VISUAL LANGUAGE from the rest of the app:
// lavender and blue icon discs, emoji-style illustrations and teal-green titles
// instead of the beige palette and brown headings. This is the second such
// divergence, after the advocate profile (design/81). Left as drawn; the client
// decides whether it gets restyled.
// ─────────────────────────────────────────────────────────────────────────────

export type LaMatter = {
  id: string;
  title: string;
  description: string;
};

/**
 * The ₹25-per-page overage above 25 pages is the SAME rule the Document Forensic and
 * FIR batches carry, so it reads as platform-wide rather than service-specific.
 */
export const LA_PAGE_OVERAGE = 25;

export const LA_MATTERS: LaMatter[] = [
  {
    id: 'general',
    title: 'General Consultation',
    description:
      'Connect with an advocate for personalized legal guidance on your matter and get clarity on the next steps.',
  },
  {
    id: 'family',
    title: 'Family Law',
    description:
      'Matters related to divorce, child custody, marriage, maintenance, restitution of conjugal rights, and other matrimonial and family-related legal issues.',
  },
  {
    id: 'criminal',
    title: 'Criminal Law',
    description:
      'Matters related to bail, trials, criminal appeals, Prevention of Corruption Act (PC Act) matters, and other criminal legal proceedings.',
  },
  {
    id: 'consumer',
    title: 'Consumer Dispute',
    description:
      'Consumer Complaint / Appeal before Different Forums, deficiency in Service and other Consumer related matter',
  },
  {
    id: 'service',
    title: 'Service matter',
    description:
      'Appointment and recruitment, promotions, transfer, suspension termination, salary, pension and other service dispute',
  },
  {
    id: 'cyber',
    title: 'Cyber Crime',
    description:
      'Online fraud, UPI fraud, Cybercrime Complaint, Data theft and privacy Breaches etc.',
  },
  {
    id: 'property',
    title: 'Property Law',
    description: 'Matters Related to property, ownership, agreements & other property disputes.',
  },
  {
    id: 'corporate',
    title: 'Corporate law',
    description: 'Mergers and acquisitions, NCLT, NCLAT, SEBI, SAT, IPR and other Corporate matters.',
  },
  {
    id: 'labour',
    title: 'Labour Law',
    description:
      'Employer-employee dispute, EPF, Industrial dispute, Salary & Wages dispute and other labour dispute',
  },
  {
    id: 'arbitration',
    title: 'Arbitration',
    description:
      'Arbitration case, arbitration appeal, appointment of arbitrator and other arbitration matter.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock consultation record.
//
// REPORTED — design/108's payment screen carries "Ref ID: #LGT-849204", the LEGAL
// NOTICE reference. That same string has now shipped on the FIR, Document Forensic
// and Legal Advice payment screens: a fourth service carrying the first service's
// reference. The payment screens are the ones that keep inheriting it.
//
// A service-specific prefix is used here, as in the other services.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Follow-up booking (design/117).
 *
 * REPORTED — the platform fee here is ₹99 where every other service in the app
 * charges ₹199 (Legal Notice, FIR, Property Search, Document Forensic all use 199).
 * Drawn as ₹99 and totalled as ₹1,599, exactly as the file shows; nothing computes
 * it. If ₹199 is the platform rule, this total is wrong by ₹100.
 */
export const LA_FOLLOWUP = {
  fee: 1500,
  platformFee: 99,
  total: 1599,
  durations: ['30 min', '45 min', '60 min'],
  recommended: '45 min',
  timeSlot: '5:30 PM – 6:15 PM',
  date: '24 Sep 2026',
  duration: '45 minutes',
  previousTopic: 'Property Dispute (Advice)',
  upi: { handle: 'arjun@upi', bank: 'HDFC Bank', tail: '9821' },
};

export const LA_REQUEST_ID = '#LA-738201';

/** The five steps drawn across the top of design/105 and the screens after it. */
export const LA_STEPS = [
  'Your detail',
  'Review detail',
  'Pending for Payment',
  'Assign advocate',
  'Confirmation',
];

/** As drawn on design/111 and design/112. */
export const LA_ADVOCATE = {
  initials: 'AS',
  name: 'Adv. Arjun Sharma',
  practice: 'Property Law',
  experience: '8+ Years Experience',
  rating: '4.8',
  reviews: '120+ Reviews',
};

/**
 * design/111 and design/112 both label the request "#LG12345678" — a placeholder
 * rather than a reference, and a different shape from every other service's id.
 * LA_REQUEST_ID is used instead.
 */
export const LA_PLACEHOLDER_REQUEST_ID = '#LG12345678';

/**
 * design/111 dates everything 23 May 2026 with a meeting on 25 May 2026, and
 * design/112 additionally reads "Placed on 23 May 2025" — a third year. Normalised
 * to September 2026, consistent with the rest of the app.
 */
export const LA_TIMELINE = [
  {
    title: 'Request Submitted',
    body: 'Your consultation request has been received',
    date: '23 Sep 2026',
    time: '10:30 AM',
  },
  {
    title: 'Consultation Scheduled',
    body: 'Your consultation has been scheduled.',
    date: '23 Sep 2026',
    time: '10:32 AM',
  },
  {
    title: 'Assigned by Admin',
    body: 'Assigned Advocate',
    date: '23 Sep 2026',
    time: '10:32 AM',
  },
  {
    // REPORTED: design/111 ticks this as complete while its own body says the
    // consultation is still upcoming. Rendered as drawn.
    title: 'Consultation Completed',
    body: 'Stay tuned! Your consultation is upcoming',
    date: '23 Sep 2026',
    time: '10:32 AM',
  },
];

export const LA_SESSION = {
  /** design/111 reads "25 May 2026, 4:00 PM"; moved to September 2026. */
  date: '25 Sep 2026',
  time: '4:00 PM',
  dateTime: '25 Sep 2026, 4:00 PM',
  placedOn: '23 Sep 2026',
  duration: '30 Mins',
};
