import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * design/234's header illustration — a profile card with an avatar tile, four
 * copy bars, an add button and a verified badge over the corner.
 *
 * Vector rather than bitmap, geometry measured off the 2× export and halved. The
 * viewBox is the full 350pt content width by the 85pt the drawing occupies, so
 * the card lands at the same inset the PNG draws it at.
 */

const EDGE = '#E8E2DA';
const BAND = '#F4EEE6';
const BRAND = '#A08A6E';
const DECO = '#DCD3C7';

export default function VerifyPersonalArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 350 85">
      {/* decorations */}
      <Path d="M56.7 16.3 V25.3 M52.2 20.8 H61.2" stroke={DECO} strokeWidth={1.2} />
      <Path d="M288.7 11 V20 M284.2 15.5 H293.2" stroke={DECO} strokeWidth={1.2} />
      <Circle cx={66.7} cy={62.2} r={2} fill={DECO} />
      <Circle cx={280.8} cy={70} r={2.4} fill={DECO} />

      {/* card */}
      <Rect x={84.5} y={0.5} width={173} height={84} rx={8} fill="#FFFFFF" stroke={EDGE} strokeWidth={1} />
      <Path d="M92.5 0.5 h157 a8 8 0 0 1 8 8 v5.5 H84.5 V8.5 a8 8 0 0 1 8 -8 z" fill={BAND} />
      <Rect x={96.5} y={5.5} width={32.5} height={3.5} rx={1.75} fill={BRAND} />
      <Circle cx={245.3} cy={7.2} r={2.5} fill="#C9BBA8" />

      {/* avatar tile */}
      <Rect x={99} y={22.5} width={40} height={45} rx={7} fill="#FAF8F5" stroke={EDGE} strokeWidth={1} />
      <Circle cx={119.2} cy={39.2} r={7.5} fill={BRAND} />
      <G>
        <Path d="M106.7 60.5 q12.5 -14 25 0 z" fill={BRAND} />
        <Path d="M119.2 51 V60.5" stroke="#FAF8F5" strokeWidth={1.6} />
      </G>

      {/* copy bars */}
      <Rect x={150.8} y={27.5} width={70} height={4.8} rx={2.4} fill="#3A3A3A" />
      <Rect x={150.8} y={36.7} width={45} height={3} rx={1.5} fill={BRAND} />
      <Rect x={150.8} y={46.3} width={84} height={3} rx={1.5} fill="#C4C4C4" />
      <Rect x={150.8} y={52.5} width={60} height={2.8} rx={1.4} fill="#D3D3D3" />

      {/* add chip */}
      <Circle cx={229.2} cy={62.5} r={4.5} fill="none" stroke={BRAND} strokeWidth={1} />
      <Path d="M229.2 60.2 V64.8 M226.9 62.5 H231.5" stroke={BRAND} strokeWidth={1} />

      {/* verified badge */}
      <Circle cx={255.3} cy={64.3} r={15} fill="#FFFFFF" stroke="#F2EDE4" strokeWidth={1} />
      <Circle cx={255.3} cy={64.3} r={12} fill="#22B573" />
      <Path
        d="M249.8 64.6 l3.8 3.8 l7 -7.8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
