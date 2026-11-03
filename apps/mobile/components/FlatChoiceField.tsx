import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, quickActions as q, wizardField as f } from '../constants/theme';

type Props<T extends string> = {
  icon: LucideIcon;
  label: string;
  options: readonly T[];
  value: T | null;
  /** Optional choice: tapping the selected option clears it. */
  onChange: (value: T | null) => void;
};

// Owner-instructed intake addition (4 November 2026): a FlatField-sized beige row whose
// value is one of a few short options. Measurements come from the neighbouring wizard
// field and the step-3 pills' selected border, not a new theme.
export default function FlatChoiceField<T extends string>({ icon: Icon, label, options, value, onChange }: Props<T>) {
  return (
    <View style={styles.box} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Icon size={f.icon} color={colors.brand} />
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={styles.options}>
        {options.map(option => {
          const selected = option === value;
          return (
            <Pressable key={option} onPress={() => onChange(selected ? null : option)}
              accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={option}
              style={[styles.option, selected && styles.optionSelected]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: f.height,
    borderRadius: f.radius,
    backgroundColor: f.bg,
    paddingLeft: f.padLeft,
    paddingRight: f.padLeft / 3,
  },
  label: {
    flex: 1,
    minWidth: 0,
    marginLeft: f.iconGap,
    fontFamily: font.appBody,
    fontSize: f.text,
    color: f.hint,
  },
  options: {
    flexDirection: 'row',
    gap: f.gap / 2,
  },
  option: {
    height: f.height - f.gap * 2,
    paddingHorizontal: f.gap,
    borderRadius: (f.height - f.gap * 2) / 2,
    borderWidth: q.selectedBorder,
    borderColor: f.hint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  optionText: {
    fontFamily: font.appSemi,
    fontSize: q.textSize,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.card,
  },
});
