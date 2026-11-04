import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import {useNoticeLists} from "../../features/legal-notice/useNoticeLists";
import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Landmark,
  ListFilter,
  MonitorPlay,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, profile as p, requests as t, status } from '../../constants/theme';
import {
  REQUESTS,
  REQUESTS_NOTE,
  REQUEST_FILTERS,
  REQUEST_STATUS,
  type RequestFilter,
  type RequestItem,
} from '../../data/requests';

// My Requests (design/53).
//
// The fourth filter chip is drawn clipped at the screen edge as the horizontal-scroll
// cue. Its label is inferred as "Confirmed" — see the note in data/requests.ts, which
// also records that the chip reads "Pending" where the card it counts reads
// "Awaiting Review".

const ROW_ICONS: Record<string, LucideIcon> = {
  'Assigned Advocate': UserRound,
  'Consultation Mode': MonitorPlay,
  'Court Forum': Landmark,
  'Requested Date': CalendarDays,
};

export function RequestsScreenView({ requests, onOpen }: { requests: RequestItem[]; onOpen?:(id:string)=>void }) {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<RequestFilter>('all');

  const shown = requests.filter((r) => {
    const f = REQUEST_FILTERS.find((x) => x.key === filter);
    return !f?.match || r.status === f.match;
  });

  const countFor = (key: RequestFilter) => {
    const f = REQUEST_FILTERS.find((x) => x.key === key);
    return f?.match ? requests.filter((r) => r.status === f.match).length : requests.length;
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + p.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={styles.circle}
        >
          <ChevronLeft size={t.rowIcon + 4} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          My Requests
        </Text>
        {/* Filter panel is not designed. */}
        <Pressable onPress={() => previewNotice("Filter")} accessibilityRole="button" accessibilityLabel="Filter" style={styles.circle}>
          <ListFilter size={t.rowIcon + 3} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.noteGap }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Track your consultation and representation requests.</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}
        >
          {REQUEST_FILTERS.map((f) => {
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
                <View style={[styles.count, on && styles.countOn]}>
                  <Text style={[styles.countText, on && styles.countTextOn]}>{countFor(f.key)}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {shown.map((r) => (
          <RequestCard key={r.id} item={r} onOpen={onOpen} />
        ))}

        <View style={styles.note}>
          <Text style={styles.noteText}>{REQUESTS_NOTE}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function RequestCard({ item, onOpen }: { item: RequestItem; onOpen?:(id:string)=>void }) {
  const s = REQUEST_STATUS[item.status];
  const tone = s.tone === 'active' ? status.active : status.pending;
  const toneBg = s.tone === 'active' ? status.activeBg : status.pendingBg;
  const toneText = s.tone === 'active' ? status.active : status.pendingText;

  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.cardBody}>
        <View style={styles.cardHead}>
          {/* design/53 draws a blank chip here. Left blank rather than inventing a
              per-service glyph the file does not show. */}
          <View style={styles.mark} />
          <View style={styles.headText}>
            <Text style={styles.serviceLabel} {...shrinkToFit(0.8)}>
              SERVICE TYPE
            </Text>
            <Text style={styles.service}>{item.service}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: toneBg }]}>
            <View style={[styles.pillDot, { backgroundColor: tone }]} />
            <Text style={[styles.pillText, { color: toneText }]} {...shrinkToFit(0.8)}>
              {s.label}
            </Text>
          </View>
        </View>

        <View style={styles.rows}>
          {item.rows.filter(row=>Boolean(row.value)).map((row, i) => {
            const Icon = ROW_ICONS[row.label] ?? UserRound;
            return (
              <View key={row.label} style={[styles.row, i > 0 && styles.rowSpaced]}>
                <Icon size={t.rowIcon} color={ink.accent} />
                <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                  {row.label}
                </Text>
                {row.chip ? (
                  <View style={styles.rowChip}>
                    <Text style={styles.rowChipText} {...shrinkToFit(0.75)}>
                      {row.value}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
                    {row.value}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.reference} {...shrinkToFit(0.75)}>
            {item.reference}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpen ? onOpen(item.id) : router.push(`/requests/${item.id}` as Href)}
            style={({ pressed }) => [styles.link, pressed && styles.pressed]}
          >
            <Text style={styles.linkText} {...shrinkToFit(0.8)}>
              View Request
            </Text>
            <ChevronRight size={t.linkIcon} color={ink.accent} style={styles.linkIcon} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    paddingHorizontal: p.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: p.titleSize - 6,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
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
    backgroundColor: t.filterBg,
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
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    width: t.accentWidth,
    backgroundColor: colors.brand,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
    padding: t.cardPad,
    paddingLeft: t.cardPad - t.accentWidth,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mark: {
    width: t.markSize,
    height: t.markSize + 12,
    borderRadius: t.markRadius,
    backgroundColor: colors.iconChipBg,
  },
  headText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.markGap,
  },
  serviceLabel: {
    fontFamily: font.appSemi,
    fontSize: t.serviceLabelSize,
    letterSpacing: t.serviceLabelSpacing,
    color: ink.accent,
  },
  service: {
    marginTop: t.serviceGap,
    fontFamily: font.appHeading,
    fontSize: t.serviceSize,
    color: colors.textPrimary,
  },
  pill: {
    marginLeft: 10,
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
  },
  rows: {
    marginTop: t.rowsGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: t.rowChipHeight,
  },
  rowSpaced: {
    marginTop: t.rowGap,
  },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.rowIconGap,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    marginLeft: 10,
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  rowChip: {
    marginLeft: 10,
    flexShrink: 1,
    minHeight: t.rowChipHeight,
    borderRadius: t.rowChipRadius,
    paddingHorizontal: t.rowChipPadX,
    backgroundColor: t.rowChipBg,
    borderWidth: 1,
    borderColor: t.rowChipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowChipText: {
    fontFamily: font.appSemi,
    fontSize: t.rowChipSize,
    color: colors.textPrimary,
  },
  divider: {
    marginTop: t.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    marginTop: t.refGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reference: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.refSize,
    color: colors.textBody,
  },
  link: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  linkText: {
    fontFamily: font.appSemi,
    fontSize: t.linkSize,
    color: ink.accent,
  },
  linkIcon: {
    marginLeft: t.linkIconGap,
  },
  note: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  noteText: {
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function RequestsScreen() {
  const model=useNoticeLists();
  return <NoticeScreenFeedback error={model.error}><RequestsScreenView requests={model.requests} onOpen={model.api?id=>model.open(id):undefined} /></NoticeScreenFeedback>;
}
