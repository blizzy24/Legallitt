import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SessionControls from '../../../components/SessionControls';
import { LA_ADVOCATE } from '../../../data/legalAdvice';
import { colors, font, laSession as t, vkycDark as d } from '../../../constants/theme';

// Video consultation (design/114-la-session-voice.png — the file name is wrong; the
// batch's numbering is shifted by one).
//
// ─────────────────────────────────────────────────────────────────────────────
// STATIC MOCK-UP. NO CAMERA, NO CALLING SDK, NO CAPTURE CODE. The design shows a
// full-bleed photograph of the advocate and a self-view thumbnail; both are neutral
// placeholder blocks sized to the drawn frames, exactly as on the Video KYC screens.
//
// SCOPE, NOT UI: a real consultation needs a calling vendor — who hosts the media,
// how calls are joined and rejoined, what happens on a dropped connection, whether
// sessions are recorded and where recordings live. Those decide the controls this
// screen draws. None of it is a design question.
//
// The feed placeholder reuses vkycDark.feed so the app has ONE neutral-block colour
// rather than two.
// ─────────────────────────────────────────────────────────────────────────────

export default function LegalAdviceVideoSessionScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      {/* Placeholder for design/114's full-bleed photograph. Never a real feed. */}
      <View style={styles.feed} />

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

        {/* Self-view placeholder, sized to the design's thumbnail. */}
        <View style={styles.self}>
          <Text style={styles.selfText}>You</Text>
        </View>
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
  screen: { flex: 1, backgroundColor: d.feed },
  feed: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: d.feed },
  top: {
    paddingHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  back: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  self: {
    width: t.selfW,
    height: t.selfH,
    borderRadius: t.selfRadius,
    backgroundColor: d.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfText: { fontFamily: font.appBody, fontSize: 12, color: d.textDim },
  bottom: { marginTop: 'auto', paddingHorizontal: t.padX },
});
