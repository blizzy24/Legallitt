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
 *
 * Set to false to hide both. The screens still accept `?state=` in the URL, so the
 * states stay reachable for review without the on-screen control.
 */
export const DEV_PREVIEW_TOGGLES = true;
