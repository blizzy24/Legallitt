import DemoPressable from '../../components/DemoPressable';
import { router, type Href } from 'expo-router';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Settings } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  ADV_AVAILABILITY_MONTH,
  ADV_AVAILABILITY_SELECTED,
  ADV_DATE_STATES,
  ADV_SELECTED_DATE,
  ADV_WEEKLY,
  type DateState,
} from '../../data/advocateSide';
import { advAvailability as t, colors, font, ink } from '../../constants/theme';

// Schedule & Availability (design/149).
//
// Lives OUTSIDE the (advocate) tab group, in app/advocate/, because design/149 draws
// no tab bar and ends in a fixed Save bar. A screen inside the Tabs navigator keeps
// the bar, which collided with the Save button. Pushed advocate screens belong here;
// only the four tabs live in (advocate).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE LEGEND'S COLOURS ARE NOT THE ONES THE BRIEF DESCRIBED. Sampled from
// the file: Available is GREEN (#22B573), Not Available is GREY, Blocked is RED. The
// brief had brown / red / grey. Built as drawn.
//
// INTERACTION — the design answers its own question in the card's sub-line, "Tap a
// date to inspect or update slots". So a tap SELECTS a date and the card below shows
// that date's slots; it does NOT cycle the date's state. Cycling would need an
// editor, and none is drawn — "Edit Hours" is the affordance the design gives, and
// it has no destination.
//
// Month navigation, date selection and the seven day toggles are real. Nothing is
// saved: "Save Availability" is inert.
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type Cell = { day: number; inMonth: boolean; state: DateState };

function buildMonth(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // Monday-first, as drawn
  const daysThis = new Date(year, month + 1, 0).getDate();
  const daysPrev = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const offset = i - lead;
    const inMonth = offset >= 0 && offset < daysThis;
    const day = inMonth ? offset + 1 : offset < 0 ? daysPrev + offset + 1 : offset - daysThis + 1;
    cells.push({ day, inMonth, state: (inMonth && ADV_DATE_STATES[day]) || 'available' });
  }
  return cells.slice(0, cells.slice(35).every((c) => !c.inMonth) ? 35 : 42);
}

const DOT: Record<DateState, string> = {
  available: t.available,
  unavailable: t.unavailable,
  blocked: t.blocked,
};

export default function AdvocateAvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const [online, setOnline] = useState(true);
  const [view, setView] = useState(ADV_AVAILABILITY_MONTH);
  const [selected, setSelected] = useState<number | null>(ADV_AVAILABILITY_SELECTED);
  const [days, setDays] = useState(ADV_WEEKLY.map((d) => d.on));

  const cells = useMemo(() => buildMonth(view.year, view.month), [view]);
  const activeDays = days.filter(Boolean).length;

  const step = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      if (m < 0) return { year: v.year - 1, month: 11 };
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace('/(advocate)/dashboard')
            }
            style={styles.back}
          >
            <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            Schedule &amp; Availability
          </Text>
          <Pressable onPress={() => router.push('/advocate/settings' as Href)} accessibilityRole="button" accessibilityLabel="Settings" style={styles.gear}>
            <Settings size={t.gearIcon} color={colors.brandDark} />
          </Pressable>
        </View>
        <Text style={styles.sub} {...shrinkToFit(0.8)}>
          Set your consultation dates and hours.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            INSTANT CONSULTATION
          </Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, !online && styles.statusDotOff]} />
            <Text style={styles.statusText} {...shrinkToFit(0.75)}>
              {online ? 'Online — Accepting Requests' : 'Offline — Not Accepting Requests'}
            </Text>
            <View style={styles.toggle}>
              {[true, false].map((v) => {
                const on = online === v;
                return (
                  <Pressable
                    key={String(v)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setOnline(v)}
                    style={[styles.toggleItem, on && styles.toggleItemOn]}
                  >
                    <Text style={[styles.toggleText, on && styles.toggleTextOn]} {...shrinkToFit(0.8)}>
                      {v ? 'Online' : 'Offline'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Text style={styles.body}>
            Clients can request instant chat, voice, or video consultations when you are online.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.dateHead}>
            <View style={styles.dateHeadText}>
              <Text style={styles.dateTitle} {...shrinkToFit(0.8)}>
                Date Availability
              </Text>
              <Text style={styles.dateSub}>Tap a date to inspect or update slots</Text>
            </View>
            <View style={styles.month}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={8}
                onPress={() => step(-1)}
              >
                <ChevronLeft size={t.monthArrow} color={colors.textBody} />
              </Pressable>
              <Text style={styles.monthText} {...shrinkToFit(0.75)}>
                {MONTHS[view.month]} {view.year}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={8}
                onPress={() => step(1)}
              >
                <ChevronRight size={t.monthArrow} color={colors.textBody} />
              </Pressable>
            </View>
          </View>

          <View style={styles.dowRow}>
            {DOW.map((d, i) => (
              <Text key={i} style={styles.dow}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((c, i) => {
              const isSel = c.inMonth && selected === c.day;
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !c.inMonth, selected: isSel }}
                  disabled={!c.inMonth}
                  onPress={() => setSelected(c.day)}
                  style={styles.cellWrap}
                >
                  <View style={[styles.cell, isSel && styles.cellSelected]}>
                    <Text
                      style={[
                        styles.cellText,
                        !c.inMonth && styles.cellTextMuted,
                        c.inMonth && c.state === 'blocked' && styles.cellTextBlocked,
                        isSel && styles.cellTextSelected,
                      ]}
                    >
                      {c.day}
                    </Text>
                  </View>
                  {c.inMonth && !isSel && (
                    <View style={[styles.cellDot, { backgroundColor: DOT[c.state] }]} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legendRule} />
          <View style={styles.legend}>
            {[
              { k: 'available', label: 'Available' },
              { k: 'unavailable', label: 'Not Available' },
              { k: 'blocked', label: 'Blocked' },
            ].map((l) => (
              <View key={l.k} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: DOT[l.k as DateState] }]} />
                <Text style={styles.legendText} {...shrinkToFit(0.8)}>
                  {l.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.selRow}>
            <View style={styles.selIcon}>
              <CalendarDays size={t.selIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.selText}>
              <View style={styles.selDateRow}>
                <Text style={styles.selDate} {...shrinkToFit(0.8)}>
                  {selected ? `${selected} ${MONTHS[view.month].slice(0, 3)} ${view.year}` : '—'}
                </Text>
                <View style={styles.selChip}>
                  <Text style={styles.selChipText} {...shrinkToFit(0.8)}>
                    {ADV_SELECTED_DATE.chip}
                  </Text>
                </View>
              </View>
              <Text style={styles.selSub} {...shrinkToFit(0.75)}>
                {ADV_SELECTED_DATE.sub}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/advocate/calendar/availability' as Href)} accessibilityRole="button" style={styles.edit}>
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                Edit Hours
              </Text>
            </Pressable>
          </View>

          <View style={styles.hours}>
            <View style={styles.hoursHead}>
              <Text style={styles.hoursLabel} {...shrinkToFit(0.8)}>
                Consultation Hours
              </Text>
              <Text style={styles.hoursActive} {...shrinkToFit(0.8)}>
                {ADV_SELECTED_DATE.hoursActive}
              </Text>
            </View>
            <View style={styles.pickers}>
              <View style={styles.picker}>
                <Text style={styles.pickerText} {...shrinkToFit(0.75)}>
                  Start: {ADV_SELECTED_DATE.start}
                </Text>
              </View>
              <Text style={styles.to}>to</Text>
              <View style={styles.picker}>
                <Text style={styles.pickerText} {...shrinkToFit(0.75)}>
                  End: {ADV_SELECTED_DATE.end}
                </Text>
              </View>
              <Text style={styles.slotLabel} {...shrinkToFit(0.75)}>
                {ADV_SELECTED_DATE.slotLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.weekHead}>
            <Text style={styles.weekTitle} {...shrinkToFit(0.8)}>
              Weekly Schedule
            </Text>
            <View style={styles.weekChip}>
              <Text style={styles.weekChipText} {...shrinkToFit(0.8)}>
                {activeDays} Days Active
              </Text>
            </View>
          </View>
          <Text style={styles.weekSub} {...shrinkToFit(0.8)}>
            Default recurring schedule for court days
          </Text>

          {ADV_WEEKLY.map((row, i) => (
            <View key={row.day} style={[styles.dayRow, i > 0 && styles.dayRowRuled]}>
              <Text style={[styles.dayName, !days[i] && styles.dayNameOff]} {...shrinkToFit(0.8)}>
                {row.day}
              </Text>
              <View style={styles.ranges}>
                {days[i] && row.ranges.length > 0 ? (
                  row.ranges.map((r, j) => (
                    <Text key={r} style={[styles.range, j > 0 && styles.rangeNext]}>
                      {r}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.notAvailable}>Not Available</Text>
                )}
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: days[i] }}
                accessibilityLabel={`${row.day} availability`}
                onPress={() =>
                  setDays((prev) => prev.map((v, k) => (k === i ? !v : v)))
                }
                style={[styles.switch, days[i] && styles.switchOn]}
              >
                <View style={[styles.knob, days[i] && styles.knobOn]} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.saveBar, { paddingBottom: insets.bottom + 14 }]}>
        <DemoPressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.save, pressed && styles.pressed]}
        >
          <Check size={t.saveIcon} color={ink.onBrand} strokeWidth={3} />
          <Text style={styles.saveText}>Save Availability</Text>
        </DemoPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: t.back,
    height: t.back,
    borderRadius: t.back / 2,
    backgroundColor: t.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  gear: {
    width: t.gear,
    height: t.gear,
    borderRadius: t.gear / 2,
    backgroundColor: t.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    marginTop: t.subGap,
    marginLeft: t.back + t.backGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: t.labelColour,
  },
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
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.statusSize,
    lineHeight: t.statusLineHeight,
    color: colors.textPrimary,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleItemOn: { backgroundColor: t.toggleOnBg },
  toggleText: { fontFamily: font.appSemi, fontSize: t.toggleSize, color: colors.textBody },
  toggleTextOn: { color: ink.onBrand },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },

  dateHead: { flexDirection: 'row', alignItems: 'flex-start' },
  dateHeadText: { flex: 1, minWidth: 0, marginRight: 10 },
  dateTitle: { fontFamily: font.appHeading, fontSize: t.dateTitleSize, color: colors.textPrimary },
  dateSub: {
    marginTop: t.dateSubGap,
    fontFamily: font.appBody,
    fontSize: t.dateSubSize,
    color: colors.textBody,
  },
  month: {
    width: t.monthW,
    minHeight: t.monthHeight,
    borderRadius: t.monthRadius,
    borderWidth: 1,
    borderColor: t.monthBorder,
    paddingHorizontal: t.monthPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthText: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.monthSize,
    color: colors.textPrimary,
  },

  dowRow: { marginTop: t.dowGap, flexDirection: 'row' },
  dow: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.dowSize,
    color: t.dowColour,
  },
  grid: { marginTop: t.cellGap, flexDirection: 'row', flexWrap: 'wrap' },
  cellWrap: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 },
  cell: {
    width: t.cell,
    height: t.cell,
    borderRadius: t.cell / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: t.selBg,
    borderWidth: t.selRing,
    borderColor: t.selRingColour,
  },
  cellText: { fontFamily: font.appHeading, fontSize: t.cellSize, color: colors.textPrimary },
  cellTextMuted: { fontFamily: font.appBody, color: t.cellMuted },
  cellTextBlocked: { color: t.blocked },
  cellTextSelected: { color: ink.onBrand },
  cellDot: {
    width: t.cellDot,
    height: t.cellDot,
    borderRadius: t.cellDot / 2,
    marginTop: t.cellDotGap,
  },

  legendRule: { marginTop: t.legendGap, height: 1, backgroundColor: t.legendRule },
  legend: {
    marginTop: t.legendGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  legendDot: { width: t.legendDot, height: t.legendDot, borderRadius: t.legendDot / 2 },
  legendText: {
    marginLeft: t.legendDotGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.legendSize,
    color: colors.textBody,
  },

  selRow: { flexDirection: 'row', alignItems: 'center' },
  selIcon: {
    width: t.selIcon,
    height: t.selIcon,
    borderRadius: t.selIconRadius,
    backgroundColor: t.selIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selText: { flex: 1, minWidth: 0, marginLeft: t.selIconGap, marginRight: 8 },
  selDateRow: { flexDirection: 'row', alignItems: 'center' },
  selDate: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.selDateSize, color: colors.textPrimary },
  selChip: {
    marginLeft: t.selChipGap,
    minHeight: t.selChipHeight,
    borderRadius: t.selChipRadius,
    paddingHorizontal: t.selChipPadX,
    backgroundColor: t.selChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selChipText: { fontFamily: font.appSemi, fontSize: t.selChipSize, color: t.selChipColour },
  selSub: {
    marginTop: t.selSubGap,
    fontFamily: font.appBody,
    fontSize: t.selSubSize,
    color: colors.textBody,
  },
  edit: {
    minHeight: t.editHeight,
    borderRadius: t.editRadius,
    paddingHorizontal: t.editPadX,
    backgroundColor: t.editBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { fontFamily: font.appBody, fontSize: t.editSize, color: colors.brandDark },

  hours: {
    marginTop: t.hoursGap,
    borderRadius: t.hoursRadius,
    backgroundColor: t.hoursBg,
    padding: t.hoursPad,
  },
  hoursHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hoursLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.hoursLabelSize, color: colors.textBody },
  hoursActive: {
    marginLeft: 8,
    fontFamily: font.appSemi,
    fontSize: t.hoursActiveSize,
    color: t.hoursActiveColour,
  },
  pickers: { marginTop: t.pickerGap, flexDirection: 'row', alignItems: 'center' },
  picker: {
    flex: 1,
    minWidth: 0,
    minHeight: t.pickerHeight,
    borderRadius: t.pickerRadius,
    borderWidth: 1,
    borderColor: t.pickerBorder,
    backgroundColor: colors.card,
    paddingHorizontal: t.pickerPadX,
    justifyContent: 'center',
  },
  pickerText: { fontFamily: font.appHeading, fontSize: t.pickerSize, color: colors.textPrimary },
  to: { marginHorizontal: t.toGap, fontFamily: font.appBody, fontSize: t.toSize, color: colors.textBody },
  slotLabel: {
    marginLeft: t.slotLabelGap,
    width: 52,
    fontFamily: font.appBody,
    fontSize: t.slotLabelSize,
    color: colors.textBody,
  },

  weekHead: { flexDirection: 'row', alignItems: 'center' },
  weekTitle: { flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.weekTitleSize, color: colors.textPrimary },
  weekChip: {
    marginLeft: 10,
    minHeight: t.weekChipHeight,
    borderRadius: t.weekChipRadius,
    paddingHorizontal: t.weekChipPadX,
    backgroundColor: t.weekChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekChipText: { fontFamily: font.appBody, fontSize: t.weekChipSize, color: colors.textBody },
  weekSub: {
    marginTop: t.weekSubGap,
    fontFamily: font.appBody,
    fontSize: t.weekSubSize,
    color: colors.textBody,
  },

  dayRow: { paddingVertical: t.rowPadY, flexDirection: 'row', alignItems: 'center' },
  dayRowRuled: { borderTopWidth: 1, borderTopColor: t.rowRule },
  dayName: { flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.dayRowSize, color: colors.textPrimary },
  dayNameOff: { fontFamily: font.appBody, color: colors.textBody },
  ranges: { alignItems: 'flex-end', marginRight: 12 },
  range: { fontFamily: font.appBody, fontSize: t.rangeSize, color: colors.textBody },
  rangeNext: { marginTop: t.rangeGap },
  notAvailable: { fontFamily: font.appBody, fontSize: t.rangeSize, color: colors.brandDark },

  switch: {
    width: t.switchW,
    height: t.switchH,
    borderRadius: t.switchRadius,
    backgroundColor: t.switchOff,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchOn: { backgroundColor: t.switchOn },
  knob: {
    width: t.switchKnob,
    height: t.switchKnob,
    borderRadius: t.switchKnob / 2,
    backgroundColor: colors.card,
  },
  knobOn: { alignSelf: 'flex-end' },

  saveBar: {
    paddingHorizontal: t.padX,
    paddingTop: t.saveBarPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: t.saveBarBorder,
  },
  save: {
    minHeight: t.saveHeight,
    borderRadius: t.saveRadius,
    backgroundColor: t.saveBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  saveText: {
    marginLeft: t.saveIconGap,
    fontFamily: font.appSemi,
    fontSize: t.saveSize,
    color: ink.onBrand,
  },
});
