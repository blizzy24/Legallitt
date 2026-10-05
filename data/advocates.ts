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
  /** design/81 draws a photograph; we have no asset, so initials stand in. */
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
