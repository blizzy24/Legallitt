import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens.
//
// This file holds the vocabulary shared by every screen — palette, type, scale,
// spacing, status colours and the shadow presets — plus the re-exports below.
//
// Per-screen metrics live in constants/tokens/<section>.ts and are re-exported
// from here, so `import { cases as t, colors, font } from '../constants/theme'`
// keeps working from anywhere. Add a new screen's block to its section file; add
// a new section by creating the file and adding a line to the re-export list.
// ─────────────────────────────────────────────────────────────────────────────

export * from './tokens/auth';
export * from './tokens/home';
export * from './tokens/cases';
export * from './tokens/legalNotice';
export * from './tokens/fir';
export * from './tokens/profile';
export * from './tokens/propertySearch';
export * from './tokens/documentForensic';
export * from './tokens/legalAdvice';
export * from './tokens/advocate';
export * from './tokens/authV2';
export * from './tokens/onboarding';
export * from './tokens/videoKyc';
export * from './tokens/legalittAi';
export * from './tokens/psrDecision';
export * from './tokens/advFir';
export * from './tokens/advForensic';
export * from './tokens/advVerify';
export * from './tokens/advSettings';
export * from './tokens/advTools';
export * from './tokens/courier';
export * from './tokens/highCourt';
export * from './tokens/districtCourt';
export * from './tokens/advWallet';
export * from './tokens/advCourt';

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

export const radius = { input: 28, button: 28, card: 16, chip: 12, box: 14 };

export const space = {
  screenX: 20,
  gap: 16,
  section: 24,
  /**
   * Side inset used by the four ListHeader screens (All Active Cases, All Hearings,
   * Hearing Details, Case Details) instead of screenX.
   *
   * UNEXPLAINED AND INHERITED: all four wrote `space.screenX - 1.5` with no comment,
   * so why the header sits 1.5pt inside the content grid was never recorded. It is
   * consistent across all four, so it is kept as drawn. Do not round it to 20
   * without re-measuring design/18, 19, 20 and 21 — that would move every one of
   * those headers.
   */
  headerX: 18.5,
};

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

  // ── The tinted red container ────────────────────────────────────────────────
  // A low-emphasis red surface with high-contrast red content. Named for the
  // VISUAL ROLE, not a meaning: the designs use this one pair for three different
  // things — urgency (design/210's "URGENT · 30-Year Search" pill), rejection
  // (design/215's Reject button) and accusation (design/217's "Accused" chip and
  // avatar) — plus design/216's PDF tile, which carries no state at all.
  //
  // Sampled from design/210 and confirmed identical on 215, 216 and 217: six
  // screens across two flows. It was quarantined in constants/tokens/psrUrgent.ts
  // while it appeared once; it is a palette colour now.
  //
  // For the record, both values are Material 3's default light-scheme
  // errorContainer / onErrorContainer, which is almost certainly where the
  // designs took them from.
  redContainer:   '#FFDAD6',  // the tinted surface
  onRedContainer: '#93000A',  // text and icons on it
};

/**
 * Alias kept so design/210's screen and its comments still read in their own
 * terms. It used to be a quarantine block in constants/tokens/psrUrgent.ts, back
 * when the pair appeared on one screen; it now points at the shared palette.
 * New code should use status.redContainer / status.onRedContainer directly.
 *
 * Declared here rather than in constants/tokens/ because the token modules are
 * re-exported from the top of this file, so a token module importing `status`
 * back from here would initialise before `status` exists.
 */
export const psrUrgent = {
  bg: status.redContainer,
  colour: status.onRedContainer,
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

// ─── Shadow presets ──────────────────────────────────────────────────────────
// Kept together here rather than split by section: several are used by shared
// components (homeControlShadow by ServiceTile, tabBarShadow by TabBar) and
// having them side by side is what makes them comparable.

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

export const wizardCardShadow = {
  shadowColor: ink.shadow,
  shadowOpacity: 0.08,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

/**
 * NO CALL SITE. Written for ServiceCard, which applies no shadow at all.
 * design/11 and design/12 cannot settle it either way: at shadowOpacity 0.025 a real
 * shadow would be below the quantisation of the export, and sampling below the card
 * edges finds no gradient. Kept rather than deleted until someone can check the
 * source file — deleting it would lose the only record that a shadow was intended.
 */
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
export * from './tokens/devIndex';
