import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

// The purple hexagon flower drawn in designs 168-172: six hexagons on a ring
// around an open centre. The designs supply no vector asset, so the mark is
// rebuilt here from measured proportions.
const ANGLES = [60, 120, 180, 240, 300, 0];

function hexPoints(cx: number, cy: number, r: number) {
  return ANGLES.map((_, i) => {
    const a = ((60 * i) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
}

export default function AiFlowerMark({
  size = 38,
  colors = ['#A763F2', '#6B3FE8'],
}: {
  size?: number;
  colors?: string[];
}) {
  const c = size / 2;
  const ring = size * 0.3;
  const r = size * 0.16;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="aiFlower" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      {ANGLES.map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <Polygon
            key={deg}
            points={hexPoints(c + ring * Math.cos(a), c - ring * Math.sin(a), r)}
            fill="url(#aiFlower)"
          />
        );
      })}
    </Svg>
  );
}
