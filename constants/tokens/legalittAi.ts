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
 * design/182 is a 932×1239 crop at 2.338 px/pt; design/178 a 812×1908 frame at
 * 2.051 px/pt.
 */
export const legalAiCopilot = {
  radius: 20,
  padX: 18,
  padTop: 12,
  padBottom: 16,
  bg: '#FFFFFF',

  grabW: 44,
  grabH: 5,
  grabColour: '#D8D2C8',
  grabGap: 14,

  tile: 44,
  tileRadius: 13,
  tileIcon: 26,
  tileBg: '#F1E6FE',
  tileGap: 12,
  titleSize: 17,
  chipGap: 10,
  chipHeight: 24,
  chipRadius: 7,
  chipPadX: 9,
  chipSize: 10.5,
  chipSpacing: 0.5,
  chipBg: '#F1E6FE',
  chipColour: '#7F48FE',
  subGap: 3,
  subSize: 13,
  closeIcon: 22,

  ruleGap: 14,
  rule: '#EEEAE4',

  suggGap: 14,
  suggGapX: 9,
  suggHeight: 38,
  suggRadius: 19,
  suggPadX: 15,
  suggSize: 13.5,
  suggBorder: '#E2DCD2',

  msgGap: 16,
  listMaxH: 190,
  markSize: 26,
  markInner: 16,
  markBg: '#F1E6FE',
  markGap: 10,
  bubbleMaxW: 250,
  bubbleRadius: 14,
  bubblePad: 13,
  aiBubbleBg: '#F4F1EC',
  meBubbleBg: '#6B5847',
  msgSize: 14,
  msgLineHeight: 21,

  srcRuleGap: 12,
  srcGap: 10,
  srcIcon: 14,
  srcIconGap: 7,
  srcSize: 12,
  srcLinkSize: 12.5,
  actGap: 12,
  actGapX: 10,
  actHeight: 36,
  actRadius: 10,
  actPadX: 12,
  actIcon: 15,
  actIconGap: 8,
  actSize: 13,
  actBorder: '#E2DCD2',

  barGap: 14,
  barHeight: 46,
  barRadius: 23,
  barPadX: 16,
  barBg: '#F7F3EE',
  barSize: 14,
  clearIcon: 18,
  sendGap: 10,
  sendBtn: 46,
  sendBg: '#6B3FE8',
  sendIcon: 20,
  discGap: 10,
  discSize: 12,
  discLineHeight: 17,
};
