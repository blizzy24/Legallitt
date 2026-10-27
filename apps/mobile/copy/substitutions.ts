/** Provisional substitutions approved for reuse; architecture §9.2 is the register.
 * Design 188 names this party “Recipient Details”. Keep sentence case in prose.
 * Corrected client exports should only require updating this file.
 */
export const designSubstitutions = {
  286: {
    trackingHelp: {
      before: 'Your advocate can use the tracking number to check the shipment.',
      after: 'You can use the tracking number to check the shipment.',
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
