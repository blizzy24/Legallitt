import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ChevronLeft, ChevronRight, MessageSquareWarning, Reply, Star, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SegmentedControl from '../../components/SegmentedControl';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';
import { shrinkToFit } from '../../constants/textFit';
import { AT_REVIEWS } from '../../data/advocateTools';
import { advReviews as t, colors, font, ink } from '../../constants/theme';

// Advocate — reviews and ratings (design/264 filled, design/265 empty).
//
// ⚠ THE STATE SWITCHER IS OURS, NOT DRAWN. Neither export draws a control to
// move between the two states, so it is gated behind DEV_PREVIEW_TOGGLES and
// also reachable as ?state=empty. (Contrast designs 219, 229 and 259, where
// the client drew the switcher into the product.)
//
// ⚠ Note 1 — THE THIRD STAT TILE IS WRONG AND IS BUILT WRONG. It is labelled
// "Average Rating" and prints 128. The average is 4.8, shown directly above
// it; 128 is the review count, which is already the FIRST tile. Drawn label,
// drawn number.
//
// ⚠ Note 2 — "Based on 128 review", singular.
//
// ⚠ Note 13 — the two reviews are IDENTICAL: same client, same five stars,
// same sentence, same "2 hours ago". Both rows built as drawn.
//
// STATIC, NOT WIRED: the filter chips do not filter, the reply arrows reply to
// nothing, and no review is fetched.

type ReviewsState = 'filled' | 'empty';

const STATE_SEGMENTS: { key: ReviewsState; label: string }[] = [
  { key: 'filled', label: 'Filled' },
  { key: 'empty', label: 'Empty' },
];

export default function AdvocateReviewsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: string }>();
  const d = AT_REVIEWS;
  const [state, setState] = useState<ReviewsState>(params.state === 'empty' ? 'empty' : 'filled');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {state === 'empty' ? (
          <View style={styles.empty}>
            <MessageSquareWarning size={t.emptyGlyph} color={t.bg} fill="#B7A48E" strokeWidth={2} />
            <Text style={styles.emptyTitle} {...shrinkToFit(0.8)}>
              {d.empty.title}
            </Text>
            <Text style={styles.emptyBody}>{d.empty.body}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.section}>{d.sectionTitle}</Text>

            <View style={styles.card}>
              <View style={styles.agoRow}>
                <Text style={styles.ago} {...shrinkToFit(0.8)}>
                  {d.ago}
                </Text>
                <View style={styles.agoDot} />
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.score} {...shrinkToFit(0.8)}>
                  {d.score}
                </Text>
                <ChevronRight size={t.chevron} color="#8C8C8C" strokeWidth={2.2} />
              </View>
              <Text style={styles.based} {...shrinkToFit(0.8)}>
                {d.based}
              </Text>

              <View style={styles.bars}>
                {d.breakdown.map((b, i) => (
                  <View key={b.stars} style={[styles.barRow, i > 0 && { marginTop: t.barGap }]}>
                    <Text style={styles.barCount} {...shrinkToFit(0.8)}>
                      {b.stars}
                    </Text>
                    <Star size={t.barStar} color="#9D7553" fill="#9D7553" strokeWidth={1} />
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${b.fill * 100}%` }]} />
                    </View>
                    <Text style={styles.barTail} {...shrinkToFit(0.8)}>
                      {b.stars}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tiles}>
              {d.tiles.map((tile, i) => (
                <View key={tile.label} style={[styles.tile, i > 0 && { marginLeft: t.tileGap }]}>
                  <Text style={styles.tileNum} {...shrinkToFit(0.8)}>
                    {tile.value}
                  </Text>
                  <Text style={styles.tileLabel} {...shrinkToFit(0.75)}>
                    {tile.label}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.section}>{d.reviewsTitle}</Text>
            <View style={styles.chips}>
              {d.filters.map((f, i) => (
                <View key={f} style={[styles.chip, i === 0 && styles.chipOn, i > 0 && { marginLeft: t.chipGap }]}>
                  <Text style={[styles.chipText, i === 0 && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                    {f}
                  </Text>
                </View>
              ))}
            </View>

            {d.reviews.map((r, i) => (
              <View key={i} style={[styles.review, { marginTop: i === 0 ? t.reviewTop : t.reviewGap }]}>
                <View style={styles.reviewHead}>
                  <View style={styles.avatar}>
                    <UserRound size={26} color={ink.accent} strokeWidth={1.6} />
                  </View>
                  <View style={styles.reviewCol}>
                    <Text style={styles.name} {...shrinkToFit(0.8)}>
                      {r.name}
                    </Text>
                    <View style={styles.stars}>
                      {Array.from({ length: r.stars }, (_, k) => (
                        <Star
                          key={k}
                          size={t.star}
                          color="#9D7553"
                          fill="#9D7553"
                          strokeWidth={1}
                          style={k > 0 ? styles.starGap : undefined}
                        />
                      ))}
                    </View>
                  </View>
                  <Reply size={t.replyGlyph} color="#8C7050" strokeWidth={2} />
                </View>
                <Text style={styles.body}>{r.body}</Text>
                <View style={styles.foot}>
                  <Text style={styles.footText} {...shrinkToFit(0.8)}>
                    {r.matter}
                  </Text>
                  <Text style={styles.footText} {...shrinkToFit(0.8)}>
                    {r.ago}
                  </Text>
                  <ChevronRight size={20} color="#8C7050" strokeWidth={2.2} style={styles.footChev} />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Development only — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
            No design draws this control; see the header comment. */}
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
    marginLeft: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },

  content: { paddingBottom: 28 },

  section: {
    marginTop: t.sectionTop,
    marginHorizontal: t.padX,
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: '#4D463D',
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadY,
    paddingBottom: t.cardPadBottom,
  },
  agoRow: {
    height: t.agoRowH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ago: { fontFamily: font.appBody, fontSize: t.agoSize, color: '#6B6B6B' },
  agoDot: {
    marginLeft: t.agoGap,
    width: t.agoDot,
    height: t.agoDot,
    borderRadius: t.agoDot / 2,
    backgroundColor: '#6B6B6B',
  },
  scoreRow: { marginTop: t.scoreTop, flexDirection: 'row', alignItems: 'center' },
  score: {
    flex: 1,
    fontFamily: font.appHeading,
    fontSize: t.scoreSize,
    lineHeight: t.scoreLine,
    color: '#6B5B45',
  },
  based: { marginTop: t.basedTop, fontFamily: font.appHeading, fontSize: t.basedSize, color: '#4D463D' },

  bars: { marginTop: t.barTop },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barCount: {
    width: t.barCountW,
    fontFamily: font.appHeading,
    fontSize: t.barCountSize,
    color: '#1B1C1C',
  },
  barTrack: {
    flex: 1,
    marginLeft: t.barStarGap,
    height: t.barH,
    borderRadius: t.barRadius,
    backgroundColor: t.barTrack,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: t.barRadius, backgroundColor: t.barFill },
  barTail: {
    width: t.barTailW,
    marginLeft: 8,
    fontFamily: font.appHeading,
    fontSize: t.barCountSize,
    color: '#1B1C1C',
  },

  tiles: { marginTop: t.tileTop, marginHorizontal: t.padX, flexDirection: 'row' },
  tile: {
    flex: 1,
    height: t.tileH,
    borderRadius: t.tileRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNum: { fontFamily: font.appHeading, fontSize: t.tileNumSize, color: '#8C7050' },
  tileLabel: {
    marginTop: t.tileLabelTop,
    fontFamily: font.appHeading,
    fontSize: t.tileLabelSize,
    color: '#4D463D',
  },

  chips: { marginTop: t.chipsTop, marginHorizontal: t.padX, flexDirection: 'row' },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOnBg },
  chipText: { fontFamily: font.appHeading, fontSize: t.chipSize, color: '#4D463D' },
  chipTextOn: { color: ink.onBrand },

  review: {
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.reviewRadius,
    paddingHorizontal: t.reviewPadX,
    paddingVertical: t.reviewPadY,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#F2EAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.avatarGap,
  },
  reviewCol: { flex: 1 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: '#1B1C1C' },
  stars: { marginTop: t.starsTop, flexDirection: 'row' },
  starGap: { marginLeft: t.starGap },
  body: {
    marginTop: t.bodyTop,
    maxWidth: t.bodyMaxW,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLine,
    color: '#1B1C1C',
  },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center' },
  footText: { flex: 1, fontFamily: font.appBody, fontSize: t.footSize, color: '#4D463D' },
  footChev: { marginLeft: 6 },

  empty: { alignItems: 'center', paddingTop: t.emptyTop },
  emptyTitle: {
    marginTop: t.emptyTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.emptyTitleSize,
    color: '#1B1C1C',
  },
  emptyBody: {
    marginTop: t.emptyBodyTop,
    marginHorizontal: 40,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.emptyBodySize,
    lineHeight: t.emptyBodyLine,
    color: '#4D463D',
  },

  toggle: { marginTop: 24, marginHorizontal: t.padX },
  toggleLabel: {
    marginBottom: 8,
    fontFamily: font.appSemi,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
