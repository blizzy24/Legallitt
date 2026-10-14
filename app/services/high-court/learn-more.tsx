import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CircleCheck,
  FileText,
  FolderOpen,
  Gavel,
  Headset,
  Landmark,
  Lock,
  Scale,
  Shield,
  ShieldCheck,
  ShieldQuestion,
  Smile,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_INFO } from '../../../data/highCourt';
import { font, hcInfo as t, hcPalette as c, ink } from '../../../constants/theme';

// High Court information — "Learn More" (design/290). Measured at 2.000 px/pt
// from the 780px screen inside an 860px framed export.
//
// The hero illustration is a neutral block at the drawn size — no asset exists.
// Chat opens the existing support chat; everything else is reading matter. The
// bottom button returns to the landing (design/289).

const WHEN_ICONS: Record<(typeof HC_INFO.when)[number]['icon'], LucideIcon> = {
  writ: ShieldCheck,
  bail: Shield,
  civil: Gavel,
  criminal: ShieldQuestion,
  appeal: ArrowUpRight,
  service: Briefcase,
  property: Building2,
  other: FolderOpen,
};

export default function HighCourtInfoScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_INFO;
  const back = () =>
    router.canGoBack() ? router.back() : router.replace('/services/high-court' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} plainChevron backHref={'/services/high-court' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {/* Neutral placeholder for design/290's courthouse illustration. */}
          <View style={styles.heroArt} />
          <View style={[styles.pill, styles.pillL]}>
            <Landmark size={t.pillIcon} color={c.brownInk} strokeWidth={1.9} />
            <Text style={[styles.pillText, styles.pillTextBrown]} {...shrinkToFit(0.8)}>
              {d.pillL}
            </Text>
          </View>
          <View style={[styles.pill, styles.pillR]}>
            <CircleCheck size={t.pillIcon} color={c.greenInk} strokeWidth={1.9} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.pillR}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.h1}>{d.h1}</Text>
          <Text style={styles.sub}>{d.sub}</Text>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={[styles.disc, styles.discPeach]}>
                <Scale size={t.iconDiscGlyph} color={c.brown} strokeWidth={1.9} />
              </View>
              <Text style={styles.cardTitle}>{d.whatTitle}</Text>
            </View>
            <Text style={styles.cardBody}>{d.whatBody}</Text>
            <View style={styles.greenPill}>
              <BadgeCheck size={t.greenPillIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.greenPillText} {...shrinkToFit(0.8)}>
                {d.whatPill}
              </Text>
            </View>
          </View>

          <Text style={styles.head}>{d.whenTitle}</Text>
          <Text style={styles.headSub}>{d.whenSub}</Text>
          <View style={styles.grid}>
            {d.when.map((w) => {
              const Icon = WHEN_ICONS[w.icon];
              return (
                <View key={w.label} style={styles.gridCard}>
                  <View style={styles.gridIcon}>
                    <Icon size={t.gridIconGlyph} color={c.brown} strokeWidth={1.9} />
                  </View>
                  <Text style={styles.gridLabel} {...shrinkToFit(0.75)}>
                    {w.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.head}>{d.doTitle}</Text>
          <Text style={styles.headSub}>{d.doSub}</Text>
          <View style={[styles.card, styles.list]}>
            {d.does.map((line) => (
              <View key={line} style={styles.listRow}>
                <View style={styles.check}>
                  <Check size={t.checkGlyph} color={c.greenInk} strokeWidth={2.6} />
                </View>
                <Text style={styles.listText}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.need}>
            <View style={styles.cardHead}>
              <FileText size={t.needIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={[styles.cardTitle, styles.needTitle]}>{d.needTitle}</Text>
            </View>
            <Text style={[styles.cardBody, styles.needBody]}>{d.needBody}</Text>
            <View style={styles.needInner}>
              <Smile size={t.needInnerIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.needInnerText}>{d.needNote}</Text>
            </View>
          </View>

          <Text style={styles.head}>{d.howTitle}</Text>
          <Text style={styles.headSub}>{d.howSub}</Text>
          <View style={[styles.card, styles.steps]}>
            {d.steps.map((s, i) => (
              <View key={s.title} style={[styles.step, i > 0 && styles.stepNext]}>
                <View style={[styles.stepDisc]}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                <View style={styles.stepCol}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.prot]}>
            <View style={styles.cardHead}>
              <View style={[styles.disc, styles.discPeach, styles.discSmall]}>
                <BadgeCheck size={t.protIconGlyph} color={c.brown} strokeWidth={1.9} />
              </View>
              <Text style={styles.cardTitle}>{d.protTitle}</Text>
            </View>
            <Text style={styles.protBody}>{d.protBody}</Text>
            <View style={styles.protLine}>
              <Lock size={t.protLineIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.protLineText}>{d.protLine}</Text>
            </View>
          </View>

          <View style={styles.help}>
            <View style={styles.helpIcon}>
              <Headset size={t.helpIconGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <View style={styles.helpCol}>
              <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
                {d.helpTitle}
              </Text>
              <Text style={styles.helpSub} {...shrinkToFit(0.8)}>
                {d.helpSub}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/support-chat' as Href)}
              style={styles.chat}
            >
              <Text style={styles.chatText}>{d.chat}</Text>
              <ArrowRight size={t.chatIcon} color={c.brown} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadY }]}>
        <Pressable accessibilityRole="button" onPress={back} style={styles.barBtn}>
          <ArrowLeft size={t.barBtnIcon} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.barBtnText} {...shrinkToFit(0.75)}>
            {d.back}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingBottom: t.bottomPad },

  hero: {
    height: t.heroH,
    borderBottomLeftRadius: t.heroRadius,
    borderBottomRightRadius: t.heroRadius,
    backgroundColor: c.card,
    overflow: 'hidden',
  },
  heroArt: {
    marginTop: t.heroArtTop,
    marginHorizontal: t.heroArtX,
    height: t.heroArtH,
    backgroundColor: c.heroArt,
  },
  pill: {
    position: 'absolute',
    top: t.pillTop,
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillIconGap,
  },
  pillL: { left: t.padX, backgroundColor: c.peach },
  pillR: { right: t.padX, backgroundColor: c.card },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },
  pillTextBrown: { color: c.brownInk },

  body: { paddingHorizontal: t.padX },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, color: c.inkWarm },

  card: {
    marginTop: t.cardTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  disc: {
    width: t.iconDisc,
    height: t.iconDisc,
    borderRadius: t.iconDisc / 2,
    marginRight: t.iconDiscGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discSmall: { width: t.protIcon, height: t.protIcon, borderRadius: t.protIcon / 2 },
  discPeach: { backgroundColor: c.peach },
  cardTitle: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.cardTitleSize,
    lineHeight: t.cardTitleLineHeight,
    color: c.ink,
  },
  cardBody: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },
  greenPill: {
    marginTop: t.greenPillTop,
    alignSelf: 'flex-start',
    height: t.greenPillH,
    borderRadius: t.greenPillRadius,
    paddingHorizontal: t.greenPillPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.greenPillGap,
  },
  greenPillText: { fontFamily: font.appSemi, fontSize: t.greenPillSize, color: c.greenInk },

  head: { marginTop: t.headTop, fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  headSub: { marginTop: t.headSubTop, fontFamily: font.appBody, fontSize: t.headSubSize, color: c.inkWarm },

  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.gridGap, rowGap: t.gridRowGap },
  gridCard: {
    flexBasis: t.gridBasis,
    flexGrow: 1,
    height: t.gridCardH,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.gridPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridIcon: {
    width: t.gridIcon,
    height: t.gridIcon,
    borderRadius: t.gridIcon / 2,
    marginRight: t.gridIconGap,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.gridLabelSize, color: c.ink },

  list: { marginTop: t.listTop, paddingTop: t.listPadY, paddingBottom: t.listPadY },
  listRow: { height: t.listPitch, flexDirection: 'row', alignItems: 'center' },
  check: {
    width: t.check,
    height: t.check,
    borderRadius: t.check / 2,
    marginRight: t.checkGap,
    backgroundColor: c.greenTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: { flex: 1, fontFamily: font.appBody, fontSize: t.checkSize, color: c.ink },

  need: {
    marginTop: t.needTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.needPad,
    paddingTop: t.needPadTop,
    paddingBottom: t.needPadBottom,
  },
  needTitle: { marginLeft: t.needIconGap },
  needBody: { color: c.ink },
  needInner: {
    marginTop: t.needInnerTop,
    borderRadius: t.needInnerRadius,
    backgroundColor: c.card,
    padding: t.needInnerPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.needInnerGap,
  },
  needInnerText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.needInnerSize,
    lineHeight: t.needInnerLineHeight,
    color: c.inkWarm,
  },

  steps: { marginTop: t.stepsTop, paddingTop: t.stepsPadY, paddingBottom: t.stepsPadY },
  step: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNext: { marginTop: t.stepGap },
  stepDisc: {
    width: t.stepDisc,
    height: t.stepDisc,
    borderRadius: t.stepDisc / 2,
    marginRight: t.stepGapX,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { fontFamily: font.appSemi, fontSize: t.stepNumSize, color: c.brownInk },
  stepCol: { flex: 1 },
  stepTitle: { fontFamily: font.appSemi, fontSize: t.stepTitleSize, color: c.ink },
  stepDesc: {
    marginTop: t.stepDescTop,
    fontFamily: font.appBody,
    fontSize: t.stepDescSize,
    lineHeight: t.stepDescLineHeight,
    color: c.inkWarm,
  },

  prot: { marginTop: t.protTop },
  protBody: {
    marginTop: t.protBodyTop,
    fontFamily: font.appBody,
    fontSize: t.protBodySize,
    lineHeight: t.protBodyLineHeight,
    color: c.inkWarm,
  },
  protLine: { marginTop: t.protLineTop, flexDirection: 'row', alignItems: 'center', gap: t.protLineGap },
  protLineText: { flex: 1, fontFamily: font.appSemi, fontSize: t.protLineSize, color: c.greenInk },

  help: {
    marginTop: t.helpTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.helpGrey,
    padding: t.helpPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpIcon: {
    width: t.helpIcon,
    height: t.helpIcon,
    borderRadius: t.helpIcon / 2,
    marginRight: t.helpGap,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCol: { flex: 1, minWidth: 0, marginRight: t.helpGap },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, color: c.ink },
  helpSub: { fontFamily: font.appBody, fontSize: t.helpSubSize, color: c.ink },
  chat: {
    height: t.chatH,
    paddingHorizontal: t.chatPadX,
    borderRadius: t.chatRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillIconGap / 2,
  },
  chatText: { fontFamily: font.appSemi, fontSize: t.chatSize, color: c.brown },

  bar: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadY },
  barBtn: {
    height: t.barBtnH,
    borderRadius: t.barBtnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.barBtnGap,
  },
  barBtnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.barBtnSize, color: ink.onBrand },
});
