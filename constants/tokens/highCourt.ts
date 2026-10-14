// ─────────────────────────────────────────────────────────────────────────────
// HIGH COURT REPRESENTATION — client side, designs 289–337 (the "hcr" files).
//
// Every export except design/289 is a 780px screen (2.000 px/pt) once cropped
// out of its device frame (16–76px wide, plus a 7pt strip above). Values are
// measured element by element from the cropped PNGs, never by a factor.
//
// ⚠ design/289 is a 228×1023 JPEG thumbnail: 206px of screen for 390pt, 0.528
// px/pt. Its block (hcLanding) is read off that thumbnail and is good to ±2pt;
// shared values are taken from the 2.000 px/pt screens wherever they agree.
// ─────────────────────────────────────────────────────────────────────────────

// ⚠⚠ QUARANTINED PALETTE — colours this batch draws that are NOT in the shared
// theme (constants/theme.ts colors / status / ink). They match the advocate
// side's warm browns and peaches (advDocket.textBrown, bannerIconBg) but those
// are local to their own blocks, not promoted. Do not import these elsewhere;
// promote deliberately if the client confirms the palette.
export const hcPalette = {
  page: '#FCF9F8',
  card: '#FFFFFF',
  ink: '#1B1C1C',
  inkWarm: '#4D463D',
  brown: '#6C5C45',
  /** Icon tiles, the "Division" chip and "Priority" pills. */
  peach: '#F6DCBD',
  /** A selected option card's fill. */
  peachSoft: '#F9ECE1',
  chipGrey: '#ECE8E6',
  /** The landing hero's frame. */
  heroFrame: '#AE987A',
  /** Neutral stand-in for the hero illustration — no asset was supplied. */
  heroArt: '#E6DED3',
};

/** design/289 — service landing. ⚠ Read off a 0.528 px/pt thumbnail; ±2pt. */
export const hcLanding = {
  padX: 20,
  helpIcon: 18,
  helpGap: 14,

  heroTop: 15,
  heroH: 221,
  heroRadius: 14,
  heroInsetX: 28,
  heroInsetTop: 20,
  heroArtRadius: 10,
  badgeH: 22,
  badgeRadius: 11,
  badgePadX: 9,
  badgeDot: 6,
  badgeDotGap: 5,
  badgeSize: 10.5,
  badgeInset: 12,
  /** "High Court Tier" sits on the badge's text line, bare. */
  tierBottom: 15,

  chipTop: 20,
  chipH: 17,
  chipRadius: 8.5,
  chipPadX: 7,
  chipIcon: 10,
  chipIconGap: 4,
  chipSize: 10,
  h1Top: 10,
  h1Size: 25,
  bodyTop: 8,
  bodySize: 15,
  bodyLineHeight: 24.5,
  checkTop: 8,
  checkIcon: 12,
  checkGap: 5,
  checkSize: 11.5,

  btnTop: 22,
  btnH: 50,
  btnRadius: 12,
  btnGap: 8,
  btnSize: 14.5,
  btnIcon: 16,

  sectionTop: 28,
  sectionSize: 10.5,
  sectionSpacing: 0.8,
  sectionMetaSize: 10.5,
  sectionMetaIcon: 11,
  sectionMetaGap: 3,
  gridTop: 12,
  gridGap: 8,
  /** Two cards a row: each grows from 40% of the row. */
  gridCardBasis: '40%' as const,
  cardRadius: 12,
  cardPad: 14,
  gridCardH: 123,
  tile: 34,
  tileRadius: 8,
  tileIcon: 17,
  cardTitleTop: 12,
  cardTitleSize: 13,
  cardDescTop: 3,
  cardDescSize: 10.5,
  cardDescLineHeight: 15.5,

  howTop: 24,
  howIcon: 28,
  howIconGlyph: 14,
  howIconGap: 10,
  howTitleSize: 14.5,
  howTitleLineHeight: 20,
  howBodyTop: 12,
  howBodySize: 14,
  howBodyLineHeight: 21.5,
  howLinkTop: 12,
  howLinkSize: 12.5,
  howLinkGap: 4,
  optColGap: 10,

  headTop: 26,
  headSize: 16,
  headMetaSize: 11,
  optTop: 12,
  optGap: 11,
  optPad: 15,
  optTitleSize: 14.5,
  optBadgeH: 17,
  optBadgeRadius: 6,
  optBadgePadX: 6,
  optBadgeSize: 9.5,
  optBadgeGap: 8,
  optDescTop: 5,
  optDescSize: 11.5,
  optDescLineHeight: 16.5,
  radio: 16,
  radioDot: 9,

  speedTop: 12,
  speedGap: 8,
  speedPad: 14,
  speedH: 159,
  speedPillH: 17,
  speedPillRadius: 6,
  speedPillPadX: 6,
  speedPillSize: 9.5,
  speedTitleTop: 10,
  speedTitleSize: 15,
  speedDescTop: 6,
  speedDescSize: 11,
  speedDescLineHeight: 16,
  speedPriceTop: 12,
  speedPriceSize: 19,
  speedNoteTop: 4,
  speedNoteSize: 10.5,
  popularH: 15,
  popularPadX: 8,
  popularRadius: 4,
  popularSize: 9.5,

  mattersTop: 24,
  mattersBottom: 24,

  barPadTop: 14,
  barPadBottom: 16,
  barTitleSize: 13,
  barSubSize: 10.5,
  barPriceSize: 17.5,
  barNoteSize: 10,
  barBtnTop: 12,
  barBtnH: 51,
  barBtnRadius: 12,
  barBtnSize: 15,
};
