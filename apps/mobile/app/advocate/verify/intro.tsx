import { router, type Href } from 'expo-router';
import { AlertCircle, ArrowRight, Check, ChevronLeft, MoreVertical } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyIntroArt from '../../../components/VerifyIntroArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_INTRO } from '../../../data/advocateVerify';
import { advVerifyIntro as t, colors, font, ink } from '../../../constants/theme';

// Advocate verification — intro (design/233).
//
// ⚠ THE STEPPER NAMES FOUR STEPS AND THE WIZARD IS SIX SCREENS. Drawn with the
// four names design/233 draws; the screens that follow each render the "Step n
// of 4" indicator their own export draws, repeats and all. See note 1 in
// data/advocateVerify.ts. Not renumbered here or anywhere.
//
// ⚠ The illustration frame is inset 16pt; every other block on the screen is on
// the 20pt grid, and the stepper columns are on a 15pt inset. All three measured.

function AdvocateVerifyIntroScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_INTRO;

  // The connector behind the stepper is drawn from the first circle's centre to
  // the last, so it needs the measured row width rather than a guessed one.
  const [stepsWidth, setStepsWidth] = useState(0);
  const onStepsLayout = (e: LayoutChangeEvent) => setStepsWidth(e.nativeEvent.layout.width);
  const col = stepsWidth / d.steps.length;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.headerBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.headerIcon} color="#222222" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={styles.headerBtn}>
          <MoreVertical size={t.headerIcon - 4} color="#8F7A60" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.art}>
          <VerifyIntroArt width={390 - t.artInset * 2} height={t.artHeight} />
        </View>

        <Text style={styles.h1}>{d.heading}</Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.card}>
          {d.benefits.map((b, i) => (
            <Fragment key={b.title}>
              {i > 0 ? <View style={styles.rowRule} /> : null}
              <View style={styles.row}>
                <View style={styles.chip}>
                  <Check size={t.chipGlyph} color={t.chipColour} strokeWidth={3} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{b.title}</Text>
                  <Text style={styles.rowSub}>{b.sub}</Text>
                </View>
              </View>
            </Fragment>
          ))}
        </View>

        <Text style={styles.stepsLabel}>{d.stepsLabel}</Text>
        <View style={styles.stepsRow} onLayout={onStepsLayout}>
          {col > 0 ? (
            <View
              style={[
                styles.stepsLine,
                { left: col / 2, width: col * (d.steps.length - 1) },
              ]}
            />
          ) : null}
          {d.steps.map((s, i) => {
            const active = i === 0;
            return (
              <View key={s} style={styles.stepCol}>
                <View style={[styles.stepCircle, active && styles.stepCircleOn]}>
                  <Text style={[styles.stepNum, active && styles.stepNumOn]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelOn]}>{s}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <AlertCircle size={t.noteIcon} color={ink.accent} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/personal' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Text style={styles.later}>{d.later}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.artInset,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerRule,
  },
  headerBtn: {
    width: t.headerBtn,
    height: t.headerBtn,
    borderRadius: t.headerBtn / 2,
    backgroundColor: t.headerBtnBg,
    borderWidth: 1,
    borderColor: t.headerBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#222222',
  },

  content: { paddingBottom: 24 },

  art: {
    marginTop: t.artTop,
    marginHorizontal: t.artInset,
    height: t.artHeight,
    borderRadius: t.artRadius,
    borderWidth: 1,
    borderColor: t.artBorder,
    overflow: 'hidden',
  },

  h1: {
    marginTop: t.h1Top,
    marginHorizontal: t.padX,
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    lineHeight: t.h1Line,
    color: '#222222',
  },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: t.padX,
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
    borderColor: t.cardBorder,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
    paddingHorizontal: t.cardPadX,
  },
  row: { flexDirection: 'row' },
  chip: {
    width: t.chip,
    height: t.chip,
    borderRadius: t.chip / 2,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.chipGap,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontFamily: font.appBody,
    fontSize: t.rowTitleSize,
    lineHeight: t.rowTitleLine,
    color: '#222222',
  },
  rowSub: {
    marginTop: t.rowSubTop,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    lineHeight: t.rowSubLine,
    color: colors.textBody,
  },
  rowRule: {
    height: 1,
    backgroundColor: t.rowRule,
    marginVertical: t.rowRuleGap,
    marginLeft: t.chip + t.chipGap,
    marginRight: -t.cardPadX + t.rowRuleRight,
  },

  stepsLabel: {
    marginTop: t.stepsTop,
    marginHorizontal: t.padX,
    fontFamily: font.appSemi,
    fontSize: t.stepsLabelSize,
    letterSpacing: t.stepsLabelTrack,
    color: ink.accent,
  },
  stepsRow: {
    marginTop: t.stepsRowTop,
    marginHorizontal: t.stepsInset,
    flexDirection: 'row',
  },
  stepsLine: {
    position: 'absolute',
    top: t.stepCircle / 2 - t.stepLineWidth / 2,
    height: t.stepLineWidth,
    backgroundColor: t.stepLine,
  },
  stepCol: { flex: 1, alignItems: 'center' },
  stepCircle: {
    width: t.stepCircle,
    height: t.stepCircle,
    borderRadius: t.stepCircle / 2,
    backgroundColor: t.stepCircleBg,
    borderWidth: 1,
    borderColor: t.stepCircleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  stepNum: {
    fontFamily: font.appBody,
    fontSize: t.stepNumSize,
    color: colors.textBody,
  },
  stepNumOn: { fontFamily: font.appSemi, color: ink.onBrand },
  stepLabel: {
    marginTop: t.stepLabelTop,
    paddingHorizontal: t.stepLabelPadX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.stepLabelSize,
    lineHeight: t.stepLabelLine,
    color: colors.textBody,
  },
  stepLabelOn: { fontFamily: font.appHeading, color: '#222222' },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: t.footerRule,
    backgroundColor: colors.appBg,
  },
  cta: {
    height: t.ctaHeight,
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
    marginRight: t.ctaArrowGap,
  },
  later: {
    marginTop: t.laterTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.laterSize,
    color: colors.textBody,
  },
});
import VerifyFlow from '../../../features/advocate-verification/VerifyFlow';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveVerifyScreen() { return DATA_SOURCE === 'api' ? <VerifyFlow/> : <AdvocateVerifyIntroScreen/>; }
