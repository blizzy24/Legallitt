import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { colors, role } from '../constants/theme';

const s = role.glyphSize;

// Filled person glyphs traced from design/06-role-none.png (26pt box).
export function UserGlyph() {
  return (
    <Svg width={s} height={s} viewBox="0 0 26 26">
      <Circle cx={13} cy={6} r={6} fill={colors.brand} />
      <Path
        fill={colors.brand}
        d="M6.5 14h13a6.5 6.5 0 0 1 6.5 6.5V23a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-2.5A6.5 6.5 0 0 1 6.5 14z"
      />
    </Svg>
  );
}

export function LawyerGlyph() {
  return (
    <Svg width={s} height={s + 4} viewBox="0 0 26 30">
      <Ellipse cx={12.25} cy={7.75} rx={6.75} ry={7.75} fill={colors.brand} />
      {/* Body with two collar notches cut into the top edge. */}
      <Path
        fill={colors.brand}
        strokeLinejoin="round"
        d="M0 23.5A5.5 5.5 0 0 1 5.5 18H6.6L8.7 21.8 10.8 18H13.7L15.8 21.8 17.9 18H19A5.5 5.5 0 0 1 24.5 23.5V27.5A2.5 2.5 0 0 1 22 30H2.5A2.5 2.5 0 0 1 0 27.5Z"
      />
    </Svg>
  );
}
