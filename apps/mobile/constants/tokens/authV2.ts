// Replacement auth section (designs 131-141), superseding the tokens in
// constants/tokens/auth.ts for login and verify. The role screen is unchanged and
// still uses `role` from that file.
//
// All six files export at 812x1782 inside a device frame; the screen inside is
// 780x1782, i.e. exactly 2x. Every value below is measured from that.

export const authHeader = {
  top: 10,
  padX: 20,
  minHeight: 72,
  backIcon: 26,
  eyebrowSize: 11,
  eyebrowSpacing: 2.2,
  eyebrowColour: '#8A6F4B',
  titleGap: 5,
  titleSize: 21,
  rule: '#EFEDE9',
};

export const authLogin = {
  padX: 20,
  bg: '#FFFFFF',

  headingGap: 38,
  headingSize: 34,
  subGap: 9,
  subSize: 15.5,

  labelGap: 57,
  labelSize: 13.5,
  fieldGap: 10,
  fieldHeight: 56,
  fieldRadius: 14,
  fieldBorder: '#EDEBE6',
  fieldPadX: 16,
  fieldIcon: 21,
  fieldIconGap: 14,
  fieldSize: 16,

  buttonGap: 15,
  buttonHeight: 54,
  buttonRadius: 14,
  buttonBg: '#B09C82',
  buttonSize: 17,
  buttonIcon: 19,
  buttonIconGap: 11,

  orGap: 29,
  orSize: 12.5,
  orSpacing: 0.6,
  orRule: '#E6E3DD',
  orGapX: 14,

  socialGap: 29,
  /** Light lavender squares, NOT the old screen's white elevated tiles. */
  social: 50,
  socialRadius: 14,
  socialGapX: 14,
  socialBg: '#F0F4FA',
  socialGlyph: 26,

  signupGap: 31,
  signupSize: 16,
  signupLinkColour: '#8A6F4B',

  termsGap: 79,
  termsSize: 13,
  termsLineHeight: 21,
};

export const authOtp = {
  padX: 20,
  bg: '#FFFFFF',

  chipGap: 22,
  chip: 94,
  chipGlyph: 36,
  chipBg: '#F0F4FA',
  chipColour: '#5A4A37',

  headingGap: 22,
  headingSize: 27,
  subGap: 12,
  subSize: 16,

  pillGap: 14,
  pillHeight: 52,
  pillRadius: 26,
  pillPadX: 20,
  pillBg: '#F0F4FA',
  pillSize: 17,
  pillDotGap: 9,
  pillChangeSize: 16,
  pillChangeColour: '#8A6F4B',
  pillIcon: 17,

  boxesGap: 36,
  box: 54,
  boxHeight: 60,
  boxRadius: 12,
  boxGapX: 9,
  boxCount: 6,
  /** design/135: the box row sits 10.5pt from each screen edge at 390. */
  boxesEdge: 10.5,
  boxBorder: '#EDEBE6',
  boxFilledBg: '#FFFFFF',
  boxSize: 26,

  resendGap: 29,
  resendSize: 15.5,
  resendGapY: 8,
  resendLinkColour: '#A89177',

  buttonGap: 37,
  buttonHeight: 54,
  buttonRadius: 14,
  buttonBg: '#B09C82',
  buttonSize: 17,
  buttonIcon: 19,
  buttonIconGap: 11,

  footGap: 25,
  footIcon: 15,
  footIconGap: 8,
  footSize: 12.5,
  footSpacing: 0.5,
  termsGap: 22,
  termsSize: 13,
};

export const authSignup = {
  padX: 20,
  bg: '#FFFFFF',

  headingGap: 38,
  headingSize: 34,
  subGap: 9,
  subSize: 15.5,

  firstLabelGap: 12,
  labelGap: 12,
  labelSize: 14,
  fieldGap: 7,
  fieldHeight: 47,
  fieldRadius: 14,
  /** Filled lavender fields here, where the login screen's are white and bordered. */
  fieldBg: '#F0F4FA',
  fieldPadX: 16,
  fieldIcon: 21,
  fieldIconGap: 14,
  fieldSize: 16,
  prefixGap: 12,
  prefixRule: '#D7DCE6',
  prefixRuleHeight: 22,
  eyeIcon: 23,

  checkGap: 19,
  checkBox: 28,
  checkRadius: 8,
  checkGlyph: 17,
  checkGapX: 13,
  checkSize: 14.5,
  checkLineHeight: 20,

  buttonGap: 20,
};

export const authSuccess = {
  padX: 24,
  bg: '#FFFFFF',
  markTop: 24,
  markDot: 9,
  markDotGap: 10,
  markSize: 14,
  markSpacing: 2.4,
  markColour: '#A89177',

  glowTop: 164,
  glow: 118,
  glowColour: '#FBF2E6',
  ring: 80,
  ringBg: '#EFF2F8',
  disc: 56,
  discBg: '#FFFFFF',
  badge: 34,
  badgeGlyph: 18,
  badgeBg: '#A89177',

  headingGap: 13,
  headingSize: 27,
  bodyGap: 13,
  bodySize: 17,
  bodyLineHeight: 23,
  subGap: 12,
  subSize: 15,
  subLineHeight: 24,

  buttonGap: 56,
  buttonHeight: 56,
  buttonRadius: 14,
  buttonBg: '#B09C82',
  buttonSize: 17,
  buttonIcon: 19,
  buttonIconGap: 11,
  captionGap: 15,
  captionSize: 13.5,
};

export const authModal = {
  backdrop: 'rgba(40,38,34,0.55)',
  padX: 24,
  cardRadius: 20,
  cardPad: 24,
  mark: 38,
  markGap: 20,
  titleSize: 22,
  subGap: 9,
  subSize: 14.5,
  subLineHeight: 21,
  ruleGap: 20,
  rule: '#ECEAE5',

  rowGap: 16,
  rowAvatar: 54,
  rowAvatarBg: '#EFEAE2',
  rowAvatarSize: 16,
  rowGapX: 14,
  rowNameSize: 17,
  rowSubGap: 3,
  rowSubSize: 14.5,
  rowChevron: 18,

  noteGap: 20,
  noteSize: 13,
  noteLineHeight: 20,
  cancelGap: 18,
  cancelSize: 16,

  /** Apple's variant is a bottom sheet rather than a centred card. */
  sheetRadius: 24,
  grab: 56,
  grabHeight: 5,
  grabColour: '#EDE7DC',
  sectionGap: 18,
  sectionSize: 12.5,
  sectionSpacing: 0.8,
  optionGap: 10,
  optionRadius: 14,
  optionPad: 15,
  optionBg: '#FAF8F5',
  optionTitleSize: 17,
  optionSubGap: 3,
  optionSubSize: 14,
  radio: 30,
  radioGlyph: 16,
  radioOn: '#A89177',
  radioOff: '#EDE7DC',
  continueGap: 20,
  continueHeight: 56,
  continueRadius: 14,
  continueBg: '#B09C82',
  continueSize: 17,
};
