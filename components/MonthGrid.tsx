import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { advCalendar as t, font, ink } from '../constants/theme';

/**
 * The month grid on design/271.
 *
 * ⚠⚠ THIS IS THE ONE ELEMENT IN THIS BATCH WHERE THE EXPORT IS OVERRIDDEN, ON
 * INSTRUCTION. DO NOT "FIX" IT BACK TO THE PNG.
 *
 * design/271's grid cannot be copied, because it is not a possible month:
 *
 *   · it places 1 August 2026 under FRI. 1 August 2026 is a SATURDAY.
 *   · its trailing row reads 31, 1, 2, 3, 2, 3, 4 — the 2 and the 3 each appear
 *     TWICE. No month grid can produce that.
 *
 * So the numbers are computed from the displayed month instead, and the
 * chevrons move between months. Everything else is measured off the export and
 * matches it exactly: cell size, the weekday header, the filled circle on the
 * selected day, the dot markers, the leading/trailing greyed days and the
 * typography.
 *
 * Everything else on design/271 is still built exactly as drawn, including the
 * errors listed in data/advocateTools.ts.
 */
export default function MonthGrid({
  year,
  month,
  selected,
  marked,
}: {
  year: number;
  month: number; // 0-indexed
  selected: number;
  marked: number[];
}) {
  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const daysInPrev = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: { day: number; muted: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i -= 1) cells.push({ day: daysInPrev - i, muted: true });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, muted: false });
  let trail = 1;
  // design/271 always draws six rows, so the grid is padded to 42 cells.
  while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ day: trail++, muted: true });

  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View style={styles.grid}>
      <View style={styles.headRow}>
        {t.weekdays.map((w) => (
          <Text key={w} style={styles.head} {...shrinkToFit(0.8)}>
            {w}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={[styles.row, ri === 0 && styles.firstRow]}>
          {row.map((c, ci) => {
            const isSelected = !c.muted && c.day === selected;
            const isMarked = !c.muted && marked.includes(c.day);
            return (
              <View key={ci} style={styles.cell}>
                <View style={[styles.pill, isSelected && styles.pillOn]}>
                  <Text
                    style={[styles.day, c.muted && styles.dayMuted, isSelected && styles.dayOn]}
                    {...shrinkToFit(0.8)}
                  >
                    {c.day}
                  </Text>
                </View>
                <View style={styles.dotSlot}>
                  {isMarked ? <View style={styles.dot} /> : null}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { marginLeft: t.gridPadX + t.gridShift, marginRight: t.gridPadX - t.gridShift },
  headRow: { flexDirection: 'row' },
  head: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.headSize,
    color: t.ink,
  },
  row: { flexDirection: 'row', marginTop: t.rowGap },
  firstRow: { marginTop: t.headRowGap },
  cell: { flex: 1, alignItems: 'center' },
  pill: {
    width: t.pill,
    height: t.pill,
    borderRadius: t.pill / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillOn: { backgroundColor: t.selectedBg },
  day: { fontFamily: font.appBody, fontSize: t.daySize, color: t.ink },
  dayMuted: { color: t.mutedDay },
  dayOn: { color: ink.onBrand },
  dotSlot: { height: t.dotSlot, justifyContent: 'center' },
  dot: { width: t.dot, height: t.dot, borderRadius: t.dot / 2, backgroundColor: t.dotColour },
});
