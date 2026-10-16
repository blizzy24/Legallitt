import { router, type Href } from 'expo-router';

import DemoPressable from '../../../components/DemoPressable';
import { ArrowRight, BadgeCheck, Check, FileText, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { CO_RECEIVED } from '../../../data/courier';
import { courierReceived as t, courierGreen as g, font, ink } from '../../../constants/theme';

// ADVOCATE — documents received (design/283).
//
// Advocate-side for the same reasons as design/282: "Received By" is the
// advocate, and the secondary action is "Chat with Client".
//
// ⚠ Note 16 — this screen draws NO delivery tracker, although designs 280, 281
//   and 287 all draw one and this is the last step of the same journey. It
//   shows a document list with a "Received" pill instead. Nothing was invented
//   to fill the gap, so components/CourierTimeline is used on three screens in
//   this batch, not four.
// ⚠ Note 12 — drawn with placeholders: [Case ID], [Client Name], [Case Name],
//   [Document Count], [Document Name] x3, [Courier Name], [Waybill Number],
//   [Date] and [Advocate Name]. Sample values rendered; all in PLACEHOLDERS.
//
// STATIC, NOT WIRED: "Open Case" opens nothing from here, and "Chat with
// Client" is not wired — messaging exists elsewhere in the app and this screen
// deliberately does not reach into it.
export default function AdvocateCourierReceivedScreen() {
  const insets = useSafeAreaInsets();
  const d = CO_RECEIVED;
  const BAR_H = t.barPadTop + t.btnH + t.barGap + t.btnH + t.barPadBottom;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BAR_H + insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCircle}>
          <Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3} />
        </View>
        <Text style={styles.heroTitle} {...shrinkToFit(0.8)}>
          {d.heroTitle}
        </Text>
        <Text style={styles.heroBody}>{d.heroBody}</Text>

        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.caseLabel}
            </Text>
            <Text style={styles.caseId} {...shrinkToFit(0.8)}>
              {d.caseId}
            </Text>
          </View>
          {d.caseRows.map((r, i) => (
            <View key={r.label} style={[styles.dataRow, i === 0 ? styles.dataRowFirst : styles.dataRowNext]}>
              <Text style={styles.dataLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={styles.dataValue} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.docsTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.count}>
              <Text style={styles.countText} {...shrinkToFit(0.8)}>
                {d.docsCount}
              </Text>
            </View>
            <View style={styles.flex} />
            <View style={styles.received}>
              <BadgeCheck size={t.receivedGlyph} color={g.ink} strokeWidth={2} />
              <Text style={styles.receivedText} {...shrinkToFit(0.8)}>
                {d.receivedPill}
              </Text>
            </View>
          </View>
          {d.docs.map((n, i) => (
            <View key={n} style={[styles.docRow, i === 0 ? styles.docRowFirst : styles.docRowNext]}>
              <View style={styles.docGlyphBox}>
                <FileText size={t.docGlyph} color={t.brand} strokeWidth={2} />
              </View>
              <Text style={styles.docName} {...shrinkToFit(0.8)}>
                {n}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.docsTitle} {...shrinkToFit(0.8)}>
            {d.deliveryTitle}
          </Text>
          {d.deliveryRows.map((r, i) => (
            <View key={r.label} style={[styles.dataRow, i === 0 ? styles.dataRowFirst : styles.dataRowNext]}>
              <Text style={styles.dataLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={[styles.dataValue, r.mono && styles.mono]} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerCircle}>
            <ShieldCheck size={t.bannerGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle} {...shrinkToFit(0.8)}>
              {d.bannerTitle}
            </Text>
            <Text style={styles.bannerBody}>{d.bannerBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <DemoPressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </DemoPressable>
        {/* The advocate↔client chat is design/365 (app/advocate/court/chat) — navigation only. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.ctaAlt}
          onPress={() => router.push('/advocate/court/chat' as Href)}
          style={({ pressed }) => [styles.btn, styles.btnAlt, pressed && styles.pressed]}
        >
          <MessageSquare size={t.btnGlyph} color={t.ink} strokeWidth={2} />
          <Text style={[styles.btnText, styles.btnAltText]} {...shrinkToFit(0.8)}>
            {d.ctaAlt}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: {},
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.9 },

  heroCircle: {
    marginTop: t.heroTop,
    alignSelf: 'center',
    width: t.heroCircle,
    height: t.heroCircle,
    borderRadius: t.heroCircle / 2,
    backgroundColor: t.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: t.heroTitleTop,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    color: t.ink,
  },
  heroBody: {
    marginTop: t.heroBodyTop,
    marginHorizontal: 54,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLine,
    color: t.inkMuted,
  },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  cardFirst: { marginTop: t.cardTop },
  label: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.inkMuted,
  },
  caseId: { fontFamily: font.mono, fontSize: t.caseIdSize, color: t.brand },
  dataRow: { flexDirection: 'row', alignItems: 'center' },
  dataRowFirst: { marginTop: t.rowTop },
  dataRowNext: { marginTop: t.rowGap },
  dataLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.inkMuted },
  dataValue: { fontFamily: font.appHeading, fontSize: t.rowValueSize, color: t.ink },
  mono: { fontFamily: font.mono, color: t.ink },

  docsTitle: { fontFamily: font.appHeading, fontSize: t.docsTitleSize, color: t.ink },
  count: {
    marginLeft: t.countGap,
    height: t.countH,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: t.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: t.inkMuted },
  received: {
    height: t.receivedH,
    borderRadius: t.receivedRadius,
    paddingHorizontal: t.receivedPadX,
    backgroundColor: '#DEF4EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  receivedText: {
    marginLeft: t.receivedGap,
    fontFamily: font.appSemi,
    fontSize: t.receivedSize,
    color: g.ink,
  },
  docRow: {
    height: t.docRowH,
    borderRadius: t.docRowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.docRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowFirst: { marginTop: t.docRowTop },
  docRowNext: { marginTop: t.docRowGap },
  docGlyphBox: {
    width: t.docGlyphBox,
    height: t.docGlyphBox,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.docGap,
  },
  docName: { flex: 1, fontFamily: font.appBody, fontSize: t.docNameSize, color: t.inkMuted },

  banner: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.bannerBg,
    paddingHorizontal: t.bannerPadX,
    paddingVertical: t.bannerPadY,
    flexDirection: 'row',
  },
  bannerCircle: {
    width: t.bannerCircle,
    height: t.bannerCircle,
    borderRadius: t.bannerCircle / 2,
    backgroundColor: t.bannerCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.bannerGap,
  },
  bannerTitle: { fontFamily: font.appHeading, fontSize: t.bannerTitleSize, color: t.ink },
  bannerBody: {
    marginTop: t.bannerBodyTop,
    fontFamily: font.appBody,
    fontSize: t.bannerBodySize,
    lineHeight: t.bannerBodyLine,
    color: t.inkMuted,
  },

  bar: { backgroundColor: t.cardBg, paddingTop: t.barPadTop, paddingHorizontal: t.padX },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAlt: { marginTop: t.barGap, backgroundColor: t.btnAltBg },
  btnText: {
    marginRight: t.btnGap,
    fontFamily: font.appHeading,
    fontSize: t.btnSize,
    color: ink.onBrand,
  },
  btnAltText: { marginRight: 0, marginLeft: t.btnGap, color: t.ink },
});
