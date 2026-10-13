import { router, type Href } from 'expo-router';
import { Check, ChevronLeft, Download, Eye, FileText, House, Share2 } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psCompleted as t, psTrack as k } from '../../constants/theme';
import { PS_COMPLETED, PS_REQUEST_ID } from '../../data/propertySearch';
import { clientDocHref } from '../../data/docLinks';

// Analysis Completed (design/80).
//
// REPORTED — design/80 prints the Request ID as "DF-2026-000245", which appears
// nowhere else in this flow: design/77 and design/78 both use #PSR739482, and the
// "DF-" prefix does not match any service in the app. PSR739482 is used here, per
// instruction. See PS_REQUEST_ID in data/propertySearch.ts.
//
// View Report opens the client document viewer (design/57) — no report viewer
// is designed for this service. Download PDF and Share Report are inert: the
// prototype cannot write or share files.

export default function PropertySearchCompletedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + k.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/property-search/track'))}
        >
          <ChevronLeft size={k.backIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3.5} />
          </View>
        </View>

        <Text style={styles.title}>{PS_COMPLETED.title}</Text>
        <Text style={styles.body}>{PS_COMPLETED.body}</Text>

        <View style={styles.card}>
          <FileText size={t.cardValueSize} color={colors.brand} strokeWidth={1.5} />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel} {...shrinkToFit(0.8)}>
              Request ID
            </Text>
            <Text style={styles.cardValue} {...shrinkToFit(0.75)}>
              {PS_REQUEST_ID}
            </Text>
          </View>
          <View style={styles.statusBlock}>
            <Text style={styles.statusLabel} {...shrinkToFit(0.8)}>
              Status
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {PS_COMPLETED.status}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(clientDocHref(`Property Search Report ${PS_REQUEST_ID}`) as Href)}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Eye size={t.buttonIcon} color={ink.onBrand} />
          <Text style={styles.buttonLabel}>View Report</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]}
          >
            <Download size={t.rowIcon} color={ink.onBrand} />
            <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
              Download PDF
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]}
          >
            <Share2 size={t.rowIcon} color={ink.onBrand} />
            <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
              Share Report
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.button, styles.backHome, pressed && styles.pressed]}
        >
          <House size={t.buttonIcon} color={ink.onBrand} />
          <Text style={styles.buttonLabel}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: t.padX,
  },
  badgeRing: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badge + t.badgeRing,
    height: t.badge + t.badgeRing,
    borderRadius: (t.badge + t.badgeRing) / 2,
    backgroundColor: t.badgeRingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  cardLabel: {
    fontFamily: font.appBody,
    fontSize: t.cardLabelSize,
    color: colors.textBody,
  },
  cardValue: {
    marginTop: t.cardValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cardValueSize,
    color: colors.textPrimary,
  },
  statusBlock: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontFamily: font.appBody,
    fontSize: t.cardLabelSize,
    color: colors.textBody,
  },
  chip: {
    marginTop: t.cardValueGap,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.chipText,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHome: {
    marginTop: t.buttonGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    gap: t.rowColGap,
  },
  rowButton: {
    flex: 1,
    minWidth: 0,
    minHeight: t.rowHeight,
    borderRadius: t.rowRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rowLabel: {
    marginLeft: t.rowIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.rowSize,
    color: ink.onBrand,
  },
});
