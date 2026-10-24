import type { ImageSourcePropType } from 'react-native';

// Client onboarding carousel copy (design/125-130).
//
// Six slides, one layout. All copy lives here so it can be edited in one place
// without touching the carousel.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — SLIDE 1 HAS SIX AVATARS, NOT SEVEN. design/125 draws six circular
// portraits, each with one blue verified badge: counted twice, once as image blobs
// and once as badges, and both give six. Their measured geometry is below.
//
// REPORTED — THE PAGER IS CORRECT IN EVERY DESIGN. Slide N lights dot N on all six
// files, design/127 included — measured by comparing the darkness of each of the six
// dots on each file. There is no file error to work around.
//
// Drawn as-is: slide 5 reads "advocate- guided" with the space after the hyphen,
// and slide 4's title ends in a full stop where no other slide's does.
// ─────────────────────────────────────────────────────────────────────────────

export type OnboardingSlide = {
  id: string;
  title: string;
  /** Bold line between title and body. Slides 4 and 5 have none. */
  tagline?: string;
  body: string;
  /** The hero photograph this slide needs. See ONBOARDING_ASSETS. */
  image?: ImageSourcePropType;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'advocates',
    title: 'Find Verified Advocates Nearby',
    tagline: 'Find  •  Connect  •  Consult  •  Resolve',
    body: 'Connect with trusted, verified advocates around you. Chat, call, or book consultations easily.',
  },
  {
    id: 'notice',
    title: 'Legal Notice',
    tagline: 'Initiate legal action with one click',
    body: 'Create, review and send a professionally prepared legal notice quickly, conveniently, and from one platform',
    image: require('../assets/onboarding-01.png'),
  },
  {
    id: 'engage',
    title: 'Engage Verified Advocate',
    tagline: 'Engage  •  Instruct  •  Proceed.',
    body: 'Find and engage a verified advocate for your ongoing case or initiate a new legal matter all from one platform.',
    image: require('../assets/onboarding-02.png'),
  },
  {
    id: 'forensic',
    title: 'Get Your Document Forensically Examined — At Your Doorstep.',
    body: 'Suspect a forged signature, handwriting, alteration, overwriting, erasure, or tampering? Submit your document from the comfort of your home and get it examined by forensic experts, with a detailed forensic examination report delivered to your doorstep.',
    image: require('../assets/onboarding-03.png'),
  },
  {
    id: 'fir',
    title: 'Draft Your FIR Right. Start Your Case Strong',
    // "advocate- guided" is the file's spacing; left as drawn.
    body: 'Don’t let important facts or applicable offences get missed. Share your complete narration with us and get your FIR professionally drafted with advocate- guided legal analysis to accurately present the facts and identify the appropriate offences.',
    image: require('../assets/onboarding-04.png'),
  },
  {
    id: 'property',
    title: 'Verify the Property Before You Buy',
    tagline: 'Buy Property Not Litigation',
    body: 'Get the property title and revenue records searched and verified by a verified advocate before you buy. Identify potential encumbrances, disputes and title issues and receive a detailed Property Search & Title Verification Certificate.',
    image: require('../assets/onboarding-05.png'),
  },
];

/**
 * Slide 1's avatar cluster, measured from design/125 at 1x (the files are 390x844,
 * so these are point values directly). `x` and `y` are the circle's top-left within
 * the 390pt-wide hero area; `size` is its diameter; `badge` is the verified badge's
 * diameter. Every badge sits on the circle's upper right.
 */
export const ONBOARDING_AVATARS = [
  { image: require('../assets/advocate-04.png'), x: 294, y: 183, size: 42, badge: 15, badgeX: 44, badgeY: 4 },
  { image: require('../assets/advocate-01.png'), x: 30, y: 184, size: 62, badge: 15, badgeX: 61, badgeY: 3 },
  { image: require('../assets/advocate-06.png'), x: 146, y: 201, size: 106, badge: 21, badgeX: 103, badgeY: 11 },
  { image: require('../assets/advocate-02.png'), x: 88, y: 296, size: 40, badge: 15, badgeX: 39, badgeY: 0 },
  { image: require('../assets/advocate-03.png'), x: 228, y: 331, size: 48, badge: 15, badgeX: 44, badgeY: 0 },
  { image: require('../assets/advocate-05.png'), x: 125, y: 372, size: 48, badge: 15, badgeX: 47, badgeY: 0 },
];

/** All eleven supplied images match designs 125–130. The six portraits on
 * 125 are unnamed. Named replacement assignments are recorded in advocates.ts.
 * Files are already circular with alpha: render with contain, without clipping.
 */
export const ONBOARDING_ASSETS = {
  heroCircle: 297,
  avatarSizes: [106, 62, 48, 48, 42, 40],
};
