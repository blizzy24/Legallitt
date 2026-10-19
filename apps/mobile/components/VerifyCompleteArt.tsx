import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

/**
 * design/244's illustration — a credential card carrying a VERIFIED chip, laid
 * over papers, beside a green rosette. Vector, measured off the 2× export and
 * halved; the viewBox is the 300 × 104pt panel it sits in.
 */
export default function VerifyCompleteArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 300 104">
      <Path d="M18 26 V34 M14 30 H22" stroke="#DCD0BD" strokeWidth={1.1} />
      <Path d="M282 26 V34 M278 30 H286" stroke="#DCD0BD" strokeWidth={1.1} />
      <Circle cx={20} cy={74} r={2} fill="#DCD0BD" />
      <Circle cx={280} cy={74} r={2} fill="#DCD0BD" />

      <Rect x={38} y={12} width={224} height={80} rx={8} fill="#FFFFFF" stroke="#EDE3D4" strokeWidth={1} />
      <Path d="M52 30 L66 20 L80 30 M52 30 H80 M56 32 V62 M64 32 V62 M72 32 V62 M50 64 H82" stroke="#E2D7C6" strokeWidth={0.9} fill="none" />

      <Rect x={70} y={14} width={62} height={74} rx={4} fill="#FBF7F1" stroke="#E6DBC9" strokeWidth={1} transform="rotate(-5 101 51)" />
      <Rect x={78} y={26} width={34} height={4} rx={2} fill="#2E2E2E" />
      <Rect x={78} y={38} width={44} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={78} y={46} width={40} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={78} y={54} width={44} height={3} rx={1.5} fill="#D6D6D6" />

      {/* credential card */}
      <Rect x={118} y={24} width={66} height={62} rx={6} fill="#FFFFFF" stroke="#D8CCBA" strokeWidth={1.2} />
      <Rect x={126} y={32} width={22} height={24} rx={4} fill="#F3EDE4" stroke="#E0D4C2" strokeWidth={1} />
      <Circle cx={137} cy={40} r={4} fill="#8F7A60" />
      <Path d="M130 52 q7 -8 14 0 z" fill="#8F7A60" />
      <Rect x={154} y={33} width={24} height={3.5} rx={1.75} fill="#2E2E2E" />
      <Rect x={154} y={41} width={20} height={3} rx={1.5} fill="#22B573" />
      <Rect x={154} y={48} width={22} height={3} rx={1.5} fill="#D6D6D6" />
      <Rect x={126} y={62} width={54} height={16} rx={8} fill="#E9FAF2" stroke="#BFEBD6" strokeWidth={1} />
      <Circle cx={135} cy={70} r={5} fill="#22B573" />
      <Path d="M132.6 70 l1.8 1.8 l3.4 -3.6" fill="none" stroke="#FFFFFF" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
      <SvgText x={144} y={73} fontSize={7.5} fontWeight="700" fill="#0F7A4F">
        VERIFIED
      </SvgText>

      {/* rosette */}
      <Path d="M206 62 l5 14 l6 -5 l6 5 l5 -14 z" fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Circle cx={217} cy={48} r={25} fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Circle cx={217} cy={48} r={21} fill="none" stroke="#B09C82" strokeWidth={1.3} strokeDasharray="2.2 3" strokeLinecap="round" />
      <Circle cx={217} cy={48} r={16} fill="#22B573" />
      <Path d="M210 48.5 l5 5 l9.5 -10" fill="none" stroke="#FFFFFF" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
