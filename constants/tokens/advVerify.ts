// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE VERIFICATION WIZARD — designs 233–244.
//
// Every value here is measured from the 2× exports and DIVIDED BY 2. The exports
// in this batch are 780px wide for a 390pt screen (scale exactly 2.000 px/pt);
// a few later ones in the same batch are 812px, so each file's width is checked
// before anything is converted. Eight earlier blocks in this project were written
// straight off 2× numbers and rendered oversized; all eight have been corrected.
//
// ⚠ COLOURS — NOTHING NEW HERE.
//
// Sampling design/233 turned up no colour the project does not already have:
//
//   page / card chrome   #FAF8F5, #FFFFFF, #E8E2DA   — colors.appBg, colors.card, ink.badgeBg
//   primary button       #B09C82                     — colors.brand
//   eyebrow + accents    #8F7A60                     — ink.accent
//   success check        #22B573                     — design/211's green, already in the project
//
// The handful of one-off hairline tints below (#EFEBE5 header rule, #F3EFEA
// footer rule and illustration frame, #F1EDE7 stepper connector, #EAF7F0 check
// chip, #F6F3F2 note card) are chrome values local to this flow, not palette
// entries, so they live here rather than in the shared theme.
// ─────────────────────────────────────────────────────────────────────────────

/** design/233 — verification intro. Measured at 2.000 px/pt from a 780×1834 export. */
export const advVerifyIntro = {
  padX: 20,

  // Header: two 36pt circular buttons either side of a centred title, closed by
  // a hairline rule at y=55.
  headerTop: 9.5,
  headerBtn: 36,
  headerBtnBg: '#FFFFFF',
  headerBtnBorder: '#E8E2DA',
  headerIcon: 22,
  titleSize: 16,
  headerPadBottom: 9.5,
  headerRule: '#EFEBE5',

  // The illustration frame sits at a 16pt inset, not the 20pt content grid.
  artInset: 16,
  artTop: 13,
  artHeight: 210,
  artRadius: 16,
  artBorder: '#F3EFEA',

  h1Top: 14.5,
  h1Size: 20.5,
  h1Line: 27,
  subTop: 4,
  subSize: 13.5,
  subLine: 21,

  cardTop: 13,
  cardRadius: 16,
  cardBorder: '#E8E2DA',
  cardPadTop: 16.25,
  cardPadBottom: 15.5,
  cardPadX: 16,

  chip: 22,
  chipBg: '#EAF7F0',
  chipGlyph: 13,
  chipColour: '#22B573',
  chipGap: 13,

  rowTitleSize: 13.5,
  rowTitleLine: 17,
  rowSubTop: 2.25,
  rowSubSize: 12,
  rowSubLine: 16,
  rowRule: '#EFEAE4',
  rowRuleGap: 12,
  rowRuleRight: 15,

  stepsTop: 20.5,
  stepsLabelSize: 11,
  stepsLabelTrack: 1,
  // The four stepper columns are 90pt wide and centred on 60 / 150 / 240 / 330,
  // which is a 15pt inset — one grid step narrower than the 20pt used everywhere
  // else on the screen. Measured, not assumed.
  stepsInset: 15,
  stepsRowTop: 17,
  stepCircle: 28,
  stepCircleBg: '#FAF8F5',
  stepCircleBorder: '#E8E2DA',
  stepNumSize: 13,
  stepLine: '#F1EDE7',
  stepLineWidth: 2,
  stepLabelTop: 5,
  stepLabelPadX: 8,
  stepLabelSize: 10.5,
  stepLabelLine: 13,

  noteTop: 18.5,
  noteBg: '#F6F3F2',
  noteRadius: 12,
  notePadX: 14,
  notePadY: 13.5,
  noteIcon: 14,
  noteIconGap: 5,
  noteSize: 12,
  noteLine: 18,

  footerRule: '#F3EFEA',
  footerPadTop: 8.5,
  ctaHeight: 50,
  ctaRadius: 12,
  ctaLabelSize: 15,
  ctaArrow: 20,
  ctaArrowGap: 7,
  laterTop: 14,
  laterSize: 13,
};

/**
 * Shared chrome for the wizard steps (designs 234–239).
 *
 * ⚠ THE STEP PILL AND THE PROGRESS BAR ARE DRAWN PER SCREEN AND THEY DISAGREE
 * WITH EACH OTHER AND WITH THE SCREEN COUNT. Four segments, six screens, and
 * "Step 3 of 4" and "Step 4 of 4" each drawn twice. Each screen passes the
 * values its own export draws; nothing here renumbers anything.
 *
 * Measured at 2.000 px/pt from design/234's 780×2220 export.
 */
export const advVerifyStep = {
  padX: 20,
  bg: '#FAF8F5',

  headerTop: 21.5,
  backBtn: 40,
  backIcon: 22,
  backBg: '#FFFFFF',
  backBorder: '#E8E2DA',

  titleSize: 17.5,
  titleLine: 24,
  eyebrowTop: 4.5,
  eyebrowSize: 10.5,
  eyebrowTrack: 1.2,

  pillPadX: 14,
  pillHeight: 34,
  pillRadius: 17,
  pillSize: 12,

  progressTop: 22.5,
  progressHeight: 3,
  progressRadius: 1.5,
  progressGap: 5.5,
  progressOff: '#E8E2DA',
  headerPadBottom: 10,
  rule: '#EFEBE5',

  footerPadTop: 12.5,
  ctaHeight: 50,
  ctaRadius: 12,
  ctaLabelSize: 15,
  ctaArrow: 20,
  ctaArrowGap: 7,
  secondaryTop: 13,
  secondarySize: 13,
};

/** design/234 — step 1, personal details. Measured at 2.000 px/pt from a 780×2220 export. */
export const advVerifyPersonal = {
  illusTop: 35.5,
  illusHeight: 85,

  noteTop: 25.5,
  noteBg: '#F6F3F2',
  noteRadius: 12,
  noteBorder: '#E8E2DA',
  notePadX: 14,
  notePadY: 12.25,
  noteIcon: 16,
  noteIconGap: 11,
  noteSize: 12.5,
  noteLine: 20,

  photoTop: 20.5,
  photoHeight: 85.5,
  photoRadius: 16,
  photoPadX: 14,
  ring: 58,
  ringBorder: '#D8CCBA',
  ringGlyph: 26,
  plusBadge: 13.5,
  plusGlyph: 9,
  photoTextGap: 13.5,
  photoTitleSize: 13,
  photoSubTop: 1,
  photoSubSize: 11,
  addW: 84.5,
  addH: 28,
  addRadius: 8,
  addSize: 13,

  fieldTop: 20,
  labelSize: 13.5,
  labelGap: 4,
  starGap: 3,
  inputH: 44,
  inputRadius: 10,
  inputBg: '#FCFBF9',
  inputBorder: '#E8E2DA',
  inputPadX: 15.5,
  inputSize: 15.5,
  helperTop: 4.5,
  helperSize: 12,
  fieldGap: 16,
  fieldGapAfterArea: 23,
  fieldGapAfterHelper: 19,

  areaH: 64,
  areaPadTop: 12.5,

  // The paired City/State inputs are drawn with 12pt of horizontal padding, not
  // the 15.5 the full-width inputs use. Measured, and it matters: at 15.5 the
  // drawn value "Madhya Pradesh" does not fit on one line in Public Sans.
  colGap: 13,
  colPadX: 12,

  vpillH: 21,
  vpillRadius: 10.5,
  vpillPadX: 10,
  vpillSize: 11,
  vpillGlyph: 12,
  vpillInset: 11,
  tickGlyph: 20,
  fieldIcon: 20,
};

/** The select chips on designs 235 and 237. Measured at 2.000 px/pt from design/235. */
export const advVerifyChip = {
  height: 30,
  radius: 10,
  padX: 13,
  gapX: 6.5,
  gapY: 6,
  size: 13,
  glyph: 13,
  glyphGap: 4,
  onBg: '#F4EEE6',
  offBorder: '#E8E2DA',
  addBorder: '#C9A98C',
};

/** design/235 — step 2, professional details. Measured at 2.000 px/pt from a 780×2829 export. */
export const advVerifyProfessional = {
  // ⚠ design/235's header is NOT design/234's. The eyebrow sits 5.5pt higher,
  // the progress bar 7pt higher, and there is no rule under it at all.
  headerTop: 18.75,
  eyebrowTop: -1,
  progressTop: 19,

  noteTop: 10.5,
  noteLine: 20.5,

  sectionTop: 14.5,
  sectionSize: 12.5,
  sectionTrack: 0.8,

  labelTop: 17.5,
  labelTopAfterHelper: 20,
  inputBg: '#FFFFFF',
  inputH: 43,

  chipsTop: 10.5,
  afterChips: 21,
  afterInput: 21,
  sectionAfter: 20.5,

  hintSize: 12,

  areaTop: 11,
  areaH: 83,
  areaPadX: 15.5,
  areaPadY: 14,
  areaSize: 14,
  areaLine: 20,

  metaTop: 15.5,
  metaSize: 12,
};

/**
 * design/236 — step 3, bar council details.
 *
 * ⚠ THIS EXPORT IS NOT LIKE THE OTHERS. It is 844px wide, not 780: the screen
 * is a 780px (390pt) canvas pasted inside a 32px device frame, so everything
 * below is measured from the cropped content at 2.000 px/pt.
 *
 * ⚠ It also draws TWO pieces of chrome that belong to other screens — a top app
 * header reading "Requests" (hamburger, bell, avatar) and a FIVE-tab bottom bar
 * (Dashboard, Requests, Schedule, Messages, Profile). This app's advocate tab
 * bar has four tabs and none of them are Schedule, Messages or Profile, and a
 * pushed wizard screen has no tab bar at all. Neither is built here. See the
 * header comment on app/advocate/verify/bar-council.tsx.
 *
 * ⚠ And its header is a THIRD arrangement: back circle and step pill on one
 * row, then a LEFT-aligned eyebrow, then a left-aligned title, then the
 * progress bar. Built as drawn, inline, rather than bent into VerifyStepChrome.
 */
export const advVerifyBarCouncil = {
  headerTop: 12,
  backBtn: 40,
  backIcon: 22,

  pillW: 96,
  pillH: 28,
  pillRadius: 14,
  pillDot: 7,
  pillDotGap: 8,
  pillSize: 12.5,

  eyebrowTop: 11.5,
  eyebrowSize: 11,
  eyebrowTrack: 1.2,
  titleTop: 6,
  titleSize: 21,
  progressTop: 18,
  progressHeight: 3.5,

  noteTop: 21.5,
  noteBg: '#F6F3F2',
  noteRadius: 12,
  notePadX: 14,
  notePadTop: 7,
  notePadBottom: 8,
  noteTile: 32,
  noteTileRadius: 8,
  // The tile is WHITE with a brown glyph, not a dark chip — sampled, not guessed.
  noteTileBg: '#FFFFFF',
  noteTileColour: '#6C5C45',
  noteTileGlyph: 12,
  noteTileGap: 10,
  noteTitleSize: 16,
  noteTitleLine: 19,
  noteBodyTop: 1.5,
  noteBodySize: 13.5,
  noteBodyLine: 21,

  sectionTop: 25,
  sectionSize: 12,
  sectionTrack: 0.8,

  labelTop: 17.5,
  labelSize: 13.5,
  mandatorySize: 12.5,
  hintTop: 2,
  hintSize: 12.5,
  inputTop: 7,
  inputTopTight: 8,
  // ⚠ 47.5pt tall, white, and with a soft shadow INSTEAD of a border — all
  // three differ from design/234 (44, #FCFBF9, 1pt border) and design/235
  // (43, #FFFFFF, 1pt border). Three field treatments in three consecutive
  // screens of one wizard. Built as each is drawn.
  inputH: 47.5,
  inputRadius: 12,
  inputPadX: 15,
  inputSize: 15.5,
  fieldTop: 17.5,

  dot: 11,
  dotGap: 10,

  accordionTop: 19.5,
  accordionH: 46.5,

  footerPadTop: 13,
  ctaLabelSize: 15,
  saveTop: 15.5,
  saveGlyph: 13,
  saveSize: 13,
};

/**
 * design/237 — step 4, practice details. Measured at 2.000 px/pt from a
 * 780×2528 export.
 *
 * ⚠ A FOURTH HEADER ARRANGEMENT and a FOURTH field treatment in four screens:
 * the eyebrow sits ABOVE the title, the back control is a chevron in a 40pt
 * circle, the step pill is FILLED (#F4EEE6) rather than outlined, all four
 * progress segments are filled on "Step 4 of 4", and the body is three white
 * section cards on a 16pt grid while the progress bar above them stays on 20.
 */
export const advVerifyPractice = {
  headerTop: 12.5,
  backBtn: 40,
  backIcon: 22,
  eyebrowSize: 10.5,
  eyebrowTrack: 1.2,
  titleTop: 4,
  titleSize: 17.5,
  pillW: 87.5,
  pillH: 26,
  pillRadius: 13,
  pillBg: '#F4EEE6',
  pillSize: 12,
  progressTop: 12.5,
  progressHeight: 3.5,
  headerPadBottom: 12.5,

  // The cards and the note sit at 16; the progress bar above them sits at 20.
  cardX: 16,
  cardRadius: 16,
  cardPadX: 17,
  cardPadTop: 12,
  cardPadBottom: 16,
  cardGap: 19.5,

  noteTop: 16,
  noteH: 56.5,
  noteBg: '#F6F3F2',
  noteIcon: 16,
  noteIconGap: 11,
  noteSize: 13,
  noteLine: 20,

  bullet: 5.5,
  bulletH: 14,
  bulletGap: 8,
  sectionSize: 12.5,
  sectionTrack: 0.8,

  labelTop: 11,
  labelSize: 11,
  labelTrack: 0.8,
  inputTop: 5,
  inputH: 44,
  inputBg: '#FDFBFA',
  inputRadius: 10,
  inputPadX: 13,
  colPadX: 10,
  inputSize: 15,
  inputGlyphGap: 8,
  colGap: 11,

  chipsTop: 10,
  specChipH: 25.5,

  modeTop: 12,
  modeH: 79.5,
  modeGap: 9.5,
  modeRadius: 12,
  modeBg: '#FCFAF8',
  modePad: 11,
  modeTile: 22.5,
  modeTileRadius: 6,
  modeTileGlyph: 14,
  modePillH: 19.5,
  modePillRadius: 10,
  modePillPadX: 9,
  modePillSize: 12,
  modeNameTop: 20,
  modeNameSize: 14,
  modeCheck: 15,

  areaTop: 10,
  areaH: 110,
  areaPadX: 12,
  areaPadY: 13,
  areaSize: 14.5,
  areaLine: 20,
  areaRuleTop: 10,
  areaMetaTop: 8,
  areaMetaSize: 12.5,
  areaMetaGlyph: 13,

  footerPadTop: 22,
  ctaLabelSize: 16,
};

/**
 * design/238 — step 5 of six, drawn as "Step 3 of 4". Measured at 2.000 px/pt
 * from a 780×2173 export.
 *
 * ⚠ A FIFTH header arrangement: the progress bar is ABOVE everything, then a
 * back chevron beside a filled "STEP 3 OF 4" pill, then a centred title. The
 * whole screen is on a 16pt grid, not 20.
 */
export const advVerifyDocuments = {
  padX: 16,

  headerTop: 16,
  progressHeight: 3.5,
  rowTop: 14.5,
  backBtn: 32,
  backIcon: 20,
  pillH: 22,
  pillRadius: 11,
  pillPadX: 14,
  pillBg: '#F4EEE6',
  pillSize: 12.5,
  pillTrack: 0.8,
  titleTop: 12,
  titleSize: 20.5,

  heroTop: 20.5,
  heroH: 132.5,
  heroRadius: 16,

  leadTop: 10,
  leadSize: 14,

  acceptTop: 16.5,
  acceptH: 29,
  acceptBg: '#F5F1EB',
  acceptRadius: 10,
  acceptGlyph: 15,
  acceptGap: 9,
  acceptSize: 13,

  cardTop: 11.5,
  cardRadius: 14,
  cardPad: 12,
  cardGap: 17.5,

  tile: 30,
  tileRadius: 8,
  tileBg: '#F4EEE6',
  tileGlyph: 17,
  tileGap: 11.5,
  docTitleSize: 15.5,
  reqPillH: 20,
  reqPillRadius: 6,
  reqPillPadX: 8,
  reqPillBg: '#E8E0D4',
  reqPillSize: 11.5,
  reqPillGap: 7,
  statusSize: 13,
  statusGlyph: 15,
  subTop: 2,
  subSize: 13,
  subLine: 18.5,

  fileTop: 13,
  fileH: 31,
  fileRadius: 8,
  fileBg: '#FAF8F5',
  filePadX: 11,
  fileGlyph: 15,
  fileNameSize: 13.5,
  fileMetaSize: 12.5,

  ruleTop: 13,
  uploadTop: 13,
  uploadW: 146.5,
  uploadH: 33.5,
  uploadRadius: 9,
  uploadGlyph: 16,
  uploadSize: 14,

  barTop: 9,
  barH: 6.5,
  barBg: '#EFE9E1',

  privacyTop: 19,
  privacyRadius: 14,
  privacyPad: 14,
  privacyTile: 30,
  privacyGlyph: 16,
  privacyGap: 11,
  privacySize: 13.5,
  privacyLine: 20,
  linkTop: 5,

  footerPadTop: 17,
  ctaH: 47.5,
};

/**
 * design/239 — review & submit. Measured at 2.000 px/pt from the CONTENT of a
 * 932×3264 export: like design/236 this one is framed, so it was cropped to its
 * 780px screen first (x 76…856, y 26…3144).
 *
 * ⚠ A SIXTH header arrangement: eyebrow, then title, then a subtitle, then a
 * rounded "Final Step · 4 of 4 Completed" pill, then a SHORT centred progress
 * bar (251.5pt wide, not full width). The back control is a circle floated at
 * the left of the eyebrow row.
 */
export const advVerifyReview = {
  padX: 16,

  headerTop: 18.5,
  backBtn: 40,
  backIcon: 22,
  eyebrowSize: 11,
  eyebrowTrack: 1.2,
  titleTop: 8.5,
  titleSize: 21,
  subTop: 5,
  subPadX: 8,
  subSize: 13.5,
  pillTop: 13,
  pillH: 23.5,
  pillRadius: 14,
  pillPadX: 16,
  pillBg: '#F4EEE6',
  pillSize: 13,
  progressTop: 9.5,
  progressW: 251.5,
  progressH: 3.5,
  progressGap: 7,

  cardTop: 9,
  cardRadius: 16,
  cardPad: 16,

  tile: 34,
  tileRadius: 9,
  tileBg: '#FBF6F0',
  tileGlyph: 18,
  tileGap: 11,
  headSize: 14,
  headTrack: 0.7,
  editSize: 14,
  headRuleTop: 8,

  rowTop: 5,
  rowGap: 6.5,
  rowLabelSize: 14,
  rowValueSize: 14,
  rowValueLine: 19.5,
  rowGapX: 12,

  vpillH: 21,
  vpillRadius: 10.5,
  vpillPadX: 8,
  vpillSize: 11.5,
  vpillGlyph: 11,
  vpillGap: 8,

  docTop: 14,
  docGap: 8,
  docH: 57,
  docRadius: 10,
  docBg: '#F6F8F6',
  docPadX: 10,
  docCheck: 26,
  docCheckGlyph: 15,
  docCheckBg: '#DFF3E7',
  docGapX: 9,
  docNameSize: 14.5,
  docFileSize: 12.5,
  docFileTop: 2,

  confirmBox: 24,
  confirmBoxRadius: 6,
  confirmGap: 13,
  confirmSize: 15,
  confirmLine: 21,
  confirmBodyTop: 7,
  confirmBodySize: 13.5,
  confirmBodyLine: 20,

  bciTop: 24.5,
  bciBg: '#F6F3F2',
  bciGlyph: 17,
  bciGap: 11,
  bciSize: 13.5,
  bciLine: 18.5,

  footerPadTop: 5,
  ctaH: 50,
  // ⚠ The Submit button is drawn MUTED because the confirmation checkbox above
  // it is drawn unticked. Both are static; the button does not become active.
  ctaMutedBg: '#E6DED6',
  ctaMutedInk: '#9A9289',
  ctaLabelSize: 16,
};
