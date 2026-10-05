import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Clock,
  PieChart,
  Plus,
  SendHorizontal,
  Timer,
  Video,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PROPOSE } from '../../../../data/advocateSide';
import { advPropose as t, colors, font, ink } from '../../../../constants/theme';

// Propose an alternate time (design/165).
//
// The calendar and the slot grid are live: the month arrows move the month, tapping
// a date selects it (weekends are drawn unavailable and are inert), and tapping a
// slot selects it, which drives the "YOUR PROPOSED TIME" card.
//
// design/165 draws two collisions rather than layouts — the "Court" label printed on
// top of the struck-through 12:00 PM slot text, and the availability dot touching the
// slot text with no gap. Both are rebuilt here as real layout.

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Monday-first index of the 1st, and the day count, for a month grid. */
function monthGrid(year: number, month: number) {
  const first = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: { day: number; outside: boolean }[] = [];
  for (let i = first - 1; i >= 0; i -= 1) cells.push({ day: prevDays - i, outside: true });
  for (let d = 1; d <= days; d += 1) cells.push({ day: d, outside: false });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - first - days + 1, outside: true });
  return cells;
}

export default function AdvocateProposeScreen() {
  const insets = useSafeAreaInsets();
  const p = ADV_PROPOSE;
  const [year, setYear] = useState(p.month.year);
  const [month, setMonth] = useState(p.month.month);
  const [date, setDate] = useState<number | null>(p.selectedDate);
  const [slot, setSlot] = useState(
    p.slots.find((s) => s.state === 'selected')?.id ?? null,
  );

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const isDesignMonth = year === p.month.year && month === p.month.month;
  const chosen = p.slots.find((s) => s.id === slot);

  function step(by: number) {
    const m = month + by;
    setYear(year + Math.floor(m / 12));
    setMonth(((m % 12) + 12) % 12);
    setDate(null);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            {p.title}
          </Text>
          <Text style={styles.subtitle} {...shrinkToFit(0.75)}>
            {p.subtitle}
          </Text>
        </View>
        {/* Inert — the calendar button has no designed destination. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Calendar" style={styles.calBtn}>
          <CalendarDays size={t.calBtnIcon} color={colors.brandDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.75)}>
              CURRENT REQUESTED SESSION
            </Text>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {p.sessionChip}
              </Text>
            </View>
          </View>
          <View style={styles.rule} />

          <View style={styles.cellRow}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                CLIENT
              </Text>
              <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                {p.client}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                MODE
              </Text>
              <View style={styles.cellValueRow}>
                <Video size={t.cellIcon} color={colors.textPrimary} />
                <Text style={[styles.cellValue, styles.cellValueInline]} {...shrinkToFit(0.75)}>
                  {p.mode}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cellRow}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                MATTER
              </Text>
              <Text style={[styles.cellValue, styles.matterValue]} {...shrinkToFit(0.7)}>
                {p.matter}
              </Text>
            </View>
          </View>

          <View style={styles.orig}>
            <Clock size={t.origIcon} color={colors.textBody} />
            <Text style={styles.origLabel} {...shrinkToFit(0.75)}>
              {p.originalLabel}
            </Text>
            <Text style={styles.origValue} {...shrinkToFit(0.7)}>
              {p.original}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.calHead}>
            <View style={styles.calHeadText}>
              <Text style={styles.calTitle} {...shrinkToFit(0.8)}>
                Choose New Date
              </Text>
              <Text style={styles.calSub} {...shrinkToFit(0.8)}>
                For This Consultation.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => step(-1)}
              style={styles.monthNav}
            >
              <ChevronLeft size={t.monthNavIcon} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.month} {...shrinkToFit(0.75)}>
              {MONTHS[month]} {year}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              onPress={() => step(1)}
              style={styles.monthNav}
            >
              <ChevronRight size={t.monthNavIcon} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.wkRow}>
            {WEEKDAYS.map((d, i) => (
              <Text key={`${d}${i}`} style={styles.wk}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.wkRule} />

          <View style={styles.grid}>
            {cells.map((c, i) => {
              const weekend = i % 7 >= 5;
              const selected = !c.outside && date === c.day;
              const hasSlots = !c.outside && isDesignMonth && p.datesWithSlots.includes(c.day);
              const disabled = c.outside || weekend;
              return (
                <Pressable
                  key={`${i}-${c.day}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => setDate(c.day)}
                  style={styles.dayCell}
                >
                  <View style={[styles.dayBox, selected && styles.dayBoxSel]}>
                    <Text
                      style={[
                        styles.day,
                        disabled && styles.dayMuted,
                        selected && styles.daySel,
                      ]}
                    >
                      {c.day}
                    </Text>
                    {(hasSlots || selected) && (
                      <View
                        style={[styles.dayDot, selected ? styles.dayDotSel : styles.dayDotOpen]}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legendRule} />
          <View style={styles.legend}>
            {p.legend.map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    l.tone === 'available' && styles.legendOpen,
                    l.tone === 'selected' && styles.legendSelected,
                    l.tone === 'blocked' && styles.legendBlocked,
                  ]}
                />
                <Text style={styles.legendText} {...shrinkToFit(0.75)}>
                  {l.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.slotTitle} {...shrinkToFit(0.75)}>
              Choose Time For This Consultation
            </Text>
            <View style={styles.slotChip}>
              <Text style={styles.slotChipText} {...shrinkToFit(0.75)}>
                {p.durationChip}
              </Text>
            </View>
          </View>

          <View style={styles.slotGrid}>
            {p.slots.map((s) => {
              const isSel = slot === s.id;
              const blocked = s.state === 'blocked';
              return (
                <View key={s.id} style={styles.slotWrap}>
                  {/* design/165 prints the note over the slot text; given its own row here. */}
                  {s.note && (
                    <View style={[styles.slotNote, blocked && styles.slotNoteBlocked]}>
                      <Text style={styles.slotNoteText} {...shrinkToFit(0.75)}>
                        {s.note}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSel, disabled: blocked }}
                    disabled={blocked}
                    onPress={() => setSlot(s.id)}
                    style={[
                      styles.slot,
                      s.state === 'original' && styles.slotOriginal,
                      blocked && styles.slotBlocked,
                      isSel && styles.slotSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        s.state === 'original' && styles.slotTextOriginal,
                        blocked && styles.slotTextBlocked,
                        isSel && styles.slotTextSelected,
                      ]}
                      {...shrinkToFit(0.7)}
                    >
                      {s.label}
                    </Text>
                    {isSel ? (
                      <Check size={t.slotCheck} color={ink.onBrand} style={styles.slotMark} />
                    ) : s.state === 'available' ? (
                      <View style={styles.slotDot} />
                    ) : null}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Inert — the custom time row has no designed picker. */}
          <Pressable accessibilityRole="button" style={styles.custom}>
            <Plus size={t.customPlus} color={colors.textPrimary} />
            <Text style={styles.customLabel} {...shrinkToFit(0.8)}>
              {p.customTime.label}
            </Text>
            <Text style={styles.customHint} {...shrinkToFit(0.75)}>
              {p.customTime.hint}
            </Text>
            <ChevronDown size={t.customChevron} color={colors.textBody} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Timer size={t.cscIcon} color={colors.brandDark} />
            <Text style={styles.cscTitle} {...shrinkToFit(0.7)}>
              {p.customConfig.title}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {p.customConfig.chip}
              </Text>
            </View>
          </View>
          <View style={styles.rule} />

          <Text style={styles.startLabel} {...shrinkToFit(0.8)}>
            {p.customConfig.startLabel}
          </Text>
          {/* Inert — no picker is designed. */}
          <Pressable accessibilityRole="button" style={styles.picker}>
            <Clock size={t.pickerIcon} color={colors.brandDark} />
            <Text style={styles.pickerText} {...shrinkToFit(0.8)}>
              {p.customConfig.startValue}
            </Text>
            <ChevronDown size={t.customChevron} color={colors.textBody} />
          </Pressable>

          <View style={styles.rule} />
          <View style={styles.durRow}>
            <PieChart size={t.durIcon} color={colors.textBody} />
            <Text style={styles.durLabel} {...shrinkToFit(0.8)}>
              {p.customConfig.durationLabel}
            </Text>
            <View style={styles.durChip}>
              <Text style={styles.durChipText} {...shrinkToFit(0.8)}>
                {p.customConfig.durationValue}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.prop}>
          <View style={styles.propBar} />
          <View style={styles.propBody}>
            <View style={styles.sectionRow}>
              <CalendarCheck size={t.propIcon} color={colors.brandDark} />
              <Text style={styles.propLabel} {...shrinkToFit(0.75)}>
                {p.proposed.label}
              </Text>
              <View style={styles.propChip}>
                <Text style={styles.propChipText} {...shrinkToFit(0.75)}>
                  {p.proposed.chip}
                </Text>
              </View>
            </View>
            <View style={styles.propRow}>
              <View style={styles.propText}>
                <Text style={styles.propDate} {...shrinkToFit(0.75)}>
                  {date ? `${date} ${MONTHS[month].slice(0, 3)} ${year}` : p.proposed.date}
                </Text>
                <Text style={styles.propTime} {...shrinkToFit(0.75)}>
                  {chosen ? `${chosen.label} IST` : p.proposed.time}
                </Text>
              </View>
              <View style={styles.propMode}>
                <Video size={t.propModeIcon} color={colors.textPrimary} />
                <Text style={styles.propModeText} {...shrinkToFit(0.8)}>
                  {p.proposed.mode}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.msgTitle} {...shrinkToFit(0.75)}>
              {p.message.title}
            </Text>
            <Text style={styles.msgRight} {...shrinkToFit(0.8)}>
              {p.message.rightLabel}
            </Text>
          </View>
          <Text style={styles.msgSub} {...shrinkToFit(0.75)}>
            {p.message.sub}
          </Text>
          {/* Static: the prototype has no text entry. */}
          <View style={styles.msgBox}>
            <Text style={styles.msgPlaceholder}>{p.message.placeholder}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
        >
          <SendHorizontal size={t.submitIcon} color={ink.onBrand} />
          <Text style={styles.submitText} {...shrinkToFit(0.75)}>
            {p.submit}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={({ pressed }) => [styles.decline, pressed && styles.pressed]}
        >
          <CircleX size={t.declineIcon} color={t.declineColour} />
          <Text style={styles.declineText} {...shrinkToFit(0.8)}>
            {p.decline}
          </Text>
        </Pressable>

        <Text style={styles.caption}>{p.caption}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  subtitle: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  calBtn: {
    width: t.calBtn,
    height: t.calBtn,
    borderRadius: t.calBtn / 2,
    borderWidth: 1,
    borderColor: t.calBtnBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 32 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 4,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.brandDark,
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    marginRight: t.chipDotGap,
    backgroundColor: colors.brand,
  },
  chipText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.chipSize, color: colors.brandDark },

  rule: { marginVertical: t.ruleGap, height: 1, backgroundColor: t.rule },

  cellRow: { flexDirection: 'row', marginBottom: t.cellGap },
  cell: { flex: 1, minWidth: 0, paddingRight: 8 },
  cellLabel: {
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    letterSpacing: t.cellLabelSpacing,
    color: colors.textBody,
  },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },
  matterValue: { fontSize: t.matterValueSize },
  cellValueRow: { flexDirection: 'row', alignItems: 'center' },
  cellValueInline: { marginLeft: t.cellIconGap, flexShrink: 1 },

  orig: {
    marginTop: t.origGap - t.cellGap,
    borderRadius: t.origRadius,
    backgroundColor: t.origBg,
    padding: t.origPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  origLabel: {
    marginLeft: t.origIconGap,
    marginRight: t.origColGap,
    width: 98,
    fontFamily: font.appBody,
    fontSize: t.origLabelSize,
    lineHeight: t.origLabelLineHeight,
    color: colors.textBody,
  },
  origValue: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.origValueSize,
    lineHeight: t.origValueLineHeight,
    color: colors.textPrimary,
  },

  calHead: { flexDirection: 'row', alignItems: 'center' },
  calHeadText: { flex: 1, minWidth: 0, marginRight: 8 },
  calTitle: { fontFamily: font.appHeading, fontSize: t.calTitleSize, color: colors.textPrimary },
  calSub: { marginTop: t.calSubGap, fontFamily: font.appBody, fontSize: t.calSubSize, color: colors.textBody },
  monthNav: {
    width: t.monthNav,
    height: t.monthNav,
    borderRadius: t.monthNav / 2,
    borderWidth: 1,
    borderColor: t.calBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    marginHorizontal: t.monthGap,
    fontFamily: font.appSemi,
    fontSize: t.monthSize,
    color: colors.textPrimary,
  },

  wkRow: { marginTop: t.wkGap, flexDirection: 'row' },
  wk: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.wkSize,
    color: colors.brandDark,
  },
  wkRule: { marginTop: t.wkRuleGap, height: 1, backgroundColor: t.rule },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: t.dayCell, alignItems: 'center', justifyContent: 'center' },
  dayBox: {
    width: t.dayCell - 4,
    height: t.dayCell - 4,
    borderRadius: t.daySelRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBoxSel: { backgroundColor: t.daySelBg },
  day: { fontFamily: font.appBody, fontSize: t.daySize, color: colors.textPrimary },
  dayMuted: { color: t.dayMuted },
  daySel: { fontFamily: font.appHeading, fontSize: t.daySelSize, color: ink.onBrand },
  dayDot: {
    marginTop: t.dayDotGap,
    width: t.dayDot,
    height: t.dayDot,
    borderRadius: t.dayDot / 2,
  },
  dayDotOpen: { backgroundColor: t.dayAvailable },
  dayDotSel: { backgroundColor: ink.onBrand },

  legendRule: { marginTop: t.legendRuleGap, height: 1, backgroundColor: t.rule },
  legend: { marginTop: t.legendGap, flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  legendDot: { width: t.legendDot, height: t.legendDot, borderRadius: t.legendDot / 2, marginRight: t.legendDotGap },
  legendOpen: { backgroundColor: t.dayAvailable },
  legendSelected: { backgroundColor: colors.brand },
  legendBlocked: { backgroundColor: '#DCD7CF' },
  legendText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.legendSize, color: colors.textPrimary },

  slotTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 4,
    fontFamily: font.appHeading,
    fontSize: t.slotTitleSize,
    color: colors.textPrimary,
  },
  slotChip: {
    minHeight: t.slotChipHeight,
    borderRadius: t.slotChipRadius,
    paddingHorizontal: t.slotChipPadX,
    backgroundColor: t.slotChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  slotChipText: { fontFamily: font.appBody, fontSize: t.slotChipSize, color: colors.brandDark },

  slotGrid: {
    marginTop: t.slotGridGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.slotGapX,
    rowGap: t.slotGapY,
  },
  slotWrap: { width: `${50}%`, flexBasis: 0, flexGrow: 1, minWidth: '45%' },
  slotNote: {
    alignSelf: 'center',
    minHeight: t.slotNoteHeight,
    borderRadius: t.slotNoteRadius,
    paddingHorizontal: t.slotNotePadX,
    marginBottom: 5,
    backgroundColor: t.slotNoteBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotNoteBlocked: { backgroundColor: '#9A948B' },
  slotNoteText: { fontFamily: font.appSemi, fontSize: t.slotNoteSize, color: ink.onBrand },
  slot: {
    minHeight: t.slotHeight,
    borderRadius: t.slotRadius,
    borderWidth: 1,
    borderColor: t.slotBorder,
    paddingHorizontal: t.slotPadX,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotOriginal: { backgroundColor: t.slotOrigBg, borderColor: t.slotOrigBg },
  slotBlocked: { backgroundColor: t.slotBlockedBg, borderColor: t.slotBlockedBg },
  slotSelected: { backgroundColor: t.slotSelBg, borderColor: t.slotSelBg },
  slotText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.slotSize, color: colors.textPrimary },
  slotTextOriginal: { color: colors.brandDark },
  slotTextBlocked: { color: colors.textBody, textDecorationLine: 'line-through' },
  slotTextSelected: { color: ink.onBrand },
  slotDot: {
    marginLeft: t.slotDotGap,
    width: t.slotDot,
    height: t.slotDot,
    borderRadius: t.slotDot / 2,
    backgroundColor: t.dayAvailable,
  },
  slotMark: { marginLeft: t.slotDotGap },

  custom: {
    marginTop: t.customGap,
    minHeight: t.customHeight,
    borderRadius: t.customRadius,
    borderWidth: 1,
    borderColor: t.slotBorder,
    paddingHorizontal: t.customPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customLabel: {
    marginLeft: t.customPlusGap,
    fontFamily: font.appHeading,
    fontSize: t.customLabelSize,
    color: colors.textPrimary,
  },
  customHint: {
    marginLeft: t.customHintGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.customHintSize,
    color: colors.textBody,
  },

  cscTitle: {
    marginLeft: t.cscIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.cscTitleSize,
    color: colors.textPrimary,
  },
  startLabel: { fontFamily: font.appBody, fontSize: t.startLabelSize, color: colors.textBody },
  picker: {
    marginTop: t.pickerGap,
    width: t.pickerW,
    minHeight: t.pickerHeight,
    borderRadius: t.pickerRadius,
    borderWidth: 1,
    borderColor: t.pickerBorder,
    backgroundColor: t.pickerBg,
    paddingHorizontal: t.pickerPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    marginLeft: t.pickerIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.pickerSize,
    color: colors.textPrimary,
  },
  durRow: { flexDirection: 'row', alignItems: 'center' },
  durLabel: {
    marginLeft: t.durIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.durSize,
    color: colors.textPrimary,
  },
  durChip: {
    minHeight: t.durChipHeight,
    borderRadius: t.durChipRadius,
    paddingHorizontal: t.durChipPadX,
    backgroundColor: t.durChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durChipText: { fontFamily: font.appHeading, fontSize: t.durChipSize, color: colors.textPrimary },

  prop: {
    marginBottom: t.cardGap,
    borderRadius: t.propRadius,
    borderWidth: 1,
    borderColor: t.propBorder,
    backgroundColor: colors.card,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  propBar: { width: t.propBar, backgroundColor: colors.brand },
  propBody: { flex: 1, minWidth: 0, padding: t.propPad },
  propLabel: {
    marginLeft: t.propIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.propLabelSize,
    letterSpacing: t.propLabelSpacing,
    color: colors.brandDark,
  },
  propChip: {
    minHeight: t.propChipHeight,
    borderRadius: t.propChipRadius,
    paddingHorizontal: t.propChipPadX,
    backgroundColor: t.propChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  propChipText: { fontFamily: font.appSemi, fontSize: t.propChipSize, color: t.propChipColour },
  propRow: { marginTop: t.propDateGap, flexDirection: 'row', alignItems: 'center' },
  propText: { flex: 1, minWidth: 0, marginRight: 10 },
  propDate: { fontFamily: font.appHeading, fontSize: t.propDateSize, color: colors.textPrimary },
  propTime: {
    marginTop: t.propTimeGap,
    fontFamily: font.appBody,
    fontSize: t.propTimeSize,
    color: colors.brandDark,
  },
  propMode: {
    minHeight: t.propModeHeight,
    borderRadius: t.propModeRadius,
    paddingHorizontal: t.propModePadX,
    backgroundColor: t.propModeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  propModeText: {
    marginLeft: t.propModeIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.propModeSize,
    color: colors.textPrimary,
  },

  msgTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.msgTitleSize,
    color: colors.textPrimary,
  },
  msgRight: { fontFamily: font.appBody, fontSize: t.msgRightSize, color: colors.textBody },
  msgSub: {
    marginTop: t.msgSubGap,
    fontFamily: font.appBody,
    fontSize: t.msgSubSize,
    color: colors.textPrimary,
  },
  msgBox: {
    marginTop: t.msgBoxGap,
    minHeight: t.msgBoxMinHeight,
    borderRadius: t.msgBoxRadius,
    borderWidth: 1,
    borderColor: t.msgBoxBorder,
    backgroundColor: t.msgBoxBg,
    padding: t.msgBoxPad,
  },
  msgPlaceholder: {
    fontFamily: font.appBody,
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textBody,
  },

  submit: {
    minHeight: t.submitHeight,
    borderRadius: t.submitRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  submitText: {
    marginLeft: t.submitIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.submitSize,
    color: ink.onBrand,
  },
  decline: {
    marginTop: t.declineGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    marginLeft: t.declineIconGap,
    fontFamily: font.appHeading,
    fontSize: t.declineSize,
    color: t.declineColour,
  },
  caption: {
    marginTop: t.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    lineHeight: t.captionLineHeight,
    color: colors.textBody,
  },
  pressed: { opacity: 0.85 },
});
