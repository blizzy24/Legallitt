import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, control, font, home, homeCardShadow, ink } from '../constants/theme';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ServiceCard({ icon: Icon, title, description, onPress, style }: Props) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.chip}>
        <Icon size={home.chipIcon} color={ink.accent} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: home.cardHeight,
    padding: home.cardPad,
    backgroundColor: colors.card,
    borderRadius: home.cardRadius,
    borderWidth: home.hairline,
    borderColor: colors.border,
    ...homeCardShadow,
  },
  pressed: {
    opacity: control.pressedOpacity,
  },
  chip: {
    width: home.chipSize,
    height: home.chipSize,
    borderRadius: home.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: home.cardTitleGap,
    fontFamily: font.appSemi,
    fontSize: home.cardTitleSize,
    color: colors.textPrimary,
  },
  description: {
    marginTop: home.descGap,
    fontFamily: font.appBody,
    fontSize: home.descSize,
    lineHeight: home.descLineHeight,
    color: colors.textBody,
  },
});
