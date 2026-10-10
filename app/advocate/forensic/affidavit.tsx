import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  CirclePlus,
  Clock,
  Eye,
  FileText,
  Info,
  Pencil,
  Signature,
  SquarePen,
  UserRound,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_AFFIDAVIT } from '../../../data/advocateForensic';
import { advForensicAffidavit as t, colors, font, ink } from '../../../constants/theme';

// Legal affidavit (design/227).
//
// ⚠ THE SIGNATURE IS A STATIC SVG PATH held in data/advocateForensic.ts, drawn to
// match the export. There is NO signature capture, no drawing surface and no touch
// handling anywhere in this flow. That capability is unscoped and has not been
// agreed. "Re-sign / Edit Signature" is inert.
//
// ⚠ THE DEPONENT IS A CLIENT-SIDE ADVOCATE. "Adv. Priya Sharma, Enr: MP/1429/2014"
// — Priya Sharma appears on the client side of this app, and is a fifth name for
// the signed-in advocate after Abhishek Chouhan, Abhishek Sahu, Gurneet Chawla and
// Gurneeet Chawla.
//
// ⚠ THE MATTER IS "Signature & Document Forensic", High Court Indore, where
// design/228 calls the same docket "Land Title Dispute Forensic", Bengaluru Civil
// Court — 1,500km away and a different High Court circuit.

export default function AdvocateForensicAffidavitScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const a = DF_AFFIDAVIT;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {a.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.readyRow}>
          <View style={styles.ready}>
            <View style={styles.readyDot} />
            <Text style={styles.readyText} {...shrinkToFit(0.8)}>
              {a.readyChip}
            </Text>
          </View>
          <Text style={styles.docket} {...shrinkToFit(0.8)}>
            {a.docket}
          </Text>
        </View>
        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {a.headline}
        </Text>
        <Text style={styles.lead}>{a.lead}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.stepIcon, styles.stepDone]}>
              <Check size={t.stepGlyph} color={t.stepDoneColour} strokeWidth={3} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle} {...shrinkToFit(0.75)}>
                {a.steps.done.title}
              </Text>
              <Text style={[styles.stepState, styles.stepStateDone]} {...shrinkToFit(0.8)}>
                {a.steps.done.state}
              </Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepIcon, styles.stepNow]}>
              <SquarePen size={t.stepGlyph} color={t.stepNowColour} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle} {...shrinkToFit(0.75)}>
                {a.steps.now.title}
              </Text>
              <Text style={[styles.stepState, styles.stepStateNow]} {...shrinkToFit(0.8)}>
                {a.steps.now.state}
              </Text>
            </View>
          </View>
          <View style={styles.stepNote}>
            <Info size={t.stepNoteIcon} color={colors.textPrimary} style={styles.stepNoteIcon} />
            <Text style={styles.stepNoteText}>{a.steps.note}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {a.summary.label}
            </Text>
            <View style={styles.court}>
              <Text style={styles.courtText} {...shrinkToFit(0.8)}>
                {a.summary.court}
              </Text>
            </View>
          </View>
          {a.summary.rows.map((r, i) => (
            <View
              key={r.label}
              style={[styles.sumRow, i === 0 && styles.sumRowFirst, 'alt' in r && r.alt && styles.sumRowAlt]}
            >
              <Text style={styles.sumLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text
                style={['alt' in r && r.alt ? styles.sumValueAlt : styles.sumValue]}
                {...shrinkToFit(0.65)}
              >
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.pro}>
            <Text style={styles.proLabel} {...shrinkToFit(0.75)}>
              {a.proforma.label}
            </Text>
            <Text style={styles.proTitle} {...shrinkToFit(0.7)}>
              {a.proforma.title}
            </Text>
            <Text style={styles.proSub} {...shrinkToFit(0.7)}>
              {a.proforma.sub}
            </Text>
          </View>

          <Text style={styles.body}>{a.deponent}</Text>
          {a.clauses.map((c) => (
            <Text key={c} style={styles.clause}>
              {c}
            </Text>
          ))}

          {/* Inert — no editor is specified for the affidavit text. */}
          <View style={styles.editRow}>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
              <Pencil size={t.editIcon} color={colors.textPrimary} />
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {a.edit}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
              <CirclePlus size={t.editIcon} color={colors.textPrimary} />
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {a.add}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.editBtn, styles.saveBtn, pressed && styles.pressed]}>
              <Check size={t.editIcon} color={ink.onBrand} strokeWidth={3} />
              <Text style={[styles.editText, styles.saveText]} {...shrinkToFit(0.8)}>
                {a.save}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sigTitle} {...shrinkToFit(0.75)}>
              {a.signature.title}
            </Text>
            <View style={styles.signed}>
              <BadgeCheck size={t.signedIcon} color={t.signedColour} />
              <Text style={styles.signedText} {...shrinkToFit(0.8)}>
                {a.signature.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.sigSub}>{a.signature.sub}</Text>

          {/* Static SVG path. No capture, no drawing surface. */}
          <View style={styles.sigBox}>
            <Svg width={t.sigW} height={t.sigH} viewBox="0 0 200 36">
              <Path
                d={a.signature.path}
                stroke={t.sigColour}
                strokeWidth={t.sigStroke}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d={a.signature.underlinePath}
                stroke={t.sigColour}
                strokeWidth={1.4}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>

            <View style={styles.sigMeta}>
              <Clock size={t.sigMetaIcon} color={colors.textPrimary} />
              <Text style={styles.sigMetaText} {...shrinkToFit(0.75)}>
                {a.signature.signedAt}
              </Text>
              <View style={styles.enr}>
                <Text style={styles.enrText} {...shrinkToFit(0.75)}>
                  {a.signature.enrLabel} {a.signature.enrValue}
                </Text>
              </View>
            </View>
          </View>

          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.resign, pressed && styles.pressed]}>
            <Signature size={t.resignIcon} color={colors.textPrimary} />
            <Text style={styles.resignText} {...shrinkToFit(0.8)}>
              {a.signature.resign}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.fileIcon}>
              <FileText size={t.fileIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {a.file.name}
              </Text>
              <Text style={styles.fileMeta}>{a.file.meta}</Text>
              <Text style={styles.fileBy} {...shrinkToFit(0.8)}>
                {a.file.by}
              </Text>
            </View>
            <Pressable accessibilityRole="button" style={({ pressed }) => [styles.preview, pressed && styles.pressed]}>
              <Eye size={t.previewIcon} color={colors.textPrimary} />
              <Text style={styles.previewText} {...shrinkToFit(0.8)}>
                {a.file.preview}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.saveDraft, pressed && styles.pressed]}>
            <Text style={styles.saveDraftText} {...shrinkToFit(0.8)}>
              {a.saveDraft}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/forensic/submit?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.cont, pressed && styles.pressed]}
          >
            <Text style={styles.contText} {...shrinkToFit(0.75)}>
              {a.continue}
            </Text>
            <ArrowRight size={t.contArrow} color={ink.onBrand} style={styles.contArrow} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: { paddingHorizontal: t.padX, paddingBottom: t.headerPadBottom, flexDirection: 'row', alignItems: 'center' },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center' },

  readyRow: { marginTop: t.readyGap, flexDirection: 'row', alignItems: 'center' },
  ready: {
    minHeight: t.readyHeight,
    borderRadius: t.readyRadius,
    backgroundColor: t.readyBg,
    paddingHorizontal: t.readyPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  readyDot: { width: t.readyDot, height: t.readyDot, borderRadius: t.readyDot / 2, backgroundColor: t.readyColour, marginRight: t.readyDotGap },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: t.readyColour },
  docket: { marginLeft: t.docketGap, flexShrink: 1, fontFamily: font.appSemi, fontSize: t.docketSize, color: t.docketColour },
  headline: { marginTop: t.headlineGap, fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  lead: { marginTop: t.leadGap, fontFamily: font.appBody, fontSize: t.leadSize, color: t.leadColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },

  stepIcon: { width: t.stepIcon, height: t.stepIcon, borderRadius: t.stepIcon / 2, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: t.stepDoneBg },
  stepNow: { backgroundColor: t.stepNowBg },
  stepText: { marginLeft: t.stepGapX, flexShrink: 1 },
  stepTitle: { fontFamily: font.appHeading, fontSize: t.stepTitleSize, color: colors.textPrimary },
  stepState: { marginTop: t.stepStateGap, fontFamily: font.appSemi, fontSize: t.stepStateSize },
  stepStateDone: { color: t.stepDoneColour },
  stepStateNow: { color: t.stepNowColour },
  stepLine: { width: t.stepLineW, height: 1, backgroundColor: t.stepLineColour, marginHorizontal: t.stepLineGapX },
  stepNote: { marginTop: t.stepNoteGap, borderRadius: t.stepNoteRadius, backgroundColor: t.stepNoteBg, padding: t.stepNotePad, flexDirection: 'row', alignItems: 'flex-start' },
  stepNoteIcon: { marginTop: 1 },
  stepNoteText: { flex: 1, minWidth: 0, marginLeft: t.stepNoteIconGap, fontFamily: font.appBody, fontSize: t.stepNoteSize, lineHeight: t.stepNoteLineHeight, color: colors.textPrimary },

  label: { flexShrink: 1, marginRight: 10, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: t.labelColour },
  court: {
    marginLeft: 'auto',
    minHeight: t.courtHeight,
    borderRadius: t.courtRadius,
    backgroundColor: t.courtBg,
    paddingHorizontal: t.courtPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  courtText: { fontFamily: font.appSemi, fontSize: t.courtSize, color: t.courtColour },
  sumRow: { marginTop: t.rowGapY, flexDirection: 'row', alignItems: 'center' },
  sumRowFirst: { marginTop: t.rowGap },
  sumRowAlt: {
    backgroundColor: t.rowAltBg,
    borderRadius: t.rowAltRadius,
    paddingHorizontal: t.rowAltPadX,
    paddingVertical: t.rowAltPadY,
  },
  sumLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.rowLabelColour },
  sumValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },
  sumValueAlt: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: t.rowAltColour },

  pro: { marginTop: t.proGap, borderRadius: t.proRadius, backgroundColor: t.proBg, padding: t.proPad, alignItems: 'center' },
  proLabel: { fontFamily: font.appSemi, fontSize: t.proLabelSize, letterSpacing: t.proLabelSpacing, color: t.proLabelColour },
  proTitle: { marginTop: t.proTitleGap, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.proTitleSize, lineHeight: t.proTitleLineHeight, color: colors.textPrimary },
  proSub: { marginTop: t.proSubGap, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.proSubSize, letterSpacing: t.proSubSpacing, color: t.proSubColour },

  body: { marginTop: t.bodyGap, fontFamily: font.appSemi, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: colors.textPrimary },
  clause: { marginTop: t.clauseGap, fontFamily: font.appSemi, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: colors.textPrimary },

  editRow: { marginTop: t.editGap, borderRadius: t.editRadius, backgroundColor: t.editBg, padding: t.editPad, flexDirection: 'row', gap: t.editGapX },
  editBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.editHeight,
    borderRadius: t.editBtnRadius,
    backgroundColor: t.editBtnBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  editText: { marginLeft: t.editIconGap, fontFamily: font.appHeading, fontSize: t.editSize, color: colors.textPrimary, flexShrink: 1 },
  saveBtn: { backgroundColor: t.saveBg },
  saveText: { color: ink.onBrand },

  sigTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.sigTitleSize, color: colors.textPrimary },
  signed: {
    marginLeft: 'auto',
    minHeight: t.signedHeight,
    borderRadius: t.signedRadius,
    backgroundColor: t.signedBg,
    paddingHorizontal: t.signedPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  signedText: { marginLeft: t.signedIconGap, fontFamily: font.appSemi, fontSize: t.signedSize, color: t.signedColour },
  sigSub: { marginTop: t.sigSubGap, fontFamily: font.appBody, fontSize: t.sigSubSize, color: t.sigSubColour },
  sigBox: { marginTop: t.sigBoxGap, borderRadius: t.sigBoxRadius, backgroundColor: t.sigBoxBg, padding: t.sigBoxPad },
  sigMeta: { marginTop: t.sigMetaGap, flexDirection: 'row', alignItems: 'center' },
  sigMetaText: { marginLeft: t.sigMetaIconGap, flexShrink: 1, marginRight: 8, fontFamily: font.appSemi, fontSize: t.sigMetaSize, color: colors.textPrimary },
  enr: { marginLeft: 'auto', borderRadius: t.enrRadius, backgroundColor: t.enrBg, paddingHorizontal: t.enrPadX, paddingVertical: t.enrPadY, flexShrink: 1 },
  enrText: { fontFamily: font.appSemi, fontSize: t.enrSize, color: colors.textPrimary },
  resign: {
    marginTop: t.resignGap,
    alignSelf: 'flex-end',
    minHeight: t.resignHeight,
    borderRadius: t.resignRadius,
    backgroundColor: t.resignBg,
    paddingHorizontal: t.resignPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  resignText: { marginLeft: t.resignIconGap, fontFamily: font.appSemi, fontSize: t.resignSize, color: colors.textPrimary, flexShrink: 1 },

  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginHorizontal: t.fileIconGap },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: t.fileMetaColour },
  fileBy: { marginTop: t.fileByGap, fontFamily: font.appSemi, fontSize: t.fileBySize, color: t.fileByColour },
  preview: {
    minHeight: t.previewHeight,
    borderRadius: t.previewRadius,
    backgroundColor: t.previewBg,
    paddingHorizontal: t.previewPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  previewText: { marginLeft: t.previewIconGap, fontFamily: font.appHeading, fontSize: t.previewSize, color: colors.textPrimary, flexShrink: 1 },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: t.barGapX },
  saveDraft: {
    minHeight: t.saveDraftHeight,
    borderRadius: t.saveDraftRadius,
    backgroundColor: t.saveDraftBg,
    paddingHorizontal: t.saveDraftPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  saveDraftText: { fontFamily: font.appHeading, fontSize: t.saveDraftSize, color: colors.textPrimary },
  cont: {
    flex: 1,
    minWidth: 0,
    minHeight: t.contHeight,
    borderRadius: t.contRadius,
    backgroundColor: t.contBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  contText: { flexShrink: 1, textAlign: 'center', fontFamily: font.appHeading, fontSize: t.contSize, lineHeight: t.contLineHeight, color: ink.onBrand },
  contArrow: { marginLeft: t.contArrowGap },
  pressed: { opacity: 0.85 },
});
