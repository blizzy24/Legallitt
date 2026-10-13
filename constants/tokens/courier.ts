// ─────────────────────────────────────────────────────────────────────────────
// COURIER / DOCUMENT DELIVERY — designs 275–287.
//
// ⚠ EVERY FILE IN THIS BATCH IS FRAMED. The exports are 780, 828, 844 and 860
// pixels wide, but that is NOT four scales: each one is the same 780px screen
// sitting inside a black device frame of a different width.
//
//     780px file → no frame
//     828px file → 24px frame   designs 275, 284
//     844px file → 32px frame   designs 276, 281, 285, 286, 287
//     860px file → 40px frame   designs 280, 282, 283
//
// Crop to the content box first, and every file is 780px for a 390pt screen —
// 2.0000 px/pt, the same as every other batch in this project. Measuring the
// file width instead of the content width makes everything come out 6.2% small
// and turns the real 20pt gutter into a phantom 30pt one.
//
// Every value below is a pixel reading from the CROPPED image divided by 2.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

// ⚠ PALETTE QUARANTINE — the courier batch's green pair.
//   chipBg #D3F0E3   ink #006D41
// Checked first against everything already in the project, as the house rule
// requires. It matches none of them:
//   status.active / activeBg      #21B474 / #E9FAF2   (brighter, much lighter)
//   advFirGreen.successBg         #55A900             (yellow-green)
// This is a fourth green. It is NOT added to the shared palette: it stays here
// until the client confirms which green is the real one.
export const courierGreen = {
  chipBg: '#D3F0E3',
  ink: '#006D41',
  // ⚠ and a FIFTH green on the very same card: design/275's "Recommended" pill
  // is a bright mint, nothing like the pair above it.
  recBg: '#77FBB2',
  recInk: '#002110',
};

/** The back + title + avatar bar designs 275, 276, 280–287 all draw. */
export const courierHeader = {
  padX: 20,
  bg: '#FCF9F8',
  height: 60,
  padTop: 4.8,
  ink: '#1B1C1C',
  backIcon: 21.2,
  titleGap: 20.9,
  titleSize: 19.6,
  subSize: 11.1,
  subTop: 2.1,
  avatar: 31.8,
  avatarGlyph: 17,
  avatarBg: '#6C5C45',
  divider: '#F6F3F2',
};

/** designs 275 + 284 — choose how to send. Measured at 2.1231 px/pt from 828×2204. */
export const courierChoose = {
  padX: 20,
  bg: '#FCF9F8',
  ink: '#1B1C1C',
  inkMuted: '#4D463D',
  cardBg: '#FFFFFF',
  cardRadius: 14.9,

  introTop: 13.3,
  introSize: 13.8,
  introLine: 20,

  // Matter card 115.9–244.0pt.
  matterTop: 4.1,
  matterPadX: 17.1,
  matterPadTop: 15.9,
  matterPadBottom: 21.5,
  chipH: 22.3,
  chipRadius: 7.4,
  chipPadX: 9,
  chipGlyph: 13.8,
  chipGap: 5.3,
  chipBg: '#F6DCBD',
  chipInk: '#735F47',
  chipSize: 11.7,
  matterNoTop: 4.5,
  matterNoSize: 11.1,
  caseTop: 9.6,
  caseSize: 19.6,
  advocateTop: 8.7,
  advocateGlyph: 20.2,
  advocateGap: 8,
  advocateSize: 11.7,

  // Documents card 259.1–347.6pt.
  docsTop: 16.2,
  docsPadX: 17.1,
  docsPadTop: 14.9,
  docsPadBottom: 11.7,
  docsTitleSize: 13.3,
  docsCountH: 20.2,
  docsCountRadius: 10.1,
  docsCountPadX: 8.5,
  docsCountSize: 10.1,
  docsCountGap: 7.4,
  viewGlyph: 15.9,
  viewGap: 5.3,
  viewSize: 11.7,
  // ⚠ the chip row is CLIPPED in the export — a fourth chip is half off the
  // right edge. It is a horizontal scroller; the chip is kept, not dropped.
  docChipTop: 12,
  docChipH: 23.9,
  docChipRadius: 7.4,
  docChipPadX: 8.5,
  docChipGlyph: 12.7,
  docChipGap: 5.3,
  docChipSize: 10.6,
  docChipBg: '#F0EDED',
  // ⚠ the clipped fourth chip is drawn in a tan fill, not the grey of the
  // first three. Its label is cut off, so the tint cannot be read as a meaning.
  docChipBgAlt: '#F9DEC0',
  docChipSpacing: 8,

  // "Choose how to send" row.
  chooseTop: 27,
  chooseSize: 18,
  tapSize: 11.1,

  // The two option cards: 392.8–500.2 and 507.7–643.4pt.
  optionTop: 10.6,
  optionGap: 10.4,
  optionRadius: 14.9,
  optionSelectedBg: '#FAEFE3',
  optionPadX: 15,
  optionPadTop: 15,
  optionPadBottom: 17,
  tile: 46.7,
  tileRadius: 12.7,
  tileGlyph: 23.4,
  tileBgIdle: '#F0EDED',
  tileBgOn: '#6C5C45',
  tileInkIdle: '#4D463D',
  tileGap: 10.9,
  optionTitleSize: 15.9,
  optionSubTop: 1.8,
  optionSubSize: 12.7,
  optionSubLine: 20,
  optionNoteTop: 5,
  optionNoteSize: 11.7,
  optionNoteInk: '#6E5B43',
  recH: 20.2,
  recRadius: 10.1,
  recPadX: 8.5,
  recSize: 10.6,
  recTop: 10.4,
  safeTop: 5.9,
  safeGlyph: 13.8,
  safeGap: 5.3,
  safeSize: 11.7,
  radio: 20.2,
  radioInner: 8.5,
  radioIdle: '#DAD6D4',
  radioOn: '#2F2A22',

  // Send To card 658.5–785.6pt.
  sendTop: 16,
  sendPadX: 17.1,
  sendPadTop: 12.7,
  sendPadBottom: 22,
  sendGlyph: 15.9,
  sendGap: 5.3,
  sendTitleSize: 13.8,
  copyH: 22.3,
  copyRadius: 7.4,
  copyPadX: 8.5,
  copyGlyph: 12.7,
  copyGap: 4.2,
  copySize: 11.1,
  copyBg: '#F0EDED',
  addrTop: 5.3,
  addrRadius: 10.6,
  addrBg: '#F6F3F2',
  addrPadX: 8.5,
  addrPadY: 9.6,
  addrNameSize: 13.3,
  addrLineTop: 6.9,
  addrLineSize: 11.7,
  addrLineGap: 4.2,

  // Info banner 800.7–896.8pt.
  infoTop: 16,
  infoRadius: 14.9,
  infoBg: '#FBEEE2',
  infoPadX: 15,
  infoPadY: 14.9,
  infoGlyph: 21.2,
  infoCircle: 34,
  infoCircleBg: '#6C5C45',
  infoGap: 10.6,
  infoTitleSize: 13.3,
  infoTitleLine: 17.5,
  infoBodyTop: 2.5,
  infoBodySize: 12.2,
  infoBodyLine: 15.9,
  infoInk: '#55442D',
  infoBodyInk: '#4D463D',

  // Continue button 938.3–987.2pt.
  ctaTop: 43.9,
  ctaH: 52,
  ctaRadius: 12.7,
  ctaBg: '#6C5C45',
  ctaSize: 15.9,
  ctaGlyph: 18,
  ctaGap: 9.6,
  footTop: 11,
  footSize: 11.1,
  bottomPad: 36.1,
};
