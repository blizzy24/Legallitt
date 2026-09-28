import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { boxField as t, colors, font, ink } from '../constants/theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  /** Trailing glyph inside the box (design/51 puts one on most fields). */
  icon?: LucideIcon;
  /** design/51 draws the picker chevrons narrower than the field icons. */
  iconSize?: number;
  /** Replaces the trailing icon — used for the Mobile Number field's Verified chip. */
  accessory?: ReactNode;
  /** Replaces the TextInput — used for the Gender and Language pickers. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// The app's FIFTH field style (design/51): a white bordered box with the label
// INSIDE it, above the value, and a trailing icon.
//
// The other four, for reference:
//   AuthField      rounded and shadowed, placeholder only        design/01-05
//   FlatField      flat and bordered, label outside the box      legal notice wizard
//   LabelledField  label above with a Required/Optional chip     FIR steps
//   the inline selects on the FIR steps                          design/42-43
// Reported rather than folded into one of the others: the label sitting inside the
// border is a real structural difference, not a variant of the others.
export default function BoxField({
  label,
  icon: Icon,
  iconSize = t.icon,
  accessory,
  children,
  style,
  ...inputProps
}: Props) {
  return (
    <View style={[styles.box, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {accessory}
      </View>
      <View style={styles.valueRow}>
        <View style={styles.valueText}>
          {children ?? (
            <TextInput
              placeholderTextColor={ink.hint}
              style={styles.input}
              {...inputProps}
            />
          )}
        </View>
        {Icon && <Icon size={iconSize} color={ink.accent} style={styles.icon} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: t.radius,
    backgroundColor: t.bg,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: t.padX,
    paddingTop: t.padTop,
    paddingBottom: t.padBottom,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    color: colors.textBody,
  },
  valueRow: {
    marginTop: t.labelGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    padding: 0,
    fontFamily: font.appSemi,
    fontSize: t.valueSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  icon: {
    marginLeft: t.iconGap,
  },
});
