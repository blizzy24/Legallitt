// Home, All Services and the floating tab bar (design/09-13, 21).
//
// Measured from the design exports; see the per-block comments for the file and
// frame each number came from. Re-exported by constants/theme.ts, so screens can
// keep importing from there.

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
  // RE-MEASURED against design/12. The chip sits 14.0pt inside the card's border on
  // all three cards there (the 2pt-bordered popular card and both 1pt grid cards),
  // and 14.0pt inside it on design/13 too — so this 15 does not match the file and
  // is not, as suspected, a value swapped with services.cardPad.
  // Left at 15 because changing it moves the home grid: the card also renders 2pt
  // taller than design/12 draws it (138pt outer there, 140 here) and only 1pt of
  // that is this padding, so the other 1pt needs finding before touching either.
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
  // Confirmed against design/13: the chip sits 14.0pt inside the card border, and
  // every card top/bottom in the rendered grid lands within 0.5pt of the file. These
  // two are correct as drawn — it is home.cardPad that disagrees with its design.
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
