// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE FIR FLOW — all copy for designs 214–220.
//
// ⚠⚠ CONTRADICTIONS. Every one of these is COMMENTED, NOT RESOLVED. One value is
// picked so the screens build; every variant seen is recorded with its source.
//
// 1. THE FEE. Two incompatible numbers for the same matter:
//      design/214  "Fee: ₹4,500"                        (the cases card)
//      design/215  client ₹3,500 − Legalitt ₹500 = ₹3,000 advocate
//    Both are kept below, each on the screen that draws it. They cannot both be
//    right: either the client pays 4,500 and the split is wrong, or the client
//    pays 3,500 and the list is wrong.
//
// 2. THE COMMISSION RATE. design/215's ₹500 of ₹3,500 is 14.286%. The app already
//    carries, in data/advocateSide.ts and elsewhere:
//      6%      ADV_COMMISSION (legacy)
//      10%     ADV_COMMISSION_10 (advNetAt10)
//      15%     legal notice schedule
//      15.56%  design/206's property search (₹700 of ₹4,500, stated not computed)
//    14.286% is a fifth. Stored as a literal, deliberately NOT computed.
//
// 3. THE DOCKET NUMBER, and the "#" prefix:
//      FIR-2026-1048    design/214 (card), design/215 (request), design/220 (case)
//      #FIR-2026-8841   design/218 (docket row), design/219 (review header)
//    Two serials AND an inconsistent prefix. 1048 is used as the id because three
//    screens carry it and it matches ADV_CASES; 8841 is kept verbatim on the two
//    screens that draw it, prefix and all.
//
// 4. THE DOCUMENT SET. One screen apart, for the same request:
//      design/215  "Documents · 5 Files"  — Written Complaint Statement.pdf,
//                  Vehicle Damage & CCTV Stills.pdf, Complainant Aadhaar Card.pdf,
//                  Witness Statement (Rajesh).pdf, Shop Lease Agreement.pdf
//      design/216  "Client Documents · 4 Files" — Complaint.pdf, Case Papers.pdf,
//                  ID Proof.pdf, Supporting Document.pdf
//      design/217  "5 Attached" — "Complaint, ID, Witness statement, CCTV & Lease"
//      design/219  "4 Files Attached"
//    Both lists are stored, each on its own screen, because both are drawn.
//
// 5. THE INCIDENT DATE IS IN THE FUTURE. 18 Oct 2026 on designs 215/216/217,
//    against the app's current date of 9 Oct 2026. design/220's payment date,
//    19 Oct 2026, is later still. A previous batch normalised the advocate flow to
//    September 2026 for exactly this reason. NOT normalised here — left as drawn
//    so the contradiction stays visible. Flagged.
//
// 6. THE CLIENT'S MOBILE IS UNMASKED on designs 215, 216, 217 and 219
//    (+91 98260 41298). design/207 masks the same client's number as
//    "+91 98260 •••••" and their email as "rahul.shar***@example.com".
//
// 7. design/215's email is CLIPPED in the export — "rahul@example.co" with the
//    closing "m" cut off by the field. Stored complete; never ellipsized.
// ═════════════════════════════════════════════════════════════════════════════

/** ⚠ 14.286% — a fifth commission rate. Stored, not computed. See note 2. */
export const FIR_COMMISSION_NOTE =
  'design/215: ₹500 of ₹3,500 = 14.286%. Not derivable from any existing rate.';

// ── design/214 — cases list filtered to FIR Draft ────────────────────────────

export const FIR_REQUESTS = {
  /**
   * ⚠ design/214 draws the Cases TAB (scales tab active, full tab bar), i.e. the
   * same screen as designs 204 and 205 with the FIR Draft chip selected — not a
   * pushed screen. Built at this route on request, without the tab bar.
   */
  title: 'FIR Requests',
  service: 'FIR Draft',
  /** ⚠ design/214 draws TWO IDENTICAL FIR cards, as design/205 drew three. */
  drawnCardCount: 2,
};

// ── design/215 — FIR request details ─────────────────────────────────────────

export const FIR_REQUEST = {
  title: 'Fir Request Details',
  statusChip: 'New Request',
  recv: 'Recv: Today, 10:14 AM',
  idLabel: 'FIR Request ID:',
  /** ⚠ 1048 here; design/218 and design/219 read #FIR-2026-8841. See note 3. */
  id: 'FIR-2026-1048',
  stationLabel: 'Police Station:',
  station: 'Central Kotwali, Indore',

  client: {
    title: 'Client Details',
    chip: 'KYC Verified',
    cells: [
      { label: 'CLIENT NAME', value: 'Rahul Sharma' },
      { label: 'CITY', value: 'Indore (M.P.)' },
      /** ⚠ Unmasked. design/207 masks this client's number. See note 6. */
      { label: 'MOBILE', value: '+91 98260 41298', icon: 'phone' as const },
      /** ⚠ design/215 clips this to "rahul@example.co". Stored whole. See note 7. */
      { label: 'EMAIL', value: 'rahul@example.com', icon: 'mail' as const },
    ],
  },

  incident: {
    title: 'Incident Overview',
    rows: [
      { icon: 'alert' as const, label: 'Incident Type', value: 'Criminal Intimidation & Extortion Attempt' },
      /** ⚠ 18 Oct 2026 is NINE DAYS IN THE FUTURE. Not normalised. See note 5. */
      { icon: 'calendar' as const, label: 'Date & Time', value: '18 Oct 2026, ~09:30 PM' },
      { icon: 'pin' as const, label: 'Incident Location', value: 'Commercial Complex Parking, Scheme No. 54, Indore' },
    ],
  },

  statement: {
    title: "Client's Statement",
    quote:
      '"Two unknown individuals blocked my vehicle at the office parking gate, demanded extortion money of ₹2,50,000, verbally threatened me, and damaged the front windshield. Security guard Rajesh witnessed the scuffle."',
  },

  fee: {
    title: 'Fee Structure',
    rows: [
      { label: 'Client Retainer Fee', value: '₹3,500' },
      /** ⚠ ₹500 of ₹3,500 = 14.286%, a fifth commission rate. See note 2. */
      { label: 'Legalitt Service Fee', value: '-₹500', deduct: true },
    ],
    advocateLabel: 'ADVOCATE WILL RECEIVE',
    /** ⚠ Stored as drawn. NOT computed — see FIR_COMMISSION_NOTE. */
    advocateAmount: '₹3,000',
    escrow: 'Escrow Protected • Direct Bank Transfer upon acceptance',
  },

  documents: {
    title: 'Documents',
    /** ⚠ design/216 lists FOUR different files for the same request. See note 4. */
    chip: '5 Files',
    verified: 'All Verified',
    rows: [
      { icon: 'doc' as const, name: 'Written Complaint Statement.pdf', meta: '1.2 MB • Signed' },
      { icon: 'image' as const, name: 'Vehicle Damage & CCTV Stills.pdf', meta: '4.8 MB • 3 Images' },
      { icon: 'id' as const, name: 'Complainant Aadhaar Card.pdf', meta: '840 KB • Masked' },
      { icon: 'quote' as const, name: 'Witness Statement (Rajesh).pdf', meta: '620 KB • Eyewitness' },
      { icon: 'home' as const, name: 'Shop Lease Agreement.pdf', meta: '2.1 MB • Supporting' },
    ],
    warn: 'Review documents thoroughly before accepting this request.',
  },

  reject: 'Reject',
  accept: 'Accept Request',
  rejectCaption: 'Reject → Returns to Admin',
  acceptCaption: 'Accept → Review & Draft',
};
