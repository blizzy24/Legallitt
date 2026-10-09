// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE FIR FLOW — designs 214–220.
//
// Every value here is measured from the 2× exports and DIVIDED BY 2. The exports
// are 780px wide for a 390pt screen, so the scale is exactly 2.000 px/pt. Three
// earlier blocks (advNoticeResponse, advNoticeReport, advCases) were written
// straight off the 2× numbers and rendered ~1.3× oversized; all three have since
// been corrected.
//
// ⚠ COLOURS — WHAT THIS FLOW DOES AND DOES NOT ADD.
//
// Sampling every non-neutral fill across designs 215–220 turned up almost nothing
// new. The FIR reds are not new at all:
//
//   design/215 Reject button   #FFDAD6 bg / #93000A text
//   design/217 "Accused" chip  #FFDAD6 bg / #93000A text
//   design/217 accused avatar  #FFDAD6
//   design/210 "URGENT" pill   #FFDAD6 bg / #93000A text   ← already quarantined
//
// That is the exact pair already sitting in constants/tokens/psrUrgent.ts, which
// was quarantined on the grounds that it appeared on one screen. It now appears on
// four, across two flows, for three different meanings (urgency, rejection,
// accusation). It has become a real palette colour and should be promoted out of
// quarantine and named — that is a decision for review, so this file REUSES
// psrUrgent rather than copying the hexes or adding them to the shared theme.
//
// The green is likewise existing: design/217's "Ready to Create" is #22B573, the
// same green as design/211's "Ready to Send" (advPsrSend.greenColour), and within
// two points of status.active #21B474.
//
// ONE genuinely new colour, quarantined below: design/220's success mark.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠ PALETTE QUARANTINE — design/220's success circle.
//
//   successBg #55A900   sampled (85, 169, 0)
//
// The project's established success greens are #4CA214 (advNoticeReport.badgeBg,
// the identical mark on designs 203 and 212), #21B474 (status.active) and #22B573
// (design/211). design/220 draws the SAME success circle as design/203 and
// design/212 in a fourth green. Built as drawn; not added to the shared palette.
export const advFirGreen = {
  successBg: '#55A900',
};

/** design/215 — FIR request details. Measured at 2.000 px/pt from a 780×3460 export. */
export const advFirRequest = {
  padX: 20,
  bg: '#FCF9F8',
  cardBg: '#FFFFFF',

  headerTop: 12,
  headerPadBottom: 16,
  backIcon: 26,
  titleSize: 17,
  avatar: 32,
  avatarGlyph: 15,
  avatarBg: '#6C5C45',

  cardGap: 20.5,
  cardRadius: 16,
  cardPad: 16,

  chipHeight: 20,
  chipRadius: 10,
  chipPadX: 10,
  chipDot: 7,
  chipDotGap: 7,
  chipSize: 12,
  chipBg: '#F6DCBD',
  chipColour: '#735F47',
  recvSize: 12.5,
  recvColour: '#6B6257',

  idGap: 17,
  idIcon: 16,
  idIconGap: 9,
  idSize: 14.5,
  stationGap: 6,
  stationIndent: 25,
  stationSize: 12.5,
  stationColour: '#6B6257',

  sectionTitleSize: 15.5,
  kycGap: 10,
  kycHeight: 20,
  kycRadius: 10,
  kycPadX: 9,
  kycIcon: 12,
  kycIconGap: 5,
  kycSize: 11.5,
  kycBg: '#F0EDED',
  kycColour: '#6C5C45',
  sectionAvatar: 30,
  sectionAvatarGlyph: 15,
  sectionAvatarBg: '#F0EDED',
  sectionIcon: 20,

  gridGap: 16,
  gridGapX: 10,
  gridGapY: 10,
  cellRadius: 11,
  cellPad: 11,
  cellBg: '#F6F3F2',
  cellLabelSize: 10.5,
  cellLabelSpacing: 0.6,
  cellLabelColour: '#8A837C',
  cellValueGap: 6,
  cellValueSize: 13.5,
  cellIcon: 13,
  cellIconGap: 6,

  rowGap: 17,
  rowIcon: 16,
  rowIconGap: 10,
  rowLabelSize: 11.5,
  rowLabelColour: '#8A837C',
  rowValueGap: 5,
  rowValueSize: 14,
  rowValueLineHeight: 21,

  quoteGap: 16,
  quoteRadius: 12,
  quotePad: 14,
  quoteBg: '#F6F3F2',
  quoteSize: 13.5,
  quoteLineHeight: 24,
  quoteMark: 15,
  quoteMarkGap: 8,

  feeRowGap: 16,
  feeLabelSize: 14,
  feeValueSize: 15,
  feeDeductColour: '#E03131',
  advBoxGap: 15,
  advBoxRadius: 12,
  advBoxPad: 14,
  advBoxBg: '#EAE7E7',
  advLabelSize: 11.5,
  advLabelSpacing: 0.6,
  advLabelColour: '#6C5C45',
  advAmountGap: 6,
  advAmountSize: 29,
  advCoin: 48,
  advCoinBg: '#F8D9A8',
  advCoinGlyph: 22,
  advEscrowGap: 11,
  advEscrowIcon: 14,
  advEscrowIconGap: 8,
  advEscrowSize: 12.5,
  advEscrowLineHeight: 19,
  advEscrowColour: '#6C5C45',

  docsChipGap: 9,
  docsChipHeight: 19,
  docsChipRadius: 9,
  docsChipPadX: 8,
  docsChipSize: 11,
  docsChipBg: '#EAE7E7',
  docsChipColour: '#4A443C',
  docsVerifiedSize: 12,
  docsVerifiedColour: '#4A443C',
  docRowGap: 14,
  docRowGapY: 10,
  docRowRadius: 12,
  docRowPad: 11,
  docRowBg: '#F6F3F2',
  docIconBox: 38,
  docIconRadius: 10,
  docIconBg: '#FFFFFF',
  docIconGlyph: 20,
  docIconGap: 11,
  docNameSize: 13.5,
  docMetaGap: 4,
  docMetaSize: 12,
  docMetaColour: '#6B6257',
  docEye: 19,

  warnGap: 14,
  warnRadius: 12,
  warnPad: 13,
  warnBg: '#FAEDE0',
  warnIcon: 16,
  warnIconGap: 9,
  warnSize: 13,
  warnLineHeight: 19,
  warnColour: '#4A443C',

  barPadTop: 14,
  barPadBottom: 10,
  barBg: '#FFFFFF',
  barGapX: 12,
  btnHeight: 40,
  btnRadius: 13,
  btnPadX: 16,
  btnIcon: 17,
  btnIconGap: 8,
  btnSize: 16,
  acceptBg: '#6C5C45',
  capGap: 9,
  capSize: 11.5,
  capRejectColour: '#C8102E',
  capAcceptColour: '#4A443C',
};
