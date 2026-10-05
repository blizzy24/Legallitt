import { StyleSheet, View } from 'react-native';

// The purple hexagon flower drawn in designs 168-172. Six petals around a gap,
// built from rotated rounded squares — the designs supply no vector asset.
const PETALS = [
  { x: 0.5, y: 0 },
  { x: 1, y: 0.27 },
  { x: 1, y: 0.73 },
  { x: 0.5, y: 1 },
  { x: 0, y: 0.73 },
  { x: 0, y: 0.27 },
];

export default function AiFlowerMark({
  size = 38,
  colors = ['#8B3FE8', '#A763F2'],
}: {
  size?: number;
  colors?: [string, string] | string[];
}) {
  const petal = size * 0.36;
  return (
    <View style={{ width: size, height: size }}>
      {PETALS.map((p, i) => (
        <View
          key={`${p.x}-${p.y}`}
          style={[
            styles.petal,
            {
              width: petal,
              height: petal,
              borderRadius: petal * 0.28,
              backgroundColor: colors[i % colors.length],
              left: p.x * (size - petal),
              top: p.y * (size - petal),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  petal: { position: 'absolute', transform: [{ rotate: '45deg' }] },
});
