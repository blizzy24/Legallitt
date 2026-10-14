import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleCheck,
  Clock,
  Gavel,
  MessageSquare,
  NotebookText,
  Phone,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcNextHearing as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_NEXT_HEARING } from '../../../data/districtCourt';

// District Court — next hearing (design/328). Measured at 2.000 px/pt.
//
// ⚠⚠ CONFLICT 7: the red "Change Advocate??" under View Case is an unfinished
// designer's note left in the export. Rendered as drawn and flagged — and, as
// the only drawn link to design/329, wired to the Change Advocate screen.
//
// Wiring: View Case opens design/327 (Case Overview). Chat with Adv. opens the
// advocate chat (design/301). STATIC: Call Adv. dials nothing.

export default function DistrictCourtNextHearingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_NEXT_HEARING;

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        backHref={'/services/district-court/case-overview' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.scrollBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={styles.bannerDisc}>
            <CalendarDays size={t.bannerGlyph} color={ink.onBrand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{d.bannerTitle}</Text>
            <Text style={styles.bannerBody}>{d.bannerBody}</Text>
            <Text style={styles.bannerSub}>{d.bannerSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.nextLabel}</Text>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.pill}</Text>
            </View>
          </View>
          <Text style={styles.date}>{d.date}</Text>
          <View style={styles.timeRow}>
            <Clock size={t.timeIcon} color={c.brownLift} strokeWidth={2.2} />
            <Text style={styles.time}>{d.time}</Text>
          </View>
          <View style={styles.grid}>
            {d.grid.map(([l, v]) => (
              <View key={l} style={styles.gridCell}>
                <Text style={styles.gridLabel}>{l}</Text>
                <Text style={styles.gridValue} {...shrinkToFit(0.75)}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.confirm}>
            <BadgeCheck size={t.confirmIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
            <Text style={styles.confirmText}>{d.confirm}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.adv]}>
          <View style={styles.advDisc}>
            <Gavel size={t.advGlyph} color={c.inkWarm} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.caps}>{d.advLabel}</Text>
            <Text style={styles.advName} {...shrinkToFit(0.8)}>
              {d.adv}
            </Text>
            <Text style={styles.advSub}>{d.advSub}</Text>
          </View>
          <View style={styles.ver}>
            <Text style={styles.verText}>{d.verified}</Text>
          </View>
        </View>

        <View style={styles.ns}>
          <View style={styles.head}>
            <CircleCheck size={t.nsIcon} color={c.brownLift} strokeWidth={2} />
            <Text style={[styles.nsTitle, styles.brownLift]}>{d.nsTitle}</Text>
          </View>
          <Text style={styles.nsBold}>{d.nsBold}</Text>
          <Text style={styles.nsBody}>{d.ns}</Text>
        </View>

        <View style={[styles.card, styles.note]}>
          <View style={styles.head}>
            <NotebookText size={t.noteIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.nsTitle}>{d.noteTitle}</Text>
          </View>
          <Text style={styles.noteBody}>{d.note}</Text>
        </View>

        <View style={[styles.card, styles.prog]}>
          <Text style={styles.caps}>{d.progLabel}</Text>
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
                      <View style={[styles.ringDisc]}>
                        <View style={styles.dotCurrent} />
                      </View>
                    )}
                    {s.state === 'waiting' && (
                      <View style={[styles.disc, styles.discWait]}>
                        <View style={styles.dotWait} />
                      </View>
                    )}
                    {!last && <View style={styles.rail} />}
                  </View>
                  <View style={[styles.between, styles.flex]}>
                    <Text
                      style={[
                        styles.stepTitle,
                        s.state === 'current' && styles.brownLift,
                        s.state === 'waiting' && styles.waitText,
                      ]}
                    >
                      {s.title}
                    </Text>
                    <Text
                      style={[
                        styles.stepRight,
                        s.state === 'done' && styles.greenText,
                        s.state === 'current' && styles.brownLift,
                      ]}
                      {...shrinkToFit(0.75)}
                    >
                      {s.right}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.btns}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/high-court/chat' as Href)}
            style={styles.btn}
          >
            <MessageSquare size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.btnText} {...shrinkToFit(0.8)}>
              {d.chat}
            </Text>
          </Pressable>
          {/* Static — no call is placed. */}
          <View style={styles.btn}>
            <Phone size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.btnText}>{d.call}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/case-overview' as Href)}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{d.cta}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>

        {/* ⚠ CONFLICT 7 — a designer's note drawn in red, rendered as drawn. */}
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/services/district-court/change-advocate' as Href)}
        >
          <Text style={styles.changeNote}>{d.changeNote}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.stepGap },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.nsGap },
  brownLift: { color: c.brownLift },
  greenText: { color: c.greenInk },
  waitText: { color: c.inkWarm },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },

  banner: {
    marginTop: t.bannerTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peach,
    paddingHorizontal: t.bannerPadX,
    paddingTop: t.bannerPadTop,
    paddingBottom: t.bannerPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.bannerGap,
  },
  bannerDisc: { width: t.bannerDisc, height: t.bannerDisc, borderRadius: t.bannerDisc / 2, backgroundColor: c.brown, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: font.appSemi, fontSize: t.bannerTitleSize, lineHeight: t.bannerTitleLineHeight, color: c.ink },
  bannerBody: { marginTop: t.bannerBodyTop, fontFamily: font.appBody, fontSize: t.bannerBodySize, lineHeight: t.bannerBodyLineHeight, color: c.inkWarm },
  bannerSub: { marginTop: t.bannerSubTop, fontFamily: font.appBody, fontSize: t.bannerSubSize, lineHeight: t.bannerSubLineHeight, color: c.ink },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  next: { paddingTop: t.nextPadTop, paddingBottom: t.nextPadBottom },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },
  date: { marginTop: t.dateTop, fontFamily: font.appSemi, fontSize: t.dateSize, lineHeight: t.dateLineHeight, color: c.ink },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: t.timeGap },
  time: { fontFamily: font.appSemi, fontSize: t.timeSize, lineHeight: t.timeLineHeight, color: c.brownLift },
  grid: {
    marginTop: t.gridTop,
    borderRadius: t.gridRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.gridPadX,
    paddingVertical: t.gridPadY,
    flexDirection: 'row',
    gap: t.gridGap,
  },
  gridCell: { flexShrink: 1 },
  gridLabel: { fontFamily: font.appBody, fontSize: t.gridLabelSize, lineHeight: t.gridLabelLineHeight, color: c.inkWarm },
  gridValue: { fontFamily: font.appSemi, fontSize: t.gridValueSize, lineHeight: t.gridValueLineHeight, color: c.ink },
  confirm: { marginTop: t.confirmTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.confirmGap },
  confirmText: { flex: 1, fontFamily: font.appBody, fontSize: t.confirmSize, lineHeight: t.confirmLineHeight, color: c.inkWarm },

  adv: { paddingHorizontal: t.advPadX, paddingVertical: t.advPadY, flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  advDisc: { width: t.advDisc, height: t.advDisc, borderRadius: t.advDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },
  ver: { height: t.verH, borderRadius: t.verH / 2, paddingHorizontal: t.verPadX, backgroundColor: c.panel, justifyContent: 'center' },
  verText: { fontFamily: font.appSemi, fontSize: t.verSize, color: c.inkWarm },

  ns: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.nsPadX,
    paddingTop: t.nsPadTop,
    paddingBottom: t.nsPadBottom,
  },
  nsTitle: { fontFamily: font.appSemi, fontSize: t.nsTitleSize, lineHeight: t.nsTitleLineHeight, color: c.ink },
  nsBold: { marginTop: t.nsBoldTop, fontFamily: font.appSemi, fontSize: t.nsBoldSize, lineHeight: t.nsBoldLineHeight, color: c.ink },
  nsBody: { marginTop: t.nsBodyTop, fontFamily: font.appBody, fontSize: t.nsBodySize, lineHeight: t.nsBodyLineHeight, color: c.inkWarm },

  note: { paddingHorizontal: t.notePadX, paddingTop: t.notePadTop, paddingBottom: t.notePadBottom },
  noteBody: { marginTop: t.noteBodyTop, fontFamily: font.appBody, fontSize: t.noteBodySize, lineHeight: t.noteBodyLineHeight, color: c.inkWarm },

  prog: { paddingHorizontal: t.progPadX, paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepSpaced: { minHeight: t.stepPitch },
  railCol: { width: t.ring, alignItems: 'center' },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: status.active },
  ringDisc: { width: t.ring, height: t.ring, borderRadius: t.ring / 2, backgroundColor: c.brown, alignItems: 'center', justifyContent: 'center' },
  dotCurrent: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.card },
  discWait: { backgroundColor: c.radioGrey },
  dotWait: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.tagMuted },
  rail: { flex: 1, width: t.rail, backgroundColor: c.radioGrey },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, color: c.ink },
  stepRight: { flexShrink: 1, textAlign: 'right', fontFamily: font.appBody, fontSize: t.stepRightSize, color: c.inkWarm },

  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    ...shadow,
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },

  cta: {
    ...shadow,
    marginTop: t.ctaTop,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  changeNote: { marginTop: t.noteRedTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.noteRedSize, color: c.noteRed },
});
