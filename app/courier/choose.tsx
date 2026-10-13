import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  Copy,
  Eye,
  FileText,
  Info,
  Landmark,
  MapPin,
  Package,
  Gavel,
  IdCard,
  Scale,
  Shield,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CourierHeader from '../../components/CourierHeader';
import { shrinkToFit } from '../../constants/textFit';
import { ADVOCATE, CO_CHOOSE, MATTER } from '../../data/courier';
import { courierChoose as t, courierGreen as g, font, ink } from '../../constants/theme';

// Client — choose how to send the physical documents (designs 275 + 284).
//
// ONE ROUTE, TWO SELECTION STATES. A pixel diff of the two exports shows they
// differ in exactly two places per card and nowhere else: the card fill, and
// the leading icon tile plus the radio mark (ink differs only in the column
// groups 45.2–90.0pt and 325.9–344.3pt). Every other pixel — the matter card,
// the document chips, "Send To", the banner, the button and its footer line —
// is identical. So this is one screen with real selection state, not two.
//
// Built as drawn, including:
// ⚠ Note 8 — design/284 selects "Send by Yourself" and still prints
//   "Next: Book Legalitt Delivery Partner pickup". The footer does not change
//   with the selection, because neither export changes it.
//
// The document chip row is CLIPPED in both exports: a fourth chip runs off the
// right edge. It is built as a horizontal scroller and the chips are kept.
//
// STATIC, NOT WIRED: "View", the document chips and "Copy" do nothing — no
// clipboard vendor is scoped for this batch.
export default function CourierChooseScreen() {
  const d = CO_CHOOSE;
  const [choice, setChoice] = useState<'self' | 'partner'>('partner');

  const go = () =>
    router.push(
      (choice === 'partner'
        ? '/courier/delivery-details'
        : '/courier/self/instructions') as Href,
    );

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{d.intro}</Text>

        <View style={styles.matter}>
          <View style={styles.chip}>
            <Gavel size={t.chipGlyph} color={t.chipInk} strokeWidth={2} />
            <Text style={styles.chipText} {...shrinkToFit(0.8)}>
              {MATTER.service}
            </Text>
          </View>
          <Text style={styles.matterNo} {...shrinkToFit(0.8)}>
            {MATTER.ref}
          </Text>
          <Text style={styles.case} {...shrinkToFit(0.75)}>
            {MATTER.title}
          </Text>
          <View style={styles.advocateRow}>
            <View style={styles.advocateGlyph}>
              <Landmark size={t.advocateGlyph - 7} color={t.inkMuted} strokeWidth={2} />
            </View>
            <Text style={styles.advocate} {...shrinkToFit(0.8)}>
              {MATTER.advocateLabel}{' '}
              <Text style={styles.advocateName}>{MATTER.advocateName}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.docs}>
          <View style={styles.docsHead}>
            <Text style={styles.docsTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.docsCount}>
              <Text style={styles.docsCountText} {...shrinkToFit(0.8)}>
                {d.docsCount}
              </Text>
            </View>
            <View style={styles.flex} />
            <Eye size={t.viewGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.view} {...shrinkToFit(0.8)}>
              {d.docsView}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroller}
            contentContainerStyle={styles.chipRow}
          >
            {d.docChips.map((c, i) => {
              const Glyph = [FileText, BadgeCheck, IdCard, FileText, Scale][i] ?? FileText;
              return (
                <View
                  key={c}
                  style={[styles.docChip, i > 0 && styles.docChipGap, i === 3 && styles.docChipAlt]}
                >
                  <Glyph size={t.docChipGlyph} color={t.inkMuted} strokeWidth={2} />
                  <Text style={styles.docChipText}>{c}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.chooseRow}>
          <Text style={styles.chooseTitle} {...shrinkToFit(0.8)}>
            {d.chooseTitle}
          </Text>
          <Text style={styles.tap} {...shrinkToFit(0.8)}>
            {d.chooseHint}
          </Text>
        </View>

        {d.options.map((o, i) => {
          const on = choice === o.key;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={o.title}
              onPress={() => setChoice(o.key)}
              style={({ pressed }) => [
                styles.option,
                i === 0 ? styles.optionFirst : styles.optionNext,
                on && styles.optionOn,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.tile, on && styles.tileOn]}>
                {o.key === 'self' ? (
                  <Package
                    size={t.tileGlyph}
                    color={on ? ink.onBrand : t.tileInkIdle}
                    strokeWidth={1.9}
                  />
                ) : (
                  <Truck
                    size={t.tileGlyph}
                    color={on ? ink.onBrand : t.tileInkIdle}
                    strokeWidth={1.9}
                  />
                )}
              </View>
              <View style={styles.optionCol}>
                <Text style={styles.optionTitle} {...shrinkToFit(0.8)}>
                  {o.title}
                </Text>
                {o.recommended ? (
                  <View style={styles.rec}>
                    <Text style={styles.recText} {...shrinkToFit(0.8)}>
                      {o.recommended}
                    </Text>
                  </View>
                ) : null}
                <Text style={styles.optionSub}>{o.sub}</Text>
                {o.note ? <Text style={styles.optionNote}>{o.note}</Text> : null}
                {o.safe ? (
                  <View style={styles.safeRow}>
                    <Shield size={t.safeGlyph} color={g.ink} strokeWidth={2} />
                    <Text style={styles.safe} {...shrinkToFit(0.8)}>
                      {o.safe}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>
                {on ? <CircleCheck size={t.radio} color={ink.onBrand} fill={t.radioOn} strokeWidth={2} /> : null}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.send}>
          <View style={styles.sendHead}>
            <MapPin size={t.sendGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.sendTitle} {...shrinkToFit(0.8)}>
              {d.sendToTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.copy}>
              <Copy size={t.copyGlyph} color={t.inkMuted} strokeWidth={2} />
              <Text style={styles.copyText} {...shrinkToFit(0.8)}>
                {d.copy}
              </Text>
            </View>
          </View>
          <View style={styles.addr}>
            <Text style={styles.addrName} {...shrinkToFit(0.8)}>
              {ADVOCATE.name}
            </Text>
            <Text style={styles.addrLine} {...shrinkToFit(0.8)}>
              {ADVOCATE.office}
            </Text>
            <Text style={styles.addrLine} {...shrinkToFit(0.8)}>
              {ADVOCATE.cityLine}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.infoCircle}>
            <Info size={t.infoGlyph} color={ink.onBrand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.infoTitle}>{d.infoTitle}</Text>
            <Text style={styles.infoBody}>{d.infoBody}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={go}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
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

  intro: {
    marginTop: t.introTop,
    marginHorizontal: t.padX,
    fontFamily: font.appBody,
    fontSize: t.introSize,
    lineHeight: t.introLine,
    color: t.inkMuted,
  },

  matter: {
    marginTop: t.matterTop,
    marginHorizontal: t.padX,
    backgroundColor: t.cardBg,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.matterPadX,
    paddingTop: t.matterPadTop,
    paddingBottom: t.matterPadBottom,
  },
  chip: {
    alignSelf: 'flex-start',
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    marginLeft: t.chipGap,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.chipInk,
  },
  matterNo: {
    marginTop: t.matterNoTop,
    fontFamily: font.appBody,
    fontSize: t.matterNoSize,
    color: t.inkMuted,
  },
  case: {
    marginTop: t.caseTop,
    fontFamily: font.appHeading,
    fontSize: t.caseSize,
    color: t.ink,
  },
  advocateRow: { marginTop: t.advocateTop, flexDirection: 'row', alignItems: 'center' },
  advocateGlyph: {
    width: t.advocateGlyph,
    height: t.advocateGlyph,
    borderRadius: t.advocateGlyph / 2,
    backgroundColor: '#F0EDED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advocate: {
    marginLeft: t.advocateGap,
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.advocateSize,
    color: t.ink,
  },
  advocateName: { fontFamily: font.appHeading },

  docs: {
    marginTop: t.docsTop,
    marginHorizontal: t.padX,
    backgroundColor: t.cardBg,
    borderRadius: t.cardRadius,
    paddingTop: t.docsPadTop,
    paddingBottom: t.docsPadBottom,
  },
  docsHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.docsPadX },
  docsTitle: { fontFamily: font.appHeading, fontSize: t.docsTitleSize, color: t.ink },
  docsCount: {
    marginLeft: t.docsCountGap,
    height: t.docsCountH,
    borderRadius: t.docsCountRadius,
    paddingHorizontal: t.docsCountPadX,
    backgroundColor: g.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docsCountText: { fontFamily: font.appSemi, fontSize: t.docsCountSize, color: g.ink },
  view: { marginLeft: t.viewGap, fontFamily: font.appBody, fontSize: t.viewSize, color: t.inkMuted },
  chipScroller: { marginTop: t.docChipTop },
  chipRow: { paddingHorizontal: t.docsPadX },
  docChip: {
    height: t.docChipH,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docChipGap: { marginLeft: t.docChipSpacing },
  docChipAlt: { backgroundColor: t.docChipBgAlt },
  docChipText: {
    marginLeft: t.docChipGap,
    fontFamily: font.appBody,
    fontSize: t.docChipSize,
    color: t.inkMuted,
  },

  chooseRow: {
    marginTop: t.chooseTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chooseTitle: { flex: 1, fontFamily: font.appHeading, fontSize: t.chooseSize, color: t.ink },
  tap: { fontFamily: font.appBody, fontSize: t.tapSize, color: t.inkMuted },

  option: {
    marginHorizontal: t.padX,
    backgroundColor: t.cardBg,
    borderRadius: t.optionRadius,
    paddingHorizontal: t.optionPadX,
    paddingTop: t.optionPadTop,
    paddingBottom: t.optionPadBottom,
    flexDirection: 'row',
  },
  optionFirst: { marginTop: t.optionTop },
  optionNext: { marginTop: t.optionGap },
  optionOn: { backgroundColor: t.optionSelectedBg },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBgIdle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOn: { backgroundColor: t.tileBgOn },
  optionCol: { flex: 1, marginLeft: t.tileGap },
  optionTitle: { fontFamily: font.appHeading, fontSize: t.optionTitleSize, color: t.ink },
  rec: {
    marginTop: t.recTop,
    alignSelf: 'flex-start',
    height: t.recH,
    borderRadius: t.recRadius,
    paddingHorizontal: t.recPadX,
    backgroundColor: g.recBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recText: { fontFamily: font.appSemi, fontSize: t.recSize, color: g.recInk },
  optionSub: {
    marginTop: t.optionSubTop,
    fontFamily: font.appBody,
    fontSize: t.optionSubSize,
    lineHeight: t.optionSubLine,
    color: t.inkMuted,
  },
  optionNote: {
    marginTop: t.optionNoteTop,
    fontFamily: font.appBody,
    fontSize: t.optionNoteSize,
    color: t.optionNoteInk,
  },
  safeRow: { marginTop: t.safeTop, flexDirection: 'row', alignItems: 'center' },
  safe: { marginLeft: t.safeGap, fontFamily: font.appSemi, fontSize: t.safeSize, color: g.ink },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    backgroundColor: t.radioIdle,
    marginTop: 2,
  },
  radioOn: { backgroundColor: 'transparent' },

  send: {
    marginTop: t.sendTop,
    marginHorizontal: t.padX,
    backgroundColor: t.cardBg,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.sendPadX,
    paddingTop: t.sendPadTop,
    paddingBottom: t.sendPadBottom,
  },
  sendHead: { flexDirection: 'row', alignItems: 'center' },
  sendTitle: {
    marginLeft: t.sendGap,
    fontFamily: font.appHeading,
    fontSize: t.sendTitleSize,
    color: t.ink,
  },
  copy: {
    height: t.copyH,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.copyBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: t.copyGap,
    fontFamily: font.appBody,
    fontSize: t.copySize,
    color: t.inkMuted,
  },
  addr: {
    marginTop: t.addrTop,
    borderRadius: t.addrRadius,
    backgroundColor: t.addrBg,
    paddingHorizontal: t.addrPadX,
    paddingVertical: t.addrPadY,
  },
  addrName: { fontFamily: font.appHeading, fontSize: t.addrNameSize, color: t.ink },
  addrLine: {
    marginTop: t.addrLineTop,
    fontFamily: font.appBody,
    fontSize: t.addrLineSize,
    color: t.ink,
  },

  info: {
    marginTop: t.infoTop,
    marginHorizontal: t.padX,
    borderRadius: t.infoRadius,
    backgroundColor: t.infoBg,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    flexDirection: 'row',
  },
  infoCircle: {
    width: t.infoCircle,
    height: t.infoCircle,
    borderRadius: t.infoCircle / 2,
    backgroundColor: t.infoCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.infoGap,
  },
  infoTitle: {
    fontFamily: font.appHeading,
    fontSize: t.infoTitleSize,
    lineHeight: t.infoTitleLine,
    color: t.infoInk,
  },
  infoBody: {
    marginTop: t.infoBodyTop,
    fontFamily: font.appBody,
    fontSize: t.infoBodySize,
    lineHeight: t.infoBodyLine,
    color: t.infoBodyInk,
  },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginRight: t.ctaGap,
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
