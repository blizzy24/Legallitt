import { router } from 'expo-router';
import { ArrowRight, BadgeCheck, Check, Lock, SquareArrowOutUpRight, Workflow } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, dlConnect as t, font, ink } from '../../../constants/theme';

// Connect DigiLocker (design/93).
//
// The illustration is a sized placeholder — no asset, so the box matches the file's
// artwork and a real image drops in without moving anything.
//
// "Continue to DigiLocker" goes to the checking screen. Nothing actually leaves the
// app: there is no DigiLocker integration and the caption's promise that you will
// leave Legalitt is copy only.

const STEPS = [
  {
    title: 'Open DigiLocker',
    body: 'You will be redirected safely to the government DigiLocker portal.',
  },
  {
    title: 'Sign in and give permission',
    body: 'Log in with your phone or Aadhaar and approve document sharing.',
  },
  {
    title: 'Come back to Legalitt',
    body: 'We will confirm your details and continue your legal process automatically.',
  },
];

const BENEFITS = [
  { title: 'Easy document sharing', body: 'Instant transfer directly from your government locker' },
  { title: 'Digital documents', body: '100% verified, legally recognized electronic records' },
  { title: 'No need to upload files manually', body: 'No paper scanning or photography required' },
];

export default function DigilockerConnectScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KycHeader title="Connect Digilocker" sub="Encrypted Session" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.strip}>
          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              IDENTITY STEP 1 OF 3
            </Text>
          </View>
          <View style={styles.safe}>
            <BadgeCheck size={t.safeIcon} color={t.safeText} />
            <Text style={styles.safeText} {...shrinkToFit(0.8)}>
              Safe &amp; Official
            </Text>
          </View>
        </View>

        {/* Placeholder — sized to design/93's artwork box. */}
        <View style={styles.art} />

        <Text style={styles.heading}>Verify with DigiLocker</Text>
        <Text style={styles.body}>
          Use your DigiLocker documents to verify your identity quickly and securely.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}>
              <Workflow size={t.cardIconGlyph} color={ink.accent} />
            </View>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              How It Works
            </Text>
          </View>

          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <View key={s.title} style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepCircleText}>{i + 1}</Text>
                  </View>
                  {!last && <View style={styles.stepLine} />}
                </View>
                <View style={[styles.stepText, !last && styles.stepTextGap]}>
                  <Text style={styles.stepTitle} {...shrinkToFit(0.8)}>
                    {s.title}
                  </Text>
                  <Text style={styles.stepBody}>{s.body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, styles.cardTitleSolo]} {...shrinkToFit(0.8)}>
              Why Use DigiLocker?
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                Official &amp; Fast
              </Text>
            </View>
          </View>

          {BENEFITS.map((bn) => (
            <View key={bn.title} style={styles.tickRow}>
              <Check size={t.tickIcon} color={t.tickColour} strokeWidth={3} />
              <View style={styles.tickText}>
                <Text style={styles.tickTitle} {...shrinkToFit(0.8)}>
                  {bn.title}
                </Text>
                <Text style={styles.tickBody}>{bn.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.privacy}>
          <View style={styles.privacyIcon}>
            <Lock size={t.privacyIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.privacyText}>
            <Text style={styles.privacyLabel} {...shrinkToFit(0.8)}>
              PRIVACY
            </Text>
            <Text style={styles.privacyBody}>
              Your information will only be used for verification. We never store your passwords or
              master credentials.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/kyc/digilocker/checking')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue to DigiLocker</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.caption}>
          <SquareArrowOutUpRight size={t.captionIcon} color={colors.textBody} />
          <Text style={styles.captionText} {...shrinkToFit(0.8)}>
            You will leave Legalitt for this step.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  strip: {
    marginTop: t.stripTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: colors.textBody,
  },
  safe: {
    marginLeft: 10,
    minHeight: t.safeHeight,
    borderRadius: t.safeRadius,
    paddingHorizontal: t.safePadX,
    backgroundColor: t.safeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  safeText: {
    marginLeft: t.safeIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.safeSize,
    color: t.safeText,
  },
  art: {
    marginTop: t.artTop,
    alignSelf: 'center',
    width: t.art,
    height: t.art,
    borderRadius: t.artRadius,
    backgroundColor: t.artBg,
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: t.cardIcon,
    height: t.cardIcon,
    borderRadius: t.cardIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginLeft: t.cardIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  cardTitleSolo: { marginLeft: 0, flex: 1 },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textBody },
  stepRow: { marginTop: t.stepGap, flexDirection: 'row' },
  stepRail: { alignItems: 'center' },
  stepCircle: {
    width: t.stepCircle,
    height: t.stepCircle,
    borderRadius: t.stepCircle / 2,
    backgroundColor: t.stepCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    fontFamily: font.appSemi,
    fontSize: t.stepCircleSize,
    color: colors.textBody,
  },
  stepLine: { flex: 1, width: t.stepLine, marginTop: 4, backgroundColor: colors.border },
  stepText: { flex: 1, minWidth: 0, marginLeft: t.stepGapX },
  stepTextGap: { paddingBottom: 4 },
  stepTitle: { fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: colors.textPrimary },
  stepBody: {
    marginTop: t.stepBodyGap,
    fontFamily: font.appBody,
    fontSize: t.stepBodySize,
    lineHeight: t.stepBodyLineHeight,
    color: colors.textBody,
  },
  tickRow: { marginTop: t.tickGap, flexDirection: 'row', alignItems: 'flex-start' },
  tickText: { flex: 1, minWidth: 0, marginLeft: t.tickIconGap },
  tickTitle: { fontFamily: font.appHeading, fontSize: t.tickTitleSize, color: colors.textPrimary },
  tickBody: {
    marginTop: t.tickBodyGap,
    fontFamily: font.appBody,
    fontSize: t.tickBodySize,
    lineHeight: t.tickBodyLineHeight,
    color: colors.textBody,
  },
  privacy: {
    marginTop: t.privacyGap,
    borderRadius: t.privacyRadius,
    backgroundColor: t.privacyBg,
    padding: t.privacyPad,
    flexDirection: 'row',
  },
  privacyIcon: {
    width: t.privacyIcon,
    height: t.privacyIcon,
    borderRadius: t.privacyIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: { flex: 1, minWidth: 0, marginLeft: t.privacyIconGap },
  privacyLabel: {
    fontFamily: font.appSemi,
    fontSize: t.privacyLabelSize,
    letterSpacing: t.privacyLabelSpacing,
    color: colors.textPrimary,
  },
  privacyBody: {
    marginTop: t.privacyBodyGap,
    fontFamily: font.appBody,
    fontSize: t.privacyBodySize,
    lineHeight: t.privacyBodyLineHeight,
    color: colors.textBody,
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
  caption: {
    marginTop: t.captionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    marginLeft: t.captionIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});
