import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authHeader as t, colors, font } from '../constants/theme';

// The replacement auth header (designs 134-138): a back chevron on the left, and a
// centred "LEGALITT" eyebrow above the screen title.
export default function AuthHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + t.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.back}
      >
        <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.text} pointerEvents="none">
        <Text style={styles.eyebrow}>LEGALITT</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: t.minHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: t.rule,
    justifyContent: 'center',
  },
  back: { position: 'absolute', left: t.padX, bottom: 14, zIndex: 1 },
  text: { alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowSpacing,
    color: t.eyebrowColour,
  },
  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
});
