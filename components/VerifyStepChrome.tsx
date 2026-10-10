import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { advVerifyStep as t, colors, font, ink } from '../constants/theme';

/**
 * The chrome every step of the advocate enrollment wizard draws (designs
 * 234–239): a 40pt back circle, a centred title over an eyebrow, a "Step n of 4"
 * pill, a four-segment progress bar, and a pinned Continue button.
 *
 * ⚠ `step` and `filled` are passed in per screen BECAUSE THE EXPORTS DISAGREE
 * with each other: four segments for six screens, with two of the labels drawn
 * twice. Each screen hands over exactly what its own PNG draws. Nothing is
 * renumbered here — see note 1 in data/advocateVerify.ts.
 */
export default function VerifyStepChrome({
  title,
  eyebrow,
  step,
  filled,
  segments = 4,
  cta,
  onContinue,
  children,
}: {
  title: string;
  eyebrow: string;
  step: string;
  filled: number;
  segments?: number;
  cta: string;
  onContinue: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
          >
            <ArrowLeft size={t.backIcon} color="#222222" strokeWidth={2.2} />
          </Pressable>

          <View style={styles.titleCol}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {title}
            </Text>
            <Text style={styles.eyebrow} {...shrinkToFit(0.8)}>
              {eyebrow}
            </Text>
          </View>

          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {step}
            </Text>
          </View>
        </View>

        <View style={styles.progress}>
          {Array.from({ length: segments }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                i > 0 && { marginLeft: t.progressGap },
                i < filled && styles.segmentOn,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={onContinue}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {cta}
          </Text>
          <ArrowRight size={t.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.rule,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBg,
    borderWidth: 1,
    borderColor: t.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1, alignItems: 'center' },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    lineHeight: t.titleLine,
    color: '#222222',
  },
  eyebrow: {
    marginTop: t.eyebrowTop,
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: colors.textBody,
  },
  pill: {
    height: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.backBg,
    borderWidth: 1,
    borderColor: t.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    color: ink.accent,
  },

  progress: { marginTop: t.progressTop, flexDirection: 'row' },
  segment: {
    flex: 1,
    height: t.progressHeight,
    borderRadius: t.progressRadius,
    backgroundColor: t.progressOff,
  },
  segmentOn: { backgroundColor: colors.brand },

  content: { paddingBottom: 24 },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: t.rule,
    backgroundColor: t.bg,
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
});
