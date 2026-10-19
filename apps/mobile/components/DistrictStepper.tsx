import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { dcStepper as t, dcStepperPalette as m, font, hcPalette as c, ink, status } from '../constants/theme';

/**
 * The District Court intake stepper (designs 340–343): a green disc with a
 * tick for each of the first `done` steps, a brown numbered disc for
 * `current` (when drawn), grey numbered discs otherwise. No connecting rail.
 *
 * The exports disagree on what the current step looks like: 340 ticks step 1
 * while you are still on it and draws no brown disc; 341–343 tick the steps
 * before and draw the current one brown. Each screen passes what it draws.
 */
export default function DistrictStepper({
  labels,
  done,
  current,
  compact = false,
}: {
  labels: readonly string[];
  done: number;
  current?: number;
  /** design/343's smaller discs. */
  compact?: boolean;
}) {
  return (
    <View style={styles.row}>
      {labels.map((l, i) => {
        const isDone = i < done;
        const active = i === current;
        return (
          <View key={l} style={styles.step}>
            <View style={[styles.disc, compact && styles.discCompact, isDone && styles.done, active && styles.active]}>
              {isDone ? (
                <Check size={compact ? t.glyphCompact : t.glyph} color={ink.onBrand} strokeWidth={3} />
              ) : (
                <Text style={[styles.num, compact && styles.numCompact, active && styles.numActive]}>{i + 1}</Text>
              )}
            </View>
            <Text
              style={[styles.label, compact && styles.labelCompact, isDone && styles.labelOn, active && styles.labelActive]}
              {...shrinkToFit(0.75)}
            >
              {l}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { flex: 1, minWidth: 0, alignItems: 'center' },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCompact: { width: t.discCompact, height: t.discCompact, borderRadius: t.discCompact / 2 },
  done: { backgroundColor: status.active },
  active: { backgroundColor: c.brown },
  num: { fontFamily: font.appSemi, fontSize: t.numSize, color: m.muted },
  numCompact: { fontSize: t.numSizeCompact },
  numActive: { color: ink.onBrand },
  label: {
    marginTop: t.labelTop,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: m.muted,
  },
  labelCompact: { marginTop: t.labelTopCompact },
  labelOn: { color: c.ink },
  labelActive: { color: c.brown },
});
