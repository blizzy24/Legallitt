import { router, type Href } from 'expo-router';
import { ChevronLeft, Plus, Scale, Search, ShieldCheck, Upload } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DocumentCard from '../../components/DocumentCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, documents as t, font, ink, profile as p } from '../../constants/theme';
import { CASE_DOC_FILTERS, CASE_MATTER, caseDocuments, type CaseDocFilter } from '../../data/documents';

// Case Documents (design/52).
//
// Shares components/DocumentCard with design/56's My Documents; the chip, footer and
// trailing control come from the 'case' variant and each document's caseView block.
// See the note at the top of data/documents.ts for how the two files were reconciled.
//
// design/52 bakes its count into the first chip's label ("All (3)") where design/56
// uses a separate count badge. Rendered as each file draws it.

export default function CaseDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<CaseDocFilter>('all');
  const [query, setQuery] = useState('');

  const all = caseDocuments();
  const shown = all.filter(
    (d) =>
      (filter === 'all' || d.caseView?.filter === filter) &&
      (query === '' || d.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/cases'))}
          style={styles.circle}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Case Documents
          </Text>
          <Text style={styles.subtitle} {...shrinkToFit(0.8)}>
            {CASE_MATTER.caseId}
          </Text>
        </View>
        {/* Upload is inert — no upload flow is designed. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Upload" style={styles.circle}>
          <Upload size={t.uploadIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.matter}>
          <View style={styles.matterIcon}>
            <Scale size={t.matterIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.matterText}>
            <Text style={styles.matterLabel} {...shrinkToFit(0.8)}>
              {CASE_MATTER.label}
            </Text>
            {/* design/52 clips this to "Rahul Sharma vs. Amit Ver"; shown in full. */}
            <Text style={styles.matterTitle} {...shrinkToFit(0.7)}>
              {CASE_MATTER.title}
            </Text>
          </View>
          <View style={styles.matterChip}>
            <Text style={styles.matterChipText} {...shrinkToFit(0.8)}>
              {CASE_MATTER.chip}
            </Text>
          </View>
        </View>

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
          {CASE_DOC_FILTERS.map((f) => {
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
                  {f.key === 'all' ? `All (${all.length})` : f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
            Documents
          </Text>
          <Text style={styles.sectionCount} {...shrinkToFit(0.8)}>
            {shown.length} files available
          </Text>
        </View>

        {shown.map((doc) => (
          <DocumentCard
            key={doc.id}
            item={doc}
            variant="case"
            onView={() => router.push(`/documents/${doc.id}` as Href)}
          />
        ))}

        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle} {...shrinkToFit(0.8)}>
            Upload Document
          </Text>
          <Text style={styles.uploadBody}>
            Attach evidence, affidavits, petitions, or notices for advocate review.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.dash, pressed && styles.pressed]}
          >
            <View style={styles.dashIcon}>
              <Plus size={t.dashIconGlyph} color={ink.accent} />
            </View>
            <Text style={styles.dashLabel} {...shrinkToFit(0.8)}>
              Upload New Document
            </Text>
          </Pressable>
        </View>

        <View style={styles.store}>
          <ShieldCheck size={t.storeIcon} color={ink.accent} />
          <Text style={styles.storeText} {...shrinkToFit(0.8)}>
            Your case documents are securely stored.
          </Text>
        </View>
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
    marginHorizontal: 10,
    alignItems: 'center',
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
    color: ink.accent,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  matter: {
    marginTop: t.matterGap,
    borderRadius: t.matterRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.matterPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  matterIcon: {
    width: t.matterIcon,
    height: t.matterIcon,
    borderRadius: t.matterIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.matterIconGap,
  },
  matterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.matterLabelSize,
    letterSpacing: t.matterLabelSpacing,
    color: ink.accent,
  },
  matterTitle: {
    marginTop: t.matterTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.matterTitleSize,
    color: colors.textPrimary,
  },
  matterChip: {
    marginLeft: 8,
    minHeight: t.matterChipHeight,
    borderRadius: t.matterChipRadius,
    paddingHorizontal: t.matterChipPadX,
    backgroundColor: t.matterChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  matterChipText: {
    fontFamily: font.appSemi,
    fontSize: t.matterChipSize,
    color: t.matterChipText,
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
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOn: {
    backgroundColor: t.filterOnBg,
  },
  filterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.filterSize,
    color: colors.textPrimary,
  },
  filterLabelOn: {
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
  sectionCount: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.sizeSize,
    color: colors.textBody,
  },
  uploadCard: {
    marginTop: t.uploadCardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.uploadCardPad,
  },
  uploadTitle: {
    fontFamily: font.appHeading,
    fontSize: t.uploadCardTitleSize,
    color: colors.textPrimary,
  },
  uploadBody: {
    marginTop: t.uploadCardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.uploadCardBodySize,
    lineHeight: t.uploadCardBodyLineHeight,
    color: colors.textBody,
  },
  dash: {
    marginTop: t.dashGap,
    minHeight: t.dashHeight,
    borderRadius: t.dashRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.dashBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  dashIcon: {
    width: t.dashIcon,
    height: t.dashIcon,
    borderRadius: t.dashIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLabel: {
    marginLeft: t.dashIconGap,
    fontFamily: font.appSemi,
    fontSize: t.dashSize,
    color: t.dashColour,
  },
  store: {
    marginTop: t.storeGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeText: {
    marginLeft: t.storeIconGap,
    fontFamily: font.appBody,
    fontSize: t.storeSize,
    color: colors.textBody,
  },
});
