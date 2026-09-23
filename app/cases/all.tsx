import { router } from 'expo-router';
import { ChevronLeft, Funnel, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CaseListCard from '../../components/CaseListCard';
import { allCases as a, colors, font, ink, space } from '../../constants/theme';
import { activeCases, type CaseCategory } from '../../data/cases';

type FilterKey = 'all' | CaseCategory;

// The design shows All, Civil, Criminal, Family, Property. Civil and Criminal match no
// mock case, so they filter to an empty list until the catalogue grows.
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'civil', label: 'Civil' },
  { key: 'criminal', label: 'Criminal' },
  { key: 'family', label: 'Family' },
  { key: 'property', label: 'Property' },
];

export default function AllActiveCasesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const cases = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeCases().filter((c) => {
      const byCategory = filter === 'all' || c.category === filter;
      const byQuery = !q || c.title.toLowerCase().includes(q);
      return byCategory && byQuery;
    });
  }, [filter, query]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/cases');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + a.top }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.circleButton}>
          <ChevronLeft size={a.headerIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Active Cases</Text>
        {/* Filter button has no panel yet. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={styles.circleButton}>
          <Funnel size={a.headerIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: a.cardGap + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.search}>
          <Search size={a.searchIcon} color={colors.textBody} />
          <TextInput
            placeholder="Search cases"
            placeholderTextColor={colors.textBody}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            accessibilityLabel="Search cases"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                role="tab"
                aria-selected={active}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.heading}>
          <Text style={styles.headingText}>Active Cases</Text>
          <View style={styles.spacer} />
          <View style={styles.count}>
            <Text style={styles.countText}>
              {cases.length} {cases.length === 1 ? 'case' : 'cases'}
            </Text>
          </View>
        </View>

        {cases.map((item, i) => (
          <View key={item.id} style={i === 0 ? undefined : styles.cardSpacing}>
            <CaseListCard item={item} onPress={() => router.push(`/cases/${item.id}`)} />
          </View>
        ))}

        {cases.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No matching cases</Text>
            <Text style={styles.emptyText}>Try a different filter or search term.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    paddingHorizontal: space.screenX - 1.5,
    paddingBottom: a.searchGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: a.headerButton,
    height: a.headerButton,
    borderRadius: a.headerButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: a.titleSize,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: space.screenX,
  },
  search: {
    height: a.searchHeight,
    borderRadius: a.searchRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: a.searchPadX,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: a.searchTextGap,
    fontFamily: font.appBody,
    fontSize: a.searchTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  chipScroll: {
    marginTop: a.chipGap,
    marginHorizontal: -space.screenX,
  },
  chipRow: {
    paddingHorizontal: space.screenX,
    gap: a.chipGapX,
  },
  chip: {
    height: a.chipHeight,
    borderRadius: a.chipHeight / 2,
    paddingHorizontal: a.chipPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipText: {
    fontFamily: font.appBody,
    fontSize: a.chipText,
    color: colors.textBody,
  },
  chipTextActive: {
    fontFamily: font.appSemi,
    color: ink.onBrand,
  },
  heading: {
    marginTop: a.headingGap,
    marginBottom: a.cardsGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingText: {
    fontFamily: font.appHeading,
    fontSize: a.headingSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  count: {
    height: a.countHeight,
    borderRadius: a.countHeight / 2,
    paddingHorizontal: a.countPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: font.appBody,
    fontSize: a.countText,
    color: colors.textBody,
  },
  cardSpacing: {
    marginTop: a.cardGap,
  },
  empty: {
    marginTop: a.cardGap,
    alignItems: 'center',
    paddingVertical: a.cardsGap,
  },
  emptyTitle: {
    fontFamily: font.appSemi,
    fontSize: a.cardTitleSize,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: a.courtSize,
    color: colors.textBody,
    textAlign: 'center',
  },
});
