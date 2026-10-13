import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Building2,
  Check,
  Copy,
  FileText,
  Info,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../components/CourierHeader';
import CourierTimeline from '../../components/CourierTimeline';
import { shrinkToFit } from '../../constants/textFit';
import { ADVOCATE, CO_SHIPMENT } from '../../data/courier';
import { courierShipment as t, courierGreen as g, font, ink } from '../../constants/theme';

// Client — shipment created (design/280).
//
// ⚠ Note 12 — drawn with placeholders: [Courier Name], [Waybill Number],
//   [Date], [Pickup Address], [Receiver Name], [Receiver Address] and
//   "[Document Count] Documents". Sample values are rendered in their place and
//   listed in PLACEHOLDERS in data/courier.ts.
// ⚠ Note 5 — the courier here is Blue Dart; design/281 tracks the same
//   shipment on DHL Express.
// ⚠ Note 19 — the "Important" banner's body is drawn in a ~62pt column, five
//   words over five lines, inside a card that is 350pt wide. It is reproduced
//   rather than tidied, because it is what was approved; one token
//   (importantBodyW) is all that holds it.
//
// Reused: components/CourierHeader, components/CourierTimeline (new, shared
// with designs 281 and 287).
//
// STATIC, NOT WIRED: all courier tracking. The waybill Copy button copies
// nothing — no clipboard vendor is scoped. "View Case" opens nothing.
const BAR_H = 14 + 52 + 8 + 52 + 24;

export default function CourierShipmentScreen() {
  const insets = useSafeAreaInsets();
  const d = CO_SHIPMENT;

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
        <Text style={styles.heroSub} {...shrinkToFit(0.8)}>
          {d.heroSub}
        </Text>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.headRow}>
            <Truck size={t.headGlyph} color={t.brand} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.detailsTitle}
            </Text>
          </View>
          <View style={styles.rowFirst}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              {d.courierLabel}
            </Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
              {d.courierValue}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              {d.waybillLabel}
            </Text>
            <View style={styles.copyChip}>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {d.waybillValue}
              </Text>
              <Copy size={t.copyGlyph} color={t.inkMuted} strokeWidth={2} style={styles.copyGlyph} />
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              {d.pickupDateLabel}
            </Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
              {d.pickupDateValue}
            </Text>
          </View>
          <Text style={styles.addrLabel} {...shrinkToFit(0.8)}>
            {d.pickupAddrLabel}
          </Text>
          <Text style={styles.addrValue} {...shrinkToFit(0.8)}>
            {d.pickupAddrValue}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.headRow}>
            <Building2 size={t.headGlyph} color={t.brand} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.sendTitle}
            </Text>
          </View>
          <Text style={styles.addrName} {...shrinkToFit(0.8)}>
            {ADVOCATE.name}
          </Text>
          <Text style={styles.addrValue} {...shrinkToFit(0.8)}>
            {ADVOCATE.office}
          </Text>
        </View>

        <View style={[styles.card, styles.docCard]}>
          <View style={styles.docTile}>
            <FileText size={t.docGlyph} color={t.inkMuted} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.docTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <Text style={styles.docSub} {...shrinkToFit(0.8)}>
              {d.docsSub}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.statusTitle} {...shrinkToFit(0.8)}>
            {d.statusTitle}
          </Text>
          <View style={styles.statusList}>
            <CourierTimeline steps={d.steps} />
          </View>
        </View>

        <View style={styles.important}>
          <View style={styles.importantCircle}>
            <Info size={t.importantGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.importantTitle} {...shrinkToFit(0.8)}>
              {d.importantTitle}
            </Text>
            <Text style={styles.importantBody}>{d.importantBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/courier/tracking' as Href)}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.ctaAlt}
          style={({ pressed }) => [styles.btn, styles.btnAlt, pressed && styles.pressed]}
        >
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
  pressed: { opacity: 0.9 },

  heroCircle: {
    marginTop: t.heroTop,
    alignSelf: 'center',
    width: t.heroCircle,
    height: t.heroCircle,
    borderRadius: t.heroCircle / 2,
    backgroundColor: '#22B573',
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
  heroSub: {
    marginTop: t.heroSubTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.heroSubSize,
    color: t.inkMuted,
  },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    backgroundColor: g.ink,
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
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
  headRow: { flexDirection: 'row', alignItems: 'center' },
  headTitle: {
    marginLeft: t.headGap,
    fontFamily: font.appHeading,
    fontSize: t.headSize,
    color: t.ink,
  },
  row: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center' },
  rowFirst: { marginTop: t.rowTop, flexDirection: 'row', alignItems: 'center' },
  rowLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.inkMuted },
  rowValue: { fontFamily: font.appHeading, fontSize: t.rowValueSize, color: t.ink },
  copyChip: {
    height: t.copyChipH,
    borderRadius: t.copyChipRadius,
    paddingHorizontal: t.copyChipPadX,
    backgroundColor: t.boxBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyGlyph: { marginLeft: t.copyGap },
  addrLabel: {
    marginTop: t.addrLabelTop,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: t.inkMuted,
  },
  addrName: {
    marginTop: t.sendNameTop,
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: t.ink,
  },
  addrValue: {
    marginTop: t.addrValueTop,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    color: t.inkMuted,
  },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: t.docPadY,
    paddingBottom: t.docPadY,
  },
  docTile: {
    width: t.docTileH,
    height: t.docTileH,
    borderRadius: t.docTileRadius,
    backgroundColor: t.boxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.docGap,
  },
  docTitle: { fontFamily: font.appHeading, fontSize: t.docTitleSize, color: t.ink },
  docSub: {
    marginTop: t.docSubTop,
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    color: t.inkMuted,
  },

  statusTitle: { fontFamily: font.appHeading, fontSize: t.headSize, color: t.ink },
  statusList: { marginTop: t.statusTop },

  important: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.importantBg,
    paddingHorizontal: t.importantPadX,
    paddingVertical: t.importantPadY,
    flexDirection: 'row',
  },
  importantCircle: {
    width: t.importantCircle,
    height: t.importantCircle,
    borderRadius: t.importantCircle / 2,
    backgroundColor: t.importantCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.importantGap,
  },
  importantTitle: {
    fontFamily: font.appHeading,
    fontSize: t.importantTitleSize,
    color: '#55442D',
  },
  importantBody: {
    marginTop: t.importantBodyTop,
    maxWidth: t.importantBodyW,
    fontFamily: font.appBody,
    fontSize: t.importantBodySize,
    lineHeight: t.importantBodyLine,
    color: t.inkMuted,
  },

  bar: {
    backgroundColor: t.cardBg,
    paddingTop: t.barPadTop,
    paddingHorizontal: t.padX,
  },
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
  btnAltText: { marginRight: 0, color: t.ink },
});
