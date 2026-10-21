import { router } from 'expo-router';
import { BadgeCheck } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { ONBOARDING_AVATARS, ONBOARDING_SLIDES } from '../../data/onboarding';
import { font, ink, onboarding as t } from '../../constants/theme';
import { useSession } from '../../context/session';

// Client onboarding (design/125-130): six slides, one layout, one horizontally-paged
// carousel rather than six routes.
//
// ─────────────────────────────────────────────────────────────────────────────
// NO IMAGE ASSETS EXIST. Every photograph is a neutral placeholder block at exactly
// the size and position the designs draw, so real art drops in without moving
// anything. The full list of what to request is in data/onboarding.ts.
//
// REPORTED — SLIDE 1 HAS SIX AVATARS, NOT SEVEN. Counted twice on design/125, once
// as image blobs and once as blue badges; both give six. Their measured positions
// are in ONBOARDING_AVATARS.
//
// REPORTED — THE PAGER IS CORRECT IN EVERY DESIGN. Slide N lights dot N on all six
// files, design/127 included. Measured by comparing the darkness of all six dots on
// each file; there was no file error to work around.
//
// Design 130 keeps the same "Next" button as the other five slides.
// Confirmed sign-in order: its final action opens role selection. There is no
// drawn Skip control, so none is added.
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scroller = useRef<ScrollView>(null);

  const last = ONBOARDING_SLIDES.length - 1;
  const { setHasSeenOnboarding } = useSession();

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < last) {
      scroller.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
      return;
    }
    setHasSeenOnboarding(true);
    router.replace('/(auth)/role');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {ONBOARDING_SLIDES.map((slide, i) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            {i === 0 ? (
              <View style={styles.cluster}>
                {ONBOARDING_AVATARS.map((a, j) => (
                  <View key={j} style={[styles.avatarWrap, { left: a.x, top: a.y }]}>
                    {/* Placeholder for design/125's portrait, at the drawn size. */}
                    <View
                      style={[
                        styles.avatar,
                        { width: a.size, height: a.size, borderRadius: a.size / 2 },
                      ]}
                    />
                    <BadgeCheck
                      size={a.badge}
                      color={t.badgeRing}
                      fill={t.badgeColour}
                      style={[
                        styles.badge,
                        { left: a.badgeX - a.badge / 2, top: a.badgeY - a.badge / 2 },
                      ]}
                    />
                  </View>
                ))}
              </View>
            ) : (
              /* Placeholder for the slide's hero photograph, at the drawn size. */
              <View style={styles.circle} />
            )}

            <View style={styles.text}>
              <Text style={styles.title}>{slide.title}</Text>
              {slide.tagline && (
                <Text style={styles.tagline} {...shrinkToFit(0.75)}>
                  {slide.tagline}
                </Text>
              )}
              <Text style={styles.body}>{slide.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + t.buttonGap }]}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={next}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          {/* design/130 draws "Next" on the last slide too — see the note above. */}
          <Text style={styles.buttonLabel}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  pager: { flex: 1 },
  slide: { alignItems: 'center' },

  circle: {
    marginTop: t.circleTop,
    width: t.circle,
    height: t.circle,
    borderRadius: t.circle / 2,
    backgroundColor: t.circleBg,
  },
  cluster: { width: '100%', height: t.clusterHeight },
  avatarWrap: { position: 'absolute' },
  avatar: { backgroundColor: t.avatarBg },
  badge: { position: 'absolute' },

  text: { marginTop: 0, paddingHorizontal: t.padX, alignSelf: 'stretch' },
  title: {
    marginTop: t.titleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    lineHeight: t.titleLineHeight,
    color: t.titleColour,
  },
  tagline: {
    marginTop: t.taglineGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.taglineSize,
    lineHeight: t.taglineLineHeight,
    color: t.taglineColour,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: t.bodyColour,
  },

  footer: { paddingHorizontal: t.buttonPadX },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: t.dotGap },
  dot: {
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    backgroundColor: t.dotOff,
  },
  dotOn: { backgroundColor: t.dotOn },
  button: {
    marginTop: t.dotsGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: ink.onBrand },
});
