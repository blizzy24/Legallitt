import { router, type Href } from 'expo-router';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  ChevronRight,
  Info,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcDocsNeededPalette,
  dcReceived as t,
  dcReceivedPalette as p,
  dcReviewPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_RECEIVED } from '../../../../data/districtCourt';

// District Court — courier documents received (design/355). Measured at 2.000
// px/pt. Reached from design/354. View Case opens the case preparation screen
// (design/313), which until now only the dev preview links reached; View
// Documents opens 350. STATIC: the progress list is a drawing.

export default function DistrictReceivedScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_RECEIVED;

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        backHref={'/services/district-court/courier/tracking' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={styles.halo}>
            <View style={styles.disc}>
              <Check size={t.glyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>
          <View style={styles.badge}>
            <BadgeCheck size={t.badgeGlyph} color={c.card} fill={c.brown} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.heroTitle}>{d.heroTitle}</Text>
        <Text style={styles.heroBody}>{d.heroBody}</Text>
        <Text style={styles.heroSub}>{d.heroSub}</Text>
        <View style={styles.pill}>
          <ShieldCheck size={t.pillIcon} color={p.custodyPill} fill={c.greenInk} strokeWidth={2} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.first, styles.noPad]}>
          <View style={styles.band}>
            <ReceiptText size={t.headIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.receiptTitle}
            </Text>
            <View style={styles.ver}>
              <Check size={t.verIcon} color={c.greenInk} strokeWidth={2.4} />
              <Text style={styles.verText}>{d.verified}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.byLabel}</Text>
              <View style={styles.rowRight}>
                <Landmark size={t.rowIcon} color={c.brown} strokeWidth={1.9} />
                <Text style={[styles.rowValue, styles.semi]}>{d.by}</Text>
              </View>
            </View>
            <View style={styles.rule} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.docsLabel}</Text>
              <Text style={[styles.rowValue, styles.right]}>
                {d.docsLead}
                <Text style={styles.warm}>{d.docsRest}</Text>
              </Text>
            </View>
            <View style={styles.rule} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.onLabel}</Text>
              <Text style={styles.rowValue}>{d.on}</Text>
            </View>
            <View style={styles.rule} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.statusLabel}</Text>
              <View style={styles.stat}>
                <View style={styles.statDot} />
                <Text style={styles.statText}>{d.status}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={[styles.between, styles.listHead]}>
            <View style={[styles.headRow, styles.listIcon]}>
              <Archive size={t.headIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={[styles.headTitle, styles.noGrow]} {...shrinkToFit(0.8)}>
                {d.listTitle}
              </Text>
            </View>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/services/district-court/documents-needed' as Href)}
              style={styles.view}
            >
              <Text style={styles.viewText}>{d.viewAll}</Text>
              <ChevronRight size={t.viewIcon} color={c.brown} strokeWidth={2.2} />
            </Pressable>
          </View>
          {d.docs.map((doc, i) => (
            <View key={doc} style={[styles.doc, i === 0 ? styles.docsFirst : styles.docNext]}>
              <View style={styles.docDisc}>
                <Check size={t.docGlyph} color={c.greenInk} strokeWidth={3} />
              </View>
              <Text style={styles.docText}>{doc}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.next, styles.nextCard]}>
          <View style={styles.nextPill}>
            <Text style={styles.nextPillText}>{d.nextCaps}</Text>
          </View>
          <Text style={styles.nextTitle}>{d.nextTitle}</Text>
          <Text style={styles.nextBody}>{d.nextBody}</Text>
          <View style={styles.inner}>
            <Info size={t.innerIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.innerText}>{d.nextNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.progCard]}>
          <View style={styles.between}>
            <Text style={styles.progTitle}>{d.progTitle}</Text>
            <Text style={styles.stage}>{d.stage}</Text>
          </View>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map((s) => {
              const done = s.state === 'done';
              const cur = s.state === 'current';
              return (
                <View key={s.title} style={[styles.tlRow, s.state === 'wait' && styles.tlRowWait]}>
                  <View style={styles.tlBox}>
                    {done ? (
                      <View style={styles.done}>
                        <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    ) : cur ? (
                      <View style={styles.halo2}>
                        <View style={styles.cur} />
                      </View>
                    ) : (
                      <View style={styles.wait} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.tlHead}>
                      <Text style={[styles.tlTitle, s.state === 'wait' && styles.tlTitleWait]}>{s.title}</Text>
                      {cur && (
                        <View style={styles.curPill}>
                          <Text style={styles.curPillText}>{d.inProgress}</Text>
                        </View>
                      )}
                    </View>
                    {'status' in s && <Text style={styles.tlStatus}>{s.status}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.notif]}>
          <View style={styles.notifDisc}>
            <BellRing size={t.notifGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <Text style={styles.notifText}>
            <Text style={styles.semi}>{d.notifLead}</Text>
            {d.notif}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/case-preparation' as Href)}
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
  semi: { fontFamily: font.appSemi },
  warm: { fontFamily: font.appBody, color: c.inkWarm },
  right: { flexShrink: 1, textAlign: 'right' },
  hdrTitle: { fontSize: t.hdrTitleSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },

  heroWrap: { marginTop: t.heroTop, alignSelf: 'center' },
  halo: {
    width: t.halo,
    height: t.halo,
    borderRadius: t.halo / 2,
    backgroundColor: dcReviewPalette.finalPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: c.greenInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: t.badgeInset,
    bottom: t.badgeInset,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  heroTitle: {
    marginTop: t.titleTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.titleSize,
    lineHeight: t.titleLineHeight,
    color: c.ink,
  },
  heroBody: {
    marginTop: t.bodyTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.ink,
  },
  heroSub: { marginTop: t.subTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, color: c.inkWarm },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    maxWidth: '100%',
    minHeight: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: p.custodyPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.greenInk },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  noPad: { padding: t.noPad, overflow: 'hidden' },
  first: { marginTop: t.firstTop },
  next: { marginTop: t.cardGap },
  band: {
    minHeight: t.bandH,
    paddingHorizontal: t.bandPadX,
    backgroundColor: c.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.headGap,
  },
  noGrow: { flexGrow: 0, fontSize: t.listTitleSize },
  listHead: { gap: t.listGap },
  listIcon: { gap: t.listIconGap },
  headRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headTitle: { flexShrink: 1, flexGrow: 1, fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  ver: {
    height: t.verH,
    borderRadius: t.verH / 2,
    paddingHorizontal: t.verPadX,
    backgroundColor: p.custodyPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verGap,
  },
  verText: { fontFamily: font.appSemi, fontSize: t.verSize, color: c.greenInk },
  rows: { paddingHorizontal: t.cardPad, paddingBottom: t.rowsBottom },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowIconGap },
  rule: { height: t.ruleH, backgroundColor: c.panel },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowRight: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.rowIconGap },
  rowValue: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.rowValueSize, color: c.ink },
  stat: {
    height: t.statH,
    borderRadius: t.statH / 2,
    paddingHorizontal: t.statPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.statGap,
  },
  statDot: { width: t.statDot, height: t.statDot, borderRadius: t.statDot / 2, backgroundColor: c.greenInk },
  statText: { fontFamily: font.appSemi, fontSize: t.statSize, letterSpacing: t.statSpacing, color: c.greenInk },

  view: { flexDirection: 'row', alignItems: 'center' },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: c.brown },
  doc: {
    minHeight: t.docH,
    borderRadius: t.docRadius,
    paddingHorizontal: t.docPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.docTextGap,
  },
  docsFirst: { marginTop: t.docsTop },
  docNext: { marginTop: t.docGap },
  docDisc: {
    width: t.docDisc,
    height: t.docDisc,
    borderRadius: t.docDisc / 2,
    backgroundColor: p.checkDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, fontFamily: font.appBody, fontSize: t.docSize, color: c.ink },

  nextCard: { backgroundColor: c.peachDecide },
  nextPill: {
    alignSelf: 'flex-start',
    height: t.nextPillH,
    borderRadius: t.nextPillH / 2,
    paddingHorizontal: t.nextPillPadX,
    backgroundColor: dcDocsNeededPalette.fileTile,
    justifyContent: 'center',
  },
  nextPillText: { fontFamily: font.appSemi, fontSize: t.nextPillSize, letterSpacing: t.nextPillSpacing, color: c.brownInk },
  nextTitle: { marginTop: t.nextTitleTop, fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },
  inner: {
    marginTop: t.innerTop,
    borderRadius: t.innerRadius,
    paddingHorizontal: t.innerPadX,
    paddingVertical: t.innerPadY,
    backgroundColor: dcDocsNeededPalette.physPanel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.innerGap,
  },
  innerText: { flex: 1, fontFamily: font.appBody, fontSize: t.innerSize, lineHeight: t.innerLineHeight, color: c.inkWarm },

  progTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.progTitleSize, color: c.ink },
  stage: { fontFamily: font.appSemi, fontSize: t.stageSize, letterSpacing: t.stageSpacing, color: c.inkWarm },
  tl: { marginTop: t.tlTop },
  progCard: { paddingBottom: t.tlPadBottom },
  rail: {
    position: 'absolute',
    left: (t.tlHalo - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlWaitH / 2,
    width: t.tlRail,
    backgroundColor: c.rail,
  },
  tlRow: { minHeight: t.tlRowH, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlRowWait: { minHeight: t.tlWaitH },
  tlBox: { width: t.tlHalo, alignItems: 'center' },
  done: {
    width: t.tlDone,
    height: t.tlDone,
    borderRadius: t.tlDone / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo2: {
    width: t.tlHalo,
    height: t.tlHalo,
    borderRadius: t.tlHalo / 2,
    backgroundColor: dcDocsNeededPalette.halo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cur: { width: t.tlCur, height: t.tlCur, borderRadius: t.tlCur / 2, borderWidth: t.tlRing, borderColor: c.brown, backgroundColor: c.card },
  wait: { width: t.tlWait, height: t.tlWait, borderRadius: t.tlWait / 2, backgroundColor: c.radioGrey },
  tlHead: { flexDirection: 'row', alignItems: 'center', gap: t.curPillGap },
  tlTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleWait: { fontFamily: font.appBody, color: c.inkMuted },
  curPill: { height: t.curPillH, borderRadius: t.curPillH / 2, paddingHorizontal: t.curPillPadX, backgroundColor: c.peach, justifyContent: 'center' },
  curPillText: { fontFamily: font.appSemi, fontSize: t.curPillSize, letterSpacing: t.curPillSpacing, color: c.brownInk },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.greenInk },

  notif: { paddingVertical: t.notifPadY, backgroundColor: c.panel, flexDirection: 'row', alignItems: 'center', gap: t.notifGap },
  notifDisc: {
    width: t.notifDisc,
    height: t.notifDisc,
    borderRadius: t.notifDisc / 2,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { flex: 1, fontFamily: font.appBody, fontSize: t.notifSize, lineHeight: t.notifLineHeight, color: c.ink },

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
  cap: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, color: c.inkWarm },
});
