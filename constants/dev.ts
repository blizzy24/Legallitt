// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPMENT-ONLY UI FLAGS
//
// Turn these OFF before any client demo or build that leaves the team.
// They render real, tappable controls that are not part of the product design.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shows the "Preview state" segmented controls that let you flip between the two
 * designed states of screens where both states were delivered but nothing in the
 * prototype drives them yet:
 *
 *   - app/legal-notice/tracking.tsx   Drafting in Progress / Awaiting Your Approval
 *   - app/fir/status.tsx + app/fir/ready.tsx   Under Review / Draft Ready
 *
 * NOT app/advocate/fir/review.tsx. That screen has a three-state switcher too, but
 * design/219 DRAWS it, with its own "ADVOCATE PREVIEW SWITCHER" label and an
 * "Interactive Demo" tag, so it is client UI and is rendered unconditionally. Its
 * Approved and Changes segments still have no design behind them; the screen says
 * so inline rather than hiding the control.
 *
 * The FIR pair is one control shared by two routes (components/FirJourneyToggle.tsx):
 * status and ready are two states of the same journey, and nothing in the prototype
 * advances between them, so the toggle navigates rather than setting local state.
 *
 * Set to false to hide both. The screens still accept `?state=` in the URL, so the
 * states stay reachable for review without the on-screen control.
 */
export const DEV_PREVIEW_TOGGLES = true;
