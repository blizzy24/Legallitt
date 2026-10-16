import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MonthGrid from './MonthGrid';
import { font, pickers as p } from '../constants/theme';

/** "17/10/2026" — the DD/MM/YYYY the legal-advice field draws. */
export function formatDdMmYyyy(d: Date) {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * A date picker: the month grid (design/271's) in a bottom sheet, chevrons
 * between months, a tap on a day picks it and closes the sheet. No title or
 * button copy of its own — the month label is computed.
 */
export default function DatePickerSheet({
  visible,
  value,
  onPick,
  onClose,
}: {
  visible: boolean;
  value?: Date;
  onPick: (d: Date) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const start = value ?? new Date();
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const label = new Date(view.year, view.month, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  const step = (by: number) =>
    setView((v) => {
      const m = v.month + by;
      return { year: v.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  const selected = value && value.getFullYear() === view.year && value.getMonth() === view.month ? value.getDate() : -1;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel={p.a11yClose} style={styles.scrim} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + p.padBottom }]}>
        <View style={styles.head}>
          <Pressable accessibilityRole="button" accessibilityLabel={p.a11yPrev} hitSlop={10} onPress={() => step(-1)}>
            <ChevronLeft size={p.chevron} color={p.ink} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.month}>{label}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={p.a11yNext} hitSlop={10} onPress={() => step(1)}>
            <ChevronRight size={p.chevron} color={p.ink} strokeWidth={2.4} />
          </Pressable>
        </View>
        <MonthGrid
          year={view.year}
          month={view.month}
          selected={selected}
          marked={[]}
          onSelect={(day) => {
            onPick(new Date(view.year, view.month, day));
            onClose();
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: p.scrim },
  sheet: { backgroundColor: p.sheetBg, borderTopLeftRadius: p.radius, borderTopRightRadius: p.radius, paddingHorizontal: p.padX, paddingTop: p.padTop },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: p.headGap },
  month: { fontFamily: font.appSemi, fontSize: p.monthSize, color: p.ink },
});
