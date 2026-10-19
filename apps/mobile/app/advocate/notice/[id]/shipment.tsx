import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  FileText,
  Info,
  Lock,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_SHIPMENT } from '../../../../data/advocateSide';
import { advNoticeShipment as t, colors, font, ink } from '../../../../constants/theme';

// Shipment created (design/199) — UNFINISHED DESIGN.
//
// ⚠ Rendered WITH THE BRACKETS INTACT: [Courier Name], [Waybill Number], [Date],
// [Pickup Address], [Receiver Name], [Receiver Address], [Document Count].
//
// ⚠ design/199 draws the "Important" note in a column about a third of the card
// wide, so its five words wrap one or two per line. Laid out to the card width here.
//
// ⚠ FIVE status steps here against design/200's SEVEN, for the same shipment.

export default function AdvocateNoticeShipmentScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = ADV_NOTICE_SHIPMENT;

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
          {s.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <Check size={t.badgeIcon} color={ink.onBrand} />
          </View>
        </View>
        <Text style={styles.heading} {...shrinkToFit(0.75)}>
          {s.heading}
        </Text>
        <Text style={styles.body} {...shrinkToFit(0.75)}>
          {s.body}
        </Text>
        <View style={styles.chip}>
          <View style={styles.chipDot} />
          <Text style={styles.chipText} {...shrinkToFit(0.7)}>
            {s.chip}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Truck size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {s.detailsLabel}
            </Text>
          </View>
          {s.details.map((d) => (
            <View key={d.label} style={styles.row}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                {d.label}
              </Text>
              {d.copy ? (
                <Pressable onPress={() => previewNotice(d.value)} accessibilityRole="button" style={styles.copyChip}>
                  <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                    {d.value}
                  </Text>
                  <Copy size={t.copyChipIcon} color={colors.textPrimary} style={styles.copyChipIcon} />
                </Pressable>
              ) : (
                <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                  {d.value}
                </Text>
              )}
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
              {s.pickupLabel}
            </Text>
          </View>
          <Text style={styles.addr}>{s.pickupAddress}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Building2 size={t.labelIcon} color={colors.textPrimary} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {s.sendToLabel}
            </Text>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {s.receiverName}
          </Text>
          <Text style={styles.addr}>{s.receiverAddress}</Text>
        </View>

        <View style={[styles.card, styles.docCard]}>
          <View style={styles.docIcon}>
            <FileText size={t.docIconGlyph} color={colors.textPrimary} />
          </View>
          <View style={styles.docText}>
            <Text style={styles.docCount} {...shrinkToFit(0.7)}>
              {s.documents.count}
            </Text>
            <Text style={styles.docSub} {...shrinkToFit(0.75)}>
              {s.documents.sub}
            </Text>
          </View>
          <Lock size={t.docLock} color={colors.textPrimary} />
        </View>

        <View style={styles.card}>
          <Text style={[styles.label, styles.statusLabel]} {...shrinkToFit(0.75)}>
            {s.statusLabel}
          </Text>
          {s.steps.map((st, i) => (
            <View key={st.title} style={styles.step}>
              <View style={styles.stepRailCol}>
                <View
                  style={[
                    styles.stepDot,
                    st.state === 'done' && styles.stepDone,
                    st.state === 'active' && styles.stepActive,
                  ]}
                >
                  {st.state === 'done' ? (
                    <Check size={t.stepDotIcon} color={ink.onBrand} />
                  ) : (
                    <View
                      style={[styles.stepPip, st.state === 'active' && styles.stepPipActive]}
                    />
                  )}
                </View>
                {i < s.steps.length - 1 && (
                  <View style={[styles.stepRail, st.state === 'done' && styles.stepRailDone]} />
                )}
              </View>
              <Text
                style={[styles.stepTitle, st.state === 'upcoming' && styles.stepTitleDim]}
                {...shrinkToFit(0.75)}
              >
                {st.title}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.imp]}>
          <View style={styles.impIcon}>
            <Info size={t.impIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.impText}>
            <Text style={styles.impTitle} {...shrinkToFit(0.75)}>
              {s.important.title}
            </Text>
            {/* design/199 wraps this to one or two words a line; laid out to width. */}
            <Text style={styles.impBody}>{s.important.body}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/tracking` as Href)}
          style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText} {...shrinkToFit(0.8)}>
            {s.viewTracking}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.btnIcon} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/fee` as Href)}
          style={({ pressed }) => [styles.btn, styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            {s.viewCase}
          </Text>
        </Pressable>
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

  content: { paddingHorizontal: t.padX, paddingBottom: 28, alignItems: 'center' },
  badgeRing: {
    marginTop: t.badgeTop,
    width: t.badgeRing,
    height: t.badgeRing,
    borderRadius: t.badgeRing / 2,
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
  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  body: { marginTop: t.bodyGap, fontFamily: font.appBody, fontSize: t.bodySize, color: colors.textBody },
  chip: {
    marginTop: t.chipGap,
    maxWidth: '100%',
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
    backgroundColor: '#1E9E4A',
  },
  chipText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.chipSize, color: colors.textPrimary },

  card: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    marginLeft: t.labelIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.labelSize,
    color: colors.textPrimary,
  },
  statusLabel: { marginLeft: 0 },

  row: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center' },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },
  copyChip: {
    minHeight: t.copyChipHeight,
    borderRadius: t.copyChipRadius,
    paddingHorizontal: t.copyChipPadX,
    backgroundColor: t.copyChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  copyChipIcon: { marginLeft: t.copyChipIconGap },
  addr: {
    marginTop: t.addrGap,
    fontFamily: font.appHeading,
    fontSize: t.addrSize,
    color: colors.textPrimary,
  },
  name: { marginTop: t.nameGap, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },

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
  docCount: { fontFamily: font.appHeading, fontSize: t.docCountSize, color: colors.textPrimary },
  docSub: { marginTop: t.docSubGap, fontFamily: font.appBody, fontSize: t.docSubSize, color: colors.textBody },

  step: { flexDirection: 'row' },
  stepRailCol: { alignItems: 'center' },
  stepDot: {
    marginTop: t.rowGap,
    width: t.stepDot,
    height: t.stepDot,
    borderRadius: t.stepDot / 2,
    backgroundColor: t.stepUpcomingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: t.stepDoneBg },
  stepActive: { backgroundColor: t.stepActiveRing },
  stepPip: {
    width: t.stepPip,
    height: t.stepPip,
    borderRadius: t.stepPip / 2,
    backgroundColor: '#C9C1B4',
  },
  stepPipActive: { backgroundColor: t.stepActiveBg },
  stepRail: { flex: 1, width: t.stepRailW, minHeight: t.stepGapY, backgroundColor: t.stepRail },
  stepRailDone: { backgroundColor: t.stepRailDone },
  stepTitle: {
    marginTop: t.rowGap,
    marginLeft: t.stepGapX,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.stepTitleSize,
    color: colors.textPrimary,
  },
  stepTitleDim: { fontFamily: font.appBody, color: colors.textBody },

  imp: { backgroundColor: t.impBg, flexDirection: 'row' },
  impIcon: {
    width: t.impIcon,
    height: t.impIcon,
    borderRadius: t.impIcon / 2,
    backgroundColor: t.impIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impText: { flex: 1, minWidth: 0, marginLeft: t.impIconGap },
  impTitle: { fontFamily: font.appHeading, fontSize: t.impTitleSize, color: colors.textPrimary },
  impBody: {
    marginTop: t.impBodyGap,
    fontFamily: font.appBody,
    fontSize: t.impBodySize,
    lineHeight: t.impBodyLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  btn: {
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primary: { backgroundColor: t.primaryBg },
  primaryText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  btnIcon: { marginLeft: t.btnIconGap },
  secondary: { marginTop: t.secondaryGap, backgroundColor: t.secondaryBg },
  secondaryText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: colors.textPrimary },
  pressed: { opacity: 0.85 },
});
