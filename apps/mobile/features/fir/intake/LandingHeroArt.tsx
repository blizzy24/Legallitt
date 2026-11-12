import Svg, { G, Path, Rect } from 'react-native-svg';

/**
 * The clipboard-and-pen illustration beside the F0a hero ("Get Help With Your
 * FIR Draft"). No asset was supplied, so it is redrawn as vector from the
 * design: a peach board, a white page with dark ruled lines, a grey clip and a pen.
 */
export default function LandingHeroArt({ width = 80, height = 100 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 100">
      <Rect x={3} y={8} width={60} height={86} rx={7} fill="#F3B48A" />
      <Rect x={10} y={10} width={62} height={84} rx={6} fill="#E7E3DE" />
      <Rect x={10} y={10} width={62} height={80} rx={6} fill="#FFFFFF" stroke="#E6E1DC" strokeWidth={1} />
      <Rect x={26} y={4} width={30} height={10} rx={3} fill="#D9D7D4" />
      <Rect x={20} y={26} width={42} height={3.6} rx={1.8} fill="#34454E" />
      <Rect x={20} y={34.5} width={42} height={3.6} rx={1.8} fill="#34454E" />
      <Rect x={20} y={43} width={42} height={3.6} rx={1.8} fill="#34454E" />
      <Rect x={20} y={51.5} width={42} height={3.6} rx={1.8} fill="#34454E" />
      <Rect x={20} y={62} width={20} height={3.6} rx={1.8} fill="#34454E" />
      <G transform="rotate(-32 64 66)">
        <Rect x={50} y={63.5} width={24} height={5} rx={2.2} fill="#2B2B2B" />
        <Rect x={66} y={63.5} width={3} height={5} fill="#D4A63A" />
        <Path d="M50 63.5 L44.5 66 L50 68.5 Z" fill="#D4A63A" />
      </G>
    </Svg>
  );
}
