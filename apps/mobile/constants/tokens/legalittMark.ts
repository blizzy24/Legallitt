// The Legalitt mark's proportions (components/AiFlowerMark.tsx), measured at 1px/pt
// from design/motion/loader-frame.png: hexagon centres on a 31.7pt ring, each
// hexagon 28pt across the flats (circumradius 16.2pt) — hexagon / ring 0.51. The
// ring's bbox there is 90 × 84; it breathes between 83 and 90 as it turns.
export const legalittMark = {
  /** Hexagon circumradius ÷ ring radius. */
  hexToRing: 0.51,
  /** How far back along each edge a rounded corner starts (fraction of the edge). */
  cornerCut: 0.14,
  /** The upper-left highlight: inset from the vertices, stroke width (× hexagon radius), colour. */
  highlightInset: 0.13,
  highlightWidth: 0.07,
  highlight: '#FFFFFF',
  highlightOpacity: 0.55,
};
