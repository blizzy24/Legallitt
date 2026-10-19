import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Info,
  Landmark,
  MapPin,
  Plus,
  Video,
} from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AV_PRACTICE } from '../../../data/advocateVerify';
import {
  advVerifyChip as c,
  advVerifyPractice as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — step 4, practice details (design/237).
//
// ⚠ FOURTH HEADER, FOURTH FIELD TREATMENT, FOURTH CHIP STYLE, in four
// consecutive screens of one wizard. Here the eyebrow sits ABOVE the title, the
// back control is a chevron, the step pill is filled rather than outlined, all
// four progress segments are filled, and the body is three white section cards
// on a 16pt grid while the progress bar above them stays on the 20pt grid. All
// of it measured and built as drawn; none of it harmonised.
//
// ⚠ "Step 4 of 4" with every segment filled — and design/239, the review
// screen, still follows. Note 1 in data/advocateVerify.ts.
//
// ⚠ The chamber address is CLIPPED IN THE EXPORT, mid-word. The full string is
// stored and rendered whole. Never ellipsized.
//
// STATIC, NOT WIRED: no inputs, no pickers, no state. The chips do not toggle
// and the consultation modes are not switches.

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionRow}>
        <View style={styles.bullet} />
        <Text style={styles.section} {...shrinkToFit(0.8)}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Label({ children, gap }: { children: string; gap: number }) {
  return <Text style={[styles.label, { marginTop: gap }]}>{children}</Text>;
}

function Chip({ label, state, spec }: { label: string; state: string; spec?: boolean }) {
  const on = state === 'on';
  return (
    <View
      style={[
        styles.chip,
        spec && styles.chipSpec,
        on ? styles.chipOn : styles.chipDashed,
        on && spec && styles.chipSpecOn,
      ]}
    >
      {on ? (
        spec ? (
          <View style={styles.chipDot} />
        ) : (
          <Check size={c.glyph} color={status.active} strokeWidth={2.6} />
        )
      ) : (
        <Plus size={c.glyph} color={ink.accent} strokeWidth={2} />
      )}
      <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
        {label}
      </Text>
    </View>
  );
}

export default function AdvocateVerifyPracticeScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_PRACTICE;

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
            <ChevronLeft size={t.backIcon} color="#222222" strokeWidth={2.4} />
          </Pressable>

          <View style={styles.titleCol}>
            <Text style={styles.eyebrow}>{d.eyebrow}</Text>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.title}
            </Text>
          </View>

          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
        </View>

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
          <Info size={t.noteIcon} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.noteText}>
            <Text style={styles.noteLead}>{d.note.lead}</Text>
            {d.note.body}
          </Text>
        </View>

        <SectionCard title={d.jurisdiction.section}>
          <View style={styles.cols}>
            <View style={styles.col}>
              <Label gap={t.labelTop}>{d.jurisdiction.city.label}</Label>
              <View style={[styles.input, styles.colInput]}>
                <MapPin size={16} color={ink.accent} strokeWidth={1.8} />
                <Text style={[styles.inputText, styles.inputTextIcon]}>
                  {d.jurisdiction.city.value}
                </Text>
              </View>
            </View>
            <View style={[styles.col, { marginLeft: t.colGap }]}>
              <Label gap={t.labelTop}>{d.jurisdiction.council.label}</Label>
              <View style={[styles.input, styles.colInput]}>
                <Text style={styles.inputText} {...shrinkToFit(0.8)}>
                  {d.jurisdiction.council.value}
                </Text>
                <ChevronDown size={16} color="#4A4A4A" strokeWidth={2} />
              </View>
            </View>
          </View>

          <Label gap={t.labelTop}>{d.jurisdiction.courtsLabel}</Label>
          <View style={styles.chips}>
            {d.jurisdiction.courts.map((x) => (
              <Chip key={x.label} label={x.label} state={x.state} />
            ))}
          </View>

          <Label gap={t.labelTop}>{d.jurisdiction.specializationsLabel}</Label>
          <View style={styles.chips}>
            {d.jurisdiction.specializations.map((x) => (
              <Chip key={x.label} label={x.label} state={x.state} spec />
            ))}
          </View>
        </SectionCard>

        <SectionCard title={d.office.section}>
          <Label gap={t.labelTop}>{d.office.firm.label}</Label>
          <View style={styles.input}>
            <Building2 size={16} color={ink.accent} strokeWidth={1.8} />
            <Text style={[styles.inputText, styles.inputTextIcon]} {...shrinkToFit(0.8)}>
              {d.office.firm.value}
            </Text>
          </View>

          <Label gap={t.labelTop}>{d.office.address.label}</Label>
          <View style={styles.input}>
            <Text style={styles.inputText} {...shrinkToFit(0.7)}>
              {d.office.address.value}
            </Text>
          </View>

          <Label gap={t.labelTop}>{d.office.modesLabel}</Label>
          <View style={styles.modes}>
            {d.office.modes.map((m, i) => (
              <View key={m.name} style={[styles.mode, i > 0 && { marginLeft: t.modeGap }]}>
                <View style={styles.modeHead}>
                  <View style={styles.modeTile}>
                    {i === 0 ? (
                      <Video size={t.modeTileGlyph} color={ink.accent} strokeWidth={1.8} />
                    ) : (
                      <Landmark size={t.modeTileGlyph} color={ink.accent} strokeWidth={1.8} />
                    )}
                  </View>
                  <View
                    style={[styles.modePill, m.tone === 'green' ? styles.modePillGreen : styles.modePillBrand]}
                  >
                    <Text
                      style={[
                        styles.modePillText,
                        m.tone === 'green' ? styles.modePillTextGreen : styles.modePillTextBrand,
                      ]}
                      {...shrinkToFit(0.75)}
                    >
                      {m.pill}
                    </Text>
                  </View>
                </View>
                <View style={styles.modeFoot}>
                  <Text style={styles.modeName} {...shrinkToFit(0.8)}>
                    {m.name}
                  </Text>
                  <CheckCircle2 size={t.modeCheck} color={ink.onBrand} fill={status.active} />
                </View>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard title={d.experience.section}>
          <Text style={styles.areaLabel}>{d.experience.label}</Text>
          <View style={styles.area}>
            <Text style={styles.areaText}>{d.experience.value}</Text>
            <View style={styles.areaRule} />
            <View style={styles.areaMeta}>
              <CheckCircle2 size={t.areaMetaGlyph} color={ink.onBrand} fill={status.active} />
              <Text style={styles.areaMetaText} {...shrinkToFit(0.8)}>
                {d.experience.check}
              </Text>
              <Text style={styles.areaCounter}>{d.experience.counter}</Text>
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/documents' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Text style={styles.secondary}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: {
    paddingHorizontal: s.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: s.rule,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#222222',
  },
  pill: {
    width: t.pillW,
    height: t.pillH,
    borderRadius: t.pillRadius,
    backgroundColor: t.pillBg,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: ink.accent },

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
    marginHorizontal: t.cardX,
    height: t.noteH,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.noteBg,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX - 3,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteIconGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: colors.textBody,
  },
  noteLead: { fontFamily: font.appSemi, color: '#222222' },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.cardX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  bullet: {
    width: t.bullet,
    height: t.bulletH,
    borderRadius: t.bullet / 2,
    backgroundColor: ink.accent,
    marginRight: t.bulletGap,
  },
  section: {
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: ink.accent,
  },

  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelTrack,
    color: colors.textBody,
  },
  input: {
    marginTop: t.inputTop,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: t.inputBg,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: '#222222' },
  inputTextIcon: { marginLeft: t.inputGlyphGap },
  colInput: { paddingHorizontal: t.colPadX },
  cols: { flexDirection: 'row' },
  col: { flex: 1 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: t.chipsTop - c.gapY },
  chip: {
    height: c.height,
    borderRadius: c.radius,
    paddingHorizontal: c.padX,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: c.gapX,
    marginTop: c.gapY,
  },
  chipSpec: { height: t.specChipH },
  chipOn: { backgroundColor: c.onBg, borderWidth: 1, borderColor: colors.brand },
  chipSpecOn: { backgroundColor: colors.card },
  chipDashed: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.offBorder,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: status.active,
  },
  chipText: {
    marginLeft: c.glyphGap,
    fontFamily: font.appBody,
    fontSize: c.size,
    color: colors.textBody,
  },
  chipTextOn: { fontFamily: font.appSemi, color: '#222222' },

  modes: { marginTop: t.modeTop, flexDirection: 'row' },
  mode: {
    flex: 1,
    height: t.modeH,
    borderRadius: t.modeRadius,
    backgroundColor: t.modeBg,
    borderWidth: 1,
    borderColor: colors.brand,
    padding: t.modePad,
    justifyContent: 'space-between',
  },
  modeHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeTile: {
    width: t.modeTile,
    height: t.modeTile,
    borderRadius: t.modeTileRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePill: {
    height: t.modePillH,
    borderRadius: t.modePillRadius,
    paddingHorizontal: t.modePillPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillGreen: { backgroundColor: '#D7F3E4' },
  modePillBrand: { backgroundColor: '#F1EDE7' },
  modePillText: { fontFamily: font.appSemi, fontSize: t.modePillSize },
  modePillTextGreen: { color: status.active },
  modePillTextBrand: { color: ink.accent },
  modeFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modeName: { fontFamily: font.appSemi, fontSize: t.modeNameSize, color: '#222222' },

  areaLabel: {
    marginTop: t.labelTop,
    fontFamily: font.appBody,
    fontSize: 14,
    color: colors.textBody,
  },
  area: {
    marginTop: t.areaTop,
    borderRadius: t.inputRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    paddingHorizontal: t.areaPadX,
    paddingVertical: t.areaPadY,
  },
  areaText: {
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLine,
    color: '#222222',
  },
  areaRule: { marginTop: t.areaRuleTop, height: 1, backgroundColor: s.rule },
  areaMeta: { marginTop: t.areaMetaTop, flexDirection: 'row', alignItems: 'center' },
  areaMetaText: {
    flex: 1,
    marginLeft: 6,
    fontFamily: font.appBody,
    fontSize: t.areaMetaSize,
    color: ink.accent,
  },
  areaCounter: { fontFamily: font.appBody, fontSize: t.areaMetaSize, color: colors.textBody },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.cardX,
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
  secondary: {
    marginTop: s.secondaryTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: s.secondarySize,
    color: colors.textBody,
  },
});
