import { router } from 'expo-router';
import {
  ArrowRight,
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  FileText,
  Lock,
  Scale,
  ScanSearch,
  ShieldCheck,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psInfo as t } from '../../constants/theme';

// Property Search Report — why it matters (design/73).
//
// REPORTED — WRONG HEADER IN THE FILE. design/73 is headed "DATA & PRIVACY / Data &
// Documents", which belongs to the profile section (design/67). The body of the
// screen is entirely property search. The header is rendered as
// "PROPERTY DUE DILIGENCE / Property Search Report" to match the content; the file's
// own header is not reproduced.

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: 'Ownership Verification',
    body: 'Helps review the recorded ownership and title history of the property.',
  },
  {
    icon: Scale,
    title: 'Identify Existing Liabilities',
    body: 'Helps identify registered charges, mortgages or other recorded encumbrances.',
  },
  {
    icon: FileText,
    title: 'Review Property History',
    body: 'Understand relevant ownership and registration history available in official records.',
  },
  {
    icon: TrendingUp,
    title: 'Make an Informed Decision',
    body: 'Get greater clarity before committing your money to a property.',
  },
];

const CHECKS = ['Ownership & Title Records', 'Registered Encumbrances', 'Relevant Property Records'];

const WHY_LEGALITT: { icon: LucideIcon; label: string; body: string }[] = [
  { icon: ScanSearch, label: 'Search', body: 'Review relevant property records' },
  { icon: CircleCheck, label: 'Legal Review', body: 'Examined by legal advocates' },
  { icon: FileText, label: 'Dossier', body: 'Receive clear, structured report' },
];

export default function PropertySearchInfoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/property-search'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow} {...shrinkToFit(0.8)}>
            PROPERTY DUE DILIGENCE
          </Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Property Search Report
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={16} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pill}>
          <ShieldCheck size={t.pillIcon} color={ink.accent} />
          <Text style={styles.pillText} {...shrinkToFit(0.8)}>
            PROPERTY DUE DILIGENCE
          </Text>
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.heading}>Why Is a Property Search Report Important?</Text>
          {/* Placeholder — sized to design/73's artwork box. */}
          <View style={styles.headingArt} />
        </View>
        <Text style={styles.intro}>
          Before buying or investing in a property, understand its ownership history, title records
          and potential legal concerns.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why check a property before you buy?</Text>
          <Text style={styles.cardIntro}>
            A Property Search Report helps you review important property records and identify
            potential issues before making a purchase or investment.
          </Text>

          {REASONS.map((r) => (
            <View key={r.title} style={styles.item}>
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
          ))}
        </View>

        <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
          WHAT CAN THE REPORT HELP YOU CHECK?
        </Text>
        {CHECKS.map((c) => (
          <View key={c} style={styles.tick}>
            <CircleCheck size={t.tickIcon} color={t.tickColour} />
            <Text style={styles.tickText} {...shrinkToFit(0.8)}>
              {c}
            </Text>
          </View>
        ))}
        <View style={styles.footnote}>
          <CircleAlert size={t.confIcon} color={colors.textMuted} />
          <Text style={styles.footnoteText}>
            Availability of records may vary depending on the property, location and applicable
            government records.
          </Text>
        </View>

        <Text style={styles.chooseTitle}>Why choose Legalitt?</Text>
        <View style={styles.chooseRow}>
          {WHY_LEGALITT.map((w) => (
            <View key={w.label} style={styles.choose}>
              <View style={styles.chooseIcon}>
                <w.icon size={t.chooseIconGlyph} color={ink.accent} />
              </View>
              <Text style={styles.chooseLabel} {...shrinkToFit(0.75)}>
                {w.label}
              </Text>
              <Text style={styles.chooseBody}>{w.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trust}>
          <Lock size={t.trustIcon} color={ink.accent} />
          <Text style={styles.trustText} {...shrinkToFit(0.75)}>
            Professionally Prepared • Encrypted • Actionable
          </Text>
        </View>

        <View style={styles.close}>
          <Text style={styles.closeTitle} {...shrinkToFit(0.8)}>
            Ready to check your property?
          </Text>
          <Text style={styles.closeBody}>
            Review official records before making a high-stake commitment.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/property-search/request')}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>Start Property Search</Text>
            <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
          </Pressable>
          <View style={styles.conf}>
            <ShieldCheck size={t.confIcon} color={ink.accent} />
            <Text style={styles.confText} {...shrinkToFit(0.75)}>
              Your request and information remain confidential.
            </Text>
          </View>
        </View>
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
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
  },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowSpacing,
    color: colors.textMuted,
  },
  headerTitle: {
    marginTop: t.eyebrowGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginLeft: t.pillIconGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: ink.accent,
  },
  headingRow: {
    marginTop: t.headingGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heading: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  headingArt: {
    marginLeft: t.headingArtGap,
    width: t.headingArt,
    height: t.headingArt,
    borderRadius: 12,
    backgroundColor: colors.iconChipBg,
  },
  intro: {
    marginTop: t.introGap,
    fontFamily: font.appBody,
    fontSize: t.introSize,
    lineHeight: t.introLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardTitle: {
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  cardIntro: {
    marginTop: t.cardIntroGap,
    fontFamily: font.appBody,
    fontSize: t.cardIntroSize,
    lineHeight: t.cardIntroLineHeight,
    color: colors.textBody,
  },
  item: {
    marginTop: t.itemGap,
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
  sectionLabel: {
    marginTop: t.sectionGap,
    marginBottom: t.sectionLabelGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: ink.accent,
  },
  tick: {
    marginTop: t.tickGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickText: {
    marginLeft: t.tickIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.tickSize,
    color: colors.textPrimary,
  },
  footnote: {
    marginTop: t.footnoteGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footnoteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.confIconGap,
    fontStyle: 'italic',
    fontFamily: font.appBody,
    fontSize: t.footnoteSize,
    lineHeight: t.footnoteLineHeight,
    color: colors.textBody,
  },
  chooseTitle: {
    marginTop: t.chooseGap,
    fontFamily: font.appHeading,
    fontSize: t.chooseTitleSize,
    color: colors.textPrimary,
  },
  chooseRow: {
    marginTop: t.chooseCardGap,
    flexDirection: 'row',
    gap: t.chooseColGap,
  },
  choose: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.chooseRadius,
    backgroundColor: colors.card,
    padding: t.choosePad,
  },
  chooseIcon: {
    width: t.chooseIcon,
    height: t.chooseIcon,
    borderRadius: t.chooseIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseLabel: {
    marginTop: t.chooseTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.chooseLabelSize,
    color: colors.textPrimary,
  },
  chooseBody: {
    marginTop: t.chooseBodyGap,
    fontFamily: font.appBody,
    fontSize: t.chooseBodySize,
    lineHeight: t.chooseBodyLineHeight,
    color: colors.textBody,
  },
  trust: {
    marginTop: t.trustGap,
    borderRadius: t.trustRadius,
    backgroundColor: t.trustBg,
    padding: t.trustPad,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    marginLeft: t.trustIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.trustSize,
    lineHeight: t.trustLineHeight,
    color: ink.accent,
  },
  close: {
    marginTop: t.closeGap,
    borderRadius: t.closeRadius,
    backgroundColor: colors.card,
    padding: t.closePad,
    alignItems: 'center',
  },
  closeTitle: {
    fontFamily: font.appHeading,
    fontSize: t.closeTitleSize,
    color: colors.textPrimary,
  },
  closeBody: {
    marginTop: t.closeBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.closeBodySize,
    lineHeight: t.closeBodyLineHeight,
    color: colors.textBody,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: t.closeButtonGap,
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
  conf: {
    marginTop: t.confGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confText: {
    marginLeft: t.confIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.confSize,
    color: colors.textBody,
  },
});
