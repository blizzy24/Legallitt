import { router } from 'expo-router';
import {
  BadgeCheck,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Mic,
  Paperclip,
  Search,
  SlidersHorizontal,
  SquarePlus,
  UserRound,
  Zap,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_CLIENT_THREADS, ADV_MESSAGE_STATS } from '../../../../data/advocateSide';
import { advClientSub as t, colors, font, ink } from '../../../../constants/theme';

// Client messages (design/155).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THIS IS A FOURTH MESSAGES-LIST DESIGN.
//
//   design/142 (client side)   initials avatar, name, green "Verified" chip,
//                              timestamp, a "Matter:" line, preview, unread badge
//                              or chevron; search and four filter chips
//   design/155 (here)          three stat cells above the list, a search field with
//                              a MIC, four filter chips, a matter chip paired with a
//                              monospaced case reference, and a double-tick read
//                              receipt where the client list uses a chevron
//
// These are not variants of one component — they are two lists of the same thing,
// drawn independently. That is on top of the three CHAT THREAD treatments already
// flagged (design/33, design/35, design/112, design/143). The messaging surface now
// has six distinct designs across the app.
//
// The fourth filter chip is clipped as "Notices &…". Inferred as "Notices & Orders"
// from the matter types on this screen, but it is a guess, as design/151's "Cor…"
// chip was.
//
// "Initiate New Client Consultation" is inert: no destination is designed.
// ─────────────────────────────────────────────────────────────────────────────

const FILTERS = ['All (4)', 'Unread (1)', 'Active Matters (3)', 'Notices & Orders'];

export default function AdvocateClientMessagesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ADV_CLIENT_THREADS.filter((th) => {
      if (filter === 1 && th.unread === 0) return false;
      if (!q) return true;
      return (
        th.name.toLowerCase().includes(q) ||
        th.caseRef.toLowerCase().includes(q) ||
        th.matter.toLowerCase().includes(q)
      );
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
        <Text style={styles.title} numberOfLines={1}>
          Client Messages
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={styles.iconBtn}>
          <SlidersHorizontal size={t.iconBtnGlyph} color={colors.textPrimary} />
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
        <View style={styles.cells}>
          {ADV_MESSAGE_STATS.map((s) => (
            <View key={s.label} style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                {s.label}
              </Text>
              <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                {s.value} <Text style={styles.cellUnit}>{s.unit}</Text>
              </Text>
              <View style={styles.cellSubRow}>
                {s.dot ? <View style={styles.cellDot} /> : <Zap size={11} color={colors.brandDark} />}
                <Text style={styles.cellSub} {...shrinkToFit(0.7)}>
                  {s.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients, dockets or matters..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          <Mic size={t.searchIcon} color={colors.textBody} />
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

        {threads.map((th) => (
          <Pressable key={th.id} accessibilityRole="button" style={styles.row}>
            <View style={styles.rowAvatarWrap}>
              <View style={[styles.rowAvatar, th.avatarTone === 'grey' && styles.rowAvatarGrey]}>
                <Text style={styles.rowAvatarText}>{th.initials}</Text>
              </View>
              {th.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.rowText}>
              <View style={styles.rowNameRow}>
                <Text style={styles.rowName} {...shrinkToFit(0.75)}>
                  {th.name}
                </Text>
                {th.verified && (
                  <BadgeCheck
                    size={14}
                    color={ink.onBrand}
                    fill={colors.brandDark}
                    style={styles.rowTick}
                  />
                )}
                <Text style={styles.rowWhen} {...shrinkToFit(0.75)}>
                  {th.when}
                </Text>
              </View>

              <View style={styles.matterChip}>
                <Text style={styles.matterText} {...shrinkToFit(0.7)}>
                  {th.matter}
                </Text>
                <Text style={styles.matterSep}>•</Text>
                <Text style={styles.matterRef} {...shrinkToFit(0.7)}>
                  {th.caseRef}
                </Text>
              </View>

              <View style={styles.previewRow}>
                {th.attachment && (
                  <Paperclip size={13} color={colors.textBody} style={styles.previewClip} />
                )}
                <Text
                  style={[styles.preview, th.unread > 0 && styles.previewUnread]}
                  {...shrinkToFit(0.7)}
                >
                  {th.preview}
                </Text>
                {th.unread > 0 ? (
                  <View style={styles.unread}>
                    <Text style={styles.unreadText}>{th.unread}</Text>
                  </View>
                ) : (
                  <CheckCheck size={15} color={colors.brandDark} />
                )}
                <ChevronRight size={15} color={colors.textMuted} style={styles.rowChevron} />
              </View>
            </View>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.initiate, pressed && styles.pressed]}
        >
          <SquarePlus size={18} color={ink.onBrand} />
          <Text style={styles.initiateText} {...shrinkToFit(0.8)}>
            Initiate New Client Consultation
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
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.titleGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
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
  cells: { marginTop: t.cellsGap, flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: colors.card,
    padding: t.cellPad,
  },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.textBody },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: 19,
    color: colors.textPrimary,
  },
  cellUnit: { fontFamily: font.appBody, fontSize: 12 },
  cellSubRow: { marginTop: t.cellSubGap, flexDirection: 'row', alignItems: 'center' },
  cellDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brandDark },
  cellSub: { marginLeft: 6, flexShrink: 1, fontFamily: font.appBody, fontSize: t.cellSubSize, color: colors.textBody },

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
    marginHorizontal: t.searchIconGap,
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.searchSize,
    color: colors.textPrimary,
    outlineWidth: 0,
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

  row: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
    flexDirection: 'row',
  },
  rowAvatarWrap: { width: 42, height: 42 },
  rowAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F7E2C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarGrey: { backgroundColor: '#E8E6E1' },
  rowAvatarText: { fontFamily: font.appSemi, fontSize: 13, color: colors.brandDark },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2,
    borderColor: colors.card,
    backgroundColor: '#17B169',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: 11 },
  rowNameRow: { flexDirection: 'row', alignItems: 'center' },
  rowName: { flexShrink: 1, fontFamily: font.appHeading, fontSize: 15, color: colors.textPrimary },
  rowTick: { marginLeft: 5 },
  rowWhen: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },

  matterChip: {
    marginTop: 7,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 24,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: '#F2F1EE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  matterText: { flexShrink: 1, fontFamily: font.appBody, fontSize: 11, color: colors.textPrimary },
  matterSep: { marginHorizontal: 6, fontSize: 11, color: colors.textMuted },
  matterRef: { flexShrink: 1, fontFamily: font.mono, fontSize: 10.5, color: colors.textBody },

  previewRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center' },
  previewClip: { marginRight: 7 },
  preview: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: 13, color: colors.textBody },
  previewUnread: { fontFamily: font.appHeading, color: colors.textPrimary },
  unread: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5A4A37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontFamily: font.appSemi, fontSize: 11.5, color: ink.onBrand },
  rowChevron: { marginLeft: 7 },

  initiate: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#5A4A37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pressed: { opacity: 0.85 },
  initiateText: { marginLeft: 11, flexShrink: 1, fontFamily: font.appSemi, fontSize: 15, color: ink.onBrand },
});
