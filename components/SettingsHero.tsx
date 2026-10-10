import { router, type Href } from 'expo-router';
import { ChevronLeft, Info, ShieldCheck, UserRound } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../constants/textFit';
import { advSettingsPage as t, colors, font, ink } from '../constants/theme';

/**
 * The page shell designs 251, 252, 253 and 254 all draw: a header, one tall
 * hero card (illustration, pill, headline, subtitle), then the screen's own
 * sections below. Built once because the four exports are identical above the
 * first section label.
 */
export default function SettingsHero({
  eyebrow,
  title,
  pill,
  h1,
  sub,
  art,
  heroCard = true,
  heroBg,
  showInfo = true,
  roundBack = true,
  children,
}: {
  eyebrow: string;
  title: string;
  pill: string;
  h1: string;
  sub: string;
  art: ReactNode;
  /** design/251 and 253 draw a white hero card; 252 and 254 draw none. */
  heroCard?: boolean;
  heroBg?: string;
  showInfo?: boolean;
  roundBack?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          style={roundBack ? styles.back : undefined}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {title}
          </Text>
        </View>
        {showInfo ? (
          <Info size={t.infoGlyph} color="#4D463D" strokeWidth={1.8} style={styles.info} />
        ) : null}
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, !heroCard && styles.heroBare, heroBg ? { backgroundColor: heroBg } : null]}>
          <View style={styles.art}>{art}</View>
          <View style={styles.pill}>
            <ShieldCheck size={t.pillGlyph} color="#4D463D" strokeWidth={2} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {pill}
            </Text>
          </View>
          <Text style={styles.h1} {...shrinkToFit(0.8)}>
            {h1}
          </Text>
          <Text style={styles.sub}>{sub}</Text>
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
  },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: '#6B6B6B',
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  info: { marginRight: t.headerGap },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 30 },

  hero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.heroRadius,
    paddingTop: t.heroPadTop,
    paddingBottom: t.heroPadBottom,
    paddingHorizontal: t.heroPadX,
  },
  heroBare: { backgroundColor: 'transparent', borderRadius: 0 },
  art: { height: t.artH, alignItems: 'center', justifyContent: 'center' },
  pill: {
    marginTop: t.pillTop,
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillTrack,
    color: '#4D463D',
  },
  h1: {
    marginTop: t.h1Top,
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    color: '#1B1C1C',
  },
  sub: {
    marginTop: t.subTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: '#4D463D',
  },
});
