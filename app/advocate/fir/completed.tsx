import { router, type Href } from 'expo-router';
import { BadgeCheck, Check, UserRound, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_COMPLETED } from '../../../data/advocateFir';
import { advFirCompleted as t, advFirGreen, colors, font, ink } from '../../../constants/theme';

// FIR completed (design/220).
//
// ⚠ components/ReportSentScreen DOES NOT FIT and is not reused. That component
// (designs 203 and 212, which are the same pixels apart from a figure) is a check,
// one PAYMENT SUMMARY card and one button. design/220 has a close (×) header, a
// headline and sub-line, a CASE card, a YOUR PAYMENT card with an inner receipt
// box, a five-row COMPLETED STEPS card and two actions. Only the green circle is
// common — and it is a different green.
//
// ⚠ THE SUCCESS MARK IS A FOURTH GREEN (#55A900) where designs 203 and 212 draw
// the identical mark in #4CA214. Quarantined in advFirGreen, not added to the
// shared palette.
//
// ⚠ THE DOCKET RETURNS TO FIR-2026-1048, unprefixed, after designs 218 and 219
// used #FIR-2026-8841.
//
// ⚠ THE PAYMENT DATE IS 19 Oct 2026 — ten days ahead of the app's current date,
// and a day after the incident the same flow describes in the past tense.

export default function AdvocateFirCompletedScreen() {
  const insets = useSafeAreaInsets();
  const c = FIR_COMPLETED;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => router.replace('/(advocate)/dashboard' as Href)}
        >
          <X size={t.closeIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {c.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ⚠ #55A900 — a fourth success green. See advFir.ts. */}
        <View style={styles.mark}>
          <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />
        </View>
        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {c.headline}
        </Text>
        <Text style={styles.body}>{c.body}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {c.caseCard.label}
            </Text>
            <View style={styles.chip}>
              <BadgeCheck size={t.chipIcon} color={t.chipColour} />
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {c.caseCard.chip}
              </Text>
            </View>
          </View>
          {c.caseCard.rows.map((r) => (
            <View key={r.label} style={styles.caseRow}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {c.payment.label}
            </Text>
            <View style={styles.chip}>
              <Check size={t.chipIcon} color={t.chipColour} strokeWidth={3} />
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {c.payment.chip}
              </Text>
            </View>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amount} {...shrinkToFit(0.7)}>
              {c.payment.amount}
            </Text>
            <Text style={styles.amountUnit} {...shrinkToFit(0.8)}>
              {c.payment.unit}
            </Text>
          </View>
          <Text style={styles.payBody}>{c.payment.body}</Text>
          <View style={styles.payBox}>
            {c.payment.rows.map((r, i) => (
              <View key={r.label} style={i > 0 ? styles.payRowNext : styles.row}>
                <Text style={styles.payRowLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.payRowValue} {...shrinkToFit(0.75)}>
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {c.steps.label}
          </Text>
          {c.steps.rows.map((s, i) => (
            <View key={s} style={[styles.stepRow, i === 0 ? styles.stepFirst : null]}>
              <View style={styles.stepTick}>
                <Check size={t.stepTickGlyph} color={t.stepTickColour} strokeWidth={3} />
              </View>
              <Text style={styles.stepText} {...shrinkToFit(0.8)}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(advocate)/earnings' as Href)}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText} {...shrinkToFit(0.8)}>
            {c.primary}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/fir/draft' as Href)}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            {c.secondary}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24, alignItems: 'stretch' },
  mark: {
    marginTop: t.markGap,
    alignSelf: 'center',
    width: t.mark,
    height: t.mark,
    borderRadius: t.mark / 2,
    backgroundColor: advFirGreen.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    marginTop: t.headlineGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headlineSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: t.bodyColour,
  },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: {
    flexShrink: 1,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.labelColour,
  },
  chip: {
    marginLeft: 'auto',
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipText: { marginLeft: t.chipIconGap, fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipColour, flexShrink: 1 },

  caseRow: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center' },
  rowLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.rowLabelColour },
  rowValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },

  amountRow: { marginTop: t.amountGap, flexDirection: 'row', alignItems: 'baseline' },
  amount: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.amountSize, color: colors.textPrimary },
  amountUnit: { marginLeft: t.amountUnitGap, flexShrink: 1, fontFamily: font.appSemi, fontSize: t.amountUnitSize, color: t.amountUnitColour },
  payBody: { marginTop: t.payBodyGap, fontFamily: font.appBody, fontSize: t.payBodySize, color: colors.textPrimary },
  payBox: { marginTop: t.payBoxGap, borderRadius: t.payBoxRadius, backgroundColor: t.payBoxBg, padding: t.payBoxPad },
  payRowNext: { marginTop: t.payRowGapY, flexDirection: 'row', alignItems: 'center' },
  payRowLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appBody, fontSize: t.payRowLabelSize, color: t.payRowLabelColour },
  payRowValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.payRowValueSize, color: colors.textPrimary },

  stepRow: { marginTop: t.stepPitch - t.stepTick, flexDirection: 'row', alignItems: 'center' },
  stepFirst: { marginTop: t.stepGap },
  stepTick: {
    width: t.stepTick,
    height: t.stepTick,
    borderRadius: t.stepTick / 2,
    backgroundColor: t.stepTickBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { marginLeft: t.stepTickGap, flexShrink: 1, fontFamily: font.appBody, fontSize: t.stepSize, color: colors.textPrimary },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  primary: {
    minHeight: t.primaryHeight,
    borderRadius: t.primaryRadius,
    backgroundColor: t.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: font.appHeading, fontSize: t.primarySize, color: ink.onBrand, flexShrink: 1 },
  secondary: { marginTop: t.secondaryGap, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: font.appSemi, fontSize: t.secondarySize, color: t.secondaryColour },
  pressed: { opacity: 0.85 },
});
