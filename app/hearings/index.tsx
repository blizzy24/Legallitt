import { router } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HearingListCard from '../../components/HearingListCard';
import ListHeader from '../../components/ListHeader';
import SegmentedControl, { type Segment } from '../../components/SegmentedControl';
import { colors, font, hearings as h, space } from '../../constants/theme';
import { HEARINGS, type HearingStatus } from '../../data/cases';

const SEGMENTS: Segment<HearingStatus>[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const HEADINGS: Record<HearingStatus, string> = {
  upcoming: 'Upcoming Hearings',
  completed: 'Completed Hearings',
  cancelled: 'Cancelled Hearings',
};

export default function AllHearingsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<HearingStatus>('upcoming');

  const list = HEARINGS.filter((x) => x.status === tab).sort((a, b) => a.date.localeCompare(b.date));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/cases');
  };

  return (
    <View style={styles.screen}>
      {/* Calendar view is not designed yet. */}
      <ListHeader
        title="All Hearings"
        rightIcon={CalendarDays}
        rightLabel="Calendar"
        onBack={goBack}
        paddingTop={h.top}
        // This screen never set one; the content's own top padding carries the gap.
        paddingBottom={0}
        titleSize={h.titleSize}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: h.cardGap + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Keep track of your upcoming and past hearings.</Text>

        <SegmentedControl
          segments={SEGMENTS}
          value={tab}
          onChange={setTab}
          style={styles.segmented}
        />

        <View style={styles.heading}>
          <Text style={styles.headingText}>{HEADINGS[tab]}</Text>
          <View style={styles.spacer} />
          <View style={styles.count}>
            <Text style={styles.countText}>
              {list.length} {list.length === 1 ? 'hearing' : 'hearings'}
            </Text>
          </View>
        </View>

        {list.map((hearing, i) => (
          <View key={hearing.id} style={i === 0 ? undefined : styles.cardSpacing}>
            <HearingListCard
              hearing={hearing}
              onPress={() => router.push(`/hearings/${hearing.id}`)}
            />
          </View>
        ))}

        {list.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No {tab} hearings</Text>
            <Text style={styles.emptyText}>
              {tab === 'completed'
                ? 'Hearings that have taken place will be listed here.'
                : 'Hearings that get cancelled will be listed here.'}
            </Text>
          </View>
        )}
      </ScrollView>
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
  subtitle: {
    marginTop: h.subtitleGap,
    fontFamily: font.appBody,
    fontSize: h.subtitleSize,
    color: colors.textBody,
  },
  segmented: {
    marginTop: h.segGap,
    height: h.segHeight,
    borderRadius: h.segRadius,
  },
  heading: {
    marginTop: h.headingGap,
    marginBottom: h.headingBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingText: {
    fontFamily: font.appHeading,
    fontSize: h.headingSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  count: {
    height: h.countHeight,
    borderRadius: h.countHeight / 2,
    paddingHorizontal: h.countPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: font.appBody,
    fontSize: h.countText,
    color: colors.textBody,
  },
  cardSpacing: {
    marginTop: h.cardGap,
  },
  empty: {
    marginTop: h.cardGap,
    alignItems: 'center',
    paddingVertical: h.headingGap * 2,
  },
  emptyTitle: {
    fontFamily: font.appSemi,
    fontSize: h.cardTitleSize,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: h.courtSize,
    color: colors.textBody,
    textAlign: 'center',
  },
});
