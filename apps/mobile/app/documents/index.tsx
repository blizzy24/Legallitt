import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import { ChevronLeft, Plus, Search, ShieldCheck, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DocumentCard from '../../components/DocumentCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, documents as t, font, ink, profile as p } from '../../constants/theme';
import { DOCUMENTS, DOC_FILTERS, type DocFilter } from '../../data/documents';

// My Documents (design/56).
//
// The card comes from components/DocumentCard — the same component design/52 uses,
// with the chip and footer wording taken from each document's per-screen block. See
// the note at the top of data/documents.ts.

function FixtureDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<DocFilter>('all');
  const [query, setQuery] = useState('');

  const shown = DOCUMENTS.filter(
    (d) =>
      (filter === 'all' || d.filter === filter) &&
      (query === '' || d.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={styles.circle}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            My Documents
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Verified Vault &amp; Case Records
          </Text>
        </View>
        {/* Upload is inert — no upload flow is designed. */}
        <Pressable onPress={() => previewNotice("Upload")} accessibilityRole="button" accessibilityLabel="Upload" style={styles.circle}>
          <Upload size={t.uploadIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textMuted} />
          <TextInput
            placeholder="Search documents"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}
        >
          {DOC_FILTERS.map((f) => {
            const on = f.key === filter;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(f.key)}
                style={[styles.filter, on && styles.filterOn]}
              >
                <Text style={[styles.filterLabel, on && styles.filterLabelOn]} {...shrinkToFit(0.8)}>
                  {f.label}
                </Text>
                {f.key === 'all' && (
                  <View style={[styles.count, on && styles.countOn]}>
                    <Text style={[styles.countText, on && styles.countTextOn]}>
                      {DOCUMENTS.length}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
            Recent Documents
          </Text>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText} {...shrinkToFit(0.8)}>
              {shown.length} Files
            </Text>
          </View>
        </View>

        {shown.map((d) => (
          <DocumentCard
            key={d.id}
            item={d}
            onView={() => router.push(`/documents/${d.id}` as Href)}
          />
        ))}

        <View style={styles.privacy}>
          <ShieldCheck size={t.privacyIcon} color={ink.accent} />
          <Text style={styles.privacyText}>
            Documents uploaded are encrypted and restricted to assigned counsel under Indian
            Evidence Act confidentiality norms.
          </Text>
        </View>

        <Pressable onPress={() => previewNotice("Upload Document")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.upload, pressed && styles.pressed]}
        >
          <Plus size={t.uploadGlyph} color={ink.onBrand} />
          <Text style={styles.uploadLabel}>Upload Document</Text>
        </Pressable>
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
    minHeight: t.headerHeight,
    paddingHorizontal: p.padX,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  search: {
    marginTop: t.searchGap,
    minHeight: t.searchHeight,
    borderRadius: t.searchRadius,
    paddingHorizontal: t.searchPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.searchBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.searchIconGap,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.searchSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  filtersScroll: {
    marginTop: t.filterGap,
    marginHorizontal: -p.padX,
  },
  filters: {
    paddingHorizontal: p.padX,
    gap: t.filterColGap,
  },
  filter: {
    minHeight: t.filterHeight,
    borderRadius: t.filterRadius,
    paddingHorizontal: t.filterPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.filterBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterOn: {
    backgroundColor: t.filterOnBg,
    borderColor: t.filterOnBg,
  },
  filterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.filterSize,
    color: colors.textPrimary,
  },
  filterLabelOn: {
    color: ink.onBrand,
  },
  count: {
    marginLeft: t.countGap,
    minWidth: t.countHeight,
    minHeight: t.countHeight,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countOn: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  countText: {
    fontFamily: font.appSemi,
    fontSize: t.countSize,
    color: colors.textBody,
  },
  countTextOn: {
    color: ink.onBrand,
  },
  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  sectionChip: {
    marginLeft: 10,
    minHeight: t.sectionChipHeight,
    borderRadius: t.sectionChipRadius,
    paddingHorizontal: t.sectionChipPadX,
    backgroundColor: t.sectionChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChipText: {
    fontFamily: font.appSemi,
    fontSize: t.sectionChipSize,
    color: colors.brandDark,
  },
  privacy: {
    marginTop: t.privacyGap,
    borderRadius: t.privacyRadius,
    backgroundColor: t.privacyBg,
    padding: t.privacyPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.privacyIconGap,
    fontFamily: font.appBody,
    fontSize: t.privacySize,
    lineHeight: t.privacyLineHeight,
    color: colors.textBody,
  },
  upload: {
    marginTop: t.uploadGap,
    minHeight: t.uploadHeight,
    borderRadius: t.uploadRadius,
    backgroundColor: colors.brandDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  uploadLabel: {
    marginLeft: t.uploadGlyphGap,
    fontFamily: font.appSemi,
    fontSize: t.uploadSize,
    color: ink.onBrand,
  },
});

import {DocumentsLive} from '../../features/account/Documents';
import {DATA_SOURCE as LIVE_SOURCE} from '../../lib/data-source';
// D-17 My Documents (profile-7): API mode shows the signed-in client's real files.
export default function DocumentsScreen() { return LIVE_SOURCE === 'api' ? <DocumentsLive/> : <FixtureDocumentsScreen/>; }
