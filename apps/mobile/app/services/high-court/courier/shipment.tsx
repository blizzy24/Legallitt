import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  Check,
  Clock,
  Copy,
  FileText,
  Files,
  FolderClosed,
  Gavel,
  IdCard,
  LocateFixed,
  MessageSquareMore,
  TrendingUp,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { font, hcPalette as c, hcShipment as t, ink, shadow, status } from '../../../../constants/theme';
import { HC_SHIPMENT } from '../../../../data/highCourt';

// High Court courier — shipment created (design/310). Measured at 2.000 px/pt.
// Reached from the reused courier payment success (/courier/success?flow=hcr).
//
// Conflicts 4 and 5 are commented on HC_SHIPMENT.
//
// STATIC, NOT WIRED: no shipment exists; Copy copies nothing; the status list is
// a drawing and no SMS is sent. View Tracking opens design/311. View Case opens
// the client's cases list — no High Court case screen is drawn. Close returns
// Home.

const CHIP_ICON = { file: FileText, id: IdCard, gavel: Gavel, copy: Files } as const;

export default function HighCourtShipmentScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_SHIPMENT;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} close backHref={'/(tabs)/home' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ring}>
          <View style={styles.ringMid}>
            <View style={styles.ringCore}>
              <Check size={t.ringGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.sub}</Text>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.det]}>
          <View style={styles.strip}>
            <View style={[styles.tile, styles.tilePeach]}>
              <Truck size={t.tileGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.detTitle}
            </Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{d.detTag}</Text>
            </View>
          </View>
          <View style={styles.detBody}>
            <View style={styles.way}>
              <View style={styles.flex}>
                <Text style={styles.label}>{d.wayLabel}</Text>
                <Text style={styles.wayValue} {...shrinkToFit(0.8)}>
                  {d.waybill}
                </Text>
              </View>
              {/* Inert — nothing is copied. */}
              <View style={styles.copy}>
                <Copy size={t.copyIcon} color={c.inkWarm} strokeWidth={1.9} />
              </View>
            </View>

            <View style={styles.sched}>
              <Clock size={t.schedIcon} color={c.inkWarm} strokeWidth={2} />
              <View style={styles.flex}>
                <Text style={styles.label}>{d.schedLabel}</Text>
                <Text style={styles.schedValue} {...shrinkToFit(0.8)}>
                  {d.sched}
                </Text>
                <Text style={styles.schedSub}>{d.schedSub}</Text>
              </View>
            </View>

            <View style={styles.route}>
              <View style={styles.rail} />
              <View>
                <View style={[styles.routeDot, styles.dotFrom]} />
                <Text style={styles.label}>{d.fromLabel}</Text>
                <Text style={styles.routeName}>{d.fromName}</Text>
                <Text style={styles.routeAddr}>{d.fromAddr}</Text>
              </View>
              <View style={styles.routeTo}>
                <View style={[styles.routeDot, styles.dotTo]} />
                <Text style={styles.label}>{d.toLabel}</Text>
                <Text style={styles.routeName}>{d.toName}</Text>
                <Text style={styles.routeAddr}>{d.toAddr}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.pack]}>
          <View style={styles.head}>
            <View style={[styles.tile, styles.tileGrey]}>
              <FolderClosed size={t.tileGlyph} color={c.inkWarm} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{d.packTitle}</Text>
              <Text style={styles.packSub}>{d.packSub}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => {
              const Icon = CHIP_ICON[ch.icon];
              return (
                <View key={ch.label} style={styles.chip}>
                  <Icon size={t.chipIcon} color={c.ink} strokeWidth={1.8} />
                  <Text style={styles.chipText}>{ch.label}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.seal}>
            <BadgeCheck size={t.sealIcon} color={c.greenInk} strokeWidth={1.9} />
            <Text style={styles.sealText}>{d.seal}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.stat]}>
          <View style={styles.head}>
            <View style={[styles.tile, styles.tilePeach]}>
              <TrendingUp size={t.tileGlyph} color={c.ink} strokeWidth={2} />
            </View>
            <Text style={styles.title}>{d.statTitle}</Text>
          </View>
          <View style={styles.rows}>
            {d.steps.map((s, i) => {
              const last = i === d.steps.length - 1;
              return (
                <View key={s.title} style={[styles.row, !last && styles.rowSpaced]}>
                  <View style={styles.railCol}>
                    <View
                      style={[
                        styles.disc,
                        s.state === 'done' && styles.discDone,
                        s.state === 'active' && styles.discActive,
                        s.state === 'waiting' && styles.discWait,
                      ]}
                    >
                      {s.state === 'done' ? (
                        <Check size={t.discGlyph} color={ink.onBrand} strokeWidth={3} />
                      ) : (
                        <View style={[styles.discDot, s.state === 'active' && styles.discDotActive]} />
                      )}
                    </View>
                    {!last && <View style={styles.stepRail} />}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.rowHead}>
                      <Text style={[styles.rowTitle, s.state === 'waiting' && styles.rowTitleWait]}>{s.title}</Text>
                      {'chip' in s && (
                        <View style={styles.chipTag}>
                          <Text style={styles.chipTagText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.rowDesc, s.state === 'waiting' && styles.rowDescWait]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sms}>
          <MessageSquareMore size={t.smsIcon} color={c.inkWarm} strokeWidth={1.7} />
          <Text style={styles.smsText}>
            {d.smsLead}
            <Text style={styles.smsBold}>{d.smsPhone}</Text>
            {d.smsTail}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/courier/tracking' as Href)}
          style={[styles.btn, styles.btnBrown]}
        >
          <LocateFixed size={t.btnIcon} color={ink.onBrand} strokeWidth={2} />
          <Text style={styles.btnText}>{d.cta}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/cases' as Href)}
          style={[styles.btn, styles.btnGrey]}
        >
          <Text style={styles.btn2Text}>{d.cta2}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },

  ring: {
    marginTop: t.ringTop,
    alignSelf: 'center',
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMid: {
    width: t.ringMid,
    height: t.ringMid,
    borderRadius: t.ringMid / 2,
    backgroundColor: c.greenRingMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCore: {
    width: t.ringCore,
    height: t.ringCore,
    borderRadius: t.ringCore / 2,
    backgroundColor: c.greenInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { marginTop: t.h1Top, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { marginTop: t.subTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.greenInk },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card },
  det: { marginTop: t.detTop, overflow: 'hidden', paddingBottom: t.detPadBottom },
  strip: {
    height: t.stripH,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.tileGap,
  },
  tile: { width: t.tile, height: t.tile, borderRadius: t.tileRadius, alignItems: 'center', justifyContent: 'center' },
  tilePeach: { backgroundColor: c.peach },
  tileGrey: { backgroundColor: c.tileGrey },
  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  tag: { marginLeft: 'auto', height: t.tagH, borderRadius: t.tagH / 2, paddingHorizontal: t.tagPadX, backgroundColor: c.peach, justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.brownInk },
  detBody: { paddingHorizontal: t.cardPadX },
  way: {
    marginTop: t.wayTop,
    minHeight: t.wayH,
    borderRadius: t.wayRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.wayPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: c.inkWarm,
  },
  wayValue: {
    fontFamily: font.appSemi,
    fontSize: t.wayValueSize,
    lineHeight: t.wayValueLineHeight,
    letterSpacing: t.wayValueSpacing,
    color: c.ink,
  },
  copy: {
    width: t.copy,
    height: t.copy,
    borderRadius: t.copy / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sched: { marginTop: t.schedTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.schedGap },
  schedValue: { fontFamily: font.appSemi, fontSize: t.schedValueSize, lineHeight: t.schedValueLineHeight, color: c.ink },
  schedSub: { fontFamily: font.appBody, fontSize: t.schedSubSize, lineHeight: t.schedSubLineHeight, color: c.inkWarm },
  route: { marginTop: t.routeTop, paddingLeft: t.routeX },
  rail: {
    position: 'absolute',
    left: t.railX,
    top: t.labelLineHeight / 2,
    bottom: t.routeAddrLineHeight * 2,
    width: t.routeRail,
    backgroundColor: c.radioGrey,
  },
  routeDot: {
    position: 'absolute',
    left: t.routeDotX,
    top: t.labelLineHeight / 2,
    width: t.routeDot,
    height: t.routeDot,
    borderRadius: t.routeDot / 2,
  },
  dotFrom: { backgroundColor: c.brown },
  dotTo: { backgroundColor: c.greenInk },
  routeTo: { marginTop: t.routeGap },
  routeName: { fontFamily: font.appSemi, fontSize: t.routeNameSize, lineHeight: t.routeNameLineHeight, color: c.ink },
  routeAddr: { fontFamily: font.appBody, fontSize: t.routeAddrSize, lineHeight: t.routeAddrLineHeight, color: c.inkWarm },

  pack: { paddingHorizontal: t.cardPadX, paddingTop: t.packPadTop, paddingBottom: t.packPadBottom },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.tileGap },
  packSub: { fontFamily: font.appBody, fontSize: t.packSubSize, lineHeight: t.packSubLineHeight, color: c.inkWarm },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipIconGap,
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: c.ink },
  seal: {
    marginTop: t.sealTop,
    borderRadius: t.sealRadius,
    backgroundColor: c.greenMist,
    paddingHorizontal: t.sealPadX,
    paddingVertical: t.sealPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.sealGap,
  },
  sealText: { flex: 1, fontFamily: font.appBody, fontSize: t.sealSize, lineHeight: t.sealLineHeight, color: c.greenInk },

  stat: { paddingHorizontal: t.cardPadX, paddingTop: t.statPadTop, paddingBottom: t.statPadBottom },
  rows: { marginTop: t.rowsTop },
  row: { flexDirection: 'row', gap: t.discGap },
  rowSpaced: { minHeight: t.rowH },
  railCol: { width: t.disc + 4, alignItems: 'center', paddingTop: (t.rowTitleLineHeight - t.disc) / 2 },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: status.active },
  discActive: { backgroundColor: c.peach },
  discWait: { backgroundColor: c.helpGrey },
  discDot: { width: t.discDot - 2, height: t.discDot - 2, borderRadius: t.discDot, backgroundColor: c.tagMuted },
  discDotActive: { width: t.discDot, height: t.discDot, backgroundColor: c.brown },
  stepRail: { flex: 1, width: t.routeRail, backgroundColor: c.radioGrey },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: t.discGap },
  rowTitle: { fontFamily: font.appSemi, fontSize: t.rowTitleSize, lineHeight: t.rowTitleLineHeight, color: c.ink },
  rowTitleWait: { fontFamily: font.appBody, color: c.inkWarm },
  rowDesc: { fontFamily: font.appBody, fontSize: t.rowDescSize, lineHeight: t.rowDescLineHeight, color: c.inkWarm },
  rowDescWait: { color: c.inkMuted },
  chipTag: { height: t.chipTagH, borderRadius: t.chipTagRadius, paddingHorizontal: t.chipTagPadX, backgroundColor: c.peach, justifyContent: 'center' },
  chipTagText: { fontFamily: font.appSemi, fontSize: t.chipTagSize, color: c.brownInk },

  sms: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.tileGrey,
    paddingHorizontal: t.smsPadX,
    paddingVertical: t.smsPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.smsGap,
  },
  smsText: { flex: 1, fontFamily: font.appBody, fontSize: t.smsSize, lineHeight: t.smsLineHeight, color: c.inkWarm },
  smsBold: { fontFamily: font.appSemi, color: c.ink },

  bar: { backgroundColor: c.card, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, gap: t.btnGap },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnBrown: { backgroundColor: c.brown },
  btnGrey: { backgroundColor: c.tileGrey },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  btn2Text: { fontFamily: font.appSemi, fontSize: t.btn2Size, color: c.ink },
});
