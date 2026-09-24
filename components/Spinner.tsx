import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { colors, scanPay as s } from '../constants/theme';

// Indeterminate ring (design/29 "Waiting for payment…"): a light track with a dark
// quarter arc, rotating.
export default function Spinner({ size = s.spinner }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      accessibilityRole="progressbar"
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2, transform: [{ rotate }] }]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: s.spinnerStroke,
    borderColor: s.spinnerTrack,
    borderTopColor: colors.textPrimary,
  },
});
