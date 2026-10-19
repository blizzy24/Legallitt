import { previewNotice } from '../../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Scale,
  Search,
  SlidersHorizontal,
  UserRound,
  UserRoundPlus,
  UserRoundSearch,
  UserRoundX,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { ADV_SEARCH_DEFAULT_QUERY, ADV_SEARCH_RESULTS } from '../../../data/advocateSide';
import { advClientsAlt as t, colors, font, ink } from '../../../constants/theme';

// Advocate client search (design/159).
//
// REPORTED — THE DESIGN SHIPS ITS OWN PREVIEW CONTROL. The "Empty State View" toggle
// beside "Results Found (3)" is drawn into the screen, not into a dev tool: it
// switches the list to its no-results state. That is a design-time affordance that
// would ship to advocates, who have no reason to toggle their own search into an
// empty state. Wired as drawn, but it is almost certainly meant to be a prototype
// control — the equivalent of our DEV_PREVIEW_TOGGLES, drawn into the product.
//
// Search filters live against the three mock records.

const FILTERS = ['All (3)', 'Active Matters (2)', 'Previous Clients (1)'];

export default function AdvocateClientSearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(ADV_SEARCH_DEFAULT_QUERY);
  const [filter, setFilter] = useState(0);
  const [forceEmpty, setForceEmpty] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADV_SEARCH_RESULTS.filter((r) => {
      if (filter === 1 && r.statusKind !== 'active') return false;
      if (filter === 2 && r.statusKind !== 'previous') return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q);
    });
  }, [query, filter]);

  const shown = forceEmpty ? [] : results;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(advocate)/clients')
          }
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Search Clients
        </Text>
        <Pressable onPress={() => previewNotice("Filter")} accessibilityRole="button" accessibilityLabel="Filter" style={styles.iconBtn}>
          <SlidersHorizontal size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.iconBtnGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.brandDark} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search clients"
            placeholderTextColor={colors.textMuted}
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setQuery('')}
              style={styles.clear}
            >
              <X size={16} color={colors.textBody} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f, i) => {
            const on = i === filter;
            return (
              <Pressable
                key={f}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(i)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.toggle}>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: !forceEmpty }}
            onPress={() => setForceEmpty(false)}
            style={[styles.toggleItem, !forceEmpty && styles.toggleItemOn]}
          >
            <UserRoundSearch size={15} color={colors.textPrimary} />
            <Text style={styles.toggleText} {...shrinkToFit(0.75)}>
              Results Found ({results.length})
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: forceEmpty }}
            onPress={() => setForceEmpty(true)}
            style={[styles.toggleItem, forceEmpty && styles.toggleItemOn]}
          >
            <UserRoundX size={15} color={colors.textPrimary} />
            <Text style={styles.toggleText} {...shrinkToFit(0.75)}>
              Empty State View
            </Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta} {...shrinkToFit(0.7)}>
            RESULTS FOR &ldquo;{query.toUpperCase()}&rdquo; • {shown.length} MATCHES
          </Text>
          <View style={styles.ledger}>
            <View style={styles.ledgerDot} />
            <Text style={styles.ledgerText} {...shrinkToFit(0.75)}>
              Encrypted Ledger
            </Text>
          </View>
        </View>

        {shown.map((r) => (
          <Pressable
            key={r.id}
            accessibilityRole="button"
            onPress={() => router.push('/advocate/clients/rahul-sharma')}
            style={styles.result}
          >
            <View style={styles.rAvatarWrap}>
              <View style={styles.rAvatar}>
                <Text style={styles.rAvatarText}>{r.initials}</Text>
              </View>
              {r.online && <View style={styles.rDot} />}
            </View>

            <View style={styles.rText}>
              <View style={styles.rNameRow}>
                <Text style={styles.rName} {...shrinkToFit(0.75)}>
                  {r.name}
                </Text>
                {r.statusKind === 'active' && (
                  <BadgeCheck size={t.rTick} color={colors.brandDark} style={styles.rTickIcon} />
                )}
              </View>
              <Text style={styles.rRef} {...shrinkToFit(0.75)}>
                {r.ref} • {r.activity}
              </Text>
              <View style={[styles.rStatus, r.statusKind === 'previous' && styles.rStatusPrev]}>
                <Text style={styles.rStatusText} {...shrinkToFit(0.75)}>
                  {r.status}
                </Text>
              </View>
              {r.matters.map((m) => (
                <View key={m} style={styles.rTag}>
                  <Landmark size={14} color={colors.brandDark} />
                  <Text style={styles.rTagText} {...shrinkToFit(0.7)}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>

            <ChevronRight size={t.rChevron} color={colors.textMuted} />
          </Pressable>
        ))}

        {shown.length === 0 && (
          <View style={styles.noResults}>
            <Scale size={34} color={colors.brand} />
            <Text style={styles.noResultsTitle} {...shrinkToFit(0.8)}>
              No matching clients
            </Text>
            <Text style={styles.noResultsBody}>
              No client in your ledger matches this search.
            </Text>
          </View>
        )}

        <View style={styles.help}>
          <View style={styles.helpHead}>
            <UserRoundPlus size={19} color={colors.brandDark} />
            <Text style={styles.helpTitle} {...shrinkToFit(0.8)}>
              Can&rsquo;t find your client?
            </Text>
          </View>
          <Text style={styles.helpBody}>
            Add a new individual client or corporate entity directly to initiate privileged docket
            assignments.
          </Text>
          <Pressable onPress={() => previewNotice("+ Invite Client or Add Docket")}
            accessibilityRole="button"
            style={({ pressed }) => [styles.helpBtn, pressed && styles.pressed]}
          >
            <Text style={styles.helpBtnText} {...shrinkToFit(0.8)}>
              + Invite Client or Add Docket
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: 14,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: 20,
    color: colors.textPrimary,
  },
  iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    marginLeft: t.iconBtnGap,
    width: t.iconBtn,
    height: t.iconBtn,
    borderRadius: t.iconBtn / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  search: {
    marginTop: t.searchGap,
    minHeight: t.searchHeight,
    borderRadius: t.searchRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.searchPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    marginLeft: t.searchIconGap,
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.searchSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  clear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECE9E3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipsRow: { marginTop: t.chipsGap, height: t.chipHeight, flexGrow: 0 },
  chips: { gap: t.chipGapX, paddingRight: 4, alignItems: 'center' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOnBg, borderColor: t.chipOnBg },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },
  chipTextOn: { fontFamily: font.appSemi, color: ink.onBrand },

  toggle: {
    marginTop: t.resultsGap,
    borderRadius: 14,
    backgroundColor: t.toggleBg,
    padding: 4,
    flexDirection: 'row',
  },
  toggleItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  toggleItemOn: { backgroundColor: colors.card },
  toggleText: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: 13.5,
    color: colors.textPrimary,
  },

  metaRow: { marginTop: t.metaGap, flexDirection: 'row', alignItems: 'center' },
  meta: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.metaSize,
    letterSpacing: t.metaSpacing,
    color: t.metaColour,
  },
  ledger: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  ledgerDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 6, backgroundColor: colors.brandDark },
  ledgerText: { flexShrink: 1, fontFamily: font.appBody, fontSize: 12.5, color: colors.brandDark },

  result: {
    marginTop: t.resultGap,
    borderRadius: t.resultRadius,
    backgroundColor: colors.card,
    padding: t.resultPad,
    flexDirection: 'row',
  },
  rAvatarWrap: { width: t.rAvatar, height: t.rAvatar },
  rAvatar: {
    width: t.rAvatar,
    height: t.rAvatar,
    borderRadius: t.rAvatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rAvatarText: { fontFamily: font.appSemi, fontSize: t.rAvatarText, color: colors.brandDark },
  rDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#5A4A37',
  },
  rText: { flex: 1, minWidth: 0, marginLeft: t.rAvatarGap, marginRight: 8 },
  rNameRow: { flexDirection: 'row', alignItems: 'center' },
  rName: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rNameSize, color: colors.textPrimary },
  rTickIcon: { marginLeft: t.rTickGap },
  rRef: {
    marginTop: t.rRefGap,
    fontFamily: font.appBody,
    fontSize: t.rRefSize,
    color: colors.textBody,
  },
  rStatus: {
    marginTop: t.rTagsGap,
    alignSelf: 'flex-start',
    minHeight: t.rStatusHeight,
    borderRadius: t.rStatusRadius,
    paddingHorizontal: t.rStatusPadX,
    backgroundColor: '#F7DFC2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rStatusPrev: { backgroundColor: '#ECE9E3' },
  rStatusText: { fontFamily: font.appBody, fontSize: t.rStatusSize, color: '#6B4F2A' },
  rTag: {
    marginTop: 8,
    minHeight: t.rTagHeight,
    borderRadius: t.rTagRadius,
    paddingHorizontal: t.rTagPadX,
    backgroundColor: t.rTagBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rTagText: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.rTagSize,
    color: colors.textPrimary,
  },

  noResults: {
    marginTop: t.resultGap,
    borderRadius: t.resultRadius,
    backgroundColor: colors.card,
    padding: 28,
    alignItems: 'center',
  },
  noResultsTitle: {
    marginTop: 14,
    fontFamily: font.appHeading,
    fontSize: 17,
    color: colors.textPrimary,
  },
  noResultsBody: {
    marginTop: 7,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: 13,
    color: colors.textBody,
  },

  help: {
    marginTop: t.helpGap,
    borderRadius: t.helpRadius,
    backgroundColor: '#F4F1EC',
    padding: t.helpPad,
  },
  helpHead: { flexDirection: 'row', alignItems: 'center' },
  helpTitle: {
    marginLeft: 10,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.helpTitleSize,
    color: colors.textPrimary,
  },
  helpBody: {
    marginTop: t.helpBodyGap,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: colors.textBody,
  },
  helpBtn: {
    marginTop: t.helpBtnGap,
    minHeight: t.helpBtnHeight,
    borderRadius: t.helpBtnRadius,
    backgroundColor: '#5A4A37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  helpBtnText: { fontFamily: font.appSemi, fontSize: t.helpBtnSize, color: ink.onBrand },
});
