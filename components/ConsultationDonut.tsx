import Svg, { Circle, G } from 'react-native-svg';

import { advAnalytics as t } from '../constants/theme';

/**
 * design/268's consultation donut. Three segments drawn with stroke-dasharray on
 * one circle — no charting library, as instructed.
 *
 * ⚠ The donut labels 86% "Completed" while the stat tile above labels the same
 * 86% "Acceptance Rate". Conflict note 5; both drawn as drawn.
 *
 * Static: the percentages come from data/advocateTools.ts and nothing is
 * computed from them beyond the arc lengths.
 */
export default function ConsultationDonut({
  size,
  segments,
}: {
  size: number;
  segments: { pct: number; colour: string }[];
}) {
  const r = t.donutR;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${r * 2 + t.donutW} ${r * 2 + t.donutW}`}>
      {/* transform string, not rotation/originX: those emit an invalid DOM
          property on react-native-web. */}
      <G transform={`rotate(-90 ${r + t.donutW / 2} ${r + t.donutW / 2})`}>
        {segments.map((s, i) => {
          const len = c * s.pct;
          const el = (
            <Circle
              key={i}
              cx={r + t.donutW / 2}
              cy={r + t.donutW / 2}
              r={r}
              fill="none"
              stroke={s.colour}
              strokeWidth={t.donutW}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </G>
    </Svg>
  );
}
