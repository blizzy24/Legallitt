import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  CircleCheck,
  ChevronLeft,
  FileText,
  ShieldCheck,
  Star,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from '../../components/PaymentMethods';
import { shrinkToFit } from '../../constants/textFit';
import { LA_ADVOCATE } from '../../data/legalAdvice';
import { colors, font, ink, laCompleted as t } from '../../constants/theme';

// Consultation complete (design/116-la-book-followup.png — the file name is wrong;
// the batch's numbering is shifted by one).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE COMPACT PAYMENT VARIANT DOES NOT EXIST IN THE EXPORT. The brief
// describes a second version of this screen with three compact method chips in place
// of the full list. Following the batch's one-place numbering shift that would be
// design/121, and design/121-la-experience-chat.png is "Request a Callback" — a
// different screen entirely. No file in the batch draws a compact payment row.
//
// Built with the full list that design/116 actually draws, reusing
// components/PaymentMethods.tsx — the same component already serving Legal Notice,
// Property Search and Document Forensic. design/116's list is identical to theirs,
// down to UPI being pre-selected with "Scan QR Code" chosen inside it.
//
// REPORTED — the ₹100 "Written Legal Advice & Action Plan" is an upsell offered on a
// screen with a payment list but no total, no invoice and no confirmation step. What
// the payment list is meant to charge for — the ₹100 opinion, or the follow-up
// booked by the button below it — is not drawn. Pricing stays blocked; nothing here
// computes or charges anything.
//
// Drawn as-is: the summary opens "Your discussed your property dispute…".
// ─────────────────────────────────────────────────────────────────────────────

const KEY_POINTS = [
  'Ownership and boundary rights',
  'Legal notice and documentation',
  'Possible mediation before filing a case',
  'Time and cost involved in legal action',
];

export default function LegalAdviceCompletedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + t.backTop, paddingBottom: insets.bottom + t.cardGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice/track'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title} {...shrinkToFit(0.8)}>
          Consultation Completed
        </Text>
        <Text style={styles.body}>
          Thank you for consulting with our legal experts. We hope we were able to assist you with
          clarity and confidence
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lawyer Details</Text>
          <View style={styles.lawyerRow}>
            {/* Client-supplied replacement portrait; mapping in data/advocates.ts. */}
            <AdvocateAvatar name={LA_ADVOCATE.name} style={styles.photo}><Text style={styles.photoText}>{LA_ADVOCATE.initials}</Text></AdvocateAvatar>
            <View style={styles.lawyerText}>
              <Text style={styles.lawyerName} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.name}
              </Text>
              <Text style={styles.lawyerLine} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.experience}
              </Text>
              <View style={styles.lawyerIconRow}>
                <ShieldCheck size={t.lawyerIcon} color={colors.textBody} />
                <Text style={styles.lawyerLineTight} {...shrinkToFit(0.75)}>
                  {LA_ADVOCATE.practice} Expert
                </Text>
              </View>
              <View style={styles.lawyerIconRow}>
                <Star size={t.lawyerIcon} color={colors.brand} fill={colors.brand} />
                <Text style={styles.rating} {...shrinkToFit(0.75)}>
                  {LA_ADVOCATE.rating}{' '}
                  <Text style={styles.reviews}>({LA_ADVOCATE.reviews})</Text>
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/advocates/adv-1' as Href)}
              style={styles.profile}
            >
              <Text style={styles.profileText} {...shrinkToFit(0.75)}>
                View Profile
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultation Summary</Text>
          {/* "Your discussed…" is the file's wording. */}
          <Text style={styles.summary}>
            Your discussed your property dispute regarding boundary issue with your neighbor The
            legal expert has analyzed your concern and provide clarity on your rights and the
            possible legal options available
          </Text>

          <View style={styles.key}>
            <View style={styles.keyDisc}>
              <FileText size={t.keyDiscGlyph} color="#1E8B4D" />
            </View>
            <View style={styles.keyText}>
              <Text style={styles.keyTitle} {...shrinkToFit(0.8)}>
                Key Points Discussed
              </Text>
              {KEY_POINTS.map((k) => (
                <View key={k} style={styles.keyRow}>
                  <CircleCheck size={t.keyTickIcon} color={colors.textBody} />
                  <Text style={styles.keyRowText}>{k}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.written}>
          <FileText size={t.writtenIcon} color={colors.textPrimary} />
          <View style={styles.writtenText}>
            <Text style={styles.writtenTitle} {...shrinkToFit(0.8)}>
              Written Legal Advice &amp; Action Plan
            </Text>
            <Text style={styles.writtenBody}>
              Get a written legal opinion with action Plan &amp; Recommendation from the side of
              Advocate for just ₹100.
            </Text>
          </View>
        </View>

        <View style={styles.payHead}>
          <Text style={styles.payLabel} {...shrinkToFit(0.8)}>
            SELECT PAYMENT METHOD
          </Text>
          <Text style={styles.paySecure} {...shrinkToFit(0.8)}>
            Fast &amp; Secure
          </Text>
        </View>
        <View style={styles.pay}>
          <PaymentMethods />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/followup')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Book Follow-up Consultation</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.alt, pressed && styles.pressed]}
        >
          <Text style={styles.altLabel}>Back To Home</Text>
        </Pressable>

        <View style={styles.foot}>
          <ShieldCheck size={t.footIcon} color={t.footColour} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            Your information is safe with us and will never be shared
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX },

  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  cardTitle: { fontFamily: font.appBody, fontSize: t.cardTitleSize, color: colors.textPrimary },

  lawyerRow: { marginTop: t.lawyerGap, flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: 17, color: colors.brandDark },
  lawyerText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  lawyerName: { fontFamily: font.appHeading, fontSize: t.lawyerName, color: colors.textPrimary },
  lawyerLine: {
    marginTop: t.lawyerLineGap,
    fontFamily: font.appBody,
    fontSize: t.lawyerLineSize,
    color: colors.textBody,
  },
  lawyerIconRow: { marginTop: t.lawyerLineGap, flexDirection: 'row', alignItems: 'center' },
  lawyerLineTight: {
    marginLeft: t.lawyerIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lawyerLineSize,
    color: colors.textBody,
  },
  rating: {
    marginLeft: t.lawyerIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.lawyerLineSize,
    color: colors.textPrimary,
  },
  reviews: { fontFamily: font.appBody, color: colors.textBody },
  profile: {
    minHeight: t.profileHeight,
    borderRadius: t.profileRadius,
    borderWidth: 1,
    borderColor: t.profileBorder,
    paddingHorizontal: t.profilePadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { fontFamily: font.appBody, fontSize: t.profileSize, color: colors.textBody },

  summary: {
    marginTop: t.summaryGap,
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textBody,
  },
  key: {
    marginTop: t.keyGap,
    borderRadius: t.keyRadius,
    backgroundColor: t.keyBg,
    padding: t.keyPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyDisc: {
    width: t.keyDisc,
    height: t.keyDisc,
    borderRadius: t.keyDisc / 2,
    backgroundColor: t.keyDiscBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { flex: 1, minWidth: 0, marginLeft: t.keyDiscGap },
  keyTitle: { fontFamily: font.appHeading, fontSize: t.keyTitleSize, color: colors.textPrimary },
  keyRow: { marginTop: t.keyRowGap, flexDirection: 'row', alignItems: 'center' },
  keyRowText: {
    marginLeft: t.keyTickGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.keyRowSize,
    color: colors.textPrimary,
  },

  written: {
    marginTop: t.cardGap,
    borderRadius: t.writtenRadius,
    backgroundColor: t.writtenBg,
    padding: t.writtenPad,
    flexDirection: 'row',
  },
  writtenText: { flex: 1, minWidth: 0, marginLeft: t.writtenIconGap },
  writtenTitle: {
    fontFamily: font.appHeading,
    fontSize: t.writtenTitleSize,
    color: colors.textPrimary,
  },
  writtenBody: {
    marginTop: t.writtenBodyGap,
    fontFamily: font.appBody,
    fontSize: t.writtenBodySize,
    lineHeight: t.writtenBodyLineHeight,
    color: colors.textBody,
  },

  payHead: {
    marginTop: t.payLabelGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.payLabelSize,
    letterSpacing: t.payLabelSpacing,
    color: colors.textPrimary,
  },
  paySecure: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.paySecureSize,
    color: t.paySecureColour,
  },
  pay: { marginTop: t.payGap },

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: ink.onBrand },
  alt: {
    marginTop: t.altGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    borderWidth: 1,
    borderColor: t.altBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: colors.brandDark },
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
    color: t.footColour,
  },
});
