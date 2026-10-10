import Svg, { Circle, Line, Path } from 'react-native-svg';

import { advAnalytics as t } from '../constants/theme';

/**
 * design/268's earnings chart — a tinted area under a line with seven markers.
 *
 * ⚠ SEVEN MARKERS, NOT FOUR, AND NOT EVENLY SPACED. The axis is labelled Week 1
 * to Week 4 but the line carries seven points at irregular x positions, and the
 * last one sits ABOVE the ₹30k gridline and leaves the plot. Every coordinate
 * below was measured off the 3× export and divided by three; none is computed.
 * It is a drawn illustration of a chart, so it is reproduced as drawn.
 *
 * Static: no axis is calculated, nothing animates, there are no tooltips.
 */

// Local coordinates: x 0 = the plot's left edge, y 0 = 450pt on the export.
const POINTS: { x: number; y: number; ring: boolean }[] = [
  { x: 3.9, y: 57.5, ring: false },
  { x: 51.5, y: 47.5, ring: false },
  { x: 87.2, y: 62.5, ring: false },
  { x: 132.7, y: 35, ring: false },
  { x: 202.9, y: 47.3, ring: true },
  { x: 267.2, y: 24.8, ring: true },
  { x: 292.7, y: 0.8, ring: true },
];

const W = 294;
const H = 120;
const BASE = 119.7; // the ₹0 gridline
const GRID = [25.7, 56, 87, 119.7]; // ₹30k, ₹20k, ₹10k, ₹0

export default function EarningsChart({ width, height }: { width: number; height: number }) {
  const line = POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const area = `${line} L${POINTS[POINTS.length - 1].x} ${BASE} L${POINTS[0].x} ${BASE} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
      <Path d={area} fill={t.chartFill} />
      {GRID.map((y) => (
        <Line key={y} x1={0} y1={y} x2={W} y2={y} stroke={t.gridColour} strokeWidth={0.8} />
      ))}
      <Path
        d={line}
        fill="none"
        stroke={t.chartLine}
        strokeWidth={t.chartLineW}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {POINTS.map((p, i) =>
        p.ring ? (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={t.ringR}
            fill="#FFFFFF"
            stroke={t.chartLine}
            strokeWidth={t.ringW}
          />
        ) : (
          <Circle key={i} cx={p.x} cy={p.y} r={t.dotR} fill={t.chartLine} />
        ),
      )}
    </Svg>
  );
}
