import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Copy,
  FileText,
  Info,
  RefreshCw,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_TRACKING } from '../../../../data/advocateSide';
import { advNoticeTracking as t, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Document delivery tracking (design/200).
//
// ⚠ DHL EXPRESS here, BLUE DART on designs 195 and 199 — the same shipment under two
// couriers, and designs 192/193 promise Blue Dart before the choice is even made.
//
// ⚠ SEVEN progress steps here against design/199's FIVE for the same journey.
// design/200 inserts Pickup Booked and Out for Delivery and renames the last step to
// "Advocate Received". No screen reconciles the two.
//
// Dates normalised from October to September 2026, as the rest of the advocate flow
// already was. Refresh Status, the copy button and View are inert.

export default function AdvocateNoticeTrackingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const k = ADV_NOTICE_TRACKING;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {k.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.courierRow}>
            <View style={styles.courierIcon}>
              <Truck size={t.courierIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.courierText}>
              <Text style={styles.courierLabel} {...shrinkToFit(0.8)}>
                {k.courierLabel}
              </Text>
              <Text style={styles.courier} {...shrinkToFit(0.75)}>
                {k.courier}
              </Text>
            </View>
            <View style={styles.statusChip}>
              <View style={styles.statusChipDot} />
              <Text style={styles.statusChipText} {...shrinkToFit(0.8)}>
                {k.statusChip}
              </Text>
            </View>
          </View>

          <View style={styles.waybill}>
            <View style={styles.waybillText}>
              <Text style={styles.waybillLabel} {...shrinkToFit(0.8)}>
                {k.waybillLabel}
              </Text>
              <Text style={styles.waybillValue} {...shrinkToFit(0.7)}>
                {k.waybill}
              </Text>
            </View>
            <Pressable onPress={() => previewNotice("Copy waybill")} accessibilityRole="button" accessibilityLabel="Copy waybill" style={styles.waybillCopy}>
              <Copy size={t.waybillCopyIcon} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Building2 size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {k.sendToLabel}
            </Text>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.7)}>
            {k.sendTo.name}
          </Text>
          {k.sendTo.lines.map((l) => (
            <Text key={l} style={styles.addr}>
              {l}
            </Text>
          ))}
        </View>

        <View style={[styles.card, styles.docCard]}>
          <View style={styles.docIcon}>
            <FileText size={t.docIconGlyph} color={colors.textPrimary} />
          </View>
          <View style={styles.docText}>
            <Text style={styles.docTitle} {...shrinkToFit(0.75)}>
              {k.documents.title}
            </Text>
            <Text style={styles.docSub} {...shrinkToFit(0.75)}>
              {k.documents.sub}
            </Text>
          </View>
          {/* design/200 names no file here — only "3 Physical Documents". */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(advDocHref(k.documents.sub) as Href)}
            style={styles.docLink}
          >
            <Text style={styles.docLinkText} {...shrinkToFit(0.8)}>
              {k.documents.link}
            </Text>
            <ChevronRight size={t.docLinkIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.progress} {...shrinkToFit(0.75)}>
            {k.progressLabel}
          </Text>
          {k.steps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.stepRailCol}>
                <View
                  style={[
                    styles.stepDot,
                    s.state === 'done' && styles.stepDone,
                    s.state === 'active' && styles.stepActive,
                  ]}
                >
                  {s.state === 'done' ? (
                    <Check size={t.stepDotIcon} color={ink.onBrand} />
                  ) : (
                    <View style={[styles.stepPip, s.state === 'active' && styles.stepPipActive]} />
                  )}
                </View>
                {i < k.steps.length - 1 && (
                  <View style={[styles.stepRail, s.state === 'done' && styles.stepRailDone]} />
                )}
              </View>
              <View style={styles.stepText}>
                <Text
                  style={[styles.stepTitle, s.state === 'upcoming' && styles.stepTitleDim]}
                  {...shrinkToFit(0.75)}
                >
                  {s.title}
                </Text>
                <Text
                  style={[styles.stepMeta, s.state === 'upcoming' && styles.stepMetaDim]}
                  {...shrinkToFit(0.75)}
                >
                  {s.meta}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.latestRow}>
            <Text style={styles.latestLabel} {...shrinkToFit(0.8)}>
              {k.latest.label}
            </Text>
            <Text style={styles.latestAt} {...shrinkToFit(0.8)}>
              {k.latest.at}
            </Text>
          </View>
          <Text style={styles.latestTitle} {...shrinkToFit(0.7)}>
            {k.latest.title}
          </Text>
          <Text style={styles.latestBody}>{k.latest.body}</Text>
        </View>

        <View style={[styles.card, styles.note]}>
          <View style={styles.noteIcon}>
            <Info size={t.noteIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>{k.note.title}</Text>
            <Text style={styles.noteBody}>{k.note.body}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/confirm` as Href)}
          style={({ pressed }) => [styles.refresh, pressed && styles.pressed]}
        >
          <RefreshCw size={t.refreshIcon} color={ink.onBrand} />
          <Text style={styles.refreshText} {...shrinkToFit(0.8)}>
            {k.refresh}
          </Text>
        </Pressable>
        <Text style={styles.est} {...shrinkToFit(0.75)}>
          {k.estimate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
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

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  courierRow: { flexDirection: 'row', alignItems: 'center' },
  courierIcon: {
    width: t.courierIcon,
    height: t.courierIcon,
    borderRadius: t.courierIcon / 2,
    backgroundColor: t.courierIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierText: { flex: 1, minWidth: 0, marginLeft: t.courierIconGap, marginRight: 8 },
  courierLabel: {
    fontFamily: font.appSemi,
    fontSize: t.courierLabelSize,
    letterSpacing: t.courierLabelSpacing,
    color: colors.textBody,
  },
  courier: { marginTop: t.courierGap, fontFamily: font.appHeading, fontSize: t.courierSize, color: colors.textPrimary },
  statusChip: {
    minHeight: t.statusChipHeight,
    borderRadius: t.statusChipRadius,
    paddingHorizontal: t.statusChipPadX,
    backgroundColor: t.statusChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusChipDot: {
    width: t.statusChipDot,
    height: t.statusChipDot,
    borderRadius: t.statusChipDot / 2,
    marginRight: t.statusChipDotGap,
    backgroundColor: t.statusChipColour,
  },
  statusChipText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.statusChipSize, color: t.statusChipColour },

  waybill: {
    marginTop: t.waybillGap,
    borderRadius: t.waybillRadius,
    backgroundColor: t.waybillBg,
    padding: t.waybillPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waybillText: { flex: 1, minWidth: 0, marginRight: 10 },
  waybillLabel: { fontFamily: font.appBody, fontSize: t.waybillLabelSize, color: colors.textBody },
  waybillValue: {
    marginTop: t.waybillValueGap,
    fontFamily: font.appHeading,
    fontSize: t.waybillValueSize,
    color: colors.textPrimary,
  },
  waybillCopy: {
    width: t.waybillCopy,
    height: t.waybillCopy,
    borderRadius: t.waybillCopyRadius,
    backgroundColor: t.waybillCopyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    marginLeft: t.labelIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textPrimary,
  },
  name: { marginTop: t.nameGap, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  addr: {
    marginTop: t.addrGap,
    fontFamily: font.appBody,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: colors.textBody,
  },

  docCard: { flexDirection: 'row', alignItems: 'center' },
  docIcon: {
    width: t.docIcon,
    height: t.docIcon,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 8 },
  docTitle: { fontFamily: font.appHeading, fontSize: t.docTitleSize, color: colors.textPrimary },
  docSub: { marginTop: t.docSubGap, fontFamily: font.appBody, fontSize: t.docSubSize, color: colors.textBody },
  docLink: { flexDirection: 'row', alignItems: 'center' },
  docLinkText: { fontFamily: font.appSemi, fontSize: t.docLinkSize, color: colors.textPrimary },

  progress: { fontFamily: font.appHeading, fontSize: t.progressSize, color: colors.textPrimary },
  step: { flexDirection: 'row' },
  stepRailCol: { alignItems: 'center' },
  stepDot: {
    marginTop: t.stepGapY - 4,
    width: t.stepDot,
    height: t.stepDot,
    borderRadius: t.stepDot / 2,
    backgroundColor: t.stepUpcomingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: t.stepDoneBg },
  stepActive: { backgroundColor: t.stepActiveBg },
  stepPip: { width: t.stepPip, height: t.stepPip, borderRadius: t.stepPip / 2, backgroundColor: '#C9C1B4' },
  stepPipActive: { backgroundColor: t.stepActivePip },
  stepRail: { flex: 1, width: t.stepRailW, minHeight: 18, backgroundColor: t.stepRail },
  stepRailDone: { backgroundColor: t.stepRailDone },
  stepText: { flex: 1, minWidth: 0, marginLeft: t.stepGapX, marginTop: t.stepGapY - 4 },
  stepTitle: { fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: colors.textPrimary },
  stepTitleDim: { color: colors.textBody },
  stepMeta: { marginTop: t.stepMetaGap, fontFamily: font.appBody, fontSize: t.stepMetaSize, color: colors.textBody },
  stepMetaDim: { color: '#B6AE9F' },

  latestRow: { flexDirection: 'row', alignItems: 'center' },
  latestLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.latestLabelSize,
    letterSpacing: t.latestLabelSpacing,
    color: colors.textPrimary,
  },
  latestAt: { fontFamily: font.appBody, fontSize: t.latestAtSize, color: colors.textBody },
  latestTitle: {
    marginTop: t.latestTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.latestTitleSize,
    color: colors.textPrimary,
  },
  latestBody: {
    marginTop: t.latestBodyGap,
    fontFamily: font.appBody,
    fontSize: t.latestBodySize,
    lineHeight: t.latestBodyLineHeight,
    color: colors.textBody,
  },

  note: { backgroundColor: t.noteBg, flexDirection: 'row' },
  noteIcon: {
    width: t.noteIcon,
    height: t.noteIcon,
    borderRadius: t.noteIcon / 2,
    backgroundColor: t.noteIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap },
  noteTitle: {
    fontFamily: font.appHeading,
    fontSize: t.noteTitleSize,
    lineHeight: t.noteTitleLineHeight,
    color: colors.textPrimary,
  },
  noteBody: {
    marginTop: t.noteBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  refresh: {
    minHeight: t.refreshHeight,
    borderRadius: t.refreshRadius,
    backgroundColor: t.refreshBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    marginLeft: t.refreshIconGap,
    fontFamily: font.appHeading,
    fontSize: t.refreshSize,
    color: ink.onBrand,
  },
  est: {
    marginTop: t.estGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.estSize,
    color: colors.textBody,
  },
  pressed: { opacity: 0.85 },
});
