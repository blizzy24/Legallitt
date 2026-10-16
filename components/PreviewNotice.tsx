import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, previewNotice as n } from '../constants/theme';

// One shared notice for an action this build does not implement (copy, download,
// share, upload, voice and camera, telephony, filters, AI, and the court
// operations): "<Action> is not available in this preview." Neutral, no dates,
// no "coming soon". Call previewNotice(label) from any onPress; the host is
// mounted once in app/_layout.tsx.

type Listener = (text: string) => void;
let listener: Listener | null = null;

/** Tidy a drawn label into an action name: "+ Upload NOC" → "Upload NOC". */
function actionName(label?: string) {
  const s = (label ?? '').replace(/\s+/g, ' ').replace(/^[+•\s]+/, '').replace(/\s*[→›>]+$/, '').trim();
  return s || n.fallback;
}

/** Show the preview notice for `label`. */
export function previewNotice(label?: string) {
  listener?.(`${actionName(label)} ${n.suffix}`);
}

export function PreviewNoticeHost() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listener = (t) => {
      setText(t);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(fade, { toValue: 1, duration: n.fadeMs, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(fade, { toValue: 0, duration: n.fadeMs, useNativeDriver: true }).start(() => setText(null));
      }, n.showMs);
    };
    return () => {
      listener = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [fade]);

  if (text === null) return null;
  return (
    <Animated.View pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.wrap, { bottom: insets.bottom + n.bottom, opacity: fade }]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: n.inset, right: n.inset, alignItems: 'center' },
  text: {
    overflow: 'hidden',
    borderRadius: n.radius,
    paddingHorizontal: n.padX,
    paddingVertical: n.padY,
    backgroundColor: n.bg,
    color: n.ink,
    fontFamily: font.appBody,
    fontSize: n.size,
    lineHeight: n.line,
    textAlign: 'center',
  },
});
