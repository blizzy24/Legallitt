import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  CircleAlert,
  FileSearch,
  MessageSquare,
  PenLine,
  PhoneCall,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, dfLanding as t, font, ink } from '../../constants/theme';
import { useDocumentForensic } from '../../context/documentForensic';
import { DF_DELIVERABLES, DF_TIERS, dfTierFor, type DfTierId } from '../../data/documentForensic';

// Document Forensic landing (design/82).
//
// The footer bar's fee follows the selected tier, as the file draws it with Ordinary
// selected and "Fee: ₹1,499".
//
// The hero illustration is a sized placeholder — no asset, so the box matches the
// file's artwork and a real image drops in without moving anything.

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileSearch,
    title: 'Document Analysis',
    body: 'Review the uploaded document for important inconsistencies and unusual elements.',
  },
  {
    icon: PenLine,
    title: 'Alteration Review',
    body: 'Identify potential signs of editing, modification or irregular formatting.',
  },
  {
    icon: CircleAlert,
    title: 'Important Findings',
    body: 'Highlight observations that may require further professional review.',
  },
  {
    icon: BadgeCheck,
    title: 'Professional Assessment',
    body: 'Get the findings presented in a clear report.',
  },
];

export default function DocumentForensicLandingScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useDocumentForensic();
  const tier = dfTierFor(form.tier);

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          Document Forensic
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroRow}>
          <Text style={styles.heroTitle}>Check Your Document Before You Rely On It</Text>
          {/* Placeholder — sized to design/82's artwork box. */}
          <View style={styles.heroArt} />
        </View>
        <Text style={styles.heroBody}>
          Get a professional forensic review of your document to identify inconsistencies, unusual
          alterations and important findings.
        </Text>

        <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
          WHY USE DOCUMENT FORENSIC REVIEW?
        </Text>
        <View style={styles.card}>
          {REASONS.map((r, i) => (
            <View key={r.title} style={i > 0 ? styles.item : undefined}>
              <View style={styles.itemRow}>
                <View style={styles.itemIcon}>
                  <r.icon size={t.itemIconGlyph} color={ink.accent} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>
                    {r.title}
                  </Text>
                  <Text style={styles.itemBody}>{r.body}</Text>
                </View>
              </View>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/document-forensic/info')}
            style={({ pressed }) => [styles.learn, pressed && styles.pressed]}
          >
            <Text style={styles.learnText} {...shrinkToFit(0.8)}>
              Learn More
            </Text>
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
            Upload your document, provide the required details and submit your forensic review
            request.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/document-forensic/upload')}
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
            Tell us what you need help with and our team will guide you through the document review
            process.
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

        <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
          CHOOSE YOUR SERVICE SPEED
        </Text>
        <Text style={styles.sectionSub}>Select the processing option that suits your requirement.</Text>

        {DF_TIERS.map((item) => (
          <TierCard
            key={item.id}
            tier={item}
            on={form.tier === item.id}
            onPress={() => update({ tier: item.id as DfTierId })}
          />
        ))}

        <Text style={styles.fine}>
          Final fee and applicable service details will be shown before submission.
        </Text>

        <View style={styles.receive}>
          <Text style={styles.receiveLabel} {...shrinkToFit(0.8)}>
            WHAT YOU RECEIVE
          </Text>
          <View style={styles.receiveGrid}>
            {DF_DELIVERABLES.map((d) => (
              <View key={d} style={styles.receiveCell}>
                <Check size={t.receiveIcon} color="#12B76A" strokeWidth={3} />
                <Text style={styles.receiveText}>{d}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <ShieldCheck size={t.barIcon} color={ink.accent} />
          <Text style={styles.barLabel} {...shrinkToFit(0.75)}>
            {form.assisted ? 'Assistance Service' : 'Quick Submission'} • {tier.label}
          </Text>
          <Text style={styles.barFeeLabel} {...shrinkToFit(0.8)}>
            Fee:{' '}
          </Text>
          <Text style={styles.barFee} {...shrinkToFit(0.8)}>
            ₹{tier.price.toLocaleString('en-IN')}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/document-forensic/upload')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </View>
    </View>
  );
}

function Radio({ on }: { on: boolean }) {
  return <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioInner} />}</View>;
}

function TierCard({
  tier,
  on,
  onPress,
}: {
  tier: (typeof DF_TIERS)[number];
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
        <Text style={styles.tierProcess} {...shrinkToFit(0.8)}>
          {tier.processing}
        </Text>
      </View>

      <View style={styles.tierBody}>
        <View style={styles.tierText}>
          <Text style={styles.tierName} {...shrinkToFit(0.8)}>
            {tier.label}
          </Text>
          <Text style={styles.tierDesc}>{tier.description}</Text>
        </View>
        <View style={styles.tierRight}>
          <Text style={styles.tierPrice} {...shrinkToFit(0.8)}>
            ₹{tier.price.toLocaleString('en-IN')}
          </Text>
          {on ? (
            <View style={styles.tierCheckOn}>
              <Check size={t.tierCheckGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          ) : (
            <View style={styles.tierCheckOff} />
          )}
        </View>
      </View>
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
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
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
  heroRow: {
    marginTop: t.heroTop,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    lineHeight: t.heroTitleLineHeight,
    color: colors.textPrimary,
  },
  heroArt: {
    marginLeft: t.heroArtGap,
    width: t.heroArt,
    height: t.heroArt,
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
  sectionLabel: {
    marginTop: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textBody,
  },
  sectionSub: {
    marginTop: t.sectionSubGap,
    fontFamily: font.appBody,
    fontSize: t.sectionSubSize,
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
  item: {
    marginTop: t.itemGap,
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemIcon: {
    width: t.itemIcon,
    height: t.itemIcon,
    borderRadius: t.itemIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.itemIconGap,
  },
  itemTitle: {
    fontFamily: font.appHeading,
    fontSize: t.itemTitleSize,
    color: colors.textPrimary,
  },
  itemBody: {
    marginTop: t.itemBodyGap,
    fontFamily: font.appBody,
    fontSize: t.itemBodySize,
    lineHeight: t.itemBodyLineHeight,
    color: colors.textBody,
  },
  learn: {
    marginTop: t.learnGap,
    alignSelf: 'flex-end',
  },
  learnText: {
    fontFamily: font.appSemi,
    fontSize: t.learnSize,
    color: ink.accent,
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
    backgroundColor: t.optionOnBg,
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
  tier: {
    marginTop: t.tierGap,
    borderRadius: t.tierRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.tierBorder,
    padding: t.tierPad,
  },
  tierOn: {
    borderColor: t.tierOnBorder,
    backgroundColor: t.tierOnBg,
  },
  tierHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBadge: {
    minHeight: t.tierBadgeHeight,
    borderRadius: t.tierBadgeRadius,
    paddingHorizontal: t.tierBadgePadX,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBadgeText: {
    fontFamily: font.appSemi,
    fontSize: t.tierBadgeSize,
    letterSpacing: t.tierBadgeSpacing,
    color: colors.textBody,
  },
  tierProcess: {
    marginLeft: t.tierProcessGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.tierProcessSize,
    color: colors.textBody,
  },
  tierBody: {
    marginTop: t.tierNameGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tierText: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  tierName: {
    fontFamily: font.appHeading,
    fontSize: t.tierNameSize,
    color: colors.textPrimary,
  },
  tierDesc: {
    marginTop: t.tierDescGap,
    fontFamily: font.appBody,
    fontSize: t.tierDescSize,
    lineHeight: t.tierDescLineHeight,
    color: colors.textBody,
  },
  tierRight: {
    alignItems: 'flex-end',
  },
  tierPrice: {
    fontFamily: font.appHeading,
    fontSize: t.tierPriceSize,
    color: colors.textPrimary,
  },
  tierCheckOn: {
    marginTop: t.tierDescGap + 4,
    width: t.tierCheck,
    height: t.tierCheck,
    borderRadius: t.tierCheck / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierCheckOff: {
    marginTop: t.tierDescGap + 4,
    width: t.tierCheck,
    height: t.tierCheck,
    borderRadius: t.tierCheck / 2,
    borderWidth: 1.5,
    borderColor: t.tierBorder,
  },
  fine: {
    marginTop: t.fineGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.fineSize,
    lineHeight: t.fineLineHeight,
    color: colors.textBody,
  },
  receive: {
    marginTop: t.receiveGap,
    borderRadius: t.receiveRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.receivePad,
  },
  receiveLabel: {
    fontFamily: font.appSemi,
    fontSize: t.receiveLabelSize,
    letterSpacing: t.receiveLabelSpacing,
    color: colors.textBody,
  },
  receiveGrid: {
    marginTop: t.receiveRowGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: t.receiveRowGap,
    columnGap: t.receiveColGap,
  },
  receiveCell: {
    width: '46%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  receiveText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.receiveIconGap,
    fontFamily: font.appBody,
    fontSize: t.receiveSize,
    lineHeight: t.receiveLineHeight,
    color: colors.textPrimary,
  },
  bar: {
    paddingHorizontal: t.padX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.barIconGap,
    fontFamily: font.appSemi,
    fontSize: t.barLabelSize,
    color: colors.textPrimary,
  },
  barFeeLabel: {
    fontFamily: font.appBody,
    fontSize: t.barFeeLabelSize,
    color: colors.textBody,
  },
  barFee: {
    fontFamily: font.appHeading,
    fontSize: t.barFeeSize,
    color: colors.textPrimary,
  },
  button: {
    marginTop: t.barButtonGap,
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
