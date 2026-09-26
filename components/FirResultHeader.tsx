import { router } from 'expo-router';
import { ArrowLeft, Info, Share2, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firResult as t, font, ink } from '../constants/theme';

type Props = {
  title: string;
  /** design/47 stacks a "LEGALITT" eyebrow over the title and left-aligns the pair. */
  eyebrow?: string;
  /** design/47 uses an info button; design/48 and design/49 use share. */
  action?: 'info' | 'share';
};

// Header for the three FIR outcome screens (design/47, 48, 49). Close to
// ServiceHeader but not the same: it carries the eyebrow variant and centres the
// title when there is no eyebrow, which ServiceHeader never does.
export default function FirResultHeader({ title, eyebrow, action = 'share' }: Props) {
  const insets = useSafeAreaInsets();
  const ActionIcon = action === 'info' ? Info : Share2;

  return (
    <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={10}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
      >
        <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
      </Pressable>

      {eyebrow ? (
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      ) : (
        <Text style={[styles.title, styles.titleCentred]} numberOfLines={1}>
          {title}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action === 'info' ? 'About this request' : 'Share'}
        hitSlop={10}
        style={styles.action}
      >
        <ActionIcon size={t.actionIcon} color={colors.textPrimary} />
      </Pressable>
      <View style={styles.avatar}>
        <User size={t.avatarIcon} color={ink.onBrand} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: t.headerMinHeight,
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.bg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
  },
  eyebrow: {
    marginBottom: t.eyebrowGap,
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowSpacing,
    color: colors.textMuted,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  titleCentred: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  action: {
    marginRight: t.actionGap,
    marginLeft: t.actionGap,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
