// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE VERIFICATION WIZARD — copy and fixtures for designs 233–244.
//
// UI-only. Nothing here is submitted, validated against a registry, or stored.
//
// ── CONFLICT REGISTER ───────────────────────────────────────────────────────
// Numbered so the screens can point at a note instead of repeating it. These are
// recorded, NOT resolved: every screen is built exactly as its PNG draws it.
//
// 1. THE STEPPER IS BROKEN. design/233 names four steps — Personal Details,
//    Professional Details, Documents, Review & Submit — but the wizard is six
//    screens (234 personal, 235 professional, 236 bar council, 237 practice,
//    238 documents, 239 review). The step indicators the exports draw repeat:
//    "Step 3 of 4" and "Step 4 of 4" each appear on two different screens. Each
//    screen renders the indicator its own PNG draws; none is renumbered.
//
// 2. TWO DIFFERENT ADVOCATES IN ONE SECTION. The verification screens are Rahul
//    Sharma (MP Bar Council, MP/1428/2018, Indore); the settings screens that
//    follow in the same batch are Priya Sharma (Bar Council of Delhi,
//    D/1842/2015, New Delhi). Both are kept as drawn.
//
// 4. EMAIL AND ADDRESS DRIFT between design/234's form and design/239's review
//    of that same form.
//
// 8. VER-2026-1048 is the fourth service in this project to use the 1048 suffix.
//
// 9. ⚠ AADHAAR IS BACK. design/238 asks for an Aadhaar card upload and design/240
//    confirms one was received. Aadhaar collection by a private party is legally
//    constrained in a way the other items on this list are not — this is a legal
//    problem, not a cosmetic one. Drawn as designed, uploaded by nothing, and
//    flagged here for the client to decide on before any of it is wired.
// ─────────────────────────────────────────────────────────────────────────────

export const AV_INTRO = {
  title: 'Advocate Verification',

  heading: 'Verify Your Advocate Profile',
  sub: 'Complete your professional verification to provide verified legal services on Legalitt.',

  benefits: [
    {
      title: 'Professional identity verification',
      sub: 'Confirms government-recognized attorney credentials',
    },
    {
      title: 'Bar Council & enrollment verification',
      sub: 'State Bar Council license and active standing check',
    },
    {
      title: 'Verified Advocate badge',
      sub: 'Builds immediate trust with clients on consultation requests',
    },
  ],

  stepsLabel: 'VERIFICATION STEPS',
  // Four names for six screens — see note 1.
  steps: ['Personal Details', 'Professional Details', 'Documents', 'Review & Submit'],

  note: "Verification requirements may vary based on your professional details and Legalitt's verification process.",

  cta: 'Start Verification',
  later: "I'll Do This Later",
};
