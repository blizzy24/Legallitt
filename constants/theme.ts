export const colors = {
  brand:        '#B09C82',
  brandDark:    '#967645',
  brandCheck:   '#A08A6E',
  iconChipBg:   '#F4EEE6',
  avatarBg:     '#EFE5DB',
  screenBg:     '#FFFFFF',
  appBg:        '#FAF8F5',
  card:         '#FFFFFF',
  inputBg:      '#FFFFFF',
  border:       '#ECE8E3',
  borderMuted:  '#D9D9D9',
  textPrimary:  '#111111',
  textBody:     '#5C5C5C',
  textMuted:    '#8A8A8A',
  danger:       '#F55C42',
  info:         '#3B82F6',
};

// Auth screens (login, verify, role) use Inter.
// App screens (home, services) use Public Sans.
export const font = {
  authHeading:  'Inter_700Bold',
  authBody:     'Inter_400Regular',
  authMedium:   'Inter_500Medium',
  authSemi:     'Inter_600SemiBold',  // login title weight, measured from design
  appHeading:   'PublicSans_700Bold',
  appSemi:      'PublicSans_600SemiBold',
  appBody:      'PublicSans_400Regular',
};

export const size = {
  h1: 34, h2: 28, h3: 20, body: 17, small: 15, tiny: 13,
};

export const radius = { input: 28, button: 28, card: 16, chip: 12, box: 14 };
export const space  = { screenX: 20, gap: 16, section: 24 };

// Additions: values from the shared-component spec that the tokens above don't cover.
export const ink = {
  onBrand: '#FFFFFF',  // label on primary button
  shadow:  '#000000',
  hint:    '#A7A7A7',  // placeholder + divider grey, measured from design PNGs
  accent:  '#8F7A60',  // home icons, links, active tab — measured from design/09
};

export const control = {
  buttonHeight: 52,  // measured from design PNGs (login + verify)
  buttonLabel: 18,   // measured from design PNGs
  inputHeight: 60,   // measured from design PNGs
  inputText: 16,
  inputPaddingX: 16,
  pressedOpacity: 0.85,
};

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

// Home screen metrics, measured from design/09 (390pt wide @2x, 620pt tall frame).
export const home = {
  top: 16,
  hairline: 0.5,
  greetingSize: 21.5,
  subtitleSize: 13,
  subtitleGap: 6,
  headerButton: 40,
  headerButtonGap: 10,
  headerButtonTop: 3.5,
  bellIcon: 18,
  dotSize: 10.5,
  dotOffset: 8.5,
  initialsSize: 13,
  searchGap: 20,
  searchHeight: 45.5,
  searchPadX: 13.5,
  searchIcon: 16,
  searchTextGap: 12,
  placeholderSize: 13,
  sectionGap: 18,
  sectionTitleSize: 15,
  viewAllSize: 12.5,
  gridTop: 14,
  gridGap: 10.5,
  cardHeight: 109,
  cardRadius: 12.5,
  cardPad: 13,
  chipSize: 28,
  chipRadius: 8,
  chipIcon: 14,
  cardTitleGap: 6.5,
  cardTitleSize: 12,
  descGap: 4.5,
  descSize: 10,
  descLineHeight: 13,
  tabHeight: 61.5,
  tabBottom: 20.5,
  tabPadLeft: 13,
  tabPadRight: -3.5,
  tabActiveWidth: 52,
  tabActiveHeight: 36,
  tabIcon: 20,
};

// All Services screen metrics, measured from design/10 (390×944pt @2x, includes status-bar space).
export const services = {
  top: 52,
  topInsetGap: 5,
  padX: 16,
  border: 1,
  headerButton: 40,
  backIcon: 16,
  filterIcon: 13,
  titleSize: 17,
  searchGap: 14,
  searchHeight: 48,
  searchRadius: 16.5,
  searchPadX: 16,
  searchIcon: 16,
  searchTextGap: 12,
  placeholderSize: 13,
  gridTop: 16,
  gridGap: 14,
  gridBottom: 24,
  cardHeight: 150,
  cardRadius: 16.5,
  cardPad: 14,
  cardPadBottom: 15,
  chipSize: 32,
  chipIcon: 15,
  chevron: 12,
  chevronStroke: 3,
  chevronInset: -3.5,
  cardTitleSize: 14,
  cardTitleLineHeight: 17,
  cardTitleMinScale: 0.8,
  descSize: 10.5,
  descLineHeight: 15,
  descGap: 4.5,
  descMaxLines: 3,
};

export const homeCardShadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.025,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export const homeControlShadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.03,
  shadowRadius: 1.5,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};

export const tabBarShadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.09,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};

// Third-party logo colours for the social sign-in marks.
export const marks = {
  googleRed:    '#E33629',
  googleYellow: '#F8BD00',
  googleGreen:  '#319F43',
  googleBlue:   '#587DBD',
  facebook:     '#1877F2',
  appStore:     '#17C9FB',
  onMark:       '#FFFFFF',
};

export const shadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

// Stronger shadows measured from design PNGs for the text field and primary button.
export const fieldShadow = { ...shadow, shadowOpacity: 0.16, elevation: 4 };

export const buttonShadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.25,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
  elevation: 4,
};
