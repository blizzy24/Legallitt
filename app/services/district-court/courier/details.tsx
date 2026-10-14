import { router, type Href } from 'expo-router';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  LocateFixed,
  Pencil,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcCourierDetails as t,
  dcCourierDetailsPalette as p,
  dcPricingPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_COURIER_DETAILS } from '../../../../data/districtCourt';

// District Court — courier delivery details (design/351). Measured at 2.000
// px/pt. Reached from Continue to Delivery on design/350; Continue to Book
// Delivery opens design/352. "View" on the documents row opens 350.
//
// The fields, the note and the confirmation box are real local inputs (the
// box is drawn ticked). STATIC: Use My Address, Edit Receiver, Copy All
// Details and the date/time fields open nothing — no picker is designed.
// See data/districtCourt.ts for the fee, step, receiver and clipping notes.

function Field({ label, value, icon, chevron }: { label: string; value: string; icon?: typeof Calendar; chevron?: boolean }) {
  const Icon = icon;
  return (
    <View style={styles.flex}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.input}>
        {Icon ? <Icon size={t.inputIcon} color={c.brown} strokeWidth={1.9} /> : null}
        <TextInput defaultValue={value} style={styles.inputText} />
        {chevron ? <ChevronDown size={t.inputIcon} color={c.ink} strokeWidth={2} /> : null}
      </View>
    </View>
  );
}

export default function DistrictCourierDetailsScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_COURIER_DETAILS;
  const [agree, setAgree] = useState(true);

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        backHref={'/services/district-court/documents-needed' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.step}>
          <Truck size={t.stepIcon} color={c.brownInk} strokeWidth={2} />
          <Text style={styles.stepText}>{d.step}</Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.lead}>{d.lead}</Text>

        <View style={styles.docs}>
          <Archive size={t.docsIcon} color={c.ink} strokeWidth={1.9} />
          <Text style={styles.docsText}>
            {d.docsLabel}
            <Text style={styles.brown}>{d.docsValue}</Text>
          </Text>
          <View style={styles.ready}>
            <View style={styles.readyDot} />
            <Text style={styles.readyText}>{d.ready}</Text>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/services/district-court/documents-needed' as Href)}
            style={styles.view}
          >
            <Text style={styles.viewText}>{d.view}</Text>
            <ChevronRight size={t.viewIcon} color={c.brown} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={styles.pickHead}>
          <View style={styles.flex}>
            <Text style={styles.sec}>{d.pickTitle}</Text>
            <Text style={styles.sub}>{d.pickSub}</Text>
          </View>
          <View style={styles.use}>
            <LocateFixed size={t.useIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.useText}>{d.useMine}</Text>
          </View>
        </View>
        <View style={styles.rule} />

        {d.fields.map((row, i) => (
          <View key={i} style={[styles.row, i === 0 ? styles.fieldsFirst : styles.fieldNext]}>
            {row.map(([l, v]) => (
              <Field key={l} label={l} value={v} />
            ))}
          </View>
        ))}

        <Text style={[styles.sec, styles.recvTitle]}>{d.recvTitle}</Text>
        <Text style={[styles.sub, styles.recvSub]}>{d.recvSub}</Text>
        <View style={styles.card}>
          <View style={styles.nameRow}>
            <Text style={styles.name} {...shrinkToFit(0.75)}>
              {d.recvName}
            </Text>
            <BadgeCheck size={t.badgeIcon} color={c.panel} fill={c.greenInk} strokeWidth={2} />
          </View>
          <Text style={styles.addr}>{d.recvAddr}</Text>
          <Text style={[styles.addr, styles.mob]}>
            <Text style={styles.brown}>{d.mobLabel}</Text>
            {d.mob}
          </Text>
          <View style={styles.cardRule} />
          <View style={[styles.row, styles.btns]}>
            <View style={styles.small}>
              <Pencil size={t.smallIcon} color={c.brown} strokeWidth={2} />
              <Text style={styles.smallText} {...shrinkToFit(0.8)}>
                {d.editRecv}
              </Text>
            </View>
            <View style={styles.small}>
              <Copy size={t.smallIcon} color={c.brown} strokeWidth={2} />
              <Text style={styles.smallText} {...shrinkToFit(0.8)}>
                {d.copyAll}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sec, styles.dateTitle]}>{d.dateTitle}</Text>
        <Text style={[styles.sub, styles.dateSub]}>{d.dateSub}</Text>
        <View style={[styles.row, styles.dateRow]}>
          <Field label={d.dateLabel} value={d.date} icon={Calendar} />
          <Field label={d.timeLabel} value={d.time} chevron />
        </View>

        <View style={[styles.between, styles.instr]}>
          <Text style={[styles.sec, styles.dateTitle, styles.noTop]}>{d.instrTitle}</Text>
          <Text style={styles.opt}>{d.optional}</Text>
        </View>
        <TextInput
          multiline
          placeholder={d.instrPlaceholder}
          placeholderTextColor={c.brown}
          style={[styles.input, styles.area]}
        />

        <View style={styles.fee}>
          <View style={styles.between}>
            <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
              {d.feeTitle}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {d.feeChip}
              </Text>
            </View>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeValue}>{d.fee}</Text>
            <Text style={styles.feeSub}>{d.feeSub}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => setAgree((v) => !v)}
          style={styles.agree}
        >
          <View style={[styles.box, agree && styles.boxOn]}>
            {agree && <Check size={t.boxGlyph} color={c.brown} strokeWidth={3} />}
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
          onPress={() => router.push('/services/district-court/courier/book' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
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
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },
  row: { flexDirection: 'row', gap: t.colGap },

  step: {
    marginTop: t.stepTop,
    alignSelf: 'flex-start',
    height: t.stepH,
    borderRadius: t.stepH / 2,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepGap,
  },
  stepText: { fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: { marginTop: t.leadTop, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: c.brown },

  docs: {
    marginTop: t.docsTop,
    minHeight: t.docsH,
    borderRadius: t.docsRadius,
    borderWidth: t.inputBorder,
    borderColor: p.inputBorder,
    paddingHorizontal: t.docsPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.docsGap,
  },
  docsText: { flex: 1, fontFamily: font.appSemi, fontSize: t.docsSize, color: c.ink },
  ready: {
    height: t.readyH,
    borderRadius: t.readyH / 2,
    paddingHorizontal: t.readyPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.readyGap,
  },
  readyDot: { width: t.readyDot, height: t.readyDot, borderRadius: t.readyDot / 2, backgroundColor: status.active },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: c.greenInk },
  view: { flexDirection: 'row', alignItems: 'center' },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: c.brown },

  pickHead: { marginTop: t.secTop, flexDirection: 'row', alignItems: 'center', gap: t.colGap },
  sec: { fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  sub: { fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.brown },
  use: {
    width: t.useW,
    height: t.useH,
    borderRadius: t.useRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.useGap,
    ...shadow,
  },
  useText: { textAlign: 'center', fontFamily: font.appSemi, fontSize: t.useSize, lineHeight: t.useLineHeight, color: c.brown },
  rule: { marginTop: t.ruleTop, height: t.ruleH, backgroundColor: p.rule },

  fieldsFirst: { marginTop: t.fieldsTop },
  fieldNext: { marginTop: t.fieldGap },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: c.inkWarm,
  },
  input: {
    marginTop: t.inputTop,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    borderWidth: t.inputBorder,
    borderColor: p.inputBorder,
    paddingHorizontal: t.inputPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.inputGap,
  },
  inputText: { flex: 1, minWidth: 0, alignSelf: 'stretch', fontFamily: font.appBody, fontSize: t.inputSize, color: c.ink },

  recvTitle: { marginTop: t.recvTop, fontSize: t.recvTitleSize },
  recvSub: { marginTop: t.recvSubTop },
  card: { marginTop: t.cardTop, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.panel },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: t.badgeGap },
  name: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  addr: { marginTop: t.addrTop, fontFamily: font.appBody, fontSize: t.addrSize, lineHeight: t.addrLineHeight, color: c.inkWarm },
  mob: { marginTop: t.mobTop, color: c.ink },
  cardRule: { marginTop: t.cardRuleTop, height: t.ruleH, backgroundColor: c.radioGrey },
  btns: { marginTop: t.btnsTop },
  small: {
    flex: 1,
    minWidth: 0,
    height: t.smallH,
    borderRadius: t.smallRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.smallGap,
    ...shadow,
  },
  smallText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.smallSize, color: c.brown },

  dateTitle: { marginTop: t.dateTop, fontSize: t.dateTitleSize },
  noTop: { marginTop: 0 },
  dateSub: { fontSize: t.dateSubSize },
  dateRow: { marginTop: t.dateLabelsTop },
  instr: { marginTop: t.instrTop },
  opt: { fontFamily: font.appSemi, fontSize: t.optSize, letterSpacing: t.optSpacing, color: c.brown },
  area: {
    marginTop: t.areaTop,
    height: t.areaH,
    paddingVertical: t.areaPadY,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },

  fee: { marginTop: t.feeTop, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: dcPricingPalette.tierOn },
  feeTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.feeTitleSize, color: c.ink },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, backgroundColor: c.helpGrey, justifyContent: 'center' },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  feeRow: { marginTop: t.feeRowTop, flexDirection: 'row', alignItems: 'center', gap: t.feeGap },
  feeValue: { fontFamily: font.appHeading, fontSize: t.feeSize, color: c.ink },
  feeSub: { flex: 1, fontFamily: font.appBody, fontSize: t.feeSubSize, color: c.brown },

  agree: {
    marginTop: t.agreeTop,
    borderRadius: t.cardRadius,
    borderWidth: t.inputBorder,
    borderColor: p.inputBorder,
    padding: t.cardPad,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.boxGap,
  },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.inputBorder,
    borderColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown },
  agreeText: { fontFamily: font.appSemi, fontSize: t.agreeSize, lineHeight: t.agreeLineHeight, color: c.ink },
  agreeSub: {
    marginTop: t.agreeSubTop,
    fontFamily: font.appSemi,
    fontSize: t.agreeSubSize,
    lineHeight: t.agreeSubLineHeight,
    letterSpacing: t.agreeSubSpacing,
    color: c.brown,
  },

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
  cap: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, letterSpacing: t.capSpacing, color: c.brown },
});
