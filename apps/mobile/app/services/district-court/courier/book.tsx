import { router, type Href } from 'expo-router';
import { ArrowRight, Calendar, Check, CircleCheck, FileText, Info, MapPin, Pencil, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcCourierBook as t,
  dcCourierBookPalette as p,
  dcDocumentsPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../../constants/theme';
import { DC_COURIER_BOOK } from '../../../../data/districtCourt';

// District Court — book the courier delivery (design/352). Measured at 2.000
// px/pt. Reached from Continue to Book Delivery on design/351.
//
// Book Delivery opens the shared courier payment (design/307) with ?flow=dcr,
// whose Scan & Pay (308) and success (309) continue to the District Court
// shipment screen (design/353). Edit returns to 351. The confirmation box is
// a real local toggle, drawn ticked; the button is not gated.

const SEC_ICON = { docs: FileText, date: Calendar } as const;

export default function DistrictCourierBookScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_COURIER_BOOK;
  const [agree, setAgree] = useState(true);

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        backHref={'/services/district-court/courier/details' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.step}
          </Text>
        </View>
        <Text style={styles.lead}>{d.lead}</Text>

        <View style={styles.ready}>
          <View style={styles.okDisc}>
            <CircleCheck size={t.okGlyph} color={c.greenTile} fill={c.greenInk} strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.readyTitle}>{d.readyTitle}</Text>
            <Text style={styles.readySub}>{d.readySub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.sumTitle} {...shrinkToFit(0.8)}>
              {d.sumTitle}
            </Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.back()}
              style={styles.edit}
            >
              <Pencil size={t.editIcon} color={c.brown} strokeWidth={2} />
              <Text style={styles.editText}>{d.edit}</Text>
            </Pressable>
          </View>
          <View style={styles.secs}>
            {d.sections.map((s, i) => (
              <View key={s.caps}>
                {i > 0 && <View style={styles.rule} />}
                <View style={[styles.sec, i === 0 && styles.secFirst, i === d.sections.length - 1 && styles.secLast]}>
                  <View style={[styles.secDisc, s.icon === 'to' && styles.secDiscPeach]}>
                    {s.icon === 'from' ? (
                      <View style={styles.ring} />
                    ) : s.icon === 'to' ? (
                      <MapPin size={t.secGlyph} color={c.brown} strokeWidth={2} />
                    ) : (
                      (() => {
                        const Icon = SEC_ICON[s.icon];
                        return <Icon size={t.secGlyph} color={c.brown} strokeWidth={1.9} />;
                      })()
                    )}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.between}>
                      <Text style={styles.caps} {...shrinkToFit(0.8)}>
                        {s.caps}
                      </Text>
                      {'chip' in s && (
                        <View style={styles.chip}>
                          <Text style={styles.chipText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.name}>{s.name}</Text>
                    {'body' in s && <Text style={styles.addr}>{s.body}</Text>}
                    {'phone' in s && (
                      <View style={styles.phone}>
                        <Phone size={t.phoneIcon} color={c.ink} strokeWidth={2} />
                        <Text style={[styles.addr, styles.phoneText]}>{s.phone}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.fee]}>
          <View style={styles.between}>
            <Text style={styles.feeTitle}>{d.feeTitle}</Text>
            <View style={[styles.chip, styles.stdChip]}>
              <Text style={[styles.chipText, styles.brown]}>{d.feeChip}</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{d.fee}</Text>
            <Text style={styles.priceLabel}>{d.feeLabel}</Text>
          </View>
          <Text style={styles.feeBody}>{d.feeBody}</Text>
        </View>

        <View style={styles.note}>
          <Info size={t.noteIcon} color={c.inkMuted} strokeWidth={1.9} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => setAgree((v) => !v)}
          style={[styles.card, styles.agree]}
        >
          <View style={[styles.box, agree && styles.boxOn]}>
            {agree && <Check size={t.boxGlyph} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.agreeText}>{d.agree}</Text>
            <Text style={styles.agreeSub}>{d.agreeSub}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/courier/payment?flow=dcr' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.cap}>{d.caption}</Text>
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
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.priceGap },

  pill: {
    marginTop: t.pillTop,
    alignSelf: 'flex-start',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brownInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  lead: { marginTop: t.leadTop, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: c.inkWarm },

  ready: {
    marginTop: t.readyTop,
    borderRadius: t.readyRadius,
    borderLeftWidth: t.readyEdge,
    borderLeftColor: c.greenInk,
    paddingHorizontal: t.readyPadX,
    paddingVertical: t.readyPadY,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.okGap,
    ...shadow,
  },
  okDisc: {
    width: t.okDisc,
    height: t.okDisc,
    borderRadius: t.okDisc / 2,
    backgroundColor: c.greenTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyTitle: { fontFamily: font.appSemi, fontSize: t.readyTitleSize, lineHeight: t.readyTitleLineHeight, color: c.ink },
  readySub: { fontFamily: font.appBody, fontSize: t.readySubSize, color: c.inkWarm },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  next: { marginTop: t.cardGap },
  sumTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.sumTitleSize, lineHeight: t.sumTitleLineHeight, color: c.ink },
  edit: { flexDirection: 'row', alignItems: 'center', gap: t.editGap },
  editText: { fontFamily: font.appSemi, fontSize: t.editSize, color: c.brown },
  secs: { marginTop: t.secsTop },
  rule: { height: t.ruleH, backgroundColor: c.radioGrey },
  sec: { paddingVertical: t.secPadY, flexDirection: 'row', alignItems: 'flex-start', gap: t.secGap },
  secFirst: { paddingTop: 0 },
  secLast: { paddingBottom: 0 },
  secDisc: {
    width: t.secDisc,
    height: t.secDisc,
    borderRadius: t.secDisc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secDiscPeach: { backgroundColor: dcDocumentsPalette.tilePeach },
  ring: {
    width: t.secGlyph,
    height: t.secGlyph,
    borderRadius: t.secGlyph / 2,
    borderWidth: t.ringWidth,
    borderColor: c.brown,
  },
  caps: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.capsSize,
    lineHeight: t.capsLineHeight,
    letterSpacing: t.capsSpacing,
    color: c.inkMuted,
  },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, backgroundColor: c.helpGrey, justifyContent: 'center' },
  stdChip: { backgroundColor: p.stdChip },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.ink },
  name: { marginTop: t.nameTop, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  addr: { marginTop: t.addrTop, fontFamily: font.appBody, fontSize: t.addrSize, lineHeight: t.addrLineHeight, color: c.inkWarm },
  phone: { marginTop: t.phoneTop, flexDirection: 'row', alignItems: 'center', gap: t.phoneGap },
  phoneText: { marginTop: t.phoneTextTop, flex: 1 },

  fee: { marginTop: t.feeTop, backgroundColor: c.peachSoft },
  feeTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.feeTitleSize, color: c.brownInk },
  priceRow: { marginTop: t.priceTop, flexDirection: 'row', alignItems: 'baseline', gap: t.priceGap },
  price: { fontFamily: font.appHeading, fontSize: t.priceSize, color: c.ink },
  priceLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.feeBodySize, color: c.inkWarm },
  feeBody: { marginTop: t.feeBodyTop, fontFamily: font.appBody, fontSize: t.feeBodySize, lineHeight: t.feeBodyLineHeight, color: c.inkWarm },

  note: { marginTop: t.noteTop, flexDirection: 'row', alignItems: 'center', gap: t.noteGap },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.inkMuted },

  agree: { marginTop: t.agreeTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.boxGap },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.ruleH,
    borderColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown },
  agreeText: { fontFamily: font.appSemi, fontSize: t.agreeSize, lineHeight: t.agreeLineHeight, color: c.ink },
  agreeSub: { marginTop: t.agreeSubTop, fontFamily: font.appBody, fontSize: t.agreeSubSize, lineHeight: t.agreeSubLineHeight, color: c.inkWarm },

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
  cap: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, letterSpacing: t.capSpacing, color: c.inkMuted },
});
