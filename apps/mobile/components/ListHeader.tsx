import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { allCases as a, colors, font, space } from '../constants/theme';

type Props = {
  title: string;
  /** The right-hand control's glyph. Every call site's button is inert so far. */
  rightIcon: LucideIcon;
  rightLabel: string;
  onRightPress?: () => void;
  onBack: () => void;
  /** Measured from the design; the safe-area inset is added on top of it. */
  paddingTop: number;
  /** Space between the header and the content below it. */
  paddingBottom: number;
  titleSize: number;
};

// Circular back button / centred title / circular right button.
//
// Shared by the four list-and-detail screens that draw this header identically:
// All Active Cases, All Hearings, Hearing Details and Case Details. The button and
// icon sizes agree across all four designs (39 / 18) so they are not props; the
// title size and the two paddings differ per design and are.
export default function ListHeader({
  title,
  rightIcon: RightIcon,
  rightLabel,
  onRightPress,
  onBack,
  paddingTop,
  paddingBottom,
  titleSize,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + paddingTop, paddingBottom }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        style={styles.circleButton}
      >
        <ChevronLeft size={a.headerIcon} color={colors.textPrimary} />
      </Pressable>
      <Text style={[styles.title, { fontSize: titleSize }]}>{title}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={rightLabel}
        onPress={onRightPress}
        style={styles.circleButton}
      >
        <RightIcon size={a.headerIcon} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.headerX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: a.headerButton,
    height: a.headerButton,
    borderRadius: a.headerButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
});
