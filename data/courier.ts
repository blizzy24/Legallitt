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
// 21. designs 280, 281 and 285 hard-wrap body copy into ragged short lines —
//     design/280's "Important" into a 62pt column, design/281's banner into
//     four lines one of which is the word "once", design/285's instructions and
//     "You Can Use Any Courier" card into four and three. All reproduced.
// 20. design/281 hard-wraps its banner body into four ragged lines, one of
//     which is the single word "once". Reproduced with explicit breaks.
// 19. design/280 wraps the body of its "Important" banner into a ~62pt column
//     — five words over five lines — inside a full-width card. Reproduced.
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

/**
 * design/279 — THE BIG ONE. Three other services collided on one courier
 * screen. See note 1 at the top of this file. Every string below is exactly
 * what the export draws.
 */
export const CO_SUCCESS = {
  // ⚠ The success screen still wears design/278's PAYMENT header.
  title: 'Scan & Pay',
  subtitle: 'UPI Dynamic QR',
  intro: 'Scan the QR code using any UPI app to complete your payment.',

  refLabel: 'Request ID',
  // ⚠ PSR- is the PROPERTY SEARCH prefix. The matter is #HCR-2026-1048.
  refValue: '#PSR739482',

  successTitle: 'Payment Successful',
  // ⚠ A fourth amount in one flow: 277 and 278 both say ₹290.
  successBody: 'Your payment of \u20B91377 has been received.',
  // ⚠ DOCUMENT FORENSIC copy on a courier booking.
  successBody2: 'Your forensic analysis request has been submitted.',
  cta: 'Start Tracking',
};

/** design/280 — shipment created. */
export const CO_SHIPMENT = {
  title: 'Shipment Created',
  heroTitle: 'Delivery Booked',
  heroSub: 'Your documents are ready for pickup.',
  pill: 'Booking Confirmed \u2022 Pickup Scheduled',

  detailsTitle: 'Delivery Details',
  courierLabel: 'Courier',
  // ⚠ Note 5: Blue Dart here, DHL Express on design/281.
  courierValue: 'Blue Dart',
  waybillLabel: 'Waybill',
  waybillValue: 'BD-4471-8820',
  pickupDateLabel: 'Pickup Date',
  pickupDateValue: '24 Oct 2026',
  pickupAddrLabel: 'Pickup Address',
  pickupAddrValue: '12B Anand Nagar, Opp. Treasure Island',

  sendTitle: 'Send To',

  docsTitle: '3 Documents',
  docsSub: 'Packed for courier handover',

  statusTitle: 'Delivery Status',
  steps: [
    { title: 'Booking Created', tone: 'done' as const },
    { title: 'Pickup Pending', tone: 'active' as const },
    { title: 'In Transit', tone: 'todo' as const },
    { title: 'Delivered', tone: 'todo' as const },
    { title: 'Received by Advocate', tone: 'todo' as const },
  ],

  importantTitle: 'Important',
  // ⚠ Note 19: the export wraps this into a ~62pt column — five words over
  // five lines — inside a full-width card. See app/courier/shipment.tsx.
  importantBody: 'Keep the documents packed and ready for pickup.',

  cta: 'View Tracking',
  ctaAlt: 'View Case',
};

/**
 * design/281 — document delivery tracking.
 *
 * ⚠ Note 5: this screen alone says DHL Express with a DHL waybill; designs 276
 * and 280 both say Blue Dart for the same shipment.
 * ⚠ Note 6: it addresses a seventh advocate, at an address in no Indian
 * format. Every other screen in this batch sends to Adv. Gurneeet Chawla in
 * Indore. Both are kept exactly as drawn.
 * ⚠ Note 7: "3 Physical Documents" here, 5 on designs 275/284, 4 on 282.
 */
export const CO_TRACKING = {
  title: 'Document Delivery',

  courierLabel: 'COURIER SERVICE',
  courierName: 'DHL Express',
  statusPill: 'Picked Up',
  waybillLabel: 'Waybill Number',
  waybillValue: 'DHL-8942-0194',

  sendLabel: 'SEND TO',
  // ⚠ Note 6: a seventh advocate name and a non-Indian address.
  receiver: 'Advocate Sarah Jenkins',
  receiverLines: ['High Court Chambers, 4th Floor', "24 St. George's Avenue, District 3"],

  docsTitle: 'Documents',
  // ⚠ Note 7.
  docsSub: '3 Physical Documents',
  docsLink: 'View',

  progressTitle: 'Delivery Progress',
  steps: [
    { title: 'Booking Created', sub: 'Oct 24, 09:15 AM', tone: 'done' as const },
    { title: 'Pickup Booked', sub: 'Oct 24, 11:30 AM', tone: 'done' as const },
    { title: 'Picked Up', sub: 'Oct 24, 02:45 PM', tone: 'active' as const },
    { title: 'In Transit', sub: 'Expected Oct 25', tone: 'todo' as const },
    { title: 'Out for Delivery', sub: 'Pending arrival', tone: 'todo' as const },
    { title: 'Delivered', sub: 'Delivery agent drop-off', tone: 'todo' as const },
    { title: 'Advocate Received', sub: 'Final formal receipt', tone: 'todo' as const },
  ],

  updateLabel: 'LATEST UPDATE',
  updateTime: 'Today \u2022 02:45 PM',
  updateTitle: 'Package collected by courier',
  updateBody: 'Shipment processed at local intake facility. En route to sorting hub.',

  bannerTitle: 'Delivery and advocate receipt are different steps.',
  // ⚠ Note 20: the export hard-wraps this into four ragged lines, one of which
  // is the single word "once". Reproduced with explicit breaks.
  bannerBody:
    'The advocate will confirm in the system\nonce\nphysical documents are in hand and\nreviewed.',

  cta: 'Refresh Status',
  foot: 'Estimated advocate receipt: Oct 25, 05:00 PM',
};

/**
 * design/282 — the ADVOCATE confirming receipt.
 *
 * This screen is advocate-side, not client-side: it asks "Did You Receive the
 * Documents?", its checkbox reads "I have received the physical documents",
 * and its action is "Confirm Received". A client cannot confirm their own
 * delivery. See app/advocate/courier/confirm.tsx.
 */
export const CO_CONFIRM = {
  title: 'Confirm Documents',
  deliveredPill: 'DELIVERED',
  verified: 'Courier Verified',
  deliveredBody: 'The courier shows that the documents were delivered.',

  caseTitle: 'Case Reference',
  caseSub: 'Physical dossier handling',
  caseRows: [
    { label: 'Client', value: 'Rahul Sharma' },
    { label: 'Case', value: 'Rahul Sharma vs Amit Verma' },
    { label: 'Case ID', value: 'HCR-2026-1048', mono: true },
  ],

  docsTitle: 'Documents',
  // ⚠ Note 7: 4 here, 5 on designs 275/284, 3 on design/281.
  docsCount: '4 Documents',
  docs: [
    { name: 'Case Papers.pdf', sub: 'Original Hardcopy 1' },
    { name: 'Court Order.pdf', sub: 'Original Hardcopy 2' },
    { name: 'ID Proof.pdf', sub: 'Original Hardcopy 3' },
    { name: 'Affidavit.pdf', sub: 'Original Hardcopy 4' },
  ],

  deliveryTitle: 'Delivery Details',
  deliverySub: 'Handover telemetry',
  deliveryRows: [
    { label: 'Courier', value: 'Blue Dart' },
    { label: 'Waybill', value: 'BD-4471-8820', mono: true },
    { label: 'Delivered On', value: '25 Oct 2026' },
    { label: 'Delivered At', value: '04:35 PM' },
    { label: 'Received By', value: 'Office Assistant' },
  ],

  askTitle: 'Did You Receive the Documents?',
  askBody: 'Please confirm that the physical documents are with you.',
  check: 'I have received the physical documents.',
  note: 'Only confirm after you have physically received the documents.',

  cta: 'Confirm Received',
  foot: 'Next: Documents Received',
};

/**
 * design/283 — the ADVOCATE's receipt confirmation.
 *
 * ⚠ Note 16: this screen draws NO delivery tracker, although 280, 281 and 287
 * all do and it is the last step of the same journey. It shows a document list
 * with a "Received" pill instead. Nothing was invented to fill the gap.
 */
export const CO_RECEIVED = {
  title: 'Documents Received',
  heroTitle: 'Documents Received',
  heroBody: 'You confirmed that the physical documents are with you.',

  caseLabel: 'CASE INFO',
  caseId: 'HCR-2026-1048',
  caseRows: [
    { label: 'Client', value: 'Rahul Sharma' },
    { label: 'Case', value: 'Rahul Sharma vs Amit Verma' },
  ],

  docsTitle: 'Documents',
  docsCount: '3 Documents',
  receivedPill: 'Received',
  docs: ['Case Papers.pdf', 'Court Order.pdf', 'ID Proof.pdf'],

  deliveryTitle: 'Delivery Details',
  deliveryRows: [
    { label: 'Courier', value: 'Blue Dart' },
    { label: 'Waybill', value: 'BD-4471-8820', mono: true },
    { label: 'Delivered On', value: '25 Oct 2026' },
    { label: 'Received By', value: 'Adv. Gurneeet Chawla' },
  ],

  bannerTitle: 'Receipt Confirmed',
  bannerBody: 'The physical documents have been received and the case can now move forward.',

  cta: 'Open Case',
  ctaAlt: 'Chat with Client',
};

/** design/285 — send by yourself: instructions. */
export const CO_SELF_INSTRUCTIONS = {
  title: 'Send Documents Yourself',
  sub: 'Send the physical documents directly to your advocate.',

  noticeTitle: 'Physical Delivery Instructions',
  // ⚠ Note 21: hard-wrapped in the export into four ragged lines.
  noticeBody:
    'Prepare and pack your documents\nsafely. Use any\ncourier service to send them to\nyour advocate.',

  sendTitle: 'Send To',
  sendTag: 'ADVOCATE OFFICE',
  fields: [
    { label: 'Advocate Name', value: ADVOCATE.name },
    { label: 'Office Name', value: 'High Court Bar Chambers' },
    { label: 'Office Address', value: 'Chamber No. 14, High Court Bar Building' },
    { label: 'Area / Locality', value: ADVOCATE.area },
    { label: 'City', value: ADVOCATE.city },
    { label: 'State', value: ADVOCATE.state },
    { label: 'PIN Code', value: ADVOCATE.pin },
    { label: 'Mobile Number', value: ADVOCATE.mobile },
    { label: 'Email', value: ADVOCATE.email },
  ],
  copy: 'Copy',
  copyAll: 'Copy All Details',
  copyNote: 'Copy all advocate delivery details at once.',

  docsTitle: 'Documents to Send',
  docsCount: '3 Documents',
  docs: ['Case Papers.pdf', 'Court Order.pdf', 'ID Proof.pdf'],
  viewDocs: 'View Documents',

  howTitle: 'How to Send',
  steps: [
    {
      title: 'Pack the documents safely.',
      sub: 'Use a secure water-resistant folder or sealed package.',
    },
    {
      title: "Give the advocate's details to the courier.",
      sub: 'Ensure all contact details and address lines are provided.',
    },
    {
      title: 'Send the documents and keep the receipt.',
      sub: 'Retain the physical receipt and consignment number for your records.',
    },
  ],

  anyTitle: 'You Can Use Any Courier',
  // ⚠ Note 21 again, twice on the same card.
  anyBody: 'You can use any courier or\ndelivery\nservice.',
  anySub: 'Use the address and contact\ndetails shown\nabove.',

  impTitle: 'Important',
  impItems: [
    'Send the documents only after checking the address.',
    'Keep the courier receipt with you.',
  ],

  askTitle: 'Have you sent the documents?',
  askCheck: 'I have sent the physical documents to my advocate.',

  sentRows: [
    { label: 'Sent By', value: 'Client' },
    { label: 'Sent Date', value: '24 Oct 2026' },
    { label: 'Sent Time', value: '03:10 PM' },
  ],

  cta: 'Continue',
};

/** design/286 — send by yourself: enter the courier details. */
export const CO_SELF_DETAILS = {
  title: 'Documents Sent',
  titlePill: 'Sent',

  sentTitle: 'Documents Sent',
  // ⚠ Note 21: hard-wrapped in the export into three ragged lines.
  sentBody: 'Your documents\nhave been marked as\nsent.',

  idLabel: 'LEGALITT DELIVERY ID',
  idValue: 'LGT-DLV-77421',
  idNote: 'Keep this ID for your case.',
  copy: 'Copy',

  formTitle: 'Courier Details',
  formSub: 'Enter the details from your courier receipt.',
  fields: [
    { label: 'Courier Name', placeholder: 'Blue Dart' },
    { label: 'Tracking Number', placeholder: 'BD-4471-8820' },
    { label: 'Dispatch Date', placeholder: 'DD/MM/YYYY', icon: 'date' as const },
    { label: 'Courier Office', placeholder: 'Indore - Vijay Nagar' },
    { label: 'Courier Phone', placeholder: '+91 98260 11482' },
    { label: 'Tracking Link', placeholder: 'Paste tracking link', icon: 'link' as const },
  ],

  otherTitle: 'Other Details',
  expectedLabel: 'Expected Delivery Date',
  optional: 'Optional',
  expectedPlaceholder: 'DD/MM/YYYY',
  receiptLabel: 'Courier Receipt',
  upload: 'Upload Receipt',
  uploadNote: 'Add the receipt if you have one.',
  receiptFile: 'courier-receipt.pdf',
  receiptStatus: 'Uploaded',
  receiptView: 'View',
  receiptReplace: 'Replace',

  docsTitle: 'Documents Sent',
  docsCount: '3 Documents',
  docs: ['Case Papers.pdf', 'Court Order.pdf', 'ID Proof.pdf'],
  viewDocs: 'View Documents',

  sendTitle: 'Send To',
  savedChip: 'Saved in Case',
  sendRows: [
    { label: 'RECEIVER', value: ADVOCATE.name },
    { label: 'OFFICE', value: 'High Court Bar Chambers' },
    { label: 'ADDRESS', value: 'Chamber No. 14, HC Bar Building' },
    { label: 'CITY & STATE', value: `${ADVOCATE.city}, ${ADVOCATE.state}` },
    { label: 'PIN', value: ADVOCATE.pin },
    { label: 'MOBILE', value: ADVOCATE.mobile },
  ],
  sendNote: 'These details are linked to your case.',

  trackTitle: 'Track Your Shipment',
  trackBody: 'Your advocate can use the tracking number to check the shipment.',
  trackRows: [
    { label: 'COURIER', value: 'Blue Dart' },
    { label: 'TRACKING NO.', value: 'BD-4471-8820' },
  ],
  trackCopy: 'Copy Tracking Number',

  impTitle: 'Important',
  impItems: [
    'Check the tracking number before you submit.',
    'Keep your courier receipt safely.',
  ],

  cta: 'Submit Delivery Details',
  foot: 'Complete required fields: Courier Name, Tracking Number, Dispatch Date',
};

/** design/287 — send by yourself: sent confirmation. */
export const CO_SELF_SENT = {
  title: 'Documents Sent',
  titlePill: 'SENT',

  heroTitle: 'Documents Sent',
  heroBody: 'Your delivery details have been saved.',

  idLabel: 'LEGALITT DELIVERY ID',
  idValue: 'LGT-DLV-77421',
  idNote: 'Keep this ID for your case.',
  copy: 'Copy',

  courierTitle: 'Courier Details',
  courierRows: [
    { label: 'Courier', value: 'Blue Dart' },
    { label: 'Tracking Number', value: 'BD-4471-8820', copy: true },
    { label: 'Dispatch Date', value: '24 Oct 2026' },
    { label: 'Courier Office', value: 'Indore - Vijay Nagar' },
    { label: 'Tracking Link', value: 'bluedart.com/track', link: true },
  ],

  sendTitle: 'Send To',
  savedChip: 'Saved in Case',
  receiverLabel: 'Receiver',
  receiverValue: ADVOCATE.name,
  officeLabel: 'Office',
  officeValue: 'High Court Bar Chambers',
  addressLabel: 'Address',
  addressValue: 'Chamber No. 14, HC Bar Building',
  cityLine: 'Indore, Madhya Pradesh - 452001',
  mobile: ADVOCATE.mobile,

  docsTitle: 'Documents Sent',
  docsCount: '3 Documents',
  docs: ['Case Papers.pdf', 'Court Order.pdf', 'ID Proof.pdf'],
  viewDocs: 'View Documents',

  statusTitle: 'Delivery Status',
  statusPill: 'Waiting for Advocate',
  steps: [
    { title: 'Documents Sent', sub: 'Completed', tone: 'done' as const },
    { title: 'Waiting for Advocate', sub: 'In transit & awaiting receipt', tone: 'active' as const },
    { title: 'Documents Received', sub: 'Pending advocate confirmation', tone: 'todo' as const },
  ],
  statusNote: 'Your advocate will confirm when the documents are received.',

  receiptTitle: 'Courier Receipt',
  receiptFile: 'courier-receipt.pdf',
  receiptStatus: 'Uploaded',
  receiptView: 'View Receipt',
  receiptNote: 'Uploaded as proof of delivery dispatch.',

  impTitle: 'Important',
  impItems: [
    'Keep your courier receipt and tracking number safely.',
    'Your advocate can use the tracking number to check the delivery.',
  ],

  cta: 'Back to home',
};
