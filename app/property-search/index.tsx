import { router } from 'expo-router';
import { ArrowRight, Check, ChevronLeft, ChevronRight, MessageSquare, PhoneCall, ScanSearch } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psLanding as t } from '../../constants/theme';
import { usePropertySearch } from '../../context/propertySearch';
import { PROPERTY_TIERS, type PropertyTierId } from '../../data/propertySearch';

// Property Search Report landing (design/72).
//
// The hero illustration is a sized placeholder, like the legal-notice detail hero:
// we have no asset, so the box matches the file's artwork so dropping the real image
// in later needs no layout change.

const BULLETS = [
  'Helps verify recorded ownership details',
  'Helps identify registered encumbrances or liabilities',
  'Provides insight into relevant property records',
  'Helps you make a more informed property decision',
];

export default function PropertySearchLandingScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = usePropertySearch();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
          style={styles.circle}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} {...shrinkToFit(0.8)}>
          Property Search Report
        </Text>
        <View style={styles.circleSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        {/* design/72 sets the body under the title, beside the artwork. */}
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Know Your Property Before You Invest</Text>
            <Text style={styles.heroBody}>
              Get a professionally prepared property search report before buying, selling or
              investing in a property.
            </Text>
          </View>
          {/* Placeholder — sized to design/72's artwork box. */}
          <View style={styles.heroArt} />
        </View>

        <View style={styles.card}>
          <View style={styles.explainHead}>
            <View style={styles.explainIcon}>
              <ScanSearch size={t.explainIconGlyph} color={ink.accent} />
            </View>
            <View style={styles.explainText}>
              <Text style={styles.explainTitle} {...shrinkToFit(0.8)}>
                Why is a Property Search Important?
              </Text>
              <Text style={styles.explainSub}>
                Before buying a property, make sure you understand its recorded ownership and legal
                history.
              </Text>
            </View>
          </View>

          <View style={styles.explainDivider} />

          <Text style={styles.explainBody}>
            A property search helps you review important records and identify potential issues
            before making a major property decision.
          </Text>

          <View style={styles.bullets}>
            {BULLETS.map((b) => (
              <View key={b} style={styles.bulletRow}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={styles.learnDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/property-search/info')}
            style={({ pressed }) => [styles.learnRow, pressed && styles.pressed]}
          >
            <Text style={styles.learnText} {...shrinkToFit(0.75)}>
              What does a Property Search Report contain?
            </Text>
            <Text style={styles.learnLink} {...shrinkToFit(0.8)}>
              Learn more
            </Text>
            <ChevronRight size={t.learnIcon} color={ink.accent} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
          CHOOSE HOW YOU WOULD LIKE TO PROCEED
        </Text>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: !form.assisted }}
          onPress={() => update({ assisted: false })}
          style={[styles.option, !form.assisted && styles.optionOn]}
        >
          <View style={styles.optionHead}>
            <View style={styles.badge}>
              <Text style={styles.badgeText} {...shrinkToFit(0.8)}>
                DO IT YOURSELF
              </Text>
            </View>
            <Radio on={!form.assisted} />
          </View>
          <Text style={styles.optionTitle}>Quick Submission</Text>
          <Text style={styles.optionBody}>
            Provide your property details step by step and submit your request.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/property-search/request')}
            style={({ pressed }) => [styles.optionLink, pressed && styles.pressed]}
          >
            <Text style={styles.optionLinkText} {...shrinkToFit(0.8)}>
              Continue with Quick Submission
            </Text>
            <ArrowRight size={t.optionLinkIcon} color={colors.textPrimary} style={styles.optionLinkIcon} />
          </Pressable>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: form.assisted }}
          onPress={() => update({ assisted: true })}
          style={[styles.option, form.assisted && styles.optionOn]}
        >
          <View style={styles.optionHead}>
            <View style={styles.badge}>
              <Text style={styles.badgeText} {...shrinkToFit(0.8)}>
                GET EXPERT HELP
              </Text>
            </View>
            <Radio on={form.assisted} />
          </View>
          <Text style={styles.optionTitle}>Assistance Service</Text>
          <Text style={styles.optionBody}>
            Tell us what you need and our team will help you with the request.
          </Text>

          <View style={styles.assistRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/support-chat')}
              style={({ pressed }) => [styles.assist, pressed && styles.pressed]}
            >
              <MessageSquare size={t.assistIcon} color={colors.textPrimary} />
              <Text style={styles.assistLabel} {...shrinkToFit(0.75)}>
                Request Chat
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/callback')}
              style={({ pressed }) => [styles.assist, pressed && styles.pressed]}
            >
              <PhoneCall size={t.assistIcon} color={colors.textPrimary} />
              <Text style={styles.assistLabel} {...shrinkToFit(0.75)}>
                Request Callback
              </Text>
            </Pressable>
          </View>
        </Pressable>

        <Text style={[styles.sectionLabel, styles.speedLabel]} {...shrinkToFit(0.8)}>
          CHOOSE YOUR SERVICE SPEED
        </Text>
        <Text style={styles.sectionSub}>Select the processing option that suits your requirement.</Text>

        <View style={styles.tiers}>
          {PROPERTY_TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              on={form.tier === tier.id}
              onPress={() => update({ tier: tier.id as PropertyTierId })}
            />
          ))}
        </View>

        <Text style={styles.fine}>
          Final fee and processing details will be shown before submission.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/property-search/request')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <View style={[styles.radio, on && styles.radioOn]}>
      {on && <View style={styles.radioInner} />}
    </View>
  );
}

function TierCard({
  tier,
  on,
  onPress,
}: {
  tier: (typeof PROPERTY_TIERS)[number];
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.tier, on && styles.tierOn]}
    >
      <View style={styles.tierHead}>
        <View style={styles.tierBadge}>
          <Text style={styles.tierBadgeText} {...shrinkToFit(0.8)}>
            {tier.badge}
          </Text>
        </View>
        {on ? (
          <View style={styles.tierCheckOn}>
            <Check size={t.tierCheck - 8} color={ink.onBrand} strokeWidth={3} />
          </View>
        ) : (
          <View style={styles.tierCheckOff} />
        )}
      </View>
      <Text style={styles.tierLabel} {...shrinkToFit(0.8)}>
        {tier.label}
      </Text>
      <Text style={styles.tierPrice} {...shrinkToFit(0.8)}>
        ₹{tier.price}
        {tier.priceSuffix}
      </Text>
      <Text style={styles.tierNote} {...shrinkToFit(0.8)}>
        {tier.note}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
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
  circleSpacer: {
    width: t.backButton,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  heroRow: {
    marginTop: t.heroTop,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    lineHeight: t.heroTitleLineHeight,
    color: colors.textPrimary,
  },
  heroArt: {
    marginLeft: t.heroArtGap,
    marginTop: t.heroArtTop,
    width: t.heroArtW,
    height: t.heroArtH,
    borderRadius: 12,
    backgroundColor: colors.iconChipBg,
  },
  heroBody: {
    marginTop: t.heroBodyGap,
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLineHeight,
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
  explainHead: {
    flexDirection: 'row',
  },
  explainIcon: {
    width: t.explainIcon,
    height: t.explainIcon,
    borderRadius: t.explainIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.explainIconGap,
  },
  explainTitle: {
    fontFamily: font.appHeading,
    fontSize: t.explainTitleSize,
    color: colors.textPrimary,
  },
  explainSub: {
    marginTop: t.explainSubGap,
    fontFamily: font.appBody,
    fontSize: t.explainSubSize,
    lineHeight: t.explainSubLineHeight,
    color: colors.textBody,
  },
  explainDivider: {
    marginTop: t.explainBodyGap,
    height: 1,
    backgroundColor: colors.border,
  },
  explainBody: {
    marginTop: t.explainBodyGap,
    fontFamily: font.appBody,
    fontSize: t.explainBodySize,
    lineHeight: t.explainBodyLineHeight,
    color: colors.textPrimary,
  },
  bullets: {
    marginTop: t.bulletGap,
    gap: t.bulletRowGap,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    width: t.bulletDot,
    height: t.bulletDot,
    borderRadius: t.bulletDot / 2,
    marginRight: t.bulletDotGap,
    marginTop: (t.explainBodyLineHeight - t.bulletDot) / 2,
    backgroundColor: ink.accent,
  },
  bulletText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.bulletSize,
    lineHeight: t.explainBodyLineHeight,
    color: colors.textBody,
  },
  learnDivider: {
    marginTop: t.learnGap,
    height: 1,
    backgroundColor: colors.border,
  },
  learnRow: {
    marginTop: t.learnPadTop,
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.learnSize,
    color: colors.textBody,
  },
  learnLink: {
    marginLeft: 8,
    marginRight: 2,
    fontFamily: font.appSemi,
    fontSize: t.learnLinkSize,
    color: ink.accent,
  },
  sectionLabel: {
    marginTop: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  speedLabel: {
    marginTop: t.speedGap,
  },
  sectionSub: {
    marginTop: t.sectionSubGap,
    fontFamily: font.appBody,
    fontSize: t.sectionSubSize,
    color: colors.textBody,
  },
  option: {
    marginTop: t.optionGap,
    borderRadius: t.optionRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.optionBorder,
    padding: t.optionPad,
  },
  optionOn: {
    borderColor: t.optionOnBorder,
  },
  optionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    minHeight: t.badgeHeight,
    borderRadius: t.badgeRadius,
    paddingHorizontal: t.badgePadX,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  badgeText: {
    fontFamily: font.appSemi,
    fontSize: t.badgeSize,
    letterSpacing: t.badgeSpacing,
    color: colors.textBody,
  },
  radio: {
    marginLeft: 10,
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    borderWidth: 1.5,
    borderColor: t.optionBorder,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.brandDark,
    backgroundColor: colors.brandDark,
  },
  radioInner: {
    width: t.radioInner,
    height: t.radioInner,
    borderRadius: t.radioInner / 2,
    backgroundColor: colors.card,
  },
  optionTitle: {
    marginTop: t.optionTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.optionTitleSize,
    color: colors.textPrimary,
  },
  optionBody: {
    marginTop: t.optionBodyGap,
    fontFamily: font.appBody,
    fontSize: t.optionBodySize,
    lineHeight: t.optionBodyLineHeight,
    color: colors.textBody,
  },
  optionLink: {
    marginTop: t.optionLinkGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLinkText: {
    fontFamily: font.appSemi,
    fontSize: t.optionLinkSize,
    color: colors.textPrimary,
  },
  optionLinkIcon: {
    marginLeft: t.optionLinkIconGap,
  },
  assistRow: {
    marginTop: t.assistGap,
    flexDirection: 'row',
    gap: t.assistColGap,
  },
  assist: {
    flex: 1,
    minWidth: 0,
    minHeight: t.assistHeight,
    borderRadius: t.assistRadius,
    backgroundColor: t.assistBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  assistLabel: {
    marginLeft: t.assistIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.assistSize,
    color: colors.textPrimary,
  },
  tiers: {
    marginTop: t.tierGap,
    flexDirection: 'row',
    gap: t.tierColGap,
  },
  tier: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.tierRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.tierBorder,
    padding: t.tierPad,
  },
  tierOn: {
    borderColor: t.tierOnBorder,
  },
  tierHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierBadge: {
    minHeight: t.tierBadgeHeight,
    borderRadius: t.tierBadgeRadius,
    paddingHorizontal: t.tierBadgePadX,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  tierBadgeText: {
    fontFamily: font.appSemi,
    fontSize: t.tierBadgeSize,
    letterSpacing: t.tierBadgeSpacing,
    color: colors.textBody,
  },
  tierCheckOn: {
    marginLeft: 6,
    width: t.tierCheck,
    height: t.tierCheck,
    borderRadius: t.tierCheck / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCheckOff: {
    marginLeft: 6,
    width: t.tierCheck,
    height: t.tierCheck,
    borderRadius: t.tierCheck / 2,
    borderWidth: 1.5,
    borderColor: t.tierBorder,
  },
  tierLabel: {
    marginTop: t.tierLabelGap,
    fontFamily: font.appHeading,
    fontSize: t.tierLabelSize,
    color: colors.textPrimary,
  },
  tierPrice: {
    marginTop: t.tierPriceGap,
    fontFamily: font.appHeading,
    fontSize: t.tierPriceSize,
    color: colors.textPrimary,
  },
  tierNote: {
    marginTop: t.tierNoteGap,
    fontFamily: font.appBody,
    fontSize: t.tierNoteSize,
    color: colors.textBody,
  },
  fine: {
    marginTop: t.fineGap,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: font.appBody,
    fontSize: t.fineSize,
    lineHeight: t.fineLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
});
