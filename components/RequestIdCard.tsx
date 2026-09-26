import { Copy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, firResult as t, font } from '../constants/theme';

// "REQUEST ID / #FIR12345678 [Copy]" strip, drawn identically on design/47, 48
// and 49. Copy is inert: the prototype has no clipboard.
export default function RequestIdCard({
  requestId,
  style,
}: {
  requestId: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.text}>
        <Text style={styles.label} {...shrinkToFit(0.8)}>
          REQUEST ID
        </Text>
        <Text style={styles.value} {...shrinkToFit(0.7)}>
          {requestId}
        </Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.copy}>
        <Copy size={t.copyIcon} color={colors.textPrimary} />
        <Text style={styles.copyLabel} {...shrinkToFit(0.8)}>
          Copy
        </Text>
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
});
