import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Gavel,
  Scale,
  Search,
  SlidersHorizontal,
  UserRound,
  Video,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import {
  ADV_CASES,
  ADV_CASES_ACTIONS,
  ADV_CASES_COPY,
  ADV_CASES_SERVICE_KEYS,
  ADV_CASES_FILTERS,
  ADV_CASES_SERVICES,
  ADV_CASES_STATS,
  type AdvCaseMatter,
} from '../data/advocateSide';
import { advCases as t, colors, font, ink } from '../constants/theme';

// The advocate cases list, shared by design/204 + design/205 (the Cases TAB) and
// design/214 (the FIR Draft filter).
//
// ⚠ ALL THREE DESIGNS ARE THE SAME SCREEN. design/204 is the unfiltered list,
// design/205 the same list with Property Search selected, design/214 the same list
// with FIR Draft selected. design/214 draws the advocate TAB BAR with the scales tab
// active, exactly as 204 and 205 do — so by the export it is a state of the tab, not
// a pushed screen. It is also built at app/advocate/fir/requests.tsx on request;
// that copy passes chrome="pushed" and renders no tab bar. See the report.
//
// ⚠ design/214's card action reads "Continue Draft →" WITH an arrow where design/204
// reads "Review Request" with none. Both are kept, chosen per service.

export type CasesChrome = 'tab' | 'pushed' | 'portal';

const BODY_ICONS = { calendar: CalendarDays, gavel: Gavel, video: Video };

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  'Client Review': { bg: '#E4F4EA', fg: '#1E7A44' },
  'Draft Preparation': { bg: '#FBEEDC', fg: '#B5741A' },
  'Report Preparation': { bg: '#FBEEDC', fg: '#A8601A' },
  'Waiting for Specialist': { bg: '#EFE9F8', fg: '#6B4FA8' },
  'Documents Pending': { bg: '#FBEEDC', fg: '#B5741A' },
  Active: { bg: '#E4F4EA', fg: '#1E7A44' },
  Upcoming: { bg: '#E6EEF8', fg: '#2E5EA8' },
};

const STAT_TONE = { active: '#A08A6E', upcoming: '#F0C890', completed: '#2FBF6B' } as const;

export default function AdvocateCasesList({
  chrome = 'tab',
  initialService = 'All Services',
  title,
  eyebrow,
  subtitle,
  extraSearch,
  showStats = true,
  showListTitle = true,
}: {
  chrome?: CasesChrome;
  initialService?: string;
  /** Pushed and portal variants — the header title. The tab variant uses the design's. */
  title?: string;
  /** Portal variant — the second header line under the title (design/222). */
  eyebrow?: string;
  /** Portal variant — the line under the header (design/222). */
  subtitle?: string;
  /**
   * Portal variant — a SECOND search field above the list's own.
   * ⚠ design/222 genuinely draws two stacked search fields with different
   * placeholders. Built as drawn; see data/advocateForensic.ts.
   */
  extraSearch?: string;
  /** design/222 draws no stat cards and no "Your Matters" row. */
  showStats?: boolean;
  showListTitle?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const c = ADV_CASES_COPY;
  const [filter, setFilter] = useState('All');
  const [service, setService] = useState(initialService);

  const matters = useMemo(
    () =>
      ADV_CASES.filter((m) => {
        if (filter !== 'All' && m.bucket !== filter) return false;
        if (service !== 'All Services' && ADV_CASES_SERVICE_KEYS[service] !== m.serviceKey) return false;
        return true;
      }),
    [filter, service],
  );
  const filtersActive = (filter !== 'All' ? 1 : 0) + (service !== 'All Services' ? 1 : 0);

  function review(m: AdvCaseMatter) {
    if (m.serviceKey === 'property-search') {
      router.push(`/advocate/property-search/${m.id}/request` as Href);
    } else if (m.serviceKey === 'legal-notice') {
      router.push(`/advocate/notice/${m.id}/fee` as Href);
    } else if (m.serviceKey === 'fir') {
      router.push('/advocate/fir/fir-2026-1048' as Href);
    } else if (m.serviceKey === 'forensic') {
      router.push('/advocate/forensic/df-2026-1048' as Href);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        {chrome !== 'tab' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          >
            <ChevronLeft size={t.markIcon} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={styles.mark}>
            <Scale size={t.markIcon} color={colors.brandDark} />
          </View>
        )}
        {chrome === 'portal' ? (
          <View style={styles.headerCol}>
            <Text style={styles.headerTitle} {...shrinkToFit(0.7)}>
              {title ?? c.headerTitle}
            </Text>
            {eyebrow && (
              <Text style={styles.headerEyebrow} {...shrinkToFit(0.75)}>
                {eyebrow}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.headerTitle} {...shrinkToFit(0.75)}>
            {chrome === 'pushed' && title ? title : c.headerTitle}
          </Text>
        )}
        {chrome === 'portal' && (
          <SlidersHorizontal size={t.filterBtnIcon} color={colors.textPrimary} style={styles.portalFilter} />
        )}
        {chrome === 'tab' && (
          <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={10}>
            <Search size={t.searchBtn} color={colors.textPrimary} />
          </Pressable>
        )}
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {chrome === 'portal' && subtitle ? (
          <Text style={styles.portalSub}>{subtitle}</Text>
        ) : (
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            <Text style={styles.title} {...shrinkToFit(0.75)}>
              {c.title}
            </Text>
            <Text style={styles.sub}>{c.subtitle}</Text>
          </View>
          {/* design/205 only — drawn when a filter is applied. */}
          {filtersActive > 0 && (
            <View style={styles.filterBtn}>
              <SlidersHorizontal size={t.filterBtnIcon} color={colors.textPrimary} />
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filtersActive}</Text>
              </View>
            </View>
          )}
        </View>
        )}

        {extraSearch && (
          /* ⚠ design/222 draws a SECOND search field here. As drawn. */
          <View style={[styles.search, styles.extraSearch]}>
            <Search size={t.searchIcon} color={colors.textBody} />
            <TextInput
              style={styles.searchInput}
              placeholder={extraSearch}
              placeholderTextColor={colors.textBody}
            />
          </View>
        )}

        {showStats && (
        <View style={styles.stats}>
          {ADV_CASES_STATS.map((s) => (
            <View key={s.label} style={styles.stat}>
              <View style={styles.statHead}>
                <Text style={styles.statLabel} {...shrinkToFit(0.7)}>
                  {s.label}
                </Text>
                <View style={[styles.statDot, { backgroundColor: STAT_TONE[s.tone] }]} />
              </View>
              <Text style={styles.statValue} {...shrinkToFit(0.75)}>
                {s.value}
              </Text>
              <View style={[styles.statRule, { backgroundColor: STAT_TONE[s.tone] }]} />
            </View>
          ))}
        </View>
        )}

        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder={c.searchPlaceholder}
            placeholderTextColor={colors.textBody}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {ADV_CASES_FILTERS.map((f) => (
            <Pressable
              key={f}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
              onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && styles.chipOn]}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextOn]} numberOfLines={1}>
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.svcRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {ADV_CASES_SERVICES.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityState={{ selected: service === s }}
              onPress={() => setService(s)}
              style={[styles.svcChip, service === s && styles.svcChipOn]}
            >
              <Text
                style={[styles.svcChipText, service === s && styles.chipTextOn]}
                numberOfLines={1}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {showListTitle && (
        <View style={styles.ymRow}>
          <Text style={styles.ymTitle} {...shrinkToFit(0.75)}>
            {c.listTitle}
          </Text>
          <View style={styles.ymChip}>
            <Text style={styles.ymChipText} {...shrinkToFit(0.8)}>
              {c.listChip}
            </Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.sort}>
            <Text style={styles.sortText} {...shrinkToFit(0.8)}>
              {c.sort}
            </Text>
            <ChevronDown size={t.sortIcon} color={colors.textPrimary} style={styles.sortIcon} />
          </Pressable>
        </View>
        )}

        {matters.map((m) => {
          const tone = STATUS_TONE[m.status];
          const Icon = m.bodyIcon ? BODY_ICONS[m.bodyIcon] : null;
          const urgent = m.urgency === 'URGENT';
          return (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.svc}>
                  <Text style={styles.svcText} {...shrinkToFit(0.7)}>
                    {m.service}
                  </Text>
                </View>
                <View style={[styles.urg, urgent ? styles.urgent : styles.ordinary]}>
                  {urgent && <View style={styles.urgDot} />}
                  <Text
                    style={[styles.urgText, urgent ? styles.urgentText : styles.ordinaryText]}
                    {...shrinkToFit(0.8)}
                  >
                    {m.urgency}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle} {...shrinkToFit(0.7)}>
                {m.title}
              </Text>
              <View style={styles.refRow}>
                {m.place ? (
                  <>
                    <Text style={styles.ref} {...shrinkToFit(0.7)}>
                      {m.place}
                    </Text>
                    <Text style={styles.refDot}>·</Text>
                    <Text style={styles.refMono} {...shrinkToFit(0.7)}>
                      {m.ref}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.refMono} {...shrinkToFit(0.7)}>
                      {m.ref}
                    </Text>
                    {m.fee && (
                      <>
                        <Text style={styles.refDot}>·</Text>
                        <Text style={styles.fee} {...shrinkToFit(0.7)}>
                          {m.fee}
                        </Text>
                      </>
                    )}
                  </>
                )}
              </View>

              <View style={styles.rule} />

              <View style={[styles.status, { backgroundColor: tone.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: tone.fg }]} />
                <Text style={[styles.statusText, { color: tone.fg }]} {...shrinkToFit(0.75)}>
                  {m.status}
                </Text>
              </View>

              <View style={styles.bodyRow}>
                {Icon && <Icon size={t.bodyIcon} color={colors.brandDark} style={styles.bodyIcon} />}
                <Text style={styles.body}>{m.body}</Text>
              </View>

              <View style={styles.rule} />

              <View style={styles.foot}>
                <Text style={styles.footText} {...shrinkToFit(0.7)}>
                  {m.footer}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => review(m)}
                  style={({ pressed }) => [styles.review, pressed && styles.pressed]}
                >
                  <Text style={styles.reviewText} {...shrinkToFit(0.8)}>
                    {ADV_CASES_ACTIONS[m.serviceKey] ?? c.review}
                  </Text>
                  {/* design/214 draws an arrow on "Continue Draft"; design/204 draws none. */}
                  {ADV_CASES_ACTIONS[m.serviceKey] && (
                    <ArrowRight size={t.reviewArrow} color={ink.onBrand} style={styles.reviewArrow} />
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    width: t.mark,
    height: t.mark,
    borderRadius: t.markRadius,
    backgroundColor: t.markBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCol: { flex: 1, minWidth: 0, marginLeft: t.markGap, marginRight: 10 },
  headerEyebrow: { marginTop: t.eyebrowGap, fontFamily: font.appBody, fontSize: t.eyebrowSize, color: t.eyebrowColour },
  portalFilter: { marginRight: t.portalFilterGap },
  portalSub: { marginTop: t.titleGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  extraSearch: { marginTop: t.extraSearchGap },
  headerTitle: {
    marginLeft: t.markGap,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.headerTitleSize,
    color: colors.textPrimary,
  },
  avatar: {
    marginLeft: t.avatarGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 110 },
  titleRow: { marginTop: t.titleGap, flexDirection: 'row', alignItems: 'flex-start' },
  titleCol: { flex: 1, minWidth: 0, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: colors.textBody,
  },
  filterBtn: {
    width: t.filterBtn,
    height: t.filterBtn,
    borderRadius: t.filterBtnRadius,
    backgroundColor: t.filterBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    right: -6,
    top: -6,
    minWidth: t.filterBadge,
    height: t.filterBadge,
    borderRadius: t.filterBadge / 2,
    paddingHorizontal: 5,
    backgroundColor: t.filterBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { fontFamily: font.appSemi, fontSize: t.filterBadgeSize, color: ink.onBrand },

  stats: { marginTop: t.statGap, flexDirection: 'row', gap: t.statGapX },
  stat: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.statRadius,
    backgroundColor: t.statBg,
    padding: t.statPad,
    alignItems: 'center',
  },
  statHead: { flexDirection: 'row', alignItems: 'center' },
  statLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.statLabelSize,
    letterSpacing: t.statLabelSpacing,
    color: colors.textBody,
  },
  statDot: { marginLeft: 8, width: t.statDot, height: t.statDot, borderRadius: t.statDot / 2 },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statRule: { marginTop: t.statRuleGap, width: t.statRuleW, height: t.statRuleH, borderRadius: 2 },

  search: {
    marginTop: t.searchGap,
    minHeight: t.searchHeight,
    borderRadius: t.searchRadius,
    paddingHorizontal: t.searchPadX,
    backgroundColor: t.searchBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    marginLeft: t.searchIconGap,
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    fontFamily: font.appBody,
    fontSize: t.searchSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },

  chipRow: { marginTop: t.chipRowGap, flexGrow: 0, height: t.chipHeight, overflow: 'hidden' },
  svcRow: { marginTop: t.chipRowGap, flexGrow: 0, height: t.svcChipHeight, overflow: 'hidden' },
  chipRowContent: { gap: t.chipGapX },
  chip: {
    height: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOnBg },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },
  chipTextOn: { color: t.chipOnColour },
  svcChip: {
    height: t.svcChipHeight,
    borderRadius: t.svcChipRadius,
    paddingHorizontal: t.svcChipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svcChipOn: { backgroundColor: t.svcChipOnBg },
  svcChipText: { fontFamily: font.appBody, fontSize: t.svcChipSize, color: colors.textPrimary },

  ymRow: { marginTop: t.ymGap, flexDirection: 'row', alignItems: 'center' },
  ymTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.ymTitleSize, color: colors.textPrimary },
  ymChip: {
    marginLeft: t.ymChipGap,
    minHeight: t.ymChipHeight,
    borderRadius: t.ymChipRadius,
    paddingHorizontal: t.ymChipPadX,
    backgroundColor: t.ymChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ymChipText: { fontFamily: font.appBody, fontSize: t.ymChipSize, color: colors.textBody },
  sort: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center' },
  sortText: { fontFamily: font.appBody, fontSize: t.sortSize, color: colors.textPrimary },
  sortIcon: { marginLeft: t.sortIconGap },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  svc: {
    minHeight: t.svcHeight,
    borderRadius: t.svcRadius,
    paddingHorizontal: t.svcPadX,
    backgroundColor: t.svcBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  svcText: {
    fontFamily: font.appSemi,
    fontSize: t.svcSize,
    letterSpacing: t.svcSpacing,
    color: t.svcColour,
  },
  urg: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.urgHeight,
    borderRadius: t.urgRadius,
    paddingHorizontal: t.urgPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgent: { backgroundColor: t.urgentBg },
  ordinary: { backgroundColor: t.ordinaryBg },
  urgDot: {
    width: t.urgDot,
    height: t.urgDot,
    borderRadius: t.urgDot / 2,
    marginRight: t.urgDotGap,
    backgroundColor: t.urgentColour,
  },
  urgText: { fontFamily: font.appSemi, fontSize: t.urgSize, letterSpacing: t.urgSpacing },
  urgentText: { color: t.urgentColour },
  ordinaryText: { color: t.ordinaryColour },

  cardTitle: {
    marginTop: t.cardTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  refRow: { marginTop: t.refGap, flexDirection: 'row', alignItems: 'center' },
  ref: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.refSize, color: colors.textBody },
  refMono: { flexShrink: 1, fontFamily: font.mono, fontSize: t.refMonoSize, color: colors.textBody },
  refDot: { marginHorizontal: t.refDotGap, fontFamily: font.appBody, fontSize: t.refSize, color: colors.textBody },
  fee: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.refSize, color: colors.textPrimary },

  rule: { marginVertical: t.ruleGap, height: 1, backgroundColor: t.rule },

  status: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
  },
  statusText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.statusSize },

  bodyRow: { marginTop: t.bodyGap, flexDirection: 'row', alignItems: 'center' },
  bodyIcon: { marginRight: t.bodyIconGap },
  body: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },

  foot: { flexDirection: 'row', alignItems: 'center' },
  footText: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  reviewArrow: { marginLeft: t.reviewArrowGap },
  review: {
    minHeight: t.reviewHeight,
    borderRadius: t.reviewRadius,
    paddingHorizontal: t.reviewPadX,
    backgroundColor: t.reviewBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  reviewText: { fontFamily: font.appHeading, fontSize: t.reviewSize, color: ink.onBrand, flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
