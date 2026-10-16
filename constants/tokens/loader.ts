import { brandGold } from './brand';

// The loader (components/LegalittLoader.tsx), measured from
// design/motion/load.mp4 and loader-frame.png (1px = 1pt).
export const loader = {
  bg: '#FFFFFF',
  /** The mark's square box: 93.2pt makes the ring 89pt across at this phase. */
  mark: 93.2,
  gold: brandGold,
  /** Hexagons at left and right, as loader-frame.png draws them. */
  phase: 30,
  // Stepped rotation: hold, then a fast 60° step — one step every 1.5 s.
  stepDeg: 60,
  stepMs: 200,
  holdMs: 1300,
  // "LEGALITT": Public Sans Regular, cap height 16pt, normal tracking.
  word: 'LEGALITT',
  fontSize: 22,
  lineHeight: 26,
  ink: '#1A1A1A',
  /** Box bottom to text box top: the cap top sits 19pt below the ring's bottom edge. */
  textTop: 12,
  // Typing loop, 1.17 s: a letter every 115 ms (0.92 s for eight), the word holds
  // 250 ms, then back to one letter — never to blank.
  letterMs: 115,
  wordHoldMs: 250,
  /** The compact spinner (components/Spinner.tsx) — the mark alone. */
  spinner: 44,
};
