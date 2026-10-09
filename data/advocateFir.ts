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
