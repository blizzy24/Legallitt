import { Building2, ChevronRight, Copy, FileText, Info, RefreshCw, Truck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CourierHeader from '../../components/CourierHeader';
import CourierTimeline from '../../components/CourierTimeline';
import { shrinkToFit } from '../../constants/textFit';
import { CO_TRACKING } from '../../data/courier';
import { courierTracking as t, font, ink } from '../../constants/theme';

// Client — document delivery tracking (design/281).
//
// Built as drawn, including three things this screen contradicts elsewhere:
// ⚠ Note 5 — the courier is "DHL Express" with waybill DHL-8942-0194. designs
//   276 and 280 both say Blue Dart for the same shipment.
// ⚠ Note 6 — it is addressed to "Advocate Sarah Jenkins, High Court Chambers,
//   4th Floor, 24 St. George's Avenue, District 3": a seventh advocate name in
//   this project, and an address in no Indian format. Every other screen in
//   the batch sends to Adv. Gurneeet Chawla, Chamber No. 14, Indore.
// ⚠ Note 7 — "3 Physical Documents", against 5 on designs 275/284 and 4 on
//   design/282.
//
// Reused: components/CourierHeader, components/CourierTimeline (its second of
// three screens; this is the one that gives every row a second line).
//
// STATIC, NOT WIRED: all courier tracking. "Refresh Status" re-renders and
// nothing changes — there is no Blue Dart or DHL API behind it, and no polling.
// The waybill Copy button copies nothing and "View" opens nothing.
export default function CourierTrackingScreen() {
  const d = CO_TRACKING;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.svcRow}>
            <View style={styles.svcTile}>
              <Truck size={t.svcGlyph} color={t.inkMuted} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.svcLabel} {...shrinkToFit(0.8)}>
                {d.courierLabel}
              </Text>
              <Text style={styles.svcName} {...shrinkToFit(0.8)}>
                {d.courierName}
              </Text>
            </View>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {d.statusPill}
              </Text>
            </View>
          </View>
          <View style={styles.way}>
            <View style={styles.flex}>
              <Text style={styles.wayLabel} {...shrinkToFit(0.8)}>
                {d.waybillLabel}
              </Text>
              <Text style={styles.wayValue} {...shrinkToFit(0.8)}>
                {d.waybillValue}
              </Text>
            </View>
            <View style={styles.wayCopy}>
              <Copy size={t.wayCopyGlyph} color={t.inkMuted} strokeWidth={2} />
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.sendCard]}>
          <View style={styles.sectionRow}>
            <Building2 size={t.sectionGlyph} color={t.brand} strokeWidth={2} />
            <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
              {d.sendLabel}
            </Text>
          </View>
          <Text style={styles.sendName} {...shrinkToFit(0.8)}>
            {d.receiver}
          </Text>
          {d.receiverLines.map((l) => (
            <Text key={l} style={styles.sendLine} {...shrinkToFit(0.8)}>
              {l}
            </Text>
          ))}
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
          <Text style={styles.docLink} {...shrinkToFit(0.8)}>
            {d.docsLink}
          </Text>
          <ChevronRight size={t.sectionGlyph} color={t.brand} strokeWidth={2.2} />
        </View>

        <View style={styles.card}>
          <Text style={styles.progressTitle} {...shrinkToFit(0.8)}>
            {d.progressTitle}
          </Text>
          <View style={styles.progressList}>
            <CourierTimeline steps={d.steps} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.updateRow}>
            <Text style={styles.updateLabel} {...shrinkToFit(0.8)}>
              {d.updateLabel}
            </Text>
            <Text style={styles.updateTime} {...shrinkToFit(0.8)}>
              {d.updateTime}
            </Text>
          </View>
          <Text style={styles.updateTitle} {...shrinkToFit(0.75)}>
            {d.updateTitle}
          </Text>
          <Text style={styles.updateBody}>{d.updateBody}</Text>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerCircle}>
            <Info size={t.bannerGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{d.bannerTitle}</Text>
            <Text style={styles.bannerBody}>{d.bannerBody}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <RefreshCw size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
        <Text style={styles.foot} {...shrinkToFit(0.8)}>
          {d.foot}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.bottomPad },
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },

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
  sendCard: { paddingBottom: t.sendPadBottom },

  svcRow: { flexDirection: 'row', alignItems: 'center' },
  svcTile: {
    width: t.svcTile,
    height: t.svcTile,
    borderRadius: t.svcTileRadius,
    backgroundColor: t.boxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.svcGap,
  },
  svcLabel: {
    fontFamily: font.appSemi,
    fontSize: t.svcLabelSize,
    letterSpacing: t.svcLabelSpacing,
    color: t.inkMuted,
  },
  svcName: {
    marginTop: t.svcNameTop,
    fontFamily: font.appHeading,
    fontSize: t.svcNameSize,
    color: t.ink,
  },
  pill: {
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
    backgroundColor: t.pillInk,
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    color: t.pillInk,
  },

  way: {
    marginTop: t.wayTop,
    borderRadius: t.wayRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.wayPadX,
    paddingVertical: t.wayPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wayLabel: { fontFamily: font.appBody, fontSize: t.wayLabelSize, color: t.inkMuted },
  wayValue: {
    marginTop: t.wayValueTop,
    fontFamily: font.appHeading,
    fontSize: t.wayValueSize,
    color: t.ink,
  },
  wayCopy: {
    width: t.wayCopy,
    height: t.wayCopy,
    borderRadius: t.wayCopyRadius,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel: {
    marginLeft: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionLabelSize,
    letterSpacing: t.svcLabelSpacing,
    color: t.inkMuted,
  },
  sendName: {
    marginTop: t.sendNameTop,
    fontFamily: font.appHeading,
    fontSize: t.sendNameSize,
    color: t.ink,
  },
  sendLine: {
    marginTop: t.sendLineTop,
    fontFamily: font.appBody,
    fontSize: t.sendLineSize,
    color: t.inkMuted,
  },

  docCard: { flexDirection: 'row', alignItems: 'center' },
  docTile: {
    width: t.docTile,
    height: t.docTile,
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
  docLink: { fontFamily: font.appBody, fontSize: t.docLinkSize, color: t.brand },

  progressTitle: { fontFamily: font.appHeading, fontSize: t.progressTitleSize, color: t.ink },
  progressList: { marginTop: t.progressTop, paddingBottom: t.progressPadBottom - t.cardPadBottom },

  updateRow: { flexDirection: 'row', alignItems: 'center' },
  updateLabel: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.updateLabelSize,
    letterSpacing: t.svcLabelSpacing,
    color: t.inkMuted,
  },
  updateTime: { fontFamily: font.appBody, fontSize: t.updateTimeSize, color: t.inkMuted },
  updateTitle: {
    marginTop: t.updateTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.updateTitleSize,
    color: t.ink,
  },
  updateBody: {
    marginTop: t.updateBodyTop,
    fontFamily: font.appBody,
    fontSize: t.updateBodySize,
    lineHeight: t.updateBodyLine,
    color: t.inkMuted,
  },

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
  bannerTitle: {
    fontFamily: font.appHeading,
    fontSize: t.bannerTitleSize,
    lineHeight: t.bannerTitleLine,
    color: '#55442D',
  },
  bannerBody: {
    marginTop: t.bannerBodyTop,
    fontFamily: font.appBody,
    fontSize: t.bannerBodySize,
    lineHeight: t.bannerBodyLine,
    color: t.inkMuted,
  },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginLeft: t.ctaGap,
    fontFamily: font.appHeading,
    fontSize: t.ctaSize,
    color: ink.onBrand,
  },
  foot: {
    marginTop: t.footTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: t.inkMuted,
  },
});
