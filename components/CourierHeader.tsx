import { router, type Href } from 'expo-router';
import { ArrowLeft, ChevronLeft, UserRound, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { courierHeader as h, font, ink, status } from '../constants/theme';

/**
 * The back + title + avatar bar designs 275, 276, 280, 281, 282, 283, 285, 286
 * and 287 all draw, and the High Court / District Court batch (289–337) after
 * them. Re-measured off design/291 at 2.000 px/pt (identical to design/275's bar):
 * the bar is 56pt to its divider, not the 65pt the first build drew.
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
  plainChevron = false,
  right,
  backHref = '/dashboard' as Href,
  padTop,
  subStyle,
  center = false,
  close = false,
  kicker,
  online = false,
}: {
  title: string;
  sub?: string;
  avatar?: boolean;
  chevron?: boolean;
  /** A bare chevron with no disc behind it (design/290 and others in its batch). */
  plainChevron?: boolean;
  right?: React.ReactNode;
  /** Where Back goes when there is no history. */
  backHref?: Href;
  /** Overrides the top inset (design/300 sits its two-line title higher than 285). */
  padTop?: number;
  /** Overrides the subtitle's size or weight (design/300). */
  subStyle?: TextStyle;
  /** Centre the title in the space between back and the right-hand icons (design/302). */
  center?: boolean;
  /** An X (close) in place of the back arrow (designs 310 and 312). */
  close?: boolean;
  /** A small capitalised line above the title (designs 313, 320, 327, 328). */
  kicker?: string;
  /** A green online dot on the avatar (design/313). */
  online?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top + (padTop ?? (sub ? h.padTopTall : h.padTop)) }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={close ? 'Close' : 'Back'}
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(backHref))}
          style={chevron ? styles.chevBtn : styles.back}
        >
          {chevron ? (
            <ChevronLeft size={h.backIcon} color={h.ink} strokeWidth={2.4} />
          ) : close ? (
            <X size={h.backIcon} color={h.ink} strokeWidth={2.2} />
          ) : plainChevron ? (
            <ChevronLeft size={h.plainChevron} color={h.ink} strokeWidth={2.2} />
          ) : (
            <ArrowLeft size={h.backIcon} color={h.ink} strokeWidth={2.2} />
          )}
        </Pressable>
        <View style={styles.titleCol}>
          {kicker ? (
            <Text style={styles.kicker} {...shrinkToFit(0.75)}>
              {kicker}
            </Text>
          ) : null}
          <Text style={[styles.title, center && styles.centered]} {...shrinkToFit(0.8)}>
            {title}
          </Text>
          {sub ? (
            <Text style={[styles.sub, center && styles.centered, subStyle]} {...shrinkToFit(0.8)}>
              {sub}
            </Text>
          ) : null}
        </View>
        {right}
        {avatar ? (
          <View style={styles.avatar}>
            <UserRound size={h.avatarGlyph} color={ink.onBrand} strokeWidth={1.9} />
            {online ? <View style={styles.online} /> : null}
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
  back: { marginLeft: h.backInset },
  titleCol: { flex: 1, marginLeft: h.titleGap },
  title: { fontFamily: font.appSemi, fontSize: h.titleSize, color: h.ink },
  centered: { textAlign: 'center' },
  kicker: {
    fontFamily: font.appSemi,
    fontSize: h.kickerSize,
    letterSpacing: h.kickerSpacing,
    color: h.kickerInk,
  },
  online: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: h.onlineDot,
    height: h.onlineDot,
    borderRadius: h.onlineDot / 2,
    borderWidth: h.onlineBorder,
    borderColor: h.bg,
    backgroundColor: status.active,
  },
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
