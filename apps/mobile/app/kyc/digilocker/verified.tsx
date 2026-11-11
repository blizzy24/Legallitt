import { previewNotice } from '../../../components/PreviewNotice';
import DemoPressable from '../../../components/DemoPressable';
import { router } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Fingerprint,
  Lock,
  Share2,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KycHeader from '../../../components/KycHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { colors, dlVerified as t, font, ink } from '../../../constants/theme';
import { useKyc } from '../../../context/kyc';

// Verification Complete (design/95).
//
// REPORTED — THE STEP COUNTER IS WRONG IN THE FILE. design/95's pill reads "STEP 2 OF
// 3" on what is the LAST screen of the DigiLocker branch — design/94 already used
// "STEP 2 OF 3". Built as drawn; this is the fourth counter problem in the KYC flow,
// on top of the three nested ones noted on app/kyc/choose.tsx.
//
// REPORTED — design/95's timestamp reads "Today, Oct 24, 2024", two years behind the
// app's September 2026. Replaced with a date consistent with the rest of the app.
//
// The header uses a CLOSE icon here where design/93 and 94 use a back arrow; close
// returns to the upload step rather than retreating into the checking screen.
//
// The photograph is an initials avatar sized to the file's circle, as elsewhere.

const PERSON = {
  initials: 'PS',
  name: 'Priya Sharma',
  dob: 'DOB: 14 Aug 1994',
  gender: 'Female',
};

const FIELDS = [
  { label: 'Full Legal Name', value: 'Priya Sharma' },
  { label: 'Residential Address', value: '42 Palm Avenue, Indiranagar, Bengaluru, KA 560038' },
  { label: 'Document Source', value: 'Aadhaar Card (via DigiLocker)', icon: Fingerprint },
];

// design/95 reads "Today, Oct 24, 2024". Moved to September 2026 to match the rest of
// the app's dates (data/cases.ts, data/legalNotice.ts, data/fir.ts).
const VERIFICATION = [
  { label: 'Method', value: 'DigiLocker' },
  { label: 'Status', value: 'Verified', dot: true },
  { label: 'Timestamp', value: 'Today, Sep 24, 2026' },
  { label: 'Reference ID', value: '#DL-92841', copy: true },
];

export default function DigilockerVerifiedScreen() {
  const insets = useSafeAreaInsets();
  const { complete, returnTo } = useKyc();

  const finish = () => {
    complete();
    router.replace(returnTo);
  };

  return (
    <View style={styles.screen}>
      <KycHeader
        title="Verification Complete"
        leading="close"
        onLeading={() => router.replace(returnTo)}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            STEP 3 OF 3
          </Text>
        </View>

        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <Check size={t.badgeGlyph} color={ink.onBrand} strokeWidth={3.5} />
          </View>
        </View>

        <Text style={styles.heading}>Details Verified</Text>
        <Text style={styles.body}>Your identity details were verified using DigiLocker.</Text>

        <View style={styles.person}>
          <View>
            {/* Placeholder for design/95's photograph, sized to the file's box. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{PERSON.initials}</Text>
            </View>
            <View style={styles.photoBadge}>
              <BadgeCheck size={t.photoBadgeGlyph} color={ink.onBrand} />
            </View>
          </View>

          <View style={styles.personText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} {...shrinkToFit(0.8)}>
                {PERSON.name}
              </Text>
              <View style={styles.match}>
                <Text style={styles.matchText} {...shrinkToFit(0.8)}>
                  MATCH
                </Text>
              </View>
            </View>
            <Text style={styles.dob} {...shrinkToFit(0.8)}>
              {PERSON.dob} • {PERSON.gender}
            </Text>
          </View>

          <DemoPressable accessibilityRole="button" accessibilityLabel="Share" style={styles.share}>
            <Share2 size={t.shareIcon} color={colors.textPrimary} />
          </DemoPressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}>
              <ShieldCheck size={t.cardIconGlyph} color={ink.accent} />
            </View>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Verified Details
            </Text>
            <View style={styles.official}>
              <BadgeCheck size={t.officialIcon} color={t.officialText} />
              <Text style={styles.officialText} {...shrinkToFit(0.8)}>
                Official
              </Text>
            </View>
          </View>

          {FIELDS.map((f) => (
            <View key={f.label} style={styles.field}>
              <View style={styles.fieldText}>
                <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
                  {f.label}
                </Text>
                <Text style={styles.fieldValue}>{f.value}</Text>
              </View>
              {f.icon && <f.icon size={t.fieldIcon} color={colors.textBody} />}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardIcon}>
              <Lock size={t.cardIconGlyph} color={ink.accent} />
            </View>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Verification Info
            </Text>
          </View>

          <View style={styles.grid}>
            {VERIFICATION.map((v) => (
              <View key={v.label} style={styles.cell}>
                <Text style={styles.gridLabel} {...shrinkToFit(0.8)}>
                  {v.label}
                </Text>
                <View style={styles.gridValueRow}>
                  {v.dot && <View style={styles.gridDot} />}
                  <Text
                    style={[styles.gridValue, v.dot && styles.gridValueOk]}
                    {...shrinkToFit(0.7)}
                  >
                    {v.value}
                  </Text>
                  {v.copy && (
                    <Pressable onPress={() => previewNotice("Copy reference")} accessibilityRole="button" accessibilityLabel="Copy reference" hitSlop={8}>
                      <Copy size={t.gridCopy} color={colors.textBody} />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.foot}>
          <BadgeCheck size={t.footIcon} color={t.officialText} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            Legally valid record attached to your notice
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={finish}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
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
    minHeight: 30,
    borderRadius: 15,
    paddingHorizontal: 14,
    backgroundColor: '#F1ECE5',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 7,
    backgroundColor: t.badgeBg,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.textBody,
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
  person: {
    marginTop: t.personGap,
    borderRadius: t.personRadius,
    backgroundColor: colors.card,
    padding: t.personPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photoRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  photoBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: t.photoBadge,
    height: t.photoBadge,
    borderRadius: t.photoBadge / 2,
    backgroundColor: t.badgeBg,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personText: { flex: 1, minWidth: 0, marginLeft: t.photoGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  match: {
    marginLeft: t.matchGap,
    minHeight: t.matchHeight,
    borderRadius: t.matchRadius,
    paddingHorizontal: t.matchPadX,
    backgroundColor: t.matchBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchText: {
    fontFamily: font.appSemi,
    fontSize: t.matchSize,
    letterSpacing: t.matchSpacing,
    color: t.matchText,
  },
  dob: {
    marginTop: t.dobGap,
    fontFamily: font.appBody,
    fontSize: t.dobSize,
    color: colors.textBody,
  },
  share: {
    marginLeft: 10,
    width: t.shareButton,
    height: t.shareButton,
    borderRadius: t.shareRadius,
    backgroundColor: t.shareBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: {
    width: t.cardIcon,
    height: t.cardIcon,
    borderRadius: t.cardIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.cardIconGap,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  official: {
    marginLeft: 10,
    minHeight: t.officialHeight,
    borderRadius: t.officialRadius,
    paddingHorizontal: t.officialPadX,
    backgroundColor: t.officialBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  officialText: {
    marginLeft: t.officialIconGap,
    fontFamily: font.appSemi,
    fontSize: t.officialSize,
    color: t.officialText,
  },
  field: {
    marginTop: t.fieldGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    padding: t.fieldPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: { flex: 1, minWidth: 0, marginRight: 10 },
  fieldLabel: { fontFamily: font.appBody, fontSize: t.fieldLabelSize, color: colors.textBody },
  fieldValue: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appHeading,
    fontSize: t.fieldValueSize,
    lineHeight: t.fieldValueLineHeight,
    color: colors.textPrimary,
  },
  grid: {
    marginTop: t.gridGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: t.gridRowGap,
    columnGap: t.gridColGap,
  },
  cell: {
    width: '47%',
    flexGrow: 1,
    borderRadius: t.gridRadius,
    backgroundColor: t.gridBg,
    padding: t.gridPad,
  },
  gridLabel: { fontFamily: font.appBody, fontSize: t.gridLabelSize, color: colors.textBody },
  gridValueRow: {
    marginTop: t.gridValueGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridDot: {
    width: t.gridDot,
    height: t.gridDot,
    borderRadius: t.gridDot / 2,
    marginRight: t.gridDotGap,
    backgroundColor: t.badgeBg,
  },
  gridValue: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.gridValueSize,
    lineHeight: t.gridValueLineHeight,
    color: colors.textPrimary,
  },
  gridValueOk: { color: t.officialText },
  foot: {
    marginTop: t.footGap,
    alignSelf: 'center',
    minHeight: t.footHeight,
    borderRadius: t.footRadius,
    paddingHorizontal: 14,
    backgroundColor: t.footBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  footText: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textPrimary,
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
