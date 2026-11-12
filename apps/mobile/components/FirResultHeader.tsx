import { router } from 'expo-router';
import { ArrowLeft, Info, Share2, User } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firResult as t, font, ink } from '../constants/theme';

type Props = {
  title: string;
  /** design/47 stacks a "LEGALITT" eyebrow over the title and left-aligns the pair. */
  eyebrow?: string;
  /**
   * design/47 draws an info button, design/48 and design/49 a share button; F6–F9
   * draw neither. A button is only shown when it has something to do (`onAction`).
   */
  action?: 'info' | 'share';
  onAction?: () => void;
  /** Where Back goes. Defaults to history, else Home. */
  onBack?: () => void;
  /** F7 and F9 left-align the title; 48, 49, F6 and F8 centre it. */
  align?: 'center' | 'left';
  /** F7–F9 fill the avatar with the deep brown instead of the brand tan. */
  avatar?: 'light' | 'dark';
};

// Header for the FIR client outcome screens (design/47, 48, 49 and F6–F9). Close to
// ServiceHeader but not the same: it carries the eyebrow variant and centres the
// title when there is no eyebrow, which ServiceHeader never does.
export default function FirResultHeader({ title, eyebrow, action, onAction, onBack, align = 'center', avatar = 'light' }: Props) {
  const insets = useSafeAreaInsets();
  const ActionIcon = action === 'info' ? Info : Share2;
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home')));

  return (
    <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={back}>
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
        <Text style={[styles.title, align === 'center' ? styles.titleCentred : styles.titleLeft]} numberOfLines={1}>
          {title}
        </Text>
      )}

      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={action === 'info' ? 'Help' : 'Share status'}
          hitSlop={10}
          onPress={onAction}
          style={styles.action}
        >
          <ActionIcon size={t.actionIcon} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.actionGap} />
      )}
      <View style={[styles.avatar, avatar === 'dark' && styles.avatarDark]}>
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
  titleLeft: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
  },
  action: {
    marginRight: t.actionGap,
    marginLeft: t.actionGap,
  },
  actionGap: {
    width: t.actionGap,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDark: {
    backgroundColor: '#6C5C45',
  },
});
