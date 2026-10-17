import { router } from 'expo-router';
import { ArrowRight, Check, Clock, ClipboardCheck, Lock, ShieldAlert, Video } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, font, ink, vkycIntro as t } from '../../../constants/theme';

// Video KYC intro (design/96). Light theme.
//
// NO CAMERA CODE ANYWHERE IN THIS BRANCH. The illustration is a sized placeholder and
// the camera feeds on the later screens are neutral blocks with the overlays drawn on
// top. Real video KYC needs a liveness SDK and a verification vendor — see the note
// in app/kyc/video/capture.tsx; that is a scope question, not a UI one.
//
// REPORTED — design/96 breaks the Important card's copy across lines one or two words
// at a time ("Follow the / instructions / shown / during the / video / check. It /
// takes less / than 2 / minutes."). That is a layout artefact in the file, not
// intended line breaks; rendered as normal flowing text.

const CHECKS = [
  'Keep your ID document ready',
  'Sit in a well-lit place',
  'Use a working camera',
  'Make sure your face is clearly visible',
  'Use a stable internet connection',
];

export default function VideoKycIntroScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <KycHeader title="Device & Permission Check" sub="Encrypted Session" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.artWrap}>
          {/* Placeholder — sized to design/96's artwork box. */}
          <View style={styles.artInner} />
          <View style={styles.tickBadge}>
            <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
          <View style={styles.videoBadge}>
            <Video size={t.badgeGlyph} color={ink.onBrand} />
          </View>
        </View>

        <View style={styles.pill}>
          <Video size={t.pillIcon} color={t.pillText} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            STEP 1 OF 3
          </Text>
        </View>

        <Text style={styles.heading}>Verify Your Identity by Video</Text>
        <Text style={styles.body}>Complete a short video check to verify your identity.</Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <ClipboardCheck size={t.cardIcon} color={ink.accent} />
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Before You Start
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                5 Quick Checks
              </Text>
            </View>
          </View>

          {CHECKS.map((c) => (
            <View key={c} style={styles.tickRow}>
              <View style={styles.tickCircle}>
                <Check size={t.tickGlyph} color={t.tickColour} strokeWidth={3} />
              </View>
              <Text style={styles.tickText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={styles.important}>
          <View style={styles.importantIcon}>
            <ShieldAlert size={t.importantIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.importantText}>
            <Text style={styles.importantTitle} {...shrinkToFit(0.8)}>
              Important
            </Text>
            <Text style={styles.importantBody}>
              Follow the instructions shown during the video check. It takes less than 2 minutes.
            </Text>
          </View>
        </View>

        <View style={styles.foot}>
          <Lock size={t.footIcon} color={colors.textBody} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            High-assurance encrypted identity pipeline
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/kyc/video/device-check')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Check Phone &amp; Camera</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        <View style={styles.caption}>
          <Clock size={t.captionIcon} color={colors.textBody} />
          <Text style={styles.captionText} {...shrinkToFit(0.8)}>
            Estimated time: ~2 minutes
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  artWrap: {
    marginTop: t.artTop,
    alignSelf: 'center',
    width: t.art,
    height: t.art,
    borderRadius: t.art / 2,
    backgroundColor: t.artBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artInner: {
    width: t.artInner,
    height: t.artInner * 0.78,
    borderRadius: t.artInnerRadius,
    backgroundColor: colors.card,
  },
  tickBadge: {
    position: 'absolute',
    left: 44,
    top: 46,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: '#22B14C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBadge: {
    position: 'absolute',
    right: 44,
    bottom: 56,
    width: t.badge,
    height: t.badge,
    borderRadius: 9,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    marginTop: t.pillGap,
    alignSelf: 'center',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: t.pillIconGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: t.pillText,
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
  cardTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.cardIconGap,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipText },
  tickRow: { marginTop: t.tickGap, flexDirection: 'row', alignItems: 'center' },
  tickCircle: {
    width: t.tickCircle,
    height: t.tickCircle,
    borderRadius: t.tickCircle / 2,
    backgroundColor: t.tickCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tickIconGap,
    fontFamily: font.appBody,
    fontSize: t.tickSize,
    color: colors.textPrimary,
  },
  important: {
    marginTop: t.importantGap,
    borderRadius: t.importantRadius,
    backgroundColor: t.importantBg,
    padding: t.importantPad,
    flexDirection: 'row',
  },
  importantIcon: {
    width: t.importantIcon,
    height: t.importantIcon,
    borderRadius: t.importantIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importantText: { flex: 1, minWidth: 0, marginLeft: t.importantIconGap },
  importantTitle: {
    fontFamily: font.appHeading,
    fontSize: t.importantTitleSize,
    color: colors.textPrimary,
  },
  importantBody: {
    marginTop: t.importantBodyGap,
    fontFamily: font.appBody,
    fontSize: t.importantBodySize,
    lineHeight: t.importantBodyLineHeight,
    color: colors.textBody,
  },
  foot: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
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
