import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * The hero illustration designs 251–254 draw inside their hero card: a pale
 * disc with ruled strokes behind a subject, and a green verified tick over its
 * lower right. `subject` picks which of the four is drawn. Vector, measured off
 * the 2× exports.
 */
export type HeroSubject = 'eye' | 'device' | 'devices' | 'vault';

export default function SettingsHeroArt({
  width,
  height,
  subject,
}: {
  width: number;
  height: number;
  subject: HeroSubject;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 190 100">
      <Circle cx={95} cy={50} r={44} fill="#F6F1EA" />
      {[26, 34, 148, 156].map((x) => (
        <Path key={x} d={`M${x} 16 V84`} stroke="#E4DCCE" strokeWidth={1.1} />
      ))}
      <Path d="M18 28 V34 M15 31 H21" stroke="#DCD0BD" strokeWidth={1} />
      <Path d="M172 28 V34 M169 31 H175" stroke="#DCD0BD" strokeWidth={1} />
      <Circle cx={20} cy={58} r={1.8} fill="#DCD0BD" />
      <Circle cx={170} cy={58} r={1.8} fill="#DCD0BD" />

      {subject === 'eye' ? (
        <G>
          <Path
            d="M95 16 a24 24 0 0 1 24 24 c0 16 -24 42 -24 42 S71 56 71 40 a24 24 0 0 1 24 -24 z"
            fill="#FBF8F3"
            stroke="#C9BBA8"
            strokeWidth={1.3}
            strokeDasharray="3 2.6"
          />
          <Path d="M79 44 q16 -13 32 0 q-16 13 -32 0 z" fill="none" stroke="#4D463D" strokeWidth={1.6} />
          <Circle cx={95} cy={44} r={5} fill="#4D463D" />
        </G>
      ) : subject === 'device' ? (
        <G>
          <Rect x={70} y={14} width={50} height={72} rx={10} fill="#FBF8F3" stroke="#C9BBA8" strokeWidth={1.4} />
          <Rect x={75} y={19} width={40} height={62} rx={7} fill="none" stroke="#C9BBA8" strokeWidth={1} strokeDasharray="3 2.6" />
          <Path d="M95 38 a7 7 0 0 1 7 7 c0 5 -7 14 -7 14 s-7 -9 -7 -14 a7 7 0 0 1 7 -7 z" fill="none" stroke="#4D463D" strokeWidth={1.5} />
          <Circle cx={95} cy={45} r={2.2} fill="#4D463D" />
        </G>
      ) : subject === 'devices' ? (
        <G>
          <Rect x={56} y={28} width={54} height={38} rx={4} fill="#FBF8F3" stroke="#C9BBA8" strokeWidth={1.3} strokeDasharray="3 2.6" />
          <Rect x={63} y={36} width={30} height={3} rx={1.5} fill="#C9BBA8" />
          <Rect x={63} y={44} width={38} height={3} rx={1.5} fill="#C9BBA8" />
          <Rect x={56} y={72} width={38} height={3} rx={1.5} fill="#C9BBA8" />
          <Rect x={104} y={22} width={34} height={56} rx={6} fill="#FFFFFF" stroke="#9A8B74" strokeWidth={1.5} />
          <Circle cx={121} cy={40} r={8} fill="none" stroke="#9A8B74" strokeWidth={1.3} />
          <Path d="M121 35 V40 l3 2.5" stroke="#9A8B74" strokeWidth={1.3} fill="none" />
        </G>
      ) : (
        <G>
          <Path d="M66 62 q29 -12 58 0 v10 q-29 12 -58 0 z" fill="#FBF8F3" stroke="#C9BBA8" strokeWidth={1.3} />
          <Path d="M66 62 q29 12 58 0" fill="none" stroke="#C9BBA8" strokeWidth={1.3} />
          <Rect x={84} y={16} width={44} height={58} rx={6} fill="#FFFFFF" stroke="#9A8B74" strokeWidth={1.4} />
          <Rect x={92} y={26} width={18} height={3} rx={1.5} fill="#C9BBA8" />
          <Rect x={92} y={36} width={28} height={3} rx={1.5} fill="#D6D6D6" />
          <Rect x={92} y={44} width={24} height={3} rx={1.5} fill="#D6D6D6" />
          <Rect x={92} y={52} width={28} height={3} rx={1.5} fill="#D6D6D6" />
        </G>
      )}

      <Circle cx={125} cy={60} r={11} fill="#22B573" />
      <Path d="M119.5 60 l3.6 3.6 l7 -7.4" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
