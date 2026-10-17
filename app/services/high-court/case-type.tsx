import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleHelp,
  FilePlus2,
  Gavel,
  Headset,
  Info,
  Lock,
  NotebookTabs,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_CASE_TYPE } from '../../../data/highCourt';
import { colors, font, hcCaseType as t, hcPalette as c, ink, wizardCardShadow } from '../../../constants/theme';

// High Court — choose case type (design/291). Measured at 2.000 px/pt.
//
// The two cards are a real local choice: the selected one takes the drawn
// "selected" treatment (panel fill, 4pt brown top edge, brown tick) and
// Continue follows it — New Case to the matter picker (design/292), Pending
// Case to Pending Case Details (design/330). The button's "Next: Case Details
// Form" sub-line is only drawn for New Case and is kept as drawn either way.
//
// "Contact Legal Support" opens the existing support chat.

export default function HighCourtCaseTypeScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_CASE_TYPE;
  const [choice, setChoice] = useState<'new' | 'pending'>('new');
  const next = () =>
    router.push(
      (choice === 'new' ? '/services/high-court/matter-type' : '/services/high-court/pending/details') as Href,
    );

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/high-court' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.step}>
          <Gavel size={t.stepIcon} color={c.brownInk} strokeWidth={2} />
          <Text style={styles.stepText} {...shrinkToFit(0.8)}>
            {choice === 'pending' ? 'STEP 1 OF 2 • PENDING CASE INTAKE' : d.step}
          </Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.body}>{d.body}</Text>

        {d.options.map((o, i) => {
          const on = choice === o.id;
          const Tile = o.id === 'new' ? FilePlus2 : NotebookTabs;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => setChoice(o.id)}
              style={[styles.card, i > 0 && styles.cardNext, on ? styles.cardOn : styles.cardOff]}
            >
              <View style={styles.cardHead}>
                <View style={styles.tile}>
                  <Tile size={t.tileIcon} color={c.brown} strokeWidth={1.8} />
                </View>
                <View style={styles.headCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} {...shrinkToFit(0.8)}>
                      {o.title}
                    </Text>
                    <View style={[styles.chip, o.id === 'pending' && styles.chipPeach]}>
                      <Text style={[styles.chipText, o.id === 'pending' && styles.chipTextBrown]}>{o.chip}</Text>
                    </View>
                  </View>
                  <Text style={styles.desc}>{o.desc}</Text>
                </View>
                <View style={[styles.mark, on ? styles.markOn : styles.markOff]}>
                  {on && <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />}
                </View>
              </View>

              <View style={[styles.bullets, 'noc' in o && styles.box]}>
                {o.bullets.map((b, j) => (
                  <View key={b} style={[styles.bullet, j > 0 && styles.bulletNext]}>
                    <BadgeCheck size={t.bulletIcon} color={c.greenInk} strokeWidth={2} />
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
              {'noc' in o && (
                <View style={styles.noc}>
                  <Info size={t.nocIcon} color={c.brownInk} strokeWidth={2} />
                  <Text style={styles.nocText}>{o.noc}</Text>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={styles.help}>
          <View style={styles.helpHead}>
            <View style={styles.helpIcon}>
              <CircleHelp size={t.helpIconGlyph} color={c.brownInk} strokeWidth={2} />
            </View>
            <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
              {d.helpTitle}
            </Text>
          </View>
          <Text style={styles.helpBody}>{d.helpBody}</Text>
          <View style={styles.linkRow}>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/support-chat' as Href)}
              style={styles.link}
            >
              <Headset size={t.linkIcon} color={c.brown} strokeWidth={2} />
              <Text style={styles.linkText} {...shrinkToFit(0.8)}>
                {d.helpLink}
              </Text>
            </Pressable>
            <Text style={styles.avg} {...shrinkToFit(0.8)}>
              {d.helpAvg}
            </Text>
          </View>
        </View>

        <View style={styles.trust}>
          <Lock size={t.trustIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.trustText} {...shrinkToFit(0.8)}>
            {d.trust[0]}
          </Text>
          <View style={styles.trustDot} />
          <ShieldCheck size={t.trustIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.trustText} {...shrinkToFit(0.8)}>
            {d.trust[1]}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.footPadBottom }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={d.cta} onPress={next} style={styles.btn}>
          <View style={styles.btnCol}>
            <View style={styles.btnTitleRow}>
              <Text style={styles.btnTitle}>{d.cta}</Text>
              <ArrowRight size={t.btnTitleIcon} color={ink.onBrand} strokeWidth={2.2} />
            </View>
            <Text style={styles.btnSub} {...shrinkToFit(0.8)}>
              {d.ctaSub}
            </Text>
          </View>
          <View style={styles.btnDisc}>
            <ArrowRight size={t.btnDiscGlyph} color={ink.onBrand} strokeWidth={2.2} />
          </View>
        </Pressable>
        <Text style={styles.foot}>{d.foot}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },

  step: {
    marginTop: t.stepTop,
    alignSelf: 'flex-start',
    height: t.stepH,
    borderRadius: t.stepRadius,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepIconGap,
  },
  stepText: { fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },

  card: {
    marginTop: t.cardTop,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  cardNext: { marginTop: t.cardGap },
  cardOn: { backgroundColor: c.panel, borderTopWidth: t.selectedEdge, borderTopColor: c.brown, ...wizardCardShadow },
  cardOff: { backgroundColor: c.card, paddingTop: t.cardPadTop + t.selectedEdge },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    marginRight: t.tileGap,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCol: { flex: 1, minWidth: 0, marginRight: t.tileGap },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.chipGap },
  title: { fontFamily: font.appSemi, fontSize: t.titleSize, color: c.ink },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  chipPeach: { backgroundColor: c.peach },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.inkWarm },
  chipTextBrown: { color: c.brownInk },
  desc: {
    marginTop: t.descTop,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    lineHeight: t.descLineHeight,
    color: c.inkWarm,
  },
  mark: {
    width: t.mark,
    height: t.mark,
    borderRadius: t.mark / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: c.brown },
  markOff: { backgroundColor: c.radioGrey },

  bullets: { marginTop: t.bulletsTop, paddingHorizontal: t.bulletsInsetX },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
  },
  bullet: { flexDirection: 'row', alignItems: 'center' },
  bulletNext: { marginTop: t.bulletPitch },
  bulletText: {
    flex: 1,
    marginLeft: t.bulletGap,
    fontFamily: font.appBody,
    fontSize: t.bulletSize,
    lineHeight: t.bulletLineHeight,
    color: c.ink,
  },
  noc: {
    marginTop: t.nocTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.peachNote,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.nocGap,
  },
  nocText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.nocSize,
    lineHeight: t.nocLineHeight,
    color: c.inkWarm,
  },

  help: {
    marginTop: t.helpTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.helpPad,
    paddingTop: t.helpPadTop,
    paddingBottom: t.helpPadBottom,
  },
  helpHead: { flexDirection: 'row', alignItems: 'center' },
  helpIcon: {
    width: t.helpIcon,
    height: t.helpIcon,
    borderRadius: t.helpIcon / 2,
    marginRight: t.helpIconGap,
    backgroundColor: c.radioGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { flex: 1, fontFamily: font.appSemi, fontSize: t.helpTitleSize, color: c.ink },
  helpBody: {
    marginTop: t.helpBodyTop,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: c.inkWarm,
  },
  linkRow: { marginTop: t.linkTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { flexDirection: 'row', alignItems: 'center', gap: t.linkGap, flexShrink: 1 },
  linkText: { fontFamily: font.appSemi, fontSize: t.linkSize, color: c.brown },
  avg: { marginLeft: t.linkGap, fontFamily: font.appSemi, fontSize: t.avgSize, color: colors.textMuted },

  trust: { marginTop: t.trustTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.trustGap },
  trustText: { fontFamily: font.appSemi, fontSize: t.trustSize, color: colors.textMuted },
  trustDot: {
    width: t.trustDot,
    height: t.trustDot,
    borderRadius: t.trustDot / 2,
    marginHorizontal: t.trustDotGap - t.trustGap,
    backgroundColor: colors.borderMuted,
  },

  bar: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    paddingHorizontal: t.btnPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnCol: { flex: 1, minWidth: 0 },
  btnTitleRow: { flexDirection: 'row', alignItems: 'center', gap: t.linkGap },
  btnTitle: { fontFamily: font.appSemi, fontSize: t.btnTitleSize, color: ink.onBrand },
  btnSub: { marginTop: t.btnSubTop, fontFamily: font.appSemi, fontSize: t.btnSubSize, color: c.peachNote },
  btnDisc: {
    width: t.btnDisc,
    height: t.btnDisc,
    borderRadius: t.btnDisc / 2,
    backgroundColor: c.brownLift,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foot: {
    marginTop: t.footTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textMuted,
  },
});
