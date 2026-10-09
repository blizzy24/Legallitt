// ─────────────────────────────────────────────────────────────────────────────
// PALETTE QUARANTINE — design/206's Accept / Reject buttons.
//
// ⚠ These two colours appear on exactly one screen in the entire product. Every
// other primary action in the app is brand brown (colors.brand / #6B5A45), and
// nothing anywhere else uses a saturated green or a salmon red. They are sampled
// directly from design/206 and confined here so they cannot leak into the shared
// palette in constants/theme.ts.
//
//   accept  #39FF07  sampled (57, 255, 7)  — a near-fluorescent green, far brighter
//                                             than the rest of the app's greens
//                                             (#1E9E4A is the established success).
//   reject  #FF7D7D  sampled (255, 125, 125) — salmon; the app's established
//                                             destructive red is #E04343 / #C21E1E.
//
// Recommendation when this reaches review: fold Accept into the brand button and
// Reject into the existing destructive red, unless the client specifically wants a
// traffic-light treatment on accept/reject decisions — in which case it should be a
// deliberate, app-wide pattern rather than one screen.
// ─────────────────────────────────────────────────────────────────────────────

export const psrDecision = {
  acceptBg: '#39FF07',
  acceptColour: '#0B2B02',
  rejectBg: '#FF7D7D',
  rejectColour: '#FFFFFF',
};
