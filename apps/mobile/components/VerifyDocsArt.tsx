import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * design/238's hero illustration — a stack of papers inside corner brackets
 * with a sealed verification rosette beside it. Vector, measured off the 2×
 * export and halved; the viewBox is the 358 × 132.5pt frame it sits in.
 */
const LINE = '#DCD0BD';
const PAPER = '#FFFFFF';
const EDGE = '#E3D7C4';
const BRAND = '#A08A6E';
const GREEN = '#22B573';

export default function VerifyDocsArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 358 132.5">
      <G transform="translate(-21 -27)">
      <Path d="M145 36 V31 h5 M213 36 V31 h-5 M145 96 v5 h5 M213 96 v5 h-5" stroke={LINE} strokeWidth={1.4} fill="none" />
      <Path d="M127 42 V37 h5 M231 42 V37 h-5 M127 102 v5 h5 M231 102 v5 h-5" stroke={LINE} strokeWidth={1.4} fill="none" />

      <Path d="M62 36 V44 M58 40 H66" stroke={LINE} strokeWidth={1.2} />
      <Path d="M296 36 V44 M292 40 H300" stroke={LINE} strokeWidth={1.2} />
      <Circle cx={66} cy={89} r={2.2} fill={LINE} />
      <Circle cx={292} cy={89} r={2.2} fill={LINE} />

      {/* courthouse ghost */}
      <Path d="M110 48 L128 38 L146 48 M110 48 H146 M114 50 V72 M122 50 V72 M134 50 V72 M142 50 V72 M108 74 H148" stroke={LINE} strokeWidth={1} fill="none" />

      {/* paper stack */}
      <G transform="rotate(-7 150 80)">
        <Rect x={120} y={40} width={62} height={80} rx={4} fill={PAPER} stroke={EDGE} strokeWidth={1} />
      </G>
      <Rect x={140} y={34} width={82} height={92} rx={5} fill={PAPER} stroke={EDGE} strokeWidth={1} />
      <Rect x={150} y={44} width={54} height={4.5} rx={2.2} fill="#D9CFC0" />
      <Rect x={150} y={54} width={44} height={5} rx={2.5} fill="#2E2E2E" />
      <Rect x={150} y={66} width={62} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={150} y={74} width={56} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={150} y={82} width={60} height={3} rx={1.5} fill="#D6D6D6" />
      <Path d="M150 104 q8 -9 15 -2 q7 7 14 -3" fill="none" stroke={BRAND} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={196} cy={104} r={11} fill="none" stroke={BRAND} strokeWidth={1.1} />
      <Path d="M196 97 V111 M189 104 H203" stroke={BRAND} strokeWidth={1.1} />

      {/* rosette */}
      <Path d="M247 92 l7 18 l7 -6 l7 6 l7 -18 z" fill={PAPER} stroke={EDGE} strokeWidth={1} />
      <Circle cx={261} cy={75.5} r={25} fill={PAPER} stroke={EDGE} strokeWidth={1} />
      <Circle cx={261} cy={75.5} r={21} fill="none" stroke={BRAND} strokeWidth={1.4} strokeDasharray="2.4 3.2" strokeLinecap="round" />
      <Circle cx={261} cy={75.5} r={16} fill={GREEN} />
      <Path d="M253.5 76 l5 5 l9.5 -10.5" fill="none" stroke="#FFFFFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
      </G>
    </Svg>
  );
}
