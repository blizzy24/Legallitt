import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, control, fieldShadow, font, ink, radius } from '../constants/theme';

// The auth screens' field: a pill-shaped, elevated input with no label (design/01-05).
//
// One of three field styles in the app, each named for where it belongs:
//   AuthField      this one — rounded, shadowed, placeholder-only
//   FlatField      flat and bordered, for the wizard steps
//   LabelledField  label above, Required/Optional chip beside it, for the FIR steps
type Props = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

export default function AuthField({ containerStyle, style, ...inputProps }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        placeholderTextColor={ink.hint}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: control.inputHeight,
    borderRadius: radius.input,
    backgroundColor: colors.inputBg,
    paddingHorizontal: control.inputPaddingX,
    justifyContent: 'center',
    ...fieldShadow,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: font.authBody,
    fontSize: control.inputText,
  },
});
