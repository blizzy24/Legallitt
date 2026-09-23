import { Platform } from 'react-native';

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
  // Case IDs (design/14, 16, 19, 20). System monospace until the client supplies the
  // real face — replace this one value and every ID updates.
  mono:         Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
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
  popularBorder: '#DFD7CD',  // 2pt border on Popular cards (design/11 + 12)
  badgeBg: '#E8E2DA',        // "TOP" badge fill (design/11 + 12)
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

// Status colours, sampled from design/14–21 (lossy webp exports, so ±2–3 per channel).
export const status = {
  active:        '#21B474',  // green dot, "Active"/"Upcoming"/"Ongoing" text, verified tick
  activeBg:      '#E9FAF2',  // green pill fill
  activeBorder:  '#D6F3E6',  // green pill edge
  pending:       '#F7A108',  // amber dot (stat card, "Awaiting Review")
  pendingText:   '#9E6028',  // amber text ("Awaiting Review", "Est. Advocate match", "5 days remaining")
  pendingBg:     '#FFFAE9',  // amber pill fill
  pendingBorder: '#F7E7BA',  // amber pill edge
  notification:  '#D7524B',  // red unread dot on the bell
  // "days remaining" uses the amber pill above on design/14 + 15. design/20 draws it as a
  // tan pill (#F5EDE5 fill, #786E64 text) instead — variant, not tokenised until confirmed.
};

// Floating tab bar. `labelled` is measured from design/14 (390×1442 frame, ≈1.09px/pt);
// `iconOnly` from design/21. Both sit 21pt above the bottom edge.
export const tabs = {
  bottom: 21,
  labelled: {
    inset: 44.5,      // side margin — the labelled bar is narrower than the screen grid
    height: 60,
    padX: 8,
    pillWidth: 52,
    pillHeight: 43,
    icon: 21,
    labelSize: 10,
    labelGap: 6,
  },
  iconOnly: {
    inset: 20,
    height: 56,
    padX: 0,
    pillWidth: 51,
    pillHeight: 36,
    icon: 22,
  },
};

// My Cases metrics, measured from design/14 (390×1442pt frame exported at 424px wide,
// ≈1.09px/pt — so these are good to about ±1pt).
export const cases = {
  hairline: 1,
  top: 22.7,
  titleSize: 21.3,
  subtitleGap: 6.9,
  subtitleSize: 12,
  bellButton: 40,
  bellIcon: 18,
  bellDot: 7.5,
  bellDotInset: 8,

  // Segmented control
  segGap: 14.2,
  segHeight: 42.3,
  segRadius: 13,
  segPad: 5,
  segLabel: 13,
  segTrack: '#F4EFE8',

  // Stat cards
  statGap: 27,
  statHeight: 62.5,
  statColGap: 13,
  statRadius: 14,
  statPadX: 10,
  statLabelSize: 10,
  statLabelGap: 13,
  statNumberSize: 16.5,
  statNumberGap: 6,
  statDot: 7,
  statDotGap: 7,

  // Section headings
  sectionGap: 19.7,
  sectionDot: 7.5,
  sectionDotGap: 8,
  sectionTitleSize: 15.5,
  viewAllSize: 12.5,
  headingGap: 10.1,

  // Cards
  cardRadius: 16,
  cardPad: 16.5,
  cardGap: 11.6,
  accentWidth: 4,
  cardTitleSize: 14.75,
  cardTitleGap: 9.5,
  metaSize: 12.3,
  metaGap: 3.3,
  innerRadius: 12,
  innerPad: 12,
  innerGap: 14,
  dividerGap: 11.6,
  footerSize: 12.5,
  footerDot: 7,
  footerDotGap: 8,
  linkSize: 12.5,

  // Pills
  pillHeight: 22,
  pillPadX: 8,
  pillText: 9.7,
  pillDot: 5.5,
  pillDotGap: 5,
  capsSpacing: 0.5,

  // Case ID chip
  chipHeight: 21,
  chipPadX: 8,
  chipRadius: 7,
  chipText: 10.5,

  // "View Case" button
  buttonHeight: 30.4,
  buttonPadX: 14,
  buttonRadius: 9,
  buttonText: 12.5,
  buttonIconGap: 6,

  // Inner label/value block
  innerLabelSize: 8.5,
  innerValueSize: 12,
  innerValueGap: 5,

  // Pending request
  clockButton: 32,
  clockIcon: 16,
  clockInset: 14.8,
  requestTextSize: 11,
  requestGap: 6,
  // Gap above the first section heading when a tab starts with one (design/17).
  tabTopGap: 27,
};

// Home screen metrics, measured from design/11 (guest) + design/12 (logged in),
// both 390pt wide @2x. These supersede design/09.
export const home = {
  topGuest: 20,
  topMember: 25,
  hairline: 1,

  // Guest banner
  bannerHeight: 62,
  bannerRadius: 13,
  bannerPadX: 15.5,
  bannerTextSize: 12,
  signupWidth: 80,
  signupHeight: 45,
  signupRadius: 11,
  signupTextSize: 12,
  eyebrowGap: 23,
  eyebrowSize: 10.2,
  eyebrowSpacing: 1.1,
  welcomeGap: 8,
  welcomeSize: 24.8,
  guestSubtitleGap: 7,
  guestSubtitleSize: 15,

  // Logged-in header (unchanged from design/09 apart from its offset)
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

  // Search
  searchGap: 18.5,
  searchHeight: 46,
  searchRadius: 14,
  searchPadX: 15,
  searchIcon: 16,
  searchTextGap: 9,
  placeholderSize: 14,

  // Section rows
  sectionGap: 17.5,
  sectionTitleSize: 15.8,
  badgeGap: 9,
  badgeHeight: 19,
  badgePadX: 9,
  badgeTextSize: 9.5,
  badgeSpacing: 0.6,
  viewAllSize: 12,
  popularGap: 24.5,
  ourServicesGap: 16,
  gridGap: 25.5,

  // Cards (popular + grid share internals)
  cardRadius: 16.5,
  cardBorder: 1,
  cardBorderPopular: 2,
  cardPad: 15,
  cardPadBottom: 14,
  chipSize: 36,
  chipRadius: 12,
  chipIcon: 14.5,
  dotSize2: 8,
  dotInset: 12,
  cardTitleGap: 9.5,
  cardTitleSize: 14,
  cardDescGap: 5,
  cardDescSize: 12,
  cardDescLineHeight: 20,
  colGap: 12,
  rowGap: 13,

  // Floating tab bar (4 items)
  tabHeight: 68,
  tabBottom: 20.5,
  tabPadX: 18,
  tabActiveWidth: 74,
  tabActiveHeight: 47,
  tabIcon: 32,
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
