import { router, type Href } from 'expo-router';
import { ArrowRight, CalendarDays, ChevronDown, CircleHelp, Info, LockKeyhole } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { HC_CASE_DETAILS } from '../../../data/highCourt';
import {
  advForensicRed,
  font,
  hcCaseDetails as t,
  hcPalette as c,
  ink,
  status,
} from '../../../constants/theme';

// High Court — case details (design/293). Measured at 2.000 px/pt.
//
// The three required fields are real local inputs: the "0 / 3" counter and the
// character count follow what is typed, and Continue — drawn muted — becomes
// the brown button once all three are filled. Nothing is saved or sent.
//
// STATIC: Important Date is a drawn field (no date picker is designed), the
// Court / Bench select and "I don't know the exact bench" open nothing.
//
// ⚠ CONFLICT 9 — "Madhya Pradesh High Court - Indore Bench" here; designs 302
// and 330 put the matter in the Delhi High Court.
//
// The required star is #BA1A1A, the project's existing advForensicRed.

function Field({
  label,
  required,
  tag,
  tagGreen,
  children,
}: {
  label: string;
  required?: boolean;
  tag?: string;
  tagGreen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.star}> *</Text> : null}
        </Text>
        {tag ? (
          <View style={styles.tag}>
            <Text style={[styles.tagText, tagGreen && styles.tagGreen]}>{tag}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function HighCourtCaseDetailsScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_CASE_DETAILS;
  const [title, setTitle] = useState('');
  const [party, setParty] = useState('');
  const [happened, setHappened] = useState('');
  const [other, setOther] = useState('');
  const done = [title, party, happened].filter((v) => v.trim().length > 0).length;
  const ready = done === 3;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        backHref={'/services/high-court/matter-type' as Href}
        right={<CircleHelp size={t.calIcon} color={c.ink} strokeWidth={1.8} style={styles.help} />}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.selected}
            </Text>
          </View>
          <Text style={styles.pct} {...shrinkToFit(0.8)}>
            {d.progress}
          </Text>
        </View>
        {/* Drawn at 50% — a fixed step position, not a live completion meter. */}
        <View style={styles.bar}>
          <View style={[styles.barFill, { flex: d.progressPct }]} />
          <View style={{ flex: 1 - d.progressPct }} />
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.body}>{d.body}</Text>

        <View style={styles.cards}>
          <Field label={d.caseTitle.label} required>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={d.caseTitle.placeholder}
              placeholderTextColor={c.inkMuted}
              style={styles.input}
            />
            <Text style={styles.hint}>{d.caseTitle.hint}</Text>
          </Field>

          <Field label={d.otherParty.label} required>
            <TextInput
              value={party}
              onChangeText={setParty}
              placeholder={d.otherParty.placeholder}
              placeholderTextColor={c.inkMuted}
              style={styles.input}
            />
            <Text style={styles.hint}>{d.otherParty.hint}</Text>
          </Field>

          <Field label={d.happened.label} required>
            <TextInput
              value={happened}
              onChangeText={setHappened}
              placeholder={d.happened.placeholder}
              placeholderTextColor={c.inkMuted}
              multiline
              style={[styles.input, styles.area]}
            />
            <View style={styles.hintRow}>
              <Text style={[styles.hint, styles.hintFlex]}>{d.happened.hint}</Text>
              <Text style={styles.count}>
                {happened.length} {d.charsSuffix}
              </Text>
            </View>
          </Field>

          <Field label={d.date.label} tag={d.optional}>
            {/* Drawn field — no date picker is designed. */}
            <View style={[styles.input, styles.inputRow]}>
              <Text style={styles.placeholder} {...shrinkToFit(0.8)}>
                {d.date.placeholder}
              </Text>
              <CalendarDays size={t.calIcon} color={c.brown} strokeWidth={1.8} />
            </View>
            <Text style={styles.hint}>{d.date.hint}</Text>
          </Field>

          <Field label={d.bench.label} tag={d.bench.tag} tagGreen>
            {/* Drawn select — no list of benches is designed. */}
            <View style={[styles.input, styles.inputRow, styles.select]}>
              <Text style={styles.value} {...shrinkToFit(0.75)}>
                {d.bench.value}
              </Text>
              <ChevronDown size={t.chevIcon} color={c.brown} strokeWidth={2} />
            </View>
            <View style={styles.chip}>
              <CircleHelp size={t.chipIcon} color={c.inkWarm} strokeWidth={1.8} />
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {d.dontKnow}
              </Text>
            </View>
            <View style={styles.info}>
              <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={2} />
              <Text style={[styles.hint, styles.hintFlex, styles.hintTight]}>{d.benchInfo}</Text>
            </View>
          </Field>

          <Field label={d.other.label} tag={d.optional}>
            <TextInput
              value={other}
              onChangeText={setOther}
              placeholder={d.other.placeholder}
              placeholderTextColor={c.inkMuted}
              multiline
              style={[styles.input, styles.area, styles.areaShort]}
            />
          </Field>
        </View>

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            <CircleHelp size={t.noteIconGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.noteCol}>
            <Text style={styles.noteTitle}>{d.noteTitle}</Text>
            <Text style={styles.noteBody}>{d.noteBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.barWrap, { paddingBottom: insets.bottom + t.footPadBottom }]}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, ready && styles.statusDotOn]} />
          <Text style={styles.statusText} {...shrinkToFit(0.8)}>
            {d.status}
          </Text>
          <Text style={styles.statusCount}>{done} / 3</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          onPress={() => router.push('/services/high-court/documents' as Href)}
          style={[styles.btn, ready && styles.btnOn]}
        >
          <Text style={[styles.btnText, ready && styles.btnTextOn]} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ready ? ink.onBrand : c.inkMuted} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  help: { marginRight: t.chipGap * 2 },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },

  topRow: { marginTop: t.topTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillDotGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },
  pct: { fontFamily: font.appSemi, fontSize: t.pctSize, color: c.inkWarm },
  bar: {
    marginTop: t.barTop,
    height: t.barH,
    borderRadius: t.barH / 2,
    backgroundColor: c.tileGrey,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: { backgroundColor: c.brown, borderRadius: t.barH / 2 },
  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: c.inkWarm,
  },

  cards: { marginTop: t.cardTop, gap: t.cardGap },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPad,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.labelGap },
  label: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.labelSize, color: c.ink },
  star: { color: advForensicRed.declineColour },
  tag: {
    height: t.tagH,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: c.panel,
    justifyContent: 'center',
  },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.tagMuted },
  tagGreen: { color: status.active },
  input: {
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.inputPadX,
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: c.ink,
  },
  area: { height: t.areaH, paddingTop: t.areaPadTop, textAlignVertical: 'top' },
  areaShort: { height: t.areaShortH },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  select: { paddingRight: t.selectPadRight },
  placeholder: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: c.inkMuted },
  value: { flexShrink: 1, marginRight: t.chipGap / 3, fontFamily: font.appBody, fontSize: t.inputSize, color: c.ink },
  hint: {
    marginTop: t.hintTop,
    fontFamily: font.appBody,
    fontSize: t.hintSize,
    lineHeight: t.hintLineHeight,
    color: c.inkWarm,
  },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hintFlex: { flex: 1 },
  hintTight: { marginTop: 0 },
  count: { marginTop: t.hintTop, marginLeft: t.chipGap, fontFamily: font.appSemi, fontSize: t.countSize, color: c.inkMuted },
  chip: {
    marginTop: t.chipTop,
    alignSelf: 'flex-start',
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipGap,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.ink },
  info: { marginTop: t.infoTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.infoGap },

  note: {
    marginTop: t.noteTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.notePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteIcon: {
    width: t.noteIcon,
    height: t.noteIcon,
    borderRadius: t.noteIcon / 2,
    marginRight: t.noteIconGap,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCol: { flex: 1 },
  noteTitle: { fontFamily: font.appSemi, fontSize: t.noteTitleSize, color: c.ink },
  noteBody: {
    marginTop: t.noteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: c.inkWarm,
  },

  barWrap: { backgroundColor: c.page, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: t.statusGap },
  statusDot: { width: t.statusDot, height: t.statusDot, borderRadius: t.statusDot / 2, backgroundColor: c.inkWarm },
  statusDotOn: { backgroundColor: status.active },
  statusText: { flex: 1, fontFamily: font.appSemi, fontSize: t.statusSize, color: c.inkWarm },
  statusCount: { fontFamily: font.appSemi, fontSize: t.statusSize, color: c.inkWarm },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnH / 2,
    backgroundColor: c.radioGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnOn: { backgroundColor: c.brown },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.inkMuted },
  btnTextOn: { color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, color: c.inkWarm },
});
