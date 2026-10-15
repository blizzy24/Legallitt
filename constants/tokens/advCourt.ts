// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE HIGH COURT / DISTRICT COURT — designs 362–396. Every export is a
// 390pt screen at 1.000 px/pt once cropped out of its device frame (design/383
// is 408 wide: a sheet over 382, cropped with its shadow). Measured on 2x
// upscales of the crops.
//
// Built by FAMILY on one section kit (components/court/CourtKit.tsx). The
// measured screen per family:
//   status / timeline .... design/371     form ........... design/380
//   decision ............. design/363     checklist ...... design/374
//   fee confirmation ..... design/381     chat ........... design/365
//   call ................. design/369
// Siblings were measured only where they differ.
//
// Shared colours are hcPalette's (constants/tokens/highCourt.ts): the page,
// panel, brown, peach, tile greys and greens all sample to it exactly. The
// red of 369's END CALL and 363's Reject is advForensicRed (#BA1A1A).
// ─────────────────────────────────────────────────────────────────────────────

// ⚠ QUARANTINED — OFF-PALETTE. None of these is in hcPalette, the shared
// status set or the promoted red pair. Kept here, named for what they draw,
// until the client confirms them.
export const advCourtPalette = {
  /** The cream "next step" / notification panels (371, 377, 380, 389 …). */
  cream: '#FAEDE0',
  /** design/363's "Your Payment" box — a deeper peach than hcPalette.peach. */
  payPeach: '#F9DEC0',
  /** The disabled button (377 "Continue", 375 "Confirm Received"). */
  disabled: '#B6ADA1',
  /** The call screen's ground and controls (design/369). */
  callBg: '#303030',
  callKey: '#454545',
  callInk: '#FFFFFF',
  callMuted: '#B9B4AE',
} as const;

/** The section kit, measured on 371 (status) and 380 (form). */
export const advCourt = {
  /** Below this width every *Size / *Line token scales by width / 390. */
  compactBelow: 390,
  padX: 20,
  top: 16,
  /** The header row's top inset (CourierHeader's padTop). */
  headerPadTop: 10.5,
  bottomPad: 32,
  gap: 20,

  cardRadius: 16,
  cardPad: 16,
  cardInnerGap: 12,
  panelRadius: 12,
  panelPad: 12,

  headIcon: 18,
  headTile: 32,
  headTileRadius: 10,
  headGap: 8,
  headTitleSize: 16,
  capsSize: 10.5,
  capsSpacing: 0.8,
  headSubSize: 11.5,
  headSubTop: 3,

  titleTextSize: 17,
  titleTextLine: 22,
  textSize: 13,
  textLine: 19,
  smallSize: 11.5,
  smallLine: 16,
  quoteSize: 14,
  quoteLine: 21,
  quoteInset: 0,

  kvSize: 13,
  kvValueSize: 13,
  /** 1 = semibold row values, 0 = regular. */
  kvValueBold: 1,
  amountSize: 22,
  labelSize: 11,
  valueSize: 14,
  valueTop: 3,
  rowGap: 10,
  gridGap: 8,
  monoSize: 13,

  pillH: 20,
  pillPadX: 8,
  pillRadius: 10,
  pillSize: 10.5,
  pillDot: 6,
  pillLgH: 22,
  pillLgPadX: 12,
  pillGap: 4,

  avatar: 44,
  avatarSize: 15,
  nameSize: 16,
  nameSmallSize: 14,
  personSubSmallSize: 11.5,
  personSubSmallLine: 16,
  personSubSize: 11.5,
  callDisc: 34,
  greyDisc: 40,
  sideIcon: 12,
  sideIconGap: 9,

  heroDisc: 64,
  heroDiscInner: 44,
  heroGlyph: 24,
  heroTitleSize: 23,
  heroTitleTop: 10,
  heroSubSize: 13.5,
  heroSubLine: 20,
  heroPillTop: 12,

  leadTitleSize: 19,
  leadPillGap: 6,
  leadTextTop: 4,
  leadRightTop: 0,
  leadTextSize: 13.5,
  leadTextLine: 20,

  stepDisc: 20,
  stepGlyph: 12,
  stepGap: 12,
  stepRowGap: 14,
  stepTitleSize: 13,
  stepSubSize: 11,
  stepRail: 2,

  docTile: 32,
  docIcon: 16,
  docNameSize: 13.5,
  docMetaSize: 11,
  docBtnH: 28,
  docBtnPadX: 12,
  docBtnSize: 11.5,
  docMetaTop: 3,
  pdfIcon: 20,
  docRowH: 54,
  docPadX: 10,
  docPadY: 8,
  docGap: 10,

  fieldLabelSize: 13,
  fieldH: 44,
  fieldRadius: 10,
  fieldPadX: 14,
  fieldSize: 13.5,
  fieldTop: 8,
  hintSize: 11,
  hintTop: 6,
  areaMinH: 84,

  checkBox: 20,
  checkRadius: 5,
  barH: 4,
  barGap: 4,

  colBoxGap: 14,
  colPadTop: 12,
  colPadBottom: 12,
  gridPanelPadY: 12,

  footerH: 66,
  footerPadX: 20,
  footerPadY: 12,
  /** Below the buttons: the export's home-indicator band is part of the bar. */
  footerPadBottom: 12,
  footerGap: 14,
  footerBtnH: 48,
  footerBtnSize: 15,
  footerBtnPadX: 8,

  btnH: 48,
  btnRadius: 12,
  btnSize: 15,
  btnIcon: 16,
  btnGap: 10,
  btnSmallH: 32,
  btnSmallSize: 12,

  chipH: 34,
  chipPadX: 12,
  chipSize: 12,
  chipIcon: 14,
  tileMinH: 92,

  deadlineH: 72,
  deadlineLabelSize: 10,
  deadlineValueSize: 13,

  switchTop: 0,
  switchPadY: 8,
  switchIcon: 13,
  switchH: 30,
  switchPadX: 12,
  switchSize: 11.5,
  switchLabelSize: 11,

  /** design/365 — chat. */
  chatBubbleRadius: 16,
  chatPadX: 14,
  chatPadY: 10,
  chatSize: 14,
  chatLine: 21,
  chatTimeSize: 11,
  chatMaxW: 300,
  chatComposerH: 44,
  chatSend: 40,

  /** design/369 — call. */
  callRing: 132,
  callRingInner: 116,
  callInitials: 26,
  callNameSize: 26,
  callTimerSize: 17,
  callKey: 62,
  callKeyLabel: 14,
  callEndH: 54,
  callEndW: 280,
  callEndSize: 16,
} as const;

/** design/363 — High Court request. Measured at 1.000 px/pt (2x upscale). */
export const advCourtRequest = {
  headerPadTop: 10.5,
  pillSize: 11.8,
  pillH: 18,
  pillPadX: 9,
  pillLgH: 22,
  pillLgPadX: 12,
  leadTextSize: 11.9,
  titleTextSize: 17.7,
  textSize: 12,
  smallSize: 12,
  labelSize: 12,
  valueSize: 14.2,
  docNameSize: 14.3,
  docMetaSize: 12,
  kvSize: 14,
  kvValueSize: 13.6,
  kvValueBold: 0,
  amountSize: 21.4,
  headTitleSize: 14.3,
  nameSize: 16.2,
  nameSmallSize: 14.3,
  personSubSmallSize: 12,
  avatar: 46,
  greyDisc: 40,
  pdfIcon: 20,
  docRowH: 54,
  docBtnH: 22,
  docBtnPadX: 12,
  switchH: 27,
  footerPadX: 21,
  footerGap: 15,
  footerBtnH: 42,
  footerBtnSize: 15.5,
  switchTop: 6,
  switchPadY: 9,
  leadTitleSize: 17.5,
  footerPadBottom: 53,
  valueTop: 0,
  top: 13,
  leadTextLine: 15,
  leadTextTop: 1,
  leadGap: 13,
  phoneTop: 12,
  gridPanelPadY: 10.5,
  subTop: 3,
  gridTop: 13.5,
  leadRightTop: 6,
  colPadBottom: 4,
  quoteInset: 6.5,
  quoteLine: 20,
  payRowsTop: 17.5,
  rowGap: 11.5,
  payBoxTop: 15,
  decisionTextTop: 8.5,
  quoteTop: 5.5,
  quoteSize: 13.6,
  quoteBottom: -4,
  docsBottom: -2.5,
  aiBottom: -3,
  docMetaTop: 1.5,
} as const;
