import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from '../../components/PrimaryButton';
import { AppStoreMark, FacebookMark, GoogleMark } from '../../components/SocialMarks';
import TextField from '../../components/TextField';
import { colors, font, ink, login, marks, shadow, space } from '../../constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  const toggleTerms = () => {
    setChecked((c) => !c);
    setError(false);
  };

  const onContinue = () => {
    if (checked) router.push('/(auth)/verify');
    else setError(true);
  };

  const termsColor = error ? colors.danger : colors.textPrimary;

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, login.top),
          paddingBottom: Math.max(insets.bottom, login.termsBottom),
        },
      ]}
    >
      <Text style={styles.title}>Login/Register</Text>
      <Text style={styles.subtitle}>Login/Register in Your Account</Text>

      <TextField
        placeholder="E-mail/Mobile No"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={styles.field}
      />

      <PrimaryButton label={checked ? 'Next' : 'Continue'} onPress={onContinue} />

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <SocialButton label="Continue with Google">
          <GoogleMark />
        </SocialButton>
        <SocialButton label="Continue with Facebook">
          <FacebookMark />
        </SocialButton>
        <SocialButton label="Continue with Apple">
          <AppStoreMark />
        </SocialButton>
      </View>

      <View style={styles.spacer} />

      <Pressable
        style={styles.termsRow}
        onPress={toggleTerms}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View
          style={[
            styles.checkbox,
            error && styles.checkboxError,
            checked && styles.checkboxChecked,
          ]}
        >
          {checked && (
            <Check size={login.checkboxTick} strokeWidth={login.checkboxTickStroke} color={marks.onMark} />
          )}
        </View>
        <Text style={[styles.terms, { color: termsColor }]}>
          Follow Terms & Condition | Privacy Policy
        </Text>
      </Pressable>
    </View>
  );
}

function SocialButton({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.social}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
    paddingHorizontal: space.screenX,
  },
  title: {
    fontFamily: font.authSemi,
    fontSize: login.titleSize,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: login.subtitleGap,
    fontFamily: font.authBody,
    fontSize: login.subtitleSize,
    color: colors.textBody,
    textAlign: 'center',
  },
  field: {
    marginTop: login.headerGap,
    marginBottom: login.fieldGap,
  },
  divider: {
    marginTop: login.dividerGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: login.dividerTextGap,
  },
  dividerLine: {
    flex: 1,
    height: login.dividerLine,
    backgroundColor: ink.hint,
  },
  dividerText: {
    fontFamily: font.authBody,
    fontSize: login.dividerTextSize,
    color: colors.textBody,
  },
  socialRow: {
    marginTop: login.socialGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: login.socialSpacing,
  },
  social: {
    width: login.socialSize,
    height: login.socialSize,
    borderRadius: login.socialRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  spacer: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: login.termsInsetX - space.screenX,
    gap: login.termsGap,
  },
  checkbox: {
    width: login.checkboxSize,
    height: login.checkboxSize,
    borderRadius: login.checkboxRadius,
    borderWidth: login.checkboxBorder,
    borderColor: colors.textPrimary,
    backgroundColor: colors.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxError: {
    borderColor: colors.danger,
  },
  checkboxChecked: {
    borderColor: colors.info,
    backgroundColor: colors.info,
  },
  terms: {
    fontFamily: font.authBody,
    fontSize: login.termsSize,
  },
});
