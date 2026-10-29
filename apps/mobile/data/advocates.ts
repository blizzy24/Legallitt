import type { ImageSourcePropType } from 'react-native';
// Saved advocates (design/55).
//
// Separate from data/cases.ts's advocate records: those are the counsel assigned to a
// case and carry no fee or availability. These are the saved-counsel cards, which do.
// If the client ever merges the two, this is the file to fold in.

export type AdvocateReview = {
  initials: string;
  name: string;
  stars: number;
  quote: string;
};

export type SavedAdvocate = {
  id: string;
  initials: string;
  name: string;
  verified: boolean;
  practice: string;
  location: string;
  rating: string;
  fee: string;
  /** "/ session" is drawn separately and in a lighter weight. */
  feeUnit: string;
  availability: string;
  /** Green dot when available today, amber when later (design/55). */
  availableNow: boolean;

  // ── Profile screen (design/81) ──
  /** Profile details from the design; replacement portrait mapping is below. */
  barCouncil: string;
  experience: string;
  education: string;
  courts: string;
  languages: string;
  practiceAreas: string[];
  about: string;
  reviewCount: number;
  availabilityLabel: string;
  availabilityChip: string;
  days: string;
  hours: string;
  reviews: AdvocateReview[];
};

export const SAVED_ADVOCATES: SavedAdvocate[] = [
  {
    id: 'adv-priya-sharma',
    initials: 'PS',
    name: 'Adv. Priya Sharma',
    verified: true,
    practice: 'Property & Civil Matters',
    location: 'Indore, Madhya Pradesh',
    rating: '4.8',
    fee: '₹1,500',
    feeUnit: '/ session',
    availability: 'Available Today',
    availableNow: true,
    barCouncil: 'MP/1234/2018',
    experience: '8+ Years',
    education: 'LL.B., LL.M.',
    courts: 'District & High Court',
    languages: 'Hindi, English',
    practiceAreas: ['Criminal Law', 'Civil Law', 'Property Law', 'Family Law'],
    about:
      "Adv. Priya Sharma is an experienced legal professional with expertise in civil, criminal, and property matters. She focuses on providing clear legal guidance and professional representation tailored to each client's needs.",
    reviewCount: 126,
    availabilityLabel: 'Available for Consultation',
    availabilityChip: 'Slots open',
    days: 'Mon – Sat',
    hours: '10:00 AM – 7:00 PM',
    reviews: [
      {
        initials: 'PS',
        name: 'Priya S.',
        stars: 5,
        quote: 'Very professional and explained the legal process clearly.',
      },
      { initials: 'AK', name: 'Amit K.', stars: 5, quote: 'Helpful consultation and clear guidance.' },
    ],
  },
  {
    id: 'adv-neha-verma',
    initials: 'NV',
    name: 'Adv. Neha Verma',
    verified: true,
    practice: 'Family & Matrimonial Matters',
    location: 'Bhopal, Madhya Pradesh',
    rating: '4.9',
    fee: '₹1,800',
    feeUnit: '/ session',
    availability: 'Available Tomorrow',
    availableNow: false,
    barCouncil: 'MP/2041/2016',
    experience: '10+ Years',
    education: 'B.A. LL.B.',
    courts: 'District & Family Court',
    languages: 'Hindi, English',
    practiceAreas: ['Family Law', 'Matrimonial', 'Mediation', 'Civil Law'],
    about:
      "Adv. Neha Verma is an experienced legal professional focused on family and matrimonial matters. She provides clear legal guidance and professional representation tailored to each client's needs.",
    reviewCount: 98,
    availabilityLabel: 'Available for Consultation',
    availabilityChip: 'Slots open',
    days: 'Mon – Fri',
    hours: '11:00 AM – 6:00 PM',
    reviews: [
      {
        initials: 'RK',
        name: 'Ritu K.',
        stars: 5,
        quote: 'Patient and thorough through a difficult matter.',
      },
      { initials: 'SM', name: 'Sanjay M.', stars: 5, quote: 'Explained every option before we decided.' },
    ],
  },
  {
    // Introduced by design/142's conversation list; added here rather than defined
    // as a parallel record in data/messages.ts.
    id: 'adv-rohan-mehta',
    initials: 'RM',
    name: 'Adv. Rohan Mehta',
    verified: true,
    practice: 'Commercial & Contract Disputes',
    location: 'Indore, Madhya Pradesh',
    rating: '4.7',
    fee: '\u20B91,200',
    feeUnit: '/ session',
    availability: 'Available today',
    availableNow: true,
    barCouncil: 'MP/2291/2016',
    experience: '10+ Years',
    education: 'B.A. LL.B.',
    courts: 'District & High Court',
    languages: 'Hindi, English',
    practiceAreas: ['Commercial Law', 'Contract Law', 'Arbitration', 'Recovery'],
    about:
      'Adv. Rohan Mehta advises on commercial and contract disputes, with a focus on recovery matters and arbitration. He represents businesses before the District and High Courts.',
    reviewCount: 98,
    availabilityLabel: 'Available for Consultation',
    availabilityChip: 'Slots open',
    days: 'Mon \u2013 Sat',
    hours: '10:00 AM \u2013 7:00 PM',
    reviews: [
      {
        initials: 'VJ',
        name: 'Vivek J.',
        stars: 5,
        quote: 'Clear advice on a difficult commercial matter.',
      },
      { initials: 'SM', name: 'Sunil M.', stars: 4, quote: 'Responsive and thorough.' },
    ],
  },
];

export const ADVOCATES_HEADER = {
  title: 'Saved Advocates',
  subtitle: 'Your saved advocates',
  sectionLabel: 'SAVED COUNSEL',
  /** design/55 chips the count and labels the right-hand side "Auto-synced". */
  syncLabel: 'Auto-synced',
};

export const advocateById = (id: string) => SAVED_ADVOCATES.find((a) => a.id === id);

/**
 * A profile as app/advocates/[id].tsx (design/81) shows it: the saved advocates'
 * full records, or a court advocate's record holding only what that advocate's
 * own screen draws — the screen leaves out every section it has no values for.
 */
export type AdvocateProfileView = Pick<SavedAdvocate, 'id' | 'initials' | 'name' | 'verified'> &
  Partial<Omit<SavedAdvocate, 'id' | 'initials' | 'name' | 'verified'>> & {
    /** The case advocate's own portrait (advocate_profiles.photo_key). */
    photo?: ImageSourcePropType;
  };

/**
 * The District Court advocate, from design/300 (Advocate Assigned): name,
 * verified, 8+ years, Indore, Civil & Property and the drawn bio. No rating,
 * reviews, bar number, education, courts, languages or availability is drawn for
 * him, so none is given.
 */
export const COURT_ADVOCATES: AdvocateProfileView[] = [
  {
    id: 'adv-abhishek-verma',
    initials: 'AV',
    name: 'Adv Abhishek Verma',
    verified: true,
    experience: '8+ Years',
    location: 'Indore, Madhya Pradesh',
    practiceAreas: ['Civil & Property'],
    about: 'Experienced in civil, property and family matters with extensive trial appearance record in Indore District Courts.',
  },
];

// Legal Notice tracking (31–32) assigns Arjun at 4.9 / 142 reviews.
// Client confirmed this rating and count for all Arjun Sharma screens.
// Only the requested drawn identity, verification and rating are supplied;
// missing profile sections must stay hidden, never borrowed from saved counsel.
export const LEGAL_NOTICE_ADVOCATE: AdvocateProfileView = {
  id: 'adv-arjun-sharma',
  initials: 'AS',
  name: 'Adv. Arjun Sharma',
  verified: true,
  rating: '4.9',
  reviewCount: 142,
};

// design/433 repeats 118, naming Rahul Sharma. Identity is pending client
// confirmation: this record is deliberately NOT used by Legal Notice's button.
export const DESIGN_433_ADVOCATE: AdvocateProfileView = {
  id: 'adv-rahul-sharma', initials: 'RS', name: 'Adv. Rahul Sharma', verified: true,
  experience: '8+ Years', location: 'Indore, MP', rating: '4.8', reviewCount: 126,
  barCouncil: 'MP/1234/2018',
  practiceAreas: ['Criminal Law', 'Civil Law', 'Property Law', 'Family Law'],
  about: "Adv. Rahul Sharma is an experienced legal professional with expertise in civil, criminal, and property matters. He focuses on providing clear legal guidance and professional representation tailored to each client's needs.",
  education: 'LL.B., LL.M.', courts: 'District & High Court', languages: 'Hindi, English',
  availabilityLabel: 'Available for Consultation', availabilityChip: 'Slots open',
  days: 'Mon – Sat', hours: '10:00 AM – 7:00 PM',
  reviews: [
    {initials: 'PS', name: 'Priya S.', stars: 5, quote: 'Very professional and explained the legal process clearly.'},
    {initials: 'AK', name: 'Amit K.', stars: 5, quote: 'Helpful consultation and clear guidance.'},
  ],
};

export const advocateProfileById = (id: string): AdvocateProfileView | undefined =>
  advocateById(id) ?? COURT_ADVOCATES.find((a) => a.id === id) ??
  (id === LEGAL_NOTICE_ADVOCATE.id ? LEGAL_NOTICE_ADVOCATE : undefined) ??
  (id === DESIGN_433_ADVOCATE.id ? DESIGN_433_ADVOCATE : undefined);

/**
 * design/81's profile screen names the advocate "Adv. Rahul Sharma" and carries a
 * photograph. Neither matches the two saved advocates on design/55, so the profile
 * renders whichever advocate was tapped and uses its own fields; the file's own name
 * and photo are not reproduced.
 */

/** design/55 draws the zero-saved state in the same frame, annotated "EMPTY STATE PATTERN". */
export const ADVOCATES_EMPTY = {
  title: 'No Saved Advocates',
  body: 'Save advocates you may want to contact later.',
  action: 'Find Advocates',
};

// Client-supplied replacement portraits, assigned in this fixture seed's declaration
// order as instructed. Provisional mapping: client confirmation pending.
// 01 Priya Sharma; 02 Neha Verma; 03 Rohan Mehta; 04 Abhishek Verma;
// 05 Arjun Sharma; 06 Rahul Sharma. Change this map when confirmed.
const ADVOCATE_PHOTOS: Record<string, ImageSourcePropType> = {
  'priya sharma': require('../assets/advocate-01.png'),
  'neha verma': require('../assets/advocate-02.png'),
  'rohan mehta': require('../assets/advocate-03.png'),
  'abhishek verma': require('../assets/advocate-04.png'),
  'arjun sharma': require('../assets/advocate-05.png'),
  'rahul sharma': require('../assets/advocate-06.png'),
};

/** The bundled portraits by the name advocate_profiles.photo_key holds today; an
 * S3 key (once advocates upload their own) matches nothing here. */
const ADVOCATE_PORTRAITS: Record<string, ImageSourcePropType> = {
  'advocate-01': require('../assets/advocate-01.png'),
  'advocate-02': require('../assets/advocate-02.png'),
  'advocate-03': require('../assets/advocate-03.png'),
  'advocate-04': require('../assets/advocate-04.png'),
  'advocate-05': require('../assets/advocate-05.png'),
  'advocate-06': require('../assets/advocate-06.png'),
};
export function advocatePortrait(key: string | null | undefined): ImageSourcePropType | undefined {
  return key ? ADVOCATE_PORTRAITS[key] : undefined;
}

/** For known advocate contexts only: clients may share these names. */
export function advocatePhoto(name: string): ImageSourcePropType | undefined {
  return ADVOCATE_PHOTOS[name.replace(/^Adv\.?\s+/i, '').trim().toLowerCase()];
}
