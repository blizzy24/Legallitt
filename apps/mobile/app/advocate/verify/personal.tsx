import { router, type Href } from 'expo-router';
import { AlertCircle, Calendar, Camera, Check, ChevronDown, Plus } from 'lucide-react-native';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VerifyPersonalArt from '../../../components/VerifyPersonalArt';
import VerifyStepChrome from '../../../components/VerifyStepChrome';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_PERSONAL } from '../../../data/advocateVerify';
import {
  advVerifyPersonal as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — step 1, personal details (design/234).
//
// STATIC, NOT WIRED. Every field renders its drawn value as text; there is no
// text input, no date picker, no validation and no state. "Add Photo" opens
// nothing — there is still no image picker, camera or upload anywhere in this
// project, and none was asked for.
//
// ⚠ The mobile and email both carry a "Verified" pill on a form that has not
// been submitted. Drawn as drawn; nothing verifies anything.
//
// ⚠ Note 4: design/239 reviews this form and shows a different email address
// and a different residential address. Both are stored on the screen that draws
// them; neither is reconciled.

function Field({
  label,
  helper,
  children,
  gap,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
  gap: number;
}) {
  return (
    <View style={{ marginTop: gap }}>
      <View style={styles.labelRow}>
        <Text style={styles.label} {...shrinkToFit(0.8)}>
          {label}
        </Text>
        <Text style={styles.star}>*</Text>
      </View>
      {children}
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

function VerifiedPill({ label }: { label: string }) {
  return (
    <View style={styles.vpill}>
      <Check size={t.vpillGlyph} color={status.active} strokeWidth={3} />
      <Text style={styles.vpillText} {...shrinkToFit(0.8)}>
        {label}
      </Text>
    </View>
  );
}

export default function AdvocateVerifyPersonalScreen() {
  const d = AV_PERSONAL;

  return (
    <VerifyStepChrome
      title={d.title}
      eyebrow={d.eyebrow}
      step={d.step}
      filled={d.filled}
      cta={d.cta}
      onContinue={() => router.push('/advocate/verify/professional' as Href)}
    >
      <View style={styles.illus}>
        <VerifyPersonalArt width={390 - s.padX * 2} height={t.illusHeight} />
      </View>

      <View style={styles.note}>
        <AlertCircle size={t.noteIcon} color={ink.accent} />
        <Text style={styles.noteText}>{d.note}</Text>
      </View>

      <View style={styles.photo}>
        <View style={styles.ringWrap}>
          <View style={styles.ring}>
            <Camera size={t.ringGlyph} color={ink.accent} strokeWidth={1.6} />
          </View>
          <View style={styles.plusBadge}>
            <Plus size={t.plusGlyph} color={ink.onBrand} strokeWidth={3} />
          </View>
        </View>
        <View style={styles.photoText}>
          <Text style={styles.photoTitle} {...shrinkToFit(0.8)}>
            {d.photo.title}
          </Text>
          <Text style={styles.photoSub}>{d.photo.sub}</Text>
        </View>
        <View style={styles.add}>
          <Text style={styles.addText} {...shrinkToFit(0.75)}>
            {d.photo.action}
          </Text>
        </View>
      </View>

      <View style={styles.fields}>
        <Field label={d.fullName.label} helper={d.fullName.helper} gap={0}>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.fullName.value}</Text>
            <Check size={t.tickGlyph} color={status.active} strokeWidth={2.6} />
          </View>
        </Field>

        <Field label={d.dob.label} gap={t.fieldGapAfterHelper}>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.dob.value}</Text>
            <Calendar size={t.fieldIcon} color="#4A4A4A" strokeWidth={1.8} />
          </View>
        </Field>

        <Field label={d.mobile.label} gap={t.fieldGap}>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.mobile.value}</Text>
            <VerifiedPill label={d.mobile.verified} />
          </View>
        </Field>

        <Field label={d.email.label} gap={t.fieldGap}>
          <View style={styles.input}>
            <Text style={styles.inputText} {...shrinkToFit(0.8)}>
              {d.email.value}
            </Text>
            <VerifiedPill label={d.email.verified} />
          </View>
        </Field>

        <Field label={d.address.label} gap={t.fieldGap}>
          <View style={styles.area}>
            <Text style={styles.inputText}>{d.address.value}</Text>
          </View>
        </Field>

        <View style={styles.cols}>
          <View style={styles.col}>
            <Field label={d.city.label} gap={t.fieldGapAfterArea}>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText}>{d.city.value}</Text>
              </View>
            </Field>
          </View>
          <View style={[styles.col, { marginLeft: t.colGap }]}>
            <Field label={d.state.label} gap={t.fieldGapAfterArea}>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText} {...shrinkToFit(0.8)}>
                  {d.state.value}
                </Text>
                <ChevronDown size={t.fieldIcon - 2} color="#4A4A4A" strokeWidth={2} />
              </View>
            </Field>
          </View>
        </View>
      </View>
    </VerifyStepChrome>
  );
}

const styles = StyleSheet.create({
  illus: { marginTop: t.illusTop, marginHorizontal: s.padX, height: t.illusHeight },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: s.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    borderWidth: 1,
    borderColor: t.noteBorder,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },

  photo: {
    marginTop: t.photoTop,
    marginHorizontal: s.padX,
    height: t.photoHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.photoRadius,
    borderWidth: 1,
    borderColor: t.noteBorder,
    paddingHorizontal: t.photoPadX,
  },
  ringWrap: { width: t.ring, height: t.ring },
  ring: {
    width: t.ring,
    height: t.ring,
    borderRadius: t.ring / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: t.ringBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    right: -t.plusBadge / 2 + 7,
    bottom: 0,
    width: t.plusBadge,
    height: t.plusBadge,
    borderRadius: t.plusBadge / 2,
    backgroundColor: ink.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { flex: 1, marginLeft: t.photoTextGap },
  photoTitle: {
    fontFamily: font.appSemi,
    fontSize: t.photoTitleSize,
    color: '#222222',
  },
  photoSub: {
    marginTop: t.photoSubTop,
    fontFamily: font.appBody,
    fontSize: t.photoSubSize,
    color: colors.textBody,
  },
  add: {
    width: t.addW,
    height: t.addH,
    borderRadius: t.addRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: t.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontFamily: font.appSemi, fontSize: t.addSize, color: ink.accent },

  fields: { marginTop: t.fieldTop, marginHorizontal: s.padX },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: font.appSemi, fontSize: t.labelSize, color: '#222222' },
  star: {
    marginLeft: t.starGap,
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    color: '#D7524B',
  },
  input: {
    marginTop: t.labelGap,
    height: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: t.inputBorder,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: '#222222',
  },
  area: {
    marginTop: t.labelGap,
    height: t.areaH,
    borderRadius: t.inputRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: t.inputBorder,
    paddingHorizontal: t.inputPadX,
    paddingTop: t.areaPadTop,
  },
  helper: {
    marginTop: t.helperTop,
    fontFamily: font.appBody,
    fontSize: t.helperSize,
    color: colors.textBody,
  },

  vpill: {
    height: t.vpillH,
    borderRadius: t.vpillRadius,
    paddingHorizontal: t.vpillPadX,
    backgroundColor: status.activeBg,
    borderWidth: 1,
    borderColor: status.activeBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vpillText: {
    marginLeft: 3,
    fontFamily: font.appSemi,
    fontSize: t.vpillSize,
    color: status.active,
  },

  colInput: { paddingHorizontal: t.colPadX },
  cols: { flexDirection: 'row' },
  col: { flex: 1 },
});
