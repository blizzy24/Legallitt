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
