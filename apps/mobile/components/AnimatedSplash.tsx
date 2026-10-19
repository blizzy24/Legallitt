import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

import AiFlowerMark from './AiFlowerMark';
import { SPLASH_FADE_MS, SPLASH_MIN_DURATION_MS, SPLASH_WARM_HOLD_MS } from '../constants/dev';
import { splash as s } from '../constants/theme';

// The animated splash (design/motion/open.mp4), layered after the native one.
//
//   0.00–0.20  black
//   0.20–0.45  the mark appears at 22% size, centred
//   0.45–0.67  grows to full size (ease-out)
//   0.67–1.90  holds
//   1.90–2.90  the mark slides left while "Legalitt" wipes in to its right —
//              one clip whose width animates, not per-letter fades — with a
//              small overshoot peaking ~2.70
//   2.90–4.565 holds the lockup
//
// `warm`: the splash already ran this session, so it jumps to the lockup once
// the app is ready and holds it briefly. Otherwise it runs at least
// SPLASH_MIN_DURATION_MS, and holds the lockup until the app is ready.

const WORDMARK = require('../assets/legalitt-wordmark-white.png');

/** How far right of its final place the lockup row starts, so the mark begins centred. */
const SHIFT = (s.gap + s.wordmarkW) / 2;

export default function AnimatedSplash({
  ready,
  warm,
  onMounted,
  onDone,
  freezeAt,
}: {
  ready: boolean;
  warm: boolean;
  onMounted: () => void;
  onDone: () => void;
  /** DEVELOPMENT ONLY (app/dev/splash.tsx): hold the timeline at this second. */
  freezeAt?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const started = useRef(Date.now());
  const finishing = useRef(false);

  const finish = (after: number) => {
    if (finishing.current) return;
    finishing.current = true;
    setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: SPLASH_FADE_MS, useNativeDriver: false }).start(() => onDone());
    }, after);
  };

  useEffect(() => {
    if (freezeAt !== undefined) {
      t.setValue(freezeAt);
      return;
    }
    if (warm) return;
    const run = Animated.timing(t, { toValue: s.end, duration: s.end * 1000, easing: Easing.linear, useNativeDriver: false });
    run.start();
    return () => run.stop();
  }, [t, warm, freezeAt]);

  useEffect(() => {
    if (!ready) return;
    if (warm) {
      t.setValue(s.slideTo);
      finish(SPLASH_WARM_HOLD_MS);
      return;
    }
    finish(Math.max(0, SPLASH_MIN_DURATION_MS - (Date.now() - started.current)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, warm]);

  const opacity = t.interpolate({ inputRange: [s.appearAt - 0.001, s.appearAt], outputRange: [0, 1], extrapolate: 'clamp' });
  const scale = t.interpolate({ inputRange: [s.growFrom, s.growTo], outputRange: [s.startScale, 1], easing: Easing.out(Easing.cubic), extrapolate: 'clamp' });
  const slide = t.interpolate({ inputRange: [s.slideFrom, s.slideTo], outputRange: [0, 1], easing: Easing.out(Easing.back(s.overshoot)), extrapolate: 'clamp' });
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [SHIFT, 0] });
  const wipe = slide.interpolate({ inputRange: [0, 1], outputRange: [0, s.wordmarkW] });

  return (
    <Animated.View style={[styles.fill, { opacity: fade }]} onLayout={onMounted} pointerEvents="none">
      <Animated.View style={[styles.row, { opacity, transform: [{ translateX }] }]}>
        <Animated.View style={[styles.mark, { transform: [{ scale }] }]}>
          <AiFlowerMark size={s.mark} colors={[s.gold.start, s.gold.end]} />
        </Animated.View>
        <Animated.View style={[styles.clip, { width: wipe }]}>
          <Image source={WORDMARK} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Legalitt" />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden', backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', width: s.markVisibleW + s.gap + s.wordmarkW },
  // The square box is wider than the visible ring; pull it in so the ring's edge is the row's edge.
  mark: { width: s.mark, height: s.mark, marginHorizontal: -(s.mark - s.markVisibleW) / 2 },
  clip: { marginLeft: s.gap, height: s.wordmarkH, overflow: 'hidden' },
  wordmark: { width: s.wordmarkW, height: s.wordmarkH },
});
