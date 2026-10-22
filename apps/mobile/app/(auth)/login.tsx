import { router } from 'expo-router';
import { ArrowRight, AtSign } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DATA_SOURCE } from '../../lib/data-source';
import { validateFixtureCredentials } from '../../lib/fixture-session';
import { api, type AuthResult } from '../../lib/auth';
import { useSession } from '../../context/session';
import AuthHeader from '../../components/AuthHeader';
import { AppleMark, FacebookMark, GoogleMark } from '../../components/SocialMarks';
import SocialSignInModal, { type SocialProvider } from '../../components/SocialSignInModal';
import { authLogin as t, colors, font, ink } from '../../constants/theme';

// Login (design/134). REPLACES the previous screen entirely: the old terms-checkbox
// pattern, where ticking the box flipped the button from "Continue" to "Next", is
// gone from the designs and from here.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THERE ARE TWO DIFFERENT LOGIN SCREENS IN THIS BATCH.
//
// This file builds design/134, the dedicated screen. Designs 139, 140 and 141 show a
// DIFFERENT login behind their modals — not a dimmed copy of this one:
//
//     header title     "Account Credentials"        (here: "Login")
//     eyebrow          "• LEGALITT AUTHENTICATION"  (here: "LEGALITT")
//     subtitle         "Access privileged dossiers and legal counsel."
//                                                   (here: "Login to your verified
//                                                    Legalitt client account")
//     field label      "Legal ID or Phone"          (here: "Email or Mobile Number")
//     sign-up link     "Request Access"             (here: "Sign Up")
//     footer           "256-Bit Encrypted Client Portal"
//                                                   (here: a terms line)
//     header right     an avatar button             (here: nothing)
//
// design/140 goes further and replaces the header entirely with a gavel logo, the
// wordmark "Legalitt" and the strapline "VERIFIED LEGAL ATELIER".
//
// The two are not variants of one screen — they address different users. "Legal ID",
// "privileged dossiers", "Request Access" and "client portal" describe an invite-only
// product for existing clients; design/134 describes an open consumer sign-up with a
// Sign Up link. Only one can be right, and the choice changes who can get in.
//
// design/139's backdrop also shows BOTH field labels at once, "Email or Mobile
// Number" on the left and "Legal ID or Phone" on the right of the same row, which
// suggests the two were composited rather than designed as alternatives.
//
// REPORTED — THE THREE SOCIAL SHEETS CANNOT SHIP AS DRAWN. See the warning at the
// top of components/SocialSignInModal.tsx.
// ─────────────────────────────────────────────────────────────────────────────

const SOCIALS: { id: SocialProvider; label: string }[] = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'facebook', label: 'Continue with Facebook' },
  { id: 'apple', label: 'Sign in with Apple' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const {accept,acceptFixture,setPending,registrationRole}=useSession();
  const email=value.includes('@');
  const submit=async()=>{
    setError('');
    if (!value.trim()) { setError('Enter your email or mobile number'); return; }
    setBusy(true);
    try{
      if (DATA_SOURCE === 'fixtures' && !registrationRole) {
        router.push({pathname:'/(auth)/role',params:{next:'login'}});return;
      }
      if(email){
        if (DATA_SOURCE === 'fixtures') {
          validateFixtureCredentials(value, password);
          await acceptFixture(registrationRole === 'lawyer' ? 'advocate' : 'client');
          router.replace(registrationRole === 'lawyer' ? '/(advocate)/dashboard' : '/(tabs)/home');
          return;
        }
        const result=await api<AuthResult|{confirmationRequired:true}>('/auth/login',{email:value.trim(),password});
        if('confirmationRequired' in result){setPending({kind:'email',email:value.trim(),password});router.push('/(auth)/signup-verify');}
        else{await accept(result);router.replace(result.user.role==='advocate'?'/(advocate)/dashboard':'/(tabs)/home');}
      }else{
        const digits=value.replace(/[^0-9+]/g,'');const phone=digits.startsWith('+')?digits:`+91${digits}`;
        if(!registrationRole){router.push({pathname:'/(auth)/role',params:{next:'login'}});return;}
        if (DATA_SOURCE === 'api') await api('/auth/otp/request',{phone});setPending({kind:'phone',phone,role:registrationRole==='lawyer'?'advocate':'client'});router.push('/(auth)/verify');
      }
    }catch(e){setError(e instanceof Error?e.message:'Authentication failed');}finally{setBusy(false);}
  };
  const [provider, setProvider] = useState<SocialProvider | null>(null);

  return (
    <View style={styles.screen}>
      <AuthHeader title="Login" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Welcome Back</Text>
        <Text style={styles.sub}>Login to your verified Legalitt client account</Text>

        <Text style={styles.label}>Email or Mobile Number</Text>
        <View style={styles.field}>
          <AtSign size={t.fieldIcon} color={colors.textPrimary} />
          <TextInput
            style={styles.input}
            placeholder="Email / Mobile No"
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={setValue}
            autoCapitalize="none"
          />
        </View>

        {email && <><Text style={styles.label}>Password</Text><View style={styles.field}><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" accessibilityLabel="Password" placeholder="Enter password" /></View></>}
        {error ? <Text accessibilityRole="alert">{error}</Text> : null}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.or}>
          <View style={styles.orRule} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orRule} />
        </View>

        <View style={styles.socials}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityLabel={s.label}
              disabled accessibilityState={{disabled:true}}
              style={({ pressed }) => [styles.social, pressed && styles.pressed]}
            >
              {s.id === 'google' && <GoogleMark size={t.socialGlyph} />}
              {s.id === 'facebook' && <FacebookMark size={t.socialGlyph} />}
              {s.id === 'apple' && <AppleMark size={t.socialGlyph} />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.signup}>
          Don&rsquo;t have an account?{' '}
          <Text
            style={styles.signupLink}
            onPress={() => router.push(registrationRole ? '/(auth)/signup' : {pathname:'/(auth)/role',params:{next:'signup'}})}
            accessibilityRole="link"
          >
            Sign Up
          </Text>
        </Text>

        <Text style={styles.terms}>
          By continuing, you agree to our <Text style={styles.termsLink}>Terms &amp; Conditions</Text>{' '}
          | <Text style={styles.termsLink}>Privacy Policy</Text>
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
  field: {
    marginTop: t.fieldGap,
    minHeight: t.fieldHeight,
    borderRadius: t.fieldRadius,
    borderWidth: 1,
    borderColor: t.fieldBorder,
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

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },

  or: { marginTop: t.orGap, flexDirection: 'row', alignItems: 'center' },
  orRule: { flex: 1, height: 1, backgroundColor: t.orRule },
  orText: {
    marginHorizontal: t.orGapX,
    fontFamily: font.appSemi,
    fontSize: t.orSize,
    letterSpacing: t.orSpacing,
    color: colors.textBody,
  },

  socials: {
    marginTop: t.socialGap,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: t.socialGapX,
  },
  social: {
    width: t.social,
    height: t.social,
    borderRadius: t.socialRadius,
    backgroundColor: t.socialBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  signup: {
    marginTop: t.signupGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.signupSize,
    color: colors.textBody,
  },
  signupLink: { fontFamily: font.appHeading, color: t.signupLinkColour },

  terms: {
    marginTop: t.termsGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.termsSize,
    lineHeight: t.termsLineHeight,
    color: colors.textBody,
  },
  termsLink: { textDecorationLine: 'underline', color: colors.textPrimary },
});
