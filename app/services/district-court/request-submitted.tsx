import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  CircleCheck,
  ClipboardList,
  Copy,
  FileQuestion,
  Info,
  Lightbulb,
  LockKeyhole,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { DC_SUBMITTED } from '../../../data/districtCourt';
import { dcSubmitted as t, font, hcPalette as c, ink, status } from '../../../constants/theme';

// District Court — request submitted (design/299). Measured at 2.000 px/pt.
//
// ⚠ CROSS-SERVICE — reached from the HIGH COURT payment's success screen
// (design/298), the only next screen the batch draws, and it is a DISTRICT
// COURT screen: DC-2026-1048, District Court, Indore, "₹25,000 estimated,
// payable later" one step after a ₹40,680 High Court payment.
//
// STATIC, NOT WIRED: Copy copies nothing, the timeline is a drawing (no status
// feed), and no notification is sent. View Request opens design/300 (Advocate
// Assigned); Contact Support opens support chat.

export default function DistrictCourtRequestSubmittedScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_SUBMITTED;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} avatar backHref={'/(tabs)/home' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <View style={styles.badgeInner}>
            <CircleCheck size={t.badgeGlyph} color={c.greenInk} strokeWidth={2.4} />
          </View>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.sub}</Text>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            {d.pill}
          </Text>
        </View>

        <View style={[styles.card, styles.first]}>
          <View style={styles.between}>
            <Text style={styles.idLabel}>{d.idLabel}</Text>
            <View style={styles.row}>
              <BadgeCheck size={t.idMetaIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.idMeta}>{d.idMeta}</Text>
            </View>
          </View>
          <View style={[styles.between, styles.idRow]}>
            <Text style={styles.id} {...shrinkToFit(0.8)}>
              {d.id}
            </Text>
            {/* Inert — nothing is copied. */}
            <View style={styles.copy}>
              <Copy size={t.copyIcon} color={c.brownInk} strokeWidth={2} />
              <Text style={styles.copyText}>{d.copy}</Text>
            </View>
          </View>
          <View style={[styles.row, styles.idInfo]}>
            <Info size={t.idInfoIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.idInfoText} {...shrinkToFit(0.75)}>
              {d.idInfo}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.status]}>
          <View style={styles.between}>
            <Text style={styles.statusLabel}>{d.statusLabel}</Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>{d.statusPill}</Text>
            </View>
          </View>
          <Text style={styles.statusTitle}>{d.statusTitle}</Text>
          <Text style={styles.statusBody}>{d.statusBody}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.between}>
            <View style={styles.row}>
              <ClipboardList size={t.reqIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.reqTitle}>{d.reqTitle}</Text>
            </View>
            <View style={styles.reqPill}>
              <Text style={styles.reqPillText}>{d.reqPill}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([l, v]) => (
              <View key={l} style={styles.kv}>
                <Text style={styles.kvLabel}>{l}</Text>
                <Text style={styles.kvValue}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={styles.fee}>
            <View style={styles.flex}>
              <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
                {d.feeTitle}
              </Text>
              <Text style={styles.feeSub} {...shrinkToFit(0.75)}>
                {d.feeSub}
              </Text>
            </View>
            <Text style={styles.feePrice} {...shrinkToFit(0.8)}>
              {d.fee}
            </Text>
          </View>
          <View style={styles.lock}>
            <LockKeyhole size={t.lockIcon} color={c.brown} strokeWidth={2} />
            <Text style={styles.lockText}>{d.lock}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.nextTitle}>{d.nextTitle}</Text>
            <Text style={styles.nextMeta}>{d.nextMeta}</Text>
          </View>
          <View style={styles.tl}>
            {d.timeline.map((s, i) => {
              const last = i === d.timeline.length - 1;
              return (
                <View key={s.title} style={styles.tlRow}>
                  <View style={styles.tlRailCol}>
                    <View
                      style={[
                        styles.tlDisc,
                        s.state === 'done' && styles.tlDone,
                        s.state === 'active' && styles.tlActive,
                      ]}
                    >
                      {s.state === 'done' ? (
                        <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />
                      ) : (
                        <View style={[styles.tlDot, s.state === 'active' && styles.tlDotActive]} />
                      )}
                    </View>
                    {!last && <View style={styles.tlRail} />}
                  </View>
                  <View style={[styles.tlBody, s.state !== 'waiting' && styles.tlBodyTall]}>
                    <View style={styles.tlTitleRow}>
                      <Text
                        style={[
                          styles.tlTitle,
                          s.state === 'active' && styles.tlTitleActive,
                          s.state === 'waiting' && styles.tlTitleWait,
                        ]}
                        {...shrinkToFit(0.8)}
                      >
                        {s.title}
                      </Text>
                      {'chip' in s && (
                        <View style={styles.tlChip}>
                          <Text style={styles.tlChipText}>{s.chip}</Text>
                        </View>
                      )}
                      {s.state === 'waiting' && <Text style={styles.tlWait}>{d.waiting}</Text>}
                    </View>
                    {'desc' in s && (
                      <Text style={[styles.tlDesc, s.state === 'done' && styles.tlDescDone]}>{s.desc}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.now}>
          <View style={styles.row}>
            <Lightbulb size={t.nowIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.nowTitle}>{d.nowTitle}</Text>
          </View>
          <Text style={styles.nowBody}>{d.nowBody}</Text>
        </View>

        <View style={[styles.card, styles.mini]}>
          <View style={[styles.miniDisc, styles.discPeach]}>
            <BellRing size={t.miniGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.miniTitle}>{d.stayTitle}</Text>
            <Text style={styles.miniBody}>{d.stayBody}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.mini, styles.help]}>
          <View style={[styles.miniDisc, styles.discGrey]}>
            <FileQuestion size={t.miniGlyph} color={c.brown} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.miniTitle}>{d.helpTitle}</Text>
            <Text style={styles.miniBody}>{d.helpSub}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/support-chat' as Href)} style={styles.support}>
            <Text style={styles.supportText}>{d.support}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.homePadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/advocate-assigned' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/home' as Href)}>
          <Text style={styles.home}>{d.home}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.idMetaGap },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  badge: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: c.greenRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: t.badgeInner,
    height: t.badgeInner,
    borderRadius: t.badgeInner / 2,
    backgroundColor: c.greenInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { marginTop: t.titleTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.titleSize, color: c.ink },
  sub: { marginTop: t.subTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.subSize, color: c.inkWarm },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.greenInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.ink },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPad,
  },
  first: { marginTop: t.cardTop },
  idLabel: { fontFamily: font.appSemi, fontSize: t.idLabelSize, letterSpacing: t.idLabelSpacing, color: c.inkWarm },
  idMeta: { fontFamily: font.appSemi, fontSize: t.idMetaSize, color: c.greenInk },
  idRow: { marginTop: t.idTop },
  id: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.idSize, color: c.ink },
  copy: {
    height: t.copyH,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: c.peachNote,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.idMetaGap,
  },
  copyText: { fontFamily: font.appSemi, fontSize: t.copySize, color: c.brownInk },
  idInfo: { marginTop: t.idInfoTop, gap: t.idInfoGap },
  idInfoText: { flex: 1, fontFamily: font.appBody, fontSize: t.idInfoSize, color: c.inkWarm },

  status: { backgroundColor: c.peachSoft, paddingTop: t.statusPadTop },
  statusLabel: { fontFamily: font.appSemi, fontSize: t.statusLabelSize, color: c.brownInk },
  statusPill: {
    height: t.statusPillH,
    borderRadius: t.statusPillRadius,
    paddingHorizontal: t.statusPillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.idMetaGap,
  },
  statusDot: { width: t.statusPillDot, height: t.statusPillDot, borderRadius: t.statusPillDot / 2, backgroundColor: c.brown },
  statusPillText: { fontFamily: font.appSemi, fontSize: t.statusPillSize, color: c.brownInk },
  statusTitle: { marginTop: t.statusTitleTop, fontFamily: font.appSemi, fontSize: t.statusTitleSize, color: c.ink },
  statusBody: {
    marginTop: t.statusBodyTop,
    fontFamily: font.appBody,
    fontSize: t.statusBodySize,
    lineHeight: t.statusBodyLineHeight,
    color: c.inkWarm,
  },

  reqTitle: { marginLeft: t.reqIconGap - t.idMetaGap, fontFamily: font.appSemi, fontSize: t.reqTitleSize, color: c.ink },
  reqPill: { height: t.reqPillH, borderRadius: t.reqPillRadius, paddingHorizontal: t.reqPillPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  reqPillText: { fontFamily: font.appSemi, fontSize: t.reqPillSize, color: c.inkWarm },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  kv: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.rowColGap },
  kvLabel: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    lineHeight: t.rowLabelLineHeight,
    color: c.inkWarm,
  },
  kvValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    lineHeight: t.rowValueLineHeight,
    color: c.ink,
  },
  fee: {
    marginTop: t.feeTop,
    borderRadius: t.feeRadius,
    backgroundColor: c.panel,
    padding: t.feePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeTitle: { fontFamily: font.appSemi, fontSize: t.feeTitleSize, color: c.ink },
  feeSub: { marginTop: t.feeSubTop, fontFamily: font.appSemi, fontSize: t.feeSubSize, color: c.greenInk },
  feePrice: { marginLeft: t.feePriceGap, fontFamily: font.appHeading, fontSize: t.feePriceSize, color: c.ink },
  lock: {
    marginTop: t.lockTop,
    paddingHorizontal: t.lockPadX,
    paddingBottom: t.lockPadBottom,
    flexDirection: 'row', alignItems: 'flex-start', gap: t.lockGap },
  lockText: { flex: 1, fontFamily: font.appBody, fontSize: t.lockSize, lineHeight: t.lockLineHeight, color: c.inkWarm },

  next: { paddingHorizontal: t.nextPadX, paddingTop: t.nextPadTop, paddingBottom: t.nextPadBottom },
  nextTitle: { fontFamily: font.appSemi, fontSize: t.nextTitleSize, color: c.ink },
  nextMeta: { fontFamily: font.appSemi, fontSize: t.nextMetaSize, color: c.brownInk },
  tl: { marginTop: t.tlTop, paddingLeft: t.tlInset },
  tlRow: { flexDirection: 'row' },
  tlRailCol: { width: t.tlDisc, alignItems: 'center' },
  tlDisc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlDone: { backgroundColor: c.greenInk },
  tlActive: { backgroundColor: c.brown },
  tlDot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: c.tagMuted },
  tlDotActive: { width: t.tlDot * 1.25, height: t.tlDot * 1.25, borderRadius: t.tlDot, backgroundColor: c.peach },
  tlRail: { flex: 1, width: t.tlRail, backgroundColor: c.rail },
  tlBody: { flex: 1, marginLeft: t.tlGap, minHeight: t.tlRowH },
  tlBodyTall: { minHeight: t.tlDoneRowH },
  tlTitleRow: { flexDirection: 'row', alignItems: 'center', gap: t.idMetaGap, minHeight: t.tlDisc },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, color: c.ink },
  tlTitleActive: { color: c.brownInk },
  tlTitleWait: { flex: 1, fontFamily: font.appBody, color: c.inkMuted },
  tlChip: { height: t.tlChipH, borderRadius: t.tlChipRadius, paddingHorizontal: t.tlChipPadX, backgroundColor: c.peach, justifyContent: 'center' },
  tlChipText: { fontFamily: font.appSemi, fontSize: t.tlChipSize, color: c.brownInk },
  tlWait: { fontFamily: font.appSemi, fontSize: t.tlWaitSize, color: c.inkMuted },
  tlDesc: { fontFamily: font.appBody, fontSize: t.tlDescSize, color: c.ink },
  tlDescDone: { color: c.greenInk },

  now: { marginTop: t.nowTop, borderRadius: t.cardRadius, backgroundColor: c.panel, padding: t.nowPad, paddingTop: t.nowPadTop },
  nowTitle: { marginLeft: t.nowIconGap - t.idMetaGap, fontFamily: font.appSemi, fontSize: t.nowTitleSize, color: c.ink },
  nowBody: { marginTop: t.nowBodyTop, fontFamily: font.appBody, fontSize: t.nowBodySize, lineHeight: t.nowBodyLineHeight, color: c.inkWarm },

  mini: { marginTop: t.miniTop, paddingHorizontal: t.miniPad, paddingVertical: t.miniPadY, flexDirection: 'row', alignItems: 'center' },
  miniDisc: {
    width: t.miniDisc,
    height: t.miniDisc,
    borderRadius: t.miniDisc / 2,
    marginRight: t.miniGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  help: { marginTop: t.helpTop },
  discPeach: { backgroundColor: c.peach },
  discGrey: { backgroundColor: c.helpGrey },
  miniTitle: { fontFamily: font.appSemi, fontSize: t.miniTitleSize, color: c.ink },
  miniBody: { fontFamily: font.appBody, fontSize: t.miniBodySize, lineHeight: t.miniBodyLineHeight, color: c.inkWarm },
  support: {
    height: t.supportH,
    borderRadius: t.supportRadius,
    paddingHorizontal: t.supportPadX,
    backgroundColor: c.helpGrey,
    justifyContent: 'center',
  },
  supportText: { fontFamily: font.appSemi, fontSize: t.supportSize, color: c.brownInk },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
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
  home: { marginTop: t.homeTop, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.homeSize, color: c.inkWarm },
});
