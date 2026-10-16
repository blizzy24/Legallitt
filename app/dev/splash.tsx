import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import AnimatedSplash from '../../components/AnimatedSplash';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';
import { devIndex as d, font } from '../../constants/theme';

// DEVELOPMENT ONLY — the animated splash on its own. ?t=1.2 holds the timeline at
// that second (the screenshot checks); without it the splash plays once and stays,
// with a dev caption (the splash itself has no text: the wordmark is an image).
export default function DevSplashScreen() {
  const { t } = useLocalSearchParams<{ t?: string }>();
  if (!DEV_PREVIEW_TOGGLES) return null;
  return (
    <View style={styles.fill}>
      <AnimatedSplash ready={false} warm={false} freezeAt={t === undefined ? undefined : Number(t)} onMounted={() => {}} onDone={() => {}} />
      {t === undefined ? <Text style={styles.caption}>{d.splashCaption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  caption: { position: 'absolute', left: d.pad, right: d.pad, bottom: d.pad, fontFamily: font.appBody, fontSize: d.designSize, color: d.muted, textAlign: 'center' },
});
