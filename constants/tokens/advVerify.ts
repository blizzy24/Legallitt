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
  noteIconGap: 11,
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
