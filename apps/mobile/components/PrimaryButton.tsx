import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { buttonShadow, colors, control, font, ink, radius } from '../constants/theme';

type Props = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({ label, onPress, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: control.buttonHeight,
    borderRadius: radius.button,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...buttonShadow,
  },
  pressed: {
    opacity: control.pressedOpacity,
  },
  label: {
    color: ink.onBrand,
    fontFamily: font.authBody,
    fontSize: control.buttonLabel,
  },
});
