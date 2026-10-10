import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * The stacked-papers-with-a-verified-seal mark used by the Manage Documents
 * header on designs 248 and 250. Vector, measured off the 2× exports.
 */
export default function DocumentsHeroArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100">
      <G transform="rotate(-8 44 48)">
        <Rect x={18} y={14} width={52} height={66} rx={5} fill="#FFFFFF" stroke="#E6E1DC" strokeWidth={1.4} />
      </G>
      <Rect x={28} y={18} width={52} height={66} rx={5} fill="#FFFFFF" stroke="#E6E1DC" strokeWidth={1.4} />
      <Rect x={36} y={28} width={22} height={4} rx={2} fill="#9A938A" />
      <Rect x={36} y={38} width={34} height={5} rx={2.5} fill="#2E2E2E" />
      <Rect x={36} y={50} width={28} height={3.5} rx={1.75} fill="#D6D6D6" />
      <Rect x={36} y={58} width={32} height={3.5} rx={1.75} fill="#D6D6D6" />
      <Circle cx={72} cy={70} r={14} fill="#E9FAF2" />
      <Path
        d="M72 58 l3.4 2.1 l4 -0.5 l1.6 3.7 l3.3 2.3 l-1.1 3.9 l1.1 3.9 l-3.3 2.3 l-1.6 3.7 l-4 -0.5 l-3.4 2.1 l-3.4 -2.1 l-4 0.5 l-1.6 -3.7 l-3.3 -2.3 l1.1 -3.9 l-1.1 -3.9 l3.3 -2.3 l1.6 -3.7 l4 0.5 z"
        fill="#22B573"
      />
      <Path d="M67.5 70 l3.2 3.2 l6 -6.4" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
