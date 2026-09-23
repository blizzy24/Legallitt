import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { cases, colors, font, status } from '../constants/theme';

export type PillTone = 'active' | 'pending' | 'neutral';

type Props = {
  label: string;
  tone?: PillTone;
  /** Leading status dot (design/14: "Active", "Awaiting Review"). */
  dot?: boolean;
  /** Small caps treatment used for category chips on the detail screens. */
  caps?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TONES = {
  active: { bg: status.activeBg, border: status.activeBorder, text: status.active, dot: status.active },
  pending: { bg: status.pendingBg, border: status.pendingBorder, text: status.pendingText, dot: status.pending },
  neutral: { bg: colors.iconChipBg, border: colors.iconChipBg, text: colors.textBody, dot: colors.textMuted },
} as const;

export default function StatusPill({ label, tone = 'neutral', dot = false, caps = false, style }: Props) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: t.dot }]} />}
      <Text
        style={[
          styles.label,
          tone === 'neutral' && styles.labelNeutral,
          caps && styles.labelCaps,
          { color: t.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: cases.pillHeight,
    borderRadius: cases.pillHeight / 2,
    borderWidth: cases.hairline,
    paddingHorizontal: cases.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: cases.pillDot,
    height: cases.pillDot,
    borderRadius: cases.pillDot / 2,
    marginRight: cases.pillDotGap,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: cases.pillText,
  },
  labelNeutral: {
    fontFamily: font.appBody,
  },
  labelCaps: {
    letterSpacing: cases.capsSpacing,
  },
});
