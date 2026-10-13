import { router, type Href } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronRight,
  FileText,
  IndianRupee,
  Landmark,
  MapPin,
  MessageSquare,
  Phone,
  UsersRound,
  Video,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DevPreviewLinks from '../../components/DevPreviewLinks';
import { shrinkToFit } from '../../constants/textFit';
import {
  ADVOCATE_SELF,
  ADV_AVAILABILITY_DEFAULT,
  ADV_DASHBOARD_STATS,
  ADV_TODAY,
  type AvailabilityMode,
} from '../../data/advocateSide';
import { ADVOCATE_DEV_PREVIEWS } from '../../data/devPreviews';
import { advDashboard as t, colors, font, ink } from '../../constants/theme';

// Advocate dashboard (design/148).
//
// The availability toggle and the three preference chips are real local state. The
// stat figures and today's schedule come from data/advocateSide.ts and are static —
// see the earnings conflict noted at the top of that file for the ₹8,500.

const MODE_ICONS: Record<AvailabilityMode, typeof MessageSquare> = {
  chat: MessageSquare,
  voice: Phone,
  video: Video,
};

const MODE_LABELS: Record<AvailabilityMode, string> = {
  chat: 'Chat',
  voice: 'Voice',
  video: 'Video',
};

const STAT_ICONS: Record<string, typeof Landmark> = {
  hearings: Landmark,
  consultations: UsersRound,
  requests: FileText,
  earnings: IndianRupee,
};

const TONE: Record<string, string> = {
  brand: '#8A6F4B',
  green: '#1E9E4A',
  red: '#D64545',
};

export default function AdvocateDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [online, setOnline] = useState(ADV_AVAILABILITY_DEFAULT.online);
  const [modes, setModes] = useState<AvailabilityMode[]>(ADV_AVAILABILITY_DEFAULT.modes);

  const toggleMode = (m: AvailabilityMode) =>
    setModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + t.topGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.7)}>
              {ADVOCATE_SELF.standing}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push('/advocate/notifications')}
            style={styles.bell}
          >
            <Bell size={t.bellIcon} color={colors.textPrimary} />
            <View style={styles.bellDot} />
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{ADVOCATE_SELF.initials}</Text>
          </View>
        </View>

        <Text style={styles.greet}>Good Morning, {ADVOCATE_SELF.firstName}</Text>
        <Text style={styles.date}>
          Here&rsquo;s your schedule for today • {ADVOCATE_SELF.today}
        </Text>

        <View style={styles.card}>
          <View style={styles.availHead}>
            <Text style={styles.availLabel} {...shrinkToFit(0.75)}>
              CONSULTATION{'\n'}AVAILABILITY
            </Text>
            <View style={styles.toggle}>
              {[true, false].map((val) => {
                const on = online === val;
                return (
                  <Pressable
                    key={String(val)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setOnline(val)}
                    style={[styles.toggleItem, on && styles.toggleItemOn]}
                  >
                    {val && on && <View style={styles.toggleDot} />}
                    <Text style={[styles.toggleText, on && styles.toggleTextOn]} {...shrinkToFit(0.8)}>
                      {val ? 'Online' : 'Offline'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, !online && styles.statusDotOff]} />
            <Text style={styles.statusText} {...shrinkToFit(0.75)}>
              {online ? 'Online — accepting consultations' : 'Offline — not accepting consultations'}
            </Text>
          </View>
          <Text style={styles.body}>
            Clients can request instant Video, Voice &amp; Chat consultations.
          </Text>

          <View style={styles.rule} />

          <Text style={[styles.availLabel, styles.prefLabel]} {...shrinkToFit(0.75)}>
            CONSULTATION PREFERENCES
          </Text>
          <View style={styles.chips}>
            {(['chat', 'voice', 'video'] as AvailabilityMode[]).map((m) => {
              const on = modes.includes(m);
              const Icon = MODE_ICONS[m];
              return (
                <Pressable
                  key={m}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  onPress={() => toggleMode(m)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Icon size={t.chipIcon} color={on ? ink.onBrand : colors.textPrimary} />
                  <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.75)}>
                    {MODE_LABELS[m]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rule} />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/advocate/availability')}
            style={styles.manage}
          >
            <View style={styles.manageIcon}>
              <CalendarDays size={t.manageIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.manageText}>
              <Text style={styles.manageTitle} {...shrinkToFit(0.8)}>
                Manage Availability
              </Text>
              <Text style={styles.manageSub} {...shrinkToFit(0.8)}>
                Set dates and consultation hours
              </Text>
            </View>
            <ChevronRight size={t.manageChevron} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          {ADV_DASHBOARD_STATS.map((s) => {
            const Icon = STAT_ICONS[s.id] ?? FileText;
            return (
              <View key={s.id} style={styles.stat}>
                <View style={styles.statHead}>
                  <Text style={styles.statLabel} {...shrinkToFit(0.7)}>
                    {s.label}
                  </Text>
                  <View style={styles.statIcon}>
                    <Icon size={t.statIconGlyph} color={colors.brandDark} />
                  </View>
                </View>
                <Text style={styles.statValue} {...shrinkToFit(0.7)}>
                  {s.value}
                </Text>
                <View style={styles.statStatus}>
                  {s.tone !== 'brand' && (
                    <View style={[styles.statStatusDot, { backgroundColor: TONE[s.tone] }]} />
                  )}
                  <Text style={[styles.statStatusText, { color: TONE[s.tone] }]} {...shrinkToFit(0.7)}>
                    {s.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            TODAY&rsquo;S SCHEDULE
          </Text>
          <View style={styles.sectionChip}>
            <Text style={styles.sectionChipText} {...shrinkToFit(0.8)}>
              {ADV_TODAY.length} Events
            </Text>
          </View>
          {/* View All opens design/271's appointment calendar — the full schedule. */}
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => router.push('/advocate/calendar' as Href)}
            style={styles.viewAll}
          >
            <Text style={styles.viewAllText} {...shrinkToFit(0.8)}>
              View All
            </Text>
          </Pressable>
        </View>

        {ADV_TODAY.map((e) =>
          e.kind === 'hearing' ? (
            <View key={e.id} style={styles.event}>
              <View style={styles.eventHead}>
                <View style={styles.timePill}>
                  <Text style={styles.timePillText} {...shrinkToFit(0.8)}>
                    {e.time}
                  </Text>
                </View>
                <Landmark size={t.typeIcon} color={t.typeColour} style={styles.typeIcon} />
                <Text style={styles.typeText} {...shrinkToFit(0.75)}>
                  {e.type}
                </Text>
                <View style={styles.state}>
                  <Text style={styles.stateText} {...shrinkToFit(0.7)}>
                    {e.state}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventTitle} {...shrinkToFit(0.75)}>
                {e.title}
              </Text>
              <View style={styles.eventMeta}>
                <MapPin size={t.eventMetaIcon} color={colors.textBody} />
                <Text style={styles.eventMetaText} {...shrinkToFit(0.75)}>
                  {e.location}
                </Text>
              </View>
            </View>
          ) : (
            <View key={e.id} style={styles.event}>
              <View style={styles.eventHead}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeBlockText}>{e.time}</Text>
                  <Text style={styles.timeBlockText}>{e.meridiem}</Text>
                </View>
                {e.mode === 'video' ? (
                  <Video size={t.typeIcon} color={t.typeColour} style={styles.typeIcon} />
                ) : (
                  <Phone size={t.typeIcon} color={t.typeColour} style={styles.typeIcon} />
                )}
                <Text style={styles.typeText} {...shrinkToFit(0.7)}>
                  {e.modeLabel}
                </Text>
                <Text style={styles.duration} {...shrinkToFit(0.7)}>
                  • {e.duration}
                </Text>
                <View style={styles.state}>
                  <Text style={styles.stateText} {...shrinkToFit(0.7)}>
                    {e.state}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventTitle} {...shrinkToFit(0.75)}>
                {e.client}
              </Text>
              <View style={styles.eventMeta}>
                {/* design/148 uses a document glyph on the second card and an info
                    glyph on the third; one subject icon is used for both. */}
                <FileText size={t.eventMetaIcon} color={colors.textBody} />
                <Text style={styles.eventMetaText} {...shrinkToFit(0.75)}>
                  {e.subject}
                </Text>
              </View>
            </View>
          ),
        )}
        <DevPreviewLinks groups={ADVOCATE_DEV_PREVIEWS} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX, paddingBottom: 130 },

  headerRow: { flexDirection: 'row', alignItems: 'center' },
  pill: {
    flexShrink: 1,
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
    backgroundColor: '#1E9E4A',
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: t.pillColour,
  },
  bell: {
    marginLeft: 'auto',
    width: t.bell,
    height: t.bell,
    borderRadius: t.bell / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    right: 5,
    top: 5,
    width: t.bellDot,
    height: t.bellDot,
    borderRadius: t.bellDot / 2,
    backgroundColor: '#D64545',
  },
  avatar: {
    marginLeft: t.bellGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },

  greet: {
    marginTop: t.greetGap,
    fontFamily: font.appHeading,
    fontSize: t.greetSize,
    lineHeight: t.greetLineHeight,
    color: colors.textPrimary,
  },
  date: {
    marginTop: t.dateGap,
    fontFamily: font.appBody,
    fontSize: t.dateSize,
    lineHeight: t.dateLineHeight,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  availHead: { flexDirection: 'row', alignItems: 'flex-start' },
  availLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.availLabelSize,
    letterSpacing: t.availLabelSpacing,
    color: colors.textBody,
  },
  prefLabel: { flex: 0, marginTop: t.prefGap, marginRight: 0 },
  toggle: {
    minHeight: t.toggleHeight,
    borderRadius: t.toggleRadius,
    paddingHorizontal: t.togglePadX,
    backgroundColor: t.toggleBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItem: {
    minHeight: t.toggleItemH,
    borderRadius: t.toggleItemRadius,
    paddingHorizontal: t.toggleItemPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleItemOn: { backgroundColor: t.toggleOnBg },
  toggleDot: {
    width: t.toggleDot,
    height: t.toggleDot,
    borderRadius: t.toggleDot / 2,
    marginRight: t.toggleDotGap,
    backgroundColor: ink.onBrand,
  },
  toggleText: { fontFamily: font.appSemi, fontSize: t.toggleSize, color: colors.textBody },
  toggleTextOn: { color: ink.onBrand },

  statusRow: { marginTop: t.statusGap, flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
    backgroundColor: '#1E9E4A',
  },
  statusDotOff: { backgroundColor: colors.textMuted },
  statusText: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.statusSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.rule },

  chips: { marginTop: t.chipGap, flexDirection: 'row', gap: t.chipColGap },
  chip: {
    flex: 1,
    minWidth: 0,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  chipOn: { backgroundColor: t.chipOnBg },
  chipText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: colors.textPrimary,
  },
  chipTextOn: { color: ink.onBrand },

  manage: { marginTop: t.manageGap, flexDirection: 'row', alignItems: 'center' },
  manageIcon: {
    width: t.manageIcon,
    height: t.manageIcon,
    borderRadius: t.manageIconRadius,
    backgroundColor: t.manageIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageText: { flex: 1, minWidth: 0, marginLeft: t.manageIconGap, marginRight: 8 },
  manageTitle: {
    fontFamily: font.appHeading,
    fontSize: t.manageTitleSize,
    color: colors.textPrimary,
  },
  manageSub: {
    marginTop: t.manageSubGap,
    fontFamily: font.appBody,
    fontSize: t.manageSubSize,
    color: colors.textBody,
  },

  grid: {
    marginTop: t.gridGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.gridColGap,
    rowGap: t.gridRowGap,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 140,
    maxWidth: '48%',
    borderRadius: t.statRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.statPad,
  },
  statHead: { flexDirection: 'row', alignItems: 'flex-start' },
  statLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.statLabelSize,
    letterSpacing: t.statLabelSpacing,
    lineHeight: t.statLabelLineHeight,
    color: colors.textBody,
  },
  statIcon: {
    width: t.statIcon,
    height: t.statIcon,
    borderRadius: t.statIconRadius,
    backgroundColor: t.statIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statStatus: { marginTop: t.statStatusGap, flexDirection: 'row', alignItems: 'center' },
  statStatusDot: {
    width: t.statStatusDot,
    height: t.statStatusDot,
    borderRadius: t.statStatusDot / 2,
    marginRight: t.statStatusDotGap,
  },
  statStatusText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.statStatusSize },

  sectionRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'center' },
  section: {
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textPrimary,
  },
  sectionChip: {
    marginLeft: t.sectionChipGap,
    minHeight: t.sectionChipHeight,
    borderRadius: t.sectionChipRadius,
    paddingHorizontal: t.sectionChipPadX,
    backgroundColor: t.sectionChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionChipText: { fontFamily: font.appBody, fontSize: t.sectionChipSize, color: colors.textBody },
  viewAll: { marginLeft: 'auto' },
  viewAllText: { fontFamily: font.appBody, fontSize: t.viewAllSize, color: colors.brandDark },

  event: {
    marginTop: t.eventGap,
    borderRadius: t.eventRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.eventPad,
  },
  eventHead: { flexDirection: 'row', alignItems: 'center' },
  timePill: {
    minHeight: t.timePillHeight,
    borderRadius: t.timePillRadius,
    borderWidth: 1,
    borderColor: t.timePillBorder,
    paddingHorizontal: t.timePillPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePillText: {
    fontFamily: font.appHeading,
    fontSize: t.timePillSize,
    color: colors.textPrimary,
  },
  timeBlock: {
    width: t.timeBlockW,
    minHeight: t.timeBlockH,
    borderRadius: t.timeBlockRadius,
    borderWidth: 1,
    borderColor: t.timeBlockBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlockText: {
    fontFamily: font.appHeading,
    fontSize: t.timeBlockSize,
    color: colors.textPrimary,
  },
  typeIcon: { marginLeft: t.typeGap },
  typeText: {
    marginLeft: t.typeIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.typeSize,
    color: t.typeColour,
  },
  duration: {
    marginLeft: t.durationGap,
    fontFamily: font.appBody,
    fontSize: t.durationSize,
    color: colors.textBody,
  },
  state: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.stateHeight,
    borderRadius: t.stateRadius,
    paddingHorizontal: t.statePadX,
    backgroundColor: t.stateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    fontFamily: font.appSemi,
    fontSize: t.stateSize,
    letterSpacing: t.stateSpacing,
    color: t.stateColour,
  },
  eventTitle: {
    marginTop: t.eventTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.eventTitleSize,
    color: colors.textPrimary,
  },
  eventMeta: { marginTop: t.eventMetaGap, flexDirection: 'row', alignItems: 'center' },
  eventMetaText: {
    marginLeft: t.eventMetaIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.eventMetaSize,
    color: colors.textBody,
  },
});
