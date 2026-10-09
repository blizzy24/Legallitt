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
 *   - app/legal-notice/identity.tsx   Not uploaded / Uploaded
 *   - app/fir/status.tsx + app/fir/ready.tsx   Under Review / Draft Ready
 *   - app/advocate/fir/review.tsx   Waiting / Approved / Changes
 *
 * ⚠ THE ADVOCATE FIR ONE IS DIFFERENT. design/219 DRAWS that switcher as part of
 * the screen, with its own "ADVOCATE PREVIEW SWITCHER" label and an "Interactive
 * Demo" tag — it is not an affordance we added. Gating it here means turning this
 * flag off removes UI the design actually draws. It is also the only one whose
 * other states have no design at all: design/219 is a single-state export, so the
 * Approved and Changes segments select but cannot change the content.
 *
 * The FIR pair is one control shared by two routes (components/FirJourneyToggle.tsx):
 * status and ready are two states of the same journey, and nothing in the prototype
 * advances between them, so the toggle navigates rather than setting local state.
 *
 * Set to false to hide both. The screens still accept `?state=` in the URL, so the
 * states stay reachable for review without the on-screen control.
 */
export const DEV_PREVIEW_TOGGLES = true;
