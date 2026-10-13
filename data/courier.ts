// ─────────────────────────────────────────────────────────────────────────────
// COURIER / DOCUMENT DELIVERY — copy and fixtures for designs 275–287.
//
// UI-only. Nothing here is fetched, computed or persisted.
//
// ── CONFLICT REGISTER ───────────────────────────────────────────────────────
// Numbered so screens can point at a note. Recorded, NOT resolved.
//
// ⚠⚠ 1. THE BIG ONE — design/279 is three services collided on one screen, and
//    it is worse than it first looks. It is reached from a ₹290 COURIER
//    payment, and it draws:
//      · design/278's header, verbatim — "Scan & Pay / UPI Dynamic QR" and
//        "Scan the QR code using any UPI app to complete your payment." So the
//        success screen still wears the payment screen's chrome.
//      · Request ID #PSR739482 — the PROPERTY SEARCH prefix.
//      · "Your payment of ₹1377 has been received." — a fourth amount.
//      · "Your forensic analysis request has been submitted." — DOCUMENT
//        FORENSIC copy, on a courier booking.
//    Built exactly as drawn. THIS SCREEN CANNOT SHIP AS IT IS.
//
// MONEY
//  2. design/277: Service Fee ₹250 + "Goods & Services Tax (GST 18%)" ₹40 =
//     "Total Payable ₹290". 18% of ₹250 is ₹45 and the total would be ₹295.
//     This is the same ₹40 GST error already flagged in the Legal Advice batch.
//     ₹290 is now printed four times across 277 and 278.
//  3. design/278's QR is labelled "Legal Notice" on a High Court
//     Representation matter. Wrong service name on the payment.
//  4. design/279 shows ₹1377 — see note 1.
//
// COURIER AND RECIPIENT
//  5. Two couriers in one flow: "Powered by Blue Dart" and Courier "Blue Dart"
//     on 276/280, "DHL Express" with waybill DHL-8942-0194 on 281.
//  6. design/281 addresses "Advocate Sarah Jenkins, High Court Chambers, 4th
//     Floor, 24 St. George's Avenue, District 3" — a seventh advocate name, and
//     an address in no Indian format. Every other screen in this batch sends to
//     Adv. Gurneeet Chawla in Indore.
//  7. Document count is 5 on 275/284, 3 on 281, and 4 on 282 (four rows
//     labelled "Original Hardcopy 1–4").
//
// STRUCTURAL
//  8. design/284 has "Send by Yourself" selected but its footer still reads
//     "Next: Book Legalitt Delivery Partner pickup" — the other branch.
//  9. design/277 shows TWO payment methods selected at once: the UPI radio is
//     filled AND "Scan QR Code" carries a "Selected" pill with its own filled
//     radio. A real radio group cannot do this. Built as drawn — and it is how
//     components/PaymentMethods already behaves, so nothing was changed.
// 10. Matter #HCR-2026-1048 — a fifth service on the 1048 suffix, after PSR-,
//     FIR-, DF- and VER-.
// 11. design/277's title reads "High Court Represantative" — misspelt, and a
//     different label from "High Court Representation" on 275/284.
// 12. designs 276, 280, 282, 283, 285, 286 and 287 are drawn almost entirely
//     with placeholder tokens. Real sample values are rendered instead of the
//     brackets; every placeholder is listed in PLACEHOLDERS below. That list is
//     what the client still has to specify.
//
// FURTHER, found while measuring:
// 13. Every export in this batch is wrapped in a black device frame of a
//     different width (0, 24, 32 or 40px), so the files are 780/828/844/860px
//     wide for one 390pt screen. Cropped to content they are all 780px =
//     2.0000 px/pt. See constants/tokens/courier.ts.
// 15. design/279 has no courier content of any kind — no waybill, no address,
//     no document count. Nothing on it can be reached from the courier flow
//     except the "Start Tracking" button.
// 18. design/277's reference reads #LGT-849204 — the LEGAL NOTICE prefix — on a
//     courier payment for matter #HCR-2026-1048, and its trailing "·" has
//     nothing after it. design/86 carried the same wrong reference.
// 17. design/275/284 clip the document chip row and tint the clipped fourth
//     chip differently from the three readable ones. See CO_CHOOSE.docChips.
// 16. design/283 has no delivery tracker, although 280, 281 and 287 all draw
//     one and the brief expected four. It shows a document list with a
//     "Received" pill instead.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every field the designs left as a bracketed placeholder, with the screens it
 * appears on. Sample values are rendered in their place; these are the fields
 * the client still has to specify.
 */
export const PLACEHOLDERS: { field: string; screens: string }[] = [
  { field: '[Client Name]', screens: '276, 282' },
  { field: '[Pickup Address]', screens: '276, 280' },
  { field: '[City], [State] - [PIN]', screens: '276, 286, 287' },
  { field: '[Mobile Number]', screens: '276, 286, 287' },
  { field: '[Advocate Name]', screens: '276, 283, 285, 287' },
  { field: '[Receiver Address]', screens: '276, 280' },
  { field: '[Document Count] Documents', screens: '276, 280, 282, 283, 285, 286, 287' },
  { field: '[Document Name]', screens: '276, 282, 283, 285, 286, 287' },
  { field: '[Weight]', screens: '276' },
  { field: '[Date / Time]', screens: '276' },
  { field: '[₹ Amount]', screens: '276' },
  { field: '[Courier Name]', screens: '280, 282, 283, 286, 287' },
  { field: '[Waybill Number]', screens: '280, 282, 283' },
  { field: '[Date]', screens: '280, 282, 283, 285, 287' },
  { field: '[Time]', screens: '282, 285' },
  { field: '[Receiver Name]', screens: '280, 286' },
  { field: '[Case Name]', screens: '282, 283' },
  { field: '[Case ID]', screens: '282, 283' },
  { field: '[Name if available]', screens: '282' },
  { field: '[Office / Chamber Name]', screens: '285, 286, 287' },
  { field: '[Full Office Address]', screens: '285, 286, 287' },
  { field: '[Area / Locality]', screens: '285' },
  { field: '[City]', screens: '285' },
  { field: '[State]', screens: '285' },
  { field: '[PIN Code]', screens: '285' },
  { field: '[Email Address]', screens: '285' },
  { field: '[Delivery ID]', screens: '286, 287' },
  { field: '[Tracking Number]', screens: '286, 287' },
  { field: '[Courier Office]', screens: '286, 287' },
  { field: '[Tracking Link]', screens: '286, 287' },
  { field: '[Receipt File]', screens: '286, 287' },
];

/** The recipient every screen but design/281 uses. */
export const ADVOCATE = {
  name: 'Adv. Gurneeet Chawla',
  office: 'Chamber No. 14, High Court Bar Building',
  address: 'High Court Bar Building, Chamber No. 14',
  area: 'Sudama Nagar',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pin: '452001',
  cityLine: 'Indore, Madhya Pradesh • 452001',
  mobile: '+91 98260 11482',
  email: 'gurneeet.chawla@legalitt.in',
};

export const CLIENT = {
  name: 'Rahul Sharma',
  address: '12B Anand Nagar, Opp. Treasure Island',
  cityLine: 'Indore, Madhya Pradesh - 452001',
  mobile: '+91 90395 77214',
};

export const MATTER = {
  // ⚠ Note 10: a fifth service on the 1048 suffix.
  service: 'High Court Representation',
  ref: 'Matter #HCR-2026-1048',
  title: 'Rahul Sharma vs Amit Verma',
  advocateLabel: 'Assigned Advocate:',
  advocateName: 'Adv. Gurneeet Chawla',
};

/** designs 275 + 284 — one screen, two selection states. */
export const CO_CHOOSE = {
  title: 'Send Documents',
  intro: 'Choose how you want to send your physical documents.',

  docsTitle: 'Documents Ready',
  // ⚠ Note 7: 5 here, 3 on design/281, 4 on design/282.
  docsCount: '5 Documents',
  docsView: 'View',
  // ⚠ Note 17: the export CLIPS this row — only three chips are readable and a
  // fourth runs off the right edge in a tan fill instead of the grey of the
  // first three. It is a horizontal scroller, so the chip is kept and the
  // fourth keeps its tan. "Affidavit" and "Vakalatnama" are INVENTED labels:
  // the count says five documents and the export shows no legible fourth or
  // fifth name. They are the only invented copy in this batch.
  docChips: ['Case Papers', 'Court Order', 'ID Proof', 'Affidavit', 'Vakalatnama'],

  chooseTitle: 'Choose how to send',
  chooseHint: 'Tap an option',

  options: [
    {
      key: 'self' as const,
      title: 'Send by Yourself',
      sub: 'Send the documents directly to your advocate.',
      note: 'Use any courier or delivery service.',
    },
    {
      key: 'partner' as const,
      title: 'Legalitt Delivery Partner',
      recommended: 'Recommended',
      sub: 'Legalitt will arrange delivery to your advocate.',
      safe: 'Safe document delivery.',
    },
  ],

  sendToTitle: 'Send To',
  copy: 'Copy',

  infoTitle: 'Your advocate needs the physical documents for the case.',
  infoBody: 'You can send them yourself or use Legalitt Delivery.',

  cta: 'Continue',
  // ⚠ Note 8: design/284 selects "Send by Yourself" and still prints this
  // Delivery-Partner line. Drawn that way; the footer does not change with the
  // selection, exactly as the two exports show it.
  foot: 'Next: Book Legalitt Delivery Partner pickup',
};

/** design/276 — delivery details. */
export const CO_DETAILS = {
  title: 'Delivery Details',
  notice: 'Check the delivery details before booking.',

  partnerTitle: 'Legalitt Delivery Partner',
  selected: 'Selected',
  partnerSub: 'Your documents will be picked up and sent to the receiver.',
  // ⚠ Note 5: "Powered by Blue Dart" here and Courier "Blue Dart" on 280,
  // against "DHL Express" with a DHL waybill on 281.
  powered: 'Powered by Blue Dart',
  direct: 'Direct secure legal courier',

  pickupTitle: 'Pickup From',
  pickupAction: 'Change',
  sendTitle: 'Send To',
  sendAction: 'View Address',

  docsTitle: 'Documents',
  docsCount: '3 Documents',
  docs: ['Case Papers.pdf', 'Court Order.pdf', 'ID Proof.pdf'],
  viewDocs: 'View Documents',

  deliveryTitle: 'Delivery',
  cells: [
    { label: 'Courier', value: 'Blue Dart' },
    { label: 'Package', value: '1' },
    { label: 'Weight', value: '450 g' },
    { label: 'Estimated Delivery', value: '25 Oct, by 5:00 PM' },
  ],

  feeTitle: 'Delivery Fee',
  feeAmount: '\u20B9290/-',
  feeNote: 'This is the delivery fee only. It is separate from any legal service fees.',

  bannerTitle: 'Please check both addresses before booking.',
  bannerBody: 'Your documents will be picked up from the address shown above.',

  cta: 'Book Delivery',
  foot: 'Next: Shipment Created',
};

/** design/277 — complete payment. */
export const CO_PAYMENT = {
  title: 'Complete Payment',
  // ⚠ Note 11: drawn "High Court Represantative" — misspelt, and a different
  // label from "High Court Representation" on designs 275 and 284.
  service: 'High Court Represantative',
  // ⚠ Note 18: the reference is #LGT-849204 — the LEGAL NOTICE prefix, on a
  // courier payment for matter #HCR-2026-1048. design/86 carried the same wrong
  // reference. The trailing "·" has nothing after it; it is drawn and kept.
  ref: 'Ref ID: #LGT-849204 \u00B7',
  // ⚠ Note 2: 18% of ₹250 is ₹45, not ₹40, and the total would be ₹295.
  lines: [
    { label: 'Service Fee', value: '\u20B9250/-' },
    { label: 'Goods & Services Tax (GST 18%)', value: '\u20B940/-' },
  ],
  totalLabel: 'Total Payable',
  total: '\u20B9290/-',
  note: 'Inclusive of all legal taxes',

  methodLabel: 'SELECT PAYMENT METHOD',
  methodNote: 'Fast & Secure',
  secure: 'Your payment is processed securely through our payment provider.',

  barLabel: 'Amount to pay',
  pay: 'Pay',
};

/** design/278 — Scan & Pay. */
export const CO_SCAN_PAY = {
  // ⚠ Note 3: the QR is labelled "Legal Notice" on a High Court Representation
  // matter. Drawn that way.
  service: 'Legal Notice',
  // ⚠ Note 2: ₹290 is ₹250 + ₹40 of "GST 18%", which should be ₹45 for ₹295.
  amount: 290,
  // ⚠ Static string, no timer. See app/courier/scan-pay.tsx.
  valid: '10:00',
};
