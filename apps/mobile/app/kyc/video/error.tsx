import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Headset,
  Info,
  Lock,
  RotateCw,
  Scan,
  SlidersHorizontal,
  Sun,
  VideoOff,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, font, ink, vkycError as t } from '../../../constants/theme';

// Video KYC failure (design/100). Light theme.
//
// NOTHING IN THE PROTOTYPE REACHES THIS SCREEN ON ITS OWN — no check can fail when
// there is no camera and no verification vendor. It is reachable from the capture
// screen's DEV_PREVIEW_TOGGLES link, and directly by route.
//
// REPORTED — "Attempt 1 of 3" implies a retry budget that nothing tracks here, and
// the design gives no screen for attempt 3 of 3 being spent. What happens when the
// retries run out is undesigned; "Use Another Verification Method" is the only exit
// drawn, and it is not described as the forced one.
//
// The frame-reference photograph is a placeholder block sized to the design's box,
// with the dashed oval and the "Keep Centered" label drawn on top — same treatment as
// the camera feeds on device-check and capture.

const REASONS = [
  { label: 'Lighting was too dim', icon: Sun },
  { label: 'Face moved out of frame', icon: Scan },
];

const TIPS = [
  {
    title: 'Face a soft lamp or natural window',
    body: 'Avoid strong light behind you so your face isn’t cast in deep shadows.',
  },
  {
    title: 'Hold your phone at eye level',
    body: 'Keep your head straight and neutral, just like taking an official passport photo.',
  },
  {
    title: 'Stay inside the oval guide',
    body: 'Hold steady until the circular check turns green to lock your capture.',
  },
];

export default function VideoKycErrorScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KycHeader title="Device & Permission Check" sub="Encrypted Session" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.75)}>
              IDENTITY STEP 2 OF 3
            </Text>
          </View>
          <View style={styles.enc}>
            <Lock size={t.encIcon} color={t.encText} />
            <Text style={styles.encText} {...shrinkToFit(0.8)}>
              Encrypted ID
            </Text>
          </View>
        </View>

        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <VideoOff size={t.iconGlyph} color={t.iconColour} />
          </View>
          <View style={styles.retry}>
            <RotateCw size={t.retryGlyph} color={t.retryColour} />
          </View>
        </View>

        <Text style={styles.heading}>Video Check Could Not Be Completed</Text>
        <Text style={styles.body}>
          Please try again. Your information and progress remain safe.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.whatChip}>
              <Info size={t.reasonIcon} color={colors.textBody} />
              <Text style={styles.whatChipText} {...shrinkToFit(0.8)}>
                What Happened
              </Text>
            </View>
            <Text style={styles.attempt} {...shrinkToFit(0.8)}>
              Attempt 1 of 3
            </Text>
          </View>

          <Text style={styles.cardHeading}>Camera view was not clear</Text>
          <Text style={styles.cardBody}>
            We could not get a sharp, well-lit picture of your face to match your official
            legal document.
          </Text>

          {REASONS.map((r) => (
            <View key={r.label} style={styles.reason}>
              <r.icon size={t.reasonIcon} color={colors.textBody} />
              <Text style={styles.reasonText} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
            </View>
          ))}

          <View style={styles.reassure}>
            <BadgeCheck size={t.reassureIcon} color={t.encText} />
            <Text style={styles.reassureText}>
              No worries — your verification data and previous documents are securely stored.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.tipTitle} {...shrinkToFit(0.8)}>
              Tips for Next Try
            </Text>
            <Text style={styles.attempt} {...shrinkToFit(0.8)}>
              Takes ~45s
            </Text>
          </View>

          {TIPS.map((tip, i) => (
            <View key={tip.title} style={styles.tip}>
              <View style={styles.tipCircle}>
                <Text style={styles.tipCircleText}>{i + 1}</Text>
              </View>
              <View style={styles.tipText}>
                <Text style={styles.tipRowTitle}>{tip.title}</Text>
                <Text style={styles.tipBody}>{tip.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.frameLabel} {...shrinkToFit(0.8)}>
              FRAME REFERENCE
            </Text>
            <View style={styles.target}>
              <View style={styles.targetDot} />
              <Text style={styles.targetText} {...shrinkToFit(0.8)}>
                Target Framing
              </Text>
            </View>
          </View>

          <View style={styles.photo}>
            {/* Placeholder for design/100's reference photograph, sized to its box. */}
            <View style={styles.oval} />
            <View style={styles.keep}>
              <Text style={styles.keepText} {...shrinkToFit(0.8)}>
                Keep Centered
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={styles.support}
        >
          <Headset size={t.supportIconGlyph} color={colors.textBody} />
          <Text style={styles.supportText} {...shrinkToFit(0.75)}>
            Having trouble? Support is online
          </Text>
          <Text style={styles.supportLink} {...shrinkToFit(0.8)}>
            Live Chat
          </Text>
          <ArrowRight size={t.supportIconGlyph - 4} color={colors.textPrimary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/kyc/video/capture')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Try Again</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/kyc/choose')}
          style={({ pressed }) => [styles.alt, pressed && styles.pressed]}
        >
          <SlidersHorizontal size={t.altIcon} color={colors.textPrimary} />
          <Text style={styles.altLabel}>Use Another Verification Method</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  pillRow: {
    marginTop: t.pillTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 7,
    backgroundColor: colors.brandDark,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: colors.textBody,
  },
  enc: { marginLeft: 10, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  encText: {
    marginLeft: t.encIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize + 0.5,
    color: t.encText,
  },
  iconRing: {
    marginTop: t.iconTop,
    alignSelf: 'center',
    width: t.icon,
    height: t.icon,
    borderRadius: t.icon / 2,
    backgroundColor: t.iconRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: t.iconInner,
    height: t.iconInner,
    borderRadius: t.iconInner / 2,
    backgroundColor: t.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retry: {
    position: 'absolute',
    right: -2,
    bottom: 4,
    width: t.retryBadge,
    height: t.retryBadge,
    borderRadius: t.retryBadge / 2,
    backgroundColor: t.retryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
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
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  whatChip: {
    minHeight: t.reasonHeight,
    borderRadius: t.reasonRadius,
    paddingHorizontal: t.reasonPadX,
    backgroundColor: t.reasonBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  whatChipText: {
    marginLeft: t.reasonIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.reasonSize,
    color: colors.textBody,
  },
  attempt: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.attemptSize,
    color: colors.textBody,
  },
  cardHeading: {
    marginTop: t.cardHeadingGap,
    fontFamily: font.appHeading,
    fontSize: t.cardHeadingSize,
    color: colors.textPrimary,
  },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  reason: {
    marginTop: t.reasonGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.reasonHeight,
    borderRadius: t.reasonRadius,
    paddingHorizontal: t.reasonPadX,
    backgroundColor: t.reasonBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonText: {
    marginLeft: t.reasonIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.reasonSize,
    color: colors.textPrimary,
  },
  reassure: {
    marginTop: t.reassureGap,
    borderRadius: t.reasonRadius,
    backgroundColor: t.reasonBg,
    padding: t.cardPad - 4,
    flexDirection: 'row',
  },
  reassureText: {
    marginLeft: t.reassureIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.reassureSize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  tipTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cardHeadingSize,
    color: colors.textPrimary,
  },
  tip: {
    marginTop: t.tipRowGap,
    borderRadius: t.reasonRadius,
    backgroundColor: t.reasonBg,
    padding: t.cardPad - 4,
    flexDirection: 'row',
  },
  tipCircle: {
    width: t.tipCircle,
    height: t.tipCircle,
    borderRadius: t.tipCircle / 2,
    backgroundColor: t.tipCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCircleText: {
    fontFamily: font.appSemi,
    fontSize: t.tipCircleSize,
    color: colors.brandDark,
  },
  tipText: { flex: 1, minWidth: 0, marginLeft: t.tipGapX },
  tipRowTitle: {
    fontFamily: font.appHeading,
    fontSize: t.tipTitleSize,
    color: colors.textPrimary,
  },
  tipBody: {
    marginTop: t.tipBodyGap,
    fontFamily: font.appBody,
    fontSize: t.tipBodySize,
    lineHeight: t.tipBodyLineHeight,
    color: colors.textBody,
  },
  frameLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.frameLabelSize,
    letterSpacing: t.frameLabelSpacing,
    color: colors.textBody,
  },
  target: { marginLeft: 10, flexDirection: 'row', alignItems: 'center' },
  targetDot: { width: 7, height: 7, borderRadius: 3.5, marginRight: 7, backgroundColor: t.encText },
  targetText: { fontFamily: font.appSemi, fontSize: t.frameTargetSize, color: t.encText },
  photo: {
    marginTop: t.framePhotoGap,
    height: t.framePhoto,
    borderRadius: t.framePhotoRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oval: {
    position: 'absolute',
    width: t.frameOvalW,
    height: t.frameOvalH,
    borderRadius: t.frameOvalW / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.card,
  },
  keep: {
    minHeight: t.frameKeepHeight,
    borderRadius: t.frameKeepRadius,
    paddingHorizontal: t.frameKeepPadX,
    backgroundColor: 'rgba(40,33,24,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepText: { fontFamily: font.appSemi, fontSize: t.frameKeepSize, color: ink.onBrand },
  support: {
    marginTop: t.supportGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    marginLeft: t.supportIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.supportTitleSize,
    color: colors.textBody,
  },
  supportLink: {
    marginHorizontal: 6,
    fontFamily: font.appSemi,
    fontSize: t.supportLinkSize,
    color: colors.textPrimary,
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
  alt: {
    marginTop: t.altGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.altBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  altLabel: {
    marginLeft: t.altIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize - 1,
    color: colors.textPrimary,
  },
});
