import { hcPalette } from './highCourt';

/** The preview notice (components/PreviewNotice.tsx) — one neutral line for an action this build does not implement. */
export const previewNotice = {
  /** "<Action> is not available in this preview." */
  suffix: 'is not available in this preview.',
  /** Fallback when an element has no readable label. */
  fallback: 'This action',
  showMs: 2400,
  fadeMs: 180,
  bg: hcPalette.ink,
  ink: '#FFFFFF',
  size: 13,
  line: 18,
  padX: 16,
  padY: 10,
  radius: 10,
  inset: 16,
  bottom: 96,
};
