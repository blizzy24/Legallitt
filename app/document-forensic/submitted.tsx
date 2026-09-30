import { router } from 'expo-router';
import { Check, ChevronLeft, Clock, Copy, FileText } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfSubmitted as t, font, ink } from '../../constants/theme';
import { DF_REQUEST_ID, DF_SUBMITTED as d } from '../../data/documentForensic';

// Request Submitted (design/88).
//
// REPORTED — two typos in the file's "What Happens Next" copy: "You wil receive then
// report via email & app". Rendered as "will" and "the". See data/documentForensic.

export default function DocumentForensicSubmittedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={4} />
        </View>

        <Text style={styles.title}>{d.title}</Text>
        <Text style={styles.body}>{d.body}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <FileText size={t.rowIcon} color={colors.textBody} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>Request ID</Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.75)}>{DF_REQUEST_ID}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Copy request ID" hitSlop={10}>
              <Copy size={t.copyIcon} color={colors.textBody} />
            </Pressable>
          </View>
          <View style={[styles.row, styles.rowSpaced]}>
            <Clock size={t.rowIcon} color={colors.textBody} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>Estimated Delivery</Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>{d.delivery}</Text>
            </View>
          </View>
        </View>

        <View style={styles.next}>
          <Text style={styles.nextTitle} {...shrinkToFit(0.8)}>What Happens Next</Text>
          <View style={styles.nextList}>
            {d.next.map((n) => (
              <View key={n} style={styles.nextRow}>
                <Check size={t.nextIcon} color={ink.accent} strokeWidth={2.5} />
                <Text style={styles.nextText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/document-forensic/track')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Track Analysis</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.button, styles.back, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonLabel, styles.backLabel]}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.screenBg },
  header: { paddingHorizontal: t.padX, paddingBottom: 4, flexDirection: 'row', alignItems: 'center' },
  content: { paddingHorizontal: t.padX },
  badge: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: t.titleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    lineHeight: t.titleLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowSpaced: { marginTop: t.rowGap },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowIconGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  next: {
    marginTop: t.nextGap,
    borderRadius: t.nextRadius,
    backgroundColor: t.cardBg,
    padding: t.nextPad,
  },
  nextTitle: { fontFamily: font.appHeading, fontSize: t.nextTitleSize, color: colors.textPrimary },
  nextList: { marginTop: t.nextListGap, gap: t.nextRowGap },
  nextRow: { flexDirection: 'row', alignItems: 'flex-start' },
  nextText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.nextIconGap,
    fontFamily: font.appBody,
    fontSize: t.nextSize,
    lineHeight: t.nextLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { marginTop: t.buttonStackGap, backgroundColor: t.backBg },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  backLabel: { color: colors.textPrimary },
});
