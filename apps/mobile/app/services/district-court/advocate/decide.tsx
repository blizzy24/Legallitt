import { AdvocateAvatar } from '../../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  CircleCheck,
  Copy,
  Gavel,
  Info,
  MapPin,
  MessageSquareText,
  PhoneCall,
  UserSearch,
  X,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  advForensicRed,
  dcDecide as t,
  dcDecidePalette as p,
  dcPricingPalette,
  dcStepperPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../../constants/theme';
import { DC_DECIDE } from '../../../../data/districtCourt';

// District Court — decide on the advocate (design/345). Measured at 2.000 px/pt.
// Reached from Review Advocate on design/300 (which previously went to the
// High Court confirm screen, 302 — see 300's notes).
//
// Accept Advocate → design/346; Request New Advocate → design/347; Cancel
// Request → design/349. View Chat opens the existing advocate chat (301).
// The photo is an initials avatar, as on 300; the header avatar is the
// standard one.
//
// STATIC, NOT WIRED: Call Again dials nothing; Copy copies nothing; View Full
// Profile opens nothing (no profile is drawn for this advocate); the timeline
// is a drawing. See data/districtCourt.ts for the step counter, the advocate
// name conflict and the toast that is not built.

const CHIP_ICON = { award: Award, pin: MapPin, gavel: Gavel } as const;

export default function DistrictDecideScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_DECIDE;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/advocate-assigned' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ready}>
          <View style={styles.readyHead}>
            <View style={styles.readyIcon}>
              <Text style={styles.readyMark}>{d.readyMark}</Text>
            </View>
            <Text style={styles.readyTitle} {...shrinkToFit(0.8)}>
              {d.readyTitle}
            </Text>
          </View>
          <Text style={styles.readyBody}>{d.readyBody}</Text>
        </View>

        <View style={[styles.card, styles.cardNext]}>
          <View style={styles.advTop}>
            <View>
              <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.photo}><Text style={styles.photoText}>{d.initials}</Text></AdvocateAvatar>
              <View style={styles.photoBadge}>
                <Check size={t.photoBadgeGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
            </View>
            <View style={styles.flex}>
              <View style={styles.verified}>
                <BadgeCheck size={t.verifiedIcon} color={p.verifiedPill} fill={c.greenInk} strokeWidth={2} />
                <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                  {d.verified}
                </Text>
              </View>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <Text style={styles.bio}>{d.bio}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => {
              const Icon = CHIP_ICON[ch.icon];
              return (
                <View key={ch.label} style={styles.chip}>
                  <Icon size={t.chipIcon} color={c.inkWarm} strokeWidth={1.9} />
                  <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                    {ch.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.profile}>
            <Text style={styles.profileText} {...shrinkToFit(0.8)}>
              {d.profile}
            </Text>
            <ArrowRight size={t.profileIcon} color={c.brown} strokeWidth={2.2} />
          </View>
        </View>

        <View style={[styles.card, styles.cardNext]}>
          <Text style={styles.title}>{d.convTitle}</Text>
          <Text style={styles.body}>{d.convBody}</Text>
          <View style={[styles.cols, styles.availRow]}>
            {d.avail.map((a) => (
              <View key={a} style={styles.avail}>
                <CircleCheck size={t.availIcon} color={c.panel} fill={c.greenInk} strokeWidth={2.4} />
                <Text style={styles.availText} {...shrinkToFit(0.75)}>
                  {a}
                </Text>
              </View>
            ))}
          </View>
          <View style={[styles.cols, styles.talkRow]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={[styles.talk, styles.talkGrey]}
            >
              <MessageSquareText size={t.talkIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.talkText} {...shrinkToFit(0.75)}>
                {d.chat}
              </Text>
            </Pressable>
            <View style={[styles.talk, styles.talkPeach]}>
              <PhoneCall size={t.talkIcon} color={c.brownInk} strokeWidth={1.9} />
              <Text style={[styles.talkText, styles.talkTextPeach]} {...shrinkToFit(0.75)}>
                {d.call}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.cardNext]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.caseTitle}
            </Text>
            <View style={styles.tier}>
              <Text style={styles.tierText} {...shrinkToFit(0.8)}>
                {d.tier}
              </Text>
            </View>
          </View>
          <View style={styles.panel}>
            {d.rows.map(([l, v]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                  {v}
                </Text>
              </View>
            ))}
            <View style={[styles.row, styles.idRowGap]}>
              <Text style={styles.rowLabel}>{d.idLabel}</Text>
              <View style={styles.idRow}>
                <Text style={styles.id}>{d.id}</Text>
                <Copy size={t.copyIcon} color={c.brown} strokeWidth={2} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.ask}>{d.ask}</Text>
        <Text style={[styles.body, styles.askSub]}>{d.askSub}</Text>

        <View style={[styles.card, styles.opts]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={d.accept}
            onPress={() => router.push('/services/district-court/advocate/accepted' as Href)}
            style={styles.accept}
          >
            <Text style={styles.acceptText} {...shrinkToFit(0.8)}>
              {d.accept}
            </Text>
            <ArrowRight size={t.acceptIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.optCap}>{d.acceptCap}</Text>
          <View style={styles.rule} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={d.change}
            onPress={() => router.push('/services/district-court/advocate/change' as Href)}
            style={styles.newBtn}
          >
            <UserSearch size={t.newIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.newText} {...shrinkToFit(0.8)}>
              {d.change}
            </Text>
          </Pressable>
          <Text style={styles.optCap}>{d.changeCap}</Text>
          <View style={styles.rule} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={d.cancel}
            onPress={() => router.push('/services/district-court/advocate/cancel' as Href)}
            style={styles.cancel}
          >
            <X size={t.cancelIcon} color={advForensicRed.declineColour} strokeWidth={2.2} />
            <Text style={styles.cancelText}>{d.cancel}</Text>
          </Pressable>
          <Text style={styles.optCap}>{d.cancelCap}</Text>
        </View>

        <View style={styles.before}>
          <Info size={t.beforeIcon} color={dcPricingPalette.tierOn} fill={c.brownInk} strokeWidth={2} />
          <View style={styles.flex}>
            <Text style={styles.beforeTitle}>{d.beforeTitle}</Text>
            <Text style={[styles.body, styles.beforeBody]}>{d.beforeBody}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.statusCard]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.statusTitle}
            </Text>
            <Text style={styles.step}>{d.step}</Text>
          </View>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map((s) => {
              const done = s.state === 'done';
              const cur = s.state === 'current';
              return (
                <View key={s.title} style={[styles.tlRow, cur && styles.tlCur, s.state === 'wait' && styles.tlWait]}>
                  <View style={[styles.disc, done && styles.discDone, cur && styles.discCur]}>
                    {done && <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {s.state === 'wait' && <View style={styles.waitDot} />}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.tlTitle, cur && styles.tlTitleCur, s.state === 'wait' && styles.tlTitleWait]}>
                      {s.title}
                    </Text>
                    <Text style={[styles.tlStatus, cur && styles.tlStatusCur, s.state === 'wait' && styles.tlStatusWait]}>
                      {s.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  hdrSub: { fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },
  cols: { flexDirection: 'row', gap: t.colGap },

  ready: { marginTop: t.cardTop, borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.peachSoft, ...shadow },
  readyHead: { flexDirection: 'row', alignItems: 'center', gap: t.readyGap },
  readyIcon: {
    width: t.readyIcon,
    height: t.readyIcon,
    borderRadius: t.readyIconRadius,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyMark: { fontFamily: font.appHeading, fontSize: t.readyMarkSize, color: ink.onBrand },
  readyTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.readyTitleSize, lineHeight: t.readyTitleLineHeight, color: c.ink },
  readyBody: {
    marginTop: t.readyBodyTop,
    fontFamily: font.appBody,
    fontSize: t.readyBodySize,
    lineHeight: t.readyBodyLineHeight,
    color: c.inkWarm,
  },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  cardNext: { marginTop: t.cardGap },

  advTop: { flexDirection: 'row', gap: t.photoGap },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoTextSize, color: ink.onBrand },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: t.photoBadge,
    height: t.photoBadge,
    borderRadius: t.photoBadge / 2,
    borderWidth: t.photoBadgeBorder,
    borderColor: c.card,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verified: {
    alignSelf: 'flex-start',
    height: t.verifiedH,
    borderRadius: t.verifiedH / 2,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: p.verifiedPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verifiedGap,
  },
  verifiedText: { fontFamily: font.appSemi, fontSize: t.verifiedSize, letterSpacing: t.verifiedSpacing, color: c.greenInk },
  name: { marginTop: t.nameTop, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  bio: { marginTop: t.bioTop, fontFamily: font.appBody, fontSize: t.bioSize, lineHeight: t.bioLineHeight, color: c.inkWarm },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.chipGapX, rowGap: t.chipGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipIconGap,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  profile: {
    marginTop: t.profileTop,
    height: t.profileH,
    borderRadius: t.profileRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.profileGap,
  },
  profileText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.profileSize, color: c.brown },

  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  body: { marginTop: t.bodyTop, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  availRow: { marginTop: t.availTop },
  avail: {
    flex: 1,
    minWidth: 0,
    height: t.availH,
    borderRadius: t.availRadius,
    paddingHorizontal: t.availPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.availGap,
  },
  availText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.availSize, letterSpacing: t.availSpacing, color: c.ink },
  talkRow: { marginTop: t.talkTop },
  talk: {
    flex: 1,
    minWidth: 0,
    height: t.talkH,
    borderRadius: t.talkRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.talkGap,
  },
  talkGrey: { backgroundColor: c.helpGrey },
  talkPeach: { backgroundColor: c.peach },
  talkText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.talkSize, color: c.ink },
  talkTextPeach: { color: c.brownInk },

  tier: {
    height: t.tierH,
    borderRadius: t.tierH / 2,
    paddingHorizontal: t.tierPadX,
    backgroundColor: c.peach,
    justifyContent: 'center',
    flexShrink: 1,
  },
  tierText: { fontFamily: font.appSemi, fontSize: t.tierSize, letterSpacing: t.tierSpacing, color: c.brownInk },
  panel: {
    marginTop: t.panelTop,
    borderRadius: t.panelRadius,
    paddingHorizontal: t.panelPadX,
    paddingVertical: t.panelPadY,
    backgroundColor: c.panel,
  },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: c.inkWarm },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: t.copyGap },
  id: { fontFamily: font.appSemi, fontSize: t.idSize, color: c.brown },

  askSub: { marginTop: t.askSubTop },
  idRowGap: { marginTop: t.idRowTop },
  statusCard: { marginTop: t.statusTop },
  tlWait: { minHeight: t.tlWaitH },
  ask: { marginTop: t.askTop, fontFamily: font.appSemi, fontSize: t.askSize, lineHeight: t.askLineHeight, color: c.ink },
  opts: { marginTop: t.optsTop },
  accept: {
    height: t.acceptH,
    borderRadius: t.acceptRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.acceptGap,
    ...shadow,
  },
  acceptText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.acceptSize, color: ink.onBrand },
  optCap: {
    marginTop: t.optCapTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.optCapSize,
    lineHeight: t.optCapLineHeight,
    color: c.inkWarm,
  },
  rule: { marginTop: t.ruleTop, marginBottom: t.ruleBottom, height: t.ruleH, backgroundColor: c.rail },
  newBtn: {
    height: t.newH,
    borderRadius: t.newRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.newGap,
  },
  newText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.newSize, color: c.brown },
  cancel: { marginTop: t.cancelTop, minHeight: t.cancelH, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.cancelGap },
  cancelText: { fontFamily: font.appSemi, fontSize: t.cancelSize, color: advForensicRed.declineColour },

  before: {
    marginTop: t.beforeTop,
    borderRadius: t.cardRadius,
    padding: t.cardPad,
    backgroundColor: dcPricingPalette.tierOn,
    flexDirection: 'row',
    gap: t.beforeGap,
    ...shadow,
  },
  beforeTitle: { fontFamily: font.appSemi, fontSize: t.beforeTitleSize, lineHeight: t.beforeTitleLineHeight, color: c.brownInk },
  beforeBody: { marginTop: t.beforeBodyTop },

  step: { fontFamily: font.appSemi, fontSize: t.statusStepSize, color: c.brown },
  tl: { marginTop: t.tlTop },
  rail: {
    position: 'absolute',
    left: t.tlInset + (t.tlDisc - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlRowH / 2,
    width: t.tlRail,
    backgroundColor: c.rail,
  },
  tlRow: { minHeight: t.tlRowH, paddingHorizontal: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlCur: { minHeight: t.tlCurH, borderRadius: t.tlCurRadius, backgroundColor: p.currentRow },
  disc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: p.waitDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: c.greenInk },
  discCur: { backgroundColor: c.card, borderWidth: t.tlRing, borderColor: c.brown },
  waitDot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: p.waitDot },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleCur: { fontSize: t.tlCurSize, color: c.brown },
  tlTitleWait: { fontFamily: font.appBody, color: p.waitInk },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.greenInk },
  tlStatusCur: {
    fontFamily: font.appSemi,
    fontSize: t.tlCurStatusSize,
    letterSpacing: t.tlCurStatusSpacing,
    color: c.brown,
  },
  tlStatusWait: { color: dcStepperPalette.muted },
});
