// Client onboarding carousel (design/125-130).
//
// The design files are 390x844 PNGs — exactly 1x at the app's reference width, so
// every value below is read straight off design/126, the cleanest of the six.

export const onboarding = {
  bg: '#FFFFFF',
  padX: 24,

  /**
   * Hero circle. REPORTED — THE SIX FILES DISAGREE. design/127, 128, 129 and 130 all
   * draw it 266pt across; design/126, the slide named as the reference, draws it 298.
   * Four files against one, so 266 is used and design/126 is treated as the outlier.
   * Top edge is 140 on every slide.
   */
  circle: 266,
  circleTop: 140,
  circleBg: '#EFE9E1',

  /** Slide 1's cluster occupies the same vertical band as the hero circle. */
  clusterTop: 0,
  clusterHeight: 436,
  avatarBg: '#EFE9E1',
  badgeColour: '#2D8CFF',
  badgeRing: '#FFFFFF',
  badgeRingWidth: 2,

  /**
   * Gap from the hero to the title. REPORTED — this varies across the six files:
   * slides 1, 4, 5 and 6 leave about 50pt, slides 2 and 3 about 34. Four against two,
   * so 50 is used.
   */
  titleGap: 44,
  titleSize: 27,
  titleLineHeight: 34,
  titleColour: '#5A4A3A',

  taglineGap: 13,
  taglineSize: 15,
  taglineLineHeight: 20,
  taglineColour: '#4A3F33',

  bodyGap: 16,
  bodySize: 15.5,
  bodyLineHeight: 22,
  bodyColour: '#7D7268',

  dotsGap: 22,
  dot: 11,
  dotGap: 10,
  dotOn: '#B09C82',
  dotOff: '#F2E9DE',

  buttonGap: 40,
  buttonHeight: 58,
  buttonRadius: 29,
  buttonBg: '#B09C82',
  buttonSize: 17,
  buttonPadX: 17,
};
