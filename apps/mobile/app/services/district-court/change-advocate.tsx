import { AdvocateAvatar } from '../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  CircleCheck,
  FolderLock,
  Info,
  LockKeyholeOpen,
  MessageSquare,
  Phone,
  ShieldCheck,
  Speech,
  UserCog,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcChange as t, font, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { DC_CHANGE } from '../../../data/districtCourt';

// District Court — change advocate (design/329). Measured at 2.000 px/pt.
// Reached from the red "Change Advocate??" note on design/328 (conflict 7).
//
// Conflicts 2, 4 and 6 are commented on DC_CHANGE: Continue opens the shared
// ₹40,680 payment for a ₹12,000 fee (₹1,500 before the 14 Oct re-issue).
//
// Local only: the reason radios and the "Tell us more" box. Nothing is
// submitted. Chat opens the advocate chat (design/301); Call dials nothing.

const HOW_ICON = { lock: LockKeyholeOpen, admin: UserCog, talk: Speech, folder: FolderLock } as const;

export default function DistrictCourtChangeAdvocateScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CHANGE;
  const [reason, setReason] = useState(0);
  const [more, setMore] = useState('');
  const toPay = () => router.push('/services/district-court/change-advocate-payment' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/next-hearing' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.elig}>
          <View style={styles.eligDot} />
          <Text style={styles.eligText} {...shrinkToFit(0.75)}>
            {d.elig}
          </Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.body}</Text>
        <View style={styles.feeNote}>
          <Info size={t.feeNoteIcon} color={c.inkWarm} strokeWidth={2} />
          <Text style={styles.feeNoteText}>{d.feeNote}</Text>
        </View>

        <View style={[styles.card, styles.adv, styles.first]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.curLabel}</Text>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.active}</Text>
            </View>
          </View>
          <View style={styles.advRow}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.photo}><Text style={styles.photoText}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.advName} {...shrinkToFit(0.8)}>
                {d.adv}
              </Text>
              <Text style={styles.advSub}>{d.advSub}</Text>
            </View>
          </View>
          <View style={styles.btns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.btn}
            >
              <MessageSquare size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.chat}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.btn}>
              <Phone size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.call}</Text>
            </View>
          </View>
          <View style={styles.link}>
            <ShieldCheck size={t.linkIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.linkText}>{d.linked}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.stage]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.stageLabel}</Text>
            <Text style={styles.stageMeta}>{d.stageMeta}</Text>
          </View>
          <View style={styles.tiles}>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>{d.firstLabel}</Text>
              <View style={styles.tileValueRow}>
                <CircleCheck size={t.tileIcon} color={c.greenInk} strokeWidth={2} />
                <Text style={[styles.tileValue, styles.greenText]}>{d.firstValue}</Text>
              </View>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>{d.nextLabel}</Text>
              <Text style={[styles.tileValue, styles.tileValueTop]}>{d.nextValue}</Text>
            </View>
          </View>
          <Text style={styles.stageNote}>{d.stageNote}</Text>
        </View>

        <View style={[styles.card, styles.why]}>
          <Text style={styles.whyTitle}>{d.whyTitle}</Text>
          <Text style={styles.whySub}>{d.whySub}</Text>
          <View style={styles.opts}>
            {d.reasons.map((r, i) => (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ checked: reason === i }}
                onPress={() => setReason(i)}
                style={[styles.opt, reason === i && styles.optOn]}
              >
                <View style={[styles.radio, reason === i && styles.radioOn]} />
                <Text style={styles.optText}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.more}>{d.moreTitle}</Text>
          <TextInput
            value={more}
            onChangeText={setMore}
            placeholder={d.morePlaceholder}
            placeholderTextColor={c.inkMuted}
            multiline
            style={styles.area}
          />
        </View>

        <View style={[styles.card, styles.fee]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.feeLabel}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{d.feeTag}</Text>
            </View>
          </View>
          <View style={styles.amtRow}>
            <Text style={styles.amount}>{d.fee}</Text>
            <Text style={styles.amtSub}>{d.feeSub}</Text>
          </View>
          <View style={styles.feeBox}>
            <Text style={styles.feeBoxText}>{d.feeBox}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.how]}>
          <Text style={styles.howTitle}>{d.howTitle}</Text>
          <View style={styles.howItems}>
            {d.how.map((h) => {
              const Icon = HOW_ICON[h.icon];
              return (
                <View key={h.title} style={styles.howItem}>
                  <View style={styles.howDisc}>
                    <Icon size={t.howGlyph} color={c.inkWarm} strokeWidth={2} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.howItemTitle}>{h.title}</Text>
                    <Text style={styles.howBody}>{h.body}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toPay} style={styles.cta}>
          <View style={styles.ctaSide} />
          <Text style={styles.ctaText}>{d.cta}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <CircleCheck size={t.footIcon} color={c.greenInk} strokeWidth={2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.btnGap },
  hdrSub: { fontSize: t.hdrSubSize },
  greenText: { color: c.greenInk },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },

  elig: {
    marginTop: t.eligTop,
    marginLeft: t.cardLeft - t.padX,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.eligH,
    borderRadius: t.eligH / 2,
    paddingHorizontal: t.eligPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.eligGap,
  },
  eligDot: { width: t.eligDot, height: t.eligDot, borderRadius: t.eligDot / 2, backgroundColor: c.greenInk },
  eligText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.eligSize, color: c.greenInk },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },
  feeNote: { marginTop: t.feeNoteTop, flexDirection: 'row', alignItems: 'center', gap: t.feeNoteGap },
  feeNoteText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.feeNoteSize, lineHeight: t.feeNoteLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  first: { marginTop: t.firstTop },
  adv: { paddingTop: t.advPadTop, paddingBottom: t.advPadBottom },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.greenBanner,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.eligGap - 1,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.greenInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },
  advRow: { marginTop: t.advRowTop, flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  photo: { width: t.photo, height: t.photo, borderRadius: t.photo / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoInitials, color: ink.onBrand },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },
  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },
  link: {
    marginTop: t.linkTop,
    borderRadius: t.linkRadius,
    backgroundColor: c.page,
    paddingHorizontal: t.linkPadX,
    paddingVertical: t.linkPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.linkGap,
  },
  linkText: { flex: 1, fontFamily: font.appBody, fontSize: t.linkSize, lineHeight: t.linkLineHeight, color: c.ink },

  stage: { paddingTop: t.stagePadTop, paddingBottom: t.stagePadBottom },
  stageMeta: { fontFamily: font.appSemi, fontSize: t.stageMetaSize, color: c.inkWarm },
  tiles: { marginTop: t.tilesTop, flexDirection: 'row', gap: t.tileGap },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.tileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.tilePadX,
    paddingTop: t.tilePadTop,
    paddingBottom: t.tilePadBottom,
  },
  tileLabel: { fontFamily: font.appBody, fontSize: t.tileLabelSize, lineHeight: t.tileLabelLineHeight, color: c.inkWarm },
  tileValueRow: { marginTop: t.tileValueTop, flexDirection: 'row', alignItems: 'center', gap: t.eligGap },
  tileValue: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tileValueSize, lineHeight: t.tileValueLineHeight, color: c.ink },
  tileValueTop: { marginTop: t.tileValueTop },
  stageNote: { marginTop: t.stageNoteTop, fontFamily: font.appBody, fontSize: t.stageNoteSize, lineHeight: t.stageNoteLineHeight, color: c.ink },

  why: { paddingTop: t.whyPadTop, paddingBottom: t.whyPadBottom },
  whyTitle: { fontFamily: font.appSemi, fontSize: t.whyTitleSize, lineHeight: t.whyTitleLineHeight, color: c.ink },
  whySub: { fontFamily: font.appBody, fontSize: t.whySubSize, lineHeight: t.whySubLineHeight, color: c.ink },
  opts: { marginTop: t.optsTop, gap: t.optGap },
  opt: {
    minHeight: t.optMinH,
    borderRadius: t.optRadius,
    backgroundColor: c.page,
    paddingHorizontal: t.optPadX,
    paddingVertical: t.optPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.optGap2,
  },
  optOn: { backgroundColor: c.panel },
  radio: { width: t.radio, height: t.radio, borderRadius: t.radio / 2, backgroundColor: c.radioGrey },
  radioOn: { borderWidth: t.radioBorder, borderColor: c.brown, backgroundColor: c.card },
  optText: { flex: 1, fontFamily: font.appBody, fontSize: t.optSize, lineHeight: t.optLineHeight, color: c.ink },
  more: { marginTop: t.moreTop, fontFamily: font.appSemi, fontSize: t.moreSize, lineHeight: t.moreLineHeight, color: c.ink },
  area: {
    marginTop: t.areaTop,
    minHeight: t.areaH,
    borderRadius: t.areaRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.areaPadX,
    paddingVertical: t.areaPadY,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },

  fee: { paddingTop: t.feePadTop, paddingBottom: t.feePadBottom },
  tag: { height: t.tagH, borderRadius: t.tagH / 2, paddingHorizontal: t.tagPadX, backgroundColor: c.peach, justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.brownInk },
  amtRow: { marginTop: t.amtTop, flexDirection: 'row', alignItems: 'baseline', gap: t.amtGap },
  amount: { fontFamily: font.appHeading, fontSize: t.amtSize, lineHeight: t.amtLineHeight, color: c.ink },
  amtSub: { fontFamily: font.appBody, fontSize: t.amtSubSize, color: c.inkWarm },
  feeBox: {
    marginTop: t.feeBoxTop,
    borderRadius: t.feeBoxRadius,
    backgroundColor: c.page,
    paddingHorizontal: t.feeBoxPadX,
    paddingVertical: t.feeBoxPadY,
  },
  feeBoxText: { fontFamily: font.appBody, fontSize: t.feeBoxSize, lineHeight: t.feeBoxLineHeight, color: c.inkWarm },

  how: { paddingTop: t.howPadTop, paddingBottom: t.howPadBottom },
  howTitle: { fontFamily: font.appSemi, fontSize: t.howTitleSize, lineHeight: t.howTitleLineHeight, color: c.ink },
  howItems: { marginTop: t.howItemsTop, gap: t.howGap },
  howItem: { flexDirection: 'row', alignItems: 'flex-start', gap: t.howGap2 },
  howDisc: { width: t.howDisc, height: t.howDisc, borderRadius: t.howDisc / 2, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  howItemTitle: { fontFamily: font.appSemi, fontSize: t.howTitleItemSize, lineHeight: t.howTitleItemLineHeight, color: c.ink },
  howBody: { fontFamily: font.appBody, fontSize: t.howBodySize, lineHeight: t.howBodyLineHeight, color: c.inkWarm },

  bar: { backgroundColor: c.card, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    paddingHorizontal: t.ctaPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaSide: { width: t.ctaIcon },
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});
