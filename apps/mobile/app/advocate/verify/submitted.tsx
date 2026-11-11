import { router, type Href } from 'expo-router';
import { Check, ChevronRight, Copy, ShieldCheck, X } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyReviewArt from '../../../components/VerifyReviewArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_SUBMITTED } from '../../../data/advocateVerify';
import {
  advVerifySubmitted as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — submitted (design/240).
//
// ⚠ NOTE 9 — the workflow's second step reads "Aadhaar, Sanad & COP uploaded",
// confirming receipt of an Aadhaar card. See app/advocate/verify/documents.tsx.
//
// ⚠ NOTE 8 — VER-2026-1048 is the fourth service in this project on the 1048
// suffix. ⚠ The submission date, 18 September 2026, is in the future.
//
// STATIC, NOT WIRED: nothing was submitted, the reference copies nothing, and
// the workflow is a drawing, not a status feed.

function AdvocateVerifySubmittedScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_SUBMITTED;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.titleCol}>
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
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <X size={t.closeGlyph} color="#4A4A4A" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <VerifyReviewArt width={t.heroW} height={t.heroH} />
        </View>

        <View style={styles.mark}>
          <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />
        </View>

        <Text style={styles.h1} {...shrinkToFit(0.8)}>
          {d.h1}
        </Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel} {...shrinkToFit(0.8)}>
              {d.statusLabel}
            </Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText} {...shrinkToFit(0.8)}>
                {d.statusPill}
              </Text>
            </View>
          </View>
          <View style={styles.cardRule} />
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{d.submittedLabel}</Text>
              <Text style={styles.metaValue} {...shrinkToFit(0.8)}>
                {d.submittedValue}
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>{d.referenceLabel}</Text>
              <View style={styles.refRow}>
                <Text style={[styles.metaValue, styles.metaMono]} {...shrinkToFit(0.75)}>
                  {d.referenceValue}
                </Text>
                <Copy size={t.copyGlyph} color={ink.accent} strokeWidth={1.8} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.section}>{d.workflow}</Text>

        <View style={styles.card}>
          {d.steps.map((st, i) => (
            <View key={st.title} style={[styles.step, { marginTop: i === 0 ? 0 : t.stepGap }]}>
              <View style={styles.stepRailCol}>
                <View
                  style={[
                    styles.stepDot,
                    st.state === 'done' && styles.stepDotDone,
                    st.state === 'active' && styles.stepDotActive,
                    st.state === 'idle' && styles.stepDotIdle,
                  ]}
                >
                  {st.state === 'done' ? (
                    <Check size={t.stepDotGlyph} color={ink.onBrand} strokeWidth={3} />
                  ) : (
                    <View
                      style={[styles.stepInner, st.state === 'idle' && styles.stepInnerIdle]}
                    />
                  )}
                </View>
                {i < d.steps.length - 1 ? <View style={styles.stepRail} /> : null}
              </View>
              <View style={styles.stepCol}>
                <View style={styles.stepTitleRow}>
                  <Text
                    style={[styles.stepTitle, st.state === 'idle' && styles.stepTitleIdle]}
                    {...shrinkToFit(0.8)}
                  >
                    {st.title}
                  </Text>
                  {st.pill ? (
                    <View style={styles.stepPill}>
                      <Text style={styles.stepPillText} {...shrinkToFit(0.8)}>
                        {st.pill}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.stepSub}>{st.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/complete' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ChevronRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/advocate/settings' as Href)}
        >
          <Text style={styles.back}>{d.secondary}</Text>
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
  },
  titleCol: { flex: 1, alignItems: 'center', marginLeft: t.closeBtn },
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
    color: '#222222',
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

  content: { paddingBottom: 24, alignItems: 'center' },

  hero: {
    marginTop: t.heroTop,
    width: t.heroW,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    overflow: 'hidden',
  },
  mark: {
    marginTop: t.markTop,
    width: t.mark,
    height: t.mark,
    borderRadius: t.mark / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: {
    marginTop: t.h1Top,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#222222',
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
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontFamily: font.appBody, fontSize: t.statusSize, color: colors.textBody },
  statusPill: {
    height: t.statusPillH,
    borderRadius: t.statusPillRadius,
    paddingHorizontal: t.statusPillPadX,
    backgroundColor: t.statusPillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: t.statusPillDot,
    height: t.statusPillDot,
    borderRadius: t.statusPillDot / 2,
    backgroundColor: ink.accent,
    marginRight: 8,
  },
  statusPillText: { fontFamily: font.appSemi, fontSize: t.statusPillSize, color: '#6E5B43' },
  cardRule: { marginTop: t.cardRuleTop, height: 1, backgroundColor: s.rule },

  metaRow: { marginTop: t.metaTop, flexDirection: 'row' },
  metaCol: { flex: 1 },
  metaDivider: { width: 1, backgroundColor: t.metaDivider, marginHorizontal: 12 },
  metaLabel: {
    fontFamily: font.appSemi,
    fontSize: t.metaLabelSize,
    letterSpacing: t.metaLabelTrack,
    color: colors.textBody,
  },
  metaValue: {
    marginTop: t.metaValueTop,
    fontFamily: font.appBody,
    fontSize: t.metaValueSize,
    color: '#222222',
  },
  metaMono: { fontFamily: font.mono },
  refRow: { flexDirection: 'row', alignItems: 'center' },

  section: {
    marginTop: t.sectionTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: ink.accent,
  },

  step: { flexDirection: 'row' },
  stepRailCol: { alignItems: 'center', marginRight: t.stepGapX },
  stepDot: {
    width: t.stepDot,
    height: t.stepDot,
    borderRadius: t.stepDot / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: status.active },
  stepDotActive: { backgroundColor: colors.brand },
  stepDotIdle: { borderWidth: 1.5, borderColor: '#DAD4CA' },
  stepInner: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#FFFFFF' },
  stepInnerIdle: { backgroundColor: '#CFC8BD' },
  stepRail: { flex: 1, width: t.stepRail, backgroundColor: '#E8E2DA', marginVertical: 3 },
  stepCol: { flex: 1, paddingBottom: 2 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center' },
  stepTitle: { fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: '#222222' },
  stepTitleIdle: { fontFamily: font.appBody, color: '#9A938A' },
  stepPill: {
    marginLeft: 9,
    height: t.stepPillH,
    borderRadius: t.stepPillRadius,
    paddingHorizontal: t.stepPillPadX,
    backgroundColor: t.stepPillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPillText: {
    fontFamily: font.appSemi,
    fontSize: t.stepPillSize,
    letterSpacing: 0.5,
    color: '#6E5B43',
  },
  stepSub: {
    marginTop: t.stepSubTop,
    fontFamily: font.appBody,
    fontSize: t.stepSubSize,
    color: colors.textBody,
  },

  note: {
    marginTop: t.noteTop,
    alignSelf: 'stretch',
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    backgroundColor: s.bg,
  },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: colors.brand,
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
  back: {
    marginTop: t.backTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.backSize,
    color: colors.textBody,
  },
});
import VerifyFlow from '../../../features/advocate-verification/VerifyFlow';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveVerifyScreen() { return DATA_SOURCE === 'api' ? <VerifyFlow/> : <AdvocateVerifySubmittedScreen/>; }
