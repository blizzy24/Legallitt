import { AdvocateAvatar } from '../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarCheck,
  Check,
  Copy,
  Gavel,
  Info,
  MessageSquareText,
  Phone,
  RotateCcw,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcHearing as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_HEARING } from '../../../data/districtCourt';

// District Court — first hearing (design/326). Measured at 2.000 px/pt.
//
// Conflicts 5 and 6, the Sunday listing and the clipped title are commented on
// DC_HEARING.
//
// Wiring: View Full Case Details and "Return to Case Dashboard" both open
// design/327 (Case Overview) — no separate dashboard is drawn. Chat with
// Advocate opens the advocate chat (design/301).
// STATIC: the alert is a drawing (no notification); Copy and Call do nothing.

export default function DistrictCourtFirstHearingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_HEARING;
  const toOverview = () => router.push('/services/district-court/case-overview' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/process-fee-receipt' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.alert}>
          <View style={styles.alertDisc}>
            <BellRing size={t.alertGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <View style={styles.between}>
              <Text style={styles.caps}>{d.alertLabel}</Text>
              <Text style={styles.alertMeta}>{d.alertTime}</Text>
            </View>
            <Text style={styles.alertTitle}>{d.alertTitle}</Text>
            <Text style={styles.alertSub}>{d.alertSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.sched]}>
          <View style={styles.schedDisc}>
            <CalendarCheck size={t.schedGlyph} color={c.greenInk} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.schedTitle} {...shrinkToFit(0.7)}>
              {d.schedTitle}
            </Text>
            <Text style={styles.schedSub} {...shrinkToFit(0.7)}>
              {d.schedSub}
            </Text>
          </View>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>{d.schedPill}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.det]}>
          <View style={styles.between}>
            <Text style={styles.sec}>{d.detTitle}</Text>
            <View style={styles.reg}>
              <Gavel size={t.regIcon} color={c.brown} strokeWidth={2} />
              <Text style={styles.regText}>{d.registry}</Text>
            </View>
          </View>
          <View style={styles.dt}>
            <View style={styles.flex}>
              <Text style={styles.dtLabel}>{d.dateLabel}</Text>
              <Text style={styles.dtValue}>{d.date}</Text>
              <Text style={styles.dtSub}>{d.dateSub}</Text>
            </View>
            <View style={styles.dtDivider} />
            <View style={[styles.flex, styles.dtRight]}>
              <Text style={styles.dtLabel}>{d.timeLabel}</Text>
              <Text style={[styles.dtValue, styles.dtTime]} {...shrinkToFit(0.75)}>
                {d.time}
              </Text>
              <Text style={styles.dtSub}>{d.timeSub}</Text>
            </View>
          </View>
          {[d.tiles.slice(0, 2), d.tiles.slice(2)].map((row, r) => (
            <View key={r} style={[styles.tiles, r > 0 && styles.tilesNext]}>
              {row.map(([l, v]) => (
                <View key={l} style={styles.tile}>
                  <Text style={styles.tileLabel}>{l}</Text>
                  <Text style={styles.tileValue}>{v}</Text>
                </View>
              ))}
            </View>
          ))}
          <View style={styles.confirm}>
            <BadgeCheck size={t.confirmIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.confirmText}>{d.confirm}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.ref]}>
          <View style={styles.between}>
            <Text style={styles.sec}>{d.refLabel}</Text>
            <View style={styles.civil}>
              <Text style={styles.civilText}>{d.civil}</Text>
            </View>
          </View>
          <Text style={styles.refTitle} {...shrinkToFit(0.8)}>
            {d.parties}
          </Text>
          <View style={styles.file}>
            <View style={styles.flex}>
              <Text style={styles.fileLabel}>{d.fileLabel}</Text>
              <Text style={styles.fileValue}>{d.file}</Text>
            </View>
            {/* Inert — nothing is copied. */}
            <View style={styles.copy}>
              <Copy size={t.copyIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.copyText}>{d.copy}</Text>
            </View>
          </View>
          <View style={styles.adv}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.advDisc}><Text style={styles.advInitials}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.advName}>{d.adv}</Text>
              <Text style={styles.advSub}>{d.advSub}</Text>
            </View>
          </View>
        </View>

        <View style={styles.before}>
          <View style={styles.beforeHead}>
            <Info size={t.beforeIcon} color={c.brownInk} strokeWidth={2} />
            <Text style={[styles.sec, styles.brownText]}>{d.beforeLabel}</Text>
          </View>
          <Text style={styles.beforeBody}>{d.before}</Text>
          <Text style={styles.beforeSub}>{d.beforeSub}</Text>
        </View>

        <View style={styles.upd}>
          <RotateCcw size={t.updIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.updText}>{d.update}</Text>
        </View>

        <View style={[styles.card, styles.prog]}>
          <View style={styles.between}>
            <Text style={styles.sec}>{d.progTitle}</Text>
            <Text style={styles.stage}>{d.stage}</Text>
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
                    {!last && <View style={styles.rail} />}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.stepHead}>
                      <Text
                        style={[
                          styles.stepTitle,
                          s.state === 'current' && styles.brownLift,
                          s.state === 'waiting' && styles.waitTitle,
                        ]}
                      >
                        {s.title}
                      </Text>
                      {'chip' in s && (
                        <View style={styles.curChip}>
                          <Text style={styles.curChipText}>{s.chip}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.stepDesc, s.state === 'current' && styles.inkText]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.q]}>
          <Text style={styles.qTitle}>{d.qTitle}</Text>
          <Text style={styles.qSub}>{d.qSub}</Text>
          <View style={styles.qBtns}>
            {/* Static — no call is placed. */}
            <View style={styles.qBtn}>
              <Phone size={t.qBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qBtnText}>{d.call}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.qBtn}
            >
              <MessageSquareText size={t.qBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qBtnText}>{d.chat}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toOverview} style={styles.cta}>
          <Text style={styles.ctaText}>{d.cta}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="link" onPress={toOverview}>
          <Text style={styles.caption}>{d.caption}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.alertGap },
  hdrSub: { fontSize: t.hdrSubSize },
  brownText: { color: c.brownInk },
  brownLift: { color: c.brownLift },
  inkText: { color: c.ink },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.brownInk },

  alert: {
    marginTop: t.alertTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachDecide,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.alertPadTop,
    paddingBottom: t.alertPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.alertGap,
  },
  alertDisc: { width: t.alertDisc, height: t.alertDisc, borderRadius: t.alertDisc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  alertMeta: { fontFamily: font.appBody, fontSize: t.alertMetaSize, color: c.inkWarm },
  alertTitle: { marginTop: t.alertTitleTop, fontFamily: font.appSemi, fontSize: t.alertTitleSize, lineHeight: t.alertTitleLineHeight, color: c.ink },
  alertSub: { marginTop: t.alertSubTop, fontFamily: font.appBody, fontSize: t.alertSubSize, lineHeight: t.alertSubLineHeight, color: c.inkWarm },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  sched: { paddingVertical: t.schedPadY, flexDirection: 'row', alignItems: 'center', gap: t.schedGap },
  schedDisc: { width: t.schedDisc, height: t.schedDisc, borderRadius: t.schedDisc / 2, backgroundColor: c.greenSoft, alignItems: 'center', justifyContent: 'center' },
  schedTitle: { fontFamily: font.appSemi, fontSize: t.schedTitleSize, lineHeight: t.schedTitleLineHeight, color: c.ink },
  schedSub: { fontFamily: font.appBody, fontSize: t.schedSubSize, lineHeight: t.schedSubLineHeight, color: c.inkWarm },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.greenInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },

  det: { paddingHorizontal: t.detPadX, paddingTop: t.detPadTop, paddingBottom: t.detPadBottom },
  sec: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, letterSpacing: t.secSpacing, color: c.inkWarm },
  reg: {
    height: t.regH,
    borderRadius: t.regH / 2,
    paddingHorizontal: t.regPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 1,
  },
  regText: { fontFamily: font.appSemi, fontSize: t.regSize, color: c.inkWarm },
  dt: {
    marginTop: t.dtTop,
    borderRadius: t.dtRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.dtPadX,
    paddingTop: t.dtPadTop,
    paddingBottom: t.dtPadBottom,
    flexDirection: 'row',
    gap: t.dtGap,
  },
  dtDivider: { width: t.dtDivider, backgroundColor: c.radioGrey },
  dtRight: { paddingTop: t.dtValueTop + 4 },
  dtLabel: { fontFamily: font.appBody, fontSize: t.dtLabelSize, lineHeight: t.dtLabelLineHeight, color: c.inkWarm },
  dtValue: { marginTop: t.dtValueTop, fontFamily: font.appHeading, fontSize: t.dtValueSize, lineHeight: t.dtValueLineHeight, color: c.ink },
  dtTime: { color: c.brownLift },
  dtSub: { fontFamily: font.appBody, fontSize: t.dtSubSize, lineHeight: t.dtSubLineHeight, color: c.inkWarm },
  tiles: { marginTop: t.tilesTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.tileGap },
  tilesNext: { marginTop: t.tileRowGap },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.tileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.tilePadX,
    paddingVertical: t.tilePadY,
  },
  tileLabel: { fontFamily: font.appBody, fontSize: t.tileLabelSize, lineHeight: t.tileLabelLineHeight, color: c.inkWarm },
  tileValue: { marginTop: t.tileValueTop, fontFamily: font.appSemi, fontSize: t.tileValueSize, lineHeight: t.tileValueLineHeight, color: c.ink },
  confirm: { marginTop: t.confirmTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.confirmGap },
  confirmText: { flex: 1, fontFamily: font.appBody, fontSize: t.confirmSize, lineHeight: t.confirmLineHeight, color: c.inkWarm },

  ref: { paddingTop: t.refPadTop, paddingBottom: t.refPadBottom },
  civil: { height: t.civilH, borderRadius: t.civilH / 4, paddingHorizontal: t.civilPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  civilText: { fontFamily: font.appSemi, fontSize: t.civilSize, color: c.inkWarm },
  refTitle: { marginTop: t.refTitleTop, fontFamily: font.appSemi, fontSize: t.refTitleSize, lineHeight: t.refTitleLineHeight, color: c.ink },
  file: {
    marginTop: t.fileTop,
    borderRadius: t.fileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.filePadX,
    paddingTop: t.filePadTop,
    paddingBottom: t.filePadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.alertGap,
  },
  fileLabel: { fontFamily: font.appBody, fontSize: t.fileLabelSize, lineHeight: t.fileLabelLineHeight, color: c.inkWarm },
  fileValue: { fontFamily: font.appSemi, fontSize: t.fileValueSize, lineHeight: t.fileValueLineHeight, color: c.ink },
  copy: {
    height: t.copyH,
    borderRadius: t.copyH / 4,
    paddingHorizontal: t.copyPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 1,
  },
  copyText: { fontFamily: font.appSemi, fontSize: t.copySize, color: c.ink },
  adv: { marginTop: t.advTop, flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  advDisc: { width: t.advDisc, height: t.advDisc, borderRadius: t.advDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  advInitials: { fontFamily: font.appSemi, fontSize: t.advInitials, color: c.inkWarm },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },

  before: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.beforePadTop,
    paddingBottom: t.beforePadBottom,
  },
  beforeHead: { flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  beforeBody: { marginTop: t.beforeBodyTop, fontFamily: font.appBody, fontSize: t.beforeBodySize, lineHeight: t.beforeBodyLineHeight, color: c.ink },
  beforeSub: { marginTop: t.beforeSubTop, fontFamily: font.appBody, fontSize: t.beforeSubSize, lineHeight: t.beforeSubLineHeight, color: c.inkWarm },

  upd: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.updPadTop,
    paddingBottom: t.updPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.updGap,
  },
  updText: { flex: 1, fontFamily: font.appBody, fontSize: t.updSize, lineHeight: t.updLineHeight, color: c.ink },

  prog: { paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  stage: { fontFamily: font.appSemi, fontSize: t.stageSize, color: c.inkWarm },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  stepSpaced: { minHeight: t.stepPitch },
  railCol: { width: t.ring, alignItems: 'center', paddingTop: (t.stepTitleLineHeight - t.disc) / 2 },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: status.active },
  ring: {
    marginTop: (t.disc - t.ring) / 2,
    marginBottom: (t.disc - t.ring) / 2,
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCurrent: { backgroundColor: c.brown },
  dotCurrent: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.card },
  discWait: { backgroundColor: c.radioGrey },
  dotWait: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.tagMuted },
  rail: { flex: 1, width: 2, backgroundColor: c.radioGrey },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: t.stepGap },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  waitTitle: { color: c.inkWarm },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },
  curChip: { height: t.curChipH, borderRadius: t.curChipRadius, paddingHorizontal: t.curChipPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  curChipText: { fontFamily: font.appSemi, fontSize: t.curChipSize, color: c.inkWarm },

  q: { paddingTop: t.qPadTop, paddingBottom: t.qPadBottom },
  qTitle: { fontFamily: font.appSemi, fontSize: t.qTitleSize, lineHeight: t.qTitleLineHeight, color: c.ink },
  qSub: { fontFamily: font.appBody, fontSize: t.qSubSize, lineHeight: t.qSubLineHeight, color: c.inkWarm },
  qBtns: { marginTop: t.qBtnsTop, flexDirection: 'row', gap: t.qBtnGap },
  qBtn: {
    flex: 1,
    minHeight: t.qBtnH,
    borderRadius: t.qBtnRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.qBtnIconGap,
  },
  qBtnText: { flexShrink: 1, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.qBtnSize, lineHeight: t.qBtnLineHeight, color: c.ink },

  bar: { backgroundColor: c.card, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.ink },
});
