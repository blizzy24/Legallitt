import { previewNotice } from '../../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Clock,
  FileText,
  Gavel,
  Search,
  UserRound,
  UserRoundPlus,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DEV_PREVIEW_TOGGLES } from '../../../constants/dev';
import { shrinkToFit } from '../../../constants/textFit';
import { ADV_CLIENTS, ADV_CLIENT_STATS } from '../../../data/advocateSide';
import { advClients as t, colors, font, ink } from '../../../constants/theme';

// Advocate clients list (design/151).
//
// REPORTED — THE FOURTH FILTER CHIP IS CLIPPED by the design's scroll cue, reading
// only "Cor…". Inferred as "Corporate": it is the only practice area in the client
// list that starts that way (Amit Verma's "Corporate & Land"), and the other three
// chips are All, Active and Recent Activity. Worth confirming, since it could be
// "Corporate Clients" or a different word entirely.
//
// The search field opens the dedicated search screen (design/159) rather than
// filtering in place, as design/159 exists for exactly that.

const FILTERS = ['All (28)', 'Active (16)', 'Recent Activity', 'Corporate'];

export default function AdvocateClientsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState(0);

  const rows = useMemo(() => {
    if (filter === 1) return ADV_CLIENTS;
    return ADV_CLIENTS;
  }, [filter]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + t.headerTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={styles.logo}>
            <Gavel size={t.logoGlyph} color={colors.brandDark} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/advocate/notifications')}
            style={styles.bell}
          >
            <Bell size={t.bell} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.avatar}>
            <UserRound size={t.avatarGlyph} color={ink.onBrand} />
          </View>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              Manage your clients and their legal matters.
            </Text>
          </View>
          <Pressable onPress={() => previewNotice("Add client")} accessibilityRole="button" accessibilityLabel="Add client" style={styles.add}>
            <UserRoundPlus size={t.addIcon} color={colors.brandDark} />
          </Pressable>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
              Total Clients
            </Text>
            <Text style={styles.statValue}>{ADV_CLIENT_STATS.total}</Text>
            <Text style={styles.statFoot} {...shrinkToFit(0.8)}>
              {ADV_CLIENT_STATS.totalLabel}
            </Text>
          </View>
          <View style={styles.stat}>
            <View style={styles.statHead}>
              <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
                Active
              </Text>
              <View style={styles.statDot} />
            </View>
            <Text style={styles.statValue}>{ADV_CLIENT_STATS.active}</Text>
            <View style={styles.statChip}>
              <Text style={styles.statChipText} {...shrinkToFit(0.8)}>
                {ADV_CLIENT_STATS.activeLabel}
              </Text>
            </View>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
              This Month
            </Text>
            <Text style={styles.statValue}>{ADV_CLIENT_STATS.thisMonth}</Text>
            <View style={[styles.statChip, styles.statChipMom]}>
              <Text style={styles.statChipText} {...shrinkToFit(0.75)}>
                {ADV_CLIENT_STATS.thisMonthLabel}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/clients/search')}
          style={styles.search}
        >
          <Search size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, case ID, contact..."
            placeholderTextColor={colors.textMuted}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>

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

        <View style={styles.listHead}>
          <Text style={styles.listTitle} {...shrinkToFit(0.8)}>
            Active Clients{' '}
            <Text style={styles.listCount}>({ADV_CLIENT_STATS.active})</Text>
          </Text>
          <Pressable onPress={() => previewNotice("Recent Activity")} accessibilityRole="button" hitSlop={6} style={styles.sort}>
            <Text style={styles.sortText} {...shrinkToFit(0.8)}>
              Recent Activity
            </Text>
            <ArrowDown size={t.sortIcon} color={colors.brandDark} style={styles.sortIcon} />
          </Pressable>
        </View>

        {rows.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cAvatarWrap}>
                <View style={styles.cAvatar}>
                  <Text style={styles.cAvatarText}>{c.initials}</Text>
                </View>
                {c.online && <View style={styles.cDot} />}
              </View>
              <View style={styles.cardHeadText}>
                <View style={styles.nameRow}>
                  <Text style={styles.cName} {...shrinkToFit(0.75)}>
                    {c.name}
                  </Text>
                  <View style={styles.cChip}>
                    <Text style={styles.cChipText} {...shrinkToFit(0.8)}>
                      Active Client
                    </Text>
                  </View>
                </View>
                <Text style={styles.cSummary} {...shrinkToFit(0.75)}>
                  {c.summary}
                </Text>
              </View>
            </View>

            <View style={styles.tags}>
              {c.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText} {...shrinkToFit(0.75)}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.info}>
              <FileText size={t.infoIcon} color={colors.textBody} />
              <Text style={styles.infoText} {...shrinkToFit(0.7)}>
                {c.caseRef} • {c.caseMeta}
              </Text>
              <Clock size={t.infoIcon} color={colors.textBody} />
              <Text style={styles.infoWhen} {...shrinkToFit(0.7)}>
                {c.when}
              </Text>
            </View>

            <View style={styles.cardFoot}>
              <Text style={styles.footText} {...shrinkToFit(0.75)}>
                {c.nextStep}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/advocate/clients/${c.id}` as Href)}
                style={({ pressed }) => [styles.view, pressed && styles.pressed]}
              >
                <Text style={styles.viewText} {...shrinkToFit(0.8)}>
                  View Client
                </Text>
                <ArrowRight size={t.viewIcon} color={ink.onBrand} style={styles.viewIcon} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* Development only — nothing in the prototype can empty this list, so
            design/158's empty state is otherwise unreachable. */}
        {DEV_PREVIEW_TOGGLES && (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/advocate/clients/empty')}
            style={styles.devLink}
          >
            <Text style={styles.devLinkText}>Preview state: no clients yet</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX, paddingBottom: 130 },

  topRow: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: t.logo,
    height: t.logo,
    borderRadius: t.logoRadius,
    backgroundColor: t.logoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: { marginLeft: 'auto' },
  avatar: {
    marginLeft: t.avatarGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleRow: { marginTop: t.titleGap, flexDirection: 'row', alignItems: 'flex-start' },
  titleText: { flex: 1, minWidth: 0, marginRight: 12 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  add: {
    width: t.addBtn,
    height: t.addBtn,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stats: { marginTop: t.statsGap, flexDirection: 'row', gap: t.statGapX },
  stat: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.statRadius,
    backgroundColor: colors.card,
    padding: t.statPad,
  },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.statLabelSize, color: colors.textPrimary },
  statDot: {
    width: t.statDot,
    height: t.statDot,
    borderRadius: t.statDot / 2,
    backgroundColor: '#E0A96D',
  },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statFoot: {
    marginTop: t.statFootGap,
    fontFamily: font.appBody,
    fontSize: t.statFootSize,
    color: colors.textBody,
  },
  statChip: {
    marginTop: t.statFootGap,
    alignSelf: 'flex-start',
    minHeight: t.statChipHeight,
    borderRadius: t.statChipRadius,
    paddingHorizontal: t.statChipPadX,
    backgroundColor: t.statChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statChipMom: { backgroundColor: t.statChipMomBg },
  statChipText: { fontFamily: font.appBody, fontSize: t.statChipSize, color: colors.textBody },

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

  listHead: { marginTop: t.listHeadGap, flexDirection: 'row', alignItems: 'center' },
  listTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.listTitleSize,
    color: colors.textPrimary,
  },
  listCount: { fontFamily: font.appBody, color: colors.textBody },
  sort: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontFamily: font.appBody, fontSize: t.sortSize, color: colors.brandDark },
  sortIcon: { marginLeft: t.sortIconGap },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cAvatarWrap: { width: t.cAvatar, height: t.cAvatar },
  cAvatar: {
    width: t.cAvatar,
    height: t.cAvatar,
    borderRadius: t.cAvatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cAvatarText: { fontFamily: font.appSemi, fontSize: t.cAvatarText, color: colors.brandDark },
  cDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: t.cDot,
    height: t.cDot,
    borderRadius: t.cDot / 2,
    backgroundColor: '#5A4A37',
  },
  cardHeadText: { flex: 1, minWidth: 0, marginLeft: t.cAvatarGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  cName: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cNameSize, color: colors.textPrimary },
  cChip: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.cChipHeight,
    borderRadius: t.cChipRadius,
    paddingHorizontal: t.cChipPadX,
    backgroundColor: t.cChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cChipText: { fontFamily: font.appBody, fontSize: t.cChipSize, color: t.cChipColour },
  cSummary: {
    marginTop: t.cSummaryGap,
    fontFamily: font.appBody,
    fontSize: t.cSummarySize,
    color: colors.textBody,
  },

  tags: { marginTop: t.tagsGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.tagGapX },
  tag: {
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: { fontFamily: font.appBody, fontSize: t.tagSize, color: colors.textPrimary },

  info: {
    marginTop: t.infoGap,
    minHeight: t.infoHeight,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    backgroundColor: t.infoBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: t.infoIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.infoSize,
    color: colors.textPrimary,
  },
  infoWhen: {
    marginLeft: t.infoIconGap,
    fontFamily: font.appBody,
    fontSize: t.infoSize,
    color: colors.textPrimary,
  },

  cardFoot: { marginTop: t.footGap, flexDirection: 'row', alignItems: 'center' },
  footText: { flex: 1, minWidth: 0, marginRight: 10, fontFamily: font.appBody, fontSize: t.footSize, color: colors.textBody },
  view: {
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    paddingHorizontal: t.viewPadX,
    backgroundColor: t.viewBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: ink.onBrand },
  viewIcon: { marginLeft: t.viewIconGap },

  devLink: { marginTop: 22, alignItems: 'center' },
  devLinkText: {
    fontFamily: font.appBody,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
