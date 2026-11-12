import { Copy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, firResult as t, font } from '../constants/theme';
import { useCopy } from '../features/fir/client/ui';

/** The designs print request IDs with a leading "#"; the clipboard gets the bare ID. */
const shown = (id: string) => (id.startsWith('#') ? id : `#${id}`);

// "REQUEST ID / #FIR12345678 [Copy]" strip, drawn on design/47, 48, 49 and F6.
// F8 and F9 draw the same strip with their own label and an icon-only copy button
// (variant "icon"). Copy writes to the clipboard and says what happened: "Copied",
// or "Couldn't copy" where the device has no clipboard.
export default function RequestIdCard({
  requestId,
  label = 'REQUEST ID',
  variant = 'pill',
  style,
}: {
  requestId: string;
  label?: string;
  variant?: 'pill' | 'icon';
  style?: StyleProp<ViewStyle>;
}) {
  const clip = useCopy();
  const failed = clip.state === 'failed';

  return (
    <View style={[styles.card, style]}>
      <View style={styles.text}>
        <Text style={[styles.label, variant === 'icon' && styles.labelPlain]} {...shrinkToFit(0.8)}>
          {label}
        </Text>
        <Text style={styles.value} {...shrinkToFit(0.7)} selectable>
          {shown(requestId)}
        </Text>
      </View>
      {variant === 'icon' && clip.state !== 'idle' && (
        <Text accessibilityLiveRegion="polite" style={[styles.feedback, failed && styles.failed]}>
          {clip.label}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Copy ${label.toLowerCase()}`}
        accessibilityHint={variant === 'icon' ? undefined : clip.label}
        onPress={() => void clip.copy(requestId)}
        hitSlop={8}
        style={variant === 'icon' ? styles.iconButton : styles.copy}
      >
        <Copy size={t.copyIcon} color={colors.textPrimary} />
        {variant === 'pill' && (
          <Text accessibilityLiveRegion="polite" style={[styles.copyLabel, failed && styles.failed]} {...shrinkToFit(0.8)}>
            {clip.label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: t.idRadius,
    backgroundColor: t.idBg,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.idLabelSize,
    letterSpacing: t.idLabelSpacing,
    color: colors.textBody,
  },
  labelPlain: {
    letterSpacing: 0,
    fontSize: t.idLabelSize + 0.5,
  },
  value: {
    marginTop: t.idValueGap,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  copy: {
    marginLeft: 10,
    minHeight: t.copyHeight,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.copyBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyLabel: {
    marginLeft: t.copyIconGap,
    fontFamily: font.appSemi,
    fontSize: t.copySize,
    color: colors.textPrimary,
  },
  iconButton: {
    marginLeft: 8,
    width: t.copyHeight - 4,
    height: t.copyHeight - 4,
    borderRadius: t.copyRadius,
    backgroundColor: t.copyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    marginLeft: 8,
    fontFamily: font.appSemi,
    fontSize: t.copySize - 1,
    color: colors.textBody,
  },
  failed: {
    color: '#9C2929',
  },
});
