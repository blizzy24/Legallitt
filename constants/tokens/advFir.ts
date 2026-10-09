// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE FIR FLOW — designs 214–220.
//
// Every value here is measured from the 2× exports and DIVIDED BY 2. The exports
// are 780px wide for a 390pt screen, so the scale is exactly 2.000 px/pt. Two
// earlier blocks (advNoticeResponse, advNoticeReport) were written straight off
// the 2× numbers and rendered ~1.3× oversized; both have since been corrected.
//
// ⚠ QUARANTINED COLOURS — see the warning blocks below. The FIR designs introduce
// a red "Accused"/"Reject" pair and a green "Ready to Create"/success pair that do
// not exist in constants/theme.ts. They are kept here, NOT added to the shared
// palette, exactly as advocateProfile and psrDecision are.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠ PALETTE QUARANTINE — the FIR red.
//
// design/215's Reject button and design/217's "Accused" chip use a red pair that
// appears nowhere else:
//   rejectBg   #FFDCDF   rejectColour   #C8102E
//   accusedBg  #FFE0E3   accusedColour  #D32F3C
// The project already carries THREE unrelated reds: colors.danger #F55C42,
// psrDecision.rejectBg #FF7D7D (design/206's Reject, salmon) and psrUrgent.bg
// #FFDAD6 / #93000A (design/210's URGENT pill). Four red treatments for
// destructive-or-adverse state across four flows. Flagged, not resolved.
export const advFirRed = {
  rejectBg: '#FFDCDF',
  rejectColour: '#C8102E',
  accusedBg: '#FFE0E3',
  accusedColour: '#D32F3C',
};

// ⚠ PALETTE QUARANTINE — the FIR green.
//
// design/217's "Ready to Create" dot+text and design/220's success mark:
//   readyColour #12A05C   successBg #4CA214
// status.active is #21B474 and advNoticeReport.badgeBg is #4CA214, so the success
// mark matches an existing value but "Ready to Create" does not. Kept together
// here so the pair stays visible.
export const advFirGreen = {
  readyColour: '#12A05C',
  readyBg: '#EFEDEB',
  successBg: '#4CA214',
};
