import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight, MoveUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConsultationDonut from '../../../components/ConsultationDonut';
import EarningsChart from '../../../components/EarningsChart';
import SegmentedControl from '../../../components/SegmentedControl';
import { DEV_PREVIEW_TOGGLES } from '../../../constants/dev';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_ANALYTICS } from '../../../data/advocateTools';
import { advAnalytics as t, advAnalyticsRed as red, colors, font, ink } from '../../../constants/theme';

// Advocate — analytics (design/268 loaded, design/270 error).
//
// ⚠ 3× EXPORTS. 268 and 270 are 1170px wide for a 390pt screen. Every token is
// divided by three, element by element.
//
// ⚠ THE STATE SWITCHER IS OURS, NOT DRAWN — gated behind DEV_PREVIEW_TOGGLES
// and reachable as ?state=error.
//
// ⚠ Note 4 — Total Earnings is ₹85,500 here and ₹84,500 on design/256, one tap
// away. ⚠ Note 5 — Completed Cases and Earnings Overview carry the same +8.4%,
// and the tile labels 86% "Acceptance Rate" while the donut labels the same 86%
// "Completed". All drawn as drawn.
//
// ⚠ design/270's error circle is #FF6E6E, a FOURTH red this project does not
// have. Quarantined as advAnalyticsRed — see constants/tokens/advTools.ts.
//
// CHARTS: both are react-native-svg, hand-measured off the export. No charting
// library was added. Every value is static; no axis is computed, nothing
// animates and there are no tooltips.
//
// STATIC, NOT WIRED: the month chevrons move nothing, the range dropdown opens
// nothing, and no figure is fetched.

type AnalyticsState = 'loaded' | 'error';

const STATE_SEGMENTS: { key: AnalyticsState; label: string }[] = [
  { key: 'loaded', label: 'Loaded' },
  { key: 'error', label: 'Error' },
];

export default function AdvocateAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: string }>();
  const d = AT_ANALYTICS;
  const [state, setState] = useState<AnalyticsState>(params.state === 'error' ? 'error' : 'loaded');

  const donutColour = (tone: string) =>
    tone === 'green' ? t.donutGreen : tone === 'brand' ? t.donutBrand : t.donutRed;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.brand} strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={{ width: t.backIcon }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {state === 'error' ? (
          <View style={styles.err}>
            <View style={styles.errCircle}>
              <Text style={styles.errBang}>!</Text>
            </View>
            <Text style={styles.errTitle} {...shrinkToFit(0.8)}>
              {d.error.title}
            </Text>
            <Text style={styles.errBody}>{d.error.body}</Text>
            <View style={styles.errCta}>
              <Text style={styles.errCtaText} {...shrinkToFit(0.8)}>
                {d.error.cta}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.monthRow}>
              <ChevronLeft size={t.monthGlyph} color="#1B1C1C" strokeWidth={2.6} />
              <Text style={styles.month} {...shrinkToFit(0.8)}>
                {d.month}
              </Text>
              <ChevronRight size={t.monthGlyph} color="#1B1C1C" strokeWidth={2.6} />
              <View style={styles.rangeSpacer} />
              <View style={styles.range}>
                <Text style={styles.rangeText} {...shrinkToFit(0.8)}>
                  {d.range}
                </Text>
                <ChevronDown size={t.rangeGlyph} color="#1B1C1C" strokeWidth={2.2} />
              </View>
            </View>

            <View style={styles.tiles}>
              {d.tiles.map((tile, i) => (
                <View
                  key={tile.label}
                  style={[
                    styles.tile,
                    i % 2 === 1 && { marginLeft: t.tileGap },
                    i > 1 && { marginTop: t.tileGap },
                  ]}
                >
                  <Text style={styles.tileLabel} {...shrinkToFit(0.8)}>
                    {tile.label}
                  </Text>
                  <Text style={styles.tileValue} {...shrinkToFit(0.8)}>
                    {tile.value}
                  </Text>
                  <View style={styles.deltaRow}>
                    <MoveUp size={t.tileDeltaGlyph} color={t.tileDeltaColour} strokeWidth={2.6} />
                    <Text style={styles.delta} {...shrinkToFit(0.8)}>
                      {tile.delta}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.overTitle} {...shrinkToFit(0.8)}>
                {d.earnings.title}
              </Text>
              <Text style={styles.overValue} {...shrinkToFit(0.8)}>
                {d.earnings.value}
              </Text>
              <Text style={styles.overSub}>{d.earnings.sub}</Text>
              <View style={styles.overDelta}>
                <MoveUp size={t.tileDeltaGlyph} color={t.tileDeltaColour} strokeWidth={2.6} />
                <Text style={styles.delta} {...shrinkToFit(0.8)}>
                  {d.earnings.delta}
                </Text>
                <Text style={styles.overDeltaSuffix} {...shrinkToFit(0.8)}>
                  {d.earnings.deltaSuffix}
                </Text>
              </View>

              <Text style={styles.chartLabel}>{d.earnings.chartLabel}</Text>
              <View style={styles.plotRow}>
                <View style={styles.axis}>
                  {d.earnings.axis.map((a) => (
                    <Text key={a} style={styles.axisText} {...shrinkToFit(0.8)}>
                      {a}
                    </Text>
                  ))}
                </View>
                <EarningsChart
                  width={t.plotRight - t.plotLeft}
                  height={t.plotBottom - t.plotTop + (t.plotTop - 450)}
                />
              </View>
              <View style={styles.weeks}>
                {d.earnings.weeks.map((w) => (
                  <Text key={w} style={styles.weekText} {...shrinkToFit(0.8)}>
                    {w}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.overTitle} {...shrinkToFit(0.8)}>
                {d.consultations.title}
              </Text>
              <View style={styles.donutRow}>
                <View style={styles.donutWrap}>
                  <ConsultationDonut
                    size={(t.donutR * 2 + t.donutW)}
                    segments={d.consultations.legend.map((l) => ({
                      pct: l.pct,
                      colour: donutColour(l.tone),
                    }))}
                  />
                  <View style={styles.donutCentre}>
                    <Text style={styles.donutTotal}>{d.consultations.total}</Text>
                    <Text style={styles.donutTotalLabel}>{d.consultations.totalLabel}</Text>
                  </View>
                </View>
                <View style={styles.legend}>
                  {d.consultations.legend.map((l) => (
                    <View key={l.label} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: donutColour(l.tone) }]} />
                      <Text style={styles.legendLabel} {...shrinkToFit(0.8)}>
                        {l.label}
                      </Text>
                      <Text style={styles.legendValue} {...shrinkToFit(0.8)}>
                        {l.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.perf, pressed && styles.pressed]}
              onPress={() => router.push('/advocate/analytics/performance' as Href)}
            >
              <Text style={styles.perfText} {...shrinkToFit(0.8)}>
                {d.performance}
              </Text>
            </Pressable>
          </>
        )}

        {/* Development only — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
            No design draws this control. */}
        {DEV_PREVIEW_TOGGLES ? (
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Preview state</Text>
            <SegmentedControl segments={STATE_SEGMENTS} value={state} onChange={setState} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    height: t.headerH,
    backgroundColor: t.headerBg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },

  content: { paddingBottom: 30 },

  monthRow: {
    marginTop: t.monthTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  month: {
    marginHorizontal: t.monthGap,
    fontFamily: font.appHeading,
    fontSize: t.monthSize,
    color: '#1B1C1C',
  },
  rangeSpacer: { flex: 1 },
  range: {
    width: t.rangeW,
    height: t.rangeH,
    borderRadius: t.rangeRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeText: {
    marginRight: 5,
    fontFamily: font.appHeading,
    fontSize: t.rangeSize,
    color: '#1B1C1C',
  },

  tiles: {
    marginTop: t.tileTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: (390 - t.padX * 2 - t.tileGap) / 2,
    height: t.tileH,
    borderRadius: t.tileRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    paddingHorizontal: t.tilePadX,
  },
  tileLabel: {
    marginTop: t.tileLabelTop,
    fontFamily: font.appBody,
    fontSize: t.tileLabelSize,
    lineHeight: t.tileLabelLine,
    color: '#1B1C1C',
  },
  tileValue: {
    marginTop: t.tileValueTop,
    fontFamily: font.appBody,
    fontSize: t.tileValueSize,
    lineHeight: t.tileValueLine,
    color: t.tileValueColour,
  },
  deltaRow: { marginTop: t.tileDeltaTop, flexDirection: 'row', alignItems: 'center' },
  delta: { fontFamily: font.appBody, fontSize: t.tileDeltaSize, color: t.tileDeltaColour },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  overTitle: { fontFamily: font.appBody, fontSize: t.overTitleSize, color: '#1B1C1C' },
  overValue: {
    marginTop: t.overValueTop,
    fontFamily: font.appBody,
    fontSize: t.overValueSize,
    color: t.tileValueColour,
  },
  overSub: { marginTop: t.overSubTop, fontFamily: font.appBody, fontSize: t.overSubSize, color: '#1B1C1C' },
  overDelta: { marginTop: t.overDeltaTop, flexDirection: 'row', alignItems: 'center' },
  overDeltaSuffix: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.overDeltaSize,
    color: '#4D463D',
  },

  chartLabel: {
    marginTop: t.chartTop,
    fontFamily: font.appBody,
    fontSize: t.chartLabelSize,
    color: '#4D463D',
  },
  plotRow: { flexDirection: 'row' },
  // The four labels sit ON the four gridlines, so the column spans exactly from
  // the ₹30k line to the ₹0 line, offset by half a label height.
  axis: {
    // design/268 starts the axis labels 2pt LEFT of the card's inner edge, so
    // the column is pulled out by 4 and widened to match. The chart still
    // begins at the measured plot left.
    marginLeft: -4,
    width: t.plotLeft - t.padX - t.cardPadX + 4,
    height: t.plotBottom - t.plotTop + t.axisLabelH,
    marginTop: t.plotTop - 450 - t.axisLabelH / 2,
    justifyContent: 'space-between',
  },
  axisText: {
    fontFamily: font.appBody,
    fontSize: t.axisSize,
    lineHeight: t.axisLabelH,
    color: '#1B1C1C',
  },
  weeks: {
    marginTop: t.weekTop,
    marginLeft: t.plotLeft - t.padX - t.cardPadX,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekText: { fontFamily: font.appHeading, fontSize: t.weekSize, color: '#1B1C1C' },

  donutRow: { marginTop: t.donutTop, flexDirection: 'row', alignItems: 'center' },
  donutWrap: { alignItems: 'center', justifyContent: 'center' },
  donutCentre: { position: 'absolute', alignItems: 'center' },
  donutTotal: { fontFamily: font.appHeading, fontSize: t.donutTotalSize, color: '#1B1C1C' },
  donutTotalLabel: { fontFamily: font.appBody, fontSize: t.donutTotalLabelSize, color: '#6B6B6B' },
  legend: { flex: 1, marginLeft: t.legendGap },
  legendRow: { height: t.legendRowH, flexDirection: 'row', alignItems: 'center' },
  legendDot: {
    width: t.legendDot,
    height: t.legendDot,
    borderRadius: t.legendDot / 2,
    marginRight: t.legendGap,
  },
  legendLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.legendSize, color: '#1B1C1C' },
  legendValue: { fontFamily: font.appBody, fontSize: t.legendValueSize, color: '#1B1C1C' },

  perf: {
    marginTop: t.perfTop,
    marginHorizontal: t.padX,
    height: t.perfH,
    borderRadius: t.perfRadius,
    borderWidth: 1,
    borderColor: t.perfBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  perfText: { fontFamily: font.appHeading, fontSize: t.perfSize, color: colors.brand },

  err: { alignItems: 'center', paddingTop: t.errTop },
  errCircle: {
    width: t.errCircle,
    height: t.errCircle,
    borderRadius: t.errCircle / 2,
    backgroundColor: red.errorCircle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errBang: {
    fontFamily: font.appHeading,
    fontSize: t.errGlyph,
    lineHeight: t.errGlyph * 1.12,
    color: '#FFFFFF',
  },
  errTitle: {
    marginTop: t.errTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.errTitleSize,
    color: '#1B1C1C',
  },
  errBody: {
    marginTop: t.errBodyTop,
    fontFamily: font.appBody,
    fontSize: t.errBodySize,
    lineHeight: t.errBodyLine,
    color: '#1B1C1C',
  },
  errCta: {
    marginTop: t.errCtaTop,
    height: t.errCtaH,
    borderRadius: t.errCtaRadius,
    paddingHorizontal: t.errCtaPadX,
    backgroundColor: '#A3805B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errCtaText: { fontFamily: font.appHeading, fontSize: t.errCtaSize, color: ink.onBrand },

  toggle: { marginTop: 24, marginHorizontal: t.padX },
  toggleLabel: {
    marginBottom: 8,
    fontFamily: font.appSemi,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
