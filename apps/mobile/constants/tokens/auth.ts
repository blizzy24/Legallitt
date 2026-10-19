// Auth flow tokens: login, OTP verify and role picker (design/01-08).
//
// Measured from the design exports; see the per-block comments for the file and
// frame each number came from. Re-exported by constants/theme.ts, so screens can
// keep importing from there.

// Login screen metrics, measured from design/01–03 (390×844 @2x).
export const login = {
  top: 61,
  titleSize: 32.5,
  subtitleSize: 16,
  subtitleGap: 6.5,
  headerGap: 24,
  fieldGap: 16,
  dividerGap: 39,
  dividerLine: 1,
  dividerTextSize: 16,
  dividerTextGap: 16,
  socialGap: 35,
  socialSize: 46,
  socialSpacing: 34,
  socialRadius: 8,
  socialIcon: 24,
  termsInsetX: 23,
  termsBottom: 36,
  checkboxSize: 32,
  checkboxRadius: 7,
  checkboxBorder: 1,
  checkboxTick: 14,
  checkboxTickStroke: 4,
  termsGap: 7,
  termsSize: 10.5,
};
// Verify (OTP) screen metrics, measured from design/04–05 (390×844 @2x).
export const verify = {
  top: 89,
  titleSize: 32.5,
  titleLineHeight: 38,
  labelGap: 12.5,
  labelSize: 16,
  boxesGap: 8,
  boxGap: 18,
  boxRadius: 21,
  caretInsetX: 10,
  digitSize: 36,
  bottom: 42,
};
// Role screen metrics, measured from design/06–08 (390×844 @2x).
export const role = {
  // Flex weights for the space above the cards and below the subline (271pt / 208pt at 390×844).
  spaceAbove: 271,
  spaceBelow: 208,
  cardHeight: 90,
  cardGap: 12,
  cardRadius: 20,
  cardBorder: 1.5,
  cardBorderSelected: 3,
  cardPadX: 12,
  avatarSize: 56,
  glyphSize: 26,
  textGap: 12,
  titleSize: 20,
  subtitleSize: 18,
  subtitleGap: 4,
  ringSize: 32,
  ringBorder: 2,
  tickSize: 20,
  tickStroke: 2.5,
  headingGap: 22.5,
  headingSize: 30,
  sublineGap: 6,
  sublineSize: 12,
  sublineMinScale: 0.85,
};
