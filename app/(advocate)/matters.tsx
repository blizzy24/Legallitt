import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Bell,
  CircleCheck,
  ClipboardList,
  Eye,
  FileText,
  Gavel,
  House,
  MessageSquare,
  Scale,
  Search,
  ShieldAlert,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  ADV_RESPONSE_CASES,
  ADV_RESPONSE_FILTERS,
  ADV_RESPONSE_STATS,
  ADV_SERVICE_FILTERS,
  type AdvResponseCase,
} from '../../data/advocateSide';
import { advResponses as t, colors, font, ink } from '../../constants/theme';

// Advocate responses / cases (design/162).
//
// This lives in the TAB GROUP, as the scales tab, because design/162 draws the tab
// bar with that tab active. app/advocate/requests/index.tsx re-exports it so the
// path named in the brief also resolves; the component is defined once here.
//
// REPORTED — TWO CLIPPED FILTER LABELS. The first chip row ends "Co…" and the second
// "Property Sea…". Inferred as "Completed (12)" — the stat cells read REVIEW 3,
// PROGRESS 5, RESOLVED 12, and 3 + 5 + 12 = 20, which is the All count — and
// "Property Search Report". Both are inferences, and this is the third and fourth
// clipped label in the advocate batch after design/151 and design/155.

const SERVICE_ICONS: Record<AdvResponseCase['serviceIcon'], typeof FileText> = {
  notice: FileText,
  fir: ShieldAlert,
  property: House,
  advice: Gavel,
};

const NOTE_ICONS: Record<AdvResponseCase['noteIcon'], typeof SquarePen> = {
  draft: SquarePen,
  message: MessageSquare,
  docs: FileText,
  done: CircleCheck,
};

const STATUS_TONE: Record<AdvResponseCase['status'], { bg: string; colour: string }> = {
  'draft-in-progress': { bg: '#F7E6D0', colour: '#8A6F4B' },
  'changes-requested': { bg: '#FBE4E4', colour: '#C0392B' },
  'needs-review': { bg: '#FBF0DC', colour: '#8A6F4B' },
  completed: { bg: '#E3F6ED', colour: '#1E9E4A' },
};

export default function AdvocateMattersScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);
  const [service, setService] = useState(0);
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADV_RESPONSE_CASES.filter((c) => {
      if (filter === 1 && c.status !== 'needs-review') return false;
      if (filter === 2 && !['draft-in-progress', 'changes-requested'].includes(c.status)) return false;
      if (filter === 3 && c.status !== 'completed') return false;
      if (service > 0 && c.service !== ADV_SERVICE_FILTERS[service]) return false;
      if (!q) return true;
      return (
        c.client.toLowerCase().includes(q) ||
        c.matter.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q)
      );
    });
  }, [filter, service, query]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Scale size={t.mark} color={colors.brandDark} />
        <Text style={styles.markTitle} numberOfLines={1}>
          Responses
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/advocate/notifications')}
        >
          <Bell size={t.bell} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Cases</Text>
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              Manage your active work and client requests.
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Alerts" style={styles.bellBtn}>
            <Bell size={t.bellBtnIcon} color={colors.textPrimary} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        <View style={styles.cells}>
          {ADV_RESPONSE_STATS.map((s, i) => (
            <View key={s.label} style={styles.cell}>
              <View style={styles.cellHead}>
                <Text
                  style={[styles.cellLabel, s.tone === 'green' && styles.cellLabelGreen]}
                  {...shrinkToFit(0.75)}
                >
                  {s.label}
                </Text>
                {i === 0 && <ClipboardList size={t.cellIcon} color={colors.brandDark} />}
                {i === 1 && <ClipboardList size={t.cellIcon} color={colors.brandDark} />}
                {i === 2 && <CircleCheck size={t.cellIcon} color="#1E9E4A" />}
              </View>
              <View style={styles.cellBody}>
                <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                  {s.value}
                </Text>
                <View style={[styles.cellChip, s.tone === 'green' && styles.cellChipGreen]}>
                  <Text
                    style={[styles.cellChipText, s.tone === 'green' && styles.cellChipTextGreen]}
                    {...shrinkToFit(0.75)}
                  >
                    {s.chip}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cases, clients or services..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chips}
        >
          {ADV_RESPONSE_FILTERS.map((f, i) => {
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.chipsRow, styles.chipsRowNext]}
          contentContainerStyle={styles.chips}
        >
          {ADV_SERVICE_FILTERS.map((f, i) => {
            const on = i === service;
            return (
              <Pressable
                key={f}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setService(i)}
                style={[styles.chip, styles.chipOutline, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {rows.map((c) => {
          const ServiceIcon = SERVICE_ICONS[c.serviceIcon];
          const NoteIcon = NOTE_ICONS[c.noteIcon];
          const tone = STATUS_TONE[c.status];
          return (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.service}>
                  <ServiceIcon size={t.serviceIcon} color={colors.brandDark} />
                  <Text style={styles.serviceText} {...shrinkToFit(0.75)}>
                    {c.service}
                  </Text>
                </View>
                <View style={[styles.status, { backgroundColor: tone.bg }]}>
                  <Text style={[styles.statusText, { color: tone.colour }]} {...shrinkToFit(0.75)}>
                    {c.statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.clientRow}>
                <Text style={styles.client} {...shrinkToFit(0.75)}>
                  {c.client}
                </Text>
                <Text style={styles.when} {...shrinkToFit(0.75)}>
                  {c.when}
                </Text>
              </View>
              <Text style={styles.matter} {...shrinkToFit(0.75)}>
                Matter: {c.matter}
              </Text>

              <View style={styles.note}>
                <NoteIcon
                  size={t.noteIcon}
                  color={c.status === 'completed' ? '#1E9E4A' : colors.brandDark}
                />
                <Text style={styles.noteText}>
                  {c.note}
                  {c.noteQuote ? <Text style={styles.noteQuote}> {c.noteQuote}</Text> : null}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/advocate/requests/${c.id}` as Href)}
                style={({ pressed }) => [styles.open, pressed && styles.pressed]}
              >
                <Text style={styles.openText}>Open Case</Text>
                {c.status === 'completed' ? (
                  <Eye size={t.openIcon} color={ink.onBrand} style={styles.openIcon} />
                ) : (
                  <ArrowRight size={t.openIcon} color={ink.onBrand} style={styles.openIcon} />
                )}
              </Pressable>
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
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.markGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.markTitleSize,
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

  content: { paddingHorizontal: t.padX, paddingBottom: 130 },
  titleRow: { marginTop: t.titleGap, flexDirection: 'row', alignItems: 'flex-start' },
  titleText: { flex: 1, minWidth: 0, marginRight: 12 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  bellBtn: {
    width: t.bellBtn,
    height: t.bellBtn,
    borderRadius: t.bellBtn / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    right: 9,
    top: 9,
    width: t.bellDot,
    height: t.bellDot,
    borderRadius: t.bellDot / 2,
    backgroundColor: '#D64545',
  },

  cells: { marginTop: t.cellsGap, flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: colors.card,
    padding: t.cellPad,
  },
  cellHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cellLabel: {
    flexShrink: 1,
    marginRight: 6,
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    letterSpacing: t.cellLabelSpacing,
    color: colors.brandDark,
  },
  cellLabelGreen: { color: '#1E9E4A' },
  cellBody: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'center' },
  cellValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },
  cellChip: {
    marginLeft: 'auto',
    minHeight: t.cellChipHeight,
    borderRadius: t.cellChipRadius,
    paddingHorizontal: t.cellChipPadX,
    backgroundColor: '#F1EDE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellChipGreen: { backgroundColor: '#E3F6ED' },
  cellChipText: { fontFamily: font.appBody, fontSize: t.cellChipSize, color: colors.textBody },
  cellChipTextGreen: { color: '#1E9E4A' },

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

  chipsRow: { marginTop: t.chipsGap, height: t.chipHeight, flexGrow: 0 },
  chipsRowNext: { marginTop: t.chipRowGap },
  chips: { gap: t.chipGapX, paddingRight: 4, alignItems: 'center' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOutline: {
    backgroundColor: t.chipOutlineBg,
    borderWidth: 1,
    borderColor: t.chipOutlineBorder,
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
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  service: {
    minHeight: t.serviceHeight,
    borderRadius: t.serviceRadius,
    paddingHorizontal: t.servicePadX,
    backgroundColor: t.serviceBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  serviceText: {
    marginLeft: t.serviceIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.serviceSize,
    color: colors.textPrimary,
  },
  status: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  statusText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.statusSize },

  clientRow: { marginTop: t.clientGap, flexDirection: 'row', alignItems: 'center' },
  client: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appHeading, fontSize: t.clientSize, color: colors.textPrimary },
  when: { fontFamily: font.appBody, fontSize: t.whenSize, color: colors.textBody },
  matter: { marginTop: t.matterGap, fontFamily: font.appBody, fontSize: t.matterSize, color: colors.textBody },

  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
  },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  noteQuote: { fontStyle: 'italic', color: colors.brandDark },

  open: {
    marginTop: t.openGap,
    minHeight: t.openHeight,
    borderRadius: t.openRadius,
    backgroundColor: t.openBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  openText: { fontFamily: font.appBody, fontSize: t.openSize, color: ink.onBrand },
  openIcon: { marginLeft: t.openIconGap },
});
