import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, tracking as t } from '../constants/theme';

/** Nonmodal screen feedback. Keep the screen mounted so failed saves preserve
 * fields, chat drafts and the existing navigation controls. No data-source logic. */
export default function NoticeScreenFeedback({ error, children }: { error?: string; children: ReactNode }) {
  return <View style={styles.screen}>
    {Boolean(error) && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    {children}
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1 },
  error: { paddingHorizontal: t.padX, paddingVertical: t.descGap, backgroundColor: colors.screenBg,
    fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: colors.textMuted },
});
