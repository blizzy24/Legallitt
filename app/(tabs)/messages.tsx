import { router, type Href } from 'expo-router';
import { BadgeCheck, ChevronRight, Lock, Search, SquarePen } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabBar from '../../components/TabBar';
import { shrinkToFit } from '../../constants/textFit';
import {
  CONVERSATIONS,
  MESSAGES_FILTERS,
  MESSAGES_FOOTER,
  conversationParty,
  type ConversationFilter,
} from '../../data/messages';
import { colors, font, ink, messagesList as t } from '../../constants/theme';

// Messages (design/142). REPLACES the provisional one-row list.
//
// Conversations come from data/messages.ts, which holds an advocate ID per row and
// resolves the name and initials from data/advocates.ts — no parallel records. The
// one advocate design/142 introduced, Adv. Rohan Mehta, was added to SAVED_ADVOCATES.
//
// Search and the filter chips both work. The compose button is inert: no
// new-conversation screen is designed anywhere in the batch.
//
// REPORTED AGAIN — design/142 draws a FOUR-TAB ICON-ONLY tab bar, the same
// contradiction flagged on design/50. The app's five-tab labelled bar is kept, as
// instructed then.

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ConversationFilter>('all');

  // design/142's "Unread (3)" is the message count (2 + 1), not the row count.
  const unreadCount = CONVERSATIONS.reduce((n, c) => n + c.unread, 0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONVERSATIONS.filter((c) => {
      if (filter === 'unread' && c.unread === 0) return false;
      if (filter === 'advocates' && c.kind !== 'advocate') return false;
      if (filter === 'support' && c.kind !== 'support') return false;
      if (!q) return true;
      const party = conversationParty(c);
      return (
        party.name.toLowerCase().includes(q) ||
        c.context.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + t.headerTop }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              Chat with your advocates
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="New conversation"
            style={styles.compose}
          >
            <SquarePen size={t.composeIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations"
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
          {MESSAGES_FILTERS.map((f) => {
            const on = f.id === filter;
            const label = f.id === 'unread' ? `${f.label} (${unreadCount})` : f.label;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.75)}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {rows.map((c) => {
          const party = conversationParty(c);
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              onPress={() => router.push(`/messages/${c.id}` as Href)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{party.initials}</Text>
                </View>
                {c.online && <View style={styles.dot} />}
              </View>

              <View style={styles.rowText}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} {...shrinkToFit(0.75)}>
                    {party.name}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      c.badge === 'verified' ? styles.badgeVerified : styles.badgeOfficial,
                    ]}
                  >
                    {c.badge === 'verified' && (
                      <BadgeCheck
                        size={t.badgeIcon}
                        color={t.badgeVerifiedColour}
                        fill={t.badgeVerifiedColour}
                      />
                    )}
                    <Text
                      style={[
                        styles.badgeText,
                        c.badge === 'verified' && styles.badgeTextVerified,
                      ]}
                      {...shrinkToFit(0.75)}
                    >
                      {c.badge === 'verified' ? 'Verified' : 'Official'}
                    </Text>
                  </View>
                  <Text style={styles.time} {...shrinkToFit(0.8)}>
                    {c.timestamp}
                  </Text>
                </View>

                <Text style={styles.context} {...shrinkToFit(0.75)}>
                  {c.contextPrefixed ? `Matter: ${c.context}` : c.context}
                </Text>

                <View style={styles.previewRow}>
                  <Text
                    style={[styles.preview, c.unread > 0 && styles.previewUnread]}
                    {...shrinkToFit(0.75)}
                  >
                    {c.preview}
                  </Text>
                  {c.unread > 0 ? (
                    <View style={styles.unread}>
                      <Text style={styles.unreadText}>{c.unread}</Text>
                    </View>
                  ) : (
                    <ChevronRight size={t.chevron} color={colors.textMuted} />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.foot}>
          <Lock size={t.footIcon} color={colors.brandDark} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {MESSAGES_FOOTER}
          </Text>
        </View>
      </ScrollView>

      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX, paddingBottom: 130 },

  header: { flexDirection: 'row', alignItems: 'flex-start' },
  headerText: { flex: 1, minWidth: 0, marginRight: 12 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  compose: {
    width: t.compose,
    height: t.compose,
    borderRadius: t.compose / 2,
    borderWidth: 1,
    borderColor: t.composeBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  search: {
    marginTop: t.searchGap,
    minHeight: t.searchHeight,
    borderRadius: t.searchRadius,
    borderWidth: 1,
    borderColor: t.searchBorder,
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

  // Explicit height: a horizontal ScrollView otherwise claims more than its rows.
  chipsRow: { marginTop: t.chipsGap, height: t.chipHeight, flexGrow: 0 },
  chips: { gap: t.chipGapX, paddingRight: 4, alignItems: 'center' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOn },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textBody },
  chipTextOn: { fontFamily: font.appSemi, color: ink.onBrand },

  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    backgroundColor: colors.card,
    padding: t.rowPad,
    flexDirection: 'row',
  },
  pressed: { opacity: 0.9 },
  avatarWrap: { width: t.avatar, height: t.avatar },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },
  dot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    borderWidth: 2,
    borderColor: colors.card,
    backgroundColor: '#17B169',
  },

  rowText: { flex: 1, minWidth: 0, marginLeft: t.avatarGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  badge: {
    marginLeft: t.badgeGap,
    minHeight: t.badgeHeight,
    borderRadius: t.badgeRadius,
    paddingHorizontal: t.badgePadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  badgeVerified: { backgroundColor: t.badgeVerifiedBg },
  badgeOfficial: { borderWidth: 1, borderColor: t.badgeOfficialBorder },
  badgeText: {
    marginLeft: t.badgeIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.badgeSize,
    color: colors.textBody,
  },
  badgeTextVerified: { color: t.badgeVerifiedColour },
  time: {
    marginLeft: 'auto',
    paddingLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.timeSize,
    color: colors.textBody,
  },

  context: {
    marginTop: t.contextGap,
    fontFamily: font.appBody,
    fontSize: t.contextSize,
    color: t.contextColour,
  },
  previewRow: { marginTop: t.previewGap, flexDirection: 'row', alignItems: 'center' },
  preview: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.previewSize,
    color: colors.textBody,
  },
  previewUnread: { fontFamily: font.appHeading, color: colors.textPrimary },
  unread: {
    width: t.unread,
    height: t.unread,
    borderRadius: t.unread / 2,
    backgroundColor: t.unreadBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: { fontFamily: font.appSemi, fontSize: t.unreadSize, color: ink.onBrand },

  foot: {
    marginTop: t.footGap,
    minHeight: t.footHeight,
    borderRadius: t.footRadius,
    backgroundColor: t.footBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textPrimary,
  },
});
