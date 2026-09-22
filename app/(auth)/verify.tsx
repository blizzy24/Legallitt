import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputKeyPressEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../../components/PrimaryButton';
import { colors, control, fieldShadow, font, ink, space, verify } from '../../constants/theme';

const CODE_LENGTH = 4;

export default function VerifyScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const onChange = (index: number, text: string) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    setCode((prev) => prev.map((d, i) => (i === index ? digit : d)));
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const onKeyPress = (index: number, e: TextInputKeyPressEvent) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      // Stop the keypress from also deleting the digit in the box we move to (web).
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, verify.top),
            paddingBottom: Math.max(insets.bottom, verify.bottom),
          },
        ]}
      >
        <Text style={styles.title}>Enter verification{'\n'}code</Text>
        <Text style={styles.label}>Code</Text>

        <View style={styles.boxes}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChangeText={(t) => onChange(i, t)}
              onKeyPress={(e) => onKeyPress(i, e)}
              autoFocus={i === 0}
              keyboardType="number-pad"
              textContentType={i === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={i === 0 ? 'sms-otp' : 'off'}
              selectionColor={ink.hint}
              cursorColor={ink.hint}
              accessibilityLabel={`Digit ${i + 1}`}
              style={styles.box}
            />
          ))}
        </View>

        <View style={styles.flex} />

        <PrimaryButton label="Next" onPress={() => router.push('/(auth)/role')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
    paddingHorizontal: space.screenX,
  },
  title: {
    fontFamily: font.authSemi,
    fontSize: verify.titleSize,
    lineHeight: verify.titleLineHeight,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  label: {
    marginTop: verify.labelGap,
    fontFamily: font.authBody,
    fontSize: verify.labelSize,
    color: ink.hint,
  },
  boxes: {
    marginTop: verify.boxesGap,
    flexDirection: 'row',
    gap: verify.boxGap,
  },
  box: {
    flex: 1,
    minWidth: 0,
    height: control.inputHeight,
    borderRadius: verify.boxRadius,
    backgroundColor: colors.inputBg,
    paddingHorizontal: verify.caretInsetX,
    fontFamily: font.authSemi,
    fontSize: verify.digitSize,
    color: colors.textPrimary,
    outlineWidth: 0,
    ...fieldShadow,
  },
});
