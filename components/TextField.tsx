import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { colors, control, fieldShadow, font, ink, radius } from '../constants/theme';

type Props = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

export default function TextField({ containerStyle, style, ...inputProps }: Props) {
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
