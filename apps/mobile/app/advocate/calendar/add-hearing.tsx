import { ChevronDown, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdvToolHeader from '../../../components/AdvToolHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_ADD_HEARING } from '../../../data/advocateTools';
import { advAddHearing as t, font, ink } from '../../../constants/theme';

// Advocate — add a court hearing (design/272).
//
// Built exactly as drawn, including:
// ⚠ Note 15 — the optional Notes field is pre-filled with "Petitioner
//   Advocate", the same value as the Advocate Role dropdown directly above it.
// ⚠ The Save button sits on a 20pt gutter where every field above it sits on
//   28pt. Drawn that way; see constants/tokens/advTools.ts.
// ⚠ The three reminder chips are drawn 99.5, 111.0 and 102.5pt wide — neither
//   equal nor sized to their text. Laid out as equal thirds so the row holds
//   at 360pt; at 390pt that is at most 6pt from the export.
//
// STATIC, NOT WIRED: the fields are display text, not inputs — nothing here is
// typed into, submitted or persisted. The two dropdowns open no picker, the
// date field opens no calendar, the reminder chips do not check, "+ Custom"
// opens nothing, and "Save Hearing" goes back. No backend is in scope.
export default function AdvocateAddHearingScreen() {
  const d = AT_ADD_HEARING;

  return (
    <View style={styles.screen}>
      <AdvToolHeader title={d.title} icons={false} colour={t.titleInk} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {d.fields.map((f, i) => (
          <View key={f.label} style={[styles.group, i === 0 && styles.firstGroup]}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {f.label}
            </Text>
            <View
              style={[
                styles.field,
                f.short && styles.fieldShort,
                f.tall && styles.fieldTall,
                f.select && styles.fieldSelect,
              ]}
            >
              <Text style={styles.value} {...shrinkToFit(0.8)}>
                {f.value}
              </Text>
              {f.select ? (
                <ChevronDown size={t.chevron} color={t.chevronInk} strokeWidth={2.5} />
              ) : null}
            </View>
          </View>
        ))}

        <Text style={styles.remind}>
          {d.remindLabel}
          <Text style={styles.remindHint}>{d.remindHint}</Text>
        </Text>

        <View style={styles.chips}>
          {d.reminders.map((r, i) => (
            <View
              key={r.label}
              style={[styles.chip, { flexGrow: t.chipWeights[i] }, i > 0 && styles.chipGap]}
            >
              {r.custom ? (
                <Plus size={t.customGlyph} color={t.chipBorder} strokeWidth={2.4} />
              ) : (
                <View style={styles.box} />
              )}
              <Text style={styles.chipText} {...shrinkToFit(0.7)}>
                {r.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.save, pressed && styles.pressed]}
          onPress={() => history.back()}
        >
          <Text style={styles.saveText} {...shrinkToFit(0.8)}>
            {d.save}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.contentBottom },

  group: { marginTop: t.groupGap, marginHorizontal: t.padX },
  firstGroup: { marginTop: t.contentTop },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLine,
    color: t.ink,
  },
  field: {
    marginTop: t.labelGap,
    height: t.fieldH,
    borderRadius: t.fieldRadius,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    backgroundColor: t.fieldBg,
    paddingHorizontal: t.fieldPadX,
    justifyContent: 'center',
  },
  fieldShort: { width: t.dateW },
  fieldTall: { height: t.notesH, justifyContent: 'flex-start', paddingTop: t.notesPadY },
  fieldSelect: { flexDirection: 'row', alignItems: 'center' },
  value: { flex: 1, fontFamily: font.appBody, fontSize: t.fieldSize, color: t.ink },

  remind: {
    marginTop: t.remindTop,
    marginHorizontal: t.padX,
    fontFamily: font.appHeading,
    fontSize: t.remindSize,
    color: t.ink,
  },
  remindHint: { fontFamily: font.appBody },

  chips: { marginTop: t.chipsTop, marginHorizontal: t.padX, flexDirection: 'row' },
  chip: {
    flexBasis: 0,
    flexShrink: 1,
    height: t.chipH,
    borderRadius: t.chipRadius,
    borderWidth: 1,
    borderColor: t.chipBorder,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipGap: { marginLeft: t.chipGap },
  box: {
    width: t.boxSize,
    height: t.boxSize,
    borderRadius: t.boxRadius,
    borderWidth: 1,
    borderColor: t.chipBorder,
  },
  chipText: {
    marginLeft: t.boxGap,
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: t.ink,
  },

  save: {
    marginTop: t.saveTop,
    marginHorizontal: t.savePadX,
    height: t.saveH,
    borderRadius: t.saveRadius,
    backgroundColor: t.saveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  saveText: { fontFamily: font.appSemi, fontSize: t.saveSize, color: ink.onBrand },
});
