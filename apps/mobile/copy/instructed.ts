/** Copy instructed by the project owner, not drawn in any design (architecture §9.2,
 * "Instructed copy"). Kept apart from drawn copy and from the substitutions so it
 * stays distinguishable; do not reword. */
export const instructedCopy = {
  // Approved — project-owner notice letterhead instruction, 2 November 2026.
  // Advocate input fills "for the offences of"; the six editor sections stay.
  legalNoticeDraft: {
    offences: 'Offences',
    // Approved — owner decision in client's absence, 4 Nov 2026 (§9.2).
    complianceDays: 'Compliance period (days)',
    compliancePeriod: 'Compliance period',
    receiptAnchor: 'days from receipt of notice',
    // Approved — owner-instructed intake seeding and review indication, 3 Nov 2026.
    fromIntake: 'From client intake — review before use',
    fromFiling: 'From client’s filing',
    fixedTemplate: 'Fixed template text — not editable',
  },
  // Approved — project-owner intake restructure, 2 November 2026. Additions to
  // designs 24–28; the new demand step reuses their measured theme.
  legalNoticeIntake: {
    subjectMatter: 'Subject matter in dispute',
    subjectLine: 'Subject line',
    age: 'Age', fatherName: 'Father’s name (S/o Shri)',
    demandTitle: 'Choose your legal demand',
    demandPrompt: 'Select all that apply, or write your own.',
    ownDemand: 'Write your own demand',
    legalDemand: 'Legal demand', generateOptions: 'Generate options',
    generating: 'Generating options…', saving: 'Please wait…',
  },
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
