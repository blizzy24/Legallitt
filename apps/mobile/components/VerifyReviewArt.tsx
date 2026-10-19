import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * design/240's illustration — a submitted document under a magnifier beside a
 * verified rosette. Vector, measured off the 2× export and halved; the viewBox
 * is the 195 × 97pt card it sits in.
 *
 * `tone` swaps the two marks for design/243's amber "needs attention" variant,
 * which draws the same scene with a warning rosette.
 */
export default function VerifyReviewArt({
  width,
  height,
  tone = 'green',
}: {
  width: number;
  height: number;
  tone?: 'green' | 'amber';
}) {
  const accent = tone === 'green' ? '#22B573' : '#F5A524';
  return (
    <Svg width={width} height={height} viewBox="0 0 195 97">
      <Path d="M28 24 V32 M24 28 H32" stroke="#DCD0BD" strokeWidth={1.1} />
      <Path d="M168 24 V32 M164 28 H172" stroke="#DCD0BD" strokeWidth={1.1} />
      <Circle cx={30} cy={66} r={2} fill="#DCD0BD" />
      <Circle cx={166} cy={66} r={2} fill="#DCD0BD" />

      {/* courthouse ghost */}
      <Path d="M26 32 L40 24 L54 32 M26 32 H54 M30 34 V58 M38 34 V58 M46 34 V58 M24 60 H56" stroke="#E2D7C6" strokeWidth={0.9} fill="none" />

      {/* document */}
      <Rect x={38} y={18} width={76} height={76} rx={5} fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Path d="M43 18 h66 a5 5 0 0 1 5 5 v9 H38 v-9 a5 5 0 0 1 5 -5 z" fill="#F2EBE1" />
      <Rect x={45} y={23} width={30} height={3.5} rx={1.75} fill="#C9BBA8" />
      <Circle cx={106} cy={25} r={2.5} fill="#C9BBA8" />
      <Rect x={45} y={40} width={50} height={5} rx={2.5} fill="#2E2E2E" />
      <Rect x={45} y={52} width={56} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={45} y={60} width={56} height={3} rx={1.5} fill="#D6D6D6" />
      <Circle cx={72} cy={78} r={9} fill="none" stroke="#C7B59A" strokeWidth={1} />
      <Path d="M72 72 V84 M66 78 H78" stroke="#C7B59A" strokeWidth={1} />

      {/* magnifier */}
      <G>
        <Circle cx={112} cy={57} r={21} fill="#FFFFFF" fillOpacity={0.55} stroke="#8F7A60" strokeWidth={1.4} />
        <Path d="M127 72 L139 84" stroke="#8F7A60" strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M106 57 l4 4 l8 -9" fill="none" stroke={accent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </G>

      {/* rosette */}
      <Path d="M152 66 l5 13 l5 -4 l5 4 l5 -13 z" fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Circle cx={162} cy={52} r={20} fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Circle cx={162} cy={52} r={16.5} fill="none" stroke="#B09C82" strokeWidth={1.2} strokeDasharray="2 2.8" strokeLinecap="round" />
      <Circle cx={162} cy={52} r={12} fill={accent} />
      {tone === 'green' ? (
        <Path d="M156 52.5 l4 4 l8 -8.5" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <Path d="M162 45 V54 M162 58 v0.5" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
      )}
    </Svg>
  );
}
