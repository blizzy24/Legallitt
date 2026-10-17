import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Check,
  Clock,
  Copy,
  Hand,
  Headset,
  History,
  ReceiptText,
  Smile,
  TrendingUp,
  UsersRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcChangeSent as t,
  dcChangeSentPalette as p,
  dcDecidePalette,
  dcDocumentsPalette,
  dcStepperPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../../constants/theme';
import { DC_CHANGE_SENT } from '../../../../data/districtCourt';

// District Court — new advocate request sent (design/348). Reached from Send
// Request on design/347.
//
// ⚠ design/348 is a 169px thumbnail: every measurement is ±2pt and several
// strings are best readings — see DC_CHANGE_SENT. Needs a clean re-export.
//
// Both "Back to Home" controls go to client Home; Contact Support opens the
// support chat. The batch draws nothing after this screen for the change
// path. STATIC: Copy copies nothing; "View Full Submission" and "View details"
// open nothing; the timeline is a drawing.

export default function DistrictChangeSentScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CHANGE_SENT;
  const home = () => router.replace('/(tabs)/home' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/advocate/change' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <View style={styles.hero}>
            <View style={styles.heroInner}>
              <Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>
          <View style={styles.heroDot} />
        </View>
        <Text style={styles.heroTitle}>{d.heroTitle}</Text>
        <Text style={styles.heroBody}>{d.heroBody}</Text>
        <Text style={styles.heroSub}>{d.heroSub}</Text>

        <View style={[styles.card, styles.status]}>
          <View style={styles.between}>
            <Text style={styles.caps} {...shrinkToFit(0.8)}>
              {d.statusCaps}
            </Text>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {d.statusPill}
              </Text>
            </View>
          </View>
          <Text style={styles.statusTitle}>{d.statusTitle}</Text>
          <Text style={[styles.body, styles.statusBody]}>{d.statusBody}</Text>
        </View>

        <View style={[styles.card, styles.white, styles.next, styles.req]}>
          <View style={styles.between}>
            <View style={styles.titleRow}>
              <ReceiptText size={t.titleIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.title} {...shrinkToFit(0.8)}>
                {d.reqTitle}
              </Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{d.reqChip}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([l, v]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                  {v}
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>{d.idLabel}</Text>
              <View style={styles.id}>
                <Text style={styles.rowValue}>{d.id}</Text>
                <Copy size={t.idIcon} color={c.inkWarm} strokeWidth={2} />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <Text style={[styles.title, styles.subTitle]}>{d.subTitle}</Text>
          <Text style={[styles.caps, styles.subCaps]}>{d.reasonCaps}</Text>
          <View style={styles.reason}>
            <Smile size={t.reasonIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.reasonText}>{d.reason}</Text>
          </View>
          <Text style={[styles.caps, styles.noteCaps]}>{d.noteCaps}</Text>
          <View style={styles.note}>
            <Text style={styles.noteText}>{d.note}</Text>
          </View>
          <View style={[styles.between, styles.foot]}>
            <View style={styles.titleRow}>
              <Clock size={t.footIcon} color={c.inkMuted} strokeWidth={2} />
              <Text style={styles.footText}>{d.submitted}</Text>
            </View>
            <Text style={styles.footText}>{d.viewAll}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.peachCard, styles.next, styles.nextPad]}>
          <View style={styles.titleRow}>
            <UsersRound size={t.titleIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.nextTitle}
            </Text>
          </View>
          {d.steps.map((s, i) => {
            const cur = s.state === 'current';
            return (
              <View key={s.title} style={[styles.step, i === 0 ? styles.stepsFirst : styles.stepNext]}>
                <View style={[styles.stepDisc, cur && styles.stepDiscCur]}>
                  <Text style={[styles.stepNum, cur && styles.stepNumCur]}>{i + 1}</Text>
                </View>
                <View style={[styles.flex, 'pill' in s ? undefined : styles.stepNoPill]}>
                  <View style={styles.stepHead}>
                    <Text style={styles.stepTitle}>{s.title}</Text>
                    {'pill' in s && (
                      <View style={[styles.stepPill, cur ? styles.stepPillCur : styles.stepPillWait]}>
                        <Text style={[styles.stepPillText, cur && styles.stepPillTextCur]}>{s.pill}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.stepDesc, 'pill' in s && styles.stepDescNarrow]}>{s.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.between}>
            <View style={styles.titleRow}>
              <TrendingUp size={t.titleIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.title} {...shrinkToFit(0.8)}>
                {d.tlTitle}
              </Text>
            </View>
            <Text style={styles.link}>{d.tlLink}</Text>
          </View>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map((s) => {
              const cur = s.state === 'current';
              const wait = s.state === 'wait';
              return (
                <View key={s.title} style={[styles.tlRow, wait && styles.tlWait, cur && styles.tlCurRow]}>
                  <View
                    style={[
                      styles.disc,
                      s.state === 'done' && styles.discDone,
                      cur && styles.discCur,
                    ]}
                  >
                    {s.state === 'done' && <Check size={t.tlGlyph} color={c.greenInk} strokeWidth={3} />}
                    {wait && <View style={styles.waitDot} />}
                  </View>
                  {cur ? (
                    <View style={styles.cur}>
                      <View style={styles.flex}>
                        <Text style={styles.curTitle}>{s.title}</Text>
                        <Text style={styles.curSub}>{s.status}</Text>
                      </View>
                      <View style={[styles.stepPill, styles.curPill, styles.curPillFill]}>
                        <Text style={[styles.stepPillText, styles.stepPillTextCur]}>{s.pill}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.flex}>
                      <Text style={[styles.tlTitle, wait && styles.tlTitleWait]}>{s.title}</Text>
                      {'status' in s && <Text style={styles.tlStatus}>{s.status}</Text>}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.updCard, styles.upd]}>
          <View style={styles.updDisc}>
            <Bell size={t.updGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.updTitle}>{d.updTitle}</Text>
            <Text style={styles.updBody}>{d.updBody}</Text>
            <Text style={styles.updNote}>{d.updNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.titleRow}>
            <View style={styles.helpDisc}>
              <Hand size={t.helpGlyph} color={c.brownInk} strokeWidth={1.9} />
            </View>
            <View style={[styles.flex, styles.helpText]}>
              <Text style={styles.helpTitle}>{d.helpTitle}</Text>
              <Text style={styles.helpSub}>{d.helpSub}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/support-chat' as Href)}
            style={styles.contact}
          >
            <Headset size={t.contactIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.contactText}>{d.contact}</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel={d.cta} onPress={home} style={styles.btn}>
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="link" onPress={home} style={styles.back}>
          <Text style={styles.backText}>{d.back}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  hdrSub: { fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.titleGap },
  titleRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.titleGap },

  heroWrap: { marginTop: t.heroTop, alignSelf: 'center' },
  hero: {
    width: t.hero,
    height: t.hero,
    borderRadius: t.hero / 2,
    backgroundColor: p.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    width: t.heroInner,
    height: t.heroInner,
    borderRadius: t.heroInner / 2,
    backgroundColor: c.greenInk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDot: {
    position: 'absolute',
    top: t.heroDotInset,
    right: -t.heroDotInset,
    width: t.heroDot,
    height: t.heroDot,
    borderRadius: t.heroDot / 2,
    backgroundColor: c.greenInk,
  },
  heroTitle: {
    marginTop: t.heroTitleTop,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.heroTitleSize,
    lineHeight: t.heroTitleLineHeight,
    color: c.ink,
  },
  heroBody: {
    marginTop: t.heroBodyTop,
    paddingHorizontal: t.heroPadX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLineHeight,
    color: c.ink,
  },
  heroSub: {
    marginTop: t.heroSubTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.heroSubSize,
    color: c.inkWarm,
  },

  card: { borderRadius: t.cardRadius, padding: t.cardPad },
  white: { backgroundColor: c.card, ...shadow },
  next: { marginTop: t.cardGap },
  status: { marginTop: t.statusTop, backgroundColor: c.panel },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.inkWarm },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brownInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.brownInk },
  statusTitle: {
    marginTop: t.statusTitleTop,
    fontFamily: font.appSemi,
    fontSize: t.statusTitleSize,
    lineHeight: t.statusTitleLineHeight,
    color: c.ink,
  },
  body: { fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  statusBody: { marginTop: t.statusBodyTop },

  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.inkWarm },
  rows: { marginTop: t.rowsTop },
  req: { paddingBottom: t.reqPadBottom },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.titleGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkMuted },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  id: {
    height: t.idH,
    borderRadius: t.idH / 2,
    paddingHorizontal: t.idPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.idGap,
  },

  subTitle: { fontSize: t.subTitleSize },
  subCaps: { marginTop: t.subCapsTop },
  reason: {
    marginTop: t.reasonTop,
    minHeight: t.reasonH,
    borderRadius: t.reasonRadius,
    paddingHorizontal: t.reasonPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.reasonGap,
  },
  reasonText: { flex: 1, fontFamily: font.appSemi, fontSize: t.reasonSize, color: c.ink },
  noteCaps: { marginTop: t.noteCapsTop },
  note: { marginTop: t.noteTop, borderRadius: t.reasonRadius, padding: t.notePad, backgroundColor: c.panel },
  noteText: { fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.inkWarm },
  foot: { marginTop: t.footTop },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, color: c.inkMuted },

  peachCard: { backgroundColor: dcDocumentsPalette.tilePeach },
  nextPad: { paddingBottom: t.nextPadBottom },
  updCard: { marginTop: t.updTop },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: t.stepTextGap },
  stepsFirst: { marginTop: t.stepsTop },
  stepNext: { marginTop: t.stepGap },
  stepDisc: {
    width: t.stepDisc,
    height: t.stepDisc,
    borderRadius: t.stepDisc / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDiscCur: { backgroundColor: c.brown },
  stepNum: { fontFamily: font.appSemi, fontSize: t.stepNumSize, color: c.ink },
  stepNumCur: { color: ink.onBrand },
  stepHead: { flexDirection: 'row', alignItems: 'flex-start', gap: t.titleGap },
  stepTitle: { flex: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepPill: { borderRadius: t.stepPillH / 2, paddingHorizontal: t.stepPillPadX, justifyContent: 'center' },
  stepPillCur: { width: t.stepPillW, minHeight: t.stepPillH, backgroundColor: c.brown },
  stepPillWait: { minHeight: t.waitPillH, backgroundColor: c.helpGrey },
  stepPillText: { fontFamily: font.appSemi, fontSize: t.stepPillSize, lineHeight: t.stepPillLineHeight, color: c.inkWarm },
  stepPillTextCur: { color: ink.onBrand },
  stepNoPill: { paddingRight: t.stepTextPadRight },
  stepDescNarrow: { paddingRight: t.stepTextPadRight },
  stepDesc: {
    marginTop: t.stepDescTop,
    fontFamily: font.appBody,
    fontSize: t.stepDescSize,
    lineHeight: t.stepDescLineHeight,
    color: c.inkWarm,
  },

  link: { fontFamily: font.appSemi, fontSize: t.linkSize, color: c.inkWarm },
  tl: { marginTop: t.tlTop },
  rail: {
    position: 'absolute',
    left: t.tlInset + (t.tlDisc - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlWaitH / 2,
    width: t.tlRail,
    backgroundColor: c.rail,
  },
  tlRow: { minHeight: t.tlRowH, paddingLeft: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlWait: { minHeight: t.tlWaitH },
  tlCurRow: { minHeight: t.tlCurRowH },
  disc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: dcDecidePalette.waitDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: p.mint },
  discPast: { backgroundColor: c.tileGrey },
  discCur: { backgroundColor: c.peach, borderWidth: t.tlRing, borderColor: c.brown },
  waitDot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: dcDecidePalette.waitDot },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleWait: { fontFamily: font.appBody, fontSize: t.tlWaitSize, color: dcStepperPalette.muted },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.inkMuted },
  cur: {
    flex: 1,
    minHeight: t.tlCurH,
    borderRadius: t.tlCurRadius,
    paddingHorizontal: t.tlCurPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.titleGap,
  },
  curTitle: { fontFamily: font.appSemi, fontSize: t.tlCurTitleSize, color: c.ink },
  curSub: { fontFamily: font.appSemi, fontSize: t.tlCurSubSize, color: c.ink },
  curPill: { minHeight: t.waitPillH },
  curPillFill: { backgroundColor: c.brown },

  upd: { flexDirection: 'row', gap: t.updGap },
  updDisc: {
    width: t.updDisc,
    height: t.updDisc,
    borderRadius: t.updDisc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updTitle: { fontFamily: font.appSemi, fontSize: t.updTitleSize, lineHeight: t.updTitleLineHeight, color: c.ink },
  updBody: { marginTop: t.updBodyTop, fontFamily: font.appBody, fontSize: t.updBodySize, lineHeight: t.updBodyLineHeight, color: c.ink },
  updNote: { marginTop: t.updNoteTop, fontFamily: font.appBody, fontSize: t.updNoteSize, lineHeight: t.updNoteLineHeight, color: c.inkMuted },

  helpDisc: {
    width: t.helpDisc,
    height: t.helpDisc,
    borderRadius: t.helpDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { marginLeft: t.helpTextInset },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, color: c.ink },
  helpSub: { fontFamily: font.appBody, fontSize: t.helpSubSize, color: c.inkWarm },
  contact: {
    marginTop: t.contactTop,
    height: t.contactH,
    borderRadius: t.contactRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.contactGap,
  },
  contactText: { fontFamily: font.appSemi, fontSize: t.contactSize, color: c.inkWarm },

  btn: {
    marginTop: t.btnTop,
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
  backText: { fontFamily: font.appSemi, fontSize: t.backSize, color: c.ink },
});
