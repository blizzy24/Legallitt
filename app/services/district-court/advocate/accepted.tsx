import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  ClipboardClock,
  Copy,
  FileText,
  Hourglass,
  Info,
  MailCheck,
  MessageSquare,
  Phone,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  dcAccepted as t,
  dcAcceptedPalette as p,
  dcDecidePalette,
  dcStepperPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_ACCEPTED } from '../../../../data/districtCourt';

// District Court — advocate accepted (design/346). Measured at 2.000 px/pt.
// Reached from Accept Advocate on design/345.
//
// ⚠ WIRING CHOICE: the bar is drawn as a held "[ Waiting for Advocate ]" pill
// — the screen waits for the advocate's checklist and draws no other way on.
// As with the held Scan & Pay, tapping it moves on to what arrives next, the
// documents-needed screen (design/350). Flagged.
//
// Chat opens the existing advocate chat (301). STATIC, NOT WIRED: Call dials
// nothing, Copy copies nothing, View Profile opens nothing (no profile is
// drawn), the progress list is a drawing. The photo is an initials avatar, as
// on 300 and 345; the header avatar is the standard one.

export default function DistrictAcceptedScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_ACCEPTED;

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
        <View style={styles.notif}>
          <MailCheck size={t.notifIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.notifText}>{d.notif}</Text>
        </View>

        <View style={[styles.card, styles.first, styles.okRow]}>
          <View style={styles.okDisc}>
            <CircleCheck size={t.okGlyph} color={c.greenSoft} fill={c.greenInk} strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.okTitle}>{d.okTitle}</Text>
            <Text style={styles.okBody}>{d.okBody}</Text>
            <Text style={[styles.okSub, styles.okSubTight]}>{d.okSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <View style={[styles.pill, styles.pillPeach]}>
              <Text style={styles.capsText} {...shrinkToFit(0.8)}>
                {d.yourAdv}
              </Text>
            </View>
            <View style={[styles.pill, styles.pillGreen]}>
              <BadgeCheck size={t.pillIcon} color={c.greenSoft} fill={c.greenInk} strokeWidth={2} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                {d.verified}
              </Text>
            </View>
          </View>
          <View style={styles.adv}>
            <View style={styles.photo}>
              <Text style={styles.photoText}>{d.initials}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <View style={styles.chips}>
                {d.chips.map((ch) => (
                  <View key={ch} style={styles.chip}>
                    <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                      {ch}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={styles.loc}>{d.loc}</Text>
            </View>
          </View>
          <View style={styles.profile}>
            <Text style={styles.profileText} {...shrinkToFit(0.8)}>
              {d.profile}
            </Text>
            <ArrowRight size={t.profileIcon} color={c.brown} strokeWidth={2.2} />
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.caseTitle}
            </Text>
            <View style={styles.idChip}>
              <Text style={styles.idText}>{d.id}</Text>
              <Copy size={t.idIcon} color={c.inkWarm} strokeWidth={2} />
            </View>
          </View>
          <View style={styles.panel}>
            {d.grid.map((row, i) => (
              <View key={i} style={[styles.gridRow, i > 0 && styles.gridNext]}>
                {row.map(([l, v]) => (
                  <View key={l} style={styles.flex}>
                    <Text style={styles.label}>{l}</Text>
                    <Text style={styles.value}>{v}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.statusCaps} {...shrinkToFit(0.8)}>
              {d.statusCaps}
            </Text>
            <View style={[styles.pill, styles.pillGreen]}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPill} {...shrinkToFit(0.8)}>
                {d.statusPill}
              </Text>
            </View>
          </View>
          <Text style={styles.statusBody}>{d.statusBody}</Text>
          <Text style={styles.okSub}>{d.statusSub}</Text>
        </View>

        <View style={[styles.card, styles.next, styles.nextCard]}>
          <View style={styles.nextHead}>
            <View style={styles.nextTile}>
              <FileText size={t.nextGlyph} color={c.brownInk} strokeWidth={2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.nextCaps}>{d.nextCaps}</Text>
              <Text style={styles.nextTitle} {...shrinkToFit(0.75)}>
                {d.nextTitle}
              </Text>
            </View>
          </View>
          <Text style={[styles.statusBody, styles.nextBody]}>{d.nextBody}</Text>
          <Text style={[styles.okSub, styles.nextSub]}>{d.nextSub}</Text>
          <View style={styles.doc}>
            <ClipboardClock size={t.docIcon} color={c.inkMuted} strokeWidth={1.9} />
            <Text style={styles.docText} {...shrinkToFit(0.8)}>
              {d.docLabel}
            </Text>
            <View style={[styles.pill, styles.pillGrey]}>
              <Text style={styles.waitChipText} {...shrinkToFit(0.8)}>
                {d.docChip}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <Text style={styles.title}>{d.talkTitle}</Text>
          <Text style={[styles.okSub, styles.talkBody]}>{d.talkBody}</Text>
          <View style={styles.talkRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.talk}
            >
              <MessageSquare size={t.talkIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.talkText}>{d.chat}</Text>
            </Pressable>
            <View style={styles.talk}>
              <Phone size={t.talkIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.talkText}>{d.call}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.progress]}>
          <Text style={styles.title}>{d.progressTitle}</Text>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map((s) => {
              const done = s.state === 'done';
              const cur = s.state === 'current';
              const wait = s.state === 'wait';
              return (
                <View key={s.title} style={[styles.tlRow, wait && styles.tlWait]}>
                  <View style={[styles.disc, done && styles.discDone, cur && styles.discCur]}>
                    {done && <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {wait && <View style={styles.waitDot} />}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.tlTitle, cur && styles.tlTitleCur, wait && styles.tlTitleWait]}>{s.title}</Text>
                    <Text style={[styles.tlStatus, cur && styles.tlStatusCur, wait && styles.tlStatusWait]}>
                      {s.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.what}>
          <View style={styles.whatHead}>
            <Info size={t.whatIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.whatTitle} {...shrinkToFit(0.8)}>
              {d.whatTitle}
            </Text>
          </View>
          {d.whatBody.map((b, i) => (
            <Text key={b} style={[styles.whatBody, i > 0 && styles.whatPara]}>
              {b}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.wait}
          onPress={() => router.push('/services/district-court/documents-needed' as Href)}
          style={styles.wait}
        >
          <Hourglass size={t.waitIcon} color={c.inkWarm} strokeWidth={2} />
          <Text style={styles.waitText} {...shrinkToFit(0.8)}>
            {d.wait}
          </Text>
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
  hdrSub: { fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },

  notif: {
    marginTop: t.notifTop,
    minHeight: t.notifH,
    borderRadius: t.notifH / 2,
    paddingHorizontal: t.notifPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.notifGap,
  },
  notifText: { flex: 1, fontFamily: font.appBody, fontSize: t.notifSize, lineHeight: t.notifLineHeight, color: c.inkWarm },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  first: { marginTop: t.firstTop },
  next: { marginTop: t.cardGap },

  okRow: { flexDirection: 'row', gap: t.okGap },
  okDisc: {
    width: t.okDisc,
    height: t.okDisc,
    borderRadius: t.okDisc / 2,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okTitle: { fontFamily: font.appSemi, fontSize: t.okTitleSize, lineHeight: t.okTitleLineHeight, color: c.ink },
  okBody: { marginTop: t.okBodyTop, fontFamily: font.appBody, fontSize: t.okBodySize, lineHeight: t.okBodyLineHeight, color: c.ink },
  okSubTight: { marginTop: t.okSubTight },
  okSub: { marginTop: t.okSubTop, fontFamily: font.appBody, fontSize: t.okSubSize, lineHeight: t.okSubLineHeight, color: c.inkWarm },

  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  pillPeach: { backgroundColor: c.peach },
  pillGreen: { backgroundColor: c.greenSoft },
  pillGrey: { backgroundColor: c.helpGrey },
  capsText: { fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.brownInk },
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
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.panel,
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  loc: { marginTop: t.locTop, fontFamily: font.appBody, fontSize: t.locSize, color: c.inkMuted },
  profile: {
    marginTop: t.profileTop,
    height: t.profileH,
    borderRadius: t.profileRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.profileGap,
  },
  profileText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.profileSize, color: c.brown },

  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  idChip: {
    height: t.idH,
    borderRadius: t.idH / 2,
    paddingHorizontal: t.idPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.idGap,
  },
  idText: { fontFamily: font.appSemi, fontSize: t.idSize, letterSpacing: t.idSpacing, color: c.inkWarm },
  panel: {
    marginTop: t.panelTop,
    borderRadius: t.panelRadius,
    paddingHorizontal: t.panelPadX,
    paddingVertical: t.panelPadY,
    backgroundColor: c.panel,
  },
  gridRow: { flexDirection: 'row', gap: t.gridGap },
  gridNext: { marginTop: t.gridRowGap },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: c.inkMuted,
  },
  value: { fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },

  statusCaps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.inkWarm },
  statusDot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: status.active },
  statusPill: { fontFamily: font.appSemi, fontSize: t.statusPillSize, color: c.greenInk },
  statusBody: {
    marginTop: t.statusBodyTop,
    fontFamily: font.appBody,
    fontSize: t.statusBodySize,
    lineHeight: t.statusBodyLineHeight,
    color: c.ink,
  },

  nextCard: { backgroundColor: c.peachSoft },
  nextHead: { flexDirection: 'row', alignItems: 'center', gap: t.nextGap },
  nextTile: {
    width: t.nextTile,
    height: t.nextTile,
    borderRadius: t.nextTileRadius,
    backgroundColor: c.avatarTan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCaps: { fontFamily: font.appSemi, fontSize: t.nextCapsSize, letterSpacing: t.capsSpacing, color: c.brown },
  nextTitle: { fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { marginTop: t.nextBodyTop },
  nextSub: { marginTop: t.nextSubTop },
  doc: {
    marginTop: t.docTop,
    minHeight: t.docH,
    borderRadius: t.docRadius,
    paddingHorizontal: t.docPadX,
    backgroundColor: p.docRow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.docGap,
  },
  docText: { flex: 1, fontFamily: font.appSemi, fontSize: t.docSize, color: c.ink },
  waitChipText: { fontFamily: font.appSemi, fontSize: t.waitChipSize, letterSpacing: t.idSpacing, color: c.inkWarm },

  talkBody: { marginTop: t.talkBodyTop },
  talkRow: { marginTop: t.talkTop, flexDirection: 'row', gap: t.colGap },
  talk: {
    flex: 1,
    minWidth: 0,
    height: t.talkH,
    borderRadius: t.talkRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.talkGap,
    ...shadow,
  },
  talkText: { fontFamily: font.appSemi, fontSize: t.talkSize, color: c.ink },

  tl: { marginTop: t.tlTop },
  progress: { paddingBottom: t.tlPadBottom },
  rail: {
    position: 'absolute',
    left: t.tlInset + (t.tlDisc - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlWaitH / 2,
    width: t.tlRail,
    backgroundColor: c.rail,
  },
  tlRow: { minHeight: t.tlRowH, paddingHorizontal: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlWait: { minHeight: t.tlWaitH },
  disc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: dcDecidePalette.waitDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: c.greenInk },
  discCur: { backgroundColor: c.card, borderWidth: t.tlRing, borderColor: c.brown },
  waitDot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: dcDecidePalette.waitDot },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleCur: { color: c.brown },
  tlTitleWait: { fontFamily: font.appBody, color: dcDecidePalette.waitInk },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.greenInk },
  tlStatusCur: { color: c.brown },
  tlStatusWait: { color: dcStepperPalette.muted },

  what: { marginTop: t.cardGap, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.panel },
  whatHead: { flexDirection: 'row', alignItems: 'center', gap: t.whatGap },
  whatTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.whatTitleSize, lineHeight: t.whatTitleLineHeight, color: c.ink },
  whatBody: {
    marginTop: t.whatBodyTop,
    fontFamily: font.appBody,
    fontSize: t.whatBodySize,
    lineHeight: t.whatBodyLineHeight,
    color: c.inkWarm,
  },
  whatPara: { marginTop: t.whatParaGap },

  bar: {
    paddingHorizontal: t.padX,
    paddingTop: t.barPadTop,
    borderTopWidth: t.barRule,
    borderTopColor: c.rail,
    backgroundColor: c.page,
  },
  wait: {
    height: t.waitH,
    borderRadius: t.waitH / 2,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.waitGap,
  },
  waitText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.waitSize, color: c.inkWarm },
  cap: {
    marginTop: t.capTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.capSize,
    lineHeight: t.capLineHeight,
    color: c.inkMuted,
  },
});
