import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  Contact,
  Info,
  MapPin,
  Save,
  ShieldCheck,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AV_BAR_COUNCIL } from '../../../data/advocateVerify';
import {
  advVerifyBarCouncil as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — step 3, bar council details (design/236).
//
// ⚠ TWO THINGS THIS EXPORT DRAWS THAT ARE NOT BUILT, AND WHY.
//
// design/236 is the only export in this batch that is 844px wide: a 780px
// (390pt) screen pasted inside a device frame. Above and below that screen it
// also draws chrome belonging to somewhere else entirely —
//
//   · a top app header reading "Requests", with a hamburger, a bell and an
//     avatar. This is a pushed wizard screen; it has no app header, and
//     "Requests" is a different screen's title.
//   · a FIVE-tab bottom bar: Dashboard, Requests, Schedule, Messages, Profile.
//     The advocate tab bar in this project has FOUR tabs — Dashboard, Matters,
//     Clients, Earnings — and Schedule, Messages and Profile do not exist
//     anywhere in the app. A pushed screen does not draw a tab bar at all.
//
// Reproducing either would mean inventing navigation the app does not have and
// putting a second, contradictory tab bar inside a pushed screen. Both are left
// out and reported instead. If the client wants them, they are a navigation
// decision, not a drawing one.
//
// ⚠ The header here is a THIRD arrangement in three screens: back circle and
// step pill on one row, then a LEFT-aligned eyebrow, then the title, then the
// progress bar. Built inline rather than bent into VerifyStepChrome.
//
// ⚠ The field treatment is a third one too — 47.5pt tall, white, soft shadow
// and no border, against design/234's 44/#FCFBF9/border and design/235's
// 43/#FFFFFF/border.
//
// STATIC, NOT WIRED: no inputs, no pickers, no state. The "Why we ask for Bar
// Council details" row does not expand — the export draws it closed and draws
// no open state anywhere.

function Field({
  label,
  mandatory,
  hint,
  children,
  gap,
}: {
  label: string;
  mandatory?: string;
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
        {mandatory ? (
          <Text style={styles.mandatory} {...shrinkToFit(0.8)}>
            {mandatory}
          </Text>
        ) : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={[styles.input, hint ? styles.inputTight : null]}>{children}</View>
    </View>
  );
}

function AdvocateVerifyBarCouncilScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_BAR_COUNCIL;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
          >
            <ArrowLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.2} />
          </Pressable>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>{d.eyebrow}</Text>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>

        <View style={styles.progress}>
          {Array.from({ length: 6 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                i > 0 && { marginLeft: s.progressGap },
                i < d.filled && styles.segmentOn,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.note}>
          <View style={styles.noteTile}>
            <ShieldCheck
                size={t.noteTileGlyph}
                color={ink.onBrand}
                fill={t.noteTileColour}
                strokeWidth={2}
              />
          </View>
          <View style={styles.noteCol}>
            <Text style={styles.noteTitle} {...shrinkToFit(0.8)}>
              {d.note.title}
            </Text>
            <Text style={styles.noteBody}>{d.note.body}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.section}>{d.section}</Text>

          <Field label={d.council.label} mandatory={d.council.mandatory} gap={t.labelTop}>
            <Text style={styles.inputText} {...shrinkToFit(0.8)}>
              {d.council.value}
            </Text>
            <ChevronDown size={20} color="#4A4A4A" strokeWidth={2} />
          </Field>

          <Field label={d.enrollment.label} hint={d.enrollment.hint} gap={t.fieldTop}>
            <Text style={styles.inputText}>{d.enrollment.value}</Text>
            <Contact size={20} color="#4D463D" strokeWidth={1.8} />
          </Field>

          <Field label={d.enrolledOn.label} gap={t.fieldTop}>
            <Text style={styles.inputText}>{d.enrolledOn.value}</Text>
            <Calendar size={20} color="#4D463D" strokeWidth={1.8} />
          </Field>

          <Field label={d.status.label} gap={t.fieldTop}>
            <View style={styles.dot} />
            <Text style={[styles.inputText, styles.inputTextDot]} {...shrinkToFit(0.75)}>
              {d.status.value}
            </Text>
          </Field>

          <Field label={d.place.label} gap={t.fieldTop}>
            <Text style={styles.inputText}>{d.place.value}</Text>
            <MapPin size={20} color="#4D463D" strokeWidth={1.8} />
          </Field>

          <View style={styles.accordion}>
            <Info size={18} color={ink.accent} strokeWidth={1.8} />
            <Text style={styles.accordionText} {...shrinkToFit(0.8)}>
              {d.why}
            </Text>
            <ChevronDown size={20} color="#4A4A4A" strokeWidth={2} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/practice' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.75)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.saveRow}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Save size={t.saveGlyph} color={colors.textBody} strokeWidth={1.8} />
          <Text style={styles.saveText}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: { paddingHorizontal: s.padX },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    width: t.pillW,
    height: t.pillH,
    borderRadius: t.pillRadius,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    backgroundColor: colors.brand,
    marginRight: t.pillDotGap,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: '#6E5B43' },

  eyebrow: {
    marginTop: t.eyebrowTop,
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },

  progress: { marginTop: t.progressTop, flexDirection: 'row' },
  segment: {
    flex: 1,
    height: t.progressHeight,
    borderRadius: t.progressHeight / 2,
    backgroundColor: s.progressOff,
  },
  segmentOn: { backgroundColor: colors.brand },

  content: { paddingBottom: 24 },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: s.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    paddingHorizontal: t.notePadX,
    paddingTop: t.notePadTop,
    paddingBottom: t.notePadBottom,
  },
  noteCol: { flex: 1 },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTileRadius,
    backgroundColor: t.noteTileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteTileGap,
  },
  noteTitle: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.noteTitleSize,
    lineHeight: t.noteTitleLine,
    color: '#1B1C1C',
  },
  noteBody: {
    marginTop: t.noteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLine,
    color: '#4D463D',
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
  label: { fontFamily: font.appSemi, fontSize: t.labelSize, color: '#1B1C1C' },
  star: { marginLeft: 3, fontFamily: font.appBody, fontSize: t.labelSize, color: '#D7524B' },
  mandatory: {
    flex: 1,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.mandatorySize,
    color: colors.textBody,
  },
  hint: {
    marginTop: t.hintTop,
    fontFamily: font.appBody,
    fontSize: t.hintSize,
    color: colors.textBody,
  },

  input: {
    marginTop: t.inputTop,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputTight: { marginTop: t.inputTopTight },
  inputText: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: '#1B1C1C' },
  inputTextDot: { marginLeft: t.dotGap },
  dot: { width: t.dot, height: t.dot, borderRadius: t.dot / 2, backgroundColor: status.active },

  accordion: {
    marginTop: t.accordionTop,
    height: t.accordionH,
    borderRadius: t.inputRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: 15,
    color: '#1B1C1C',
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: s.padX,
    backgroundColor: s.bg,
  },
  cta: {
    height: s.ctaHeight,
    borderRadius: s.ctaRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
    marginRight: s.ctaArrowGap,
  },
  saveRow: {
    marginTop: t.saveTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    marginLeft: 6,
    fontFamily: font.appBody,
    fontSize: t.saveSize,
    color: colors.textBody,
  },
});
import VerifyFlow from '../../../features/advocate-verification/VerifyFlow';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveVerifyScreen() { return DATA_SOURCE === 'api' ? <VerifyFlow/> : <AdvocateVerifyBarCouncilScreen/>; }
