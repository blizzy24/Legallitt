import { router, type Href } from 'expo-router';
import { Bell, ChevronRight, Clock, FolderOpen } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CaseCard from '../../components/CaseCard';
import HearingCard from '../../components/HearingCard';
import SegmentedControl, { type Segment } from '../../components/SegmentedControl';
import StatusPill from '../../components/StatusPill';
import { cases as t, colors, font, ink, space, status, tabs } from '../../constants/theme';
import {
  activeCases,
  caseStats,
  formatDate,
  upcomingHearings,
  PENDING_REQUESTS,
  type PendingRequest,
} from '../../data/cases';

type Tab = 'active' | 'pending' | 'closed';

const SEGMENTS: Segment<Tab>[] = [
  { key: 'active', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'closed', label: 'Closed' },
];

export default function CasesScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('active');

  const stats = caseStats();
  const active = activeCases();
  const hearings = upcomingHearings();
  const nextHearing = hearings[0];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + t.top,
            paddingBottom: tabs.bottom + tabs.labelled.height + t.sectionGap + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>My Cases</Text>
            <Text style={styles.subtitle}>Track and manage your legal matters in one place.</Text>
          </View>
          <Pressable onPress={() => router.push('/notifications' as Href)} accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bell}>
            <Bell size={t.bellIcon} color={colors.textPrimary} />
            <View style={styles.bellDot} />
          </Pressable>
        </View>

        <SegmentedControl segments={SEGMENTS} value={tab} onChange={setTab} style={styles.segmented} />

        {tab === 'active' && (
          <>
            <View style={styles.stats}>
              <StatCard label="ACTIVE CASES" value={stats.active} tone="active" />
              <StatCard label="HEARINGS" value={stats.hearings} tone="neutral" />
              <StatCard label="PENDING" value={stats.pending} tone="pending" />
            </View>

            {nextHearing && (
              <>
                <SectionHeading
                  title="Upcoming Hearing"
                  dot
                  onViewAll={() => router.push('/hearings')}
                />
                <HearingCard
                  hearing={nextHearing}
                  onPress={() => router.push(`/hearings/${nextHearing.id}`)}
                />
              </>
            )}

            <SectionHeading
              title={`Active Cases (${active.length})`}
              onViewAll={() => router.push('/cases/all')}
              style={styles.sectionSpaced}
            />
            {active.map((item) => (
              <View key={item.id} style={styles.cardSpacing}>
                <CaseCard item={item} onPress={() => router.push(`/cases/${item.id}`)} />
              </View>
            ))}

            <PendingSection requests={PENDING_REQUESTS} />
          </>
        )}

        {tab === 'pending' && <PendingSection requests={PENDING_REQUESTS} first />}

        {tab === 'closed' && (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <FolderOpen size={t.statNumberSize} color={ink.accent} />
            </View>
            <Text style={styles.emptyTitle}>No closed cases</Text>
            <Text style={styles.emptyText}>
              Cases you have closed will appear here once they are resolved.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PendingSection({ requests, first }: { requests: PendingRequest[]; first?: boolean }) {
  return (
    <>
      {/* "View All" opens the requests list (design/53). */}
      <SectionHeading
        title={`Pending Requests (${requests.length})`}
        onViewAll={() => router.push('/requests' as Href)}
        style={first ? styles.sectionFirst : styles.sectionSpaced}
      />
      {requests.map((request) => (
        <RequestCard key={request.id} request={request} />
      ))}
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'active' | 'pending' | 'neutral';
}) {
  const dotColour =
    tone === 'active' ? status.active : tone === 'pending' ? status.pending : colors.brand;
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
        {label}
      </Text>
      <View style={styles.statRow}>
        <Text style={styles.statValue}>{value}</Text>
        <View style={[styles.statDot, { backgroundColor: dotColour }]} />
      </View>
    </View>
  );
}

function SectionHeading({
  title,
  dot,
  onViewAll,
  viewAllInert,
  style,
}: {
  title: string;
  dot?: boolean;
  onViewAll?: () => void;
  viewAllInert?: boolean;
  style?: object;
}) {
  const viewAll = (
    <>
      <Text style={styles.viewAllText}>View All</Text>
      <ChevronRight size={t.viewAllSize} color={colors.textBody} />
    </>
  );
  return (
    <View style={[styles.sectionHeading, style]}>
      {dot && <View style={styles.sectionDot} />}
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.spacer} />
      {onViewAll ? (
        <Pressable accessibilityRole="link" onPress={onViewAll} style={styles.viewAll}>
          {viewAll}
        </Pressable>
      ) : viewAllInert ? (
        <View style={styles.viewAll}>{viewAll}</View>
      ) : null}
    </View>
  );
}

function RequestCard({ request }: { request: PendingRequest }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <StatusPill label={request.statusLabel} tone="pending" dot />
      </View>
      <View style={styles.clock}>
        <Clock size={t.clockIcon} color={ink.accent} />
      </View>

      <Text style={styles.cardTitle}>{request.title}</Text>
      <Text style={styles.cardMeta}>
        {request.categoryLabel} • {request.note}
      </Text>

      {/* design/17 fits both halves on one line, but only just: at 360pt they would wrap
          or truncate. Stacked here so the row holds at 360, 390 and 412 without setting
          the type smaller than the design's. */}
      <View style={styles.requestInner}>
        <Text style={styles.requestLabel} numberOfLines={1}>
          Requested: <Text style={styles.requestValue}>{formatDate(request.requestedDate)}</Text>
        </Text>
        <Text style={styles.requestMatch} numberOfLines={1}>
          Est. Advocate match: {request.estimatedMatch}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{request.progressNote}</Text>
        <View style={styles.spacer} />
        {/* "View Request" opens the request (design/54). This pending request has no
            record of its own; /requests/[id] shows District Representation DR-4402. */}
        <Pressable accessibilityRole="link" onPress={() => router.push(`/requests/${request.id}` as Href)} style={styles.viewAll}>
          <Text style={styles.requestLink}>View Request</Text>
          <ChevronRight size={t.linkSize} color={colors.textBody} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: space.screenX,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
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
  bell: {
    width: t.bellButton,
    height: t.bellButton,
    borderRadius: t.bellButton / 2,
    backgroundColor: colors.card,
    borderWidth: t.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: t.bellDotInset,
    right: t.bellDotInset,
    width: t.bellDot,
    height: t.bellDot,
    borderRadius: t.bellDot / 2,
    backgroundColor: status.notification,
  },
  segmented: {
    marginTop: t.segGap,
  },
  stats: {
    marginTop: t.statGap,
    flexDirection: 'row',
    gap: t.statColGap,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    height: t.statHeight,
    borderRadius: t.statRadius,
    backgroundColor: colors.card,
    borderWidth: t.hairline,
    borderColor: colors.border,
    paddingHorizontal: t.statPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: font.appBody,
    fontSize: t.statLabelSize,
    letterSpacing: t.capsSpacing,
    color: colors.textBody,
  },
  statRow: {
    marginTop: t.statNumberGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: font.appHeading,
    fontSize: t.statNumberSize,
    color: colors.textPrimary,
  },
  statDot: {
    width: t.statDot,
    height: t.statDot,
    borderRadius: t.statDot / 2,
    marginLeft: t.statDotGap,
  },
  sectionHeading: {
    marginTop: t.sectionGap,
    marginBottom: t.headingGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionSpaced: {
    marginTop: t.sectionGap,
  },
  sectionFirst: {
    marginTop: t.tabTopGap,
  },
  sectionDot: {
    width: t.sectionDot,
    height: t.sectionDot,
    borderRadius: t.sectionDot / 2,
    backgroundColor: colors.brand,
    marginRight: t.sectionDotGap,
  },
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.sectionTitleSize,
    color: colors.textPrimary,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: font.appBody,
    fontSize: t.viewAllSize,
    color: colors.textBody,
  },
  spacer: {
    flex: 1,
  },

  // Pending request card
  cardSpacing: {
    marginBottom: t.cardGap,
  },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: t.hairline,
    borderColor: colors.border,
    padding: t.cardPad,
    marginBottom: t.cardGap,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clock: {
    position: 'absolute',
    top: t.clockInset,
    right: t.clockInset,
    width: t.clockButton,
    height: t.clockButton,
    borderRadius: t.clockButton / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: t.cardTitleGap,
    fontFamily: font.appSemi,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  cardMeta: {
    marginTop: t.metaGap,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textBody,
  },
  requestInner: {
    marginTop: t.innerGap,
    borderRadius: t.innerRadius,
    backgroundColor: colors.appBg,
    paddingHorizontal: t.innerPad,
    paddingVertical: t.innerPad - 2,
    alignItems: 'flex-start',
    gap: t.requestGap,
  },
  requestLabel: {
    fontFamily: font.appBody,
    fontSize: t.requestTextSize,
    color: colors.textBody,
  },
  requestValue: {
    fontFamily: font.appSemi,
    color: colors.textPrimary,
  },
  requestMatch: {
    fontFamily: font.appSemi,
    fontSize: t.requestTextSize,
    color: status.pendingText,
  },
  divider: {
    marginTop: t.dividerGap,
    height: t.hairline,
    backgroundColor: colors.border,
  },
  footer: {
    marginTop: t.dividerGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: font.appBody,
    fontSize: t.footerSize,
    color: colors.textBody,
  },
  requestLink: {
    fontFamily: font.appSemi,
    fontSize: t.linkSize,
    color: colors.textBody,
  },

  // Closed (no design — kept in the screen's own style)
  empty: {
    marginTop: t.sectionGap * 3,
    alignItems: 'center',
    paddingHorizontal: t.sectionGap,
  },
  emptyIcon: {
    width: t.bellButton + 12,
    height: t.bellButton + 12,
    borderRadius: (t.bellButton + 12) / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: t.innerGap,
    fontFamily: font.appSemi,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: t.metaGap,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textBody,
    textAlign: 'center',
  },
});
