import { Play } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { HOME_VIDEOS } from '../data/homeVideos';
import { homeVideo as t, ink } from '../constants/theme';

// The home video carousel (design/145 and design/146).
//
// ─────────────────────────────────────────────────────────────────────────────
// STATIC MOCK-UP. NO PLAYER, NO VIDEO LIBRARY. The play button is inert.
//
// SCOPE, NOT UI: real video is new capability, not a layout change. It needs
//   - an embedded player (expo-video, or react-native-youtube-iframe for embeds),
//   - a content source — who produces the videos and where the list comes from,
//   - and a decision on hosting: self-hosted files, or YouTube embeds. That one is
//     not cosmetic. YouTube embeds bring Google's player, its data collection and
//     its related-video behaviour inside the app, and on iOS they must honour
//     YouTube's terms; self-hosting means storage, transcoding and bandwidth.
// None of that is specified anywhere in the designs, so none of it is built here.
// ─────────────────────────────────────────────────────────────────────────────

export default function VideoCarousel() {
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / t.width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        {HOME_VIDEOS.map((v) => (
          <View key={v.id} style={styles.slide}>
            {/* Placeholder for the thumbnail, at exactly the drawn size. */}
            <View style={styles.thumb} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Play: ${v.title}`}
              style={styles.play}
            >
              <Play size={t.playGlyph} color={ink.onBrand} fill={ink.onBrand} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots} pointerEvents="none">
        {HOME_VIDEOS.map((v, i) => (
          <View key={v.id} style={[styles.dot, i === index && styles.dotOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: t.gap, width: t.width, height: t.height },
  pager: { width: t.width, height: t.height, borderRadius: t.radius },
  slide: {
    width: t.width,
    height: t.height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: t.radius,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.bg,
  },
  play: {
    width: t.play,
    height: t.play,
    borderRadius: t.playRadius,
    backgroundColor: t.playBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: t.dotsBottom,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: t.dotGap,
  },
  dot: {
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    backgroundColor: t.dotOff,
  },
  dotOn: { backgroundColor: t.dotOn },
});
