import { router, type Href } from 'expo-router';
import { AlertCircle, Calendar, Check, ChevronDown, ChevronsDown, MapPin } from 'lucide-react-native';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import VerifySelectChip, { type ChipState } from '../../../components/VerifySelectChip';
import VerifyStepChrome from '../../../components/VerifyStepChrome';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_PROFESSIONAL } from '../../../data/advocateVerify';
import {
  advVerifyPersonal as f,
  advVerifyProfessional as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — step 2, professional details (design/235).
//
// ⚠ "Step 2 of 4", two of four segments filled, and it is the second of SIX
// form screens. Drawn as drawn. Note 1 in data/advocateVerify.ts.
//
// ⚠ design/235's header is NOT design/234's, on the same wizard, one screen
// apart: the eyebrow sits 5.5pt higher, the progress bar 7pt higher, and the
// rule under the header is gone entirely. Both built as measured. The input
// fills differ too — #FFFFFF here, #FCFBF9 on design/234.
//
// STATIC, NOT WIRED. No inputs, no dropdowns, no state. The chips do not
// toggle: each export draws one fixed selection and that is what renders. The
// character counter is a drawn label, not a computation.

function Field({
  label,
  helper,
  hint,
  children,
  gap,
}: {
  label: string;
  helper?: string;
  hint?: string;
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
        {hint ? (
          <Text style={styles.hint} {...shrinkToFit(0.8)}>
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

function Chips({ chips }: { chips: readonly { label: string; state: string }[] }) {
  return (
    <View style={styles.chips}>
      {chips.map((c) => (
        <VerifySelectChip key={c.label} label={c.label} state={c.state as ChipState} />
      ))}
    </View>
  );
}

export default function AdvocateVerifyProfessionalScreen() {
  const d = AV_PROFESSIONAL;

  return (
    <VerifyStepChrome
      title={d.title}
      eyebrow={d.eyebrow}
      step={d.step}
      filled={d.filled}
      showRule={false}
      headerTop={t.headerTop}
      eyebrowTop={t.eyebrowTop}
      progressTop={t.progressTop}
      cta={d.cta}
      onContinue={() => router.push('/advocate/verify/bar-council' as Href)}
      secondary={d.secondary}
      onSecondary={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
    >
      <View style={styles.note}>
        <AlertCircle size={f.noteIcon} color={ink.accent} />
        <Text style={styles.noteText}>{d.note}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.section}>{d.credentials}</Text>

        <Field label={d.name.label} helper={d.name.helper} gap={t.labelTop}>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.name.value}</Text>
            <Check size={f.tickGlyph} color={status.active} strokeWidth={2.6} />
          </View>
        </Field>

        <View style={styles.cols}>
          <View style={styles.col}>
            <Field label={d.qualification.label} gap={t.labelTopAfterHelper}>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText} {...shrinkToFit(0.8)}>
                  {d.qualification.value}
                </Text>
                <ChevronDown size={f.fieldIcon - 2} color="#4A4A4A" strokeWidth={2} />
              </View>
            </Field>
          </View>
          <View style={[styles.col, { marginLeft: f.colGap }]}>
            <Field label={d.year.label} gap={t.labelTopAfterHelper}>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText}>{d.year.value}</Text>
                <Calendar size={f.fieldIcon - 2} color="#4A4A4A" strokeWidth={1.8} />
              </View>
            </Field>
          </View>
        </View>

        <Field label={d.practiceYears.label} gap={t.afterInput}>
          <View style={styles.input}>
            <Text style={styles.inputText}>{d.practiceYears.value}</Text>
            <ChevronsDown size={f.fieldIcon} color={ink.accent} strokeWidth={2} />
          </View>
        </Field>

        <Text style={[styles.section, { marginTop: t.sectionAfter }]}>{d.jurisdiction}</Text>

        <Field label={d.areas.label} hint={d.areas.hint} gap={t.labelTop}>
          <Chips chips={d.areas.chips} />
        </Field>

        <Field label={d.courts.label} gap={t.afterChips}>
          <Chips chips={d.courts.chips} />
        </Field>

        <Field label={d.languages.label} gap={t.afterChips}>
          <Chips chips={d.languages.chips} />
        </Field>

        <View style={styles.cols}>
          <View style={styles.col}>
            <Field label={d.city.label} gap={t.afterChips}>
              <View style={[styles.input, styles.colInput]}>
                <MapPin size={f.fieldIcon - 4} color={ink.accent} strokeWidth={1.8} />
                <Text style={[styles.inputText, styles.inputTextIcon]}>{d.city.value}</Text>
              </View>
            </Field>
          </View>
          <View style={[styles.col, { marginLeft: f.colGap }]}>
            <Field label={d.state.label} gap={t.afterChips}>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText} {...shrinkToFit(0.8)}>
                  {d.state.value}
                </Text>
                <ChevronDown size={f.fieldIcon - 2} color="#4A4A4A" strokeWidth={2} />
              </View>
            </Field>
          </View>
        </View>

        <Text style={[styles.section, { marginTop: t.sectionAfter }]}>{d.chamber}</Text>

        <Text style={[styles.label, { marginTop: t.labelTop }]}>{d.about.label}</Text>
        <View style={styles.area}>
          <Text style={styles.areaText}>{d.about.value}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{d.about.helper}</Text>
          <Text style={styles.metaText}>{d.about.counter}</Text>
        </View>
      </View>
    </VerifyStepChrome>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: t.noteTop,
    marginHorizontal: s.padX,
    flexDirection: 'row',
    backgroundColor: f.noteBg,
    borderRadius: f.noteRadius,
    borderWidth: 1,
    borderColor: f.noteBorder,
    paddingHorizontal: f.notePadX,
    paddingVertical: f.notePadY,
  },
  noteText: {
    flex: 1,
    marginLeft: f.noteIconGap,
    fontFamily: font.appBody,
    fontSize: f.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },

  body: { marginHorizontal: s.padX },
  section: {
    marginTop: t.sectionTop,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: ink.accent,
  },

  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontFamily: font.appSemi, fontSize: f.labelSize, color: '#222222' },
  star: {
    marginLeft: f.starGap,
    fontFamily: font.appBody,
    fontSize: f.labelSize,
    color: '#D7524B',
  },
  hint: {
    flex: 1,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.hintSize,
    color: colors.textBody,
  },
  input: {
    marginTop: f.labelGap,
    height: t.inputH,
    borderRadius: f.inputRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: f.inputBorder,
    paddingHorizontal: f.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colInput: { paddingHorizontal: f.colPadX },
  inputText: { flex: 1, fontFamily: font.appBody, fontSize: f.inputSize, color: '#222222' },
  inputTextIcon: { marginLeft: 6 },
  helper: {
    marginTop: f.helperTop,
    fontFamily: font.appBody,
    fontSize: f.helperSize,
    color: colors.textBody,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: t.chipsTop - 6 },

  cols: { flexDirection: 'row' },
  col: { flex: 1 },

  area: {
    marginTop: t.areaTop,
    minHeight: t.areaH,
    borderRadius: f.inputRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: f.inputBorder,
    paddingHorizontal: t.areaPadX,
    paddingVertical: t.areaPadY,
  },
  areaText: {
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLine,
    color: '#222222',
  },
  meta: { marginTop: t.metaTop, flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontFamily: font.appBody, fontSize: t.metaSize, color: colors.textBody },
});
