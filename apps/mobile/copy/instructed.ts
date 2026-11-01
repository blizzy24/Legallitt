/** Copy instructed by the project owner, not drawn in any design (architecture §9.2,
 * "Instructed copy"). Kept apart from drawn copy and from the substitutions so it
 * stays distinguishable; do not reword. */
export const instructedCopy = {
  437: {
    trackDelivery: 'Track Delivery',
    // Chunk 6: project-owner wording, only for the completed lifecycle state.
    completed: {
      heading: 'Your Legal Notice Has Been Delivered',
      body: 'The notice was delivered to the recipient. This case is now complete.',
    },
    // 28 Oct 2026: Your Decision between approval and dispatch.
    approved: {
      heading: 'Approved',
      body: 'The draft has been approved by you and sent to your advocate for dispatch.',
    },
  },
  440: {
    // 28 Oct 2026: replaces the Statutory Evidence Guarantee block once the shipment is delivered.
    deliveryConfirmation: 'View Delivery Confirmation',
  },
} as const;
