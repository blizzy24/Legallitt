import { router } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  Check,
  CircleCheck,
  Info,
  Lock,
  ShieldCheck,
  UserRound,
  Video,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, kycChoose as t } from '../../constants/theme';
import { useKyc, type KycMethod } from '../../context/kyc';

// Choose Verification Method (design/92), the entry to the KYC sub-flow.
//
// REPORTED — THREE NESTED STEP COUNTERS. This screen reads "STEP 1 OF 3 · IDENTITY
// VERIFICATION" while it sits inside the Legal Notice wizard's "Step 4 of 6", and the
// DigiLocker and Video branches then run counters of their own. A user here is on
// step 4 of 6, step 1 of 3, and step 1 of the branch, all at once. Built as drawn.
//
// REPORTED — design/92 hardcodes the button caption to "Takes you to Connect
// DigiLocker" even though the screen offers two methods. The caption follows the
// selection here, since leaving it fixed would misdescribe the Video KYC path.

const METHODS: {
  id: KycMethod;
  icon: LucideIcon;
  title: string;
  body: string;
  featureIcon: LucideIcon;
  feature: string;
  recommended?: boolean;
  caption: string;
}[] = [
  {
    id: 'digilocker',
    icon: Lock,
    title: 'DigiLocker',
    body: 'Verify using your digital documents.',
    featureIcon: Zap,
    feature: 'Quick and simple • Takes ~1 min',
    recommended: true,
    caption: 'Takes you to Connect DigiLocker',
  },
  {
    id: 'video',
    icon: Video,
    title: 'Video KYC',
    body: 'Verify your identity through a short video check.',
    featureIcon: Video,
    feature: 'Face and ID check • Takes ~2 mins',
    caption: 'Takes you to Video KYC',
  },
];

const BEFORE = [
  'Keep your official government ID ready',
  'Make sure your phone camera and internet are working',
];

export default function KycChooseScreen() {
  const insets = useSafeAreaInsets();
  const { kyc, setMethod, returnTo } = useKyc();
  const selected = METHODS.find((m) => m.id === kyc.method) ?? METHODS[0];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(returnTo))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Choose Verification Method
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pill}>
          <ShieldCheck size={t.footIcon} color={ink.accent} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            IDENTITY VERIFICATION
          </Text>
        </View>

        <Text style={styles.subtitle}>Choose one way to verify your identity.</Text>

        {METHODS.map((m) => {
          const on = kyc.method === m.id;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setMethod(m.id)}
              style={[styles.card, on && styles.cardOn]}
            >
              <View style={styles.cardHead}>
                <View style={styles.cardIcon}>
                  <m.icon size={t.cardTitleSize} color={colors.textBody} />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                      {m.title}
                    </Text>
                    {m.recommended && (
                      <View style={styles.recChip}>
                        <Text style={styles.recChipText} {...shrinkToFit(0.8)}>
                          Recommended
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardBody}>{m.body}</Text>
                </View>
                {on ? (
                  <View style={styles.checkOn}>
                    <Check size={t.checkGlyph} color={ink.onBrand} strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.checkOff} />
                )}
              </View>

              <View style={styles.feature}>
                <m.featureIcon size={t.footIcon} color={ink.accent} />
                <Text style={styles.featureText} {...shrinkToFit(0.75)}>
                  {m.feature}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.before}>
          <View style={styles.beforeHead}>
            <Info size={t.beforeIcon} color={colors.textBody} />
            <Text style={styles.beforeTitle} {...shrinkToFit(0.8)}>
              Before You Start
            </Text>
          </View>
          <View style={styles.beforeList}>
            {BEFORE.map((b) => (
              <View key={b} style={styles.beforeRow}>
                <CircleCheck size={t.beforeIcon} color="#12B76A" />
                <Text style={styles.beforeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.foot}>
          <ShieldCheck size={t.footIcon} color={ink.accent} />
          <Text style={styles.footText}>
            256-bit encryption protects all your records • Official legal compliance
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(kyc.method === 'video' ? '/kyc/video/intro' : '/kyc/digilocker/connect')
          }
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
        <Text style={styles.caption} {...shrinkToFit(0.8)}>
          {selected.caption}
        </Text>
      </ScrollView>
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
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    backgroundColor: colors.card,
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
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'flex-start',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: ink.accent,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textPrimary,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  // design/92 marks the selected card with a brown TOP border only.
  cardOn: {
    borderTopWidth: t.cardOnTopWidth,
    borderTopColor: t.cardOnTopBorder,
  },
  cardHead: {
    flexDirection: 'row',
  },
  cardIcon: {
    width: t.beforePad + 22,
    height: t.beforePad + 22,
    borderRadius: 10,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  recChip: {
    marginLeft: 9,
    minHeight: t.recChipHeight,
    borderRadius: t.recChipRadius,
    paddingHorizontal: t.recChipPadX,
    backgroundColor: t.recChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recChipText: {
    fontFamily: font.appSemi,
    fontSize: t.recChipSize,
    color: t.recChipText,
  },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  checkOn: {
    marginLeft: 10,
    width: t.check,
    height: t.check,
    borderRadius: t.check / 2,
    backgroundColor: '#12B76A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOff: {
    marginLeft: 10,
    width: t.check,
    height: t.check,
    borderRadius: t.check / 2,
    backgroundColor: colors.iconChipBg,
  },
  feature: {
    marginTop: t.featureGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.featureHeight,
    borderRadius: t.featureRadius,
    paddingHorizontal: t.featurePadX,
    backgroundColor: t.featureBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.featureSize,
    color: colors.textPrimary,
  },
  before: {
    marginTop: t.beforeGap,
    borderRadius: t.beforeRadius,
    backgroundColor: colors.card,
    padding: t.beforePad,
  },
  beforeHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  beforeTitle: {
    marginLeft: t.beforeIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.beforeTitleSize,
    color: colors.textPrimary,
  },
  beforeList: {
    marginTop: t.beforeListGap,
    gap: t.beforeRowGap,
  },
  beforeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  beforeText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.beforeIconGap,
    fontFamily: font.appBody,
    fontSize: t.beforeSize,
    lineHeight: t.beforeLineHeight,
    color: colors.textBody,
  },
  foot: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
  },
  footText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.footIconGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brandDark,
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
  caption: {
    marginTop: t.captionGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});
