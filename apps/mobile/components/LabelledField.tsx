import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, firStep as s, font } from '../constants/theme';

type Props = Omit<TextInputProps, 'style' | 'placeholder'> & {
  label: string;
  /** Adds the red asterisk and the "Required" chip; otherwise "Optional". */
  required?: boolean;
  placeholder?: string;
  /** Replaces the default TextInput — used for selects and the mobile prefix row. */
  children?: ReactNode;
  /** Small grey line under the control. */
  note?: string;
  style?: StyleProp<ViewStyle>;
};

// Label above the field with a Required/Optional chip opposite it (design/42, 43, 44).
// The app's fourth field pattern; see the note on firStep in constants/theme.ts.
export default function LabelledField({ label, required = false, placeholder, children, note, style, ...inputProps }: Props) {
  return (
    <View style={[styles.group, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.star}> *</Text>}
        </Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{required ? 'Required' : 'Optional'}</Text>
        </View>
      </View>
      {children ?? (
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={s.placeholder}
          accessibilityLabel={label}
          style={styles.input}
          {...inputProps}
        />
      )}
      {note && <Text style={styles.note}>{note}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginTop: s.groupGap,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: s.labelGap,
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: s.labelSize,
    color: s.label,
  },
  star: {
    color: s.starColour,
  },
  chip: {
    height: s.chipHeight,
    borderRadius: s.chipRadius,
    paddingHorizontal: s.chipPadX,
    backgroundColor: s.chipBg,
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: s.chipSize,
    color: colors.textBody,
  },
  input: {
    height: s.fieldHeight,
    borderRadius: s.fieldRadius,
    backgroundColor: s.fieldBg,
    paddingHorizontal: s.fieldPadX,
    fontFamily: font.appBody,
    fontSize: s.fieldTextSize,
    color: s.fieldText,
    outlineWidth: 0,
  },
  note: {
    marginTop: 8,
    fontFamily: font.appBody,
    fontSize: s.chipSize,
    color: colors.textMuted,
  },
});
