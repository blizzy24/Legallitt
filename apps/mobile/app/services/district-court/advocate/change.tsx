import { AdvocateAvatar } from '../../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeQuestionMark,
  Check,
  CircleCheck,
  Copy,
  Hourglass,
  Info,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcChangeRequest as t,
  dcChangeRequestPalette as p,
  dcPricingPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../../constants/theme';
import { DC_CHANGE_REQUEST } from '../../../../data/districtCourt';

// District Court — request a new advocate (design/347). Measured at 2.000 px/pt.
// Reached from Request New Advocate on design/345. Send Request opens the
// "request sent" screen (design/348); Go Back returns to 345.
//
// The reasons, the note and the confirmation box are real local inputs; the
// first reason and the box are drawn selected. Send Request is drawn active
// and is not gated. STATIC: Copy copies nothing. The photo is an initials
// avatar, as on 300/345/346; the header avatar is the standard one.
//
// See data/districtCourt.ts for the "Advocate Accepted" header.

export default function DistrictChangeRequestScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CHANGE_REQUEST;
  const [reason, setReason] = useState<string>(d.reasons[0]);
  const [agree, setAgree] = useState(true);
  const back = () =>
    router.canGoBack() ? router.back() : router.replace('/services/district-court/advocate/decide' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/advocate/decide' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.top]}>
          <View style={styles.row}>
            <ArrowLeftRight size={t.topIcon} color={c.brown} strokeWidth={2} />
            <Text style={styles.topTitle} {...shrinkToFit(0.8)}>
              {d.topTitle}
            </Text>
          </View>
          <Text style={styles.topBody}>{d.topBody}</Text>
          <View style={[styles.row, styles.topSub]}>
            <ShieldCheck size={t.subIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.sub}>{d.topSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <View style={styles.pill}>
              <Text style={styles.capsText} {...shrinkToFit(0.8)}>
                {d.assigned}
              </Text>
            </View>
            <View style={styles.row}>
              <CircleCheck size={t.verifiedIcon} color={c.card} fill={c.greenInk} strokeWidth={2.4} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                {d.verified}
              </Text>
            </View>
          </View>
          <View style={styles.adv}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.photo}><Text style={styles.photoText}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <View style={[styles.row, styles.loc]}>
                <MapPin size={t.locIcon} color={c.inkWarm} strokeWidth={2} />
                <Text style={styles.sub}>{d.loc}</Text>
              </View>
            </View>
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => (
              <View key={ch} style={styles.chip}>
                <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                  {ch}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.caseTitle}
            </Text>
            <View style={styles.row}>
              <Text style={styles.id}>{d.id}</Text>
              <Copy size={t.idIcon} color={c.brown} strokeWidth={2} />
            </View>
          </View>
          {d.grid.map((r, i) => (
            <View key={i} style={[styles.gridRow, i === 0 ? styles.gridFirst : styles.gridNext]}>
              {r.map(([l, v], j) => (
                <View key={l} style={styles.flex}>
                  <Text style={styles.label}>{l}</Text>
                  <Text style={[styles.value, i === 0 && j === 0 && styles.valueStrong]}>{v}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.next]}>
          <Text style={styles.whyTitle}>{d.whyTitle}</Text>
          <Text style={[styles.sub, styles.whySub]}>{d.whySub}</Text>
          {d.reasons.map((r, i) => {
            const on = reason === r;
            return (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setReason(r)}
                style={[styles.reason, i === 0 ? styles.reasonFirst : styles.reasonNext, on && styles.reasonOn]}
              >
                <Text style={[styles.reasonText, on && styles.reasonTextOn]}>{r}</Text>
                <View style={[styles.radio, on && styles.radioOn]}>
                  {on && <Check size={t.radioGlyph} color={ink.onBrand} strokeWidth={3} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.moreCard]}>
          <View style={styles.between}>
            <Text style={[styles.title, styles.moreTitle]} {...shrinkToFit(0.8)}>
              {d.moreTitle}
            </Text>
            <View style={styles.opt}>
              <Text style={styles.optText}>{d.optional}</Text>
            </View>
          </View>
          <Text style={[styles.sub, styles.moreSub]}>{d.moreSub}</Text>
          <TextInput
            multiline
            placeholder={d.morePlaceholder}
            placeholderTextColor={c.inkWarm}
            style={styles.area}
          />
          <View style={[styles.row, styles.warn]}>
            <Info size={t.warnIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={[styles.sub, styles.flex]}>{d.warn}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.nextCard]}>
          <View style={styles.row}>
            <View style={styles.nextDisc}>
              <BadgeQuestionMark size={t.nextGlyph} color={c.brownInk} strokeWidth={2} />
            </View>
            <Text style={styles.nextTitle} {...shrinkToFit(0.8)}>
              {d.nextTitle}
            </Text>
          </View>
          <Text style={[styles.topBody, styles.nextBody]}>{d.nextBody}</Text>
          <View style={[styles.row, styles.nextNote]}>
            <Hourglass size={t.subIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.nextNoteText}>{d.nextNote}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => setAgree((v) => !v)}
          style={[styles.card, styles.agreeCard, styles.agree]}
        >
          <View style={[styles.box, agree && styles.boxOn]}>
            {agree && <Check size={t.boxGlyph} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.agreeText}>{d.agree}</Text>
            <Text style={[styles.sub, styles.agreeSub]}>{d.agreeSub}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/advocate/change-sent' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={back} style={styles.back}>
          <Text style={styles.backText}>{d.back}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  hdrSub: { fontSize: t.hdrSubSize },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.subGap },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.gridGap },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  top: { marginTop: t.firstTop, backgroundColor: c.peachSoft },
  next: { marginTop: t.cardGap },
  moreCard: { marginTop: t.moreTop },
  agreeCard: { marginTop: t.agreeTop },
  topTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.topTitleSize, lineHeight: t.topTitleLineHeight, color: c.ink },
  topBody: { marginTop: t.topBodyTop, fontFamily: font.appBody, fontSize: t.topBodySize, lineHeight: t.topBodyLineHeight, color: c.ink },
  topSub: { marginTop: t.topSubTop },
  sub: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },

  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
    flexShrink: 1,
  },
  capsText: { fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.inkWarm },
  verifiedText: { fontFamily: font.appSemi, fontSize: t.verifiedSize, letterSpacing: t.verifiedSpacing, color: c.greenInk },
  adv: { marginTop: t.advTop, flexDirection: 'row', alignItems: 'center', gap: t.photoGap },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoTextSize, color: ink.onBrand },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  loc: { marginTop: t.locTop },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.panel,
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: c.inkWarm },

  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  id: { fontFamily: font.appSemi, fontSize: t.idSize, letterSpacing: t.idSpacing, color: c.brown },
  gridRow: { flexDirection: 'row', gap: t.gridGap },
  gridFirst: { marginTop: t.gridTop },
  gridNext: { marginTop: t.gridRowGap },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: c.inkWarm,
  },
  value: { fontFamily: font.appBody, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },
  valueStrong: { fontFamily: font.appSemi },

  whyTitle: { fontFamily: font.appSemi, fontSize: t.whyTitleSize, lineHeight: t.whyTitleLineHeight, color: c.ink },
  whySub: { marginTop: t.whySubTop },
  reason: {
    minHeight: t.reasonH,
    borderRadius: t.reasonRadius,
    paddingHorizontal: t.reasonPadX,
    paddingVertical: t.reasonPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.gridGap,
    ...shadow,
  },
  reasonFirst: { marginTop: t.reasonsTop },
  reasonNext: { marginTop: t.reasonGap },
  reasonOn: { backgroundColor: p.reasonOn },
  reasonText: { flex: 1, fontFamily: font.appBody, fontSize: t.reasonSize, lineHeight: t.reasonLineHeight, color: c.inkWarm },
  reasonTextOn: { fontFamily: font.appSemi, color: c.ink },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: c.brown },

  moreTitle: { fontSize: t.moreTitleSize },
  opt: {
    height: t.optH,
    borderRadius: t.optH / 2,
    paddingHorizontal: t.optPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  optText: { fontFamily: font.appSemi, fontSize: t.optSize, letterSpacing: t.optSpacing, color: c.inkWarm },
  moreSub: { marginTop: t.moreSubTop },
  area: {
    marginTop: t.areaTop,
    height: t.areaH,
    borderRadius: t.areaRadius,
    padding: t.areaPad,
    backgroundColor: c.panel,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },
  warn: { marginTop: t.warnTop, gap: t.warnGap },

  nextCard: { backgroundColor: dcPricingPalette.tierOn },
  nextDisc: {
    width: t.nextDisc,
    height: t.nextDisc,
    borderRadius: t.nextDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTitle: { flexShrink: 1, marginLeft: t.nextTitleInset, fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop },
  nextNote: { marginTop: t.nextNoteTop },
  nextNoteText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nextNoteSize, color: c.inkWarm },

  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: t.boxGap },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown },
  agreeText: { fontFamily: font.appSemi, fontSize: t.agreeSize, lineHeight: t.agreeLineHeight, color: c.ink },
  agreeSub: { marginTop: t.agreeSubTop },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: c.page },
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
  back: { marginTop: t.backTop, alignSelf: 'center' },
  backText: { fontFamily: font.appSemi, fontSize: t.backSize, lineHeight: t.backLineHeight, color: c.inkWarm },
});
