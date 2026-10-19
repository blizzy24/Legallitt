import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, font, wizardField as f } from '../constants/theme';

type Props = Omit<TextInputProps, 'placeholder' | 'style'> & {
  icon: LucideIcon;
  label: string;
  /** Raised asterisk after the label (design/24, 25). */
  required?: boolean;
  /** Smaller trailing hint, e.g. "(Optional)". */
  hint?: string;
  /** Multiline height; single-line fields use the measured 41pt. */
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
};

// The Legal Notice wizard's beige flat field (design/24, 25): no elevation, a brand
// leading icon, and a label that stands in for the placeholder so the required
// asterisk can sit raised like the design. Different from the auth screens' white
// elevated AuthField.
export default function FlatField({
  icon: Icon,
  label,
  required = false,
  hint,
  height,
  containerStyle,
  value,
  multiline,
  ...inputProps
}: Props) {
  const tall = !!multiline;
  return (
    <View style={[styles.box, tall ? [styles.boxTall, { height: height ?? f.addressHeight }] : styles.boxSingle, containerStyle]}>
      <Icon size={f.icon} color={colors.brand} />
      <View style={styles.inputWrap}>
        {!value && (
          <View style={[styles.labelRow, tall ? styles.labelRowTall : styles.labelRowSingle]}>
            <Text style={styles.label}>{label}</Text>
            {required && <Text style={styles.star}>*</Text>}
            {hint && <Text style={styles.hint}> {hint}</Text>}
          </View>
        )}
        <TextInput
          value={value}
          multiline={multiline}
          textAlignVertical={tall ? 'top' : 'center'}
          accessibilityLabel={label}
          style={[styles.input, tall && styles.inputTall]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    borderRadius: f.radius,
    backgroundColor: f.bg,
    paddingLeft: f.padLeft,
    paddingRight: f.padLeft,
  },
  boxSingle: {
    height: f.height,
    alignItems: 'center',
  },
  boxTall: {
    alignItems: 'flex-start',
    paddingTop: f.multiPadTop,
    paddingBottom: f.multiPadTop,
  },
  inputWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: f.iconGap,
    alignSelf: 'stretch',
  },
  labelRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    pointerEvents: 'none',
  },
  labelRowSingle: {
    alignItems: 'center',
  },
  labelRowTall: {
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: font.appBody,
    fontSize: f.text,
    color: f.hint,
  },
  star: {
    fontFamily: font.appBody,
    fontSize: f.text,
    color: f.hint,
    marginTop: f.starLift,
  },
  hint: {
    fontFamily: font.appBody,
    fontSize: f.hintSize,
    color: f.hint,
  },
  input: {
    flex: 1,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: f.text,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  inputTall: {
    // Web ignores textAlignVertical; a top-aligned line box keeps the caret at the top.
    lineHeight: f.text * 1.3,
  },
});
