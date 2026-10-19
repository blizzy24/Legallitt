import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, control, font, home, ink } from '../constants/theme';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** "popular" adds the thicker beige border, beige chip and the brown dot. */
  variant?: 'grid' | 'popular';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Home card (design/11 + 12). Height follows the content: titles and descriptions may
// wrap onto extra lines, and the two grid columns are independent.
export default function ServiceCard({
  icon: Icon,
  title,
  description,
  variant = 'grid',
  onPress,
  style,
}: Props) {
  const popular = variant === 'popular';

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        popular && styles.cardPopular,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.chip, popular && styles.chipPopular]}>
        <Icon size={home.chipIcon} color={ink.accent} />
      </View>
      {popular && <View style={styles.dot} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: home.cardPad,
    paddingBottom: home.cardPadBottom,
    backgroundColor: colors.card,
    borderRadius: home.cardRadius,
    borderWidth: home.cardBorder,
    borderColor: colors.border,
  },
  cardPopular: {
    borderWidth: home.cardBorderPopular,
    borderColor: ink.popularBorder,
  },
  pressed: {
    opacity: control.pressedOpacity,
  },
  chip: {
    width: home.chipSize,
    height: home.chipSize,
    borderRadius: home.chipRadius,
    borderWidth: home.cardBorder,
    borderColor: colors.border,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPopular: {
    backgroundColor: colors.iconChipBg,
  },
  dot: {
    position: 'absolute',
    top: home.dotInset,
    right: home.dotInset,
    width: home.dotSize2,
    height: home.dotSize2,
    borderRadius: home.dotSize2 / 2,
    backgroundColor: colors.brand,
  },
  title: {
    marginTop: home.cardTitleGap,
    fontFamily: font.appSemi,
    fontSize: home.cardTitleSize,
    color: colors.textPrimary,
  },
  description: {
    marginTop: home.cardDescGap,
    fontFamily: font.appBody,
    fontSize: home.cardDescSize,
    lineHeight: home.cardDescLineHeight,
    color: colors.textBody,
  },
});
