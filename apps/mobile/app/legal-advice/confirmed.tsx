import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Copy,
  FileText,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepIndicator5 from '../../components/StepIndicator5';
import { shrinkToFit } from '../../constants/textFit';
import {
  LA_ADVOCATE,
  LA_REQUEST_ID,
  LA_SESSION,
  LA_TIMELINE,
  laConsultType,
} from '../../data/legalAdvice';
import { colors, font, ink, laConfirmed as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice booking confirmed.
//
// THE ARTWORK IS IN design/111-la-track.png, NOT design/110 — the batch's file names
// are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — "ASSIGNED BY ADMIN" APPEARS AGAIN. This is the SECOND service to name
// an admin role with a work queue, after the Document Forensic tracking screen
// (design/89). Two services now assume an admin who picks up requests and allocates
// professionals, and no admin screen exists anywhere in the designs. That is a whole
// second application implied by two timeline rows.
//
// REPORTED — the banner reads "Consultation Completed Successfully!" on what is a
// BOOKING confirmation: the consultation has not happened. The timeline underneath
// says the same thing twice over, ticking "Consultation Completed" as done while its
// own body reads "Stay tuned! Your consultation is upcoming". Rendered as drawn.
//
// REPORTED — the stepper here is back to FIVE steps after design/107's six, and
// every circle is drawn filled rather than only the last.
//
// REPORTED — the request id is "#LG12345678", a placeholder in a shape no other
// service uses. LA_REQUEST_ID is used instead.
//
// REPORTED — dates read 23 and 25 May 2026; normalised to September 2026.
// ─────────────────────────────────────────────────────────────────────────────

export default function LegalAdviceConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const { form } = useLegalAdvice();
  const consult = laConsultType(form.consultType);

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
          onPress={() => router.replace('/(tabs)/home')}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <StepIndicator5 active={5} allComplete />

        <View style={styles.banner}>
          <Text style={styles.bannerTitle} {...shrinkToFit(0.8)}>
            Consultation Completed Successfully!
          </Text>
          <Text style={styles.bannerBody}>
            Your Consultation request has been confirmed.{'\n'}We look forward to assisting you.
          </Text>
        </View>

        <View style={styles.row}>
          <FileText size={t.rowIcon} color={colors.brandDark} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              Request ID
            </Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
              {LA_REQUEST_ID}
            </Text>
          </View>
          <Pressable onPress={() => previewNotice("Copy request ID")} accessibilityRole="button" accessibilityLabel="Copy request ID" style={styles.copy}>
            <Copy size={t.copyIcon} color={colors.textBody} />
            <Text style={styles.copyText} {...shrinkToFit(0.8)}>
              Copy
            </Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <MessageSquare size={t.rowIcon} color={colors.brandDark} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              Consultation Type
            </Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
              {consult.title}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <CalendarDays size={t.rowIcon} color={colors.brandDark} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
              Date &amp; Time
            </Text>
            <Text style={styles.rowValue} {...shrinkToFit(0.75)}>
              {LA_SESSION.dateTime}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.avatarOuter}>
            <UserRound size={t.avatarOuterGlyph} color={colors.textBody} />
          </View>
          {/* Placeholder for design/111's photograph, sized to its box. */}
          <View style={styles.photo}>
            <Text style={styles.photoText}>{LA_ADVOCATE.initials}</Text>
          </View>
          <View style={styles.advText}>
            <Text style={styles.advName} {...shrinkToFit(0.75)}>
              {LA_ADVOCATE.name}
            </Text>
            <Text style={styles.advExp} {...shrinkToFit(0.75)}>
              {LA_ADVOCATE.experience}
            </Text>
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Request Status</Text>

          {LA_TIMELINE.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={styles.stepRailWrap}>
                <View style={styles.stepTick}>
                  <Check size={t.stepTickGlyph} color={ink.onBrand} strokeWidth={3} />
                </View>
                {i < LA_TIMELINE.length - 1 && <View style={styles.stepRail} />}
              </View>
              <View style={styles.stepText}>
                <Text style={styles.stepTitle} {...shrinkToFit(0.75)}>
                  {s.title}
                </Text>
                <Text style={styles.stepBody}>{s.body}</Text>
              </View>
              <View style={styles.stepWhen}>
                <Text style={styles.stepDate} {...shrinkToFit(0.75)}>
                  {s.date}
                </Text>
                <Text style={styles.stepTime} {...shrinkToFit(0.75)}>
                  {s.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/track')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Track Request</Text>
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

  banner: {
    marginTop: t.bannerGap,
    borderRadius: t.bannerRadius,
    backgroundColor: t.bannerBg,
    padding: t.bannerPad,
  },
  bannerTitle: { fontFamily: font.appBody, fontSize: t.bannerTitleSize, color: colors.textPrimary },
  bannerBody: {
    marginTop: t.bannerBodyGap,
    fontFamily: font.appBody,
    fontSize: t.bannerBodySize,
    lineHeight: t.bannerBodyLineHeight,
    color: colors.textBody,
  },

  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    borderWidth: 1,
    borderColor: t.rowBorder,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowIconGap, marginRight: 8 },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  copy: {
    minHeight: t.copyHeight,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.copyBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: t.copyIconGap,
    fontFamily: font.appBody,
    fontSize: t.copySize,
    color: colors.textBody,
  },

  avatarOuter: {
    width: t.avatarOuter,
    height: t.avatarOuter,
    borderRadius: t.avatarOuter / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    marginLeft: t.photoGap,
    width: t.photo,
    height: t.photo,
    borderRadius: t.photoRadius,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: 16, color: colors.brandDark },
  advText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  advName: { fontFamily: font.appBody, fontSize: t.advName, color: colors.textPrimary },
  advExp: {
    marginTop: t.advExpGap,
    fontFamily: font.appHeading,
    fontSize: t.advExpSize,
    color: colors.textPrimary,
  },
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

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.rowBorder,
    padding: t.cardPad,
  },
  cardTitle: { fontFamily: font.appHeading, fontSize: t.cardTitleSize, color: colors.textPrimary },

  step: { marginTop: t.stepGap, flexDirection: 'row' },
  stepRailWrap: { alignItems: 'center', alignSelf: 'stretch' },
  stepTick: {
    width: t.stepTick,
    height: t.stepTick,
    borderRadius: t.stepTick / 2,
    backgroundColor: t.stepTickColour,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRail: {
    flex: 1,
    width: t.stepRail,
    marginTop: 4,
    marginBottom: -t.stepGap,
    borderLeftWidth: t.stepRail,
    borderStyle: 'dashed',
    borderColor: t.stepRailColour,
  },
  stepText: { flex: 1, minWidth: 0, marginLeft: t.stepGapX, marginRight: 8 },
  stepTitle: { fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: colors.textPrimary },
  stepBody: {
    marginTop: t.stepBodyGap,
    fontFamily: font.appBody,
    fontSize: t.stepBodySize,
    color: colors.textBody,
  },
  stepWhen: { alignItems: 'flex-end' },
  stepDate: { fontFamily: font.appBody, fontSize: t.stepDateSize, color: colors.textBody },
  stepTime: {
    marginTop: t.stepBodyGap,
    fontFamily: font.appBody,
    fontSize: t.stepDateSize,
    color: colors.textBody,
  },

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
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
