import DemoPressable from '../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Building2,
  Check,
  ChevronRight,
  MessageSquare,
  MoreVertical,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListHeader from '../../components/ListHeader';
import StatusPill from '../../components/StatusPill';
import { colors, font, hearings as h, ink, space, status } from '../../constants/theme';
import {
  calendarParts,
  daysUntil,
  getAdvocate,
  getCase,
  getHearing,
} from '../../data/cases';

export default function HearingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const hearing = getHearing(id);
  const c = hearing ? getCase(hearing.caseId) : undefined;
  const advocate = c ? getAdvocate(c.advocateId) : undefined;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/hearings');
  };

  if (!hearing || !c) {
    return (
      <View style={[styles.screen, styles.centre, { paddingTop: insets.top + h.top }]}>
        <Text style={styles.emptyTitle}>Hearing not found</Text>
        <Text style={styles.emptyText}>No hearing matches {id}.</Text>
      </View>
    );
  }

  const cal = calendarParts(hearing.date);
  const days = daysUntil(hearing.date);
  const openCase = () => router.push(`/cases/${c.id}`);

  return (
    <View style={styles.screen}>
      {/* Kebab has no menu yet. */}
      <ListHeader
        title="Hearing Details"
        rightIcon={MoreVertical}
        rightLabel="More options"
        onBack={goBack}
        paddingTop={h.top}
        // Was `h.subtitleGap + 7`, arithmetic on a card's subtitle gap. Same 20pt,
        // stated explicitly — derived, not measured.
        paddingBottom={20}
        titleSize={h.detailTitleSize}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: h.barPadTop + h.barButtonHeight + h.barPadBottom + h.cardGap + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.pills}>
            <StatusPill label={c.categoryLabel} />
            <StatusPill label="Upcoming" tone="active" dot />
            {days > 0 && <StatusPill label={`${days} days remaining`} />}
          </View>

          <Text style={styles.heroTitle}>{c.title}</Text>
          <View style={styles.courtRow}>
            <Building2 size={h.courtIcon} color={ink.accent} />
            <Text style={styles.courtText} numberOfLines={1}>
              {c.court} • {c.state}
            </Text>
          </View>

          <View style={styles.sched}>
            <View style={styles.calTile}>
              <Text style={styles.calMonth}>{cal.month}</Text>
              <Text style={styles.calDay}>{cal.day}</Text>
            </View>
            <View style={styles.schedText}>
              <Text style={styles.schedLabel}>Hearing Schedule</Text>
              <View style={styles.schedValueRow}>
                <Text style={styles.schedValue}>{hearing.time}</Text>
                {/* The PNG drops this dot below the text baseline; centred here. */}
                <View style={styles.schedDot} />
                <Text style={styles.schedValue}>{hearing.courtroom}</Text>
              </View>
            </View>
            <View style={styles.bench}>
              <Text style={styles.benchText}>{hearing.bench}</Text>
            </View>
          </View>
        </View>

        {advocate && (
          <View style={[styles.card, styles.cardSpacing]}>
            <View style={styles.advocateHead}>
              <Text style={styles.sectionLabel}>ASSIGNED ADVOCATE</Text>
              <View style={styles.spacer} />
              {advocate.verified && (
                <View style={styles.verifiedPill}>
                  <Check size={h.refLabelSize + 2} color={status.active} strokeWidth={3} />
                  <Text style={styles.verifiedText}>Verified Advocate</Text>
                </View>
              )}
            </View>

            <View style={styles.advocateRow}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{advocate.initials}</Text>
              </View>
              <View style={styles.advocateText}>
                <Text style={styles.advocateName}>{advocate.name}</Text>
                <Text style={styles.advocateMeta}>
                  {advocate.barCouncil} • {advocate.experience}
                </Text>
              </View>
              {/* Message has no destination yet. */}
              <Pressable onPress={() => router.push('/chat/advocate' as Href)} accessibilityRole="button" style={styles.messageButton}>
                <MessageSquare size={h.bodySize} color={ink.accent} />
                <Text style={styles.messageText}>Message</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={[styles.card, styles.cardTight, styles.cardSpacing]}>
          <Text style={styles.sectionTitle}>About This Hearing</Text>
          {hearing.about && <Text style={styles.body}>{hearing.about}</Text>}

          {(hearing.stage || hearing.advocateNote) && <View style={styles.divider} />}

          {hearing.stage && (
            <ListItem index={1} label="Stage:" text={hearing.stage} />
          )}
          {hearing.advocateNote && (
            <ListItem index={2} label="Advocate Note:" text={hearing.advocateNote} spaced />
          )}
        </View>

        <View style={[styles.card, styles.cardTight, styles.cardSpacing]}>
          <View style={styles.refHead}>
            <Text style={styles.sectionTitle}>Case Reference</Text>
            <View style={styles.spacer} />
            <Text style={styles.refMatter}>Matter #{c.id.split('-').slice(1, 3).join('-')}</Text>
          </View>

          <View style={styles.refBoxes}>
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>CASE NUMBER</Text>
              <Text
                style={styles.refValueMono}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {c.id}
              </Text>
            </View>
            <View style={styles.refBox}>
              <Text style={styles.refLabel}>FILING COURT</Text>
              <Text
                style={styles.refValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {c.city} Civil Court
              </Text>
            </View>
          </View>

          <Pressable accessibilityRole="link" onPress={openCase} style={styles.refRow}>
            <Text style={styles.refRowText}>Explore Complete Case History</Text>
            <View style={styles.spacer} />
            <ChevronRight size={h.linkSize + 2} color={colors.textBody} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: h.barPadBottom + insets.bottom }]}>
        {/* Contact Advocate has no destination yet. */}
        <DemoPressable onPress={() => router.push('/chat/advocate' as Href)} accessibilityRole="button" style={[styles.barButton, styles.barButtonLight]}>
          <Text style={styles.barButtonLightText}>Contact Advocate</Text>
        </DemoPressable>
        <Pressable accessibilityRole="button" onPress={openCase} style={[styles.barButton, styles.barButtonBrand]}>
          <Text style={styles.barButtonBrandText}>View Case File</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ListItem({
  index,
  label,
  text,
  spaced,
}: {
  index: number;
  label: string;
  text: string;
  spaced?: boolean;
}) {
  return (
    <View style={[styles.listItem, spaced && styles.listItemSpaced]}>
      <View style={styles.listNum}>
        <Text style={styles.listNumText}>{index}</Text>
      </View>
      <Text style={styles.listText}>
        <Text style={styles.listLabel}>{label} </Text>
        {text}
      </Text>
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
  card: {
    borderRadius: h.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: h.cardPad,
  },
  cardTight: {
    padding: h.cardPadTight,
  },
  cardSpacing: {
    marginTop: h.cardGap + 6,
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    marginTop: h.cardTitleGap,
    fontFamily: font.appSemi,
    fontSize: h.heroTitleSize,
    color: colors.textPrimary,
  },
  courtRow: {
    marginTop: h.courtGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: h.courtIconGap,
  },
  courtText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: h.courtSize,
    color: colors.textBody,
  },
  sched: {
    marginTop: h.schedGap,
    borderRadius: h.schedRadius,
    backgroundColor: colors.appBg,
    padding: h.schedPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calTile: {
    width: h.calTile,
    height: h.calTile,
    borderRadius: h.calTileRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonth: {
    fontFamily: font.appSemi,
    fontSize: h.calMonthSize,
    letterSpacing: 0.5,
    color: ink.accent,
  },
  calDay: {
    fontFamily: font.appHeading,
    fontSize: h.calDaySize,
    color: colors.textPrimary,
  },
  schedText: {
    flex: 1,
    minWidth: 0,
    marginLeft: h.schedPad,
  },
  schedLabel: {
    fontFamily: font.appBody,
    fontSize: h.schedLabelSize,
    color: colors.textBody,
  },
  schedValueRow: {
    marginTop: h.advocateLabelGap,
    flexDirection: 'row',
    alignItems: 'center',
    // Wraps rather than truncating when the bench label is long or the screen narrow.
    flexWrap: 'wrap',
    gap: h.schedDotGap,
  },
  schedValue: {
    fontFamily: font.appSemi,
    fontSize: h.schedValueSize,
    color: colors.textPrimary,
  },
  schedDot: {
    width: h.schedDot,
    height: h.schedDot,
    borderRadius: h.schedDot / 2,
    backgroundColor: colors.brand,
  },
  bench: {
    marginLeft: h.schedDotGap,
    height: h.benchHeight + 4,
    borderRadius: 8,
    paddingHorizontal: h.benchPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benchText: {
    fontFamily: font.appBody,
    fontSize: h.benchText,
    color: colors.textBody,
  },

  // Advocate card
  advocateHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: font.appSemi,
    fontSize: h.advocateLabelSize,
    letterSpacing: 0.6,
    color: colors.textBody,
  },
  verifiedPill: {
    height: h.benchHeight - 2.4,
    borderRadius: (h.benchHeight - 2.4) / 2,
    paddingHorizontal: 9,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontFamily: font.appSemi,
    fontSize: h.refLabelSize + 1.5,
    color: status.active,
  },
  advocateRow: {
    marginTop: h.schedGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: h.calTile,
    height: h.calTile,
    borderRadius: h.calTile / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: h.schedPad,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: h.advocateNameSize,
    color: ink.accent,
  },
  advocateText: {
    flex: 1,
    minWidth: 0,
  },
  advocateName: {
    fontFamily: font.appSemi,
    fontSize: h.schedValueSize,
    color: colors.textPrimary,
  },
  advocateMeta: {
    marginTop: h.advocateLabelGap,
    fontFamily: font.appBody,
    fontSize: h.bodySize,
    color: colors.textBody,
  },
  messageButton: {
    marginLeft: h.schedDotGap,
    height: h.refRowHeight - 10,
    borderRadius: 10,
    paddingHorizontal: 11,
    backgroundColor: colors.appBg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  messageText: {
    fontFamily: font.appSemi,
    fontSize: h.bodySize,
    color: ink.accent,
  },

  // About this hearing
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: h.sectionTitleSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: h.sectionGap,
    fontFamily: font.appBody,
    fontSize: h.bodySize,
    lineHeight: h.bodyLineHeight,
    color: colors.textBody,
  },
  divider: {
    marginTop: h.sectionGap,
    height: 1,
    backgroundColor: colors.border,
  },
  listItem: {
    marginTop: h.listGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItemSpaced: {
    marginTop: h.listGap - 4,
  },
  listNum: {
    width: h.listNumSize,
    height: h.listNumSize,
    borderRadius: h.listNumSize / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: h.listTextGap,
  },
  listNumText: {
    fontFamily: font.appSemi,
    fontSize: h.listNumText,
    color: ink.accent,
  },
  listText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: h.bodySize,
    lineHeight: h.bodyLineHeight,
    color: colors.textBody,
  },
  listLabel: {
    fontFamily: font.appSemi,
    color: colors.textPrimary,
  },

  // Case reference
  refHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refMatter: {
    fontFamily: font.appSemi,
    fontSize: h.bodySize,
    color: ink.accent,
  },
  refBoxes: {
    marginTop: h.sectionGap,
    flexDirection: 'row',
    gap: h.refBoxGap,
  },
  refBox: {
    flex: 1,
    minWidth: 0,
    borderRadius: h.refBoxRadius,
    backgroundColor: colors.appBg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: h.refBoxPad,
  },
  refLabel: {
    fontFamily: font.appSemi,
    fontSize: h.refLabelSize,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  refValue: {
    marginTop: h.advocateLabelGap + 2,
    fontFamily: font.appSemi,
    fontSize: h.refValueSize,
    color: colors.textPrimary,
  },
  refValueMono: {
    marginTop: h.advocateLabelGap + 2,
    fontFamily: font.mono,
    fontSize: h.refValueSize,
    color: colors.textPrimary,
  },
  refRow: {
    marginTop: h.refRowGap,
    height: h.refRowHeight,
    borderRadius: h.refBoxRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: h.refBoxPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refRowText: {
    fontFamily: font.appSemi,
    fontSize: h.refValueSize + 0.5,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },

  // Fixed bottom bar
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: h.barPadX,
    paddingTop: h.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: h.barGap,
  },
  barButton: {
    flex: 1,
    minWidth: 0,
    height: h.barButtonHeight,
    borderRadius: h.barButtonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barButtonLight: {
    backgroundColor: colors.iconChipBg,
  },
  barButtonBrand: {
    backgroundColor: colors.brand,
  },
  barButtonLightText: {
    fontFamily: font.appSemi,
    fontSize: h.barButtonText,
    color: ink.accent,
  },
  barButtonBrandText: {
    fontFamily: font.appSemi,
    fontSize: h.barButtonText,
    color: ink.onBrand,
  },
  emptyTitle: {
    fontFamily: font.appSemi,
    fontSize: h.cardTitleSize,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: h.bodySize,
    color: colors.textBody,
    textAlign: 'center',
  },
});
