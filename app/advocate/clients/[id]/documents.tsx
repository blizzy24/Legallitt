import DemoPressable from '../../../../components/DemoPressable';
import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  CircleCheck,
  Contact,
  FileText,
  Gavel,
  MailPlus,
  ScrollText,
  Search,
  Share2,
  Upload,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import {
  ADV_CLIENT_DOCUMENTS,
  ADV_CLIENT_PROFILE,
  ADV_DOC_STATS,
  type AdvDocument,
} from '../../../../data/advocateSide';
import { advClientSub as t, colors, font, ink } from '../../../../constants/theme';

// Client documents (design/154).
//
// REPORTED — THE DOCUMENT COUNT CONTRADICTS THE PROFILE. design/152's profile card
// says "12 Documents"; this screen says "TOTAL FILES 4 Docs" and lists four. Four is
// what design/154 draws, so four is built here, and the profile keeps its drawn 12.
// One of the two is wrong.
//
// Upload Document and Request New Document are inert — no upload flow is designed
// anywhere in the project, on either side of the app.

const ICONS: Record<AdvDocument['kind'], typeof FileText> = {
  pdf: FileText,
  agreement: ScrollText,
  identity: Contact,
  order: Gavel,
};

const FILTERS = [
  { label: 'All (4)', key: 'all' },
  { label: 'Case (3)', key: 'case' },
  { label: 'Identity (1)', key: 'identity' },
  { label: 'Other (0)', key: 'other' },
];

export default function AdvocateClientDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');
  const c = ADV_CLIENT_PROFILE;

  const docs = useMemo(() => {
    const key = FILTERS[filter].key;
    const q = query.trim().toLowerCase();
    return ADV_CLIENT_DOCUMENTS.filter((d) => {
      if (key !== 'all' && d.category !== key) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.caseRef.toLowerCase().includes(q);
    });
  }, [filter, query]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(advocate)/clients'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Client Documents
          </Text>
          <Text style={styles.headerSub} {...shrinkToFit(0.75)}>
            {c.name} • {c.clientId}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Upload" style={styles.iconBtn}>
          <Upload size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.strip}>
          <View style={styles.stripRow}>
            <View style={styles.stripAvatar}>
              <Text style={styles.stripAvatarText}>{c.initials}</Text>
            </View>
            <View style={styles.stripText}>
              <View style={styles.stripNameRow}>
                <Text style={styles.stripName} {...shrinkToFit(0.75)}>
                  {c.name}
                </Text>
                <View style={styles.activeChip}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText} {...shrinkToFit(0.8)}>
                    Active
                  </Text>
                </View>
              </View>
              <Text style={styles.stripType} {...shrinkToFit(0.7)}>
                Client Ref: {c.clientId} • Individual Petitioner
              </Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={8}>
              <Share2 size={16} color={colors.textBody} />
            </Pressable>
          </View>

          <View style={styles.cells}>
            {ADV_DOC_STATS.map((s) => (
              <View key={s.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
                  {s.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                  {s.value}
                </Text>
                <Text style={styles.cellSub} {...shrinkToFit(0.7)}>
                  {s.sub}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents by title, case, tag..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.chips}>
          {FILTERS.map((f, i) => {
            const on = i === filter;
            return (
              <Pressable
                key={f.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(i)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {docs.map((d) => {
          const Icon = ICONS[d.kind];
          return (
            <View key={d.id} style={styles.card}>
              <View style={styles.docHead}>
                <View style={styles.docIcon}>
                  <Icon size={20} color={colors.brandDark} />
                </View>
                <View style={styles.docText}>
                  <Text style={styles.docName} {...shrinkToFit(0.75)}>
                    {d.name}
                  </Text>
                  <Text style={styles.docMeta} {...shrinkToFit(0.7)}>
                    {d.meta}
                  </Text>
                </View>
                <Pressable accessibilityRole="button" style={styles.docView}>
                  <Text style={styles.docViewText} {...shrinkToFit(0.8)}>
                    View
                  </Text>
                  <ArrowRight size={14} color={colors.textPrimary} style={styles.docViewIcon} />
                </Pressable>
              </View>

              <View style={styles.docTags}>
                <View style={styles.pagesTag}>
                  <Text style={styles.pagesText} {...shrinkToFit(0.75)}>
                    {d.pages}
                  </Text>
                </View>
                <View style={styles.refTag}>
                  <Text style={styles.refTagText} {...shrinkToFit(0.7)}>
                    {d.caseRef}
                  </Text>
                </View>
                <Text style={styles.uploaded} {...shrinkToFit(0.75)}>
                  {d.uploaded}
                </Text>
              </View>

              {d.status && (
                <View style={styles.statusTag}>
                  <CircleCheck size={13} color="#1E9E4A" />
                  <Text style={styles.statusTagText} {...shrinkToFit(0.8)}>
                    {d.status}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <DemoPressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Upload size={t.actionIcon} color={ink.onBrand} />
          <Text style={styles.primaryText}>Upload Document</Text>
        </DemoPressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <MailPlus size={t.actionIcon} color={colors.textPrimary} />
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            Request New Document from Client
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.titleGap, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  headerSub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  iconBtn: { width: t.iconBtn, height: t.iconBtn, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    marginLeft: t.iconBtnGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  strip: {
    marginTop: t.stripGap,
    borderRadius: t.stripRadius,
    backgroundColor: colors.card,
    padding: t.stripPad,
  },
  stripRow: { flexDirection: 'row', alignItems: 'center' },
  stripAvatar: {
    width: t.stripAvatar,
    height: t.stripAvatar,
    borderRadius: t.stripAvatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripAvatarText: { fontFamily: font.appSemi, fontSize: t.stripAvatarText, color: colors.brandDark },
  stripText: { flex: 1, minWidth: 0, marginLeft: t.stripAvatarGap, marginRight: 8 },
  stripNameRow: { flexDirection: 'row', alignItems: 'center' },
  stripName: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.stripNameSize, color: colors.textPrimary },
  activeChip: {
    marginLeft: 8,
    minHeight: 20,
    borderRadius: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F1EEE8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5, backgroundColor: colors.brandDark },
  activeText: { fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },
  stripType: { marginTop: t.stripTypeGap, fontFamily: font.appBody, fontSize: t.stripTypeSize, color: colors.textBody },

  cells: { marginTop: t.cellsGap, flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: '#F6F3EE',
    padding: t.cellPad,
  },
  cellLabel: {
    fontFamily: font.appSemi,
    fontSize: 9.5,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },
  cellSub: { marginTop: t.cellSubGap, fontFamily: font.appBody, fontSize: t.cellSubSize, color: colors.textBody },

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

  chips: { marginTop: t.chipsGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGapX },
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

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  docHead: { flexDirection: 'row', alignItems: 'center' },
  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F7E6D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: 11, marginRight: 8 },
  docName: { fontFamily: font.appHeading, fontSize: 14.5, color: colors.textPrimary },
  docMeta: { marginTop: 3, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },
  docView: {
    minHeight: 32,
    borderRadius: 8,
    paddingHorizontal: 11,
    backgroundColor: '#F1EEE8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  docViewText: { fontFamily: font.appBody, fontSize: 12.5, color: colors.textPrimary },
  docViewIcon: { marginLeft: 5 },

  docTags: { marginTop: 11, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 },
  pagesTag: {
    minHeight: 24,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: '#F2F1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagesText: { fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  refTag: {
    minHeight: 24,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: '#F7E6D0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  refTagText: { flexShrink: 1, fontFamily: font.appBody, fontSize: 11, color: '#6B4F2A' },
  uploaded: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },

  statusTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    minHeight: 24,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: '#F2F1EE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTagText: { marginLeft: 6, fontFamily: font.appBody, fontSize: 11, color: colors.textPrimary },

  primary: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: t.actionPrimaryBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  primaryText: { marginLeft: 10, fontFamily: font.appSemi, fontSize: 15, color: ink.onBrand },
  secondary: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: t.actionSecondaryBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryText: { marginLeft: 10, flexShrink: 1, fontFamily: font.appBody, fontSize: 15, color: colors.textPrimary },
});
