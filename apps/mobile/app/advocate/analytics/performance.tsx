import { router, type Href } from 'expo-router';
import { ChevronDown, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AT_PERFORMANCE } from '../../../data/advocateTools';
import {
  advAnalytics as a,
  advPerformance as t,
  colors,
  font,
} from '../../../constants/theme';

// Advocate — service and monthly performance (design/269).
//
// ⚠ A 3× EXPORT: 1170px wide for a 390pt screen. Every token divided by three.
//
// ⚠ Note 3 — THE DOCUMENTS FORENSIC ROW CONTRADICTS ITSELF. Its bar is labelled
// 2 and its subtitle reads "5 Consultations". The five bars sum to 42 only if
// that row is 2, and 42 is exactly what design/268 prints for Consultations —
// so the bar is right and the subtitle is the wrong one. Both drawn as drawn.
//
// ⚠ THE BAR WIDTHS ARE NOT PROPORTIONAL TO THEIR VALUES. 18 draws 160pt and 10
// draws 71pt, where proportion would give 89. The measured widths are used so
// the screen matches the export; nothing is computed from the numbers.
//
// The bars are plain Views, not SVG — they are rectangles, and no charting
// library was added for them.
//
// STATIC, NOT WIRED: the month chevrons move nothing and the range dropdown
// opens nothing.

export default function AdvocatePerformanceScreen() {
  const insets = useSafeAreaInsets();
  const d = AT_PERFORMANCE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + a.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/analytics' as Href))}
        >
          <ChevronLeft size={a.backIcon} color={colors.brand} strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <View style={{ width: a.backIcon }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.monthRow}>
          <ChevronLeft size={a.monthGlyph} color="#1B1C1C" strokeWidth={2.6} />
          <Text style={styles.month} {...shrinkToFit(0.8)}>
            {d.month}
          </Text>
          <ChevronRight size={a.monthGlyph} color="#1B1C1C" strokeWidth={2.6} />
          <View style={styles.spacer} />
          <View style={styles.range}>
            <Text style={styles.rangeText} {...shrinkToFit(0.8)}>
              {d.range}
            </Text>
            <ChevronDown size={a.rangeGlyph} color="#1B1C1C" strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
            {d.serviceTitle}
          </Text>
          {d.services.map((s, i) => (
            <View key={s.label} style={[styles.svcRow, { marginTop: i === 0 ? t.rowTop : t.rowGap }]}>
              <View style={styles.svcLabel}>
                <Text style={styles.svcName} {...shrinkToFit(0.8)}>
                  {s.label}
                </Text>
                <Text style={styles.svcSub} {...shrinkToFit(0.8)}>
                  {s.sub}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: s.w }]} />
              </View>
              <Text style={styles.barValue} {...shrinkToFit(0.8)}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginTop: t.tableTitleTop }]} {...shrinkToFit(0.8)}>
            {d.monthlyTitle}
          </Text>
          <View style={styles.headRow}>
            {d.columns.map((c, i) => (
              <Text
                key={c}
                style={[styles.headCell, styles[`col${i}` as 'col0'], i > 0 && styles.cellCentre]}
                {...shrinkToFit(0.75)}
              >
                {c}
              </Text>
            ))}
          </View>
          <View style={styles.headRule} />
          {d.months.map((m) => (
            <View key={m.month} style={[styles.tableRow, m.current && styles.tableRowOn]}>
              <Text style={[styles.cell, styles.col0]} {...shrinkToFit(0.8)}>
                {m.month}
              </Text>
              <Text style={[styles.cell, styles.col1, styles.cellCentre]} {...shrinkToFit(0.8)}>
                {m.earnings}
              </Text>
              <Text style={[styles.cell, styles.col2, styles.cellCentre]} {...shrinkToFit(0.8)}>
                {m.consults}
              </Text>
              <View style={[styles.col3, styles.ratingCell]}>
                <Text style={styles.cell} {...shrinkToFit(0.8)}>
                  {m.rating}
                </Text>
                <Star
                  size={t.tableStar}
                  color={t.barFill}
                  fill={t.barFill}
                  strokeWidth={1}
                  style={styles.ratingStar}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: a.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: a.padX,
    height: a.headerH,
    backgroundColor: a.headerBg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: a.titleSize,
    color: '#1B1C1C',
  },

  content: { paddingBottom: 30 },

  monthRow: {
    marginTop: a.monthTop,
    marginHorizontal: a.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  month: {
    marginHorizontal: a.monthGap,
    fontFamily: font.appHeading,
    fontSize: a.monthSize,
    color: '#1B1C1C',
  },
  spacer: { flex: 1 },
  range: {
    width: a.rangeW,
    height: a.rangeH,
    borderRadius: a.rangeRadius,
    borderWidth: 1,
    borderColor: a.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeText: {
    marginRight: 5,
    fontFamily: font.appHeading,
    fontSize: a.rangeSize,
    color: '#1B1C1C',
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: a.padX,
    borderRadius: a.cardRadius,
    borderWidth: 1,
    borderColor: a.cardBorder,
    paddingHorizontal: t.cardPadX,
    paddingBottom: t.cardPadX,
  },
  cardTitle: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },

  svcRow: { flexDirection: 'row', alignItems: 'center', minHeight: t.rowH },
  svcLabel: { width: t.labelW },
  svcName: {
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    lineHeight: t.labelLine,
    color: '#1B1C1C',
  },
  svcSub: {
    marginTop: t.subTop,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: '#4D463D',
  },
  barTrack: {
    width: t.barW,
    height: t.barH,
    borderRadius: t.barRadius,
    backgroundColor: t.barTrack,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: t.barRadius, backgroundColor: t.barFill },
  barValue: {
    marginLeft: t.barValueLeft,
    fontFamily: font.appBody,
    fontSize: t.barValueSize,
    color: '#1B1C1C',
  },

  headRow: { marginTop: t.headTop, flexDirection: 'row' },
  headCell: { fontFamily: font.appBody, fontSize: t.headSize, color: '#1B1C1C' },
  headRule: { marginTop: t.headRuleTop, height: 1, backgroundColor: a.cardBorder },
  tableRow: {
    height: t.tableRowH,
    marginHorizontal: -t.cardPadX,
    paddingHorizontal: t.cardPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableRowOn: { backgroundColor: t.tableHighlight },
  cell: { fontFamily: font.appBody, fontSize: t.tableRowSize, color: '#1B1C1C' },
  cellCentre: { textAlign: 'center' },
  col0: { width: `${t.colMonthly * 100}%` },
  col1: { width: `${t.colEarnings * 100}%` },
  col2: { width: `${t.colConsults * 100}%` },
  col3: { width: `${t.colRating * 100}%` },
  ratingCell: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ratingStar: { marginLeft: t.tableStarGap },
});
