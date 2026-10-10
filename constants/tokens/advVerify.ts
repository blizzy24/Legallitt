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
