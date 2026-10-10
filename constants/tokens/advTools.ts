// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE TOOLS — designs 261–274.
//
// Document viewer, reviews, the two notice editors, analytics, and the calendar.
//
// ⚠ MIXED EXPORT SCALES IN ONE BATCH. Most of these files are 780px wide for a
// 390pt screen (2.000 px/pt), but designs 268, 269 and 270 are 1170px — a 3×
// export (3.000 px/pt). Every value below is divided by the scale of the file it
// came from, element by element, never by applying one factor to a block. Five
// token blocks in this project were written off 2× numbers without halving and
// had to be re-measured; the error was not uniform inside any of them.
//
// ⚠ COLOURS — NOTHING NEW. Checked before quarantining anything:
//   270's error circle   #BA1A1A  — already in the project as advForensicRed
//   266's "AI Assist"    #8C6B3F / #F4EEE6 — ink.accent family, already used
//   the cool page grey   #F4F6F8 — already used by advNoticeResponse and
//                                   design/245's settings root
// No quarantine block is opened for this batch.
// ─────────────────────────────────────────────────────────────────────────────

/** design/261–263 — document viewer. Measured at 2.000 px/pt from 780×1694 exports. */
export const advDocViewer = {
  padX: 21.5,
  bg: '#F4F6F8',

  headerBg: '#FFFFFF',
  headerH: 99,
  headerTop: 14,
  backIcon: 26,
  titleSize: 18,
  kebabGlyph: 20,

  fileTop: 9.5,
  fileRadius: 12,
  filePadLeft: 60.5,
  filePadRight: 20,
  filePadY: 13,
  fileNameSize: 13.5,
  fileRowTop: 7.5,
  fileRowGap: 6.5,
  fileLabelW: 41,
  fileLabelSize: 11.5,
  fileValueSize: 11.5,
  lockGlyph: 22,
  lockLabelTop: 6,
  lockLabelSize: 10.5,
  lockLabelLine: 13,

  docTop: 8,
  docRadius: 14,
  docBg: '#FAF6F1',
  docPadX: 8.5,
  docPadY: 10,

  stateTop: 95,
  stateGlyph: 107,
  stateTitleTop: 19,
  stateTitleSize: 15.5,
  stateBodyTop: 7,
  stateBodySize: 14,
  stateBodyLine: 20,
  stateCtaTop: 19,
  stateCtaH: 28.5,
  stateCtaRadius: 8,
  stateCtaPadX: 38,
  stateCtaSize: 14,
  stateTail: 150,

  pagerTop: 9,
  pagerBtn: 35,
  pagerGlyph: 20,
  pagerGap: 15,
  pageW: 131,
  pageH: 29,
  pageRadius: 10,
  pageSize: 16,

  toolsTop: 15.5,
  toolCircle: 32,
  toolGlyph: 17,
  toolLabelTop: 8,
  toolLabelSize: 11.5,
  toolBorder: '#C8AD8C',
  docPadBottom: 20,
};
