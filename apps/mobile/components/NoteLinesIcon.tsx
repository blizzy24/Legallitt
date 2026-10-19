import Svg, { Line, Path } from 'react-native-svg';

// The "Note" chip glyph on designs 173, 174 and 177: three ruled lines with a
// pencil at the lower right. No stock icon draws it, so it is redrawn here on a
// 12pt grid from design/174 at 2.000 px/pt (ink 10.5 × 10).
export default function NoteLinesIcon({ size = 12, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12">
      <Line x1={0.5} y1={1.75} x2={7} y2={1.75} stroke={color} strokeWidth={1.25} />
      <Line x1={0.5} y1={4.25} x2={7} y2={4.25} stroke={color} strokeWidth={1.25} />
      <Line x1={0.5} y1={6.75} x2={4.75} y2={6.75} stroke={color} strokeWidth={1.25} />
      <Path
        d="M5.7 10.8 L6.1 8.6 L9.6 5.1 L11.3 6.8 L7.8 10.3 Z"
        stroke={color}
        strokeWidth={1.1}
        strokeLinejoin="round"
        fill="none"
      />
      <Path d="M7.3 7.4 L9.6 5.1 L11.3 6.8 L9.0 9.1 Z" fill={color} />
    </Svg>
  );
}
