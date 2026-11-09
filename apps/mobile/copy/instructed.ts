/** Copy instructed by the project owner, not drawn in any design (architecture §9.2,
 * "Instructed copy"). Kept apart from drawn copy and from the substitutions so it
 * stays distinguishable; do not reword. */
export const instructedCopy = {
  // Approved: owner local Windows setup, 8 November 2026. Temporary CORS proxy.
  localProxyUnavailable: 'The local API proxy is not running or cannot be reached. Run pnpm mobile:deployed from the repository root, then retry. This does not mean the deployed API is down.',
  // Approved — owner navigation-data sweep, 4 November 2026. Unbuilt data is
  // unavailable, not an assertion that this account has no records.
  navigationAvailability: {
    heading: 'Not available yet',
    general: 'This section is not available yet. You can view your Legal Notice cases in My Cases.',
    wallet: 'Balances and withdrawals are not available yet. You can view recorded charges and any confirmed payout breakdown in each case.',
    clients: 'The client directory is not available yet. Open My Cases to see the clients on your assigned Legal Notices.',
    settings: 'These account settings are not available yet. No changes can be saved here.',
    advocates: 'The saved-advocate directory is not available yet. You can view your assigned advocate from your Legal Notice case.',
    messages: 'The conversation list is not available yet. Open your Legal Notice case to chat with its assigned advocate.',
    documents: 'The document library is not available yet. Open your Legal Notice case to view its documents.',
    payments: 'The payment-history list is not available yet. Open your Legal Notice case to view its recorded payment.',
    support: 'In-app support is not available yet. No support conversation has been started.',
    service: 'This service is not available yet. Legal Notice is available from Home.',
  },
  // Approved — owner five-state sweep / dashboard 148 instruction, 4 November 2026.
  advocateWork: {
    heading: 'NEEDS YOUR ATTENTION',
    earnings: 'EARNINGS',
    clientBreakdown: 'Client Fee Breakdown',
    noReview: 'The current draft has not been sent for client review. Open the case from My Cases to continue drafting.',
    noIncoming: 'No incoming shipment is recorded for this case.',
    noDocuments: 'No documents have been uploaded for this case.',
    loadingMessages: 'Loading messages…',
    noMessages: 'No messages yet. Send a message to start the conversation.',
    emptyTitle: 'No cases assigned yet',
    emptyBody: 'Your assigned Legal Notice cases will appear here.',
    caughtUp: 'No cases need your action right now',
    caughtUpBody: 'You can follow your ongoing and resolved cases in My Cases.',
    loading: 'Loading your cases…',
    failed: 'Couldn’t load your cases. Try again.',
    noMatches: 'No cases match these filters.',
    payout: 'A confirmed payout breakdown is not available for this historical case. Ask the administrator to check its payment record.',
    feesUnavailable: 'The payment breakdown isn’t available for this case. Ask the administrator to check its payment record.',
    feesPartial: 'Some historical charges could not be verified against this payment. Ask the administrator to check the breakdown.',
    loadingCase: 'Loading case…',
    unavailableCase: 'This case could not be loaded. Try again, or open a case assigned to you from My Cases.',
    selectCase: 'Open an assigned case from My Cases to continue.',
    retry: 'Try again',
    myCases: 'My Cases',
  },
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
    // Approved — owner-required actionable PDF completeness feedback, 4 Nov 2026.
    missingTitle: 'Complete these fields before generating',
    filingCorrection: 'Ask the client to confirm the missing filing details, then ask the project administrator to correct the saved case. Paid filings cannot be edited here.',
    contactClient: 'Open client chat',
    placeCorrection: 'Ask the project administrator to complete your profile city. Profile editing is not connected yet.',
    feeCorrection: 'Ask the project administrator to restore this case’s agreed pricing. Do not pay again.',
  },
  // Approved — project-owner intake restructure, 2 November 2026. Additions to
  // designs 24–28; the new demand step reuses their measured theme.
  legalNoticeIntake: {
    subjectMatter: 'Subject matter in dispute',
    subjectLine: 'Subject line',
    age: 'Age', salutation: 'Title', relation: 'Relation',
    relativeName: 'Father’s or husband’s name',
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
