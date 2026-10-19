import { router, type Href } from 'expo-router';
import { ArrowRight, BellRing, Calendar, Check, Copy, Info, MapPin, Phone, ShieldCheck, Truck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcDocsNeededPalette,
  dcDocumentsPalette,
  dcShipment as t,
  dcShipmentPalette as p,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_SHIPMENT } from '../../../../data/districtCourt';

// District Court — courier shipment created (design/353). Measured at 2.000
// px/pt. Reached from the courier payment success (design/309, ?flow=dcr).
// Track Delivery opens design/354; Done returns to client Home.
// STATIC: the copy glyphs copy nothing.

export default function DistrictShipmentScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_SHIPMENT;

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        backHref={'/services/district-court/courier/book' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.halo}>
          <View style={styles.disc}>
            <Check size={t.glyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.heroTitle}>{d.heroTitle}</Text>
        <Text style={styles.heroBody}>{d.heroBody}</Text>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.heroPill}
          </Text>
        </View>

        <View style={[styles.card, styles.first]}>
          <View style={styles.band}>
            <ShieldCheck size={t.bandIcon} color={c.card} fill={dcDocumentsPalette.shieldInk} strokeWidth={2} />
            <Text style={styles.bandTitle} {...shrinkToFit(0.75)}>
              {d.cardTitle}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {d.handoff}
              </Text>
            </View>
          </View>
          <View style={styles.rows}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.idLabel}</Text>
              <View style={styles.valueRow}>
                <Text style={styles.rowValue}>{d.id}</Text>
                <Copy size={t.copyIcon} color={c.inkWarm} strokeWidth={2} />
              </View>
            </View>
            <View style={[styles.row, styles.alt]}>
              <Text style={styles.rowLabel}>{d.partnerLabel}</Text>
              <View style={styles.partner}>
                <Truck size={t.partnerIcon} color={c.brown} strokeWidth={1.9} />
                <Text style={styles.rowValue}>{d.partner}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.awbLabel}</Text>
              <View style={styles.valueRow}>
                <Text style={styles.rowValue}>{d.awb}</Text>
                <Copy size={t.copyIcon} color={c.inkWarm} strokeWidth={2} />
              </View>
            </View>
            <View style={[styles.row, styles.alt, styles.altSmall]}>
              <Text style={styles.rowLabel}>{d.statusLabel}</Text>
              <View style={styles.valueRow}>
                <View style={styles.pillDot} />
                <Text style={[styles.rowValue, styles.green]}>{d.status}</Text>
              </View>
            </View>
            <View style={styles.pkg}>
              <Text style={[styles.rowLabel, styles.pkgText]}>{d.pkgLabel}</Text>
              <Text style={[styles.rowValue, styles.pkgValue]}>
                {d.pkgLead}
                <Text style={styles.pkgRest}>{d.pkgRest}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={[styles.sec, styles.secFirst]}>
            <View style={styles.secDisc}>
              <Calendar size={t.secGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.caps}>{d.pickCaps}</Text>
              <Text style={styles.secValue}>{d.pickValue}</Text>
              <Text style={styles.secLine}>{d.pickLine}</Text>
              <View style={styles.phone}>
                <Phone size={t.phoneIcon} color={c.inkWarm} strokeWidth={2} />
                <Text style={[styles.secLine, styles.noTop]}>{d.pickPhone}</Text>
              </View>
            </View>
          </View>
          <View style={styles.rule} />
          <View style={[styles.sec, styles.secLast]}>
            <View style={styles.secDisc}>
              <MapPin size={t.secGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.caps}>{d.recvCaps}</Text>
              <Text style={styles.secValue}>{d.recvName}</Text>
              <Text style={styles.secLine}>{d.recvLine}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.notifCard, styles.notif]}>
          <View style={styles.notifDisc}>
            <BellRing size={t.notifGlyph} color={dcDocumentsPalette.shieldInk} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.notifTitle}>{d.notifTitle}</Text>
            <Text style={styles.notifBody}>{d.notifBody}</Text>
          </View>
        </View>

        <View style={styles.note}>
          <Info size={t.noteIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/courier/tracking' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home' as Href)} style={styles.done}>
          <Text style={styles.doneText}>{d.done}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  green: { color: c.greenInk },
  noTop: { marginTop: 0 },
  hdrTitle: { fontSize: t.hdrTitleSize },

  halo: {
    marginTop: t.heroTop,
    alignSelf: 'center',
    width: t.halo,
    height: t.halo,
    borderRadius: t.halo / 2,
    backgroundColor: p.heroHalo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: t.heroTitleTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.heroTitleSize,
    lineHeight: t.heroTitleLineHeight,
    color: c.ink,
  },
  heroBody: {
    marginTop: t.heroBodyTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLineHeight,
    color: c.inkWarm,
  },
  pill: {
    marginTop: t.heroPillTop,
    alignSelf: 'center',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: p.statusPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  first: { marginTop: t.cardTop },
  next: { marginTop: t.cardGap },
  band: {
    minHeight: t.bandH,
    borderRadius: t.bandRadius,
    paddingHorizontal: t.bandPadX,
    backgroundColor: c.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.bandGap,
  },
  bandTitle: { flex: 1, fontFamily: font.appSemi, fontSize: t.bandTitleSize, color: c.ink },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, backgroundColor: c.peachSoft, justifyContent: 'center' },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.brown },
  rows: { marginTop: t.rowsTop },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.copyGap },
  alt: { minHeight: t.altH, borderRadius: t.altRadius, paddingHorizontal: t.altPadX, backgroundColor: c.page },
  altSmall: { minHeight: t.altSmallH },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  valueRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.copyGap },
  rowValue: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  partner: {
    height: t.partnerH,
    borderRadius: t.altRadius,
    paddingHorizontal: t.partnerPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.partnerGap,
    ...shadow,
  },
  pkg: { marginTop: t.pkgTop, flexDirection: 'row', justifyContent: 'space-between', gap: t.copyGap },
  pkgText: { width: t.pkgLabelW, lineHeight: t.pkgLineHeight },
  pkgValue: { flex: 1, textAlign: 'right', lineHeight: t.pkgLineHeight },
  pkgRest: { fontFamily: font.appBody, color: c.inkWarm },

  sec: { paddingVertical: t.secPadY, flexDirection: 'row', alignItems: 'flex-start', gap: t.secGap },
  secFirst: { paddingTop: 0 },
  secLast: { paddingBottom: 0 },
  secDisc: {
    width: t.secDisc,
    height: t.secDisc,
    borderRadius: t.secDisc / 2,
    backgroundColor: c.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.brown },
  secValue: { fontFamily: font.appSemi, fontSize: t.secValueSize, lineHeight: t.secValueLineHeight, color: c.ink },
  secLine: { marginTop: t.secLineTop, fontFamily: font.appBody, fontSize: t.secLineSize, lineHeight: t.secLineLineHeight, color: c.inkWarm },
  phone: { marginTop: t.secLineTop, flexDirection: 'row', alignItems: 'center', gap: t.phoneGap },
  rule: { height: t.ruleH, backgroundColor: c.radioGrey },

  notifCard: { marginTop: t.notifTop },
  notif: { backgroundColor: dcDocsNeededPalette.halo, flexDirection: 'row', gap: t.notifGap },
  notifDisc: {
    width: t.notifDisc,
    height: t.notifDisc,
    borderRadius: t.notifDisc / 2,
    backgroundColor: dcDocumentsPalette.tilePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontFamily: font.appSemi, fontSize: t.notifTitleSize, color: c.ink },
  notifBody: { fontFamily: font.appBody, fontSize: t.notifBodySize, lineHeight: t.notifBodyLineHeight, color: c.inkWarm },

  note: { marginTop: t.noteTop, flexDirection: 'row', gap: t.noteGap, paddingHorizontal: t.noteGap },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.inkWarm },

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
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  done: { marginTop: t.doneTop, alignSelf: 'center' },
  doneText: { fontFamily: font.appSemi, fontSize: t.doneSize, color: c.inkWarm },
});
