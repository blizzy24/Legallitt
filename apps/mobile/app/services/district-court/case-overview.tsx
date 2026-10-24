import { AdvocateAvatar } from '../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  CircleCheck,
  Clock,
  Eye,
  FileText,
  Gavel,
  MessageSquareText,
  Phone,
  Quote,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcOverview as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { clientDocHref } from '../../../data/docLinks';
import { DC_OVERVIEW } from '../../../data/districtCourt';

// District Court — case overview (design/327). Measured at 2.000 px/pt.
//
// ⚠⚠ CONFLICT 8 is on this screen: First Hearing "Completed on 12 Sep 2026"
// against its own 25 October 2026 hearing. Commented on DC_OVERVIEW with
// conflicts 5 and 6 and the clipped file name.
//
// Wiring: "View Hearing Schedule" opens design/328 (Next Hearing), the screen
// it names; View Full Case File also opens 328 — the next drawn screen, no
// case-file screen exists — flagged. "Return to Case Dashboard" returns Home.
// View opens the client document viewer. Message opens the advocate chat
// (design/301). STATIC: Call Chamber dials nothing; the alert is a drawing.

export default function DistrictCourtCaseOverviewScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_OVERVIEW;
  const toNext = () => router.push('/services/district-court/next-hearing' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        backHref={'/services/district-court/first-hearing' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.alert}>
          <View style={styles.alertDisc}>
            <BellRing size={t.alertGlyph} color={c.brownInk} strokeWidth={1.9} />
          </View>
          <Text style={styles.alertText}>
            <Text style={styles.bold}>{d.alertLead}</Text>
            {d.alert}
          </Text>
        </View>

        <View style={styles.done}>
          <View style={styles.between}>
            <View style={styles.row}>
              <View style={styles.doneDisc}>
                <Check size={t.doneGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
              <Text style={styles.doneHead}>{d.doneHead}</Text>
            </View>
            <View style={[styles.pill, styles.pillSage]}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.donePill}</Text>
            </View>
          </View>
          <Text style={styles.doneDate}>{d.doneDate}</Text>
          <Text style={styles.doneBody}>{d.doneBody}</Text>
        </View>

        <View style={[styles.card, styles.det]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.detLabel}</Text>
            <View style={styles.row}>
              <BadgeCheck size={t.formalIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.formal}>{d.formal}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([l, v], i) => (
              <View key={l} style={styles.detRow}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={[styles.rowValue, i === d.rows.length - 1 && styles.brownLift]} {...shrinkToFit(0.75)}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.what]}>
          <View style={styles.row}>
            <View style={styles.quoteDisc}>
              <Quote size={t.quoteGlyph} color={c.ink} fill={c.ink} strokeWidth={1.5} />
            </View>
            <Text style={styles.whatTitle}>{d.whatTitle}</Text>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{d.quote}</Text>
          </View>
          <View style={styles.by}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.byPhoto}><Text style={styles.byInitials}>{d.initials}</Text></AdvocateAvatar>
            <Text style={styles.byText} {...shrinkToFit(0.75)}>
              {d.byLead}
              <Text style={styles.bold}>{d.byName}</Text>
              {d.byTime}
            </Text>
          </View>
        </View>

        <View style={styles.dir}>
          <View style={styles.dirTile}>
            <Gavel size={t.dirGlyph} color={ink.onBrand} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.caps}>{d.dirLabel}</Text>
            <Text style={styles.dirTitle}>{d.dirTitle}</Text>
            <View style={styles.handled}>
              <CircleCheck size={t.handledIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.handledText} {...shrinkToFit(0.75)}>
                {d.handled}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.rec]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.recLabel}</Text>
            <Text style={styles.recMeta}>{d.recMeta}</Text>
          </View>
          <View style={styles.recRow}>
            <View style={styles.pdf}>
              <FileText size={t.pdfGlyph} color={c.removeRed} strokeWidth={2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.recName}>{d.recName}</Text>
              <Text style={styles.recFileMeta}>{d.recFileMeta}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(clientDocHref(d.recName) as Href)}
              style={styles.view}
            >
              <Eye size={t.viewIcon} color={ink.onBrand} strokeWidth={2} />
              <Text style={styles.viewText}>{d.view}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.next}>
          <View style={styles.nextDisc}>
            <ArrowRight size={t.nextGlyph} color={c.ink} strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.caps}>{d.nextLabel}</Text>
            <Text style={styles.nextTitle}>{d.nextTitle}</Text>
            <Text style={styles.nextBody}>{d.next}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.up]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.upLabel}</Text>
            <View style={[styles.pill, styles.pillGreen]}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{d.upPill}</Text>
            </View>
          </View>
          <Text style={styles.upDate}>{d.upDate}</Text>
          <View style={styles.upTime}>
            <Clock size={t.upTimeIcon} color={c.ink} strokeWidth={2} />
            <Text style={styles.upTimeText} {...shrinkToFit(0.75)}>
              {d.upTime}
            </Text>
          </View>
          <Pressable accessibilityRole="link" onPress={toNext} style={styles.upLink}>
            <Text style={styles.upLinkText}>{d.upLink}</Text>
            <ArrowRight size={t.upLinkIcon} color={c.brownLift} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.prog]}>
          <View style={styles.between}>
            <Text style={styles.progTitle}>{d.progTitle}</Text>
            <Text style={styles.phase}>{d.phase}</Text>
          </View>
          <View style={styles.steps}>
            {d.steps.map((s, i) => (
              <View key={s.title} style={[styles.step, i < d.steps.length - 1 && styles.stepSpaced]}>
                <View
                  style={[
                    styles.disc,
                    (s.state === 'done') && styles.discDone,
                    s.state === 'current' && styles.discCurrent,
                    s.state === 'waiting' && styles.discWait,
                  ]}
                >
                  {s.state === 'done' ? (
                    <Check size={t.discGlyph} color={ink.onBrand} strokeWidth={3} />
                  ) : (
                    <Text style={[styles.num, s.state === 'current' && styles.numCurrent]}>{i + 1}</Text>
                  )}
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.stepTitle, s.state === 'waiting' && styles.waitTitle]}>{s.title}</Text>
                  <Text
                    style={[
                      styles.stepDesc,
                      s.state === 'done' && styles.greenDesc,
                      s.state === 'current' && styles.currentDesc,
                    ]}
                  >
                    {s.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.q]}>
          <View style={styles.between}>
            <View style={styles.flex}>
              <Text style={styles.qTitle}>{d.qTitle}</Text>
              <Text style={styles.qSub}>{d.qSub}</Text>
            </View>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.qPhoto}><Text style={styles.qInitials}>{d.initials}</Text></AdvocateAvatar>
          </View>
          <View style={styles.qBtns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.qBtn}
            >
              <MessageSquareText size={t.qBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qBtnText}>{d.message}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.qBtn}>
              <Phone size={t.qBtnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.qBtnText}>{d.callChamber}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toNext} style={styles.cta}>
          <Text style={styles.ctaText}>{d.cta}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/(tabs)/home' as Href)}>
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
  row: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.whatGap },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.doneGap },
  bold: { fontFamily: font.appSemi, color: c.ink },
  brownLift: { color: c.brownLift },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },

  alert: {
    marginTop: t.alertTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.alertPadX,
    paddingVertical: t.alertPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.alertGap,
  },
  alertDisc: { width: t.alertDisc, height: t.alertDisc, borderRadius: t.alertDisc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  alertText: { flex: 1, fontFamily: font.appBody, fontSize: t.alertSize, lineHeight: t.alertLineHeight, color: c.inkWarm },

  done: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachDone,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.donePadTop,
    paddingBottom: t.donePadBottom,
  },
  doneDisc: { width: t.doneDisc, height: t.doneDisc, borderRadius: t.doneDisc / 2, backgroundColor: status.active, alignItems: 'center', justifyContent: 'center' },
  doneHead: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.doneHeadSize, color: c.ink },
  pill: { height: t.pillH, borderRadius: t.pillH / 2, paddingHorizontal: t.pillPadX, flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  pillSage: { backgroundColor: c.sagePill },
  pillGreen: { backgroundColor: c.greenSoft },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.greenInk },
  doneDate: { marginTop: t.doneDateTop, fontFamily: font.appSemi, fontSize: t.doneDateSize, lineHeight: t.doneDateLineHeight, color: c.ink },
  doneBody: { marginTop: t.doneBodyTop, fontFamily: font.appBody, fontSize: t.doneBodySize, lineHeight: t.doneBodyLineHeight, color: c.inkWarm },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  det: { paddingTop: t.detPadTop, paddingBottom: t.detPadBottom },
  formal: { fontFamily: font.appSemi, fontSize: t.formalSize, color: c.greenInk },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  detRow: {
    minHeight: t.rowH,
    borderRadius: t.rowRadius,
    backgroundColor: c.page,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.doneGap,
  },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },

  what: { paddingTop: t.whatPadTop, paddingBottom: t.whatPadBottom },
  quoteDisc: { width: t.quoteDisc, height: t.quoteDisc, borderRadius: t.quoteDisc / 2, backgroundColor: c.peachSoft, alignItems: 'center', justifyContent: 'center' },
  whatTitle: { fontFamily: font.appSemi, fontSize: t.whatTitleSize, lineHeight: t.whatTitleLineHeight, color: c.ink },
  quote: { marginTop: t.quoteTop, borderRadius: t.quoteRadius, backgroundColor: c.page, paddingHorizontal: t.quotePadX, paddingVertical: t.quotePadY },
  quoteText: { fontFamily: font.appBody, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: c.ink },
  by: { marginTop: t.byTop, flexDirection: 'row', alignItems: 'center', gap: t.byGap },
  byPhoto: { width: t.byPhoto, height: t.byPhoto, borderRadius: t.byPhoto / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  byInitials: { fontFamily: font.appSemi, fontSize: t.byInitials, color: ink.onBrand },
  byText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.bySize, lineHeight: t.byLineHeight, color: c.inkMuted },

  dir: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachDirection,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.dirPadTop,
    paddingBottom: t.dirPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.dirGap,
  },
  dirTile: { width: t.dirTile, height: t.dirTile, borderRadius: t.dirTileRadius, backgroundColor: c.brown, alignItems: 'center', justifyContent: 'center' },
  dirTitle: { marginTop: t.dirTitleTop, fontFamily: font.appSemi, fontSize: t.dirTitleSize, lineHeight: t.dirTitleLineHeight, color: c.ink },
  handled: {
    marginTop: t.handledTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.handledH,
    borderRadius: t.handledH / 4,
    paddingHorizontal: t.handledPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.handledGap,
  },
  handledText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.handledSize, color: c.inkWarm },

  rec: { paddingTop: t.recPadTop, paddingBottom: t.recPadBottom },
  recMeta: { fontFamily: font.appSemi, fontSize: t.recMetaSize, color: c.inkWarm },
  recRow: {
    marginTop: t.recRowTop,
    borderRadius: t.recRowRadius,
    backgroundColor: c.page,
    paddingHorizontal: t.recRowPadX,
    paddingVertical: t.recRowPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.recGap,
  },
  pdf: { width: t.pdf, height: t.pdf, borderRadius: t.pdfRadius, backgroundColor: c.pdfTile, alignItems: 'center', justifyContent: 'center' },
  recName: { fontFamily: font.appSemi, fontSize: t.recNameSize, lineHeight: t.recNameLineHeight, color: c.ink },
  recFileMeta: { fontFamily: font.appBody, fontSize: t.recMetaRowSize, lineHeight: t.recMetaLineHeight, color: c.inkMuted },
  view: {
    height: t.viewH,
    borderRadius: t.viewH / 4,
    paddingHorizontal: t.viewPadX,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.viewGap,
  },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: ink.onBrand },

  next: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.nextGap,
  },
  nextDisc: { width: t.nextDisc, height: t.nextDisc, borderRadius: t.nextDisc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  nextTitle: { marginTop: t.nextTitleTop, fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },

  up: { paddingTop: t.upPadTop, paddingBottom: t.upPadBottom },
  upDate: { marginTop: t.upDateTop, fontFamily: font.appSemi, fontSize: t.upDateSize, lineHeight: t.upDateLineHeight, color: c.ink },
  upTime: { flexDirection: 'row', alignItems: 'center', gap: t.upTimeGap },
  upTimeText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.upTimeSize, lineHeight: t.upTimeLineHeight, color: c.inkWarm },
  upLink: { marginTop: t.upLinkTop, alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: t.upLinkGap },
  upLinkText: { fontFamily: font.appSemi, fontSize: t.upLinkSize, color: c.brownLift },

  prog: { paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  progTitle: { fontFamily: font.appSemi, fontSize: t.progTitleSize, lineHeight: t.progTitleLineHeight, color: c.ink },
  phase: { fontFamily: font.appSemi, fontSize: t.phaseSize, color: c.inkWarm },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: t.stepGap },
  stepSpaced: { minHeight: t.stepPitch },
  disc: {
    marginTop: (t.stepTitleLineHeight + t.stepDescLineHeight - t.disc) / 2,
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: status.active },
  discCurrent: { backgroundColor: c.peach },
  discWait: { backgroundColor: c.helpGrey },
  num: { fontFamily: font.appSemi, fontSize: t.numSize, color: c.inkWarm },
  numCurrent: { color: c.ink },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  waitTitle: { color: c.inkMuted },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkMuted },
  greenDesc: { fontFamily: font.appSemi, color: c.greenInk },
  currentDesc: { fontFamily: font.appSemi, color: c.inkWarm },

  q: { paddingTop: t.qPadTop, paddingBottom: t.qPadBottom },
  qTitle: { fontFamily: font.appSemi, fontSize: t.qTitleSize, lineHeight: t.qTitleLineHeight, color: c.ink },
  qSub: { fontFamily: font.appBody, fontSize: t.qSubSize, lineHeight: t.qSubLineHeight, color: c.inkWarm },
  qPhoto: { width: t.qPhoto, height: t.qPhoto, borderRadius: t.qPhoto / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  qInitials: { fontFamily: font.appSemi, fontSize: t.qInitials, color: ink.onBrand },
  qBtns: { marginTop: t.qBtnsTop, flexDirection: 'row', gap: t.qBtnGap },
  qBtn: {
    flex: 1,
    height: t.qBtnH,
    borderRadius: t.qBtnRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.qBtnIconGap,
  },
  qBtnText: { fontFamily: font.appSemi, fontSize: t.qBtnSize, color: c.ink },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
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
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
});
