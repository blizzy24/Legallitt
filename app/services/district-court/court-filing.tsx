import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  Check,
  CircleCheck,
  Clock,
  Copy,
  FileText,
  FolderOpen,
  Gavel,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcFiling as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { clientDocHref } from '../../../data/docLinks';
import { DC_FILING } from '../../../data/districtCourt';

// District Court — court filing (design/320). Measured at 2.000 px/pt.
//
// Cross-service, with conflicts 5, 6 and 9 — see DC_FILING.
//
// Wiring: View Hearing Details opens design/321 (Process Fee) — the next
// screen in the numbering, NOT a hearing screen (that is design/326); flagged.
// "Return to Case Overview" opens design/327, the screen it names. View opens
// the client document viewer.
// STATIC: Copy copies nothing; the notification and progress are drawings.

export default function DistrictCourtCourtFilingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_FILING;

  return (
    <View style={styles.screen}>
      <CourierHeader
        kicker={d.kicker}
        title={d.title}
        padTop={t.hdrPadTop}
        backHref={'/services/high-court/review-filing' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notif}>
          <View style={styles.notifDisc}>
            <BellRing size={t.notifGlyph} color={ink.onBrand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.notifTitle}>{d.notifTitle}</Text>
            <Text style={styles.notifBody}>{d.notifBody}</Text>
          </View>
        </View>

        <View style={styles.filed}>
          <View style={styles.filedTop}>
            <View style={styles.filedDisc}>
              <Check size={t.filedGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
            <View style={styles.flex}>
              <View style={styles.between}>
                <Text style={styles.filedTitle}>{d.filedTitle}</Text>
                <View style={[styles.pill, styles.pillFiled]}>
                  <View style={styles.pillDot} />
                  <Text style={[styles.pillText, styles.pillTextFiled]}>{d.filedPill}</Text>
                </View>
              </View>
              <Text style={styles.filedBody}>{d.filedBody}</Text>
            </View>
          </View>
          <View style={styles.filedNote}>
            <ShieldCheck size={t.filedNoteIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={[styles.filedBody, styles.flex]}>{d.filedNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.head]}>
          <View style={styles.between}>
            <View style={styles.headRow}>
              <Gavel size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.detTitle}</Text>
            </View>
            <Text style={styles.meta}>{d.detMeta}</Text>
          </View>
          <View style={styles.rows}>
            {d.rows.map((r, i) => (
              <View key={r.label} style={[styles.row, i % 2 === 0 && styles.rowShaded]}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <View style={styles.rowValueWrap}>
                  {'dot' in r && <View style={styles.rowDot} />}
                  <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                    {r.value}
                  </Text>
                  {/* Inert — nothing is copied. */}
                  {'copy' in r && <Copy size={t.rowIcon} color={c.ink} strokeWidth={1.9} />}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.head]}>
          <View style={styles.between}>
            <View style={styles.headRow}>
              <CalendarCheck size={t.headIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.hearTitle}</Text>
            </View>
            <View style={[styles.pill, styles.pillScheduled]}>
              <Text style={[styles.pillText, styles.pillTextScheduled]}>{d.hearPill}</Text>
            </View>
          </View>
          <View style={styles.hearBox}>
            <View style={styles.hearRow}>
              <Clock size={t.hearIcon} color={c.inkWarm} strokeWidth={2} />
              <Text style={styles.hearDate} {...shrinkToFit(0.8)}>
                {d.hearDate}
              </Text>
            </View>
            <View style={[styles.hearRow, styles.hearRoomRow]}>
              <MapPin size={t.hearIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.hearRoom}>{d.hearRoom}</Text>
            </View>
          </View>
          <View style={styles.confirm}>
            <CircleCheck size={t.confirmIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={styles.confirmText}>{d.hearConfirm}</Text>
          </View>
          <View style={styles.note}>
            <Text style={styles.noteText}>{d.hearNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.head]}>
          <View style={styles.between}>
            <View style={styles.headRow}>
              <FolderOpen size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.docsTitle}</Text>
            </View>
            <View style={styles.count}>
              <Text style={styles.countText}>{d.docs.length}</Text>
            </View>
          </View>
          <View style={styles.docs}>
            {d.docs.map((doc) => (
              <View key={doc.name} style={styles.doc}>
                <View style={styles.pdf}>
                  <FileText size={t.pdfGlyph} color={c.removeRed} strokeWidth={2} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.docName} {...shrinkToFit(0.75)}>
                    {doc.name}
                  </Text>
                  <Text style={styles.docMeta}>{doc.meta}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(clientDocHref(doc.name) as Href)}
                  style={styles.view}
                >
                  <Text style={styles.viewText}>{d.view}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.next}>
          <Text style={styles.caps}>{d.nextLabel}</Text>
          <Text style={styles.nextTitle}>{d.nextTitle}</Text>
          <Text style={styles.nextBody}>{d.next}</Text>
        </View>

        <View style={[styles.card, styles.prog]}>
          <View style={styles.between}>
            <Text style={styles.headText}>{d.progTitle}</Text>
            <Text style={[styles.meta, styles.stage]}>{d.stage}</Text>
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
                    <Text style={[styles.stepTitle, s.state === 'waiting' && styles.muted]}>{s.title}</Text>
                    <Text
                      style={[
                        styles.stepDesc,
                        s.state === 'done' && styles.greenText,
                        s.state === 'waiting' && styles.muted,
                      ]}
                    >
                      {s.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.barWrap, { paddingBottom: insets.bottom + t.barMargin }]}>
        <View style={styles.bar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/district-court/process-fee' as Href)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>{d.cta}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/services/district-court/case-overview' as Href)}
          >
            <Text style={styles.caption}>{d.caption}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },
  muted: { color: c.inkMuted },
  greenText: { color: c.greenInk },

  notif: {
    marginTop: t.notifTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.greenNotice,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.notifPadTop,
    paddingBottom: t.notifPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.notifGap,
  },
  notifDisc: {
    width: t.notifDisc,
    height: t.notifDisc,
    borderRadius: t.notifDisc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { fontFamily: font.appSemi, fontSize: t.notifTitleSize, lineHeight: t.notifTitleLineHeight, color: c.ink },
  notifBody: { fontFamily: font.appBody, fontSize: t.notifBodySize, lineHeight: t.notifBodyLineHeight, color: c.inkWarm },

  filed: {
    marginTop: t.filedTop,
    borderRadius: t.cardRadius,
    borderLeftWidth: t.filedBar,
    borderLeftColor: status.active,
    backgroundColor: c.panel,
    paddingLeft: t.cardPadX - t.filedBar,
    paddingRight: t.cardPadX,
    paddingTop: t.filedPadTop,
    paddingBottom: t.filedPadBottom,
  },
  filedTop: { flexDirection: 'row', alignItems: 'center', gap: t.filedGap },
  filedDisc: {
    width: t.filedDisc,
    height: t.filedDisc,
    borderRadius: t.filedDisc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filedTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.filedTitleSize, lineHeight: t.filedTitleLineHeight, color: c.ink },
  filedBody: { fontFamily: font.appBody, fontSize: t.filedBodySize, lineHeight: t.filedBodyLineHeight, color: c.inkWarm },
  filedNote: { marginTop: t.filedNoteTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.filedNoteGap },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillFiled: { backgroundColor: c.greenPill },
  pillScheduled: { backgroundColor: c.greenScheduled },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize },
  pillTextFiled: { color: c.greenInk },
  pillTextScheduled: { color: c.greenDeep },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  head: { paddingTop: t.headPadTop, paddingBottom: t.headPadBottom },
  headRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  meta: { fontFamily: font.appSemi, fontSize: t.metaSize, color: c.inkWarm },
  stage: { fontSize: t.metaSize + 1 },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  row: {
    minHeight: t.rowH,
    borderRadius: t.rowRadius,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.rowIconGap,
  },
  rowShaded: { backgroundColor: c.page },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowValueWrap: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.rowIconGap },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  rowDot: { width: t.rowDot, height: t.rowDot, borderRadius: t.rowDot / 2, backgroundColor: status.active },

  hearBox: {
    marginTop: t.hearBoxTop,
    borderRadius: t.hearBoxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.hearBoxPadX,
    paddingTop: t.hearBoxPadTop,
    paddingBottom: t.hearBoxPadBottom,
  },
  hearRow: { flexDirection: 'row', alignItems: 'center', gap: t.hearGap },
  hearRoomRow: { marginTop: t.hearRoomTop },
  hearDate: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.hearDateSize, lineHeight: t.hearDateLineHeight, color: c.ink },
  hearRoom: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.hearRoomSize, lineHeight: t.hearRoomLineHeight, color: c.inkWarm },
  confirm: { marginTop: t.confirmTop, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  confirmText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.confirmSize, lineHeight: t.confirmLineHeight, color: c.inkWarm },
  note: {
    marginTop: t.noteTop,
    borderRadius: t.hearBoxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.notePadX,
    paddingTop: t.notePadTop,
    paddingBottom: t.notePadBottom,
  },
  noteText: { fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.inkWarm },

  count: { width: t.count, height: t.count, borderRadius: t.count / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: c.brownInk },
  docs: { marginTop: t.docsTop, gap: t.docGap },
  doc: {
    minHeight: t.docH,
    borderRadius: t.docRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.docPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.docTileGap,
  },
  pdf: { width: t.pdf, height: t.pdf, borderRadius: t.pdfRadius, backgroundColor: c.pdfTile, alignItems: 'center', justifyContent: 'center' },
  docName: { fontFamily: font.appSemi, fontSize: t.docNameSize, lineHeight: t.docNameLineHeight, color: c.ink },
  docMeta: { fontFamily: font.appBody, fontSize: t.docMetaSize, lineHeight: t.docMetaLineHeight, color: c.inkWarm },
  view: { height: t.viewH, borderRadius: t.viewH / 2, paddingHorizontal: t.viewPadX, backgroundColor: c.radioGrey, justifyContent: 'center' },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: c.ink },

  next: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
  },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },
  nextTitle: { marginTop: t.nextTitleTop, fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },

  prog: { paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
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
    backgroundColor: c.peachSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCurrent: { backgroundColor: c.brown },
  dotCurrent: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.card },
  discWait: { backgroundColor: c.helpGrey },
  dotWait: { width: t.discDot, height: t.discDot, borderRadius: t.discDot / 2, backgroundColor: c.tagMuted },
  rail: { flex: 1, width: t.rail, backgroundColor: c.radioGrey },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },

  barWrap: { backgroundColor: c.page },
  bar: { backgroundColor: c.card, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, paddingBottom: t.barPadBottom },
  btn: {
    ...shadow,
    height: t.btnH,
    borderRadius: t.btnH / 2,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.ink },
});
