import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * The illustration inside design/233's framed hero — a courthouse outline behind
 * two stacked credential cards with a dashed verified badge over the corner.
 *
 * Drawn as a vector rather than shipped as a bitmap so it stays sharp and picks
 * up the palette. Geometry is measured off the 2× export and halved: the frame
 * is 358 × 210pt, which is the viewBox.
 */

const LINE = '#E7DCCB'; // courthouse outline + decorations
const PAPER = '#FFFFFF';
const EDGE = '#EFE9E1'; // card edges
const BAND = '#F2EDE4'; // back card's header band
const BRAND = '#A08A6E';
const DARK = '#2E2E2E';
const GREY = '#B8B8B8';
const GREEN = '#22B573';

export default function VerifyIntroArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 358 210">
      {/* courthouse */}
      <Path d="M100 50 L178 22 L260 50" fill="none" stroke={LINE} strokeWidth={1.1} />
      <Path d="M100 50 H260" fill="none" stroke={LINE} strokeWidth={1.1} />
      <Path d="M101 53.5 H258" fill="none" stroke={LINE} strokeWidth={1.1} />
      {[118, 160, 200, 238].map((x) => (
        <Path key={x} d={`M${x} 54 V61`} fill="none" stroke={LINE} strokeWidth={1.1} />
      ))}

      {/* decorations */}
      <Path d="M49.5 43.5 V51.5 M45.5 47.5 H53.5" stroke={LINE} strokeWidth={1.1} />
      <Path d="M306 61.5 V69.5 M302 65.5 H310" stroke={LINE} strokeWidth={1.1} />
      <Circle cx={59} cy={164} r={2.2} fill="#DACBB6" />
      <Circle cx={299} cy={156} r={2.6} fill="#DACBB6" />

      {/* back credential card, tilted */}
      <G transform="rotate(-8 106 118)">
        <Rect x={71} y={62} width={70} height={113} rx={5} fill={PAPER} stroke={EDGE} strokeWidth={1} />
        <Path d="M76 62 h60 a5 5 0 0 1 5 5 v9 H71 v-9 a5 5 0 0 1 5 -5 z" fill={BAND} />
        <Rect x={80} y={66.5} width={24} height={3.6} rx={1.8} fill={BRAND} />
        <Circle cx={85} cy={92} r={7} fill="#F3EDE3" stroke="#E2D6C3" strokeWidth={1} />
        <Path d="M82 92 l2.2 2.4 l4-5" fill="none" stroke={BRAND} strokeWidth={1.3} strokeLinecap="round" />
        <Rect x={97} y={86} width={40} height={4.4} rx={2.2} fill={DARK} />
        <Rect x={97} y={94} width={32} height={3.6} rx={1.8} fill={GREY} />
        <Path d="M79 110 H133" stroke="#EFE7DA" strokeWidth={1} />
        {[117, 125, 133, 141].map((y, i) => (
          <Rect key={y} x={79} y={y} width={[54, 50, 52, 46][i]} height={3.6} rx={1.8} fill="#D5D5D5" />
        ))}
        <Path d="M81 160 q6 -9 12 -2 q6 7 12 -3" fill="none" stroke={BRAND} strokeWidth={1.4} strokeLinecap="round" />
        <Path d="M81 167 H119" stroke="#E6DED1" strokeWidth={1} />
        <Circle cx={133} cy={157} r={14} fill="none" stroke="#D8C6AB" strokeWidth={1.2} />
      </G>

      {/* front credential card */}
      <Rect x={130} y={55} width={128} height={131} rx={7} fill={PAPER} stroke={EDGE} strokeWidth={1} />
      <Circle cx={161} cy={84.5} r={17.5} fill="#FBF7F1" stroke="#E6DCCB" strokeWidth={1} />
      <Circle cx={161} cy={79} r={5.6} fill={BRAND} />
      <Path d="M151 96 q10 -10 20 0 z" fill={BRAND} />
      <Path d="M161 88 V96" stroke="#FBF7F1" strokeWidth={1.4} />
      <Rect x={185} y={70.5} width={56} height={5} rx={2.5} fill={DARK} />
      <Rect x={185} y={78.5} width={44} height={4} rx={2} fill={GREY} />
      <Rect x={185} y={85.5} width={32} height={4} rx={2} fill={BRAND} />
      <Path d="M143.5 109.5 H244" stroke="#EFE9E0" strokeWidth={1} />
      <Rect x={143.5} y={119} width={96} height={31} rx={3} fill="#FAF7F2" stroke="#F0EAE1" strokeWidth={1} />
      <Rect x={150} y={125.5} width={36} height={3.4} rx={1.7} fill={BRAND} />
      <Rect x={150} y={132.5} width={64} height={4} rx={2} fill={DARK} />

      {/* scales */}
      <Path
        d="M154.5 155 V168 M146 158.5 H163 M146 158.5 l-3.5 7 h7 z M163 158.5 l-3.5 7 h7 z M149.5 168 H159.5"
        fill="none"
        stroke={BRAND}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={169.5} y={156} width={64} height={4} rx={2} fill={GREY} />
      <Rect x={169.5} y={162.5} width={42} height={4} rx={2} fill={GREY} />

      {/* verified badge */}
      <Circle cx={252.5} cy={140} r={23.5} fill={PAPER} stroke="#F2EDE4" strokeWidth={1} />
      <Circle
        cx={252.5}
        cy={140}
        r={19.5}
        fill="none"
        stroke={BRAND}
        strokeWidth={1.6}
        strokeDasharray="2.4 3.2"
        strokeLinecap="round"
      />
      <Circle cx={252.5} cy={140} r={15.5} fill={GREEN} />
      <Path
        d="M245.5 140.5 l4.8 4.8 l9 -10"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
