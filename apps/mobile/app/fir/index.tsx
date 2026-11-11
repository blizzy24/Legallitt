import { router } from 'expo-router';
import { ArrowRight, ChevronLeft, CircleCheck, FileText, Info, Lock, Paperclip, PenTool, Shield, type LucideIcon } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firLanding as l, font, ink } from '../../constants/theme';

type Feature = { icon: LucideIcon; title: string; body: string };

// design/40's 2x2 grid, in the order drawn. Both cards in a row share a height.
const FEATURES: Feature[][] = [
  [
    { icon: FileText, title: 'Clear Incident Details', body: 'Organize the facts of your incident clearly.' },
    { icon: PenTool, title: 'Legal Drafting Support', body: 'Get help preparing your FIR draft.' },
  ],
  [
    { icon: Paperclip, title: 'Supporting Documents', body: 'Add relevant documents or evidence.' },
    { icon: CircleCheck, title: 'Review & Track', body: 'Track your request through Legalitt.' },
  ],
];

// FIR Draft service landing (design/40). Reached from the FIR Draft tiles on Home
// and All Services.
function FixtureFirLandingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + l.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <ChevronLeft size={l.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>FIR Draft Service</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="About this service" hitSlop={10} onPress={() => router.push('/fir/info')}>
          <Info size={l.infoIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + l.footerGap }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Get Help With Your FIR Draft</Text>
            <Text style={styles.heroSub}>Prepare a clear FIR draft by sharing your incident details and supporting information.</Text>
          </View>
          {/* Placeholder for design/40's clipboard illustration, sized to its artwork box. */}
          <View style={styles.heroArt} />
        </View>

        <Text style={styles.section}>Why Use This Service?</Text>
        <View style={styles.grid}>
          {FEATURES.map((row) => (
            <View key={row[0].title} style={styles.gridRow}>
              {row.map((feat) => {
                const Icon = feat.icon;
                return (
                  <View key={feat.title} style={styles.featureCard}>
                    <View style={styles.chip}>
                      <Icon size={l.chipIcon} color={ink.accent} />
                    </View>
                    <Text style={styles.featureTitle}>{feat.title}</Text>
                    <Text style={styles.featureBody}>{feat.body}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/fir/info')} style={styles.learnRow}>
          <Text style={styles.learn}>Learn more</Text>
        </Pressable>

        <Text style={[styles.section, styles.chooseSection]}>Choose How You Would Like To Proceed</Text>

        <OptionCard
          title="Quick Submission"
          chip="Fastest"
          body="Fill in your incident details step by step and submit your request."
          action="Start Quick Submission"
          onPress={() => router.push('/fir/step1')}
        />
        <OptionCard
          title="Assistance Service"
          chip="Advocate-Assisted"
          body="Explain your problem in your own words and our team will contact you."
          action="Get Assistance"
          outline
          onPress={() => router.push('/callback')}
        />

        <View style={styles.disclaimer}>
          <Shield size={l.disclaimerIcon} color={ink.accent} />
          <Text style={styles.disclaimerText}>
            Requirements and procedures may vary depending on the case and location. Legalitt provides legal drafting
            and advisory assistance; this does not constitute police FIR registration or guaranteed outcome.
          </Text>
        </View>

        <View style={styles.footer}>
          <Lock size={l.footerIcon} color={ink.accent} />
          <Text style={styles.footerText}>Private to you, your advocate and Legalitt’s team</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function OptionCard({
  title,
  chip,
  body,
  action,
  onPress,
  outline = false,
}: {
  title: string;
  chip: string;
  body: string;
  action: string;
  onPress: () => void;
  outline?: boolean;
}) {
  return (
    <View style={styles.optionCard}>
      <View style={styles.optionTitleRow}>
        <Text style={styles.optionTitle}>{title}</Text>
        <View style={styles.optionChip}>
          <Text style={styles.optionChipText}>{chip}</Text>
        </View>
      </View>
      <Text style={styles.optionBody}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.optionButton, outline ? styles.optionButtonOutline : styles.optionButtonFill, pressed && styles.pressed]}
      >
        <Text style={[styles.optionButtonText, outline && styles.optionButtonTextOutline]}>{action}</Text>
        <ArrowRight size={l.optionButtonIcon} color={outline ? ink.accent : ink.onBrand} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: l.bg,
  },
  header: {
    minHeight: l.headerHeight,
    paddingHorizontal: l.padX + 5,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: l.cardBorder,
    backgroundColor: l.bg,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: l.titleSize,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: l.padX,
    paddingTop: l.heroGap,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  heroTitle: {
    fontFamily: font.appHeading,
    fontSize: l.heroTitleSize,
    lineHeight: l.heroTitleLineHeight,
    color: colors.textPrimary,
  },
  heroSub: {
    marginTop: l.heroSubGap,
    fontFamily: font.appBody,
    fontSize: l.heroSubSize,
    lineHeight: l.heroSubLineHeight,
    color: colors.textBody,
  },
  heroArt: {
    width: l.heroArtW,
    height: l.heroArtH,
    borderRadius: 12,
    backgroundColor: colors.iconChipBg,
  },
  section: {
    marginTop: l.sectionGap,
    fontFamily: font.appHeading,
    fontSize: l.sectionSize,
    color: colors.textPrimary,
  },
  chooseSection: {
    marginTop: l.chooseGap,
  },
  grid: {
    marginTop: l.gridGap,
    gap: l.gridRowGap,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: l.gridColGap,
  },
  featureCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: l.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    paddingHorizontal: l.cardPadX,
    paddingTop: l.cardPadTop,
    paddingBottom: l.cardPadBottom,
  },
  chip: {
    width: l.chip,
    height: l.chip,
    borderRadius: l.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    marginTop: l.cardTitleGap,
    fontFamily: font.appHeading,
    fontSize: l.cardTitleSize,
    lineHeight: l.cardTitleLineHeight,
    color: colors.textPrimary,
  },
  featureBody: {
    marginTop: l.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: l.cardBodySize,
    lineHeight: l.cardBodyLineHeight,
    color: colors.textBody,
  },
  learnRow: {
    marginTop: l.learnGap,
    alignSelf: 'flex-end',
  },
  learn: {
    fontFamily: font.appSemi,
    fontSize: l.learnSize,
    color: ink.accent,
  },
  optionCard: {
    marginTop: l.optionGap,
    borderRadius: l.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: l.cardBorder,
    paddingHorizontal: l.optionPadX,
    paddingTop: l.optionPadTop,
    paddingBottom: l.optionPadBottom,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontFamily: font.appHeading,
    fontSize: l.optionTitleSize,
    color: colors.textPrimary,
  },
  optionChip: {
    marginLeft: l.optionChipGap,
    height: l.optionChipHeight,
    borderRadius: l.optionChipHeight / 2,
    paddingHorizontal: l.optionChipPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  optionChipText: {
    fontFamily: font.appSemi,
    fontSize: l.optionChipSize,
    color: ink.accent,
  },
  optionBody: {
    marginTop: l.optionBodyGap,
    fontFamily: font.appBody,
    fontSize: l.optionBodySize,
    lineHeight: l.optionBodyLineHeight,
    color: colors.textBody,
  },
  optionButton: {
    marginTop: l.optionButtonGap,
    height: l.optionButtonHeight,
    borderRadius: l.optionButtonRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: l.optionButtonIconGap,
  },
  optionButtonFill: {
    backgroundColor: colors.brand,
  },
  optionButtonOutline: {
    borderWidth: 1,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.85,
  },
  optionButtonText: {
    fontFamily: font.appSemi,
    fontSize: l.optionButtonSize,
    color: ink.onBrand,
  },
  optionButtonTextOutline: {
    color: ink.accent,
  },
  disclaimer: {
    marginTop: l.disclaimerGap,
    borderRadius: l.cardRadius,
    backgroundColor: l.disclaimerBg,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: l.disclaimerPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: l.disclaimerIconGap,
  },
  disclaimerText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: l.disclaimerSize,
    lineHeight: l.disclaimerLineHeight,
    color: colors.textBody,
  },
  footer: {
    marginTop: l.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: l.footerIconGap,
  },
  footerText: {
    fontFamily: font.appBody,
    fontSize: l.footerSize,
    color: ink.accent,
  },
});
import FirClient from '../../features/fir/FirClient';
import {DATA_SOURCE} from '../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirClient/> : <FixtureFirLandingScreen/>; }
