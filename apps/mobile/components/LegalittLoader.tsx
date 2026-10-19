import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import AiFlowerMark from './AiFlowerMark';
import { font, loader as l } from '../constants/theme';

// The Legalitt loader (design/motion/load.mp4): the gold mark turning in steps —
// hold, then one fast 60° step (six-fold symmetry makes it read as a full turn),
// every 1.5 s — and "LEGALITT" typing beneath it on its own 1.17 s loop. The two
// loops are deliberately not synced.

/** The mark alone, stepping. */
export function SteppingMark({ size = l.mark }: { size?: number }) {
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(l.holdMs),
        Animated.timing(turn, { toValue: 1, duration: l.stepMs, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [turn]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${l.stepDeg}deg`] });
  return (
    <Animated.View accessibilityRole="progressbar" style={{ transform: [{ rotate }] }}>
      <AiFlowerMark size={size} colors={[l.gold.start, l.gold.end]} phase={l.phase} />
    </Animated.View>
  );
}

/** "LEGALITT", typing: left-anchored, so the finished word is the one that is centred. */
function TypingWord() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const id = setTimeout(() => setN((k) => (k >= l.word.length ? 1 : k + 1)), n >= l.word.length ? l.wordHoldMs : l.letterMs);
    return () => clearTimeout(id);
  }, [n]);
  return (
    <View>
      {/* The full word, invisible, sets the box; the typed letters grow rightward from its left edge. */}
      <Text style={[styles.word, styles.hidden]}>{l.word}</Text>
      <Text style={[styles.word, styles.typed]}>{l.word.slice(0, n)}</Text>
    </View>
  );
}

export default function LegalittLoader() {
  return (
    <View style={styles.fill}>
      {/* The mark is centred on both axes; the word hangs below it. */}
      <View>
        <SteppingMark />
        <View style={styles.below}>
          <TypingWord />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: l.bg, alignItems: 'center', justifyContent: 'center' },
  below: { position: 'absolute', top: l.mark + l.textTop, left: -l.mark, right: -l.mark, alignItems: 'center' },
  word: { fontFamily: font.appBody, fontSize: l.fontSize, lineHeight: l.lineHeight, color: l.ink },
  hidden: { opacity: 0 },
  typed: { position: 'absolute', left: 0, top: 0 },
});
