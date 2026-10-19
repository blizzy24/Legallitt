import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  ChevronLeft,
  Download,
  Eye,
  FolderOpen,
  Share2,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfReport as t, font, ink } from '../../constants/theme';
import { DF_REPORT as d, DF_REQUEST_ID } from '../../data/documentForensic';
import { clientDocHref } from '../../data/docLinks';

// Document Forensic Report (design/90).
//
// REPORTED — the Request ID here reads DF-2026-000245 while designs 88 and 89 print
// DF-2026-00245, one digit shorter. One value is used across all three; see
// DF_REQUEST_ID in data/documentForensic.ts.
//
// View Report opens the client document viewer (design/57) — no report viewer
// is designed for this service. Download PDF and Share Report are inert: the
// prototype cannot write or share files.

export default function DocumentForensicReportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/document-forensic/track')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Document Forensic Report</Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <BadgeCheck size={t.badgeGlyph} color={t.badgeColour} strokeWidth={2} />
        </View>

        <Text style={styles.title} {...shrinkToFit(0.8)}>{d.title}</Text>
        <Text style={styles.body}>{d.body}</Text>

        <View style={styles.idCard}>
          <View style={styles.idIcon}>
            <FolderOpen size={t.idIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.idText}>
            <Text style={styles.idLabel} {...shrinkToFit(0.8)}>REQUEST ID</Text>
            <Text style={styles.idValue} {...shrinkToFit(0.75)}>{DF_REQUEST_ID}</Text>
          </View>
          <View style={styles.chip}>
            <View style={styles.chipDot} />
            <Text style={styles.chipText} {...shrinkToFit(0.8)}>{d.status}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle} {...shrinkToFit(0.8)}>Report Summary</Text>
            <Text style={styles.verified} {...shrinkToFit(0.7)}>{d.verifiedBy}</Text>
          </View>

          {d.rows.map((r, i) => (
            <View key={r.label} style={[styles.row, i > 0 && styles.rowDivided]}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>{r.label}</Text>
              {r.chip ? (
                <View style={styles.rowChip}>
                  <BadgeCheck size={t.rowChipIcon} color={colors.textPrimary} />
                  <Text style={styles.rowChipText} {...shrinkToFit(0.8)}>{r.value}</Text>
                </View>
              ) : (
                <View style={styles.rowValueRow}>
                  {r.dot && <View style={[styles.rowDot, { backgroundColor: r.dot }]} />}
                  <Text style={styles.rowValue} {...shrinkToFit(0.75)}>{r.value}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(clientDocHref(`Document Forensic Report ${DF_REQUEST_ID}`) as Href)}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Eye size={t.buttonIcon} color={ink.onBrand} />
          <Text style={styles.buttonLabel}>View Report</Text>
        </Pressable>

        <View style={styles.rowButtons}>
          <Pressable onPress={() => previewNotice("Download PDF")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]}
          >
            <Download size={t.rowButtonIcon} color={ink.onBrand} />
            <Text style={styles.rowButtonLabel} {...shrinkToFit(0.75)}>Download PDF</Text>
          </Pressable>
          <Pressable onPress={() => previewNotice("Share Report")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.rowButton, pressed && styles.pressed]}
          >
            <Share2 size={t.rowButtonIcon} color={ink.onBrand} />
            <Text style={styles.rowButtonLabel} {...shrinkToFit(0.75)}>Share Report</Text>
          </Pressable>
        </View>

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
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: t.padX },
  badge: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badge,
    height: t.badge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: t.titleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
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
  idCard: {
    marginTop: t.idGap,
    borderRadius: t.idRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.idPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idIcon: {
    width: t.idIcon,
    height: t.idIcon,
    borderRadius: t.idIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: { flex: 1, minWidth: 0, marginLeft: t.idIconGap },
  idLabel: {
    fontFamily: font.appSemi,
    fontSize: t.idLabelSize,
    letterSpacing: t.idLabelSpacing,
    color: colors.textBody,
  },
  idValue: {
    marginTop: t.idValueGap,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    marginRight: t.chipDotGap,
    backgroundColor: t.chipText,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipText },
  summary: {
    marginTop: t.summaryGap,
    borderRadius: t.summaryRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.summaryPad,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTitle: {
    fontFamily: font.appHeading,
    fontSize: t.summaryTitleSize,
    color: colors.textPrimary,
  },
  verified: {
    marginLeft: 10,
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.verifiedSize,
    color: colors.textBody,
  },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: t.rowDivider, paddingTop: t.rowGap },
  rowLabel: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValueRow: { marginLeft: 10, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  rowDot: {
    width: t.rowDot,
    height: t.rowDot,
    borderRadius: t.rowDot / 2,
    marginRight: t.rowDotGap,
  },
  rowValue: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  rowChip: {
    marginLeft: 10,
    minHeight: t.rowChipHeight,
    borderRadius: t.rowChipRadius,
    paddingHorizontal: t.rowChipPadX,
    backgroundColor: t.rowChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  rowChipText: {
    marginLeft: t.rowChipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.rowChipSize,
    color: colors.textPrimary,
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
  back: { marginTop: t.backGap, backgroundColor: t.backBg },
  backLabel: { color: colors.textPrimary },
  pressed: { opacity: 0.85 },
  buttonLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  rowButtons: { marginTop: t.rowButtonGap, flexDirection: 'row', gap: t.rowButtonColGap },
  rowButton: {
    flex: 1,
    minWidth: 0,
    minHeight: t.rowButtonHeight,
    borderRadius: t.rowButtonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rowButtonLabel: {
    marginLeft: t.rowButtonIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.rowButtonSize,
    color: ink.onBrand,
  },
});
