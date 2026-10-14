// ─────────────────────────────────────────────────────────────────────────────
// Legalitt AI (designs 170, 171).
//
// ⚠ PALETTE QUARANTINE. This screen has its own visual identity — a near-black
// header and a purple mark — which appears nowhere else in the app. Those colours
// are DELIBERATELY confined to this block and must not leak into the shared
// palette in constants/theme.ts. This is the app's fifth palette divergence,
// after the advocate profile, video KYC, the auth v2 set and the AI flower mark.
//
// Measured at 2.000 px/pt from 780×2018 (design/170) and 780×1704 (design/171).
// ─────────────────────────────────────────────────────────────────────────────

export const legalittAi = {
  padX: 16,
  bg: '#FAF8F5',

  headerBg: '#181615',
  headerTop: 12,
  headerPadBottom: 16,
  headerPadX: 16,
  backBtn: 36,
  backBtnIcon: 20,
  backBtnBg: '#2E2B29',
  backGap: 12,
  titleSize: 17,
  titleColour: '#FFFFFF',
  subGap: 3,
  subSize: 11,
  subColour: '#B8B2AC',

  purple: '#9C4BFE',
  purpleDeep: '#7F48FE',
  purpleTint: '#F1E6FE',

  emptyTop: 38,
  flower: 38,
  greetGap: 14,
  greetSize: 18.5,
  greetSubGap: 11,
  greetSubSize: 13,

  cardGap: 20,
  cardRadius: 16,
  cardPad: 11,
  cardBg: '#FFFFFF',
  tile: 34,
  tileRadius: 10,
  tileIcon: 19,
  tileBg: '#F1E6FE',
  tileBorder: '#DCC6FB',
  tileGap: 12,
  cardTitleSize: 13,
  cardSubGap: 4,
  cardSubSize: 11,
  cardChevron: 18,

  msgGap: 20,
  avatar: 25,
  avatarText: 10,
  avatarGap: 12,
  bubbleMaxW: 270,
  bubbleRadius: 16,
  bubblePad: 15,
  bubbleBg: '#FFFFFF',
  senderSize: 12.5,
  senderGap: 7,
  msgSize: 15,
  msgLineHeight: 24,
  timeGap: 7,
  timeSize: 11.5,
  aiMark: 21,
  copyGap: 12,
  copyHeight: 32,
  copyRadius: 9,
  copyPadX: 10,
  copyIcon: 14,
  copyIconGap: 6,
  copySize: 12.5,
  copyBg: '#F1EFEC',

  composerPadX: 16,
  composerPadTop: 12,
  composerBg: '#FAF8F5',
  composerBorder: '#ECE8E3',
  barHeight: 52,
  barRadius: 26,
  barBg: '#FFFFFF',
  barPadLeft: 16,
  barPadRight: 6,
  attachIcon: 20,
  attachGap: 12,
  inputSize: 15,
  sendBtn: 40,
  sendBtnIcon: 20,
  sendBg: '#8F7A60',

  discGap: 12,
  discSize: 12,
  discLineHeight: 18,
  discColour: '#A79A89',
};

/**
 * designs 178 and 182 — the in-call Legal AI copilot panel.
 *
 * ⚠ SAME PALETTE QUARANTINE as above. The purple here is the only purple in the
 * advocate call flow and must not leak into the shared theme.
 *
 * design/182 (932×1239) is the panel on a 76px-a-side shadow canvas: a 780px panel,
 * 2.000 px/pt, not 2.338. design/178 (812×1908) is a 780px screen inside a 16px
 * frame: also 2.000, not 2.051. The two agree with each other to the half-point.
 *
 * ⚠ RE-MEASURED. The values had been derived at a wrong scale — rendered text ran
 * a median 12.8% wider than both PNGs, non-uniformly (title 8%, the copilot chip
 * 21%). Every value below was re-measured at 2.000 against 182 and confirmed on 178.
 */
export const legalAiCopilot = {
  radius: 20,
  padX: 20,
  padTop: 13.5,
  padBottom: 29,
  bg: '#FFFFFF',

  grabW: 40,
  grabH: 4,
  grabColour: '#D8D2C8',
  grabGap: 18.5,

  tile: 32,
  tileRadius: 9,
  tileIcon: 19,
  tileBg: '#F1E6FE',
  tileGap: 11,
  titleSize: 15.7,
  chipGap: 8,
  chipHeight: 18,
  chipRadius: 5,
  chipPadX: 6.5,
  chipSize: 8.7,
  chipSpacing: 0.5,
  chipBg: '#F1E6FE',
  chipColour: '#7F48FE',
  subGap: 3,
  subSize: 11,
  closeIcon: 16,

  ruleGap: 14,
  rule: '#EEEAE4',

  suggGap: 18.5,
  suggGapX: 7,
  suggHeight: 36,
  suggRadius: 18,
  suggPadX: 11.5,
  suggSize: 12,
  suggBorder: '#E2DCD2',

  listTop: 16,
  msgGap: 12,
  /** design/182 sets the answer 6pt below the question bubble's row. */
  meGap: 9,
  listMaxH: 295,
  markSize: 23,
  markInner: 14,
  markBg: '#F1E6FE',
  markGap: 9,
  bubbleMaxW: 289,
  bubbleRadius: 14,
  bubblePadX: 11,
  bubblePadY: 9.5,
  aiBubbleBg: '#F6F3F2',
  meBubbleBg: '#6B5847',
  msgSize: 13.15,
  msgLineHeight: 19,

  srcRuleGap: 12,
  srcGap: 10,
  srcIcon: 14,
  srcIconGap: 7,
  srcSize: 10.7,
  srcLinkSize: 11,
  actGap: 12,
  actGapX: 9,
  actHeight: 42,
  actRadius: 9,
  actPadX: 12,
  actIcon: 12,
  actIconGap: 8,
  actSize: 12,
  actBorder: '#E2DCD2',

  barGap: 8.5,
  barHeight: 43.5,
  barRadius: 22,
  barPadX: 16,
  barBg: '#F7F3EE',
  barSize: 12.9,
  clearIcon: 11,
  sendGap: 8,
  sendBtn: 44,
  sendBg: '#6B3FE8',
  sendIcon: 16,
  discGap: 8,
  discSize: 10.5,
  discLineHeight: 17,
};
