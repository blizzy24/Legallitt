import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, control, font, homeControlShadow, ink, radius, services } from '../constants/theme';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Taller service card used on the All Services grid: chip + chevron on top, text below.
export default function ServiceTile({ icon: Icon, title, description, onPress, style }: Props) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.chip}>
          <Icon size={services.chipIcon} color={ink.accent} />
        </View>
        <ChevronRight
          size={services.chevron}
          strokeWidth={services.chevronStroke}
          color={colors.brand}
          style={styles.chevron}
        />
      </View>
      {/* Text is anchored to the bottom so a third description line grows upward into the gap. */}
      <View style={styles.spacer} />
      <Text
        style={styles.title}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={services.cardTitleMinScale}
      >
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={services.descMaxLines}>
        {description}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: services.cardHeight,
    padding: services.cardPad,
    paddingBottom: services.cardPadBottom,
    backgroundColor: colors.card,
    borderRadius: services.cardRadius,
    borderWidth: services.border,
    borderColor: colors.border,
    ...homeControlShadow,
  },
  pressed: {
    opacity: control.pressedOpacity,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    width: services.chipSize,
    height: services.chipSize,
    borderRadius: radius.chip,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    marginRight: services.chevronInset,
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontFamily: font.appSemi,
    fontSize: services.cardTitleSize,
    lineHeight: services.cardTitleLineHeight,
    color: colors.textPrimary,
  },
  description: {
    marginTop: services.descGap,
    fontFamily: font.appBody,
    fontSize: services.descSize,
    lineHeight: services.descLineHeight,
    color: colors.textBody,
  },
});
