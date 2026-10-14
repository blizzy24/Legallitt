// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE WALLET — designs 356–361. Measured at 2.000 px/pt from the cropped
// exports, except design/356, a 406px export that crops to 390px (1.000 px/pt):
// its layout matches design/357 element for element, so the shared layout is
// measured on 357 and only 356's own values come from 356.
//
// ⚠⚠ QUARANTINED PALETTE — colours these designs draw that are not in the
// shared theme (colors / status / ink / the red pair). Several equal values
// already quarantined elsewhere; they are restated here rather than imported
// across features, and noted:
//   · page #F7F7F5 — the same as advEditProfile.bg (design/246).
//   · text #6B6B6B — the grey body text; equals hcSheetPalette.grey.
//   · muted #767777 — the dimmed Advisory row; equals dcDecidePalette.waitInk.
//   · red #D9534F — fee deductions. Checked against the promoted pair
//     (status.redContainer / onRedContainer) and colors.danger (#F55C42): it is
//     neither.
//   · tile #F6DFC2 / tileInk #251A08 — the second avatar tone; equal
//     dcDocsNeededPalette.fileTile and dcDocumentsPalette.shieldInk (±1).
//   · glow #FBF1E5 — the warm corner wash on the Ready to Withdraw card.
// The green is status.active; the green pill status.activeBg (#E9F8F1 drawn,
// within 2); brand #B09C82 is colors.brand.
// ─────────────────────────────────────────────────────────────────────────────
export const advWalletPalette = {
  page: '#F7F7F5',
  text: '#6B6B6B',
  muted: '#767777',
  red: '#D9534F',
  tile: '#F6DFC2',
  tileInk: '#251A08',
  glow: '#FBF1E5',
};

/** designs 356 / 357 / 358 — Wallet and Earnings (the earnings tab). */
export const advWallet = {
  hdrPadTop: 13.5,
  hdrTitleGap: 23.5,
  hdrTitleSize: 17.1,
  hdrSubSize: 14.5,
  hdrSubLineHeight: 19,
  /** The sub-line wraps after "and" in all three exports. */
  hdrSubMaxWidth: 175,
  filterIcon: 22,
  filterGap: 18,
  padX: 20,
  bottomPad: 120,
  cardRadius: 16,
  cardPad: 16,

  heroTop: 7.5,
  heroPad: 20,
  heroPadTop: 18,
  heroPadBottom: 18,
  glowSize: 220,
  capsSize: 11.5,
  capsSpacing: 1,
  capsIcon: 14,
  capsGap: 6,
  settledH: 20,
  settledPadX: 8,
  settledDot: 6,
  settledGap: 5,
  settledSize: 12.5,
  amountTop: 14,
  amountSize: 33,
  amountLineHeight: 42,
  paiseSize: 14,
  paiseGap: 3,
  readyTop: 2,
  readySize: 13.2,
  btnTop: 23.5,
  btnH: 52,
  btnRadius: 14,
  btnIcon: 18,
  btnGap: 8,
  btnSize: 14.1,
  linksTop: 13.5,
  linkSize: 12.5,
  linkIcon: 13,
  nextSize: 12,

  tilesTop: 22,
  tileGap: 8.5,
  tileH: 84,
  tileRadius: 14,
  tilePad: 12,
  tilePadX: 12,
  tileIconGap: 2,
  tileLabelSize: 11.6,
  tileIcon: 15,
  tileValueTop: 4.5,
  tileValueSize: 17.8,
  tileValueLineHeight: 22,
  tileSubTop: 4,
  tileSubSize: 11.7,

  chipsTop: 20,
  chipH: 30,
  chipPadX: 15,
  chipGap: 9,
  chipSize: 11,
  chipSpacing: 0.3,

  secTop: 28,
  secIcon: 19,
  secGap: 8,
  secSize: 17.8,
  secLineHeight: 24,
  secTagSize: 11.8,
  secCardTop: 14,

  rowGapY: 15,
  breakdownTop: 20,
  rowTile: 32,
  rowTileRadius: 8,
  rowGlyph: 16,
  rowGap: 13,
  rowTitleSize: 14.2,
  rowSubSize: 13.1,
  rowValueSize: 17.9,
  rowTitleLineHeight: 20,
  rowSubLineHeight: 16,
  bkPadTop: 8.5,
  barTop: 6,
  barH: 5,

  feeRowH: 32,
  feePadTop: 3.5,
  feePadBottom: 9.5,
  feeLabelSize: 13.9,
  feeValueSize: 14.2,
  feeChipH: 18,
  feeChipPadX: 6,
  feeChipSize: 11.5,
  feeChipRadius: 5,
  feeChipGap: 8,
  ruleTop: 10,
  ruleH: 1,
  netTop: 14,
  netLabelSize: 17.8,
  netLabelLineHeight: 24,
  netValueSize: 19.5,
  netIcon: 15,
  netGap: 4,

  payTop: 5.5,
  payGap: 14,
  avatar: 40,
  avatarSize: 15.5,
  avatarGap: 12,
  nameSize: 14.2,
  pillH: 20,
  pillPadX: 9,
  pillSize: 11.5,
  payPillH: 16,
  metaTop: 0,
  svcH: 18,
  svcPadX: 7,
  svcSize: 9.9,
  svcRadius: 5,
  dateSize: 9.5,
  boxTop: 12,
  boxH: 30,
  boxRadius: 10,
  boxPadX: 12,
  boxSize: 13.5,
  boxNetSize: 12.5,

  bankTop: 14,
  bankIcon: 40,
  bankGlyph: 20,
  bankGap: 12,
  bankNameSize: 14.4,
  bankSubSize: 13.9,
  badgeIcon: 15,
  badgeGap: 6,
  manageH: 30,
  managePadX: 13,
  manageRadius: 10,
  manageSize: 11.4,

  xferTop: 18,
  xferIcon: 17,
  xferGap: 8,
  xferTitleSize: 15.2,
  xferSubSize: 12,
  xferAmountTop: 10,
  xferAmountSize: 19.5,
  utrSize: 12,
  utrIcon: 14,
  refTop: 4,
  refSize: 13.1,

  noteTop: 30,
  noteIcon: 16,
  noteGap: 10,
  noteSize: 13.5,
  noteLineHeight: 21,
};

// ⚠ OFF-PALETTE — design/359: discPeach #FDF2E6, the bank disc on the transfer
// card. Not a status colour, the red pair or advFirGreen; not hcPalette.peachNote
// (#FCEFDF, which the "Use Max" chip uses). Sampled; not harmonised.
// design/359's page is hcPalette.page (#FCF9F8), not the wallet's #F7F7F5.
export const advWithdrawPalette = {
  discPeach: '#FDF2E6',
};

/** design/359 — withdraw money. Measured at 2.000 px/pt. */
export const advWithdraw = {
  padX: 20,
  bottomPad: 32,
  cardRadius: 16,
  cardPad: 17,
  cardGap: 16,

  capsTop: 10,
  capsSize: 13.3,
  capsSpacing: 1,
  subTop: 6,
  subSize: 13.9,

  availTop: 13.5,
  amountTop: 12,
  rupeeSize: 22,
  amountSize: 28.9,
  rupeeGap: 4,

  enterSize: 14,
  maxH: 22,
  maxPadX: 9,
  maxSize: 12,
  inputTop: 16,
  inputH: 54,
  inputRadius: 12,
  inputPadX: 16,
  inputSize: 28,
  chipsTop: 19.5,
  chipH: 32,
  chipPadX: 12,
  chipGap: 7,
  chipSize: 13.4,
  limitTop: 22.5,
  limitIcon: 13,
  limitGap: 5,
  limitSize: 11.5,

  toTop: 20,
  changeSize: 13.9,
  bankTop: 12,
  disc: 40,
  discGlyph: 19,
  bankGap: 13,
  bankNameSize: 17,
  bankSubSize: 13.5,
  verH: 22,
  verPadX: 8,
  verIcon: 13,
  verGap: 4,
  verSize: 11.3,

  rowH: 30,
  rowLabelSize: 14,
  rowValueSize: 13.7,
  lockIcon: 13,
  lockGap: 5,
  ruleTop: 10,
  ruleH: 1,
  recvTop: 14,
  recvSize: 13.9,
  recvSubSize: 11,
  recvValueSize: 21,
  recvIcon: 17,
  recvGap: 5,

  noteTop: 18,
  noteIcon: 15,
  noteGap: 7,
  noteSize: 13,
  noteLineHeight: 21,

  btnTop: 24,
  btnGap: 8,
  btnH: 52,
  btnRadius: 14,
  btnIcon: 17,
  btnIconGap: 8,
  btnSize: 13.7,
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚠ OFF-PALETTE — design/360, sampled, not harmonised:
//   · box #F2F1EF — the inner beneficiary panel inside each account card.
//   · rrDisc #E3DEDC — the "RR" monogram disc on the enrolment card.
//   · ⚠ violet #7947FE — the headset glyph beside "Name Mismatch or Firm
//     Accounts?". A saturated violet used nowhere else in the app; it is not a
//     status colour, the red pair or advFirGreen. Built as drawn and flagged.
// The page is advWalletPalette.page; the guideline disc is advWalletPalette.glow;
// the Primary pill is hcPalette.peachDecide (#FAEAD7 drawn, within 4).
// ─────────────────────────────────────────────────────────────────────────────
export const advWalletBankPalette = {
  box: '#F2F1EF',
  rrDisc: '#E3DEDC',
  violet: '#7947FE',
};

/** design/360 — manage bank account. Measured at 2.000 px/pt. */
export const advWalletBank = {
  hdrIcon: 21,
  hdrIconGap: 20,
  padX: 20,
  bottomPad: 32,
  cardRadius: 16,
  cardPad: 16,

  rbiTop: 5,
  rbiDisc: 36,
  rbiGlyph: 17,
  rbiGap: 13,
  rbiTitleSize: 12.4,
  rbiBodySize: 13.1,
  rbiBodyLineHeight: 18,

  capsTop: 24,
  capsSize: 11.5,
  capsSpacing: 1,
  capsRightSize: 11.7,
  cardTop: 12,

  tile: 42,
  tileRadius: 10,
  tileGlyph: 22,
  tileGap: 14,
  nameSize: 17.8,
  nameLineHeight: 22,
  typeSize: 13.1,
  pillsTop: 14,
  pillH: 22,
  pillPadX: 9,
  pillIcon: 13,
  pillGap: 5,
  pillsGap: 8,
  pillSize: 11.6,

  boxTop: 14,
  boxRadius: 12,
  boxPad: 12,
  boxCapsSize: 11,
  showIcon: 14,
  showSize: 10.8,
  numberTop: 12,
  numberSize: 17,
  numberSpacing: 0.5,
  innerTop: 12,
  innerRadius: 8,
  innerPad: 12,
  noPad: 0,
  innerFlatTop: 8,
  fieldLabelSize: 11.7,
  fieldValueSize: 12.4,
  fieldValueTop: 2,
  fieldGap: 11,
  colGap: 16,

  footTop: 20,
  footIcon: 15,
  footGap: 6,
  footSize: 13.1,
  setH: 34,
  setPadX: 16,
  setRadius: 10,
  setIcon: 14,

  guideTop: 25,
  guideDisc: 32,
  guideGlyph: 16,
  guideGap: 14,
  guideTitleSize: 17.8,
  itemTop: 12,
  itemIcon: 17,
  itemGap: 14,
  itemTitleSize: 12.4,
  itemBodyTop: 4,
  itemBodySize: 13.1,
  itemBodyLineHeight: 21,

  enrolTop: 16,
  enrolPadY: 14,
  rr: 34,
  rrSize: 13,
  enrolGap: 12,
  enrolTitleSize: 12.4,
  enrolValueSize: 13,
  enrolValueLineHeight: 18,
  kycPadX: 10,
  kycPadY: 4,
  kycRadius: 16,
  kycDot: 7,
  kycSize: 12,
  kycLineHeight: 14,

  btnTop: 48,
  btnGap: 10,
  btnH: 51.5,
  btnRadius: 14,
  btnIcon: 18,
  btnIconGap: 9,
  btnSize: 14.2,
};
