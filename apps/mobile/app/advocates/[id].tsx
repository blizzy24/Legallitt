import {useNoticeProfile} from '../../features/legal-notice/useNoticeProfile';
import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Award,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Clock,
  GraduationCap,
  Languages,
  MapPin,
  Scale,
  ShieldCheck,
  Star,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { advocateProfile as t, colors, font, ink } from '../../constants/theme';
import { SAVED_ADVOCATES, advocateProfileById, type AdvocateProfileView, type AdvocateReview } from '../../data/advocates';

// Advocate Profile — designs 81/118/433 share the same layout. 433 differs from
// 118 by 156 pixels and names Adv. Rahul Sharma. Its dedicated route supplies only
// that PNG's record and photograph; Legal Notice still opens its assigned Arjun.
// Optional sections remain hidden when a selected advocate has no supplied values.
// The lavender-grey palette is local to advocateProfile, as drawn.

export function AdvocateProfileViewScreen({advocate,showBadge=true}:{advocate:AdvocateProfileView;showBadge?:boolean}) {
  const insets=useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);

  const details = (
    [
      { label: 'EXPERIENCE', icon: Award, value: advocate.experience },
      { label: 'EDUCATION', icon: GraduationCap, value: advocate.education },
      { label: 'COURTS', icon: Scale, value: advocate.courts },
      { label: 'LANGUAGES', icon: Languages, value: advocate.languages },
    ] as { label: string; icon: LucideIcon; value?: string }[]
  ).filter((d): d is { label: string; icon: LucideIcon; value: string } => !!d.value);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocates'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Advocate Profile
        </Text>
        <View style={styles.headerAvatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.photoWrap}>
            {/* 433 supplies Rahul's photo; other advocates retain their own initials. */}
            <AdvocateAvatar name={advocate.name} style={styles.photo}><Text style={styles.photoText}>{advocate.initials}</Text></AdvocateAvatar>
            <View style={[styles.badge,!showBadge&&{opacity:0}]}><BadgeCheck size={t.badgeGlyph} color={ink.onBrand} /></View>
          </View>

          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {advocate.name}
          </Text>

          {advocate.verified && (
            <View style={styles.verified}>
              <Scale size={t.verifiedIcon} color={ink.accent} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                Verified Advocate
              </Text>
            </View>
          )}

          {(advocate.experience || advocate.location) && (
            <View style={styles.metaRow}>
              {advocate.experience && <>
                <Award size={t.metaIcon} color={ink.accent} />
                <Text style={styles.metaText} {...shrinkToFit(0.8)}>{advocate.experience} Exp.</Text>
              </>}
              {advocate.experience && advocate.location && <Text style={styles.metaDot}>·</Text>}
              {advocate.location && <>
                <MapPin size={t.metaIcon} color={ink.accent} />
                <Text style={styles.metaText} {...shrinkToFit(0.8)}>{advocate.location}</Text>
              </>}
            </View>
          )}

          {advocate.rating ? (
          <View style={styles.rating}>
            <Star size={t.ratingIcon} color={t.star} fill={t.star} />
            <Text style={styles.ratingValue} {...shrinkToFit(0.8)}>
              {advocate.rating}
            </Text>
            <Text style={styles.ratingCount} {...shrinkToFit(0.8)}>
              ({advocate.reviewCount} Reviews)
            </Text>
          </View>
          ) : null}
        </View>

        {advocate.barCouncil ? (
        <View style={styles.enrol}>
          <View style={styles.enrolIcon}>
            <ShieldCheck size={t.enrolIconGlyph} color={ink.accent} />
          </View>
          <View style={styles.enrolText}>
            <Text style={styles.enrolLabel} {...shrinkToFit(0.8)}>
              BAR COUNCIL ENROLLMENT
            </Text>
            <Text style={styles.enrolValue} {...shrinkToFit(0.8)}>
              {advocate.barCouncil}
            </Text>
          </View>
          <ShieldCheck size={t.enrolShield} color={colors.textMuted} />
        </View>
        ) : null}

        {!!advocate.practiceAreas?.length && <>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            PRACTICE AREAS
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            Specialized Counsel
          </Text>
        </View>
        <View style={styles.chips}>
          {advocate.practiceAreas.map((a) => (
            <View key={a} style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {a}
              </Text>
            </View>
          ))}
        </View>

        </>}

        {!!advocate.about && <>
        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          ABOUT
        </Text>
        <Text style={[styles.about, advocate.id === 'adv-rahul-sharma' && {fontSize:t.suppliedAboutSize}]} numberOfLines={expanded || advocate.id === 'adv-rahul-sharma' ? undefined : t.aboutLines}>
          {advocate.about}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          hitSlop={8}
          onPress={() => setExpanded((v) => !v)}
          style={styles.readMore}
        >
          <Text style={styles.readMoreText}>{expanded ? 'Read less' : 'Read more'}</Text>
        </Pressable>

        </>}

        {details.length > 0 && <>
        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          PROFESSIONAL DETAILS
        </Text>
        <View style={styles.grid}>
          {details.map((d) => (
            <View key={d.label} style={styles.gridCell}>
              <Text style={styles.gridLabel} {...shrinkToFit(0.75)}>
                {d.label}
              </Text>
              <View style={styles.gridValueRow}>
                <d.icon size={t.gridIcon} color={colors.textBody} />
                <Text style={styles.gridValue} {...shrinkToFit(0.7)}>
                  {d.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        </>}

        {advocate.availabilityLabel ? (
        <>
        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          AVAILABILITY
        </Text>
        <View style={styles.avail}>
          <View style={styles.availTop}>
            <View style={styles.availDot} />
            <Text style={styles.availLabel} {...shrinkToFit(0.8)}>
              {advocate.availabilityLabel}
            </Text>
            <View style={styles.availChip}>
              <Text style={styles.availChipText} {...shrinkToFit(0.8)}>
                {advocate.availabilityChip}
              </Text>
            </View>
          </View>
          <View style={styles.availRow}>
            <CalendarDays size={t.availIcon} color={colors.textBody} />
            <Text style={styles.availText} {...shrinkToFit(0.8)}>
              {advocate.days}
            </Text>
            <View style={styles.availSpacer} />
            <Clock size={t.availIcon} color={colors.textBody} />
            <Text style={styles.availText} {...shrinkToFit(0.8)}>
              {advocate.hours}
            </Text>
          </View>
        </View>
        </>
        ) : null}

        {advocate.reviews?.length ? (
        <>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            CLIENT REVIEWS
          </Text>
          <View style={styles.reviewHead}>
            <Star size={t.reviewStar} color={t.star} fill={t.star} />
            <Text style={styles.reviewHeadValue} {...shrinkToFit(0.8)}>
              {advocate.rating}
            </Text>
            <Text style={styles.reviewHeadCount} {...shrinkToFit(0.8)}>
              ({advocate.reviewCount})
            </Text>
          </View>
        </View>

        {advocate.reviews.map((r) => (
          <ReviewCard key={r.name} review={r} />
        ))}
        </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ReviewCard({ review }: { review: AdvocateReview }) {
  return (
    <View style={styles.review}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>{review.initials}</Text>
        </View>
        <Text style={styles.reviewName} {...shrinkToFit(0.8)}>
          {review.name}
        </Text>
        <View style={styles.stars}>
          {Array.from({ length: review.stars }, (_, i) => (
            <Star key={i} size={t.reviewStar} color={t.star} fill={t.star} style={styles.star} />
          ))}
        </View>
      </View>
      <Text style={styles.reviewQuote}>&ldquo;{review.quote}&rdquo;</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  headerAvatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: t.padX,
  },
  hero: {
    marginTop: t.heroTop,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    padding: t.heroPad,
    alignItems: 'center',
  },
  photoWrap: {
    width: t.photo,
    height: t.photo,
  },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: t.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontFamily: font.appSemi,
    fontSize: t.photoText,
    color: colors.brandDark,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: t.nameGap,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  verified: {
    marginTop: t.verifiedGap,
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
    color: ink.accent,
  },
  metaRow: {
    marginTop: t.metaGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: t.metaIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textPrimary,
  },
  metaDot: {
    marginHorizontal: t.metaDotGap,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: colors.textMuted,
  },
  rating: {
    marginTop: t.ratingGap,
    minHeight: t.ratingHeight,
    borderRadius: t.ratingRadius,
    paddingHorizontal: t.ratingPadX,
    backgroundColor: t.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    marginLeft: t.ratingIconGap,
    fontFamily: font.appHeading,
    fontSize: t.ratingSize,
    color: colors.textPrimary,
  },
  ratingCount: {
    marginLeft: t.ratingCountGap,
    fontFamily: font.appBody,
    fontSize: t.ratingCountSize,
    color: colors.textBody,
  },
  enrol: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.surface,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrolIcon: {
    width: t.enrolIcon,
    height: t.enrolIcon,
    borderRadius: t.enrolIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrolText: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: t.enrolIconGap,
  },
  enrolLabel: {
    fontFamily: font.appSemi,
    fontSize: t.enrolLabelSize,
    letterSpacing: t.enrolLabelSpacing,
    color: colors.textBody,
  },
  enrolValue: {
    marginTop: t.enrolValueGap,
    fontFamily: font.appHeading,
    fontSize: t.enrolValueSize,
    color: colors.textPrimary,
  },
  sectionRow: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  soloLabel: {
    marginTop: t.soloLabelGap,
  },
  sectionNote: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.sectionNoteSize,
    color: colors.textMuted,
  },
  chips: {
    marginTop: t.chipGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: t.chipRowGap,
    columnGap: t.chipColGap,
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    marginRight: t.chipDotGap,
    backgroundColor: colors.brandDark,
  },
  chipText: {
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: colors.textPrimary,
  },
  about: {
    marginTop: t.aboutGap,
    fontFamily: font.appBody,
    fontSize: t.aboutSize,
    lineHeight: t.aboutLineHeight,
    color: colors.textBody,
  },
  readMore: {
    marginTop: t.readMoreGap,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontFamily: font.appSemi,
    fontSize: t.readMoreSize,
    color: colors.textPrimary,
  },
  grid: {
    marginTop: t.gridGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: t.gridRowGap,
    columnGap: t.gridColGap,
  },
  gridCell: {
    width: '48%',
    flexGrow: 1,
    borderRadius: t.gridRadius,
    backgroundColor: t.surface,
    padding: t.gridPad,
  },
  gridLabel: {
    fontFamily: font.appSemi,
    fontSize: t.gridLabelSize,
    letterSpacing: t.gridLabelSpacing,
    color: colors.textBody,
  },
  gridValueRow: {
    marginTop: t.gridValueGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridValue: {
    marginLeft: t.gridIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.gridValueSize,
    color: colors.textPrimary,
  },
  avail: {
    marginTop: t.availGap,
    borderRadius: t.availRadius,
    backgroundColor: t.surface,
    padding: t.availPad,
  },
  availTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availDot: {
    width: t.availDot,
    height: t.availDot,
    borderRadius: t.availDot / 2,
    marginRight: t.availDotGap,
    backgroundColor: t.online,
  },
  availLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.availLabelSize,
    color: colors.textPrimary,
  },
  availChip: {
    marginLeft: 10,
    minHeight: t.availChipHeight,
    borderRadius: t.availChipRadius,
    paddingHorizontal: t.availChipPadX,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availChipText: {
    fontFamily: font.appBody,
    fontSize: t.availChipSize,
    color: colors.textBody,
  },
  availRow: {
    marginTop: t.availRowGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  availText: {
    marginLeft: t.availIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.availTextSize,
    color: colors.textBody,
  },
  availSpacer: {
    flex: 1,
    minWidth: 10,
  },
  reviewHead: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewHeadValue: {
    marginLeft: 6,
    fontFamily: font.appHeading,
    fontSize: t.reviewNameSize,
    color: colors.textPrimary,
  },
  reviewHeadCount: {
    marginLeft: 4,
    fontFamily: font.appBody,
    fontSize: t.availChipSize,
    color: colors.textBody,
  },
  review: {
    marginTop: t.reviewCardGap,
    borderRadius: t.reviewRadius,
    backgroundColor: t.surface,
    padding: t.reviewPad,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: t.reviewAvatar,
    height: t.reviewAvatar,
    borderRadius: t.reviewAvatar / 2,
    backgroundColor: t.reviewAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontFamily: font.appSemi,
    fontSize: t.reviewAvatarText,
    color: colors.textBody,
  },
  reviewName: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.reviewAvatarGap,
    fontFamily: font.appHeading,
    fontSize: t.reviewNameSize,
    color: colors.textPrimary,
  },
  stars: {
    marginLeft: 8,
    flexDirection: 'row',
  },
  star: {
    marginLeft: t.reviewStarGap,
  },
  reviewQuote: {
    marginTop: t.reviewQuoteGap,
    fontFamily: font.appBody,
    fontSize: t.reviewQuoteSize,
    lineHeight: t.reviewQuoteLineHeight,
    color: colors.textBody,
  },
});

export default function AdvocateProfileScreen({profileId}:{profileId?:string}){
 const {id}=useLocalSearchParams<{id:string}>();
 const notice=useNoticeProfile();
 return <AdvocateProfileViewScreen showBadge={!notice||notice.verified} advocate={notice??advocateProfileById(profileId??String(id))??SAVED_ADVOCATES[0]} />;
}
