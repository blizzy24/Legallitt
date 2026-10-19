import { useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';

import { brandGold, legalittAi } from '../constants/theme';
import { legalittMark as m } from '../constants/tokens/legalittMark';

// The Legalitt mark: six hexagons on a ring around an open centre, centres at 60°
// steps. Each hexagon is pointy-top (vertices at 12 and 6 o'clock, flat left and
// right edges) with rounded corners and a thin bright highlight along its
// upper-left edges. Proportions are measured from design/motion/loader-frame.png
// (ring radius 31.7pt, hexagon 28pt across the flats): constants/tokens/legalittMark.ts.
//
// Drawn here rather than from assets/legalitt-logo.svg: the SVG's gradients and
// bevel are baked in, and the splash and loader need to recolour and rotate it.
//
//   size      the square box: 2 × (ring radius + hexagon radius)
//   phase     where the hexagons sit on the ring, in degrees. 0 is the canonical
//             static orientation — one hexagon at the top, one at the bottom
//             (design/motion/splash-final-frame.png). 30 puts them at left and
//             right, as loader-frame.png, the logo file and the AI screens draw.
//             Each hexagon stays pointy-top in both.
//   rotation  turns the whole mark rigidly (degrees, clockwise).
//   colors    a two-stop gradient, top to bottom; default the brand gold.
//   color     one flat colour (the letterheads) — no gradient, no highlight.

/** Rounded hexagon path, pointy-top, centred on (cx, cy), circumradius r. */
function hexPath(cx: number, cy: number, r: number) {
  const v = Array.from({ length: 6 }, (_, i) => {
    const a = ((-90 + 60 * i) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  // Each corner is cut back along both edges and joined by a quadratic through the vertex.
  const t = m.cornerCut;
  const along = (p: number[], q: number[], f: number) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
  const f = (n: number) => n.toFixed(2);
  let d = '';
  for (let i = 0; i < 6; i++) {
    const prev = v[(i + 5) % 6];
    const cur = v[i];
    const next = v[(i + 1) % 6];
    const a = along(cur, prev, t);
    const b = along(cur, next, t);
    d += `${i === 0 ? 'M' : 'L'}${f(a[0])},${f(a[1])} Q${f(cur[0])},${f(cur[1])} ${f(b[0])},${f(b[1])} `;
  }
  return `${d}Z`;
}

/** The highlight: lower-left vertex → upper-left vertex → top vertex, inset. */
function highlightPoints(cx: number, cy: number, r: number) {
  const ri = r * (1 - m.highlightInset);
  return [150, 210, 270]
    .map((deg) => {
      const a = (deg * Math.PI) / 180;
      return `${(cx + ri * Math.cos(a)).toFixed(2)},${(cy + ri * Math.sin(a)).toFixed(2)}`;
    })
    .join(' ');
}

export default function AiFlowerMark({
  size = 38,
  colors = [brandGold.start, brandGold.end],
  color,
  phase = 0,
  rotation = 0,
}: {
  size?: number;
  colors?: readonly string[];
  color?: string;
  phase?: number;
  rotation?: number;
}) {
  const id = `lgMark${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const c = size / 2;
  const R = size / (2 * (1 + m.hexToRing));
  const r = R * m.hexToRing;
  const flat = color !== undefined;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {flat ? null : (
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors[0]} />
            <Stop offset="1" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
      )}
      <G transform={rotation ? `rotate(${rotation} ${c} ${c})` : undefined}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = ((-90 + phase + 60 * i) * Math.PI) / 180;
          const cx = c + R * Math.cos(a);
          const cy = c + R * Math.sin(a);
          return (
            <G key={i}>
              <Path d={hexPath(cx, cy, r)} fill={flat ? color : `url(#${id})`} />
              {flat ? null : (
                <Polyline
                  points={highlightPoints(cx, cy, r)}
                  fill="none"
                  stroke={m.highlight}
                  strokeOpacity={m.highlightOpacity}
                  strokeWidth={r * m.highlightWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </G>
          );
        })}
      </G>
    </Svg>
  );
}

/** The violet AI mark (designs 168–172, 364–368, 402): the same shape, hexagons at left and right. */
export function AiMark(props: { size?: number; colors?: readonly string[] }) {
  return <AiFlowerMark colors={legalittAi.markGradient} phase={30} {...props} />;
}
