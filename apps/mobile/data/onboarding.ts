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
  image: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'advocates',
    title: 'Find Verified Advocates Nearby',
    tagline: 'Find  •  Connect  •  Consult  •  Resolve',
    body: 'Connect with trusted, verified advocates around you. Chat, call, or book consultations easily.',
    image: 'onboarding-1-advocates',
  },
  {
    id: 'notice',
    title: 'Legal Notice',
    tagline: 'Initiate legal action with one click',
    body: 'Create, review and send a professionally prepared legal notice quickly, conveniently, and from one platform',
    image: 'onboarding-2-notice',
  },
  {
    id: 'engage',
    title: 'Engage Verified Advocate',
    tagline: 'Engage  •  Instruct  •  Proceed.',
    body: 'Find and engage a verified advocate for your ongoing case or initiate a new legal matter all from one platform.',
    image: 'onboarding-3-engage',
  },
  {
    id: 'forensic',
    title: 'Get Your Document Forensically Examined — At Your Doorstep.',
    body: 'Suspect a forged signature, handwriting, alteration, overwriting, erasure, or tampering? Submit your document from the comfort of your home and get it examined by forensic experts, with a detailed forensic examination report delivered to your doorstep.',
    image: 'onboarding-4-forensic',
  },
  {
    id: 'fir',
    title: 'Draft Your FIR Right. Start Your Case Strong',
    // "advocate- guided" is the file's spacing; left as drawn.
    body: 'Don’t let important facts or applicable offences get missed. Share your complete narration with us and get your FIR professionally drafted with advocate- guided legal analysis to accurately present the facts and identify the appropriate offences.',
    image: 'onboarding-5-fir',
  },
  {
    id: 'property',
    title: 'Verify the Property Before You Buy',
    tagline: 'Buy Property Not Litigation',
    body: 'Get the property title and revenue records searched and verified by a verified advocate before you buy. Identify potential encumbrances, disputes and title issues and receive a detailed Property Search & Title Verification Certificate.',
    image: 'onboarding-6-property',
  },
];

/**
 * Slide 1's avatar cluster, measured from design/125 at 1x (the files are 390x844,
 * so these are point values directly). `x` and `y` are the circle's top-left within
 * the 390pt-wide hero area; `size` is its diameter; `badge` is the verified badge's
 * diameter. Every badge sits on the circle's upper right.
 */
export const ONBOARDING_AVATARS = [
  { x: 294, y: 183, size: 42, badge: 15, badgeX: 44, badgeY: 4 },
  { x: 30, y: 184, size: 62, badge: 15, badgeX: 61, badgeY: 3 },
  { x: 146, y: 201, size: 106, badge: 21, badgeX: 103, badgeY: 11 },
  { x: 88, y: 296, size: 40, badge: 15, badgeX: 39, badgeY: 0 },
  { x: 228, y: 331, size: 48, badge: 15, badgeX: 44, badgeY: 0 },
  { x: 125, y: 372, size: 48, badge: 15, badgeX: 47, badgeY: 0 },
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IMAGES THIS SECTION NEEDS — none exist yet, so every one renders as a neutral
 * placeholder block at exactly the size and position below. Dropping real images in
 * changes nothing about the layout.
 *
 * Six hero photographs, each shown in a 297pt circle (594px at 2x, 891px at 3x).
 * Square source art is wanted, centre-weighted, since the circle crops to a square:
 *
 *   onboarding-1-advocates   (slide 1 does NOT use this — see the avatars below)
 *   onboarding-2-notice      a judge writing, gavel and law books    design/126
 *   onboarding-3-engage      advocate meeting a client               design/127
 *   onboarding-4-forensic    document examination                    design/128
 *   onboarding-5-fir         police station / FIR paperwork          design/129
 *   onboarding-6-property    property documents or site visit        design/130
 *
 * Slide 1 instead needs SIX advocate portraits, square, at these diameters:
 *   106pt, 62pt, 48pt, 48pt, 42pt, 40pt
 * At 3x the largest needs 318px; 400px square each would cover every density with
 * room to spare. Faces should be centred, since all six are circular crops.
 *
 * So: five hero photographs plus six portraits — eleven images in total. The brief
 * asked for six heroes and seven avatars; slide 1 has six avatars and no hero, so
 * the hero for slide 1 is not needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ONBOARDING_ASSETS = {
  heroCircle: 297,
  avatarSizes: [106, 62, 48, 48, 42, 40],
};
