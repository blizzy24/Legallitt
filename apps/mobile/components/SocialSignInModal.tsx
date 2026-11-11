import { Check, ChevronRight, ShieldCheck, UserRoundPlus } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppleMark, FacebookMark, GoogleMark } from './SocialMarks';
import { shrinkToFit } from '../constants/textFit';
import { authModal as t, colors, font, ink } from '../constants/theme';

// ─────────────────────────────────────────────────────────────────────────────
// ⚠ THESE THREE SCREENS CANNOT SHIP AS DRAWN. REPORTED, BUILT ANYWAY FOR REVIEW.
//
// designs 139, 140 and 141 reproduce Google's, Apple's and Facebook's own account
// choosers as in-app UI. In a real build none of these may be custom screens:
//
//   - Google's identity guidelines require the account chooser to be presented by
//     Google Sign-In / Credential Manager. An app drawing its own copy — showing a
//     Google mark, a Google-styled account row and "Sign in with Google" — is
//     passing off its own UI as Google's.
//   - Apple's App Review Guidelines require Sign in with Apple to use the system
//     sheet (ASAuthorizationController). A custom sheet that mimics it, including
//     the "Share My Email / Hide My Email" choice, is grounds for rejection; that
//     privacy choice is Apple's to present and Apple's to honour.
//   - Facebook Login likewise must go through the SDK's own dialog.
//
// There is also a security reason beyond the policies: a custom sheet that asks for
// provider credentials is indistinguishable from a phishing screen, which is exactly
// why the providers reserve these surfaces.
//
// What ships instead is a single branded BUTTON per provider that hands off to the
// provider's SDK; what the sheet then looks like is not ours to design. The account
// name, email and avatar below are mock data — nothing authenticates here.
// ─────────────────────────────────────────────────────────────────────────────

export type SocialProvider = 'google' | 'apple' | 'facebook';

const ACCOUNT = {
  initials: 'AC',
  name: 'Abhishek Chouhan',
  email: 'abhishek@example.com',
  appleEmail: 'abhishek@icloud.com',
};

type Props = {
  provider: SocialProvider | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SocialSignInModal({ provider, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const [hideEmail, setHideEmail] = useState(false);

  if (!provider) return null;
  const isApple = provider === 'apple';

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, isApple && styles.backdropSheet]} onPress={onClose}>
        <Pressable
          style={[
            isApple ? styles.sheet : styles.card,
            isApple && { paddingBottom: insets.bottom + t.cardPad },
          ]}
          onPress={() => {}}
        >
          {isApple && <View style={styles.grab} />}

          <View style={styles.mark}>
            {provider === 'google' && <GoogleMark size={t.mark} />}
            {provider === 'facebook' && <FacebookMark size={t.mark} />}
            {provider === 'apple' && <AppleMark size={t.mark} />}
          </View>

          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {provider === 'google' && 'Sign in with Google'}
            {provider === 'apple' && 'Sign in with Apple'}
            {provider === 'facebook' && 'Continue with Facebook'}
          </Text>

          <Text style={styles.sub}>
            {provider === 'google' && (
              <>
                Choose an account to continue to{' '}
                <Text style={styles.subBrand}>Legalitt</Text>
              </>
            )}
            {provider === 'apple' && 'Use your Apple ID to continue to Legalitt.'}
            {provider === 'facebook' && 'Use your Facebook account to continue to Legalitt.'}
          </Text>

          {provider === 'google' && (
            <>
              <View style={styles.rule} />
              <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.row}>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{ACCOUNT.initials}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowName} {...shrinkToFit(0.8)}>
                    {ACCOUNT.name}
                  </Text>
                  <Text style={styles.rowSub} {...shrinkToFit(0.8)}>
                    {ACCOUNT.email}
                  </Text>
                </View>
                <ChevronRight size={t.rowChevron} color={colors.textMuted} />
              </Pressable>

              <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.row}>
                <View style={[styles.rowAvatar, styles.rowAvatarPlain]}>
                  <UserRoundPlus size={t.rowAvatarSize + 4} color={colors.textPrimary} />
                </View>
                <Text style={styles.rowName} {...shrinkToFit(0.8)}>
                  Use another account
                </Text>
              </Pressable>

              <Text style={styles.note}>
                By continuing, Google will share your name, email address and profile picture with
                Legalitt.
              </Text>
              <View style={styles.rule} />
            </>
          )}

          {provider === 'facebook' && (
            <>
              <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.fbRow}>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>{ACCOUNT.initials}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowName} {...shrinkToFit(0.8)}>
                    {ACCOUNT.name}
                  </Text>
                  <Text style={styles.rowSub} {...shrinkToFit(0.8)}>
                    Continue as Abhishek
                  </Text>
                </View>
                <ChevronRight size={t.rowChevron} color={colors.textMuted} />
              </Pressable>
              <Text style={styles.note}>
                Facebook sign-in is not available yet.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={onConfirm}
                style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
              >
                <Text style={styles.continueLabel}>Continue</Text>
              </Pressable>
            </>
          )}

          {isApple && (
            <>
              <View style={styles.appleAccount}>
                <View style={styles.rowAvatar}>
                  <Text style={styles.rowAvatarText}>A</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.appleLabel} {...shrinkToFit(0.8)}>
                    APPLE ACCOUNT
                  </Text>
                  <Text style={styles.rowName} {...shrinkToFit(0.75)}>
                    {ACCOUNT.appleEmail}
                  </Text>
                </View>
                <ShieldCheck size={t.rowChevron + 4} color={t.radioOn} fill={t.radioOn} />
              </View>

              <Text style={styles.section} {...shrinkToFit(0.8)}>
                EMAIL PRIVACY PREFERENCE
              </Text>

              {[
                { id: 'share', title: 'Share My Email', sub: ACCOUNT.appleEmail },
                {
                  id: 'hide',
                  title: 'Hide My Email',
                  sub: 'Forward via private Apple relay address',
                },
              ].map((o) => {
                const on = (o.id === 'hide') === hideEmail;
                return (
                  <Pressable
                    key={o.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setHideEmail(o.id === 'hide')}
                    style={styles.option}
                  >
                    <View style={styles.rowText}>
                      <Text style={styles.optionTitle} {...shrinkToFit(0.8)}>
                        {o.title}
                      </Text>
                      <Text style={styles.optionSub} {...shrinkToFit(0.75)}>
                        {o.sub}
                      </Text>
                    </View>
                    <View style={[styles.radio, on && styles.radioSelected]}>
                      {on ? (
                        <Check size={t.radioGlyph} color={ink.onBrand} strokeWidth={3} />
                      ) : (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                onPress={onConfirm}
                style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
              >
                <Text style={styles.continueLabel}>Continue</Text>
              </Pressable>
            </>
          )}

          <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: t.backdrop,
    justifyContent: 'center',
    paddingHorizontal: t.padX,
  },
  backdropSheet: { justifyContent: 'flex-end', paddingHorizontal: 0 },
  card: { borderRadius: t.cardRadius, backgroundColor: colors.card, padding: t.cardPad },
  sheet: {
    borderTopLeftRadius: t.sheetRadius,
    borderTopRightRadius: t.sheetRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.padX,
    paddingTop: 12,
  },
  grab: {
    alignSelf: 'center',
    width: t.grab,
    height: t.grabHeight,
    borderRadius: t.grabHeight / 2,
    marginBottom: 14,
    backgroundColor: t.grabColour,
  },

  mark: { alignItems: 'center' },
  title: {
    marginTop: t.markGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: t.subGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: colors.textBody,
  },
  subBrand: { fontFamily: font.appHeading, color: '#8A6F4B' },

  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.rule },
  row: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center' },
  fbRow: {
    marginTop: t.rowGap,
    borderRadius: t.optionRadius,
    backgroundColor: t.optionBg,
    padding: t.optionPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowAvatar: {
    width: t.rowAvatar,
    height: t.rowAvatar,
    borderRadius: t.rowAvatar / 2,
    backgroundColor: t.rowAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowAvatarPlain: { backgroundColor: '#F1F3F7' },
  rowAvatarText: { fontFamily: font.appSemi, fontSize: t.rowAvatarSize, color: '#8A6F4B' },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowGapX, marginRight: 8 },
  rowName: { fontFamily: font.appHeading, fontSize: t.rowNameSize, color: colors.textPrimary },
  rowSub: {
    marginTop: t.rowSubGap,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    color: colors.textBody,
  },

  note: {
    marginTop: t.noteGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },

  appleAccount: {
    marginTop: t.rowGap,
    borderRadius: t.optionRadius,
    backgroundColor: t.optionBg,
    padding: t.optionPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleLabel: {
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: '#8A6F4B',
  },
  section: {
    marginTop: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  option: {
    marginTop: t.optionGap,
    borderRadius: t.optionRadius,
    backgroundColor: t.optionBg,
    padding: t.optionPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.optionTitleSize,
    color: colors.textPrimary,
  },
  optionSub: {
    marginTop: t.optionSubGap,
    fontFamily: font.appBody,
    fontSize: t.optionSubSize,
    color: colors.textBody,
  },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    backgroundColor: t.radioOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: t.radioOn },
  radioDot: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: colors.card },

  continue: {
    marginTop: t.continueGap,
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: t.continueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  continueLabel: { fontFamily: font.appSemi, fontSize: t.continueSize, color: ink.onBrand },

  cancel: { marginTop: t.cancelGap, alignItems: 'center', paddingVertical: 4 },
  cancelLabel: { fontFamily: font.appBody, fontSize: t.cancelSize, color: colors.textPrimary },
});
