// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE DOCUMENT FORENSIC FLOW — designs 222–228.
//
// Every value here is measured from the 2× exports and DIVIDED BY 2. The exports
// are 780px wide for a 390pt screen, so the scale is exactly 2.000 px/pt.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠ PALETTE QUARANTINE — design/223's Accept button.
//
//   acceptBg  #61B000  sampled (97, 176, 0)
//
// Checked against every green already in the project — it matches NONE of them:
//
//   #61B000  design/223  Accept Request          ← this one, new
//   #55A900  design/220  FIR success mark        (advFirGreen.successBg)
//   #39FF07  design/206  PSR Accept              (psrDecision.acceptBg)
//   #4CA214  designs 203/212  payout success mark
//   #22B573  designs 211/217/223  "Ready"/"New Request" chips
//   #21B474  status.active
//
// So this is the SIXTH green, and the second time a primary Accept action has been
// drawn outside the brand palette entirely — design/206 was the first. Every other
// primary action in the app is brand brown. Quarantined here, not promoted, and
// deliberately NOT folded into advFirGreen: the hexes are 12 points apart in red
// and 9 in green, which is a different colour, not a rounding difference.
//
// Recommendation at review: if accept/reject is meant to be a traffic-light
// pattern it should be ONE pair used app-wide, not a new green per flow.
export const advForensicGreen = {
  acceptBg: '#61B000',
};

// ⚠ PALETTE QUARANTINE — design/223's Decline label.
//
//   declineColour  #BA1A1A  sampled (186, 26, 26)
//
// Not status.onRedContainer (#93000A), not colors.danger (#F55C42), not
// psrDecision.rejectBg (#FF7D7D), not status.notification (#D7524B). A fifth red.
export const advForensicRed = {
  declineColour: '#BA1A1A',
};

/** design/222 — forensic requests list. Measured at 2.000 px/pt from a 780×2566 export. */
export const advForensicRequests = {
  headerTop: 12,
  headerPadBottom: 16,
};
