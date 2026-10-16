import { previewNotice } from '../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  File,
  FileText,
  Image as ImageIcon,
  Mail,
  Paperclip,
  Phone,
  ScrollText,
  User,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepIndicator5 from '../../components/StepIndicator5';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, laDetails as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice "Your details".
//
// THE ARTWORK IS IN design/105-la-select-matter.png, NOT design/104 — the batch's
// file names are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE ₹25-PER-PAGE OVERAGE IS NOW IN A THIRD SERVICE.
//
// The same "up to 25 pages free, ₹25 per page beyond" rule appears in the FIR batch
// (design/45), the Document Forensic batch, and here. Three services, one rule,
// identical wording and figures. It should be a platform constant with one place to
// change it, not re-stated per service — and whoever owns pricing should confirm it
// applies to every service rather than these three.
//
// REPORTED — this screen's page background is WHITE, where every other screen in the
// app uses the beige #FBF9F5. Measured from the file and left as drawn.
//
// REPORTED — "Preferred Consultation Time" is drawn with the ENVELOPE icon, the same
// glyph as "Email Address" directly above it. Clearly a copy-paste; rendered with a
// clock, since repeating the mail icon on a date field is a defect rather than a
// style. Flagged so the file can be corrected.
//
// REPORTED — these flat bordered fields are a SIXTH field style in the app.
//
// Every upload affordance is inert: there is no file picker and nothing is uploaded.
// ─────────────────────────────────────────────────────────────────────────────

const UPLOAD_TILES = [
  { icon: ImageIcon, label: 'Images' },
  { icon: FileText, label: 'Documents' },
  { icon: File, label: 'PDF Files' },
  { icon: Paperclip, label: 'Other Files' },
];

const CONCERN_LIMIT = 1000;

export default function LegalAdviceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();
  const [concern, setConcern] = useState(form.concern);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + t.backTop, paddingBottom: insets.bottom + t.buttonGap },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <StepIndicator5 active={1} />

        <View style={styles.intro}>
          <Text style={styles.introTitle} {...shrinkToFit(0.8)}>
            Tell Us About Your Legal Concern
          </Text>
          <Text style={styles.introBody}>
            Provide a brief description of your legal concern and relevant details so the advocate
            can understand the matter and prepare the appropriate advice before the consultation.
          </Text>
        </View>

        <Field
          icon={User}
          label="Full Name"
          required
          placeholder="Enter your full name"
          value={form.fullName}
          onChangeText={(v) => update({ fullName: v })}
        />
        <Field
          icon={Phone}
          label="Mobile Number"
          required
          placeholder="Enter your Mobile Number"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => update({ phone: v })}
        />
        <Field
          icon={Mail}
          label="Email Address"
          required
          placeholder="Enter your email address"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(v) => update({ email: v })}
        />

        {/* design/105 draws an envelope here — see the note above. */}
        <View style={styles.field}>
          <CalendarDays size={t.fieldIconGlyph} color={colors.brandDark} />
          <View style={styles.fieldText}>
            <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
              Preferred Consultation Time
            </Text>
            <Text style={styles.fieldHint} {...shrinkToFit(0.8)}>
              DD/MM/YYYY / Time
            </Text>
          </View>
          <Pressable onPress={() => previewNotice("Pick a date")} accessibilityRole="button" accessibilityLabel="Pick a date" hitSlop={8}>
            <CalendarDays size={t.fieldCalendar} color={colors.brandDark} />
          </Pressable>
        </View>

        <View style={styles.area}>
          <View style={styles.areaHead}>
            <ScrollText size={t.fieldIconGlyph} color={colors.brandDark} />
            <View style={styles.fieldText}>
              <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
                Brief Description issue
              </Text>
              <TextInput
                style={styles.areaInput}
                placeholder="Describe your legal concern"
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={CONCERN_LIMIT}
                value={concern}
                onChangeText={(v) => {
                  setConcern(v);
                  update({ concern: v });
                }}
              />
            </View>
          </View>
          <Text style={styles.counter}>
            {concern.length}/{CONCERN_LIMIT}
          </Text>
        </View>

        <View style={styles.upload}>
          <View style={styles.uploadHead}>
            <Paperclip size={t.fieldIconGlyph} color={colors.brandDark} />
            <View style={styles.fieldText}>
              <Text style={styles.uploadTitle} {...shrinkToFit(0.8)}>
                Upload Documents (Optional)
              </Text>
              <Text style={styles.uploadNote} {...shrinkToFit(0.75)}>
                Up to 25 pages — FREE Additional pages: ₹25 per page
              </Text>
              <Text style={styles.uploadDesc}>
                Add any documents that can help expert understand your case better
              </Text>
            </View>
          </View>

          <View style={styles.dash}>
            {UPLOAD_TILES.map((tile) => (
              <Pressable onPress={() => previewNotice(tile.label)}
                key={tile.label}
                accessibilityRole="button"
                style={styles.tile}
                // Inert: no picker, no upload, nothing stored.
              >
                <tile.icon size={t.tileGlyph} color={colors.textPrimary} />
                <Text style={styles.tileLabel} {...shrinkToFit(0.7)}>
                  {tile.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/matter')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type FieldProps = {
  icon: typeof User;
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'phone-pad' | 'email-address';
};

function Field({ icon: Icon, label, required, placeholder, value, onChangeText, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <Icon size={t.fieldIconGlyph} color={colors.brandDark} />
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
          {label}
          {required && <Text style={styles.star}>*</Text>}
        </Text>
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
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
  introTitle: { fontFamily: font.appHeading, fontSize: t.introTitleSize, color: colors.textPrimary },
  introBody: {
    marginTop: t.introBodyGap,
    fontFamily: font.appBody,
    fontSize: t.introBodySize,
    lineHeight: t.introBodyLineHeight,
    color: colors.textBody,
  },

  field: {
    marginTop: t.fieldGap,
    minHeight: t.fieldHeight,
    borderRadius: t.fieldRadius,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: { flex: 1, minWidth: 0, marginLeft: t.fieldIconGap },
  fieldLabel: { fontFamily: font.appHeading, fontSize: t.fieldLabelSize, color: colors.textPrimary },
  star: { fontSize: t.fieldStarSize, color: t.fieldStarColour },
  fieldHint: {
    marginTop: t.fieldHintGap,
    fontFamily: font.appBody,
    fontSize: t.fieldHintSize,
    color: colors.textMuted,
  },
  fieldInput: {
    marginTop: t.fieldHintGap,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldHintSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },

  area: {
    marginTop: t.fieldGap,
    minHeight: t.areaHeight,
    borderRadius: t.fieldRadius,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    paddingVertical: t.areaPadY,
  },
  areaHead: { flexDirection: 'row' },
  areaInput: {
    marginTop: t.fieldHintGap,
    padding: 0,
    minHeight: 30,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.fieldHintSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  counter: {
    marginTop: 4,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.counterSize,
    color: colors.textMuted,
  },

  upload: {
    marginTop: t.uploadGap,
    borderRadius: t.uploadRadius,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    padding: t.uploadPad,
  },
  uploadHead: { flexDirection: 'row' },
  uploadTitle: {
    fontFamily: font.appHeading,
    fontSize: t.uploadTitleSize,
    color: colors.textPrimary,
  },
  uploadNote: {
    marginTop: t.uploadNoteGap,
    fontFamily: font.appBody,
    fontSize: t.uploadNoteSize,
    color: colors.textBody,
  },
  uploadDesc: {
    marginTop: t.uploadDescGap,
    fontFamily: font.appBody,
    fontSize: t.uploadDescSize,
    color: colors.textBody,
  },
  dash: {
    marginTop: t.dashGap,
    borderRadius: t.dashRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.dashBorder,
    padding: t.dashPad,
    flexDirection: 'row',
    gap: t.tileColGap,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: t.tileHeight,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tileLabel: {
    marginTop: t.tileLabelGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.tileLabelSize,
    color: colors.textPrimary,
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
});
