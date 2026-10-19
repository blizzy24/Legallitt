import { brandGold } from './brand';

// The animated splash (components/AnimatedSplash.tsx), measured from
// design/motion/open.mp4 and splash-final-frame.png (1px = 1pt).
//
// Final lockup, centred: mark 55 × 69, 19pt gap, wordmark 180 × 49 — 255 × 70.
// The mark here is the regular ring at 69pt tall, which is 59.8pt wide: the
// export's ring is ~8% narrower than a regular ring (its side hexagons sit 21.8pt
// from the centre, its top and bottom ones 24.9pt), so the lockup is 259pt.
export const splash = {
  bg: '#000000',
  /** The mark's square box (= its height in the canonical phase). */
  mark: 69,
  /** Visible width of the regular ring at that size. */
  markVisibleW: 59.8,
  gap: 19,
  wordmarkW: 180,
  /** 180pt wide at the PNG's own aspect (1091 × 302); the brief's 49 is cap-top to descender. */
  wordmarkH: 49.8,
  gold: brandGold,
  // Timeline, seconds.
  appearAt: 0.2,
  growFrom: 0.45,
  growTo: 0.67,
  /** 12 × 14pt at first ≈ 22% of the final size. */
  startScale: 0.22,
  slideFrom: 1.9,
  slideTo: 2.9,
  /** The slide's overshoot: an ease-out back curve peaking ~2.70 s. */
  overshoot: 1.4,
  end: 4.565,
};
