import { router } from 'expo-router';
import { ArrowLeft, UserRound, X, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { colors, font, ink, kycHeader as t } from '../constants/theme';

type Props = {
  title: string;
  /** Small line under the title: a green dot plus text, or an icon plus text. */
  sub?: string;
  subIcon?: LucideIcon;
  /** design/95 uses a close icon where design/93 and 94 use a back arrow. */
  leading?: 'back' | 'close';
  onLeading?: () => void;
};

// The app's ELEVENTH header style (design/93, 94, 95): a leading control, a centred
// title with an optional small sub-line, and an avatar.
//
// Extracted because all three DigiLocker screens share it. The sub-line carries a
// green dot by default ("Encrypted Session") or an icon when one is given
// ("256-BIT ENCRYPTED"), and design/95 swaps the back arrow for a close.
export default function KycHeader({ title, sub, subIcon: SubIcon, leading = 'back', onLeading }: Props) {
  const insets = useSafeAreaInsets();
  const Icon = leading === 'close' ? X : ArrowLeft;

  return (
    <View style={[styles.header, { paddingTop: insets.top + t.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={leading === 'close' ? 'Close' : 'Back'}
        hitSlop={10}
        onPress={onLeading ?? (() => (router.canGoBack() ? router.back() : router.replace('/kyc/choose')))}
      >
        <Icon size={t.icon} color={colors.textPrimary} />
      </Pressable>

      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {sub && (
          <View style={styles.subRow}>
            {SubIcon ? (
              <SubIcon size={t.subIcon} color={t.subColour} />
            ) : (
              <View style={styles.dot} />
            )}
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              {sub}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.avatar}>
        <UserRound size={t.avatarIcon} color={ink.onBrand} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: t.minHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  subRow: {
    marginTop: t.subGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: t.subDot,
    height: t.subDot,
    borderRadius: t.subDot / 2,
    marginRight: t.subDotGap,
    backgroundColor: t.subColour,
  },
  sub: {
    marginLeft: 0,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
