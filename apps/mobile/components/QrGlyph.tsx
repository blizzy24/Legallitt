import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { colors, font, ink, scanPay as s } from '../constants/theme';

// A stylised QR block (design/29). Decorative only: it is NOT an encoded, payable
// code. Three finder patterns, a scatter of modules and a UPI badge in the middle.
const DOTS: [number, number][] = [
  [4, 0], [6, 0], [4, 1], [5, 1], [7, 1], [3, 3], [4, 3], [5, 3], [7, 3], [8, 3],
  [0, 4], [2, 4], [4, 4], [8, 4], [0, 5], [1, 5], [3, 5], [7, 5], [8, 5],
  [3, 6], [5, 6], [8, 6], [4, 7], [6, 7], [7, 7], [4, 8], [5, 8], [6, 8], [8, 8],
];

export default function QrGlyph() {
  const inner = s.qrBox - 2 * s.qrInset;
  const cols = Math.floor(inner / s.pitch) + 1; // 9 on the measured grid
  const at = (i: number) => s.qrInset + s.moduleOffset + i * s.pitch;
  const finders: [number, number][] = [
    [s.qrInset, s.qrInset],
    [s.qrBox - s.qrInset - s.finder, s.qrInset],
    [s.qrInset, s.qrBox - s.qrInset - s.finder],
  ];
  const badgeAt = (s.qrBox - s.badge) / 2;
  const clear = (x: number, y: number) =>
    x >= badgeAt - s.module && x <= badgeAt + s.badge && y >= badgeAt - s.module && y <= badgeAt + s.badge;

  return (
    <View style={styles.box} accessibilityLabel="Sample QR code (not payable)">
      <Svg width={s.qrBox} height={s.qrBox}>
        {finders.map(([x, y], i) => (
          <Rect
            key={`f${i}`}
            x={x + s.finderRing / 2}
            y={y + s.finderRing / 2}
            width={s.finder - s.finderRing}
            height={s.finder - s.finderRing}
            rx={s.finderRadius}
            stroke={s.qrModule}
            strokeWidth={s.finderRing}
            fill="none"
          />
        ))}
        {finders.map(([x, y], i) => (
          <Rect
            key={`c${i}`}
            x={x + (s.finder - s.finderCore) / 2}
            y={y + (s.finder - s.finderCore) / 2}
            width={s.finderCore}
            height={s.finderCore}
            rx={s.finderCoreRadius}
            fill={s.qrModule}
          />
        ))}
        {DOTS.filter(([c, r]) => c < cols && r < cols && !clear(at(c), at(r))).map(([c, r]) => (
          <Rect key={`${c}-${r}`} x={at(c)} y={at(r)} width={s.module} height={s.module} rx={s.moduleRadius} fill={s.qrModule} />
        ))}
      </Svg>
      <View style={[styles.badge, { left: badgeAt, top: badgeAt }]}>
        <Text style={styles.badgeText}>UPI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: s.qrBox,
    height: s.qrBox,
    borderRadius: s.qrRadius,
    borderWidth: s.qrDash,
    borderStyle: 'dashed',
    borderColor: s.qrDashColor,
    backgroundColor: colors.card,
  },
  badge: {
    position: 'absolute',
    width: s.badge,
    height: s.badge,
    borderRadius: s.badgeRadius,
    borderWidth: s.badgeBorder,
    borderColor: colors.brand,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: font.appHeading,
    fontSize: s.badgeText,
    color: ink.accent,
  },
});
