import NotificationBell from './NotificationBell';
import { router, type Href } from 'expo-router';
import { Bell, ChevronLeft, MessageSquare } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { advToolHeader as h, font } from '../constants/theme';

/**
 * The white back-and-title bar designs 271–274 all draw.
 *
 * The back chevron is 38pt across and hangs 8pt into the 21pt gutter — its ink
 * starts at 26.0pt, left of everything else on the screen — which is why it
 * carries a negative margin rather than sitting on the gutter.
 *
 * design/272 is the only one of the four without the message and bell glyphs,
 * and the only one whose title is drawn near-black rather than in the #4D4439
 * the rest of the batch uses. Both are passed in, not guessed.
 */
export default function AdvToolHeader({
  title,
  icons = true,
  colour = h.ink,
}: {
  title: string;
  icons?: boolean;
  colour?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + h.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={10}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
      >
        <ChevronLeft size={h.backIcon} color={colour} strokeWidth={2.6} style={styles.back} />
      </Pressable>
      <Text style={[styles.title, { color: colour }]} {...shrinkToFit(0.8)}>
        {title}
      </Text>
      {icons ? (
        <>
          <MessageSquare size={h.glyph} color={colour} strokeWidth={2} />
          <NotificationBell advocate size={h.glyph} color={colour} style={styles.bell}/>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: h.padX,
    height: h.height,
    backgroundColor: h.bg,
  },
  back: { marginLeft: -h.backHang },
  title: { flex: 1, marginLeft: h.titleGap, fontFamily: font.appHeading, fontSize: h.titleSize },
  bell: { marginLeft: h.glyphGap },
});
