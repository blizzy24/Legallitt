import { router, type Href } from 'expo-router';
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  CircleCheck,
  CircleQuestionMark,
  Gavel,
  Languages,
  MessageSquare,
  ShieldCheck,
  SquareUserRound,
  Star,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { courierHeader as h, font, hcConfirm as t, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { HC_CONFIRM } from '../../../data/highCourt';

// High Court — confirm advocate (design/302). Measured at 2.000 px/pt.
//
// ⚠ CROSS-SERVICE — reached from the District Court screen (design/300), and
// Cancel's own copy sends the client back there ("return to Assigned Advocate").
// Conflicts 6 and 9 are commented on HC_CONFIRM.
//
// Wiring: Accept Advocate opens design/303 (Documents You Need); Request New
// Advocate opens design/319 (the change request); Cancel returns to design/300;
// Chat with Support opens support chat; the help icon opens the Help Centre.
// Nothing is accepted, recorded or sent.

export default function HighCourtConfirmAdvocateScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_CONFIRM;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        plainChevron
        center
        backHref={'/services/district-court/advocate-assigned' as Href}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            hitSlop={8}
            onPress={() => router.push('/help' as Href)}
            style={styles.help}
          >
            <CircleQuestionMark size={t.helpIcon} color={h.ink} strokeWidth={1.9} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.step}>
          <View style={styles.stepDot} />
          <Text style={styles.stepText} {...shrinkToFit(0.7)}>
            {d.step}
          </Text>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={[styles.card, styles.adv]}>
          <View style={styles.advTop}>
            <View>
              <View style={styles.photo} />
              <View style={styles.badge}>
                <BadgeCheck size={t.badgeGlyph} color={ink.onBrand} strokeWidth={2.4} />
              </View>
            </View>
            <View style={styles.info}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <View style={styles.ver}>
                <CircleCheck size={t.verIcon} color={c.card} fill={c.greenInk} strokeWidth={2.4} />
                <Text style={styles.verText} {...shrinkToFit(0.8)}>
                  {d.verified}
                </Text>
              </View>
              <View style={styles.court}>
                <Gavel size={t.courtIcon} color={c.inkWarm} strokeWidth={1.9} />
                <Text style={styles.courtText}>{d.court}</Text>
              </View>
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{d.trackLabel}</Text>
              <Text style={styles.statValue}>{d.track}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{d.ratingLabel}</Text>
              <View style={styles.rating}>
                <Star size={t.starIcon} color={c.brown} fill={c.brown} strokeWidth={1.5} />
                <Text style={styles.statValue}>{d.rating}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.meta, styles.metaFirst]}>
            <View style={styles.metaLabel}>
              <ShieldCheck size={t.metaIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.metaLabelText}>{d.barLabel}</Text>
            </View>
            <View style={styles.barPill}>
              <Text style={styles.barPillText} {...shrinkToFit(0.75)}>
                {d.barId}
              </Text>
            </View>
          </View>
          <View style={styles.meta}>
            <View style={styles.metaLabel}>
              <Languages size={t.metaIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.metaLabelText}>{d.langLabel}</Text>
            </View>
            <Text style={styles.langs}>{d.langs}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.matter]}>
          <View style={styles.matterDisc}>
            <SquareUserRound size={t.matterGlyph} color={c.inkWarm} strokeWidth={1.9} />
          </View>
          <View style={styles.matterText}>
            <Text style={styles.matterLabel}>{d.matterLabel}</Text>
            <Text style={styles.matterTitle}>{d.matter}</Text>
            <Text style={styles.matterBody}>{d.matterBody}</Text>
          </View>
        </View>

        <Text style={styles.q}>{d.question}</Text>
        <Text style={styles.qSub}>{d.questionSub}</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/documents-needed' as Href)}
          style={styles.accept}
        >
          <View style={styles.acceptText}>
            <View style={styles.acceptTitleRow}>
              <Text style={styles.acceptTitle} {...shrinkToFit(0.8)}>
                {d.accept}
              </Text>
              {/* Drawn twice — an arrow in the label and one at the edge. */}
              <ArrowRight size={t.inlineArrow} color={ink.onBrand} strokeWidth={2.2} />
            </View>
            <Text style={styles.acceptSub} {...shrinkToFit(0.75)}>
              {d.acceptSub}
            </Text>
          </View>
          <ArrowRight size={t.acceptIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/change-request' as Href)}
          style={styles.newBtn}
        >
          <ArrowLeftRight size={t.newIcon} color={c.brownInk} strokeWidth={2} />
          <Text style={styles.newText}>{d.requestNew}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/services/district-court/advocate-assigned' as Href)}
          style={styles.cancel}
        >
          <Text style={styles.cancelText}>{d.cancel}</Text>
        </Pressable>
        <Text style={styles.cancelBody}>{d.cancelBody}</Text>

        <View style={styles.foot}>
          <ShieldCheck size={t.footShield} color={c.card} fill={c.greenInk} strokeWidth={2} />
          {d.foot.map((f, i) => (
            <Fragment key={f}>
              {i > 0 && <View style={styles.footDot} />}
              <Text style={styles.footText} {...shrinkToFit(0.75)}>
                {f}
              </Text>
            </Fragment>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat' as Href)}
          style={styles.need}
        >
          <MessageSquare size={t.needIcon} color={c.ink} strokeWidth={1.9} />
          <Text style={styles.needText} {...shrinkToFit(0.75)}>
            {d.need}
            <Text style={styles.needLink}>{d.needLink}</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  help: { marginRight: t.helpGap },

  step: {
    marginTop: t.stepTop,
    alignSelf: 'center',
    maxWidth: '100%',
    height: t.stepH,
    borderRadius: t.stepH / 2,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepGap,
  },
  stepDot: { width: t.stepDot, height: t.stepDot, borderRadius: t.stepDot / 2, backgroundColor: c.brown },
  stepText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  h1: {
    marginTop: t.h1Top,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.h1Size,
    lineHeight: t.h1LineHeight,
    color: c.ink,
  },
  sub: {
    marginTop: t.subTop,
    paddingHorizontal: t.subPadX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: c.inkWarm,
  },

  card: { marginLeft: t.cardLeft - t.padX, borderRadius: t.cardRadius, backgroundColor: c.card },
  adv: {
    marginTop: t.cardTop,
    paddingLeft: t.cardPadL,
    paddingRight: t.cardPadR,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  advTop: { flexDirection: 'row', alignItems: 'flex-start' },
  photo: { width: t.photo, height: t.photo, borderRadius: t.photo / 2, backgroundColor: c.photoRed },
  badge: {
    position: 'absolute',
    right: t.badgeX,
    bottom: t.badgeY,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    borderWidth: t.badgeBorder,
    borderColor: c.card,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0, marginLeft: t.infoGap, marginTop: t.infoTop },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  ver: {
    marginTop: t.verTop,
    alignSelf: 'flex-start',
    height: t.verH,
    borderRadius: t.verH / 2,
    paddingHorizontal: t.verPadX,
    backgroundColor: c.greenBanner,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verGap,
  },
  verText: { fontFamily: font.appSemi, fontSize: t.verSize, color: c.greenInk },
  court: { marginTop: t.courtTop, flexDirection: 'row', alignItems: 'center', gap: t.courtGap },
  courtText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.courtSize, color: c.inkWarm },

  stats: {
    marginTop: t.statsTop,
    borderRadius: t.statsRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.statsPadX,
    paddingTop: t.statsPadTop,
    paddingBottom: t.statsPadBottom,
    flexDirection: 'row',
    gap: t.statsColGap,
  },
  stat: { flex: 1, minWidth: 0 },
  statLabel: { fontFamily: font.appBody, fontSize: t.statLabelSize, lineHeight: t.statLabelLineHeight, color: c.inkWarm },
  statValue: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.statValueSize,
    lineHeight: t.statValueLineHeight,
    color: c.ink,
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: t.courtGap },

  meta: {
    marginTop: t.metaGap,
    minHeight: t.metaRowH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.metaIconGap,
  },
  metaFirst: { marginTop: t.metaTop },
  metaLabel: { flexDirection: 'row', alignItems: 'center', gap: t.metaIconGap, flexShrink: 1 },
  metaLabelText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.metaLabelSize, color: c.inkWarm },
  barPill: {
    flexShrink: 1,
    height: t.barPillH,
    borderRadius: t.barPillRadius,
    paddingHorizontal: t.barPillPadX,
    backgroundColor: c.greenBanner,
    justifyContent: 'center',
  },
  barPillText: { fontFamily: font.appSemi, fontSize: t.barPillSize, letterSpacing: t.barPillSpacing, color: c.greenInk },
  langs: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.langSize, color: c.ink },

  matter: {
    marginTop: t.matterTop,
    backgroundColor: c.panel,
    paddingHorizontal: t.matterPadX,
    paddingTop: t.matterPadTop,
    paddingBottom: t.matterPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  matterDisc: {
    width: t.matterDisc,
    height: t.matterDisc,
    borderRadius: t.matterDisc / 2,
    backgroundColor: c.matterDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterText: { flex: 1, minWidth: 0, marginLeft: t.matterGap, marginTop: t.matterTextTop },
  matterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.matterLabelSize,
    lineHeight: t.matterLabelLineHeight,
    letterSpacing: t.matterLabelSpacing,
    color: c.inkWarm,
  },
  matterTitle: {
    marginTop: t.matterTitleTop,
    fontFamily: font.appSemi,
    fontSize: t.matterTitleSize,
    lineHeight: t.matterTitleLineHeight,
    color: c.ink,
  },
  matterBody: {
    marginTop: t.matterBodyTop,
    fontFamily: font.appBody,
    fontSize: t.matterBodySize,
    lineHeight: t.matterBodyLineHeight,
    color: c.inkWarm,
  },

  q: {
    marginTop: t.qTop,
    paddingHorizontal: t.qPadX,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.qSize,
    lineHeight: t.qLineHeight,
    color: c.ink,
  },
  qSub: {
    marginTop: t.qSubTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.qSubSize,
    lineHeight: t.qSubLineHeight,
    color: c.inkWarm,
  },

  accept: {
    marginTop: t.acceptTop,
    minHeight: t.acceptH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    paddingHorizontal: t.acceptPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptText: { flex: 1, minWidth: 0 },
  acceptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: t.courtGap },
  acceptTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.acceptSize, color: ink.onBrand },
  acceptSub: {
    fontFamily: font.appBody,
    fontSize: t.acceptSubSize,
    color: ink.onBrand,
    opacity: t.acceptSubOpacity,
  },
  newBtn: {
    ...shadow,
    marginTop: t.newTop,
    height: t.newH,
    borderRadius: t.btnRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.newGap,
  },
  newText: { fontFamily: font.appSemi, fontSize: t.newSize, color: c.ink },

  cancel: { marginTop: t.cancelTop, alignSelf: 'center' },
  cancelText: {
    fontFamily: font.appSemi,
    fontSize: t.cancelSize,
    lineHeight: t.cancelLineHeight,
    color: c.cancelRed,
    textDecorationLine: 'underline',
  },
  cancelBody: {
    marginTop: t.cancelBodyTop,
    paddingHorizontal: t.cancelPadX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.cancelBodySize,
    lineHeight: t.cancelBodyLineHeight,
    color: c.inkWarm,
  },

  foot: {
    marginTop: t.footTop,
    paddingLeft: t.footPadL,
    paddingRight: t.footPadR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footText: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: c.inkWarm,
  },
  footDot: { width: t.footDot, height: t.footDot, borderRadius: t.footDot / 2, backgroundColor: c.tagMuted },
  need: {
    marginTop: t.needTop,
    alignSelf: 'center',
    maxWidth: '100%',
    minHeight: t.needH,
    borderRadius: t.needH / 2,
    paddingHorizontal: t.needPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.needGap,
  },
  needText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.needSize, color: c.ink },
  needLink: { fontFamily: font.appSemi, color: c.brownInk, textDecorationLine: 'underline' },
});
