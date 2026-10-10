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

/** designs 264 + 265 — reviews and ratings. Measured at 2.000 px/pt from 780×1688 exports. */
export const advReviews = {
  padX: 20,
  bg: '#F4F6F8',

  headerBg: '#FFFFFF',
  headerH: 99,
  headerTop: 14,
  backIcon: 26,
  titleGap: 18,
  titleSize: 18,

  sectionTop: 19.5,
  sectionSize: 13.5,

  cardTop: 7.5,
  cardRadius: 14,
  cardPadX: 16,
  cardPadY: 9,
  cardPadBottom: 31.5,

  agoSize: 11.5,
  agoDot: 7,
  agoGap: 7,
  agoRowH: 13,
  scoreTop: 0,
  scoreLine: 32,
  scoreSize: 37,
  chevron: 22,
  basedTop: 2,
  basedSize: 12,

  barTop: 14.5,
  barGap: 6.5,
  barRowH: 10.5,
  barCountW: 26,
  barCountSize: 12,
  barStar: 15,
  barStarGap: 8,
  barH: 10.5,
  barRadius: 5.25,
  barTrack: '#EFE7E0',
  barFill: '#9D7553',
  barTailW: 30,

  tileTop: 32,
  tileGap: 11,
  tileH: 65,
  tileRadius: 14,
  tileNumSize: 24,
  tileLabelTop: 6,
  tileLabelSize: 13,

  chipsTop: 10.5,
  chipH: 24,
  chipRadius: 8,
  chipPadX: 11,
  chipGap: 8,
  chipSize: 12.5,
  chipOnBg: '#9D7553',

  reviewTop: 11,
  reviewGap: 12,
  reviewRadius: 14,
  reviewPadX: 16,
  reviewPadY: 14,
  avatar: 48,
  avatarGap: 12,
  nameSize: 19,
  starsTop: 5,
  star: 16,
  starGap: 6,
  replyGlyph: 22,
  bodyTop: 12,
  bodySize: 11.5,
  // design/264 wraps the review body at ~240pt, well short of the card's inner
  // width. Measured from where its lines actually break, not assumed.
  bodyMaxW: 240,
  // design/264 sets this body unusually tight: ink pitch 12.25pt at an 11.5pt
  // face. Reproduced at 13 — the drawn leading, rounded up just enough that
  // nothing clips on web.
  bodyLine: 13,
  footTop: 14,
  footSize: 14,

  emptyTop: 151,
  emptyGlyph: 88,
  emptyTitleTop: 26,
  emptyTitleSize: 23,
  emptyBodyTop: 11,
  emptyBodySize: 13.5,
  emptyBodyLine: 15,
};

/**
 * design/266 — legal notice draft editor. Measured at 2.000 px/pt from the
 * content of a 786×2354 export (780px screen, 6px of frame on the right).
 *
 * ⚠ THIS IS NOT design/188, WHICH IS ALREADY BUILT. A pixel diff found the six
 * section cards identical — same copy, same geometry — but 188 draws a purple
 * "Legalitt AI" pill and ends with a full AI panel and a "Generate Draft"
 * button, while 266 draws a warm "AI Assist" pill, has NO AI panel at all, and
 * ends with Save Draft / Preview / Continue to Review. Only the differences are
 * tokenised here; the shared body reads advNoticeDraft.
 */
export const advDraftEditor = {
  bg: '#FAF8F5',
  headerH: 68,
  rule: '#E8E2DA',

  partyBg: '#FFFFFF',
  partyH: 54,
  partyPadX: 21,
  partySize: 13.5,

  // ⚠ Warm, not the purple of design/188. #8F7A60 on #F4EEE6 is ink.accent on
  // the existing chip surface — already in the project, nothing quarantined.
  pillW: 90,
  pillH: 30,
  pillRadius: 15,
  pillBg: '#F4EEE6',
  pillGlyph: 15,
  pillGap: 7,
  pillSize: 13.5,

  footerPadX: 12,
  footerPadTop: 12,
  footerBg: '#FFFFFF',
  btnH: 44,
  btnRadius: 10,
  btnGap: 9,
  btnSize: 15,
  ctaTop: 8,
  ctaH: 52,
  ctaRadius: 12,
  ctaSize: 17,
};

/**
 * design/267 — legal notice response editor. Measured at 2.000 px/pt from a
 * 780×1688 export.
 *
 * ⚠ THIS IS NOT design/189, WHICH IS ALREADY BUILT. The two are identical above
 * the footer — same header, same rich-text toolbar, same letterhead and printed
 * body, to sub-pixel anti-aliasing. 189 ends with Edit Draft / Save & Upload and
 * a filled "Share for Review"; 267 ends with Back / Confirm & Upload and an
 * OUTLINED "Generate Draft with AI". Only the footer is tokenised here.
 */
export const advResponseEditor = {
  genTop: 10,
  genH: 46.5,
  genRadius: 14,
  genBorder: '#C8AD8C',
  genBg: '#FBF7F2',
  genSize: 13.5,
};
