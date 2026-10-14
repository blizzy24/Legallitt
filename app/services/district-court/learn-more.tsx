import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Banknote,
  Bell,
  Building,
  Check,
  CircleQuestionMark,
  Clock,
  Ellipsis,
  Flag,
  FolderOpen,
  Gavel,
  HeartCrack,
  Info,
  Scale,
  Shield,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  UsersRound,
  Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcInfo as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_INFO } from '../../../data/districtCourt';

// District Court — information guide (design/339). Measured at 2.000 px/pt.
// Reached from Learn More on design/338.
//
// Both photographs (the court interior and the phone in hand) are neutral blocks
// at the drawn size — no assets exist. The progression list is a drawing, not
// the client's case status.
//
// Wiring: Start New Case opens design/340; "Back to District Court
// Representation" returns to design/338.

const MATTER_ICON = {
  scale: Scale,
  shield: Shield,
  family: UsersRound,
  heart: HeartCrack,
  building: Building,
  money: Banknote,
  bag: ShoppingBag,
  more: Ellipsis,
} as const;
const OPT_ICON = { clock: Clock, zap: Zap } as const;

export default function DistrictCourtInfoScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_INFO;
  const back = () =>
    router.canGoBack() ? router.back() : router.replace('/services/district-court' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/district-court' as Href} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.intro]}>
          <View style={styles.caps}>
            <Gavel size={t.capsIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.capsText}>{d.caps}</Text>
          </View>
          <Text style={styles.h1}>{d.h1}</Text>
          <Text style={styles.body}>{d.body}</Text>
          <View style={styles.art}>
            <View style={styles.pill}>
              <ShieldCheck size={t.pillIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
              <Text style={styles.pillText}>{d.artPill}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sec, styles.secFirst]}>{d.mattersTitle}</Text>
        <Text style={styles.secSub}>{d.mattersSub}</Text>
        <View style={styles.grid}>
          {d.matters.map((m) => {
            const Icon = MATTER_ICON[m.icon];
            return (
              <View key={m.title} style={[styles.card, styles.tile]}>
                <View style={styles.tileIcon}>
                  <Icon size={t.tileGlyph} color={c.inkWarm} strokeWidth={1.9} />
                </View>
                <Text style={styles.tileTitle} {...shrinkToFit(0.8)}>
                  {m.title}
                </Text>
                <Text style={styles.tileBody}>{m.body}</Text>
              </View>
            );
          })}
        </View>

        <Text style={[styles.sec, styles.secHow]}>{d.howTitle}</Text>
        <Text style={styles.secSub}>{d.howSub}</Text>
        <View style={[styles.card, styles.steps]}>
          {d.how.map(([title, desc], i) => (
            <View key={title} style={[styles.step, i > 0 && styles.stepGap]}>
              <View style={styles.num}>
                <Text style={styles.numText}>{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sec, styles.secAfter]}>{d.afterTitle}</Text>
        <View style={[styles.card, styles.prog]}>
          <View style={styles.progPill}>
            <TrendingUp size={t.progPillIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.progPillText}>{d.progPill}</Text>
          </View>
          <View style={styles.progList}>
            <View style={styles.progRail} />
            {d.progression.map((p, i) => {
              const first = i === 0;
              const last = i === d.progression.length - 1;
              return (
                <View key={p} style={styles.progRow}>
                  <View style={[styles.progDot, (first || last) && styles.progDotGreen]}>
                    {first ? (
                      <Check size={t.progGlyph} color={ink.onBrand} strokeWidth={3} />
                    ) : last ? (
                      <Flag size={t.progGlyph} color={ink.onBrand} fill={ink.onBrand} strokeWidth={2} />
                    ) : (
                      <View style={styles.progInner} />
                    )}
                  </View>
                  <Text style={[styles.progText, last && styles.progTextLast]}>{p}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.doc]}>
          <View style={styles.head}>
            <FolderOpen size={t.headIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.headText}>{d.docTitle}</Text>
          </View>
          <Text style={[styles.body, styles.docBody]}>{d.docBody}</Text>
          <View style={styles.note}>
            <CircleQuestionMark size={t.noteIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.noteText}>{d.docNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.track]}>
          <View style={styles.head}>
            <Bell size={t.headIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.headText}>{d.trackTitle}</Text>
          </View>
          <Text style={[styles.body, styles.docBody]}>{d.trackBody}</Text>
          <View style={styles.trackArt} />
        </View>

        <Text style={[styles.sec, styles.secOpt]}>{d.optTitle}</Text>
        <View style={styles.optGrid}>
          {d.options.map((o) => {
            const Icon = OPT_ICON[o.icon];
            return (
              <View key={o.title} style={[styles.card, styles.opt]}>
                <View style={styles.optHead}>
                  <Icon size={t.optIcon} color={c.ink} strokeWidth={2} />
                  <Text style={styles.optTitle}>{o.title}</Text>
                </View>
                <Text style={styles.optSub}>{o.sub}</Text>
                <View style={styles.optProc}>
                  <View style={styles.optDot} />
                  <Text style={styles.optProcText} {...shrinkToFit(0.75)}>
                    {o.proc}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <Text style={styles.optNote}>{d.optNote}</Text>

        <View style={styles.sup}>
          <View style={styles.head}>
            <Shield size={t.supIcon} color={c.brownInk} fill={c.brownInk} strokeWidth={1.5} />
            <Text style={styles.supTitle}>{d.supTitle}</Text>
          </View>
          <Text style={styles.supBody}>{d.supBody}</Text>
          <Text style={styles.supNote}>{d.supNote}</Text>
        </View>

        <View style={styles.imp}>
          <Info size={t.impIcon} color={c.inkWarm} strokeWidth={1.9} />
          <View style={styles.flex}>
            <Text style={styles.impTitle}>{d.impTitle}</Text>
            <Text style={styles.impBody}>{d.impBody}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cta]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/district-court/case-type' as Href)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{d.cta}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
          <Pressable accessibilityRole="link" onPress={back}>
            <Text style={styles.link} {...shrinkToFit(0.8)}>
              {d.back}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  card: { ...shadow, borderRadius: t.cardRadius, backgroundColor: c.card },

  intro: { marginTop: t.introTop, paddingHorizontal: t.cardPad, paddingTop: t.introPadTop, paddingBottom: t.introPadBottom },
  caps: { flexDirection: 'row', alignItems: 'center', gap: t.capsGap },
  capsText: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  body: { marginTop: t.bodyTop, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  art: { marginTop: t.artTop, height: t.artH, borderRadius: t.artRadius, backgroundColor: c.heroArt, justifyContent: 'flex-end' },
  pill: {
    marginLeft: t.pillLeft,
    marginBottom: t.pillBottom,
    alignSelf: 'flex-start',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.ink },

  sec: { fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  secFirst: { marginTop: t.secFirstTop },
  secHow: { marginTop: t.secTop },
  secAfter: { marginTop: t.secAfterTop },
  secOpt: { marginTop: t.optTop },
  secSub: { marginTop: t.secSubTop, fontFamily: font.appBody, fontSize: t.secSubSize, lineHeight: t.secSubLineHeight, color: c.inkWarm },

  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.gridGap, rowGap: t.gridRowGap },
  tile: { flexBasis: '45%', flexGrow: 1, minWidth: 0, minHeight: t.tileH, paddingHorizontal: t.tilePadX, paddingTop: t.tilePadTop },
  tileIcon: { width: t.tileIcon, height: t.tileIcon, borderRadius: t.tileIconRadius, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { marginTop: t.tileTitleTop, fontFamily: font.appSemi, fontSize: t.tileTitleSize, lineHeight: t.tileTitleLineHeight, color: c.ink },
  tileBody: { marginTop: t.tileBodyTop, fontFamily: font.appBody, fontSize: t.tileBodySize, lineHeight: t.tileBodyLineHeight, color: c.inkWarm },

  steps: { marginTop: t.stepsTop, paddingHorizontal: t.cardPad, paddingTop: t.stepsPadTop, paddingBottom: t.stepsPadBottom },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: t.numGap },
  stepGap: { marginTop: t.stepGap },
  num: {
    marginLeft: t.numX,
    width: t.num,
    height: t.num,
    borderRadius: t.num / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { fontFamily: font.appSemi, fontSize: t.numSize, color: c.brownInk },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },

  prog: { marginTop: t.progTop, paddingHorizontal: t.cardPad, paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  progPill: {
    alignSelf: 'flex-start',
    height: t.progPillH,
    borderRadius: t.progPillH / 2,
    paddingHorizontal: t.progPillPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.capsGap,
  },
  progPillText: { fontFamily: font.appSemi, fontSize: t.progPillSize, color: c.inkWarm },
  progList: { marginTop: t.progListTop },
  progRail: {
    position: 'absolute',
    left: t.progDot / 2 - t.progRail / 2,
    top: 0,
    bottom: 0,
    width: t.progRail,
    backgroundColor: c.radioGrey,
  },
  progRow: { height: t.progRow, flexDirection: 'row', alignItems: 'center', gap: t.progGap },
  progDot: {
    width: t.progDot,
    height: t.progDot,
    borderRadius: t.progDot / 2,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progDotGreen: { backgroundColor: status.active },
  progInner: { width: t.progInner, height: t.progInner, borderRadius: t.progInner / 2, backgroundColor: c.brown },
  progText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.progSize, lineHeight: t.progLineHeight, color: c.ink },
  progTextLast: { fontFamily: font.appSemi },

  doc: { marginTop: t.docTop, paddingHorizontal: t.cardPad, paddingTop: t.docPadTop, paddingBottom: t.docPadBottom },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  docBody: { marginTop: t.docBodyTop, color: c.ink },
  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.noteGap,
  },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.inkWarm },

  track: { marginTop: t.trackTop, paddingHorizontal: t.cardPad, paddingTop: t.trackPadTop, paddingBottom: t.trackPadBottom },
  trackArt: { marginTop: t.trackArtTop, height: t.trackArtH, borderRadius: t.artRadius, backgroundColor: c.heroArt },

  optGrid: { marginTop: t.optGridTop, flexDirection: 'row', gap: t.gridGap },
  opt: { flex: 1, minWidth: 0, paddingHorizontal: t.optPadX, paddingTop: t.optPadTop, paddingBottom: t.optPadBottom },
  optHead: { flexDirection: 'row', alignItems: 'center', gap: t.capsGap },
  optTitle: { fontFamily: font.appSemi, fontSize: t.optTitleSize, lineHeight: t.optTitleLineHeight, color: c.ink },
  optSub: { marginTop: t.optSubTop, fontFamily: font.appBody, fontSize: t.optSubSize, lineHeight: t.optSubLineHeight, color: c.inkWarm },
  optProc: { marginTop: t.optProcTop, flexDirection: 'row', alignItems: 'center', gap: t.capsGap },
  optDot: { width: t.optProcDot, height: t.optProcDot, borderRadius: t.optProcDot / 2, backgroundColor: c.greenDeep },
  optProcText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.optProcSize, color: c.inkWarm },
  optNote: { marginTop: t.optNoteTop, paddingHorizontal: t.optNotePadX, fontFamily: font.appBody, fontSize: t.optNoteSize, lineHeight: t.optNoteLineHeight, color: c.inkWarm },

  sup: {
    marginTop: t.supTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachDone,
    paddingHorizontal: t.cardPad,
    paddingTop: t.supPadTop,
    paddingBottom: t.supPadBottom,
  },
  supTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.supTitleSize, lineHeight: t.supTitleLineHeight, color: c.brownInk },
  supBody: { marginTop: t.supBodyTop, fontFamily: font.appBody, fontSize: t.supBodySize, lineHeight: t.supBodyLineHeight, color: c.ink },
  supNote: { marginTop: t.supNoteTop, fontFamily: font.appBody, fontSize: t.supNoteSize, lineHeight: t.supNoteLineHeight, color: c.inkWarm },

  imp: {
    marginTop: t.impTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPad,
    paddingTop: t.impPadTop,
    paddingBottom: t.impPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.impGap,
  },
  impTitle: { fontFamily: font.appSemi, fontSize: t.impTitleSize, lineHeight: t.impTitleLineHeight, color: c.ink },
  impBody: { fontFamily: font.appBody, fontSize: t.impBodySize, lineHeight: t.impBodyLineHeight, color: c.inkWarm },

  cta: { marginTop: t.ctaTop, paddingHorizontal: t.cardPad, paddingTop: t.ctaPadTop, paddingBottom: t.ctaPadBottom },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  link: { marginTop: t.linkTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.linkSize, lineHeight: t.linkLineHeight, color: c.ink },
});
