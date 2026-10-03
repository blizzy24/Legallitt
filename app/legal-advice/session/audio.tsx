import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SessionControls from '../../../components/SessionControls';
import { shrinkToFit } from '../../../constants/textFit';
import { LA_ADVOCATE } from '../../../data/legalAdvice';
import { colors, font, laSession as t } from '../../../constants/theme';

// Voice consultation (design/115-la-completed.png — the file name is wrong; the
// batch's numbering is shifted by one).
//
// STATIC MOCK-UP. NO MICROPHONE, NO CALLING SDK. The portrait is a placeholder sized
// to the design's circle and every control is inert. The same scope note as the
// video screen applies: a real consultation needs a calling vendor, which is a
// commercial decision rather than a UI one.

export default function LegalAdviceAudioSessionScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.top, { paddingTop: insets.top + t.backTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice/track'))}
          style={styles.back}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Placeholder for design/115's portrait, sized to its circle. */}
        <View style={styles.photo}>
          <Text style={styles.photoText}>{LA_ADVOCATE.initials}</Text>
        </View>

        <Text style={styles.name} {...shrinkToFit(0.75)}>
          {LA_ADVOCATE.name}
        </Text>
        <Text style={styles.label} {...shrinkToFit(0.8)}>
          Voice Consultation
        </Text>

        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText} {...shrinkToFit(0.8)}>
            Connected
          </Text>
        </View>
        <Text style={styles.timer} {...shrinkToFit(0.8)}>
          29 : 04 min
        </Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + t.controlsGap }]}>
        <SessionControls
          name={LA_ADVOCATE.name}
          elapsed="29:04 min"
          onEnd={() => router.replace('/legal-advice/completed')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.voiceBg },
  top: { paddingHorizontal: t.padX },
  back: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { alignItems: 'center', paddingHorizontal: t.padX },
  photo: {
    marginTop: t.photoTop,
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  name: {
    marginTop: t.nameGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  label: {
    marginTop: t.labelGap,
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    color: colors.textBody,
  },
  status: { marginTop: t.statusGap, flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
    backgroundColor: t.statusColour,
  },
  statusText: { fontFamily: font.appBody, fontSize: t.statusSize, color: t.statusColour },
  timer: {
    marginTop: t.timerGap,
    fontFamily: font.appHeading,
    fontSize: t.timerSize,
    color: colors.textPrimary,
  },
  bottom: { marginTop: 'auto', paddingHorizontal: t.padX },
});
