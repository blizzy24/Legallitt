import { AdvocateAvatar } from '../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Headset,
  MessageSquare,
  ShieldCheck,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  LA_ADVOCATE,
  LA_MATTERS,
  LA_REQUEST_ID,
  LA_SESSION,
  LA_TIMELINE,
  laConsultType,
  type LaConsultTypeId,
} from '../../data/legalAdvice';
import { colors, font, ink, laTrack as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice tracking.
//
// THE ARTWORK IS IN design/112-la-session-chat.png, NOT design/111 — the batch's
// file names are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THREE DIFFERENT YEARS ON ONE SCREEN. design/112 reads "Placed on 23 May
// 2025" in the request card, dates the timeline 23 May 2026, and sets the meeting on
// 25 May 2026. Normalised to September 2026 throughout, consistent with the app.
//
// REPORTED — the timeline's last row, "Consultation Completed", is drawn ACTIVE (a
// hollow amber ring) with the body "Stay tuned! Your consultation is upcoming". A
// step cannot be both the completion and the thing still to come; design/111 has the
// same row ticked as done. Rendered as drawn — active here, complete there.
//
// REPORTED — the request id is "#LG12345678" here too; LA_REQUEST_ID is used.
//
// "Join Consultation" goes to the session screen for whichever type was booked.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_ROUTES: Record<LaConsultTypeId, Href> = {
  chat: '/legal-advice/session/chat',
  audio: '/legal-advice/session/audio',
  video: '/legal-advice/session/video',
};

/** design/112 shows three rows: two complete, the last active. */
const STEPS = LA_TIMELINE.filter((s) => s.title !== 'Assigned by Admin');

export default function LegalAdviceTrackScreen() {
  const insets = useSafeAreaInsets();
  const { form } = useLegalAdvice();
  const consult = laConsultType(form.consultType);
  const matter = LA_MATTERS.find((m) => m.id === form.matter);

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
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/home'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>Track Consultation</Text>
        <Text style={styles.sub} {...shrinkToFit(0.8)}>
          Stay updated with your consultation progress
        </Text>

        <View style={styles.card}>
          <View style={styles.idRow}>
            <View style={styles.idIcon}>
              <FileText size={t.idIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.idText}>
              <Text style={styles.idLabel} {...shrinkToFit(0.8)}>
                Request ID
              </Text>
              <Text style={styles.idValue} {...shrinkToFit(0.7)}>
                {LA_REQUEST_ID}
              </Text>
              <Text style={styles.idPlaced} {...shrinkToFit(0.8)}>
                Placed on {LA_SESSION.placedOn}
              </Text>
            </View>
            <View style={styles.chip}>
              <Clock size={t.chipIcon} color={t.chipColour} />
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                Scheduled
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.pairRow}>
          <View style={styles.pairCard}>
            <View style={styles.pairHead}>
              <View style={styles.pairDisc}>
                <MessageSquare size={t.pairDiscGlyph} color={t.stepDone} />
              </View>
              <Text style={styles.pairHeadText} {...shrinkToFit(0.75)}>
                Consultation Details
              </Text>
            </View>
            <View style={styles.pairRule} />
            <View style={styles.pairItem}>
              <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                Consultation Type
              </Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                {consult.title}
              </Text>
            </View>
            <View style={styles.pairRule} />
            <View style={styles.pairItem}>
              <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                Legal Category
              </Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                {matter ? matter.title : 'Property Law'}
              </Text>
            </View>
          </View>

          <View style={styles.pairCard}>
            <View style={styles.pairHead}>
              <View style={styles.pairDisc}>
                <CalendarDays size={t.pairDiscGlyph} color={t.stepDone} />
              </View>
              <Text style={styles.pairHeadText} {...shrinkToFit(0.75)}>
                Meeting Details
              </Text>
            </View>
            <View style={styles.pairRule} />
            <View style={styles.pairItem}>
              <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                Date
              </Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                {LA_SESSION.date}
              </Text>
            </View>
            <View style={styles.pairRule} />
            <View style={styles.pairItem}>
              <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                Duration
              </Text>
              <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                Upto {LA_SESSION.duration.toLowerCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.lawyerTitle}>Lawyer Details</Text>
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
              <Text style={styles.lawyerLine} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.practice} Expert
              </Text>
              <Text style={styles.rating} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.rating}{' '}
                <Text style={styles.reviews}>({LA_ADVOCATE.reviews})</Text>
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
        </View>

        <View style={styles.card}>
          <Text style={styles.lawyerTitle}>Status Timeline</Text>
          {STEPS.map((s, i) => {
            const active = i === STEPS.length - 1;
            return (
              <View key={s.title} style={styles.step}>
                <View style={styles.stepRailWrap}>
                  <View style={[styles.stepTick, active && styles.stepTickActive]}>
                    {!active && <Check size={t.stepTickGlyph} color={ink.onBrand} strokeWidth={3} />}
                  </View>
                  {i < STEPS.length - 1 && <View style={styles.stepRail} />}
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
                  <Text style={styles.stepDate} {...shrinkToFit(0.75)}>
                    {s.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.noteRow}>
            <FileText size={t.noteIcon} color={colors.brandDark} />
            <Text style={styles.noteText}>
              Please be prepared with all relevant details documents to your legal matter to make
              the most of your consultation
            </Text>
          </View>
          <View style={styles.tip}>
            <ShieldCheck size={t.tipIcon} color={colors.textBody} />
            <Text style={styles.tipText}>
              Tip: A stable internet connection is recommended for a smooth consultation experience
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(SESSION_ROUTES[consult.id])}
            style={({ pressed }) => [styles.action, styles.join, pressed && styles.pressed]}
          >
            <Video size={t.actionIcon} color={ink.onBrand} />
            <View style={styles.actionText}>
              <Text style={styles.joinTitle} {...shrinkToFit(0.7)}>
                Join Consultation
              </Text>
              <Text style={styles.joinSub} {...shrinkToFit(0.7)}>
                Starts at {LA_SESSION.time}
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/legal-advice/datetime')}
            style={({ pressed }) => [styles.action, styles.outlined, pressed && styles.pressed]}
          >
            <CalendarDays size={t.actionIcon} color={t.actionTitleColour} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle} {...shrinkToFit(0.7)}>
                Reschedule
              </Text>
              <Text style={styles.actionSub} {...shrinkToFit(0.7)}>
                Change date &amp; time
              </Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/support-chat')}
            style={({ pressed }) => [styles.action, styles.outlined, pressed && styles.pressed]}
          >
            <Headset size={t.actionIcon} color={t.actionTitleColour} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle} {...shrinkToFit(0.7)}>
                Contact Support
              </Text>
              <Text style={styles.actionSub} {...shrinkToFit(0.7)}>
                We&rsquo;re here to help
              </Text>
            </View>
          </Pressable>
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
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  idRow: { flexDirection: 'row', alignItems: 'center' },
  idIcon: {
    width: t.idIcon,
    height: t.idIcon,
    borderRadius: t.idIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idText: { flex: 1, minWidth: 0, marginLeft: t.idIconGap, marginRight: 8 },
  idLabel: { fontFamily: font.appBody, fontSize: t.idLabelSize, color: colors.textBody },
  idValue: {
    marginTop: t.idValueGap,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: colors.textPrimary,
  },
  idPlaced: {
    marginTop: t.idPlacedGap,
    fontFamily: font.appBody,
    fontSize: t.idPlacedSize,
    color: colors.textBody,
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    marginLeft: t.chipIconGap,
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: t.chipColour,
  },

  pairRow: { flexDirection: 'row', gap: t.pairGap },
  pairCard: {
    flex: 1,
    minWidth: 0,
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    paddingVertical: 2,
  },
  pairHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.cardPad,
    paddingVertical: t.pairHeadGap,
  },
  pairDisc: {
    width: t.pairDisc,
    height: t.pairDisc,
    borderRadius: t.pairDisc / 2,
    backgroundColor: t.pairDiscBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairHeadText: {
    marginLeft: t.pairDiscGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.pairHeadSize,
    color: colors.textPrimary,
  },
  pairRule: { height: 1, backgroundColor: t.pairRule },
  pairItem: { paddingHorizontal: t.cardPad, paddingVertical: t.pairRowGap },
  pairLabel: { fontFamily: font.appBody, fontSize: t.pairLabelSize, color: colors.textBody },
  pairValue: {
    marginTop: t.pairValueGap,
    fontFamily: font.appBody,
    fontSize: t.pairValueSize,
    color: colors.textPrimary,
  },

  lawyerTitle: {
    fontFamily: font.appBody,
    fontSize: t.lawyerTitleSize,
    color: colors.textPrimary,
  },
  lawyerRow: { marginTop: t.cardGap, flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: 18, color: colors.brandDark },
  lawyerText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  lawyerName: { fontFamily: font.appBody, fontSize: t.lawyerName, color: colors.textPrimary },
  lawyerLine: {
    marginTop: t.lawyerLineGap,
    fontFamily: font.appBody,
    fontSize: t.lawyerLineSize,
    color: colors.textBody,
  },
  rating: {
    marginTop: t.lawyerLineGap,
    fontFamily: font.appSemi,
    fontSize: t.ratingSize,
    color: t.ratingColour,
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
  profileText: { fontFamily: font.appBody, fontSize: t.profileSize, color: t.profileColour },

  step: { marginTop: t.stepGap, flexDirection: 'row' },
  stepRailWrap: { alignItems: 'center', alignSelf: 'stretch' },
  stepTick: {
    width: t.stepTick,
    height: t.stepTick,
    borderRadius: t.stepTick / 2,
    backgroundColor: t.stepDone,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTickActive: {
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: t.stepActive,
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
  stepDate: {
    marginTop: t.stepBodyGap,
    fontFamily: font.appBody,
    fontSize: t.stepDateSize,
    color: colors.textBody,
  },

  noteRow: { flexDirection: 'row' },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  tip: {
    marginTop: t.tipGap,
    borderRadius: t.tipRadius,
    backgroundColor: t.tipBg,
    padding: t.tipPad,
    flexDirection: 'row',
  },
  tipText: {
    marginLeft: t.tipIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.tipSize,
    lineHeight: t.tipLineHeight,
    color: colors.textBody,
  },

  actions: { marginTop: t.actionsGap, flexDirection: 'row', gap: t.actionColGap },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    paddingHorizontal: t.actionPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  join: { backgroundColor: t.joinBg },
  outlined: { borderWidth: 1, borderColor: t.actionBorder },
  pressed: { opacity: 0.85 },
  actionText: { flex: 1, minWidth: 0, marginLeft: t.actionIconGap },
  joinTitle: { fontFamily: font.appSemi, fontSize: t.actionTitleSize, color: ink.onBrand },
  joinSub: {
    marginTop: t.actionSubGap,
    fontFamily: font.appBody,
    fontSize: t.actionSubSize,
    color: 'rgba(255,255,255,0.82)',
  },
  actionTitle: {
    fontFamily: font.appSemi,
    fontSize: t.actionTitleSize,
    color: t.actionTitleColour,
  },
  actionSub: {
    marginTop: t.actionSubGap,
    fontFamily: font.appBody,
    fontSize: t.actionSubSize,
    color: colors.textBody,
  },
});
