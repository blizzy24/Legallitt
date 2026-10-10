// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE DOCUMENT FORENSIC FLOW — all copy for designs 222–228.
//
// ⚠⚠ CONTRADICTIONS. Every one is COMMENTED, NOT RESOLVED. One value is picked so
// the screen builds; every variant seen is recorded with its source file.
//
// 1. TWO CLIENTS, ONE DOCKET.
//      Rahul Sharma            designs 222, 223, 224, 225
//      Vikramaditya Singhania  designs 226, 227, 228
//    Vikramaditya Singhania was the property OWNER in the Property Search batch
//    (Sale_Deed_Singhania.pdf, designs 207/210), not a client. The docket is
//    DF-2026-1048 throughout, so one request changes client halfway.
//
// 2. THREE MATTERS, ONE DOCKET.
//      "Signature & Document Forensic", High Court Indore        design/227
//      "Land Title Dispute Forensic", Bengaluru Civil Court      design/228
//      "Document Forensic (Property Sale Deed 1998)"             designs 229/231
//    Indore and Bengaluru are 1,500km apart and in different High Court circuits.
//
// 3. THE DEPONENT IS A CLIENT-SIDE ADVOCATE. design/227's affidavit is sworn by
//    "Adv. Priya Sharma, Enr: MP/1429/2014". Priya Sharma appears on the CLIENT
//    side of this app. The signed-in advocate is Abhishek Chouhan (design/148) /
//    Abhishek Sahu (design/188) / Gurneet Chawla (designs 189/209) — a fifth name.
//
// 4. THE FEE. design/223 shows a ₹15,000 Service Fee; design/232 pays the advocate
//    ₹4,500. If those are the same transaction the platform keeps ₹10,500 — a 70%
//    commission, against 6%, 10%, 14.286%, 15% and 15.56% elsewhere in the app.
//    Neither number is computed; both stored as drawn.
//
// 5. THE SHARED SUFFIX. DF-2026-1048, FIR-2026-1048, PSR-2026-1048, LN-2026-1048,
//    CM-2026-1048 and HCR-2026-1048 — six unrelated services, one serial.
//
// FURTHER CONTRADICTIONS FOUND IN THESE EXPORTS, not in the brief:
//
// 6. design/222 DRAWS TWO SEARCH FIELDS, stacked, with different placeholders:
//    "Search client, document or request ID" and the cases list's own
//    "Search client, case, service or case ID...".
//
// 7. THE SERVICE CHIP READS "Documents Forensic" — plural — where the card chip,
//    the service name and every other screen read "Document Forensic".
//
// 8. THE DOCUMENT COUNT. design/223 says "2 Evidentiary Files" and design/224 says
//    "2 Documents", but design/224's own readiness card says "3 of 3 Ready".
//
// 9. THE CLIENT'S CITY AND NUMBER. design/223 puts Rahul Sharma in "Mumbai,
//    Maharashtra" on +91 98765 •••••. Every other screen in the project puts him
//    in Indore (M.P.) on +91 98260 41298.
//
// 10. DISCLOSURE. design/223 MASKS the phone and email ("Masked", "Verified");
//     designs 215/216/217/219 print the same client's number in full. A fifth
//     disclosure treatment.
//
// 11. design/223's header reads "Request Details" and so does design/224's — two
//     different screens, same title, in sequence.
// ═════════════════════════════════════════════════════════════════════════════

export const DF_REQUESTS = {
  title: 'Document Forensic Requests',
  eyebrow: 'Legalitt Forensic Portal',
  subtitle: 'Review and manage incoming forensic requests.',
  /** ⚠ design/222 draws a SECOND search field above the list's own. See note 6. */
  search: 'Search client, document or request ID',
  /** ⚠ Plural, unlike every other use. See note 7. */
  service: 'Documents Forensic',
  /** ⚠ design/222 draws TWO IDENTICAL cards, as designs 205 and 214 did. */
  drawnCardCount: 2,
};
