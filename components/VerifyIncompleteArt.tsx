import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

/**
 * design/241's illustration — a part-filled checklist beside a 75% progress
 * ring carrying a warning badge. Vector, measured off the 2× export and halved;
 * the viewBox is the 330 × 113pt panel it sits in.
 */
export default function VerifyIncompleteArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 330 113">
      <Path d="M40 28 V36 M36 32 H44" stroke="#DCD0BD" strokeWidth={1.1} />
      <Path d="M290 28 V36 M286 32 H294" stroke="#DCD0BD" strokeWidth={1.1} />
      <Circle cx={42} cy={76} r={2} fill="#DCD0BD" />
      <Circle cx={288} cy={76} r={2} fill="#DCD0BD" />

      <Rect x={60} y={16} width={210} height={82} rx={8} fill="#FFFFFF" stroke="#EDE3D4" strokeWidth={1} />
      <Path d="M70 24 L84 16 L98 24 M70 24 H98 M74 26 V56 M82 26 V56 M90 26 V56 M68 58 H100" stroke="#E2D7C6" strokeWidth={0.9} fill="none" />

      <Rect x={88} y={14} width={86} height={76} rx={5} fill="#FFFFFF" stroke="#E6DBC9" strokeWidth={1} />
      <Path d="M93 14 h76 a5 5 0 0 1 5 5 v8 H88 v-8 a5 5 0 0 1 5 -5 z" fill="#F2EBE1" />
      <Rect x={96} y={18} width={30} height={3.5} rx={1.75} fill="#C9BBA8" />
      <Circle cx={166} cy={20} r={2.5} fill="#C9BBA8" />
      <Rect x={96} y={33} width={50} height={5} rx={2.5} fill="#2E2E2E" />
      <Circle cx={99} cy={47} r={4} fill="#22B573" />
      <Rect x={108} y={45} width={56} height={3.5} rx={1.75} fill="#D6D6D6" />
      <Circle cx={99} cy={58} r={4} fill="#22B573" />
      <Rect x={108} y={56} width={48} height={3.5} rx={1.75} fill="#D6D6D6" />
      <Circle cx={99} cy={69} r={4} fill="none" stroke="#E0A32B" strokeWidth={1.4} />
      <Rect x={106} y={64} width={62} height={11} rx={3} fill="#FBF2E2" stroke="#E7C98E" strokeWidth={1} strokeDasharray="3 2.4" />
      <Circle cx={142} cy={82} r={8} fill="none" stroke="#C7B59A" strokeWidth={1} />
      <Path d="M142 77 V88 M137 82 H147" stroke="#C7B59A" strokeWidth={1} />

      {/* progress ring */}
      <Circle cx={222} cy={54} r={26} fill="none" stroke="#EDE4D7" strokeWidth={6} />
      <Path
        d="M222 28 a26 26 0 1 1 -18.4 44.4"
        fill="none"
        stroke="#B09C82"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <SvgText x={222} y={59} fontSize={13} fontWeight="700" fill="#6C5C45" textAnchor="middle">
        75%
      </SvgText>
      <Circle cx={244} cy={34} r={9} fill="#F5A524" />
      <Path d="M244 29.5 V35 M244 38 v0.5" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
