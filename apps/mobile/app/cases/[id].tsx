import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  MessageSquare,
  MoreVertical,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListHeader from '../../components/ListHeader';
import StatusPill from '../../components/StatusPill';
import { caseDetail as d, colors, font, ink, space, status } from '../../constants/theme';
import {
  calendarParts,
  formatDate,
  getAdvocate,
  getCase,
  getHearing,
} from '../../data/cases';

type TabKey = 'overview' | 'hearings' | 'documents' | 'updates';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'hearings', label: 'Hearings' },
  { key: 'documents', label: 'Documents' },
  { key: 'updates', label: 'Updates' },
];

export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('overview');

  const item = getCase(id);
  const advocate = item ? getAdvocate(item.advocateId) : undefined;
  const hearing = item?.nextHearingId ? getHearing(item.nextHearingId) : undefined;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/cases');
  };

  if (!item) {
    return (
      <View style={[styles.screen, styles.centre, { paddingTop: insets.top + d.top }]}>
        <Text style={styles.emptyTitle}>Case not found</Text>
        <Text style={styles.emptyText}>No case matches {id}.</Text>
      </View>
    );
  }

  const cal = hearing ? calendarParts(hearing.date) : undefined;

  return (
    <View style={styles.screen}>
      {/* Kebab has no menu yet. */}
      <ListHeader
        title="Case Details"
        rightIcon={MoreVertical}
        rightLabel="More options"
        onBack={goBack}
        paddingTop={d.top}
        // d.headerGap — this one is the screen's own measured header gap.
        paddingBottom={d.headerGap}
        titleSize={d.titleSize}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: d.cardGap + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroPills}>
            <StatusPill label={item.categoryLabel.toUpperCase()} caps />
            <StatusPill label="Active" tone="active" dot />
          </View>

          <Text style={styles.heroTitle}>{item.title}</Text>
          <View style={styles.courtRow}>
            <Building2 size={d.courtIcon} color={ink.accent} />
            <Text style={styles.courtText} numberOfLines={1}>
              {item.court} • {item.state}
            </Text>
          </View>

          {advocate && (
            <View style={styles.block}>
              <AdvocateAvatar name={advocate.name} style={styles.avatar}><Text style={styles.avatarText}>{advocate.initials}</Text></AdvocateAvatar>
              <View style={styles.blockText}>
                <View style={styles.advocateRow}>
                  <Text style={styles.advocateName} numberOfLines={1}>
                    {advocate.name}
                  </Text>
                  {advocate.verified && (
                    <View style={styles.verified}>
                      <CheckCircle2 size={d.advocateRoleSize + 2} color={status.active} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.advocateRole}>Assigned Advocate</Text>
              </View>
            </View>
          )}

          {hearing && cal && (
            <View style={styles.block}>
              <View style={styles.calTile}>
                <Text style={styles.calMonth}>{cal.month}</Text>
                <Text style={styles.calDay}>{cal.day}</Text>
              </View>
              <View style={styles.blockText}>
                <Text style={styles.hearingLabel}>NEXT HEARING</Text>
                <Text style={styles.hearingValue}>
                  {formatDate(hearing.date)} • {hearing.time}
                </Text>
                <Text style={styles.hearingRoom}>{hearing.courtroom}</Text>
              </View>
            </View>
          )}

          {/* Contact Advocate opens the advocate chat (design/33). */}
          <Pressable onPress={() => router.push('/chat/advocate' as Href)} accessibilityRole="button" style={styles.contact}>
            <MessageSquare size={d.contactTextSize} color={ink.onBrand} />
            <Text style={styles.contactText}>Contact Advocate</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipScroll}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                role="tab"
                aria-selected={active}
                onPress={() => setTab(t.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === 'overview' ? (
          <>
            <Card title="Case Information" icon={Clock} style={styles.firstCard}>
              <InfoRow label="Case ID" value={item.id} mono first />
              <InfoRow label="Filed Date" value={formatDate(item.filedDate)} />
              <InfoRow label="Case Category" value={item.categoryLabel} />
              <InfoRow label="Court" value={item.court} />
              <InfoRow label="Status" value={item.statusLabel} dot last />
            </Card>

            {item.recentUpdate && (
              <Card
                title="Recent Update"
                icon={Clock}
                trailing={
                  <View style={styles.datePill}>
                    <Text style={styles.datePillText}>{formatDate(item.recentUpdate.date)}</Text>
                  </View>
                }
              >
                <View style={styles.note}>
                  <Text style={styles.noteText}>{item.recentUpdate.text}</Text>
                </View>
              </Card>
            )}

            {item.nextAction && (
              <Card title="Next Action" icon={ClipboardList}>
                <View style={[styles.note, styles.noteRow]}>
                  <View style={styles.checkCircle}>
                    <Check size={d.checkIcon} color={ink.onBrand} strokeWidth={3} />
                  </View>
                  <Text style={[styles.noteText, styles.noteRowText]}>{item.nextAction}</Text>
                </View>
              </Card>
            )}

            <View style={styles.docCard}>
              <View style={styles.docIcon}>
                <FileText size={d.contactTextSize} color={ink.accent} />
              </View>
              <View style={styles.blockText}>
                <Text style={styles.docTitle}>Documents</Text>
                <Text style={styles.docSub}>{item.documentsCount} documents available</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/documents/case')}
                style={({ pressed }) => [styles.docButton, pressed && styles.docButtonPressed]}
              >
                <Text style={styles.docButtonText}>View Documents</Text>
                <ChevronRight size={d.docButtonText} color={colors.textBody} />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.tabEmpty}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              {TABS.find((t) => t.key === tab)?.label} for this case will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Card({
  title,
  icon: Icon,
  trailing,
  children,
  style,
}: {
  title: string;
  icon: typeof Clock;
  trailing?: ReactNode;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHead}>
        <Icon size={d.sectionTitleSize} color={ink.accent} />
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.spacer} />
        {trailing}
      </View>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  mono,
  dot,
  first,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dot?: boolean;
  first?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, first && styles.infoRowFirst, last && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>
        {dot && <View style={styles.infoDot} />}
        <Text
          style={[styles.infoValue, mono && styles.infoValueMono, dot && styles.infoValueActive]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: space.screenX,
  },

  // Hero card
  hero: {
    borderRadius: d.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: d.cardPad,
  },
  heroPills: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    marginTop: d.heroTitleGap,
    fontFamily: font.appHeading,
    fontSize: d.heroTitleSize,
    color: colors.textPrimary,
  },
  courtRow: {
    marginTop: d.courtGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.courtIconGap,
  },
  courtText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: d.courtSize,
    color: colors.textBody,
  },
  block: {
    marginTop: d.blockGap,
    borderRadius: d.blockRadius,
    backgroundColor: colors.appBg,
    padding: d.blockPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockText: {
    flex: 1,
    minWidth: 0,
    marginLeft: d.blockPad,
  },
  avatar: {
    width: d.avatar,
    height: d.avatar,
    borderRadius: d.avatar / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: d.avatarInitials,
    color: ink.accent,
  },
  advocateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.sectionIconGap,
  },
  advocateName: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: d.advocateNameSize,
    color: colors.textPrimary,
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontFamily: font.appSemi,
    fontSize: d.advocateRoleSize,
    color: status.active,
  },
  advocateRole: {
    marginTop: d.advocateRoleGap,
    fontFamily: font.appBody,
    fontSize: d.advocateRoleSize,
    color: colors.textBody,
  },
  calTile: {
    width: d.calTile,
    height: d.calTile,
    borderRadius: d.calTileRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonth: {
    fontFamily: font.appSemi,
    fontSize: d.calMonthSize,
    letterSpacing: 0.5,
    color: ink.accent,
  },
  calDay: {
    fontFamily: font.appHeading,
    fontSize: d.calDaySize,
    color: colors.textPrimary,
  },
  hearingLabel: {
    fontFamily: font.appSemi,
    fontSize: d.hearingLabelSize,
    letterSpacing: 0.5,
    color: ink.accent,
  },
  hearingValue: {
    marginTop: d.hearingLabelGap,
    fontFamily: font.appSemi,
    fontSize: d.hearingValueSize,
    color: colors.textPrimary,
  },
  hearingRoom: {
    marginTop: d.hearingRoomGap,
    fontFamily: font.appBody,
    fontSize: d.hearingRoomSize,
    color: colors.textBody,
  },
  contact: {
    marginTop: d.contactGap,
    height: d.contactHeight,
    borderRadius: d.contactRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: d.contactIconGap,
  },
  contactText: {
    fontFamily: font.appSemi,
    fontSize: d.contactTextSize,
    color: ink.onBrand,
  },

  // Chip row
  chipScroll: {
    marginTop: d.chipRowGap,
    marginHorizontal: -space.screenX,
  },
  chipRow: {
    paddingHorizontal: space.screenX,
    gap: d.chipGap,
  },
  chip: {
    height: d.chipHeight,
    borderRadius: d.chipHeight / 2,
    paddingHorizontal: d.chipPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipText: {
    fontFamily: font.appBody,
    fontSize: d.chipTextSize,
    color: colors.textBody,
  },
  chipTextActive: {
    fontFamily: font.appSemi,
    color: ink.onBrand,
  },

  // Cards
  card: {
    marginTop: d.cardGap,
    borderRadius: d.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: d.cardPad,
  },
  firstCard: {
    marginTop: d.cardsTopGap,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: d.sectionIconGap,
  },
  cardTitle: {
    fontFamily: font.appHeading,
    fontSize: d.sectionTitleSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  infoRow: {
    paddingVertical: d.infoRowPadV,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowFirst: {
    marginTop: d.sectionTitleGap,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: d.infoLabelSize,
    color: colors.textBody,
  },
  infoValueWrap: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoValue: {
    fontFamily: font.appSemi,
    fontSize: d.infoValueSize,
    color: colors.textPrimary,
  },
  infoValueMono: {
    fontFamily: font.mono,
  },
  infoValueActive: {
    color: status.active,
  },
  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: status.active,
  },
  datePill: {
    height: d.datePillHeight,
    borderRadius: d.datePillHeight / 2,
    paddingHorizontal: d.datePillPadX,
    backgroundColor: colors.appBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillText: {
    fontFamily: font.appBody,
    fontSize: d.datePillText,
    color: colors.textBody,
  },
  note: {
    marginTop: d.sectionTitleGap,
    borderRadius: d.blockRadius,
    backgroundColor: colors.appBg,
    padding: d.blockPad,
  },
  checkCircle: {
    width: d.checkCircle,
    height: d.checkCircle,
    borderRadius: d.checkCircle / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: d.checkGap,
  },
  noteText: {
    fontFamily: font.appBody,
    fontSize: d.noteSize,
    lineHeight: d.noteLineHeight,
    color: colors.textBody,
  },
  noteRowText: {
    flex: 1,
    minWidth: 0,
    color: colors.textPrimary,
  },

  // Documents
  docCard: {
    marginTop: d.cardGap,
    borderRadius: d.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: d.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: d.docIcon,
    height: d.docIcon,
    borderRadius: d.docIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: {
    fontFamily: font.appSemi,
    fontSize: d.docTitleSize,
    color: colors.textPrimary,
  },
  docSub: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: d.docSubSize,
    color: colors.textBody,
  },
  docButtonPressed: {
    opacity: 0.85,
  },
  docButton: {
    height: d.docButtonHeight,
    borderRadius: d.docButtonRadius,
    paddingHorizontal: d.docButtonPadX,
    backgroundColor: colors.iconChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docButtonText: {
    fontFamily: font.appSemi,
    fontSize: d.docButtonText,
    color: colors.textBody,
  },

  // Empty states
  tabEmpty: {
    marginTop: d.cardGap * 2,
    alignItems: 'center',
    paddingHorizontal: d.cardPad,
  },
  emptyTitle: {
    fontFamily: font.appSemi,
    fontSize: d.docTitleSize,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: d.noteSize,
    color: colors.textBody,
    textAlign: 'center',
  },
});
