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

/** design/223 — request details. Measured at 2.000 px/pt from a 780×3373 export. */
export const advForensicRequest = {
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

  cardGap: 21,
  cardRadius: 16,
  cardPad: 16,

  chipHeight: 20,
  chipRadius: 10,
  chipPadX: 11,
  chipDot: 8,
  chipDotGap: 8,
  chipSize: 13,
  chipBg: '#E6F6EC',
  chipColour: '#22B573',
  refHeight: 26,
  refRadius: 9,
  refPadX: 11,
  refSize: 13,
  refBg: '#F3F1F0',
  refColour: '#4A443C',
  refIcon: 15,
  refIconGap: 8,

  titleGap: 20,
  titleBigSize: 21,
  titleBigLineHeight: 30,

  feeGap: 17,
  feeRadius: 12,
  feePad: 14,
  feeBg: '#FDF6E8',
  feeLabelSize: 13,
  feeLabelColour: '#C08A1E',
  feeAmountGap: 6,
  feeAmountSize: 27,
  securedHeight: 30,
  securedRadius: 15,
  securedPadX: 11,
  securedIcon: 14,
  securedIconGap: 8,
  securedSize: 13,
  securedBg: '#FFFFFF',

  cellsGap: 16,
  cellGapX: 10,
  cellGapY: 10,
  cellRadius: 11,
  cellPad: 11,
  cellBg: '#F6F3F2',
  cellLabelSize: 12,
  cellLabelColour: '#6B6257',
  cellValueGap: 6,
  cellValueSize: 14,

  initials: 42,
  initialsBg: '#F5DEBE',
  initialsSize: 16,
  initialsColour: '#8A6A3E',
  initialsGapX: 14,
  nameSize: 18,
  tick: 16,
  tickGap: 7,
  tickColour: '#22B573',
  cliGap: 4,
  cliSize: 13,
  cliColour: '#6B6257',
  roleHeight: 22,
  roleRadius: 11,
  rolePadX: 11,
  roleSize: 12.5,
  roleBg: '#EFEDED',
  roleColour: '#4A443C',

  contactGap: 15,
  contactRadius: 11,
  contactPad: 12,
  contactBg: '#F6F3F2',
  contactRowGapY: 13,
  contactIcon: 15,
  contactIconGap: 10,
  contactSize: 14,
  contactTagSize: 12.5,
  contactTagColour: '#6B6257',
  contactTagOk: '#22B573',

  stTitleIcon: 18,
  stTitleIconGap: 10,
  stTitleSize: 16,
  quoteGap: 15,
  quoteRadius: 12,
  quotePad: 14,
  quoteBg: '#F6F3F2',
  quoteSize: 14.5,
  quoteLineHeight: 24,

  headingGap: 21,
  headingSize: 16,
  headingNoteSize: 12.5,
  headingNoteColour: '#4A443C',
  headingSubGap: 7,
  headingSubSize: 13.5,
  headingSubColour: '#6B6257',

  docGap: 13,
  docIcon: 44,
  docIconRadius: 12,
  docIconGlyph: 23,
  docIconGap: 13,
  docNameSize: 16,
  docMetaGap: 5,
  docMetaSize: 13,
  docMetaColour: '#6B6257',
  docTagHeight: 20,
  docTagRadius: 10,
  docTagPadX: 9,
  docTagSize: 12,
  noteGap: 14,
  noteRadius: 10,
  notePad: 11,
  noteBg: '#F6F3F2',
  noteIcon: 15,
  noteIconGap: 9,
  noteSize: 13.5,
  hashGap: 14,
  hashSize: 12.5,
  hashColour: '#4A443C',
  viewSize: 13.5,
  viewIcon: 16,
  viewIconGap: 8,

  examIcon: 20,
  examIconGap: 10,
  examTagHeight: 22,
  examTagRadius: 11,
  examTagPadX: 11,
  examTagSize: 12.5,
  examTagBg: '#F5DEBE',
  examTagColour: '#8A6A3E',
  examBoxGap: 15,
  examBoxRadius: 12,
  examBoxPad: 14,
  examBoxBg: '#F3F1F0',
  examDot: 10,
  examDotGap: 10,
  examItemSize: 15,
  examBodyGap: 8,
  examBodySize: 13.5,
  examBodyLineHeight: 21,
  protoGap: 13,
  protoHeight: 36,
  protoRadius: 10,
  protoPadX: 12,
  protoBg: '#FFFFFF',
  protoSize: 13,
  protoColour: '#6B6257',

  barPadTop: 14,
  barPadBottom: 12,
  barBg: '#FCF9F8',
  acceptHeight: 43,
  acceptRadius: 14,
  acceptSize: 17,
  acceptArrow: 19,
  acceptArrowGap: 10,
  secGap: 11,
  secGapX: 11,
  secHeight: 40,
  secRadius: 12,
  secBg: '#F3F1F0',
  secSize: 14.5,
};
