import { router, type Href } from 'expo-router';
import { ArrowLeft, ChevronLeft, UserRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { courierHeader as h, font, ink } from '../constants/theme';

/**
 * The back + title + avatar bar designs 275, 276, 280, 281, 282, 283, 285, 286
 * and 287 all draw. Measured off design/275 at 2.1231 px/pt and checked against
 * the others.
 *
 * design/285 is the only one with a two-line title, and designs 278/279 use a
 * round-backed chevron instead of the plain arrow, so both are props rather
 * than separate components.
 */
export default function CourierHeader({
  title,
  sub,
  avatar = true,
  chevron = false,
  right,
}: {
  title: string;
  sub?: string;
  avatar?: boolean;
  chevron?: boolean;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + h.padTop }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
          style={chevron ? styles.chevBtn : undefined}
        >
          {chevron ? (
            <ChevronLeft size={h.backIcon} color={h.ink} strokeWidth={2.4} />
          ) : (
            <ArrowLeft size={h.backIcon} color={h.ink} strokeWidth={2.2} />
          )}
        </Pressable>
        <View style={styles.titleCol}>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {title}
          </Text>
          {sub ? (
            <Text style={styles.sub} {...shrinkToFit(0.8)}>
              {sub}
            </Text>
          ) : null}
        </View>
        {right}
        {avatar ? (
          <View style={styles.avatar}>
            <UserRound size={h.avatarGlyph} color={ink.onBrand} strokeWidth={1.9} />
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: h.bg },
  row: {
    height: h.height,
    paddingHorizontal: h.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevBtn: {
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1, marginLeft: h.titleGap },
  title: { fontFamily: font.appHeading, fontSize: h.titleSize, color: h.ink },
  sub: { marginTop: h.subTop, fontFamily: font.appBody, fontSize: h.subSize, color: '#4D463D' },
  avatar: {
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: h.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: h.divider },
});
