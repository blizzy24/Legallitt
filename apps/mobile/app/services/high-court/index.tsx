import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  FileCheck,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_LANDING } from '../../../data/highCourt';
import { colors, font, hcLanding as t, hcPalette as c, ink, status } from '../../../constants/theme';

// High Court Representation — service landing (design/289).
//
// ⚠ design/289 is a 228×1023 JPEG THUMBNAIL — 206px of screen for 390pt, 0.528
// px/pt — the only export in the batch that cannot be measured element by
// element. Layout and type are read off it to ±2pt; the small lines marked
// "inferred" in data/highCourt.ts are read at the edge of legibility.
//
// ⚠ CONFLICT 1 — this screen prices Ordinary/Urgent at ₹18,500/₹28,500;
// design/295 prices them at ₹24,999/₹34,999. Each renders its own figures.
//
// The hero illustration is a neutral block at the drawn size — no asset exists.
// "View Service Policy" and the help icon are inert: neither has a destination.
// The two option groups are real local selections; nothing is persisted.

const RECEIVE_ICONS: Record<(typeof HC_LANDING.receive)[number]['icon'], LucideIcon> = {
  shield: ShieldCheck,
  scale: Scale,
  calendar: CalendarDays,
  doc: FileCheck,
};

export default function HighCourtLandingScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_LANDING;
  const [service, setService] = useState<'quick' | 'assist'>('quick');
  const [speed, setSpeed] = useState<'ordinary' | 'urgent'>('urgent');
  const chosen = d.speeds.find((s) => s.id === speed)!;
  const toCaseType = () => router.push('/services/high-court/case-type' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        backHref={'/(tabs)/home' as Href}
        right={<CircleHelp size={t.helpIcon} color={c.ink} strokeWidth={1.8} style={styles.help} />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {/* Neutral placeholder for design/289's courthouse illustration. */}
          <View style={styles.heroArt} />
          <View style={[styles.badge, styles.badgeLeft]}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText} {...shrinkToFit(0.8)}>
              {d.heroBadge}
            </Text>
          </View>
          <Text style={[styles.tier, styles.badgeRight]} {...shrinkToFit(0.8)}>
            {d.heroTier}
          </Text>
        </View>

        <View style={styles.chip}>
          <Scale size={t.chipIcon} color={c.brown} strokeWidth={2} />
          <Text style={styles.chipText} {...shrinkToFit(0.8)}>
            {d.chip}
          </Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.body}>{d.body}</Text>
        <View style={styles.check}>
          <CircleCheck size={t.checkIcon} color={status.active} strokeWidth={2} />
          <Text style={styles.checkText}>{d.check}</Text>
        </View>

        <View style={styles.btnRow}>
          <Pressable accessibilityRole="button" onPress={toCaseType} style={[styles.btn, styles.btnBrown]}>
            <Text style={styles.btnBrownText} {...shrinkToFit(0.8)}>
              {d.start}
            </Text>
            <ChevronRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/high-court/learn-more' as Href)}
            style={[styles.btn, styles.btnWhite]}
          >
            <Text style={styles.btnWhiteText} {...shrinkToFit(0.8)}>
              {d.learn}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            {d.receiveLabel}
          </Text>
          <View style={styles.sectionMeta}>
            <ShieldCheck size={t.sectionMetaIcon} color={status.active} strokeWidth={2} />
            <Text style={styles.sectionMetaText} {...shrinkToFit(0.8)}>
              {d.receiveMeta}
            </Text>
          </View>
        </View>
        <View style={styles.grid}>
          {d.receive.map((r) => {
            const Icon = RECEIVE_ICONS[r.icon];
            return (
              <View key={r.title} style={styles.gridCard}>
                <View style={styles.tile}>
                  <Icon size={t.tileIcon} color={c.brown} strokeWidth={1.9} />
                </View>
                <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                  {r.title}
                </Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, styles.how]}>
          <View style={styles.howHead}>
            <View style={styles.howIcon}>
              <Scale size={t.howIconGlyph} color={c.brown} strokeWidth={2} />
            </View>
            <Text style={styles.howTitle}>{d.howTitle}</Text>
          </View>
          <Text style={styles.howBody}>{d.howBody}</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push('/services/high-court/learn-more' as Href)}
            style={styles.howLink}
          >
            <Text style={styles.howLinkText}>{d.howLink}</Text>
            <ArrowRight size={t.howLinkSize} color={c.ink} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.headRow}>
          <Text style={styles.head} {...shrinkToFit(0.8)}>
            {d.serviceHead}
          </Text>
          <Text style={styles.headMeta} {...shrinkToFit(0.8)}>
            {d.serviceMeta}
          </Text>
        </View>
        {d.services.map((o, i) => {
          const on = service === o.id;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setService(o.id)}
              style={[styles.card, styles.opt, i > 0 && styles.optNext, on && styles.selected]}
            >
              <View style={styles.optCol}>
                <View style={styles.optTitleRow}>
                  <Text style={styles.optTitle} {...shrinkToFit(0.8)}>
                    {o.title}
                  </Text>
                  <View style={[styles.optBadge, o.id === 'assist' && styles.optBadgePeach]}>
                    <Text style={styles.optBadgeText}>{o.badge}</Text>
                  </View>
                </View>
                <Text style={styles.optDesc}>{o.desc}</Text>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
            </Pressable>
          );
        })}

        <View style={styles.headRow}>
          <Text style={styles.head} {...shrinkToFit(0.8)}>
            {d.speedHead}
          </Text>
          <Text style={styles.headMeta} {...shrinkToFit(0.8)}>
            {d.speedMeta}
          </Text>
        </View>
        <View style={styles.speedRow}>
          {d.speeds.map((s) => {
            const on = speed === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setSpeed(s.id)}
                style={[styles.card, styles.speed, on && styles.selected]}
              >
                {s.id === 'urgent' && (
                  <View style={styles.popular}>
                    <Text style={styles.popularText}>{d.popular}</Text>
                  </View>
                )}
                <View style={[styles.speedPill, s.id === 'urgent' && styles.speedPillBrown]}>
                  <Text style={[styles.speedPillText, s.id === 'urgent' && styles.speedPillTextOn]}>{s.pill}</Text>
                </View>
                <Text style={styles.speedTitle} {...shrinkToFit(0.8)}>
                  {s.title}
                </Text>
                <Text style={styles.speedDesc}>{s.desc}</Text>
                <Text style={[styles.speedPrice, s.id === 'urgent' && styles.speedPriceBrown]} {...shrinkToFit(0.8)}>
                  {s.price}
                </Text>
                <Text style={styles.speedNote} {...shrinkToFit(0.8)}>
                  {s.note}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.matters]}>
          <View style={styles.howHead}>
            <View style={styles.howIcon}>
              <ShieldCheck size={t.howIconGlyph} color={c.brown} strokeWidth={2} />
            </View>
            <Text style={styles.howTitle}>{d.mattersTitle}</Text>
          </View>
          <Text style={styles.howBody}>{d.mattersBody}</Text>
          {/* Inert — no service policy screen is designed. */}
          <Text style={styles.policy}>{d.mattersLink}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <View style={styles.barCol}>
            <Text style={styles.barTitle} {...shrinkToFit(0.8)}>
              {d.barTitle}
            </Text>
            <Text style={styles.barSub} {...shrinkToFit(0.8)}>
              {d.barSub[speed]}
            </Text>
          </View>
          <View style={styles.barRight}>
            <Text style={styles.barPrice} {...shrinkToFit(0.8)}>
              {chosen.price}
            </Text>
            <Text style={styles.barNote} {...shrinkToFit(0.8)}>
              {d.barNote}
            </Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={toCaseType} style={styles.barBtn}>
          <Text style={styles.barBtnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  help: { marginRight: t.helpGap },
  content: { paddingHorizontal: t.padX, paddingBottom: t.mattersBottom },

  hero: {
    marginTop: t.heroTop,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: c.heroFrame,
    paddingHorizontal: t.heroInsetX,
    paddingTop: t.heroInsetTop,
    overflow: 'hidden',
  },
  heroArt: { flex: 1, borderTopLeftRadius: t.heroArtRadius, borderTopRightRadius: t.heroArtRadius, backgroundColor: c.heroArt },
  badge: {
    position: 'absolute',
    bottom: t.badgeInset,
    height: t.badgeH,
    borderRadius: t.badgeRadius,
    paddingHorizontal: t.badgePadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLeft: { left: t.badgeInset },
  badgeRight: { right: t.badgeInset, bottom: t.tierBottom },
  badgeDot: {
    width: t.badgeDot,
    height: t.badgeDot,
    borderRadius: t.badgeDot / 2,
    marginRight: t.badgeDotGap,
    backgroundColor: status.active,
  },
  badgeText: { fontFamily: font.appSemi, fontSize: t.badgeSize, color: c.ink },
  tier: { position: 'absolute', fontFamily: font.appSemi, fontSize: t.badgeSize, color: ink.onBrand },

  chip: {
    marginTop: t.chipTop,
    alignSelf: 'flex-start',
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: { marginLeft: t.chipIconGap, fontFamily: font.appSemi, fontSize: t.chipSize, color: c.brown },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },
  check: { marginTop: t.checkTop, flexDirection: 'row', alignItems: 'center' },
  checkText: { flex: 1, marginLeft: t.checkGap, fontFamily: font.appBody, fontSize: t.checkSize, color: c.inkWarm },

  btnRow: { marginTop: t.btnTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBrown: { backgroundColor: c.brown, gap: t.checkGap },
  btnWhite: { backgroundColor: c.card },
  btnBrownText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  btnWhiteText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },

  sectionRow: { marginTop: t.sectionTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { fontFamily: font.appSemi, fontSize: t.sectionSize, letterSpacing: t.sectionSpacing, color: c.inkWarm },
  sectionMeta: { flexDirection: 'row', alignItems: 'center', gap: t.sectionMetaGap },
  sectionMetaText: { fontFamily: font.appSemi, fontSize: t.sectionMetaSize, color: status.active },

  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGap },
  gridCard: {
    flexBasis: t.gridCardBasis,
    flexGrow: 1,
    minHeight: t.gridCardH,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    padding: t.cardPad,
  },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { marginTop: t.cardTitleTop, fontFamily: font.appSemi, fontSize: t.cardTitleSize, color: c.ink },
  cardDesc: {
    marginTop: t.cardDescTop,
    fontFamily: font.appBody,
    fontSize: t.cardDescSize,
    lineHeight: t.cardDescLineHeight,
    color: c.inkWarm,
  },

  card: { borderRadius: t.cardRadius, backgroundColor: c.card, padding: t.optPad },
  how: { marginTop: t.howTop },
  howHead: { flexDirection: 'row', alignItems: 'center' },
  howIcon: {
    width: t.howIcon,
    height: t.howIcon,
    borderRadius: t.howIcon / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.howIconGap,
  },
  howTitle: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.howTitleSize,
    lineHeight: t.howTitleLineHeight,
    color: c.ink,
  },
  howBody: {
    marginTop: t.howBodyTop,
    fontFamily: font.appBody,
    fontSize: t.howBodySize,
    lineHeight: t.howBodyLineHeight,
    color: c.inkWarm,
  },
  howLink: { marginTop: t.howLinkTop, flexDirection: 'row', alignItems: 'center', gap: t.howLinkGap },
  howLinkText: { fontFamily: font.appSemi, fontSize: t.howLinkSize, color: c.ink },

  headRow: { marginTop: t.headTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  head: { fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  headMeta: { fontFamily: font.appBody, fontSize: t.headMetaSize, color: c.inkWarm },

  opt: { marginTop: t.optTop, flexDirection: 'row', alignItems: 'center' },
  optNext: { marginTop: t.optGap },
  selected: { backgroundColor: c.peachSoft },
  optCol: { flex: 1, minWidth: 0, marginRight: t.optColGap },
  optTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.optBadgeGap },
  optTitle: { fontFamily: font.appSemi, fontSize: t.optTitleSize, color: c.ink },
  optBadge: {
    height: t.optBadgeH,
    borderRadius: t.optBadgeRadius,
    paddingHorizontal: t.optBadgePadX,
    backgroundColor: c.chipGrey,
    justifyContent: 'center',
  },
  optBadgePeach: { backgroundColor: c.peach },
  optBadgeText: { fontFamily: font.appSemi, fontSize: t.optBadgeSize, color: c.inkWarm },
  optDesc: {
    marginTop: t.optDescTop,
    fontFamily: font.appBody,
    fontSize: t.optDescSize,
    lineHeight: t.optDescLineHeight,
    color: c.inkWarm,
  },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    backgroundColor: c.chipGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: c.brown },
  radioDot: { width: t.radioDot, height: t.radioDot, borderRadius: t.radioDot / 2, backgroundColor: c.brown },

  speedRow: { marginTop: t.speedTop, flexDirection: 'row', gap: t.speedGap },
  speed: { flex: 1, minHeight: t.speedH, padding: t.speedPad },
  popular: {
    position: 'absolute',
    top: 0,
    right: t.speedPad / 2,
    height: t.popularH,
    paddingHorizontal: t.popularPadX,
    borderBottomLeftRadius: t.popularRadius,
    borderBottomRightRadius: t.popularRadius,
    backgroundColor: c.brown,
    justifyContent: 'center',
  },
  popularText: { fontFamily: font.appSemi, fontSize: t.popularSize, color: ink.onBrand },
  speedPill: {
    alignSelf: 'flex-start',
    height: t.speedPillH,
    borderRadius: t.speedPillRadius,
    paddingHorizontal: t.speedPillPadX,
    backgroundColor: c.chipGrey,
    justifyContent: 'center',
  },
  speedPillBrown: { backgroundColor: c.brown },
  speedPillText: { fontFamily: font.appSemi, fontSize: t.speedPillSize, color: c.inkWarm },
  speedPillTextOn: { color: ink.onBrand },
  speedTitle: { marginTop: t.speedTitleTop, fontFamily: font.appSemi, fontSize: t.speedTitleSize, color: c.ink },
  speedDesc: {
    marginTop: t.speedDescTop,
    fontFamily: font.appBody,
    fontSize: t.speedDescSize,
    lineHeight: t.speedDescLineHeight,
    color: c.inkWarm,
  },
  speedPrice: { marginTop: t.speedPriceTop, fontFamily: font.appHeading, fontSize: t.speedPriceSize, color: c.ink },
  speedPriceBrown: { color: c.brown },
  speedNote: { marginTop: t.speedNoteTop, fontFamily: font.appBody, fontSize: t.speedNoteSize, color: colors.textMuted },

  matters: { marginTop: t.mattersTop },
  policy: {
    marginTop: t.howLinkTop,
    fontFamily: font.appSemi,
    fontSize: t.howLinkSize,
    color: c.ink,
    textDecorationLine: 'underline',
  },

  bar: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  barRow: { flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, minWidth: 0, marginRight: t.optColGap },
  barTitle: { fontFamily: font.appSemi, fontSize: t.barTitleSize, color: c.ink },
  barSub: { fontFamily: font.appBody, fontSize: t.barSubSize, color: c.inkWarm },
  barRight: { alignItems: 'flex-end' },
  barPrice: { fontFamily: font.appHeading, fontSize: t.barPriceSize, color: c.ink },
  barNote: { fontFamily: font.appBody, fontSize: t.barNoteSize, color: colors.textMuted },
  barBtn: {
    marginTop: t.barBtnTop,
    height: t.barBtnH,
    borderRadius: t.barBtnRadius,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barBtnText: { fontFamily: font.appSemi, fontSize: t.barBtnSize, color: ink.onBrand },
});
