import { DATA_SOURCE } from '../../lib/data-source';
import { validateFixtureCredentials } from '../../lib/fixture-session';
import { router } from 'expo-router';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '../../lib/auth';
import { useSession } from '../../context/session';
import AuthHeader from '../../components/AuthHeader';
import { AppleMark, FacebookMark, GoogleMark } from '../../components/SocialMarks';
import SocialSignInModal, { type SocialProvider } from '../../components/SocialSignInModal';
import { authLogin as l, authSignup as t, colors, font, ink } from '../../constants/theme';

// Create account (design/136). NEW — there was no sign-up screen before.
//
// The terms checkbox is checked by default, as drawn. The password reveal works.
// Create Account submits to Cognito through the API, then verifies the email.
//
// Note the fields here are FILLED lavender boxes where design/134's single field is
// white with a border — measured from both files and kept as drawn.

const SOCIALS: SocialProvider[] = ['google', 'facebook', 'apple'];

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const {registrationRole,setPending}=useSession();
  const [name,setName]=useState('');const [phone,setPhone]=useState('');
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const submit=async()=>{
    if(!registrationRole){router.push({pathname:'/(auth)/role',params:{next:'signup'}});return;}
    if(!agreed)return;
    setError('');setBusy(true);
    try{
      if (DATA_SOURCE === 'fixtures') {
        if (!name.trim()) throw new Error('Enter your full name');
        validateFixtureCredentials(email, password);
      } else await api('/auth/register',{name,email:email.trim(),password,role:registrationRole==='lawyer'?'advocate':'client',...(phone?{phone:`+91${phone.replace(/\D/g,'')}`}:{})});
      setPending({kind:'email',email:email.trim(),password});router.push('/(auth)/signup-verify');
    }catch(e){setError(e instanceof Error?e.message:'Registration failed');}finally{setBusy(false);}
  };
  const [reveal, setReveal] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [provider, setProvider] = useState<SocialProvider | null>(null);

  return (
    <View style={styles.screen}>
      <AuthHeader title="Sign Up" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.sub}>Create your account to get started with Legalitt.</Text>

        <Text style={[styles.label, styles.firstLabel]}>Full Name</Text>
        <View style={styles.field}>
          <User size={t.fieldIcon} color={colors.textPrimary} />
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name} onChangeText={setName}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.field}>
          <Phone size={t.fieldIcon} color={colors.textPrimary} />
          <Text style={styles.prefix}>+91</Text>
          <View style={styles.prefixRule} />
          <TextInput
            style={styles.inputBare}
            placeholder="Enter mobile number"
            value={phone} onChangeText={setPhone}
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Email Address</Text>
        <View style={styles.field}>
          <Mail size={t.fieldIcon} color={colors.textPrimary} />
          <TextInput
            style={styles.input}
            placeholder="Enter email address"
            value={email} onChangeText={setEmail}
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Create Password</Text>
        <View style={styles.field}>
          <Lock size={t.fieldIcon} color={colors.textPrimary} />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password} onChangeText={setPassword}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!reveal}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
            hitSlop={10}
            onPress={() => setReveal((v) => !v)}
          >
            {reveal ? (
              <EyeOff size={t.eyeIcon} color={colors.textPrimary} />
            ) : (
              <Eye size={t.eyeIcon} color={colors.textPrimary} />
            )}
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed((v) => !v)}
          style={styles.check}
        >
          <View style={[styles.checkBox, agreed && styles.checkBoxOn]}>
            {agreed && <Check size={t.checkGlyph} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <Text style={styles.checkText}>
            I agree to the <Text style={styles.checkLink}>Terms &amp; Conditions</Text> and{' '}
            <Text style={styles.checkLink}>Privacy Policy</Text>.
          </Text>
        </Pressable>

        {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={busy || !agreed}
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Create Account</Text>
          <ArrowRight size={l.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.or}>
          <View style={styles.orRule} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orRule} />
        </View>

        <View style={styles.socials}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${s}`}
              disabled accessibilityState={{disabled:true}}
              style={({ pressed }) => [styles.social, pressed && styles.pressed]}
            >
              {s === 'google' && <GoogleMark size={l.socialGlyph} />}
              {s === 'facebook' && <FacebookMark size={l.socialGlyph} />}
              {s === 'apple' && <AppleMark size={l.socialGlyph} />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.login}>
          Already have an account?{' '}
          <Text
            style={styles.loginLink}
            accessibilityRole="link"
            onPress={() => router.replace('/(auth)/login')}
          >
            Login
          </Text>
        </Text>
      </ScrollView>

      <SocialSignInModal
        provider={provider}
        onClose={() => setProvider(null)}
        onConfirm={() => {
          setProvider(null);
          // Social sign-in is outside architecture v3.0 scope.
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX },

  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  label: {
    marginTop: t.labelGap,
    fontFamily: font.appHeading,
    fontSize: t.labelSize,
    color: colors.textPrimary,
  },
  firstLabel: { marginTop: t.firstLabelGap },
  field: {
    marginTop: t.fieldGap,
    minHeight: t.fieldHeight,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginLeft: t.fieldIconGap,
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  inputBare: {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  prefix: {
    marginLeft: t.fieldIconGap,
    fontFamily: font.appBody,
    fontSize: t.fieldSize,
    color: colors.textPrimary,
  },
  prefixRule: {
    width: 1,
    height: t.prefixRuleHeight,
    marginHorizontal: t.prefixGap,
    backgroundColor: t.prefixRule,
  },

  check: { marginTop: t.checkGap, flexDirection: 'row', alignItems: 'flex-start' },
  checkBox: {
    width: t.checkBox,
    height: t.checkBox,
    borderRadius: t.checkRadius,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: '#5A4A37', borderColor: '#5A4A37' },
  checkText: {
    marginLeft: t.checkGapX,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.checkSize,
    lineHeight: t.checkLineHeight,
    color: colors.textPrimary,
  },
  checkLink: { color: '#8A6F4B' },

  button: {
    marginTop: t.buttonGap,
    minHeight: l.buttonHeight,
    borderRadius: l.buttonRadius,
    backgroundColor: l.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: l.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: l.buttonIconGap },

  or: { marginTop: l.orGap, flexDirection: 'row', alignItems: 'center' },
  orRule: { flex: 1, height: 1, backgroundColor: l.orRule },
  orText: {
    marginHorizontal: l.orGapX,
    fontFamily: font.appSemi,
    fontSize: l.orSize,
    letterSpacing: l.orSpacing,
    color: colors.textBody,
  },
  socials: {
    marginTop: l.socialGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: l.socialGapX,
  },
  social: {
    width: l.social,
    height: l.social,
    borderRadius: l.socialRadius,
    backgroundColor: l.socialBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  login: {
    marginTop: l.signupGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: l.signupSize,
    color: colors.textBody,
  },
  loginLink: { fontFamily: font.appHeading, color: l.signupLinkColour },
});
