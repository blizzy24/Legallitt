import { router } from 'expo-router';
import { ArrowLeft, Share2, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, ink, serviceHeader as h } from '../constants/theme';

// Header shared by the Legal Notice detail and identity screens (design/22, 37, 38).
//
// design/102 (Legal Advice landing) uses the same header WITHOUT the share icon, so
// `share` turns that one control off rather than forking a twelfth header style.
export default function ServiceHeader({ title, share = true, onBack }: { onBack?: () => void; title: string; share?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + h.top }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')))}>
        <ArrowLeft size={h.backIcon} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {share && (
        <Pressable accessibilityRole="button" accessibilityLabel="Share" hitSlop={10} style={styles.share}>
          <Share2 size={h.shareIcon} color={colors.textPrimary} />
        </Pressable>
      )}
      <View style={styles.avatar}>
        <User size={h.avatarIcon} color={ink.onBrand} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: h.height,
    paddingBottom: h.bottom,
    backgroundColor: colors.appBg,
    paddingLeft: h.padLeft,
    paddingRight: h.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: h.backGap,
    fontFamily: font.appHeading,
    fontSize: h.titleSize,
    color: colors.textPrimary,
  },
  share: {
    marginRight: h.shareGap,
  },
  avatar: {
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
