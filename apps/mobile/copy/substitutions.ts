/** Provisional substitutions approved for reuse; architecture §9.2 is the register.
 * Design 188 names this party “Recipient Details”. Keep sentence case in prose.
 * Corrected client exports should only require updating this file.
 */
export const designSubstitutions = {
  // Restored FIR intake layouts, owner-approved 10 Nov 2026 (§9.2).
  43: {next: 'Continue to People Involved'},
  45: {summary: 'ATTACHMENT SUMMARY', identity: 'Choose any one accepted identity document. Aadhaar must be masked.', media: 'PDF, PNG or JPEG. Video and audio uploads are not available.', overage: '₹25 per PDF page beyond 25 across all files combined, with no GST on extra pages. The total is shown before payment.'},
  46: {review: 'Review the information you provided before submitting your FIR Draft request.', declaration: 'By submitting, you confirm that the information provided is accurate and truthful to the best of your knowledge.'},
  // Owner-approved 10 Nov 2026: admin review replaces client review for FIR.
  218: {send: 'Send for Admin Approval', freeze: 'Sending freezes this version for admin approval. It will not be sent to the client yet.'},
  219: {waiting: 'Awaiting Admin Approval', frozen: 'The submitted version is frozen. A second version cannot be saved or sent while admin approval is pending.'},
  220: {completed: 'FIR Draft Completed', body: 'The admin approved the draft and released it to the client. The drafting case is complete.'},
  49: {ready: 'Your FIR Draft Is Ready', completed: 'The admin approved your draft. Your drafting case is complete.', waiting: 'Your draft becomes available after admin approval. No client approval is needed.', notice: 'This is a complaint draft. Completion of this service does not mean the police have registered an FIR.'},
  189: {
    // Approved — project owner, 3 Nov 2026. Also used by the repeated template on 267.
    referenceLabel: {before: 'Reffrence Id', after: 'Reference Id'},
    preservedCopy: {
      before: 'A copy of this Notice has been preserve in my office for record and future reference.',
      after: 'A copy of this Notice has been preserved in my office for record and future reference.',
    },
  },
  286: {
    trackingHelp: {
      before: 'Your advocate can use the tracking number to check the shipment.',
      after: 'You can use the tracking number to check the shipment.',
    },
    // Approved — project owner, 4 Nov 2026. The drawn header ("Documents Sent / Your
    // documents have been marked as sent.") assumes the reader arrives after posting.
    // On the notice flow the advocate arrives before anything is saved, so the header
    // says what is true; the drawn copy returns once the notice is dispatched.
    headerUnsaved: {
      before: {title: 'Documents Sent', titlePill: 'Sent', sentTitle: 'Documents Sent', sentBody: 'Your documents have been marked as sent.'},
      after: {title: 'Courier Details', titlePill: '', sentTitle: 'Add Courier Details', sentBody: 'Post the printed notice, then enter the details from your courier receipt below.'},
    },
    headerSaved: {
      before: {title: 'Documents Sent', titlePill: 'Sent', sentTitle: 'Documents Sent', sentBody: 'Your documents have been marked as sent.'},
      after: {title: 'Courier Details', titlePill: '', sentTitle: 'Courier Details Saved', sentBody: 'Confirm Dispatch on Prepare For Dispatch to mark the notice as sent.'},
    },
  },
  194: {
    selfDelivery: {
      before: 'Send the documents directly to your advocate.',
      after: 'Send the documents directly to the recipient.',
    },
    partnerDelivery: {
      before: 'Legalitt will arrange delivery to your advocate.',
      after: 'Legalitt will arrange delivery to the recipient.',
    },
    deliveryReason: {
      before: 'Your advocate needs the physical documents for the case.',
      after: 'The signed notice must reach the recipient by post.',
    },
  },
  195: {
    partnerDelivery: {
      before: 'Your documents will be picked up and sent to the receiver.',
      after: 'Your documents will be picked up and sent to the recipient.',
    },
  },
} as const;
