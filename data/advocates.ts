// Saved advocates (design/55).
//
// Separate from data/cases.ts's advocate records: those are the counsel assigned to a
// case and carry no fee or availability. These are the saved-counsel cards, which do.
// If the client ever merges the two, this is the file to fold in.

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
  },
];

export const ADVOCATES_HEADER = {
  title: 'Saved Advocates',
  subtitle: 'Your saved advocates',
  sectionLabel: 'SAVED COUNSEL',
  /** design/55 chips the count and labels the right-hand side "Auto-synced". */
  syncLabel: 'Auto-synced',
};

/** design/55 draws the zero-saved state in the same frame, annotated "EMPTY STATE PATTERN". */
export const ADVOCATES_EMPTY = {
  title: 'No Saved Advocates',
  body: 'Save advocates you may want to contact later.',
  action: 'Find Advocates',
};
