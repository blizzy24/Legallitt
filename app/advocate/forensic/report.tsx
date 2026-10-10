import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  FolderOpen,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { DF_REPORT } from '../../../data/advocateForensic';
import { advForensicReport as t, colors, font, ink } from '../../../constants/theme';

// Forensic report form (design/226).
//
// ⚠ THE CLIENT CHANGES HERE. Rahul Sharma on designs 222–225 becomes Vikramaditya
// Singhania from this screen on, under the same docket DF-2026-1048. Vikramaditya
// Singhania was the property OWNER in the Property Search batch
// (Sale_Deed_Singhania.pdf, designs 207/210), not a client.
//
// The four examination fields are live; everything else is static.

export default function AdvocateForensicReportScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const r = DF_REPORT;
  const [vals, setVals] = useState(r.exam.sections.map((s) => s.body));

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
          {r.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ready}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText} {...shrinkToFit(0.8)}>
            {r.readyChip}
          </Text>
        </View>
        <Text style={styles.lead}>{r.lead}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.client.label}
            </Text>
            <View style={styles.vchip}>
              <BadgeCheck size={t.vchipIcon} color={t.vchipColour} />
              <Text style={styles.vchipText} {...shrinkToFit(0.75)}>
                {r.client.chip}
              </Text>
            </View>
          </View>
          <View style={styles.clientRow}>
            <View style={styles.initials}>
              <Text style={styles.initialsText} {...shrinkToFit(0.8)}>
                VS
              </Text>
            </View>
            <View style={styles.clientText}>
              {/* ⚠ A different client from designs 222–225, same docket. */}
              <Text style={styles.name} {...shrinkToFit(0.7)}>
                {r.client.name}
              </Text>
              <Text style={styles.req} {...shrinkToFit(0.8)}>
                {r.client.request}
              </Text>
            </View>
          </View>
          <View style={styles.case}>
            <FolderOpen size={t.caseIcon} color={colors.textPrimary} />
            <Text style={styles.caseLabel} {...shrinkToFit(0.8)}>
              {r.client.caseLabel}
            </Text>
            <Text style={styles.caseValue} {...shrinkToFit(0.75)}>
              {r.client.caseValue}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.document.label}
            </Text>
            <Text style={styles.subNote} {...shrinkToFit(0.8)}>
              {r.document.note}
            </Text>
          </View>
          <View style={styles.file}>
            <View style={styles.fileIcon}>
              <FileText size={t.fileIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                {r.document.name}
              </Text>
              <Text style={styles.fileSub}>{r.document.sub}</Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                {r.document.meta}
                <Text style={styles.fileMetaOk}>{r.document.metaOk}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.examRow}>
          <Text style={styles.examTitle} {...shrinkToFit(0.75)}>
            {r.exam.title}
          </Text>
          <Text style={styles.examNote} {...shrinkToFit(0.8)}>
            {r.exam.note}
          </Text>
        </View>

        {r.exam.sections.map((s, i) => (
          <View key={s.title} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.qDot} />
              <Text style={styles.qTitle} {...shrinkToFit(0.75)}>
                {s.title}
              </Text>
              <Text style={styles.qTag} {...shrinkToFit(0.8)}>
                {s.tag}
              </Text>
            </View>
            <View style={styles.qBox}>
              <TextInput
                style={styles.qInput}
                value={vals[i]}
                onChangeText={(v) => setVals((a) => a.map((x, j) => (j === i ? v : x)))}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}

        <View style={styles.notice}>
          <ShieldCheck size={t.noticeIcon} color={colors.brandDark} style={styles.noticeIcon} />
          <View style={styles.noticeText}>
            <Text style={styles.noticeTitle} {...shrinkToFit(0.8)}>
              {r.notice.title}
            </Text>
            <Text style={styles.noticeBody}>{r.notice.body}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {r.draft.label}
            </Text>
            <View style={styles.draftChip}>
              <Check size={t.draftChipIcon} color={t.draftChipColour} strokeWidth={3} />
              <Text style={styles.draftChipText} {...shrinkToFit(0.75)}>
                {r.draft.chip}
              </Text>
            </View>
          </View>
          <View style={styles.draftBox}>
            <View style={styles.row}>
              <FileText size={t.draftIconGlyph} color={colors.brandDark} />
              <Text style={styles.draftTitle} {...shrinkToFit(0.75)}>
                {r.draft.title}
              </Text>
            </View>
            <Text style={styles.draftBody}>{r.draft.body}</Text>
          </View>
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.preview, pressed && styles.pressed]}>
            <Eye size={t.previewIcon} color={colors.textPrimary} />
            <Text style={styles.previewText} {...shrinkToFit(0.8)}>
              {r.draft.preview}
            </Text>
          </Pressable>
          <View style={styles.byRow}>
            <Scale size={t.byIcon} color={t.byColour} />
            <Text style={styles.by} {...shrinkToFit(0.8)}>
              {r.draft.by}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/forensic/affidavit?id=${id ?? ''}` as Href)}
          style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
        >
          <Text style={styles.continueText} {...shrinkToFit(0.8)}>
            {r.continue}
          </Text>
          <ArrowRight size={t.continueArrow} color={ink.onBrand} style={styles.continueArrow} />
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

  ready: {
    marginTop: t.readyGap,
    alignSelf: 'flex-start',
    minHeight: t.readyHeight,
    borderRadius: t.readyRadius,
    backgroundColor: t.readyBg,
    paddingHorizontal: t.readyPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyDot: { width: t.readyDot, height: t.readyDot, borderRadius: t.readyDot / 2, backgroundColor: t.readyColour, marginRight: t.readyDotGap },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, letterSpacing: t.readySpacing, color: t.readyColour },
  lead: { marginTop: t.leadGap, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: t.leadColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  label: { flexShrink: 1, marginRight: 10, fontFamily: font.appSemi, fontSize: t.labelSize, letterSpacing: t.labelSpacing, color: t.labelColour },
  vchip: {
    marginLeft: 'auto',
    minHeight: t.vchipHeight,
    borderRadius: t.vchipRadius,
    backgroundColor: t.vchipBg,
    paddingHorizontal: t.vchipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  vchipText: { marginLeft: t.vchipIconGap, fontFamily: font.appSemi, fontSize: t.vchipSize, color: t.vchipColour, flexShrink: 1 },

  clientRow: { marginTop: t.initialsGap, flexDirection: 'row', alignItems: 'center' },
  initials: { width: t.initials, height: t.initials, borderRadius: t.initials / 2, backgroundColor: t.initialsBg, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontFamily: font.appSemi, fontSize: t.initialsSize, color: t.initialsColour },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.initialsGapX },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  req: { marginTop: t.reqGap, fontFamily: font.appBody, fontSize: t.reqSize, color: t.reqColour },
  case: {
    marginTop: t.caseGap,
    minHeight: t.caseHeight,
    borderRadius: t.caseRadius,
    backgroundColor: t.caseBg,
    paddingHorizontal: t.casePadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseLabel: { marginLeft: t.caseIconGap, flexShrink: 1, marginRight: 8, fontFamily: font.appBody, fontSize: t.caseSize, color: colors.textPrimary },
  caseValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.caseSize, color: colors.textPrimary },

  subNote: { marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.subNoteSize, color: t.subNoteColour, flexShrink: 1 },
  file: { marginTop: t.fileGap, borderRadius: t.fileRadius, backgroundColor: t.fileBg, padding: t.filePad, flexDirection: 'row', alignItems: 'flex-start' },
  fileIcon: { width: t.fileIcon, height: t.fileIcon, borderRadius: t.fileIconRadius, backgroundColor: t.fileIconBg, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileSub: { marginTop: t.fileSubGap, fontFamily: font.appBody, fontSize: t.fileSubSize, color: t.fileSubColour },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appSemi, fontSize: t.fileMetaSize, color: t.fileMetaColour },
  fileMetaOk: { color: t.fileMetaOk },

  examRow: { marginTop: t.examGap, flexDirection: 'row', alignItems: 'center' },
  examTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.examTitleSize, color: colors.textPrimary },
  examNote: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: t.examNoteSize, color: t.examNoteColour, flexShrink: 1 },

  qDot: { width: t.qDot, height: t.qDot, borderRadius: t.qDot / 2, backgroundColor: colors.brandDark, marginRight: t.qDotGap },
  qTitle: { flexShrink: 1, marginRight: 10, fontFamily: font.appHeading, fontSize: t.qTitleSize, color: colors.textPrimary },
  qTag: { marginLeft: 'auto', fontFamily: font.appBody, fontSize: t.qTagSize, color: t.qTagColour, flexShrink: 1 },
  qBox: { marginTop: t.qBoxGap, borderRadius: t.qBoxRadius, backgroundColor: t.qBoxBg, padding: t.qBoxPad },
  qInput: {
    minHeight: t.qBoxMinHeight,
    fontFamily: font.appBody,
    fontSize: t.qBoxSize,
    lineHeight: t.qBoxLineHeight,
    color: colors.textPrimary,
    padding: 0,
    outlineWidth: 0,
  },

  notice: {
    marginTop: t.noticeGap,
    borderRadius: t.noticeRadius,
    backgroundColor: t.noticeBg,
    padding: t.noticePad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeIcon: { marginTop: 1 },
  noticeText: { flex: 1, minWidth: 0, marginLeft: t.noticeIconGap },
  noticeTitle: { fontFamily: font.appHeading, fontSize: t.noticeTitleSize, color: colors.textPrimary },
  noticeBody: { marginTop: t.noticeBodyGap, fontFamily: font.appBody, fontSize: t.noticeBodySize, lineHeight: t.noticeBodyLineHeight, color: t.noticeBodyColour },
  draftChip: {
    marginLeft: 'auto',
    minHeight: t.draftChipHeight,
    borderRadius: t.draftChipRadius,
    backgroundColor: t.draftChipBg,
    paddingHorizontal: t.draftChipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  draftChipText: { marginLeft: t.draftChipIconGap, fontFamily: font.appSemi, fontSize: t.draftChipSize, color: t.draftChipColour, flexShrink: 1 },
  draftBox: { marginTop: t.draftBoxGap, borderRadius: t.draftBoxRadius, backgroundColor: t.draftBoxBg, padding: t.draftBoxPad },
  draftTitle: { marginLeft: t.draftIconGap, flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.draftTitleSize, lineHeight: t.draftTitleLineHeight, color: colors.textPrimary },
  draftBody: { marginTop: t.draftBodyGap, fontFamily: font.appBody, fontSize: t.draftBodySize, lineHeight: t.draftBodyLineHeight, color: t.draftBodyColour },
  preview: {
    marginTop: t.previewGap,
    minHeight: t.previewHeight,
    borderRadius: t.previewRadius,
    backgroundColor: t.previewBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: { marginLeft: t.previewIconGap, fontFamily: font.appHeading, fontSize: t.previewSize, color: colors.textPrimary, flexShrink: 1 },
  byRow: { marginTop: t.byGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  by: { marginLeft: t.byIconGap, fontFamily: font.appSemi, fontSize: t.bySize, color: t.byColour, flexShrink: 1 },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  continue: {
    minHeight: t.continueHeight,
    borderRadius: t.continueRadius,
    backgroundColor: t.continueBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { fontFamily: font.appHeading, fontSize: t.continueSize, color: ink.onBrand, flexShrink: 1 },
  continueArrow: { marginLeft: t.continueArrowGap },
  pressed: { opacity: 0.85 },
});
