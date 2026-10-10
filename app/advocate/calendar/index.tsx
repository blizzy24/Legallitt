import { router, type Href } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  MessageSquare,
  Phone,
  Plus,
  Video,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MonthGrid from '../../../components/MonthGrid';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_CALENDAR } from '../../../data/advocateTools';
import { advCalendar as t, colors, font, ink } from '../../../constants/theme';

// Advocate — appointment calendar (design/271).
//
// ⚠⚠ THE MONTH GRID IS THE ONE PLACE IN THIS BATCH WHERE THE EXPORT IS
// OVERRIDDEN, ON INSTRUCTION. design/271 places 1 August 2026 under FRI — it is
// a SATURDAY — and its trailing row reads 31, 1, 2, 3, 2, 3, 4, repeating the 2
// and the 3. That is not a possible month, so it cannot be copied. The numbers
// are computed from the displayed month and the chevrons move between months.
// Cell size, weekday header, selected-day circle, dot markers, muted
// leading/trailing days and typography all still match the export exactly.
// See components/MonthGrid.tsx. DO NOT "fix" this back to the PNG.
//
// EVERYTHING ELSE ON THIS SCREEN IS AS DRAWN, INCLUDING ITS ERRORS:
// ⚠ Note 6 — two appointments at "12:00 AM" (Akash Sinha, Priya Mehta). Both
//   are plainly midday.
// ⚠ Note 7 — a 9:00 AM court hearing listed AFTER the two 12:00 AM entries.
//   The schedule is not in chronological order.
// ⚠ Note 14 — the Akash Sinha row draws a PHONE icon beside the text "Video
//   Consultation".
// ⚠ Note 9 — Manage Availability labels Sunday "San". The month-grid header
//   above it spells SUN correctly, so only that row is wrong.
//
// STATIC, NOT WIRED: the availability toggle does not toggle, "Join
// Consultation" has no calling vendor behind it (none is scoped), "Add
// Availability" and "Edit Hours" open nothing, and the day circles do not
// select. "Add Hearing" navigates and nothing else.

export default function AdvocateCalendarScreen() {
  const insets = useSafeAreaInsets();
  const d = AT_CALENDAR;
  const [view, setView] = useState({ year: d.year, month: d.month });

  const monthLabel = new Date(Date.UTC(view.year, view.month, 1)).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const shift = (by: number) => {
    const m = view.month + by;
    setView({ year: view.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 });
  };
  const sameMonth = view.year === d.year && view.month === d.month;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={t.ink} strokeWidth={2.6} style={styles.back} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <MessageSquare size={t.headerGlyph} color={t.ink} strokeWidth={2} />
        <Bell size={t.headerGlyph} color={t.ink} strokeWidth={2} style={styles.bell} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avail}>
          <View style={styles.availCol}>
            <Text style={styles.availTitle} {...shrinkToFit(0.8)}>
              {d.availability.title}
            </Text>
            <View style={styles.availRow}>
              <CircleCheck size={t.availGlyph} color="#FFFFFF" fill={t.availOnColour} strokeWidth={2} />
              <Text style={styles.availOn} {...shrinkToFit(0.8)}>
                {d.availability.on}
              </Text>
            </View>
            <Text style={styles.availSub}>{d.availability.sub}</Text>
          </View>
          <View style={styles.toggle}>
            <View style={styles.knob} />
          </View>
        </View>

        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={10} onPress={() => shift(-1)}>
            <ChevronLeft size={t.monthGlyph} color={t.ink} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.month} {...shrinkToFit(0.8)}>
            {monthLabel}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Next month" hitSlop={10} onPress={() => shift(1)}>
            <ChevronRight size={t.monthGlyph} color={t.ink} strokeWidth={2.4} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          <MonthGrid
            year={view.year}
            month={view.month}
            selected={sameMonth ? d.selected : -1}
            marked={sameMonth ? d.marked : []}
          />
        </View>

        <View style={styles.rule} />

        {/*
          design/271 centres "+ Add Availability" against BOTH lines of the
          heading, not against "Today's Schedule" alone: its pill runs
          464.0–482.0pt where the two lines run 456.5–486.0pt.
        */}
        <View style={styles.schedRow}>
          <View style={styles.schedCol}>
            <Text style={styles.today}>{d.todayLabel}</Text>
            <Text style={styles.sched}>{d.scheduleLabel}</Text>
          </View>
          <View style={styles.add}>
            <Plus size={t.addGlyph} color={t.brand} strokeWidth={2.4} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {d.addAvailability}
            </Text>
          </View>
        </View>

        {d.appointments.map((ap, i) => (
          <View key={`${ap.name}-${i}`} style={[styles.appt, { marginTop: i === 0 ? t.apptTop : t.apptGap }]}>
            <View style={styles.time}>
              <Text style={styles.timeText} {...shrinkToFit(0.8)}>
                {ap.time}
              </Text>
            </View>
            <View style={styles.apptCol}>
              {ap.tag ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText} {...shrinkToFit(0.8)}>
                    {ap.tag}
                  </Text>
                </View>
              ) : null}
              <Text
                style={[styles.apptName, ap.longName && styles.apptNameLong]}
                {...shrinkToFit(0.75)}
              >
                {ap.name}
              </Text>
              <Text style={styles.apptMatter} {...shrinkToFit(0.8)}>
                {ap.matter}
              </Text>
              <Text style={styles.apptMeta} {...shrinkToFit(0.8)}>
                {ap.meta}
              </Text>
            </View>
            {ap.icon ? (
              ap.icon === 'phone' ? (
                <Phone
                  size={t.apptIcon}
                  color={t.apptIconColour}
                  fill={t.apptIconColour}
                  strokeWidth={1.5}
                  style={styles.apptIcon}
                />
              ) : (
                // design/271 draws the video camera as an OUTLINE and the
                // telephone SOLID, in the same brown.
                <Video
                  size={t.apptIcon}
                  color={t.apptIconColour}
                  strokeWidth={2}
                  style={styles.apptIcon}
                />
              )
            ) : null}
            <View style={[styles.apptStatus, ap.upcoming && styles.apptStatusUpcoming]}>
              <Text
                style={[styles.apptStatusText, ap.upcoming && styles.apptStatusTextUpcoming]}
                {...shrinkToFit(0.8)}
              >
                {ap.status}
              </Text>
            </View>
            <ChevronRight
              size={t.apptChevron}
              color={t.apptChevronColour}
              strokeWidth={2.2}
              style={styles.apptChev}
            />
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.addHearing, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/calendar/add-hearing' as Href)}
        >
          <Plus size={t.addHearingGlyph} color={ink.onBrand} strokeWidth={2.4} />
          <Text style={styles.addHearingText} {...shrinkToFit(0.8)}>
            {d.addHearing}
          </Text>
        </Pressable>

        <View style={styles.manage}>
          <Text style={styles.manageTitle} {...shrinkToFit(0.8)}>
            {d.manage.title}
          </Text>
          <View style={styles.dayRow}>
            {d.manage.days.map((day) => (
              <View key={day.label} style={[styles.dayCircle, day.on && styles.dayCircleOn]}>
                <Text style={[styles.dayText, day.on && styles.dayTextOn]} {...shrinkToFit(0.75)}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.manageRule} />
          <View style={styles.hoursRow}>
            <View style={styles.availCol}>
              <Text style={styles.hoursTitle} {...shrinkToFit(0.8)}>
                {d.manage.hoursTitle}
              </Text>
              <Text style={styles.hoursValue} {...shrinkToFit(0.8)}>
                {d.manage.hours}
              </Text>
            </View>
            <View style={styles.edit}>
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {d.manage.edit}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    height: t.headerH,
    backgroundColor: t.headerBg,
  },
  title: {
    flex: 1,
    marginLeft: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: t.ink,
  },
  back: { marginLeft: -t.backHang },
  bell: { marginLeft: t.headerGlyphGap },

  content: { paddingBottom: 30 },

  avail: {
    marginTop: t.availTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.availRadius,
    paddingHorizontal: t.availPadX,
    paddingTop: t.availPadTop,
    paddingBottom: t.availPadBottom,
  },
  availCol: { flex: 1 },
  availTitle: {
    fontFamily: font.appHeading,
    fontSize: t.availTitleSize,
    lineHeight: t.availTitleLine,
    color: t.ink,
  },
  availRow: { marginTop: t.availRowTop, flexDirection: 'row', alignItems: 'center' },
  availOn: {
    marginLeft: t.availGap,
    fontFamily: font.appHeading,
    fontSize: t.availOnSize,
    lineHeight: t.availOnLine,
    color: t.availOnColour,
  },
  availSub: {
    marginTop: t.availSubTop,
    fontFamily: font.appBody,
    fontSize: t.availSubSize,
    lineHeight: t.availSubLine,
    maxWidth: t.availSubW,
    color: t.ink,
  },
  toggle: {
    marginLeft: t.availGap,
    width: t.toggleW,
    height: t.toggleH,
    borderRadius: t.toggleH / 2,
    backgroundColor: t.toggleOn,
    padding: t.togglePad,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  knob: {
    width: t.toggleKnob,
    height: t.toggleKnob,
    borderRadius: t.toggleKnob / 2,
    backgroundColor: '#FFFFFF',
  },

  monthRow: {
    marginTop: t.monthTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: { fontFamily: font.appHeading, fontSize: t.monthSize, color: t.ink },
  grid: { marginTop: t.gridTop },

  rule: {
    marginTop: t.ruleTop,
    marginHorizontal: t.padX,
    height: 1,
    backgroundColor: t.rule,
  },
  schedRow: {
    marginTop: t.todayTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  schedCol: { flex: 1 },
  today: { fontFamily: font.appBody, fontSize: t.todaySize, color: t.ink },
  sched: {
    marginTop: t.schedTop,
    fontFamily: font.appHeading,
    fontSize: t.schedSize,
    color: t.ink,
  },
  add: {
    width: t.addW,
    height: t.addH,
    borderRadius: t.addRadius,
    borderWidth: 1,
    borderColor: t.addBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { marginLeft: t.addGap, fontFamily: font.appBody, fontSize: t.addSize, color: t.brand },

  appt: {
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.apptBg,
    borderRadius: t.apptRadius,
    paddingHorizontal: t.apptPadX,
    height: t.apptH,
  },
  time: {
    width: t.timeW,
    height: t.timeH,
    borderRadius: t.timeRadius,
    backgroundColor: t.timeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.apptGapX,
  },
  timeText: {
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.timeSize,
    lineHeight: t.timeLine,
    color: t.ink,
  },
  apptCol: { flex: 1 },
  tag: {
    alignSelf: 'flex-start',
    height: t.apptTagH,
    borderRadius: t.apptTagRadius,
    paddingHorizontal: t.apptTagPadX,
    backgroundColor: t.apptTagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: { fontFamily: font.appSemi, fontSize: t.apptTagSize, color: t.apptTagColour },
  apptName: {
    marginTop: t.apptNameTop,
    fontFamily: font.appHeading,
    fontSize: t.apptNameSize,
    lineHeight: t.apptNameLine,
    color: t.ink,
  },
  apptNameLong: { fontSize: t.apptNameSizeLong, lineHeight: t.apptNameLineLong },
  apptMatter: {
    marginTop: t.apptMatterTop,
    fontFamily: font.appSemi,
    fontSize: t.apptMatterSize,
    lineHeight: t.apptMatterLine,
    color: t.apptMatterColour,
  },
  apptMeta: {
    marginTop: t.apptMetaTop,
    fontFamily: font.appBody,
    fontSize: t.apptMetaSize,
    lineHeight: t.apptMetaLine,
    color: t.ink,
  },
  apptIcon: { marginLeft: t.apptIconGap },
  apptStatus: {
    marginLeft: t.apptIconGap,
    height: t.apptStatusH,
    borderRadius: t.apptStatusRadius,
    paddingHorizontal: t.apptStatusPadX,
    backgroundColor: t.apptStatusBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apptStatusUpcoming: { backgroundColor: t.apptTagBg },
  apptStatusText: { fontFamily: font.appBody, fontSize: t.apptStatusSize, color: t.apptStatusColour },
  apptStatusTextUpcoming: { color: t.apptTagColour },
  apptChev: { marginLeft: t.apptStatusGap },

  addHearing: {
    marginTop: t.addHearingTop,
    marginHorizontal: t.padX,
    height: t.addHearingH,
    borderRadius: t.addHearingRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  addHearingText: {
    marginLeft: t.addHearingGap,
    fontFamily: font.appHeading,
    fontSize: t.addHearingSize,
    color: ink.onBrand,
  },

  manage: {
    marginTop: t.manageTop,
    marginHorizontal: t.padX,
    backgroundColor: t.manageBg,
    borderRadius: t.manageRadius,
    paddingHorizontal: t.managePadX,
    paddingTop: t.managePadTop,
    paddingBottom: t.managePadBottom,
  },
  manageTitle: { fontFamily: font.appHeading, fontSize: t.manageTitleSize, color: t.ink },
  dayRow: {
    marginTop: t.dayCircleTop,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: t.dayCircle,
    height: t.dayCircle,
    borderRadius: t.dayCircle / 2,
    borderWidth: 1,
    borderColor: t.dayCircleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleOn: { backgroundColor: t.dayCircleOn, borderColor: t.dayCircleOn },
  dayText: { fontFamily: font.appBody, fontSize: t.dayCircleSize, color: t.dayCircleOff },
  dayTextOn: { color: ink.onBrand },
  manageRule: { marginTop: t.manageRuleTop, height: 1, backgroundColor: t.rule },
  hoursRow: { marginTop: t.hoursTop, flexDirection: 'row', alignItems: 'center' },
  hoursTitle: { fontFamily: font.appHeading, fontSize: t.hoursTitleSize, color: t.ink },
  hoursValue: {
    marginTop: t.hoursValueTop,
    fontFamily: font.appBody,
    fontSize: t.hoursValueSize,
    color: t.ink,
  },
  edit: {
    width: t.editW,
    height: t.editH,
    borderRadius: t.editRadius,
    borderWidth: 1,
    borderColor: t.addBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { fontFamily: font.appBody, fontSize: t.editSize, color: t.brand },
});
