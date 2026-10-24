import { AdvocateAvatar } from '../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import { Archive, ArrowRight, BadgeCheck, BellRing, Check, MessageSquare, Phone } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcPrep as t, font, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { DC_PREP } from '../../../data/districtCourt';

// District Court — case preparation (design/313). Measured at 2.000 px/pt.
//
// ⚠ Unreachable by design and cross-service — see DC_PREP. Conflicts 4, 5 and
// 6 are commented there.
//
// The header avatar is drawn as the advocate's photo with an online dot; it is
// the standard avatar with the dot here. The top card's decorative circle is
// not drawn — no asset.
//
// Wiring: View Case opens design/314 (Court Fee) — the next screen the batch
// draws; nothing on 313 names it. Chat opens the advocate chat (design/301,
// cross-service); Call dials nothing.

export default function DistrictCourtCasePreparationScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_PREP;

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        online
        padTop={t.hdrPadTop}
        backHref={'/(tabs)/home' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View style={styles.between}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.pill}</Text>
            </View>
            <Text style={styles.caps}>{d.desk}</Text>
          </View>
          <Text style={styles.topTitle}>{d.h1}</Text>
          <Text style={styles.topSub}>{d.sub}</Text>
          <View style={styles.note}>
            <View style={styles.noteDisc}>
              <Archive size={t.noteGlyph} color={c.greenInk} strokeWidth={1.9} />
            </View>
            <Text style={styles.noteText}>{d.note}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.sum]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.sumLabel}</Text>
            <Text style={styles.ref}>{d.ref}</Text>
          </View>
          <Text style={styles.sumTitle} {...shrinkToFit(0.8)}>
            {d.parties}
          </Text>
          <View style={styles.chips}>
            {d.chips.map((ch) => (
              <View key={ch} style={styles.chip}>
                <Text style={styles.chipText}>{ch}</Text>
              </View>
            ))}
          </View>
          <View style={styles.adv}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.advDisc}><Text style={styles.advInitials}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.advName}>{d.adv}</Text>
              <Text style={styles.advSub}>{d.advRole}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.latest]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <BellRing size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.latestTitle}</Text>
            </View>
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>{d.latestTag}</Text>
            </View>
          </View>
          <Text style={styles.body}>{d.latest}</Text>
          <Text style={styles.date}>{d.latestDate}</Text>
        </View>

        <View style={styles.next}>
          <View style={styles.head}>
            <ArrowRight size={t.nextIcon} color={c.inkWarm} strokeWidth={2.2} />
            <Text style={styles.caps}>{d.nextLabel}</Text>
          </View>
          <Text style={styles.nextTitle}>{d.nextTitle}</Text>
          <Text style={[styles.body, styles.nextBody]}>{d.next}</Text>
          <View style={styles.nextFoot}>
            <BadgeCheck size={t.nextFootIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.nextFootText}>{d.nextFoot}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.prog]}>
          <View style={styles.between}>
            <Text style={styles.headText}>{d.progTitle}</Text>
            <Text style={styles.caps}>{d.stage}</Text>
          </View>
          <View style={styles.steps}>
            {d.steps.map((s, i) => {
              const last = i === d.steps.length - 1;
              return (
                <View key={s.title} style={[styles.step, !last && styles.stepSpaced]}>
                  <View style={styles.railCol}>
                    {s.state === 'done' && (
                      <View style={[styles.disc, styles.discDone]}>
                        <Check size={t.discGlyph} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    )}
                    {s.state === 'current' && (
                      <View style={styles.ring}>
                        <View style={[styles.disc, styles.discCurrent]}>
                          <View style={styles.dotCurrent} />
                        </View>
                      </View>
                    )}
                    {s.state === 'waiting' && (
                      <View style={[styles.disc, styles.discWait]}>
                        <View style={styles.dotWait} />
                      </View>
                    )}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.stepHead}>
                      <Text style={[styles.stepTitle, s.state === 'waiting' && styles.stepTitleWait]}>{s.title}</Text>
                      {'chip' in s && (
                        <View style={styles.stageChip}>
                          <Text style={styles.stageChipText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.stepDesc, s.state === 'waiting' && styles.stepDescWait]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.qa]}>
          <Text style={styles.headText}>{d.qaTitle}</Text>
          <Text style={styles.qaSub}>{d.qaSub}</Text>
          <View style={styles.qaRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.qaBtn}
            >
              <MessageSquare size={t.qaBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qaBtnText}>{d.chat}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.qaBtn}>
              <Phone size={t.qaBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qaBtnText}>{d.call}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/court-fee' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },

  top: {
    marginTop: t.topTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.topPadTop,
    paddingBottom: t.topPadBottom,
  },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.brownInk },
  topTitle: { marginTop: t.topTitleTop, fontFamily: font.appSemi, fontSize: t.topTitleSize, lineHeight: t.topTitleLineHeight, color: c.ink },
  topSub: { marginTop: t.topSubTop, fontFamily: font.appBody, fontSize: t.topSubSize, lineHeight: t.topSubLineHeight, color: c.inkWarm },
  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.noteGap,
  },
  noteDisc: {
    width: t.noteDisc,
    height: t.noteDisc,
    borderRadius: t.noteDisc / 2,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.ink },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  sum: { paddingTop: t.sumPadTop, paddingBottom: t.sumPadBottom },
  ref: { fontFamily: font.appSemi, fontSize: t.capsSize + 1, color: c.inkWarm },
  sumTitle: { marginTop: t.sumTitleTop, fontFamily: font.appSemi, fontSize: t.sumTitleSize, lineHeight: t.sumTitleLineHeight, color: c.ink },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.inkWarm },
  adv: { marginTop: t.advTop, flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  advDisc: { width: t.advDisc, height: t.advDisc, borderRadius: t.advDisc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  advInitials: { fontFamily: font.appBody, fontSize: t.advInitials, color: c.brownInk },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },

  latest: { paddingTop: t.latestPadTop, paddingBottom: t.latestPadBottom },
  head: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  tag: {
    height: t.tagH,
    borderRadius: t.tagH / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.headGap - 1,
  },
  tagDot: { width: t.tagDot, height: t.tagDot, borderRadius: t.tagDot / 2, backgroundColor: c.greenInk },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.greenInk },
  body: { marginTop: t.bodyTop, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.ink },
  date: { marginTop: t.dateTop, fontFamily: font.appBody, fontSize: t.dateSize, lineHeight: t.dateLineHeight, color: c.inkWarm },

  next: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPadX,
    paddingRight: t.nextPadRight,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
  },
  nextTitle: { marginTop: t.nextTitleTop, fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop, color: c.inkWarm },
  nextFoot: { marginTop: t.nextFootTop, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  nextFootText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nextFootSize, lineHeight: t.nextFootLineHeight, color: c.inkWarm },

  prog: { paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepSpaced: { minHeight: t.stepPitch },
  railCol: { width: t.ring, alignItems: 'center', paddingTop: (t.stepTitleLineHeight - t.disc) / 2 },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: c.greenInk },
  ring: {
    marginTop: (t.disc - t.ring) / 2,
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCurrent: { backgroundColor: c.brown },
  dotCurrent: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.card },
  discWait: { backgroundColor: c.helpGrey },
  dotWait: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.tagMuted },
  stepHead: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: t.stepGap },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepTitleWait: { color: c.inkWarm },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },
  stepDescWait: { color: c.inkMuted },
  stageChip: { height: t.stageChipH, borderRadius: t.stageChipRadius, paddingHorizontal: t.stageChipPadX, backgroundColor: c.peach, justifyContent: 'center' },
  stageChipText: { fontFamily: font.appSemi, fontSize: t.stageChipSize, color: c.brownInk },

  qa: { paddingTop: t.qaPadTop, paddingBottom: t.qaPadBottom },
  qaSub: { fontFamily: font.appBody, fontSize: t.qaSubSize, lineHeight: t.qaSubLineHeight, color: c.inkWarm },
  qaRow: { marginTop: t.qaBtnTop, flexDirection: 'row', gap: t.qaBtnGap },
  qaBtn: {
    flex: 1,
    height: t.qaBtnH,
    borderRadius: t.qaBtnRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.qaBtnIconGap,
  },
  qaBtnText: { fontFamily: font.appSemi, fontSize: t.qaBtnSize, color: c.ink },

  bar: { backgroundColor: c.page, borderTopWidth: 1, borderTopColor: c.panel, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  btn: {
    ...shadow,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
});
