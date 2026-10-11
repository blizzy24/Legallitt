// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE TOOLS — copy and fixtures for designs 261–274.
//
// UI-only. Nothing here is fetched, computed or persisted. Every number is the
// number the export draws, including the ones that do not add up.
//
// ── CONFLICT REGISTER ───────────────────────────────────────────────────────
// Numbered so screens can point at a note. Recorded, NOT resolved.
//
// ARITHMETIC
//  1. design/264 labels its third stat "Average Rating" and prints 128. The
//     average is 4.8; 128 is the review COUNT, already shown in the first tile.
//     The star breakdown (105+15+5+2+1) does sum to 128 correctly. Built with
//     the drawn label and the drawn number.
//  2. design/264 reads "Based on 128 review" — singular.
//  3. design/269's Document Forensic row draws a bar labelled 2 and a subtitle
//     reading "5 Consultations". The five bars sum to 42 only if that row is 2,
//     and 42 is exactly what design/268 prints for Consultations. The BAR is
//     right and the SUBTITLE is the wrong one. Both drawn as drawn.
//  4. design/268 shows Total Earnings ₹85,500. design/256 (Payment & Payout
//     Settings) shows ₹84,500. ₹1,000 apart, two screens one tap from each
//     other. Each screen keeps its own figure.
//  5. design/268 gives Completed Cases and Earnings Overview the SAME +8.4%
//     delta, and labels 86% "Acceptance Rate" in the stat tile while the donut
//     labels the same 86% "Completed".
//
// TIME
//  6. design/271 lists two appointments at "12:00 AM" (Akash Sinha, Priya
//     Mehta). Both are plainly midday.
//  7. design/271 lists a 9:00 AM court hearing AFTER those two 12:00 AM
//     entries. The schedule is not in chronological order. Drawn order kept.
//  8. design/274's Evening slot reads "03:00 AM - 01:00 PM" — it runs backwards
//     and overlaps the Morning slot (09:00 AM - 01:00 PM).
//  9. design/271 and design/274 both label Sunday "San".
//
// IDENTITY AND CONTENT
// 10. design/261's letterhead reads GURNEET CHAWLA ADVOCATE, Enrollment No
//     821/2017 — a sixth advocate name in this project, and an enrollment
//     format unlike MP/1428/2018 (designs 233–244) or D/1842/2015 (245–260).
// 11. design/261 opens "Divorce_Notice_Rahul.pdf" on a "Divorce Matter" and
//     renders a BLANK ruled LEGAL NOTICE template, with "Reffrence Id"
//     misspelled. This is the same blank-form break already flagged on
//     designs 189 and 209: the drafting step produces finished text (266 and
//     267 both show it) and the deliverable renders an empty form. Third
//     service now.
// 12. designs 262 and 263 are the error and empty states, yet both still draw
//     the full toolbar and "Page 1 of 5" for a document that failed to load or
//     does not exist.
// 13. design/264 shows TWO IDENTICAL REVIEWS — same client, same stars, same
//     text, same "2 hours ago". Both rows built as drawn.
// 14. design/271's Akash Sinha row draws a phone icon beside the text "Video
//     Consultation".
// 15. design/272 pre-fills the optional Notes field with "Petitioner Advocate",
//     duplicating the Advocate Role dropdown directly above it.
// 16. design/273's "Case" label is double-printed in the export, one word over
//     another. Rendered once, as "Case".
//
// FURTHER, found while measuring — flagged, not resolved:
// 17. design/271's month grid cannot be copied at all. See the header comment
//     on app/advocate/calendar/index.tsx — this is the one element in the batch
//     where the export is overridden rather than reproduced.
// 18. design/271 sets the fourth appointment's title SMALLER than the other
//     three — 8.5pt cap against 11.0pt — because "High Court of Madhya Pradesh"
//     does not fit at the common size. Built at both sizes, as drawn.
// 19. design/271 leaves 6.5pt between its first three appointment cards and
//     10.5pt before the fourth. Nothing distinguishes that card, so the gap is
//     drawing slop; a single 6.5pt gap is used and the fourth card therefore
//     sits 4pt higher than the export.
// 20. design/271's month grid is not centred on the screen: its ink runs
//     34.5–361.0pt, 4.75pt right of centre. Reproduced rather than tidied up.
// 21. design/271 and design/274 draw the same Available Hours row with
//     different strings: "09:00 AM - 6:00 PM" on 271, "09:00 AM - 06:00 PM" on
//     274. Each screen keeps the string it was drawn with.
// 22. design/272's Save button sits on a 20pt gutter where every field above it
//     sits on 28pt; design/273 does the same with its two action buttons and
//     the "Actions" label against the 21pt its cards use.
// 23. design/273 puts a PHOTOGRAPH of the client in its header card. No
//     photography ships with this prototype, so the house convention is used —
//     a brand circle with the UserRound glyph, as components/AdvocateCasesList
//     already does. Nothing was invented to fill it.
// ─────────────────────────────────────────────────────────────────────────────

export const AT_DOC_VIEWER = {
  title: 'Document Viewer',

  // ⚠ Note 11: a divorce notice that renders a blank legal-notice form.
  file: {
    name: 'Divorce_Notice_Rahul.pdf',
    clientLabel: 'Client',
    clientValue: 'Rahul Sharma',
    caseLabel: 'Case',
    caseValue: 'Divorce Matter',
    badge: 'Client\ndocuments',
  },

  // ⚠ Note 10: the letterhead is a sixth advocate. The document body itself is
  // components/LegalDocumentPage — the same printed form designs 189 and 209
  // draw, reused rather than rebuilt.
  documentTitle: 'LEGAL NOTICE',

  // ⚠ Note 12: the pager and toolbar are drawn on all three states, including
  // the one where the document failed and the one where it does not exist.
  page: 'Page 1 of 5',
  tools: ['Zoom Out', 'Zoom In', 'Fit to Screen', 'Download', 'Share', 'More'],

  error: {
    title: 'Unable to load document',
    body: 'Something went wrong while loading this documents',
    cta: 'Try Again',
  },
  empty: {
    title: 'No document available',
    body: 'There is no document uploaded for this case yet',
    cta: 'Back to Case',
  },
};

export const AT_REVIEWS = {
  title: 'Review and Rating',

  sectionTitle: 'Your Rating',
  ago: '1 hour ago',
  score: '4.8',
  // ⚠ Note 2: "review", singular, against 128 of them.
  based: 'Based on 128 review',
  // The breakdown does sum to 128 correctly: 105+15+5+2+1.
  breakdown: [
    { stars: 105, fill: 0.74 },
    { stars: 15, fill: 0.43 },
    { stars: 5, fill: 0.17 },
    { stars: 2, fill: 0.1 },
    { stars: 1, fill: 0.045 },
  ],

  // ⚠ Note 1: the third tile is labelled "Average Rating" and prints 128. The
  // average is 4.8 — shown directly above — and 128 is the review count, which
  // is already the FIRST tile. Drawn label, drawn number, both kept.
  tiles: [
    { value: '128', label: 'Total Reviews' },
    { value: '94%', label: 'Positive Reviews' },
    { value: '128', label: 'Average Rating' },
  ],

  reviewsTitle: 'Client Reviews',
  filters: ['All', 'Newest', 'Highest Rated', 'Lowest Rated'],

  // ⚠ Note 13: design/264 draws TWO IDENTICAL REVIEWS — same client, same five
  // stars, same sentence, same "2 hours ago". Both built as drawn.
  reviews: [
    {
      name: 'Rahul Sharma',
      stars: 5,
      body: 'Very professional and explained the legal process clearly. The consultation was helpful and easy to understand',
      matter: 'Divorce Consultation',
      ago: '2 hours ago',
    },
    {
      name: 'Rahul Sharma',
      stars: 5,
      body: 'Very professional and explained the legal process clearly. The consultation was helpful and easy to understand',
      matter: 'Divorce Consultation',
      ago: '2 hours ago',
    },
  ],

  empty: {
    title: 'No Review Yet',
    body: 'Client reviews will appear here after completed consultations',
  },
};

export const AT_DRAFT_EDITOR = {
  // ⚠ The header, step label, status chip, party row and all six section cards
  // are design/188's and are read from ADV_NOTICE_DRAFT. Only what design/266
  // changes lives here.
  saveDraft: 'Save Draft',
  preview: 'Preview',
  cta: 'Continue to Review',
};

export const AT_RESPONSE_EDITOR = {
  // ⚠ Everything above the footer is design/189's and is read from
  // ADV_NOTICE_RESPONSE. design/267 changes only these three.
  back: 'Back',
  confirm: 'Confirm & Upload',
  generate: 'Generate Draft with AI',
};

export const AT_ANALYTICS = {
  title: 'Analytics',
  month: 'August 2026',
  range: 'This Month',

  // ⚠ Note 4: Total Earnings here is ₹85,500. design/256 (Payment & Payout
  // Settings), one tap away, says ₹84,500. ₹1,000 apart.
  // ⚠ Note 5: Completed Cases and Earnings Overview carry the SAME +8.4%, and
  // "Acceptance Rate 86%" is the same 86% the donut labels "Completed".
  tiles: [
    { label: 'Total Earnings', value: '₹85,500', delta: '18.5%' },
    { label: 'Consultations', value: '42', delta: '12.3%' },
    { label: 'Completed Cases', value: '36', delta: '8.4%' },
    { label: 'Acceptance Rate', value: '86%', delta: '5.2%' },
  ],

  earnings: {
    title: 'Earnings Overview',
    value: '₹85,500',
    sub: 'This Month',
    delta: '8.4%',
    deltaSuffix: 'Higher Than last Month',
    chartLabel: 'Earnings',
    axis: ['₹30k', '₹20k', '₹10k', '₹0'],
    weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  },

  consultations: {
    title: 'Consultation Overview',
    total: '42',
    totalLabel: 'Total',
    legend: [
      { label: 'Completed', value: '36 (86%)', pct: 0.86, tone: 'green' },
      { label: 'Pending', value: '4 (10%)', pct: 0.1, tone: 'brand' },
      { label: 'Cancelled', value: '2 (4%)', pct: 0.04, tone: 'red' },
    ],
  },

  performance: 'Performance',

  error: {
    title: 'Unable to Load Analytics',
    body: 'Please try again',
    cta: 'Try Again',
  },
};

export const AT_PERFORMANCE = {
  title: 'Analytics',
  month: 'August 2026',
  range: 'This Month',

  serviceTitle: 'Service Performance',
  // ⚠ Note 3: the Documents Forensic row draws a bar labelled 2 and a subtitle
  // reading "5 Consultations". The five bars sum to 42 only if that row is 2,
  // and 42 is exactly what design/268 prints for Consultations — so the BAR is
  // right and the SUBTITLE is the wrong one. Both kept as drawn.
  //
  // ⚠ The bar widths are NOT proportional to the values either: 18 draws 160pt
  // and 10 draws 71pt, where proportion would give 89. Measured widths are used
  // so the screen matches the export.
  services: [
    { label: 'Legal Advice', sub: '18 Consultations', value: '18', w: 160 },
    { label: 'Legal Notice', sub: '10 Consultations', value: '10', w: 71 },
    { label: 'Property Search', sub: '7 Consultations', value: '7', w: 54 },
    { label: 'FIR Draft', sub: '5 Consultations', value: '5', w: 41 },
    { label: 'Documents Forensic', sub: '5 Consultations', value: '2', w: 26 },
  ],

  monthlyTitle: 'Monthly Performance',
  columns: ['Monthly', 'Earnings', 'Consultations', 'Rating'],
  months: [
    { month: 'May', earnings: '₹62,000', consults: '31', rating: '4.6' },
    { month: 'June', earnings: '₹72,000', consults: '36', rating: '4.7' },
    { month: 'July', earnings: '₹79,500', consults: '39', rating: '4.8' },
    { month: 'August', earnings: '₹85,500', consults: '42', rating: '4.8', current: true },
  ],
};

type Appointment = {
  time: string;
  tag?: string;
  name: string;
  /**
   * ⚠ design/271 draws this one title at 8.5pt cap where the other three are
   * 11.0pt — the long court name does not fit at the common size. Kept as
   * drawn rather than silently resized.
   */
  longName?: boolean;
  matter: string;
  meta: string;
  icon?: 'video' | 'phone';
  status: string;
  upcoming?: boolean;
};

type HearingField = {
  label: string;
  value: string;
  /** Draws the dropdown chevron. Static — no picker is scoped. */
  select?: boolean;
  /** The hearing-date field alone is drawn short. */
  short?: boolean;
  /** The notes field is the one 60pt box. */
  tall?: boolean;
};

export const AT_ADD_HEARING = {
  title: 'Add Court Hearing',

  fields: [
    { label: 'Court Type', value: 'High Court', select: true },
    { label: 'Court Name', value: 'High Court of Madhya Pradesh' },
    { label: 'Court Location', value: 'Jabalpur, Madhyapradesh' },
    { label: 'Courtroom/ Court Number', value: 'Courtroom No. 12' },
    { label: 'Case Title', value: 'Rahul Sharma Vs State' },
    { label: 'Case Number', value: 'WP/1234/2026' },
    { label: 'Hearing Date', value: '13 Aug 2026', short: true },
    { label: 'Advocate Role', value: 'Petitioner Advocate', select: true },
    // ⚠ Note 15: the optional Notes field is pre-filled with the value of the
    // Advocate Role dropdown directly above it.
    { label: 'Notes (Optional)', value: 'Petitioner Advocate', tall: true },
  ] as HearingField[],

  remindLabel: 'Remind Me',
  remindHint: '(Select Multiple)',
  reminders: [
    { label: '1 Day Before', custom: false },
    { label: '3 Hours Before', custom: false },
    { label: 'Custom', custom: true },
  ],

  save: 'Save Hearing',
};

export const AT_APPT_DETAILS = {
  title: 'Appointment Details',

  client: {
    name: 'Rahul Sharma',
    matter: 'Divorce Consultation',
    status: 'Confirmed',
  },

  rows: [
    { label: 'Date', value: '13 August 2026' },
    { label: 'Time', value: '10:00 AM - 10:30 AM' },
    { label: 'Consultation', value: 'Video Call', icon: true },
    { label: 'Duration', value: '30 Minutes' },
    // ⚠ Note 16: design/273 double-prints this label, one word over another.
    // Rendered once.
    { label: 'Case', value: 'Divorce Matter' },
    { label: 'Booking', value: '#LA-2026-0813-001' },
  ] as { label: string; value: string; icon?: boolean }[],

  actions: 'Actions',
  join: 'Join Consultation',
  viewCase: 'View Case',
};

export const AT_AVAILABILITY = {
  title: 'Manage Availability',

  workingHours: 'Working Hours',
  // ⚠ Note 9: Sunday is labelled "San" here too.
  days: [
    { label: 'Mon', on: true },
    { label: 'Tue', on: true },
    { label: 'Wed', on: true },
    { label: 'Thu', on: true },
    { label: 'Fri', on: true },
    { label: 'Sat', on: false },
    { label: 'San', on: false },
  ],

  hoursTitle: 'Available Hours',
  // ⚠ Note 21: design/271 prints this same value as "09:00 AM - 6:00 PM".
  // design/274 pads the hour. Each screen keeps the string it was drawn with.
  hours: '09:00 AM - 06:00 PM',
  edit: 'Edit Hours',

  slots: [
    { label: 'Morning', value: '09:00 AM - 01:00 PM' },
    // ⚠ Note 8: drawn as "03:00 AM - 01:00 PM" — it runs backwards and
    // overlaps the Morning slot above it. Drawn as drawn.
    { label: 'Evening', value: '03:00 AM - 01:00 PM' },
  ],

  addSlot: 'Add Time Slot',
};

export const AT_CALENDAR = {
  title: 'Appointment Calendar',

  availability: {
    title: 'Your Availability',
    on: 'Available for Consultations',
    sub: 'Clients can book consultations during your available hours',
  },

  // ⚠ NOTE 17 — design/271's month grid cannot be copied. It places 1 August
  // 2026 under FRI (it is a Saturday) and its trailing row reads
  // 31, 1, 2, 3, 2, 3, 4, repeating the 2 and the 3. The grid is therefore
  // COMPUTED from the displayed month — the one place in this batch where the
  // export is overridden. See components/MonthGrid.tsx. The selected day and
  // the dot markers below are still exactly as drawn.
  year: 2026,
  month: 7, // August, 0-indexed
  selected: 13,
  marked: [13, 14, 15, 16],

  todayLabel: 'Today, 13 August',
  scheduleLabel: 'Today’s Schedule',
  addAvailability: 'Add Availability',

  appointments: ([
    {
      time: '10:00\nAM',
      name: 'Rahul Sharma',
      matter: 'Divorce Consultation',
      meta: 'Video Consultation   •   30 min',
      icon: 'video',
      status: 'Confirmed',
    },
    {
      // ⚠ Note 6: drawn as 12:00 AM. It is plainly midday.
      // ⚠ Note 14: this row draws a PHONE icon beside the text
      //    "Video Consultation".
      time: '12:00\nAM',
      name: 'Akash Sinha',
      matter: 'Property Dispute',
      meta: 'Video Consultation   •   30 min',
      icon: 'phone',
      status: 'Confirmed',
    },
    {
      // ⚠ Note 6 again.
      time: '12:00\nAM',
      name: 'Priya Mehta',
      matter: 'Legal Advice',
      meta: 'Video Consultation   •   30 min',
      icon: 'video',
      status: 'Confirmed',
    },
    {
      // ⚠ Note 7: a 9:00 AM hearing listed AFTER two 12:00 AM entries. The
      // schedule is not in chronological order. Drawn order kept.
      time: '9:00\nAM',
      tag: 'Court Hearing',
      name: 'High Court of Madhya Pradesh',
      longName: true,
      matter: 'Courtroom No. 12   •   Sharma vs. State',
      meta: 'Case No. WP/1234/2026',
      status: 'Upcoming',
      upcoming: true,
    },
  ] as Appointment[]),

  addHearing: 'Add Hearing',

  manage: {
    title: 'Manage Availability',
    // ⚠ Note 9: Sunday is labelled "San". Note that design/271's month-grid
    // header above spells it SUN correctly — only this row is wrong.
    days: [
      { label: 'Mon', on: true },
      { label: 'Tue', on: true },
      { label: 'Wed', on: true },
      { label: 'Thu', on: true },
      { label: 'Fri', on: true },
      { label: 'Sat', on: false },
      { label: 'San', on: false },
    ],
    hoursTitle: 'Available Hours',
    hours: '09:00 AM - 6:00 PM',
    edit: 'Edit Hours',
  },
};
