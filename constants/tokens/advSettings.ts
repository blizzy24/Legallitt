// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE SETTINGS — designs 245–260.
//
// Measured from the 2× exports and DIVIDED BY 2. Each file's width is checked
// before anything is converted: this batch mixes 780px exports with framed ones
// (828, 844, 932), and the framed ones are cropped to their 780px screen first.
//
// ⚠ THIS SECTION USES A DIFFERENT PAGE BACKGROUND FROM THE WHOLE REST OF THE
// APP. design/245 and its siblings are drawn on #F4F6F8 — a cool blue-grey —
// where every other screen in this project uses the warm #FAF8F5
// (colors.appBg). The icon chips are warm (#FCF3EB) on top of it, so the two
// temperatures sit side by side. Built as drawn, kept local to this block, and
// reported: this is a palette decision, not a drawing one.
//
// ⚠ TWO DIFFERENT ADVOCATES IN ONE BATCH. The verification screens (233–244)
// are Rahul Sharma, MP Bar Council, MP/1428/2018, Indore. These settings
// screens are Priya Sharma, Bar Council of Delhi, D/1842/2015, New Delhi. Both
// are built as drawn; see data/advocateSettings.ts note 2.
// ─────────────────────────────────────────────────────────────────────────────

/** design/245 — settings root. Measured at 2.000 px/pt from a 780×3506 export. */
export const advSettings = {
  padX: 20,
  bg: '#F4F6F8',
  card: '#FFFFFF',

  headerBg: '#FFFFFF',
  headerTop: 18,
  headerPadBottom: 23,
  backIcon: 26,
  titleSize: 17.5,
  titleGap: 12,
  headerIcon: 22,
  headerIconGap: 20,

  profileTop: 21,
  profileRadius: 16,
  profilePad: 16,
  avatar: 55,
  avatarGap: 27,
  nameSize: 18,
  badgeTop: 2,
  badgeGlyph: 14,
  badgeGap: 7,
  badgeSize: 12,
  emailTop: 3,
  emailSize: 11.5,
  editTop: 8,
  editW: 72.5,
  editH: 26,
  editRadius: 7,
  editSize: 12,

  // The gap above a section label is NOT constant in design/245: 14.5pt after
  // the profile card, 31.5pt after every list card. Measured, both kept.
  sectionTopFirst: 14.5,
  sectionTop: 31.5,
  sectionSize: 13.5,
  sectionGap: 7,

  cardRadius: 16,
  cardPadX: 16,

  rowH: 61.5,
  chip: 34,
  chipBg: '#FCF3EB',
  chipGlyph: 18,
  chipGap: 10.5,
  rowTitleSize: 15.5,
  rowSubTop: 2,
  rowSubSize: 11,
  rowSubLine: 15,
  chevron: 20,
  ruleInset: 16,

  toggleW: 46,
  toggleH: 26,
  toggleKnob: 20,
  togglePad: 3,
  toggleOff: '#D8D8D8',

  valueSize: 14,
};

/**
 * design/246 — edit profile. Measured at 2.000 px/pt from a 780×3818 export.
 *
 * ⚠ A THIRD PAGE BACKGROUND IN THREE SCREENS OF THIS SECTION: #F7F7F5 here,
 * #F4F6F8 on design/245, and the project's own #FAF8F5 everywhere else. All
 * measured, none reconciled.
 */
export const advEditProfile = {
  padX: 16,
  bg: '#F7F7F5',

  headerTop: 10,
  backBtn: 40,
  backIcon: 22,
  eyebrowSize: 11,
  eyebrowTrack: 1.2,
  titleTop: 4,
  titleSize: 18,
  headerPadBottom: 18,
  infoBtn: 28,
  infoGlyph: 15,

  profileTop: 7,
  profileRadius: 16,
  profilePadY: 16,
  avatar: 96,
  avatarRing: 3,
  avatarGlyph: 46,
  camera: 42,
  cameraGlyph: 19,
  nameTop: 11,
  nameSize: 18,
  vpillTop: 7,
  vpillH: 24,
  vpillRadius: 12,
  vpillPadX: 14,
  vpillGlyph: 12,
  vpillSize: 11.5,
  metaTop: 11,
  metaSize: 11.5,
  changeTop: 14,
  changeGlyph: 14,
  changeGap: 8,
  changeSize: 11.5,

  sectionTop: 19.5,
  sectionGlyph: 16,
  sectionGap: 9,
  sectionSize: 12,
  sectionTrack: 1,
  sectionBottom: 11.5,

  cardRadius: 16,
  cardPadX: 17,
  cardPadY: 15,

  labelSize: 12,
  labelGap: 9.5,
  inputH: 43,
  inputRadius: 10,
  inputPadX: 15.5,
  inputSize: 13.5,
  fieldGap: 13.5,
  colGap: 12,
  areaH: 150,
  areaPadY: 14,
  areaLine: 21,

  vpillSmallH: 28,
  vpillSmallSize: 12.5,

  chipTop: 10,
  chipH: 30,
  chipRadius: 15,
  chipPadX: 13,
  chipGapX: 8,
  chipGapY: 8,
  chipBg: '#F4EEE6',
  chipSize: 13.5,
  chipClose: 13,
  addSize: 13.5,

  noteTop: 17,
  noteBg: '#F5F0E9',
  noteRadius: 14,
  notePad: 15,
  noteGlyph: 17,
  noteGap: 11,
  noteSize: 13.5,
  noteLine: 21,

  footerPadTop: 14,
  ctaH: 48,
  ctaRadius: 12,
  ctaBg: '#8C7961',
  ctaLabelSize: 17,
  cancelTop: 14,
  cancelSize: 14,
};

/**
 * design/247 — change password. Measured at 2.000 px/pt from the content of an
 * 812×1790 export (a 780px screen inside a 16px frame, cropped first).
 *
 * ⚠ A FOURTH BACKGROUND IN FOUR SCREENS — though this one is the project's own
 * #FAF8F5, which neither design/245 (#F4F6F8) nor design/246 (#F7F7F5) uses.
 */
export const advPassword = {
  padX: 20,
  bg: '#FAF8F5',

  headerTop: 14,
  backIcon: 26,
  eyebrowSize: 11,
  eyebrowTrack: 1.2,
  titleTop: 3,
  titleSize: 19,
  avatar: 36,
  avatarGlyph: 19,
  headerPadBottom: 14,

  heroTop: 6.5,
  heroW: 150,
  heroH: 122,
  heroBg: '#F4F0EB',
  heroGlyph: 46,

  subTop: 8.5,
  subSize: 14,
  subLine: 24,

  cardTop: 13.5,
  cardRadius: 16,
  cardPadX: 20,
  cardPadY: 20,

  labelSize: 14,
  labelGap: 3.5,
  inputH: 44,
  inputRadius: 10,
  inputBg: '#F6F3F2',
  inputPadX: 15,
  inputSize: 15,
  eyeGlyph: 20,
  fieldGap: 22,

  reqTop: 26,
  reqBg: '#F6F3F2',
  reqRadius: 12,
  reqPad: 14,
  reqTitleSize: 12,
  reqTitleTrack: 1,
  reqRowTop: 14,
  reqGlyph: 16,
  reqGap: 9,
  reqSize: 15,

  forgotTop: 26,
  forgotSize: 15,

  ctaTop: 18,
  ctaH: 48,
  ctaRadius: 12,
  ctaBg: '#6C5C45',
  ctaGlyph: 18,
  ctaLabelSize: 17,

  noteTop: 20,
  noteBg: '#F6F3F2',
  noteRadius: 14,
  notePad: 16,
  noteGlyph: 17,
  noteGap: 11,
  noteSize: 14,
  noteLine: 21,
};
