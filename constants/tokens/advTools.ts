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
// ⚠ COLOURS — ONE NEW ONE, QUARANTINED BELOW. Checked before quarantining:
//   270's error circle   #BA1A1A  — already in the project as advForensicRed
//   266's "AI Assist"    #8C6B3F / #F4EEE6 — ink.accent family, already used
//   the cool page grey   #F4F6F8 — already used by advNoticeResponse and
//                                   design/245's settings root
// design/270's error circle is the exception: #FF6E6E is NOT any red this
// project already has. See advAnalyticsRed below.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠ PALETTE QUARANTINE — design/270's error circle.
//
//   errorCircle #FF6E6E   sampled from the filled disc
//
// The brief expected this to be the project's existing danger red. It is not.
// The project already carries THREE reds:
//
//   colors.danger                #F55C42  (designs 14–21)
//   status.notification          #D7524B  (unread dot)
//   advForensicRed.declineColour #BA1A1A  (designs 222–232, reused on 249/253/254)
//
// #FF6E6E is a fourth, lighter and pinker than all of them. Built as drawn and
// kept here rather than folded into any of the three, because picking one of
// them would change the drawn screen and picking none of them would add a
// fourth red to the shared palette. That is a decision for review.
export const advAnalyticsRed = {
  errorCircle: '#FF6E6E',
};

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
  // Drawn at 12.5pt; Public Sans runs wider than the export's face, and
  // "3 Hours Before" wraps inside the drawn 111pt chip above 10.5. Shrunk, not
  // wrapped, per the house rule.
  chipSize: 10.5,
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

/**
 * designs 268 + 270 — analytics. Measured at 3.000 px/pt from 1170×2727
 * exports. ⚠ THESE ARE 3× FILES, NOT 2×. Every value here is divided by three.
 */
export const advAnalytics = {
  padX: 20,
  bg: '#FEFCFC',
  cardBorder: '#D9D9D9',

  headerBg: '#FFFFFF',
  headerH: 99,
  headerTop: 14,
  backIcon: 26,
  titleSize: 20,

  monthTop: 2.5,
  monthGlyph: 20,
  monthGap: 14,
  monthSize: 16,
  rangeW: 110,
  rangeH: 38,
  rangeRadius: 8,
  rangeSize: 15,
  rangeGlyph: 18,

  tileTop: 22,
  tileGap: 17,
  tileH: 77,
  tileRadius: 10,
  tilePadX: 13,
  tileLabelTop: 10.7,
  tileLabelLine: 17,
  tileLabelSize: 15,
  tileValueTop: 1.5,
  tileValueLine: 33,
  tileValueSize: 31,
  tileValueColour: '#906D40',
  tileDeltaTop: 0,
  tileDeltaGlyph: 14,
  tileDeltaSize: 13,
  tileDeltaColour: '#00B500',

  cardTop: 9,
  cardRadius: 10,
  cardPadX: 13,
  cardPadY: 13,

  overTitleSize: 16,
  overValueTop: 6,
  overValueSize: 31,
  overSubTop: 4,
  overSubSize: 13,
  overDeltaTop: 7,
  overDeltaSize: 13,

  chartTop: 10,
  chartLabelSize: 13,
  // Plot area, measured off the export: x 56.3…350.3, ₹30k gridline at 475.7pt
  // and ₹0 at 569.7, four lines 31.3 apart.
  plotLeft: 56.3,
  plotRight: 350.3,
  plotTop: 475.7,
  plotBottom: 569.7,
  gridGap: 31.3,
  gridColour: '#CCCCCC',
  axisSize: 10,
  axisLabelH: 12,
  axisLabelX: 31,
  weekTop: 13,
  weekSize: 13,
  chartFill: '#FCEEE2',
  chartLine: '#B69268',
  chartLineW: 2.6,
  dotR: 5,
  ringR: 5,
  ringW: 2.6,

  donutTitleSize: 16,
  donutTop: 17,
  donutCx: 56.9,
  donutCy: 61,
  donutR: 34.7,
  donutW: 14.3,
  donutTotalSize: 24,
  donutTotalLabelSize: 13,
  donutGreen: '#598252',
  donutBrand: '#B48E6A',
  donutRed: '#FF0000',
  legendLeft: 116.7,
  legendDot: 11,
  legendGap: 14,
  legendRowH: 28,
  legendSize: 16,
  legendValueSize: 16,

  perfTop: 33,
  perfH: 49,
  perfRadius: 12,
  perfBorder: '#B8A790',
  perfSize: 18,

  errTop: 150,
  errCircle: 92,
  errGlyph: 46,
  errTitleTop: 26,
  errTitleSize: 20,
  errBodyTop: 10,
  errBodySize: 15,
  errBodyLine: 22,
  errCtaTop: 26,
  errCtaH: 46,
  errCtaRadius: 10,
  errCtaPadX: 30,
  errCtaSize: 16,
};

/**
 * design/269 — service and monthly performance. Measured at 3.000 px/pt from a
 * 1170×2727 export. ⚠ A 3× FILE.
 */
export const advPerformance = {
  cardTop: 4,
  perfCardTop: 146.5,
  cardPadX: 16,

  titleSize: 16,
  titleTop: 16,

  rowTop: 20,
  rowGap: 17.3,
  rowH: 25.5,
  labelW: 124,
  labelSize: 13.5,
  labelLine: 14,
  subTop: 0,
  subSize: 12.5,
  subLine: 13,

  barLeft: 164,
  barW: 160,
  barH: 20,
  barRadius: 6,
  barTrack: '#F4F6F8',
  barFill: '#A57C58',
  barValueLeft: 10,
  barValueSize: 16,

  tableTop: 9,
  tableTitleTop: 13,
  headTop: 14,
  headSize: 11.5,
  headRuleTop: 7,
  tableRowH: 28,
  tableRowSize: 16,
  tableStar: 14,
  tableStarGap: 6,
  tableHighlight: '#F6E9DF',
  colMonthly: 0.28,
  colEarnings: 0.3,
  colConsults: 0.26,
  colRating: 0.16,
};

/**
 * The back-and-title bar shared by designs 271, 272, 273 and 274. Measured off
 * design/271 at 2.000 px/pt and checked against the other three.
 * See components/AdvToolHeader.tsx.
 */
export const advToolHeader = {
  padX: 21,
  bg: '#FFFFFF',
  ink: '#4D4439',
  height: 103.5,
  top: 24,
  // Drawn 38pt across and hanging 8pt into the gutter: its ink starts at 26.0pt.
  backIcon: 38,
  backHang: 8,
  titleGap: 1,
  titleSize: 18.5,
  glyph: 23,
  glyphGap: 20,
};

/**
 * design/272 — add court hearing. Measured at 2.000 px/pt from a 780×1790
 * export, element by element.
 */
export const advAddHearing = {
  padX: 28,
  bg: '#F4F6F8',
  ink: '#4D4439',
  // ⚠ design/272 draws its header title near-black where designs 271, 273 and
  // 274 draw theirs in #4D4439.
  titleInk: '#1B1C1C',

  contentTop: 22.3,
  labelSize: 12.5,
  labelLine: 15,
  labelGap: 4,
  groupGap: 5,

  // Fields 28.0–362.0pt, 30.0pt tall, 1pt #E2E2E2 border on white.
  fieldH: 30,
  fieldRadius: 8,
  fieldBorder: '#E2E2E2',
  fieldBg: '#FFFFFF',
  fieldPadX: 9,
  fieldSize: 12.5,
  chevron: 21,
  chevronInk: '#333333',
  // The hearing-date field alone is drawn short: 28.0–164.5pt.
  dateW: 136.5,
  notesH: 60,
  notesPadY: 7,

  remindTop: 11.75,
  remindSize: 12.5,
  chipsTop: 5.25,
  // ⚠ the three reminder chips are drawn 99.5, 111.0 and 102.5pt wide — neither
  // equal nor sized to their text. Those widths are used as flex weights, so at
  // 390pt the row is the drawn row and at 360pt it narrows in proportion.
  chipWeights: [99.5, 111, 102.5],
  chipH: 29.5,
  chipRadius: 8,
  chipBorder: '#DEBFA3',
  chipBg: '#FFFFFF',
  chipGap: 10,
  chipPadX: 7,
  // Drawn at 12.5pt; Public Sans runs wider than the export's face, and
  // "3 Hours Before" wraps inside the drawn 111pt chip above 10.5. Shrunk, not
  // wrapped, per the house rule.
  chipSize: 10.5,
  boxSize: 10.5,
  boxRadius: 3,
  boxGap: 4.5,
  customGlyph: 16,

  // ⚠ the Save button is drawn on a 20pt gutter where every field above it
  // sits on 28pt.
  saveTop: 26.5,
  savePadX: 20,
  saveH: 36.5,
  saveRadius: 10,
  saveBg: '#A57E5A',
  saveSize: 13,

  contentBottom: 30,
};

/**
 * design/273 — appointment details. Measured at 2.000 px/pt from a 780×1790
 * export, element by element.
 */
export const advApptDetails = {
  padX: 21,
  // ⚠ the two action buttons and the "Actions" label sit on a 20pt gutter
  // where the two cards above them sit on 21pt.
  actionPadX: 20,
  bg: '#F4F6F8',
  ink: '#4D4439',
  cardBg: '#FCF7F3',
  cardRadius: 16,

  // Client card 116.0–194.0pt.
  cardTop: 13,
  clientH: 78,
  clientPadX: 14,
  // ⚠ design/273 draws a PHOTOGRAPH here. No photography ships with this
  // prototype, so the house convention is used: a brand circle with the
  // UserRound glyph, exactly as components/AdvocateCasesList already does.
  avatar: 40,
  avatarBg: '#A57E5A',
  avatarGlyph: 24,
  avatarGap: 9.5,
  nameSize: 16,
  nameLine: 19.2,
  matterTop: 4.8,
  matterSize: 10.5,
  matterColour: '#00A938',
  chipH: 11.5,
  chipRadius: 6,
  chipPadX: 8.5,
  chipSize: 8.5,
  chipBg: '#EDFFDD',
  chipColour: '#52B100',
  chipPadRight: 11,

  // Detail card 198.0–345.5pt, rows on a 21pt pitch.
  rowsTop: 1.5,
  rowsPadX: 13.5,
  rowsPadTop: 10.6,
  rowsPadBottom: 6.5,
  rowPitch: 21,
  // The Consultation row carries a 22pt glyph and is drawn taller.
  rowIconPitch: 27.5,
  labelW: 89.5,
  rowSize: 11,
  rowIcon: 22,
  rowIconColour: '#A57E5A',
  rowIconGap: 9,

  actionsTop: 2,
  actionsSize: 11,
  joinTop: 5.8,
  btnH: 37.5,
  btnRadius: 10,
  joinBg: '#A57E5A',
  joinGlyph: 22,
  joinGap: 12,
  btnSize: 13,
  viewTop: 8,
  viewBorder: '#A57E5A',

  contentBottom: 30,
};

/**
 * design/274 — manage availability. Measured at 2.000 px/pt from a 780×1790
 * export, element by element.
 */
export const advManageAvailability = {
  padX: 21,
  bg: '#F4F6F8',
  ink: '#4D4439',
  brand: '#A57E5A',
  cardBg: '#FCF7F3',
  cardRadius: 16,

  // Working-hours card 118.0–192.0pt.
  cardTop: 12.5,
  cardPadX: 11,
  cardPadTop: 8.8,
  cardPadBottom: 5,
  titleSize: 16,
  titleLine: 19.2,
  // Seven 36pt circles on a 48pt pitch, 32.0–355.5pt.
  circlesTop: 7,
  circle: 36,
  circleSize: 9.5,
  circleOn: '#A57E5A',
  circleBorder: '#BABABA',
  circleOff: '#000000',

  // Hours card 196.5–398.0pt.
  hoursCardTop: 4.5,
  hoursPadTop: 12.4,
  hoursPadBottom: 6.5,
  hoursTitleSize: 12,
  hoursTitleLine: 14.4,
  hoursValueTop: 4.3,
  hoursValueSize: 10.5,
  editW: 77.5,
  editH: 27.5,
  editRadius: 8,
  editSize: 10.5,

  // Slot rows 34.0–356.0pt, 40pt tall, 5pt apart.
  slotsTop: 15.2,
  slotH: 40,
  slotRadius: 10,
  slotBorder: '#F4DDC8',
  slotGap: 5,
  slotPadX: 12.5,
  slotTitleSize: 11.5,
  slotTitleLine: 13.7,
  slotValueTop: 1.6,
  slotValueSize: 10.5,
  slotChevron: 22,

  // "+ Add Time Slot" 354.0–391.5pt, dashed.
  addTop: 13,
  addH: 37.5,
  addRadius: 10,
  addGlyph: 18,
  addGap: 10,
  addSize: 12.5,

  contentBottom: 30,
};

/**
 * design/271 — appointment calendar. Measured at 2.000 px/pt from a 780×2160
 * export, element by element: every figure below is a pixel reading halved.
 */
export const advCalendar = {
  padX: 21,
  bg: '#F4F6F8',
  ink: '#4D4439',
  rule: '#D4D4D4',
  brand: '#A57E5A',

  // The header is components/AdvToolHeader — see advToolHeader above.

  // Card 123.0–203.0pt; "Your Availability" cap 136.0–146.5 (11.0pt cap → 15.5).
  availTop: 19.5,
  availRadius: 16,
  availPadX: 11.5,
  availPadTop: 11,
  availPadBottom: 13,
  availTitleSize: 15.5,
  availTitleLine: 19,
  availRowTop: 2,
  availGlyph: 14,
  availGap: 6.5,
  availOnSize: 10.5,
  availOnLine: 14,
  availOnColour: '#00A938',
  availSubTop: 3,
  availSubSize: 8,
  availSubLine: 9,
  // design/271 wraps the sub-line after "during your" although the card is far
  // wider than that. The break is only reproducible by capping the column, and
  // the export places it anywhere between 169 and 199pt.
  availSubW: 180,
  // Track 309.0–351.0 × 155.0–175.0pt, knob 331.0–349.0.
  toggleW: 42,
  toggleH: 20,
  toggleKnob: 17,
  togglePad: 1.5,
  toggleOn: '#A57E5A',

  monthTop: 11,
  monthGlyph: 24,
  monthSize: 16,

  // The grid: 7 columns across a 12.4pt inset, row pitch 28.0pt, day pill
  // 22.0pt, markers 4.0pt. Only the NUMBERS are computed — see
  // components/MonthGrid.tsx.
  gridTop: 15.5,
  gridPadX: 9.5,
  // design/271 does not centre the grid: its ink runs 34.5–361.0pt, 4.75pt
  // right of centre on a 390pt screen. Reproduced rather than tidied up.
  gridShift: 4.75,
  weekdays: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  headSize: 10,
  rowGap: 0,
  headRowGap: 4,
  pill: 22,
  daySize: 10.5,
  mutedDay: '#B7B7B7',
  selectedBg: '#A57E5A',
  dotSlot: 6,
  dot: 4,
  dotColour: '#A57E5A',

  ruleTop: 7.5,
  todayTop: 8.5,
  todaySize: 11,
  schedTop: 8,
  schedSize: 11,
  // "+ Add Availability" pill 289.0–370.0 × 464.0–482.0pt.
  addW: 81,
  addH: 18,
  addRadius: 6,
  addBorder: '#A57E5A',
  addGlyph: 12,
  addGap: 3.5,
  addSize: 8.5,

  // Appointment cards: 78.0pt tall, 6.0pt apart, 348pt wide.
  apptTop: 9.5,
  // ⚠ design/271 leaves 6.5pt between the first three cards and 10.5pt before
  // the fourth. Nothing distinguishes that gap; it is drawing slop, so a single
  // 6.5pt gap is used and the court-hearing card sits 4pt higher than drawn.
  apptGap: 6.5,
  apptRadius: 14,
  apptBg: '#FCF7F3',
  apptPadX: 9,
  // Every appointment card in design/271 is exactly 77.5pt tall, the four-line
  // court-hearing card included, so the height is fixed and the column is
  // centred rather than padded.
  apptH: 77.5,
  // Time chip 30.0–76.0 × 597.0–639.0pt.
  timeW: 46,
  timeH: 42,
  timeRadius: 8,
  timeBg: '#F7EDE4',
  timeSize: 12.5,
  timeLine: 13.5,
  apptGapX: 8,
  apptTagH: 12,
  apptTagRadius: 6,
  apptTagPadX: 7.5,
  apptTagSize: 8.5,
  apptTagBg: '#E7E0FA',
  apptTagColour: '#5B3FD6',
  apptNameTop: 3,
  apptNameSize: 15.5,
  apptNameLine: 19,
  // ⚠ design/271 sets the fourth card's title SMALLER than the other three —
  // 8.5pt cap against 11.0pt — because "High Court of Madhya Pradesh" does not
  // fit at the common size. Drawn as drawn; see AT_CALENDAR.appointments.
  apptNameSizeLong: 12,
  apptNameLineLong: 14.5,
  apptMatterTop: 6,
  apptMatterSize: 10,
  apptMatterLine: 13,
  apptMatterColour: '#00A938',
  apptMetaTop: 5.5,
  apptMetaSize: 9,
  apptMetaLine: 12,
  apptIcon: 20,
  apptIconColour: '#A57E5A',
  apptIconGap: 12,
  apptStatusH: 12,
  apptStatusRadius: 6,
  apptStatusPadX: 8.5,
  apptStatusSize: 8.5,
  apptStatusBg: '#EDFFDD',
  apptStatusColour: '#52B100',
  apptStatusGap: 3.5,
  apptChevron: 22,
  apptChevronColour: '#A2A2A2',

  // "Add Hearing" 844.0–881.0pt, full 348pt width.
  addHearingTop: 17,
  addHearingH: 37,
  addHearingRadius: 10,
  addHearingGlyph: 18,
  addHearingGap: 10,
  addHearingSize: 12.5,

  // Manage Availability card 899.0–1024.0pt.
  manageTop: 18,
  manageBg: '#FCF7F3',
  manageRadius: 14,
  managePadX: 11.5,
  managePadTop: 8,
  managePadBottom: 10.5,
  manageTitleSize: 12,
  dayCircleTop: 4.7,
  // Seven 36.0pt circles on a 48.0pt pitch.
  dayCircle: 36,
  dayCircleSize: 9.5,
  dayCircleOn: '#A57E5A',
  dayCircleBorder: '#BABABA',
  dayCircleOff: '#000000',
  manageRuleTop: 15.5,
  hoursTop: 6.3,
  hoursTitleSize: 10.5,
  hoursValueTop: 4,
  hoursValueSize: 10.5,
  editW: 66,
  editH: 18,
  editRadius: 6,
  editSize: 8.5,
};
