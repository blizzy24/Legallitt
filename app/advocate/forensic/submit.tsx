import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  ChevronLeft,
  Eye,
  FileText,
  Gavel,
  IdCard,
  Info,
  Lock,
  Pencil,
  Shield,
  ShieldCheck,
  Signature,
  UserRound,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_SUBMIT } from '../../../data/advocateForensic';
import { advForensicSubmit as t, colors, font, ink } from '../../../constants/theme';
import { advDocHref } from '../../../data/docLinks';

// Review & submit (design/228).
//
// ⚠ THE MATTER AND THE COURT CHANGE AGAIN. "Land Title Dispute Forensic",
// Bengaluru Civil Court • Branch Bench IV, where design/227 calls the same docket
// "Signature & Document Forensic", High Court Indore, and designs 229/231 call it
// "Document Forensic (Property Sale Deed 1998)". Three matters, two cities, one
// docket.
//
// The muted "Submit to Admin" fill is NOT a defect: design/228 draws the ADVOCATE
// CONFIRMATION checkbox above it UNTICKED, so the button is in its disabled state.
// Ticking the box enables it. ⚠ The ENABLED colour is not drawn anywhere in the
// batch, so colors.brandDark stands in for it.
//
// ⚠ A SEVENTH GREEN (#047857) for Pass / Ready / 100% Prepared.
//
// "Submit to Admin" pushes to the admin loop as a PLACEHOLDER only; designs
// 229–232 are the next group and those screens do not exist yet.

export default function AdvocateForensicSubmitScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = DF_SUBMIT;
  /** design/228 draws this unticked, which is why Submit is muted. */
  const [confirmed, setConfirmed] = useState(false);

  const fileCard = (
    label: string,
    note: string | null,
    name: string,
    meta: string,
    tag: string,
    icon: 'report' | 'affidavit',
  ) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label} {...shrinkToFit(0.8)}>
          {label}
        </Text>
        {note && (
          <Text style={styles.prep} {...shrinkToFit(0.8)}>
            {note}
          </Text>
        )}
      </View>
      <View style={styles.fileRow}>
        <View style={styles.fileIcon}>
          {icon === 'report' ? (
            <FileText size={t.fileIconGlyph} color={colors.textPrimary} />
          ) : (
            <Signature size={t.fileIconGlyph} color={colors.textPrimary} />
          )}
        </View>
        <View style={styles.fileText}>
          <View style={styles.row}>
            <Text style={styles.fileName} {...shrinkToFit(0.7)}>
              {name}
            </Text>
            <View style={styles.readyTag}>
              <Check size={t.readyTagIcon} color={t.readyTagColour} strokeWidth={3} />
              <Text style={styles.readyTagText} {...shrinkToFit(0.8)}>
                {tag}
              </Text>
            </View>
          </View>
          <Text style={styles.fileMeta}>{meta}</Text>
        </View>
      </View>
      <View style={styles.actRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(advDocHref(name) as Href)}
          style={({ pressed }) => [styles.act, pressed && styles.pressed]}
        >
          <Eye size={t.actIcon} color={colors.textPrimary} />
          <Text style={styles.actText} {...shrinkToFit(0.8)}>
            {s.view}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.act, pressed && styles.pressed]}>
          <Pencil size={t.actIcon} color={colors.textPrimary} />
          <Text style={styles.actText} {...shrinkToFit(0.8)}>
            {s.edit}
          </Text>
        </Pressable>
      </View>
    </View>
  );

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
          {s.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => router.replace('/matters' as Href)}
          style={styles.close}
        >
          <X size={t.closeIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.readyRow}>
          <View style={styles.ready}>
            <View style={styles.readyDot} />
            <Text style={styles.readyText} {...shrinkToFit(0.8)}>
              {s.readyChip}
            </Text>
          </View>
          <Text style={styles.docket} {...shrinkToFit(0.75)}>
            {s.docket}
          </Text>
        </View>
        <Text style={styles.headline} {...shrinkToFit(0.75)}>
          {s.headline}
        </Text>
        <Text style={styles.lead}>{s.lead}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.matterIcon}>
              <Gavel size={t.matterIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.matterText}>
              <Text style={styles.label} {...shrinkToFit(0.8)}>
                {s.matter.label}
              </Text>
              {/* ⚠ A different matter and city from design/227. */}
              <Text style={styles.matterTitle} {...shrinkToFit(0.7)}>
                {s.matter.title}
              </Text>
              <Text style={styles.matterSub}>{s.matter.sub}</Text>
            </View>
            <View style={styles.shield}>
              <ShieldCheck size={t.shieldGlyph} color={colors.brandDark} />
            </View>
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {s.client.label}
          </Text>
          <IdCard size={t.vaChipIcon} color={t.vaChipColour} style={styles.vaIcon} />
          <Text style={styles.vaChip} {...shrinkToFit(0.8)}>
            {s.client.chip}
          </Text>
        </View>
        <View style={[styles.card, styles.cardTight]}>
          <View style={styles.row}>
            <View style={styles.cliAvatar}>
              <UserRound size={t.cliAvatarGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.cliText}>
              <Text style={styles.cliName} {...shrinkToFit(0.7)}>
                {s.client.name}
              </Text>
              <Text style={styles.cliReq} {...shrinkToFit(0.8)}>
                {s.client.request}
              </Text>
            </View>
            <View style={styles.active}>
              <Text style={styles.activeText} {...shrinkToFit(0.8)}>
                {s.client.state}
              </Text>
            </View>
          </View>

          <View style={styles.cells}>
            {s.client.cells.map((c) => (
              <View key={c.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                  {c.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.target}>
            <FileText size={t.targetIcon} color={colors.textPrimary} />
            <View style={styles.targetText}>
              <Text style={styles.targetLabel} {...shrinkToFit(0.8)}>
                {s.client.targetLabel}
              </Text>
              <Text style={styles.targetValue} {...shrinkToFit(0.7)}>
                {s.client.targetValue}
              </Text>
            </View>
            <Lock size={t.targetLock} color={colors.textPrimary} />
          </View>
        </View>

        {fileCard(s.output.label, s.output.prepared, s.output.name, s.output.meta, s.output.tag, 'report')}
        {fileCard(s.sworn.label, s.sworn.note, s.sworn.name, s.sworn.meta, s.sworn.tag, 'affidavit')}

        <View style={styles.labelRow}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {s.safeguards.label}
          </Text>
        </View>
        <View style={[styles.card, styles.cardTight]}>
          <View style={styles.row}>
            <Text style={styles.checkTitle} {...shrinkToFit(0.75)}>
              {s.safeguards.title}
            </Text>
            <BadgeCheck size={t.passIcon} color={t.passColour} style={styles.passIcon} />
            <Text style={styles.pass} {...shrinkToFit(0.8)}>
              {s.safeguards.pass}
            </Text>
          </View>
          {s.safeguards.rows.map((r, i) => (
            <View key={r.label} style={[styles.checkRow, i === 0 && styles.checkRowFirst]}>
              <CircleCheck size={t.checkIcon} color={t.passColour} />
              <Text style={styles.checkLabel} {...shrinkToFit(0.75)}>
                {r.label}
              </Text>
              <View style={styles.readyTag}>
                <Check size={t.readyTagIcon} color={t.readyTagColour} strokeWidth={3} />
                <Text style={styles.readyTagText} {...shrinkToFit(0.8)}>
                  {r.tag}
                </Text>
              </View>
            </View>
          ))}
          <Text style={styles.checkBody}>{s.safeguards.body}</Text>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            {s.confirm.label}
          </Text>
        </View>
        <View style={[styles.card, styles.cardTight]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            onPress={() => setConfirmed((v) => !v)}
            style={styles.cbRow}
          >
            <View style={[styles.cb, confirmed && styles.cbOn]}>
              {confirmed && <Check size={t.cbGlyph} color={ink.onBrand} strokeWidth={3} />}
            </View>
            <View style={styles.cbText}>
              <Text style={styles.cbTitle}>{s.confirm.title}</Text>
              <Text style={styles.cbBody}>{s.confirm.body}</Text>
            </View>
          </Pressable>

          <View style={styles.noteInset}>
            <Info size={t.noteIcon} color={colors.brandDark} style={styles.noteIcon} />
            <View style={styles.noteText}>
              <Text style={styles.noteTitle} {...shrinkToFit(0.75)}>
                {s.note.title}
              </Text>
              <Text style={styles.noteBody}>{s.note.body}</Text>
            </View>
          </View>
          <View style={styles.lockRow}>
            <Lock size={t.lockIcon} color={t.lockColour} style={styles.lockIcon} />
            <Text style={styles.lockText}>{s.note.lock}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} {...shrinkToFit(0.8)}>
            {s.barLabel}
          </Text>
          <Shield size={t.barDeskIcon} color={t.barLabelColour} style={styles.barDeskIcon} />
          <Text style={styles.barLabel} {...shrinkToFit(0.8)}>
            {s.barDesk}
          </Text>
        </View>
        {/* ⚠ Drawn in a muted/disabled tone. Placeholder push — the admin screens
            (designs 229–232) are the next group and do not exist yet. */}
        <Pressable
          accessibilityRole="button"
          disabled={!confirmed}
          accessibilityState={{ disabled: !confirmed }}
          onPress={() => router.push(`/advocate/forensic/waiting?id=${id ?? ''}` as Href)}
          style={({ pressed }) => [styles.submit, confirmed && styles.submitOn, pressed && styles.pressed]}
        >
          <Text style={styles.submitText} {...shrinkToFit(0.8)}>
            {s.submit}
          </Text>
          <ArrowRight size={t.submitArrow} color={ink.onBrand} style={styles.submitArrow} />
        </Pressable>
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
  close: { marginRight: t.closeGap },
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
  docket: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appSemi, fontSize: t.docketSize, letterSpacing: t.docketSpacing, color: t.docketColour, flexShrink: 1 },
  headline: { marginTop: t.headlineGap, fontFamily: font.appHeading, fontSize: t.headlineSize, color: colors.textPrimary },
  lead: { marginTop: t.leadGap, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: t.leadColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  cardTight: { marginTop: t.fileGap },
  labelRow: { marginTop: t.cardGap, flexDirection: 'row', alignItems: 'center' },
  label: { flexShrink: 1, marginRight: 10, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: t.labelColour },

  matterIcon: { width: t.matterIcon, height: t.matterIcon, borderRadius: t.matterIconRadius, backgroundColor: t.matterIconBg, alignItems: 'center', justifyContent: 'center' },
  matterText: { flex: 1, minWidth: 0, marginHorizontal: t.matterIconGap },
  matterTitle: { marginTop: t.matterTitleGap, fontFamily: font.appHeading, fontSize: t.matterTitleSize, lineHeight: t.matterTitleLineHeight, color: colors.textPrimary },
  matterSub: { marginTop: t.matterSubGap, fontFamily: font.appBody, fontSize: t.matterSubSize, lineHeight: t.matterSubLineHeight, color: t.matterSubColour },
  shield: { width: t.shield, height: t.shield, borderRadius: t.shieldRadius, backgroundColor: t.shieldBg, alignItems: 'center', justifyContent: 'center' },

  vaIcon: { marginLeft: 'auto' },
  vaChip: { marginLeft: t.vaChipIconGap, fontFamily: font.appSemi, fontSize: t.vaChipSize, color: t.vaChipColour, flexShrink: 1 },
  cliAvatar: { width: t.cliAvatar, height: t.cliAvatar, borderRadius: t.cliAvatar / 2, backgroundColor: t.cliAvatarBg, alignItems: 'center', justifyContent: 'center' },
  cliText: { flex: 1, minWidth: 0, marginHorizontal: t.cliAvatarGap },
  cliName: { fontFamily: font.appHeading, fontSize: t.cliNameSize, color: colors.textPrimary },
  cliReq: { marginTop: t.cliReqGap, fontFamily: font.appBody, fontSize: t.cliReqSize, color: t.cliReqColour },
  active: {
    minHeight: t.activeHeight,
    borderRadius: t.activeRadius,
    backgroundColor: t.activeBg,
    paddingHorizontal: t.activePadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  activeText: { fontFamily: font.appSemi, fontSize: t.activeSize, color: t.activeColour },

  cells: { marginTop: t.cellsGap, flexDirection: 'row', gap: t.cellGapX },
  cell: { flex: 1, minWidth: 0, borderRadius: t.cellRadius, backgroundColor: t.cellBg, padding: t.cellPad },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: t.cellLabelColour },
  cellValue: { marginTop: t.cellValueGap, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },
  target: { marginTop: t.targetGap, borderRadius: t.targetRadius, backgroundColor: t.targetBg, padding: t.targetPad, flexDirection: 'row', alignItems: 'center' },
  targetText: { flex: 1, minWidth: 0, marginHorizontal: t.targetIconGap },
  targetLabel: { fontFamily: font.appBody, fontSize: t.targetLabelSize, color: t.cellLabelColour },
  targetValue: { marginTop: t.targetValueGap, fontFamily: font.appHeading, fontSize: t.targetValueSize, color: colors.textPrimary },

  prep: { marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.prepSize, color: t.prepColour, flexShrink: 1 },
  fileRow: { marginTop: t.fileGap, flexDirection: 'row', alignItems: 'flex-start' },
  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap },
  fileName: { flexShrink: 1, marginRight: 8, fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: t.fileMetaColour },
  readyTag: {
    marginLeft: 'auto',
    minHeight: t.readyTagHeight,
    borderRadius: t.readyTagRadius,
    backgroundColor: t.readyTagBg,
    paddingHorizontal: t.readyTagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  readyTagText: { marginLeft: t.readyTagIconGap, fontFamily: font.appSemi, fontSize: t.readyTagSize, color: t.readyTagColour },
  actRow: { marginTop: t.actGap, flexDirection: 'row', gap: t.actGapX },
  act: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actHeight,
    borderRadius: t.actRadius,
    backgroundColor: t.actBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actText: { marginLeft: t.actIconGap, fontFamily: font.appHeading, fontSize: t.actSize, color: colors.textPrimary, flexShrink: 1 },

  checkTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.checkTitleSize, color: colors.textPrimary },
  passIcon: { marginLeft: 'auto' },
  pass: { marginLeft: t.passIconGap, fontFamily: font.appSemi, fontSize: t.passSize, color: t.passColour, flexShrink: 1 },
  checkRow: {
    marginTop: t.checkRowGapY,
    minHeight: t.checkRowHeight,
    borderRadius: t.checkRowRadius,
    backgroundColor: t.checkRowBg,
    paddingHorizontal: t.checkRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkRowFirst: { marginTop: t.checkRowGap },
  checkLabel: { marginLeft: t.checkIconGap, flexShrink: 1, marginRight: 8, fontFamily: font.appHeading, fontSize: t.checkLabelSize, color: colors.textPrimary },
  checkBody: { marginTop: t.checkBodyGap, fontFamily: font.appBody, fontSize: t.checkBodySize, lineHeight: t.checkBodyLineHeight, color: t.checkBodyColour },

  cbRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cb: {
    width: t.cb,
    height: t.cb,
    borderRadius: t.cbRadius,
    borderWidth: 1,
    borderColor: t.cbBorder,
    backgroundColor: t.cbOffBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cbOn: { backgroundColor: colors.brandDark, borderColor: colors.brandDark },
  cbText: { flex: 1, minWidth: 0, marginLeft: t.cbGapX },
  cbTitle: { fontFamily: font.appHeading, fontSize: t.cbTitleSize, lineHeight: t.cbTitleLineHeight, color: colors.textPrimary },
  cbBody: { marginTop: t.cbBodyGap, fontFamily: font.appBody, fontSize: t.cbBodySize, lineHeight: t.cbBodyLineHeight, color: t.cbBodyColour },
  noteInset: { marginTop: t.cbGap, borderRadius: t.noteRadius, backgroundColor: t.noteBg, padding: t.notePad, flexDirection: 'row', alignItems: 'flex-start' },
  note: { borderRadius: t.noteRadius, backgroundColor: t.noteBg, padding: t.notePad, flexDirection: 'row', alignItems: 'flex-start' },
  noteIcon: { marginTop: 1 },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap },
  noteTitle: { fontFamily: font.appHeading, fontSize: t.noteTitleSize, color: colors.textPrimary },
  noteBody: { marginTop: t.noteBodyGap, fontFamily: font.appBody, fontSize: t.noteBodySize, color: t.noteBodyColour },
  lockRow: { marginTop: t.lockGap, flexDirection: 'row', alignItems: 'flex-start' },
  lockIcon: { marginTop: 1 },
  lockText: { flex: 1, minWidth: 0, marginLeft: t.lockIconGap, fontFamily: font.appSemi, fontSize: t.lockSize, lineHeight: t.lockLineHeight, color: t.lockColour },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: { fontFamily: font.appSemi, fontSize: t.barLabelSize, color: t.barLabelColour, flexShrink: 1 },
  barDeskIcon: { marginLeft: 'auto', marginRight: t.barDeskIconGap },
  submit: {
    marginTop: t.submitGap,
    minHeight: t.submitHeight,
    borderRadius: t.submitRadius,
    backgroundColor: t.submitBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { fontFamily: font.appHeading, fontSize: t.submitSize, color: ink.onBrand, flexShrink: 1 },
  submitOn: { backgroundColor: t.submitOnBg },
  submitArrow: { marginLeft: t.submitArrowGap },
  pressed: { opacity: 0.85 },
});
