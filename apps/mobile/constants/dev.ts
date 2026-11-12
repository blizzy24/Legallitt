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
 *
 * The FIR screens have no preview control: every FIR state comes from the case
 * (docs/flows/FIR-DRAFT-FLOW.md), and design 219's "Advocate Preview Switcher"
 * is left out as a design-only demo aid.
 *
 * Set to false to hide it. The screen still accepts `?state=` in the URL, so the
 * states stay reachable for review without the on-screen control.
 */
export const DEV_PREVIEW_TOGGLES = false;

/**
 * DEMO MODE. Every static primary control, every control disabled on work a demo
 * user cannot do, and every "waiting for the other party" state moves on to the
 * next screen in data/flowMap.ts (waiting states after 5 seconds). Nothing is
 * drawn differently — only the movement changes. The switchers the designs draw
 * are untouched. Set to false and the app behaves exactly as before.
 */
export const DEMO_AUTO_ADVANCE = true;

// ── The animated splash (components/AnimatedSplash.tsx) ──────────────────────
// Layered after the native splash; JS-only, so these tune without a native build.

/** Show the animated splash at all. It only runs when the app opens at `/`. */
export const SPLASH_ENABLED = true;
/** The full measured timeline (design/motion/open.mp4): 4.565 s. A genuine cold start runs at least this long. */
export const SPLASH_MIN_DURATION_MS = 4565;
/** A warm start (the splash already ran in this session) skips to the final lockup and holds it this long. */
export const SPLASH_WARM_HOLD_MS = 700;
/** The fade from the splash into the app. */
export const SPLASH_FADE_MS = 250;
