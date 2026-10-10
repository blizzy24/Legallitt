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
