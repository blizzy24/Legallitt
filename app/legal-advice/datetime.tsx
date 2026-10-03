import { router } from 'expo-router';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, laDatetime as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice date & time picker (design/124-la-datetime.png — correctly named).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — "Standard Fee ₹999" in the bottom bar is a figure that does not
// identify itself. ₹999 is VIDEO on the landing and AUDIO on the choose screen, so
// the bar is either contradicting one of them or quoting a third, flat price. It is
// rendered exactly as drawn and nothing computes it, in line with the rest of this
// flow — but it is one more reason the pricing has to be settled before the payment
// screens can be built.
//
// REPORTED — the design rings 22 September 2026 as "Today" and fills 24 September as
// "Selected". Elsewhere the app treats 24 September 2026 as today (the KYC and
// DigiLocker completion screens). TODAY below is pinned to the design's 22nd so the
// drawn state is reproducible; it is a single constant to change.
//
// The calendar is real: month navigation, leading and trailing days, past-date
// greying and selection all work against TODAY. The booked slots are fixed data and
// are genuinely unselectable.
// ─────────────────────────────────────────────────────────────────────────────

/** Pinned so the design's drawn state is reproducible. See the note above. */
const TODAY = { y: 2026, m: 8, d: 22 }; // month is 0-based: 8 = September

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SLOTS = [
  { label: '10:00 AM' },
  { label: '10:30 AM' },
  { label: '11:00 AM' },
  { label: '11:30 AM', booked: true },
  { label: '12:00 PM' },
  { label: '12:30 PM', booked: true },
  { label: '04:00 PM' },
  { label: '04:30 PM' },
  { label: '05:00 PM' },
  { label: '05:30 PM' },
  { label: '06:00 PM' },
  { label: '06:30 PM' },
];

type Cell = { day: number; inMonth: boolean; past: boolean; today: boolean; closed: boolean };

/** Builds the six-row Mon-first grid for a month, including neighbouring days. */
function buildMonth(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  // getDay() is Sunday-first; shift so Monday is column 0.
  const lead = (first.getDay() + 6) % 7;
  const daysThis = new Date(year, month + 1, 0).getDate();
  const daysPrev = new Date(year, month, 0).getDate();
  const todayIndex = new Date(TODAY.y, TODAY.m, TODAY.d).getTime();

  const cells: Cell[] = [];
  for (let i = 0; i < 42; i += 1) {
    const offset = i - lead;
    const inMonth = offset >= 0 && offset < daysThis;
    const day = inMonth ? offset + 1 : offset < 0 ? daysPrev + offset + 1 : offset - daysThis + 1;
    const date = new Date(year, month + (inMonth ? 0 : offset < 0 ? -1 : 1), day).getTime();
    cells.push({
      day,
      inMonth,
      past: date < todayIndex,
      today: inMonth && date === todayIndex,
      // design/124 greys Sunday the 27th though it is neither past nor out of month,
      // which is what the legend's third state ("Unavailable") must mean. Inferred:
      // Sundays are not bookable. Every other Sunday on the drawn month is already
      // in the past, so the 27th is the only evidence either way.
      closed: i % 7 === 6,
    });
  }
  // Drop a trailing all-outside row so short months do not render a dead week.
  return cells.slice(0, cells.slice(35).every((c) => !c.inMonth) ? 35 : 42);
}

export default function LegalAdviceDatetimeScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();
  const [view, setView] = useState({ y: TODAY.y, m: TODAY.m });
  const [selected, setSelected] = useState<{ y: number; m: number; d: number } | null>({
    y: 2026,
    m: 8,
    d: 24,
  });
  const [slot, setSlot] = useState(form.time || '05:30 PM');

  const cells = useMemo(() => buildMonth(view.y, view.m), [view]);

  const step = (delta: number) =>
    setView((v) => {
      const m = v.m + delta;
      if (m < 0) return { y: v.y - 1, m: 11 };
      if (m > 11) return { y: v.y + 1, m: 0 };
      return { y: v.y, m };
    });

  const pick = (c: Cell) => {
    if (!c.inMonth || c.past || c.closed) return;
    const next = { y: view.y, m: view.m, d: c.day };
    setSelected(next);
    update({ date: `${c.day} ${MONTHS[view.m].slice(0, 3)} ${view.y}` });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/legal-advice/experience')
          }
          style={styles.backButton}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Select Date &amp; Time
          </Text>
          <Text style={styles.sub} {...shrinkToFit(0.8)}>
            Choose a convenient time for your consultation.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: t.calGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cal}>
          <View style={styles.monthRow}>
            <CalendarDays size={t.monthIcon} color={colors.brandDark} />
            <Text style={styles.month} {...shrinkToFit(0.8)}>
              {MONTHS[view.m]} {view.y}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              hitSlop={6}
              onPress={() => step(-1)}
              style={styles.nav}
            >
              <ChevronLeft size={t.navIcon} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              hitSlop={6}
              onPress={() => step(1)}
              style={[styles.nav, styles.navRight]}
            >
              <ChevronRight size={t.navIcon} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.rule} />

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={styles.week}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((c, i) => {
              const isSelected =
                selected !== null &&
                c.inMonth &&
                selected.y === view.y &&
                selected.m === view.m &&
                selected.d === c.day;
              const dim = !c.inMonth || c.past || c.closed;
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: dim, selected: isSelected }}
                  disabled={dim}
                  onPress={() => pick(c)}
                  style={[
                    styles.cell,
                    c.today && !isSelected && styles.cellToday,
                    isSelected && styles.cellSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      dim && styles.cellTextDim,
                      isSelected && styles.cellTextSelected,
                    ]}
                  >
                    {c.day}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rule} />

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendSelected]} />
              <Text style={styles.legendText} {...shrinkToFit(0.8)}>
                Selected
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendToday]} />
              <Text style={styles.legendText} {...shrinkToFit(0.8)}>
                Today
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendUnavailable]} />
              <Text style={styles.legendText} {...shrinkToFit(0.8)}>
                Unavailable
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            Available Time
          </Text>
          <Text style={styles.zone} {...shrinkToFit(0.75)}>
            IST (Indian Standard Time)
          </Text>
        </View>
        <Text style={styles.slotSub} {...shrinkToFit(0.8)}>
          Choose one available time slot.
        </Text>

        <View style={styles.slots}>
          {SLOTS.map((s) => {
            const on = !s.booked && s.label === slot;
            return (
              <Pressable
                key={s.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!s.booked, selected: on }}
                disabled={s.booked}
                onPress={() => {
                  setSlot(s.label);
                  update({ time: s.label });
                }}
                style={[styles.slot, s.booked && styles.slotBooked, on && styles.slotOn]}
              >
                <Clock
                  size={t.slotIcon}
                  color={on ? ink.onBrand : s.booked ? colors.textMuted : colors.brandDark}
                />
                <Text
                  style={[
                    styles.slotText,
                    s.booked && styles.slotTextBooked,
                    on && styles.slotTextOn,
                  ]}
                  {...shrinkToFit(0.75)}
                >
                  {s.label}
                </Text>
                {s.booked && (
                  <View style={styles.booked}>
                    <Text style={styles.bookedText} {...shrinkToFit(0.7)}>
                      BOOKED
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} {...shrinkToFit(0.75)}>
            Consultation Slot Duration: <Text style={styles.barValue}>30 Mins</Text>
          </Text>
          {/* As drawn. See the note at the top of this file — nothing computes it. */}
          <Text style={styles.barFee} {...shrinkToFit(0.75)}>
            Standard Fee ₹999
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/review')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  content: { paddingHorizontal: t.padX },

  cal: {
    marginTop: t.calGap,
    borderRadius: t.calRadius,
    backgroundColor: colors.card,
    padding: t.calPad,
  },
  monthRow: { flexDirection: 'row', alignItems: 'center' },
  month: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.monthIconGap,
    fontFamily: font.appHeading,
    fontSize: t.monthSize,
    color: colors.textPrimary,
  },
  nav: {
    width: t.navButton,
    height: t.navButton,
    borderRadius: t.navRadius,
    backgroundColor: t.bg,
    borderWidth: 1,
    borderColor: t.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRight: { marginLeft: t.navGap },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.slotBorder },

  weekRow: { marginTop: t.weekGap, flexDirection: 'row' },
  week: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.weekSize,
    letterSpacing: t.weekSpacing,
    color: colors.textBody,
  },
  grid: { marginTop: t.cellGap, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    height: t.cell,
    borderRadius: t.cellRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: t.todayBorder,
    borderColor: 'transparent',
  },
  cellToday: { borderColor: t.todayRing },
  cellSelected: { backgroundColor: t.slotSelected },
  cellText: { fontFamily: font.appHeading, fontSize: t.cellSize, color: colors.textPrimary },
  cellTextDim: { fontFamily: font.appBody, color: t.cellMuted },
  cellTextSelected: { color: ink.onBrand },

  legend: {
    marginTop: t.legendGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  legendDot: { width: t.legendDot, height: t.legendDot, borderRadius: t.legendDot / 2 },
  legendSelected: { backgroundColor: t.slotSelected },
  legendToday: { borderWidth: 1.5, borderColor: t.todayRing },
  legendUnavailable: { backgroundColor: t.legendUnavailable },
  legendText: {
    marginLeft: t.legendDotGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.legendSize,
    color: colors.textPrimary,
  },

  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  section: { fontFamily: font.appHeading, fontSize: t.sectionSize, color: colors.textPrimary },
  zone: { marginLeft: 10, flexShrink: 1, fontFamily: font.appBody, fontSize: t.zoneSize, color: colors.textBody },
  slotSub: {
    marginTop: t.slotSubGap,
    fontFamily: font.appBody,
    fontSize: t.slotSubSize,
    color: colors.textBody,
  },

  slots: {
    marginTop: t.slotGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.slotColGap,
    rowGap: t.slotRowGap,
  },
  slot: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 130,
    maxWidth: '48%',
    minHeight: t.slotHeight,
    borderRadius: t.slotRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.slotBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  slotBooked: { backgroundColor: t.bookedBg, borderColor: 'transparent' },
  slotOn: { backgroundColor: t.slotSelected, borderColor: t.slotSelected },
  slotText: {
    marginLeft: t.slotIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.slotSize,
    color: colors.textPrimary,
  },
  slotTextBooked: {
    fontFamily: font.appBody,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  slotTextOn: { color: ink.onBrand },
  booked: {
    marginLeft: t.bookedGap,
    minHeight: t.bookedHeight,
    borderRadius: t.bookedRadius,
    paddingHorizontal: t.bookedPadX,
    backgroundColor: t.bookedChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookedText: { fontFamily: font.appSemi, fontSize: t.bookedSize, color: colors.textBody },

  bar: {
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
    backgroundColor: t.barBg,
    borderTopWidth: 1,
    borderTopColor: t.barBorder,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.barLabelSize, color: colors.textBody },
  barValue: { fontFamily: font.appHeading, color: colors.textPrimary },
  barFee: {
    marginLeft: 10,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.barFeeSize,
    color: t.feeColour,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.slotSelected,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
});
