import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { previewNotice } from '../../components/PreviewNotice';
import DemoPressable from '../../components/DemoPressable';
import { router, type Href } from 'expo-router';
import { Check, ChevronLeft, Heart, MapPin, Search, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { advocates as t, colors, font, ink, profile as p } from '../../constants/theme';
import { ADVOCATES_EMPTY, ADVOCATES_HEADER, SAVED_ADVOCATES, type SavedAdvocate } from '../../data/advocates';

// Saved Advocates (design/55).
//
// design/55 draws the zero-saved state in the same frame under an "EMPTY STATE
// PATTERN / When 0 counsel saved" annotation. That annotation is design scaffolding,
// not UI, so it is not rendered — the empty state simply shows once both hearts are
// un-filled.
//
// View Profile routes to app/advocates/[id].tsx (design/81). Book Consultation is
// still inert: no booking flow exists in any design delivered so far. Reported.

function FixtureAdvocatesScreen() {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<string[]>(SAVED_ADVOCATES.map((a) => a.id));

  const toggle = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const shown = SAVED_ADVOCATES.filter((a) => saved.includes(a.id));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}
          style={styles.circle}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {ADVOCATES_HEADER.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {ADVOCATES_HEADER.subtitle}
          </Text>
        </View>
        {/* Search panel is not designed. */}
        <Pressable onPress={() => previewNotice("Search")} accessibilityRole="button" accessibilityLabel="Search" style={styles.circle}>
          <Search size={t.searchIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            {ADVOCATES_HEADER.sectionLabel}
          </Text>
          <View style={styles.count}>
            <Text style={styles.countText} {...shrinkToFit(0.8)}>
              {shown.length} Active
            </Text>
          </View>
          <View style={styles.spacer} />
          <Text style={styles.sync} {...shrinkToFit(0.8)}>
            {ADVOCATES_HEADER.syncLabel}
          </Text>
        </View>

        {shown.length === 0 ? (
          <EmptyState onFind={() => setSaved(SAVED_ADVOCATES.map((a) => a.id))} />
        ) : (
          shown.map((a) => (
            <AdvocateCard key={a.id} item={a} saved onToggle={() => toggle(a.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function AdvocateCard({
  item,
  saved,
  onToggle,
}: {
  item: SavedAdvocate;
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.avatarWrap}>
          <AdvocateAvatar name={item.name} style={styles.avatar}><Text style={styles.avatarText}>{item.initials}</Text></AdvocateAvatar>
          <View
            style={[
              styles.dot,
              { backgroundColor: item.availableNow ? t.availOnText : '#E9A23B' },
            ]}
          />
        </View>

        <View style={styles.cardText}>
          <View style={styles.nameRow}>
            <Text style={styles.name} {...shrinkToFit(0.8)}>
              {item.name}
            </Text>
            {item.verified && (
              <View style={styles.verified}>
                <Check size={t.verifiedIcon} color={t.verifiedText} strokeWidth={3} />
                <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                  Verified
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.practice} {...shrinkToFit(0.8)}>
            {item.practice}
          </Text>
          <View style={styles.metaRow}>
            <MapPin size={t.metaIcon} color={ink.accent} />
            <Text style={styles.meta} {...shrinkToFit(0.8)}>
              {item.location}
            </Text>
            <Star size={t.starIcon} color={t.starColour} fill={t.starColour} style={styles.star} />
            <Text style={styles.rating} {...shrinkToFit(0.8)}>
              {item.rating}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from saved' : 'Save advocate'}
          accessibilityState={{ selected: saved }}
          onPress={onToggle}
          style={styles.heart}
        >
          <Heart
            size={t.heartIcon}
            color={colors.brandDark}
            fill={saved ? colors.brandDark : 'transparent'}
          />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.feeRow}>
        <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
          Consultation:{' '}
        </Text>
        <Text style={styles.fee} {...shrinkToFit(0.8)}>
          {item.fee}
        </Text>
        <Text style={styles.feeUnit} {...shrinkToFit(0.8)}>
          {' '}
          {item.feeUnit}
        </Text>
        <View style={styles.spacer} />
        <View
          style={[styles.avail, { backgroundColor: item.availableNow ? t.availOnBg : t.availLaterBg }]}
        >
          <View
            style={[
              styles.availDot,
              { backgroundColor: item.availableNow ? t.availOnText : t.availLaterText },
            ]}
          />
          <Text
            style={[styles.availText, { color: item.availableNow ? t.availOnText : t.availLaterText }]}
            {...shrinkToFit(0.75)}
          >
            {item.availability}
          </Text>
        </View>
      </View>

      {/* Book Consultation stays inert — no booking flow is designed anywhere. */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocates/${item.id}` as Href)}
          style={({ pressed }) => [styles.action, styles.outline, pressed && styles.pressed]}
        >
          <Text style={styles.outlineLabel} {...shrinkToFit(0.8)}>
            View Profile
          </Text>
        </Pressable>
        <DemoPressable onPress={() => router.push('/legal-advice' as Href)} accessibilityRole="button" style={[styles.action, styles.filled]}>
          <Text style={styles.filledLabel} {...shrinkToFit(0.8)}>
            Book Consultation
          </Text>
        </DemoPressable>
      </View>
    </View>
  );
}

function EmptyState({ onFind }: { onFind: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Heart size={t.emptyIconGlyph} color={colors.brandDark} />
      </View>
      <Text style={styles.emptyTitle} {...shrinkToFit(0.8)}>
        {ADVOCATES_EMPTY.title}
      </Text>
      <Text style={styles.emptyBody}>{ADVOCATES_EMPTY.body}</Text>
      {/* No advocate-search screen exists; this restores the saved list so the
          populated state stays reachable. */}
      <Pressable
        accessibilityRole="button"
        onPress={onFind}
        style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
      >
        <Search size={t.emptyButtonIcon} color={ink.onBrand} />
        <Text style={styles.emptyButtonLabel} {...shrinkToFit(0.8)}>
          {ADVOCATES_EMPTY.action}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: p.padX,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: ink.accent,
  },
  count: {
    marginLeft: t.countGap,
    minHeight: t.countHeight,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontFamily: font.appSemi,
    fontSize: t.countSize,
    color: colors.brandDark,
  },
  spacer: {
    flex: 1,
    minWidth: 8,
  },
  sync: {
    fontFamily: font.appBody,
    fontSize: t.syncSize,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.cardPad,
  },
  cardHead: {
    flexDirection: 'row',
  },
  avatarWrap: {
    width: t.avatar,
    height: t.avatar,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: t.avatarText,
    color: colors.brandDark,
  },
  dot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    borderWidth: t.dotBorder,
    borderColor: colors.card,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.avatarGap,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  verified: {
    marginLeft: t.verifiedGap,
    minHeight: t.verifiedHeight,
    borderRadius: t.verifiedRadius,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: t.verifiedBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: t.verifiedIconGap,
    fontFamily: font.appSemi,
    fontSize: t.verifiedSize,
    color: t.verifiedText,
  },
  practice: {
    marginTop: t.practiceGap,
    fontFamily: font.appBody,
    fontSize: t.practiceSize,
    color: colors.textBody,
  },
  metaRow: {
    marginTop: t.metaGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    marginLeft: t.metaIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textBody,
  },
  star: {
    marginLeft: t.starGap,
  },
  rating: {
    marginLeft: t.ratingGap,
    fontFamily: font.appSemi,
    fontSize: t.ratingSize,
    color: colors.textPrimary,
  },
  heart: {
    marginLeft: 8,
    width: t.heart,
    height: t.heart,
    borderRadius: t.heart / 2,
    backgroundColor: t.heartBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    marginTop: t.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  feeRow: {
    marginTop: t.feeGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeLabel: {
    fontFamily: font.appBody,
    fontSize: t.feeLabelSize,
    color: colors.textBody,
  },
  fee: {
    fontFamily: font.appHeading,
    fontSize: t.feeSize,
    color: colors.textPrimary,
  },
  feeUnit: {
    fontFamily: font.appBody,
    fontSize: t.feeUnitSize,
    color: colors.textBody,
  },
  avail: {
    minHeight: t.availHeight,
    borderRadius: t.availRadius,
    paddingHorizontal: t.availPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  availDot: {
    width: t.availDot,
    height: t.availDot,
    borderRadius: t.availDot / 2,
    marginRight: t.availDotGap,
  },
  availText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.availSize,
  },
  actions: {
    marginTop: t.actionsGap,
    flexDirection: 'row',
    gap: t.actionColGap,
  },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.outlineBorder,
  },
  outlineLabel: {
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  filled: {
    backgroundColor: colors.brand,
  },
  filledLabel: {
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: ink.onBrand,
  },
  empty: {
    marginTop: t.emptyGap,
    borderRadius: t.emptyRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.emptyPad,
    alignItems: 'center',
  },
  emptyIcon: {
    width: t.emptyIcon,
    height: t.emptyIcon,
    borderRadius: t.emptyIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: t.emptyTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.emptyTitleSize,
    color: colors.textPrimary,
  },
  emptyBody: {
    marginTop: t.emptyBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.emptyBodySize,
    lineHeight: t.emptyBodyLineHeight,
    color: colors.textBody,
  },
  emptyButton: {
    marginTop: t.emptyButtonGap,
    minHeight: t.emptyButtonHeight,
    borderRadius: t.emptyButtonRadius,
    paddingHorizontal: t.emptyButtonPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyButtonLabel: {
    marginLeft: t.emptyButtonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.emptyButtonSize,
    color: ink.onBrand,
  },
  pressed: {
    opacity: 0.85,
  },
});

import SavedAdvocatesLive from '../../features/account/SavedAdvocates';
import { DATA_SOURCE } from '../../lib/data-source';
// D-27: the API-backed screen replaces the design-preview fixture at the same route.
export default function AdvocatesScreen() { return DATA_SOURCE === 'api' ? <SavedAdvocatesLive /> : <FixtureAdvocatesScreen />; }
