import { router, type Href } from 'expo-router';
import { ArrowRight, BadgeCheck, Check, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyCompleteArt from '../../../components/VerifyCompleteArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_COMPLETE } from '../../../data/advocateVerify';
import {
  advVerifyComplete as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — complete (design/244).
//
// ⚠ ANOTHER FRAMED EXPORT, 932px wide. Measured from the cropped 780px screen.
//
// ⚠ The advocate is "Adv. Rahul" here — no surname — where every other screen
// in this flow says "Adv. Rahul Sharma". Drawn as drawn.
//
// ⚠ "VERIFIED ON 18 September 2026" is the same date design/240 gives as the
// SUBMISSION date, so the compliance review takes zero days. Both dates are in
// the future. Drawn as drawn.
//
// STATIC, NOT WIRED: nothing was verified, no badge is granted, and no
// capability is unlocked by this screen.

export default function AdvocateVerifyCompleteScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_COMPLETE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.spacer} />
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={8}
          style={styles.close}
          onPress={() => router.replace('/advocate/settings' as Href)}
        >
          <X size={t.closeGlyph} color="#4A4A4A" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <VerifyCompleteArt width={t.artW} height={t.artH} />
        </View>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Check size={t.pillGlyph} color={status.active} strokeWidth={3} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.pill}
            </Text>
          </View>
        </View>

        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          <View style={styles.nameRow}>
            <View style={styles.nameCol}>
              <Text style={styles.label}>{d.label}</Text>
              <Text style={styles.name} {...shrinkToFit(0.8)}>
                {d.name}
              </Text>
            </View>
            <View style={styles.vpill}>
              <Check size={t.vpillGlyph} color={status.active} strokeWidth={3} />
              <Text style={styles.vpillText} {...shrinkToFit(0.8)}>
                {d.verified}
              </Text>
            </View>
          </View>
          <View style={styles.rule} />
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.label}>{d.enrollmentLabel}</Text>
              <View style={styles.metaValueRow}>
                <Text style={styles.metaValue} {...shrinkToFit(0.8)}>
                  {d.enrollmentValue}
                </Text>
                <View style={styles.metaDot} />
              </View>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.label}>{d.verifiedOnLabel}</Text>
              <Text style={styles.metaValue} {...shrinkToFit(0.8)}>
                {d.verifiedOnValue}
              </Text>
            </View>
          </View>
          <View style={styles.inner}>
            <View style={styles.innerTile}>
              <BadgeCheck size={t.innerGlyph} color={ink.accent} strokeWidth={1.8} />
            </View>
            <Text style={styles.innerText}>{d.badge}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>{d.capabilitiesTitle}</Text>
          {d.capabilities.map((c, i) => (
            <View key={c.title} style={[styles.cap, { marginTop: i === 0 ? t.capTop : t.capGap }]}>
              <View style={styles.capDot}>
                <Check size={t.capDotGlyph} color={status.active} strokeWidth={3} />
              </View>
              <View style={styles.nameCol}>
                <Text style={styles.capTitle} {...shrinkToFit(0.8)}>
                  {c.title}
                </Text>
                <Text style={styles.capSub}>{c.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.disc}>
          <Text style={styles.discText}>{d.disclaimer}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.replace('/advocate/settings' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/dashboard' as Href)}>
          <Text style={styles.done}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: s.rule,
  },
  spacer: { width: t.closeBtn, height: t.closeBtn },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  close: {
    width: t.closeBtn,
    height: t.closeBtn,
    borderRadius: t.closeBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 24 },

  hero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  pillRow: { marginTop: t.pillTop, alignItems: 'center' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    borderWidth: 1,
    borderColor: t.pillBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: 7,
    fontFamily: font.appHeading,
    fontSize: t.pillSize,
    letterSpacing: t.pillTrack,
    color: '#0F7A4F',
  },

  h1: {
    marginTop: t.h1Top,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#1B1C1C',
  },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: t.padX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  nameCol: { flex: 1 },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelTrack,
    color: ink.accent,
  },
  name: {
    marginTop: t.nameTop,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: '#1B1C1C',
  },
  vpill: {
    marginLeft: 10,
    height: t.vpillH,
    borderRadius: t.vpillRadius,
    paddingHorizontal: t.vpillPadX,
    backgroundColor: t.pillBg,
    borderWidth: 1,
    borderColor: t.pillBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vpillText: {
    marginLeft: 6,
    fontFamily: font.appHeading,
    fontSize: t.vpillSize,
    color: '#0F7A4F',
  },
  rule: { marginTop: t.ruleTop, height: 1, backgroundColor: s.rule },

  metaRow: { marginTop: t.metaTop, flexDirection: 'row' },
  metaCol: { flex: 1 },
  metaValueRow: { flexDirection: 'row', alignItems: 'center' },
  metaValue: {
    marginTop: t.metaValueTop,
    fontFamily: font.appBody,
    fontSize: t.metaValueSize,
    color: '#1B1C1C',
  },
  metaDot: {
    marginLeft: 9,
    marginTop: t.metaValueTop,
    width: t.metaDot,
    height: t.metaDot,
    borderRadius: t.metaDot / 2,
    backgroundColor: status.active,
  },

  inner: {
    marginTop: t.innerTop,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.innerBg,
    borderRadius: t.innerRadius,
    padding: t.innerPad,
  },
  innerTile: {
    width: t.innerTile,
    height: t.innerTile,
    borderRadius: t.innerTile / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.innerGap,
  },
  innerText: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.innerSize,
    lineHeight: t.innerLine,
    color: '#1B1C1C',
  },

  section: {
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: ink.accent,
  },
  cap: { flexDirection: 'row' },
  capDot: {
    width: t.capDot,
    height: t.capDot,
    borderRadius: t.capDot / 2,
    backgroundColor: t.capDotBg,
    borderWidth: 1,
    borderColor: t.capDotBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.capGapX,
  },
  capTitle: { fontFamily: font.appHeading, fontSize: t.capTitleSize, color: '#1B1C1C' },
  capSub: {
    marginTop: t.capSubTop,
    fontFamily: font.appBody,
    fontSize: t.capSubSize,
    lineHeight: t.capSubLine,
    color: colors.textBody,
  },

  disc: {
    marginTop: t.discTop,
    marginHorizontal: t.padX,
    backgroundColor: t.discBg,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  discText: {
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.discSize,
    lineHeight: t.discLine,
    color: colors.textBody,
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: s.rule,
    backgroundColor: s.bg,
  },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: ink.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
    marginRight: 10,
  },
  done: {
    marginTop: t.doneTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.doneSize,
    color: colors.textBody,
  },
});
