import { router, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PrimaryButton from './PrimaryButton';
import ServiceHeader from './ServiceHeader';
import { colors, font, previewStep as p, space } from '../constants/theme';

/**
 * A step the preview does not include, in plain user language: the service name,
 * "This step isn't available in the preview.", and one action — on to the flow's
 * next screen (`next`), or back where there is none.
 */
export default function PreviewStep({ header, service, next }: { header: string; service: string; next?: Href }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen}>
      <ServiceHeader title={header} share={false} />
      <View style={styles.body}>
        <Text style={styles.title}>{service}</Text>
        <Text style={styles.line}>{p.line}</Text>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.screenX }]}>
        <PrimaryButton
          label={next ? p.continue : p.back}
          onPress={() => (next ? router.replace(next) : router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  body: { flex: 1, paddingHorizontal: space.screenX, paddingTop: p.top, gap: p.gap },
  title: { fontFamily: font.appHeading, fontSize: p.titleSize, color: colors.textPrimary },
  line: { fontFamily: font.appBody, fontSize: p.lineSize, lineHeight: p.lineHeight, color: colors.textBody },
  footer: { paddingHorizontal: space.screenX },
});
