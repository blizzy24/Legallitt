import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ChevronLeft,
  CircleMinus,
  ClipboardList,
  Eye,
  Gavel,
  Mail,
  MessageSquare,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  ScrollText,
  User,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepIndicator5, { STEP6_LABELS } from '../../components/StepIndicator5';
import { shrinkToFit } from '../../constants/textFit';
import { LA_MATTERS, laConsultType } from '../../data/legalAdvice';
import { colors, font, ink, laReview as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice review.
//
// THE ARTWORK IS IN design/107-la-payment.png, NOT design/106 — the batch's file
// names are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE STEPPER GAINS A STEP HERE. design/107 draws SIX steps where
// design/105 (the form before it) and design/111 (the confirmation after it) draw
// FIVE: "Pending for Payment" is split into a "Pending" stage and a "Payment"
// stage. The same journey is numbered two different ways on consecutive screens.
// Rendered as drawn, with the six-step list in components/StepIndicator5.tsx.
//
// REPORTED — "Preferred Consultation Time" carries the ENVELOPE icon again, the
// same defect as design/105. Rendered with a calendar here too.
//
// REPORTED — the mock data does not agree with itself: the client is "Rahul Roy"
// but the email is "aditya@gmail.com". Using the app's own mock identity instead.
//
// Every Edit chip is inert, and so are View, Add and Remove: nothing is uploaded or
// edited in this prototype.
// ─────────────────────────────────────────────────────────────────────────────

function EditChip() {
  return (
    <Pressable onPress={() => router.push('/legal-advice/details' as Href)} accessibilityRole="button" accessibilityLabel="Edit" hitSlop={6} style={styles.edit}>
      <Pencil size={t.editIcon} color={t.editColour} />
      <Text style={styles.editText} {...shrinkToFit(0.8)}>
        Edit
      </Text>
    </Pressable>
  );
}

export default function LegalAdviceReviewScreen() {
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
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/legal-advice/datetime')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <StepIndicator5 active={2} labels={STEP6_LABELS} />

        <View style={styles.intro}>
          <Text style={styles.introTitle}>Review</Text>
          <Text style={styles.introBody}>
            Please review your consultation details for confirmation and assignment of advocates
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            <ClipboardList size={t.headIcon} color={colors.brandDark} />
            <Text style={styles.headText} {...shrinkToFit(0.8)}>
              Consultation Details
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowDisc}>
              <MessageSquare size={t.rowDiscGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} {...shrinkToFit(0.8)}>
                Consultation Type
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {consult.title}
              </Text>
            </View>
            <EditChip />
          </View>

          <View style={styles.row}>
            <View style={styles.rowDisc}>
              <Gavel size={t.rowDiscGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} {...shrinkToFit(0.8)}>
                Category
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {matter ? matter.title : 'Not selected'}
              </Text>
            </View>
            <EditChip />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            <ScrollText size={t.headIcon} color={colors.brandDark} />
            <View style={styles.headTextWrap}>
              <Text style={styles.headText} {...shrinkToFit(0.8)}>
                Description
              </Text>
              <Text style={styles.desc}>
                {form.concern || 'Describe your legal concern'}
              </Text>
            </View>
            <EditChip />
          </View>
          <View style={styles.descBox} />
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            {/* design/107 draws an envelope here — see the note above. */}
            <ClipboardList size={t.headIcon} color={colors.brandDark} />
            <View style={styles.headTextWrap}>
              <Text style={styles.headText} {...shrinkToFit(0.8)}>
                Preferred Consultation Time
              </Text>
              <Text style={styles.desc} {...shrinkToFit(0.8)}>
                {form.date && form.time ? `${form.date} / ${form.time}` : 'DD/MM/YYYY / Time'}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/legal-advice/details' as Href)} accessibilityRole="button" accessibilityLabel="Edit time" hitSlop={8}>
              <Pencil size={t.pencil} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            <Paperclip size={t.headIcon} color={colors.brandDark} />
            <View style={styles.headTextWrap}>
              <Text style={styles.headText} {...shrinkToFit(0.8)}>
                Uploaded Documents
              </Text>
              <Text style={styles.note} {...shrinkToFit(0.75)}>
                Up to 25 pages — FREE Additional pages: ₹25 per page
              </Text>
              <Text style={styles.desc}>
                Add any documents that can help expert understand your case better
              </Text>

              <Pressable onPress={() => previewNotice("View")} accessibilityRole="button" style={styles.view}>
                <Eye size={t.viewIcon} color={ink.onBrand} />
                <Text style={styles.viewText} {...shrinkToFit(0.8)}>
                  View
                </Text>
              </Pressable>

              <View style={styles.actions}>
                <Pressable onPress={() => previewNotice("Add")} accessibilityRole="button" style={[styles.action, styles.add]}>
                  <Plus size={t.actionIcon} color={t.addColour} />
                  <Text style={[styles.actionText, styles.addText]} {...shrinkToFit(0.8)}>
                    Add
                  </Text>
                </Pressable>
                <Pressable onPress={() => previewNotice("Remove")} accessibilityRole="button" style={[styles.action, styles.remove]}>
                  <CircleMinus size={t.actionIcon} color={t.removeColour} />
                  <Text style={[styles.actionText, styles.removeText]} {...shrinkToFit(0.8)}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.head}>
            <UserRound size={t.headIcon} color={colors.brandDark} />
            <Text style={styles.headText} {...shrinkToFit(0.8)}>
              Client Information
            </Text>
          </View>

          {[
            { icon: User, label: 'Full Name', value: form.fullName || 'Priya Sharma' },
            { icon: Phone, label: 'Mobile Number', value: form.phone || '+91 87788999889' },
            { icon: Mail, label: 'Email Address', value: form.email || 'priya.sharma@gmail.com' },
          ].map((f) => (
            <View key={f.label} style={styles.row}>
              <View style={styles.rowDisc}>
                <f.icon size={t.rowDiscGlyph} color={colors.textBody} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                  {f.label}
                </Text>
                <Text style={styles.rowBigValue} {...shrinkToFit(0.7)}>
                  {f.value}
                </Text>
              </View>
              <EditChip />
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/payment')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
        </Pressable>
        <Text style={styles.caption} {...shrinkToFit(0.8)}>
          Your information is safe with us and will never be shared
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX },

  intro: {
    marginTop: t.introGap,
    borderRadius: t.introRadius,
    backgroundColor: t.introBg,
    padding: t.introPad,
  },
  introTitle: { fontFamily: font.appBody, fontSize: t.introTitleSize, color: colors.textPrimary },
  introBody: {
    marginTop: t.introBodyGap,
    fontFamily: font.appBody,
    fontSize: t.introBodySize,
    lineHeight: t.introBodyLineHeight,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    padding: t.cardPad,
  },
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  headTextWrap: { flex: 1, minWidth: 0, marginLeft: t.headIconGap },
  headText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.headIconGap,
    // design/107 sets these section headings in the regular weight, not bold.
    fontFamily: font.appBody,
    fontSize: t.headSize,
    color: colors.textPrimary,
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
  rowDisc: {
    width: t.rowDisc,
    height: t.rowDisc,
    borderRadius: t.rowDisc / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowDiscGap, marginRight: 8 },
  rowTitle: { fontFamily: font.appBody, fontSize: t.rowTitleSize, color: colors.textPrimary },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    color: colors.textBody,
  },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowBigValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appHeading,
    fontSize: t.rowBigValueSize,
    color: colors.textPrimary,
  },

  edit: {
    minHeight: t.editHeight,
    borderRadius: t.editRadius,
    borderWidth: 1,
    borderColor: t.editBorder,
    paddingHorizontal: t.editPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    marginLeft: t.editIconGap,
    fontFamily: font.appBody,
    fontSize: t.editSize,
    color: t.editColour,
  },

  desc: {
    marginTop: t.descGap,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    color: colors.textMuted,
  },
  descBox: { height: t.descBoxHeight },
  note: {
    marginTop: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: colors.textBody,
  },

  view: {
    marginTop: t.viewGap,
    alignSelf: 'flex-start',
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    paddingHorizontal: t.viewPadX,
    backgroundColor: t.viewBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewText: {
    marginLeft: t.viewIconGap,
    fontFamily: font.appBody,
    fontSize: t.viewSize,
    color: ink.onBrand,
  },
  actions: { marginTop: t.actionGap, flexDirection: 'row', gap: t.actionColGap },
  action: {
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    borderWidth: 1,
    paddingHorizontal: t.actionPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  add: { borderColor: t.addBorder },
  remove: { borderColor: t.removeBorder },
  actionText: { marginLeft: t.actionIconGap, fontFamily: font.appBody, fontSize: t.actionSize },
  addText: { color: t.addColour },
  removeText: { color: t.removeColour },

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
  caption: {
    marginTop: t.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.captionSize,
    color: colors.textBody,
  },
});
