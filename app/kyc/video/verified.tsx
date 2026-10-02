import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Copy,
  FileText,
  Lock,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, font, ink, vkycVerified as t } from '../../../constants/theme';
import { useKyc } from '../../../context/kyc';

// Video KYC complete (design/99). Back to the light theme — the dark treatment stops
// at the capture screen.
//
// REPORTED — design/99's date reads "Today, Oct 24, 2024", two years behind the app's
// September 2026. The same stale date appears on design/95. Replaced with a date
// consistent with the rest of the app, as there.
//
// Unlike design/95, this screen's pill reads "STEP 3 OF 3 • COMPLETED" — the correct
// counter. design/95's "STEP 2 OF 3" on its own final screen is the outlier.

const DETAILS = [
  { label: 'Method', value: 'Video KYC' },
  { label: 'Status', value: 'Verified', status: true },
  // design/99: "Today, Oct 24, 2024". Moved to September 2026 to match data/cases.ts,
  // data/legalNotice.ts and app/kyc/digilocker/verified.tsx.
  { label: 'Date', value: 'Today, Sep 24, 2026' },
  { label: 'Reference ID', value: '#KYC-84920', copy: true },
];

export default function VideoKycVerifiedScreen() {
  const insets = useSafeAreaInsets();
  const { complete } = useKyc();

  const finish = () => {
    complete();
    router.replace('/legal-notice/step4-review');
  };

  return (
    <View style={styles.screen}>
      <KycHeader
        title="Verification Complete"
        leading="close"
        onLeading={() => router.replace('/legal-notice/step4')}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pill}>
          <CircleCheck size={t.pillDot + 6} color={t.pillText} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            STEP 3 OF 3 • COMPLETED
          </Text>
        </View>

        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3.5} />
          </View>
        </View>

        <Text style={styles.heading}>Identity Verified</Text>
        <Text style={styles.body}>Your video identity check is complete.</Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <ShieldCheck size={t.cardIconGlyph} color={ink.accent} />
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Verification Details
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                Encrypted
              </Text>
            </View>
          </View>

          {DETAILS.map((row, i) => (
            <View key={row.label} style={[styles.row, i > 0 && styles.rowDivided]}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {row.label}
              </Text>
              {row.status ? (
                <View style={styles.status}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText} {...shrinkToFit(0.8)}>
                    {row.value}
                  </Text>
                </View>
              ) : (
                <View style={styles.rowValueWrap}>
                  <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                    {row.value}
                  </Text>
                  {row.copy && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Copy reference ID"
                      hitSlop={8}
                      style={styles.copy}
                    >
                      <Copy size={t.copyIcon} color={colors.textBody} />
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.next}>
          <View style={styles.nextHead}>
            <View style={styles.nextIcon}>
              <FileText size={t.nextIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.nextText}>
              <Text style={styles.nextTitle} {...shrinkToFit(0.8)}>
                Next Step
              </Text>
              <Text style={styles.nextBody}>You can now continue with your legal notice.</Text>
            </View>
          </View>
          <View style={styles.nextTick}>
            <BadgeCheck size={t.nextTickIcon} color={colors.textBody} />
            <Text style={styles.nextTickText} {...shrinkToFit(0.75)}>
              Your details are attached to your legal matter.
            </Text>
          </View>
        </View>

        <View style={styles.foot}>
          <Lock size={t.footIcon} color={colors.textBody} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            Legally binding and stored under strict privacy
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={finish}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue to Legal Notice</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
        <Text style={styles.caption} {...shrinkToFit(0.8)}>
          Takes you directly to review and submit
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'center',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  pillText: {
    marginLeft: t.pillDotGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: t.pillText,
  },
  badgeRing: {
    marginTop: t.badgeTop,
    alignSelf: 'center',
    width: t.badgeRing,
    height: t.badgeRing,
    borderRadius: t.badgeRing / 2,
    backgroundColor: t.badgeRingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: t.badgeInner,
    height: t.badgeInner,
    borderRadius: t.badgeInner / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.cardIconGap,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  chip: {
    marginLeft: 10,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: colors.textBody },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowDivided: { borderTopWidth: 1, borderTopColor: t.rowDivider, paddingTop: t.rowGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowValueWrap: { flexShrink: 1, marginLeft: 12, flexDirection: 'row', alignItems: 'center' },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  copy: { marginLeft: 8 },
  status: {
    marginLeft: 12,
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: t.statusBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
    backgroundColor: t.statusText,
  },
  statusText: { fontFamily: font.appSemi, fontSize: t.statusSize, color: t.statusText },
  next: {
    marginTop: t.nextGap,
    borderRadius: t.nextRadius,
    backgroundColor: colors.card,
    padding: t.nextPad,
  },
  nextHead: { flexDirection: 'row' },
  nextIcon: {
    width: t.nextIcon,
    height: t.nextIcon,
    borderRadius: t.nextIconRadius,
    backgroundColor: t.nextIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { flex: 1, minWidth: 0, marginLeft: t.nextIconGap },
  nextTitle: { fontFamily: font.appHeading, fontSize: t.nextTitleSize, color: colors.textPrimary },
  nextBody: {
    marginTop: t.nextBodyGap,
    fontFamily: font.appBody,
    fontSize: t.nextBodySize,
    lineHeight: t.nextBodyLineHeight,
    color: colors.textBody,
  },
  nextTick: { marginTop: t.nextTickGap, flexDirection: 'row', alignItems: 'center' },
  nextTickText: {
    marginLeft: t.nextTickIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.nextTickSize,
    color: colors.textBody,
  },
  foot: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
  caption: {
    marginTop: t.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});
