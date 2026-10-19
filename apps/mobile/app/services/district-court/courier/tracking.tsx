import { router, type Href } from 'expo-router';
import { Archive, ArrowRight, BadgeCheck, Calendar, Check, Copy, Headset, Info, Truck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcAcceptedPalette,
  dcDecidePalette,
  dcDocsNeededPalette,
  dcDocumentsPalette,
  dcTracking as t,
  dcTrackingPalette as p,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_TRACKING } from '../../../../data/districtCourt';

// District Court — courier delivery tracking (design/354). Measured at 2.000
// px/pt. Reached from Track Delivery on design/353. The button opens design/355
// (see the note in data/districtCourt.ts); Contact Support opens the support
// chat. STATIC: copy glyphs copy nothing; the tracking list is a drawing.

export default function DistrictTrackingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_TRACKING;
  const curIndex = d.timeline.findIndex((s) => s.state === 'current');

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        backHref={'/services/district-court/courier/shipment' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.hero]}>
          <View style={styles.between}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.pill}</Text>
            </View>
            <View style={styles.truck}>
              <Truck size={t.truckGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
          </View>
          <Text style={styles.title}>{d.heroTitle}</Text>
          <Text style={styles.sub}>{d.heroSub}</Text>
          <View style={styles.est}>
            <Calendar size={t.estIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.caps} {...shrinkToFit(0.75)}>
              {d.estCaps}
            </Text>
            <Text style={styles.estDate}>{d.est}</Text>
          </View>
        </View>

        <View style={styles.tiles}>
          {d.tiles.map(([cap, v]) => (
            <View key={cap} style={styles.tile}>
              <Text style={styles.tileCaps}>{cap}</Text>
              <Text style={styles.tileValue} {...shrinkToFit(0.75)}>
                {v}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.caps} {...shrinkToFit(0.8)}>
              {d.infoCaps}
            </Text>
            <View style={styles.secured}>
              <BadgeCheck size={t.securedIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.securedText}>{d.secured}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.courierLabel}</Text>
              <View style={styles.chip}>
                <Archive size={t.chipIcon} color={c.brown} strokeWidth={1.9} />
                <Text style={styles.rowValue}>{d.courier}</Text>
              </View>
            </View>
            {[
              [d.awbLabel, d.awb],
              [d.idLabel, d.id],
            ].map(([l, v]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.rowValue}>{v}</Text>
                  <View style={styles.copy}>
                    <Copy size={t.copyGlyph} color={c.brown} strokeWidth={2} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.trCard]}>
          <View style={styles.between}>
            <Text style={styles.trTitle}>{d.trTitle}</Text>
            <Text style={styles.live}>{d.live}</Text>
          </View>
          <View style={styles.tl}>
            <View style={[styles.rail, styles.railDone, { bottom: t.tlRowH * (d.timeline.length - 1 - curIndex) + t.tlRowH / 2 }]} />
            <View style={[styles.rail, styles.railWait, { top: t.tlRowH * curIndex + t.tlRowH / 2 }]} />
            {d.timeline.map((s) => {
              const done = s.state === 'done';
              const cur = s.state === 'current';
              const wait = s.state === 'wait';
              return (
                <View key={s.title} style={styles.tlRow}>
                  <View style={[styles.disc, done && styles.discDone, cur && styles.discCur]}>
                    {done && <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {wait && <View style={styles.dot} />}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.tlHead}>
                      <Text style={[styles.tlTitle, cur && styles.brown, wait && styles.tlTitleWait]}>{s.title}</Text>
                      {cur && (
                        <View style={styles.curPill}>
                          <Text style={styles.curPillText}>{d.current}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.tlStatus, wait && styles.tlStatusWait]}>{s.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.info]}>
          <Info size={t.infoIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.infoText}>{d.info}</Text>
        </View>

        <Pressable accessibilityRole="link" onPress={() => router.push('/support-chat' as Href)} style={styles.help}>
          <Headset size={t.helpIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.helpText}>{d.help}</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/courier/received' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  brown: { color: c.brown },
  hdrTitle: { fontSize: t.hdrTitleSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.copyGap },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  next: { marginTop: t.cardGap },
  hero: { marginTop: t.heroTop, backgroundColor: c.peachSoft },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.ink },
  truck: {
    width: t.truck,
    height: t.truck,
    borderRadius: t.truck / 2,
    backgroundColor: p.truckDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: t.titleTop, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, color: c.brown },
  est: {
    marginTop: t.estTop,
    minHeight: t.estH,
    borderRadius: t.estRadius,
    paddingHorizontal: t.estPadX,
    backgroundColor: dcAcceptedPalette.docRow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.estGap,
  },
  caps: { flex: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.brown },
  estDate: { fontFamily: font.appSemi, fontSize: t.estDateSize, color: c.ink },

  tiles: { marginTop: t.tilesTop, flexDirection: 'row', gap: t.tileGap },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: t.tileH,
    borderRadius: t.tileRadius,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  tileCaps: { fontFamily: font.appSemi, fontSize: t.tileCapsSize, letterSpacing: t.tileCapsSpacing, color: c.brown },
  tileValue: { marginTop: t.tileValueTop, fontFamily: font.appSemi, fontSize: t.tileValueSize, color: c.ink },

  secured: { flexDirection: 'row', alignItems: 'center', gap: t.securedGap },
  securedText: { fontFamily: font.appSemi, fontSize: t.securedSize, color: c.greenInk },
  rows: { marginTop: t.rowsTop },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.copyGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.brown },
  valueRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.copyGap },
  rowValue: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipGap,
  },
  copy: {
    width: t.copy,
    height: t.copy,
    borderRadius: t.copy / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },

  trTitle: { fontFamily: font.appSemi, fontSize: t.trTitleSize, lineHeight: t.trTitleLineHeight, color: c.ink },
  live: { fontFamily: font.appSemi, fontSize: t.liveSize, letterSpacing: t.liveSpacing, color: c.brown },
  tl: { marginTop: t.tlTop },
  trCard: { paddingBottom: t.tlPadBottom },
  rail: { position: 'absolute', left: t.tlInset + (t.tlDisc - t.tlRail) / 2, width: t.tlRail },
  railDone: { top: t.tlRowH / 2, backgroundColor: status.active },
  railWait: { bottom: t.tlRowH / 2, backgroundColor: p.waitRail },
  tlRow: { minHeight: t.tlRowH, paddingLeft: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  disc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: status.active },
  discCur: { backgroundColor: c.card, borderWidth: t.tlRing, borderColor: c.brown },
  dot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: c.tagMuted },
  tlHead: { flexDirection: 'row', alignItems: 'center', gap: t.curPillGap },
  tlTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleWait: { color: dcDecidePalette.waitInk },
  curPill: {
    height: t.curPillH,
    borderRadius: t.curPillH / 2,
    paddingHorizontal: t.curPillPadX,
    backgroundColor: dcDocsNeededPalette.fileTile,
    justifyContent: 'center',
  },
  curPillText: {
    fontFamily: font.appSemi,
    fontSize: t.curPillSize,
    letterSpacing: t.curPillSpacing,
    color: dcDocumentsPalette.shieldInk,
  },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.brown },
  tlStatusWait: { color: p.waitStatus },

  info: { backgroundColor: c.panel, flexDirection: 'row', gap: t.infoGap },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.brown },
  help: { marginTop: t.helpTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.helpGap },
  helpText: { fontFamily: font.appSemi, fontSize: t.helpSize, color: c.brown },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: c.card },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
    ...shadow,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});
