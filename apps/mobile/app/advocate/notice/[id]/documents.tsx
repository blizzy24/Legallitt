import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  Download,
  Eye,
  FileCheck2,
  FileText,
  SquarePen,
  Sparkles,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_DOCS } from '../../../../data/advocateSide';
import { advNoticeDocs as t, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Review documents (design/186).
//
// ⚠ SEVENTH AI SURFACE (first of three in this flow). The "AI Document Summary" and
// its two findings are STATIC STRINGS from data/advocateSide.ts. Nothing is read,
// summarised or cited: there is no model provider, no document ingestion and no OCR.
// View Full Summary and View Source are inert.
//
// ⚠ design/186 contradicts its own count: the header reads "4 Documents • 24 Pages"
// and the section label "4 Files Attached", but FIVE file rows are drawn. Both the
// counts and the five rows are kept exactly as drawn.
//
// View opens the document viewer on that file. The Download chips, the edit pencil
// and the text area are inert — there is no download and no text entry.

export function AdvocateNoticeDocumentsScreenView({ data, navigate, onViewDocument }: { onViewDocument?: (id?: string) => void; data: { ADV_NOTICE_DOCS: typeof ADV_NOTICE_DOCS }; navigate: typeof router }) {
  const { ADV_NOTICE_DOCS } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DOCS;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            Review Documents
          </Text>
          <Text style={styles.sub} {...shrinkToFit(0.75)}>
            Review documents before preparing notice.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.sumCard]}>
          <View style={styles.sumIcon}>
            <FileCheck2 size={t.sumIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.sumText}>
            <Text style={styles.sumTitle} {...shrinkToFit(0.7)}>
              {d.summaryTitle}
            </Text>
            <Text style={styles.sumSub} {...shrinkToFit(0.7)}>
              {d.summarySub}
            </Text>
          </View>
          <View style={styles.done}>
            <View style={styles.doneDot} />
            <Text style={styles.doneText} {...shrinkToFit(0.75)}>
              {d.statusChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.aiHead}>
            <Sparkles size={t.aiIcon} color={colors.brandDark} />
            <Text style={styles.aiTitle} {...shrinkToFit(0.7)}>
              {d.aiTitle}
            </Text>
            <View style={styles.aiChip}>
              <Text style={styles.aiChipText} {...shrinkToFit(0.75)}>
                {d.aiChip}
              </Text>
            </View>
          </View>
          <Text style={styles.aiSub} {...shrinkToFit(0.75)}>
            {d.aiSub}
          </Text>

          {/* Static content — see the note at the top of this file. */}
          <View style={styles.block}>
            {d.aiFindings.map((finding, i) => (
              <Text key={finding} style={[styles.bullet, i > 0 && styles.bulletNext]}>
                • {finding}
              </Text>
            ))}
          </View>

          <View style={styles.linkRule} />
          <View style={styles.links}>
            <Pressable onPress={() => onViewDocument ? onViewDocument(d.files[0]?.id) : router.push(advDocHref(d.files[0]?.name ?? '') as Href)} accessibilityRole="button" style={styles.link}>
              <Eye size={t.linkIcon} color={colors.brandDark} />
              <Text style={styles.linkText} {...shrinkToFit(0.8)}>
                {d.viewFull}
              </Text>
            </Pressable>
            <Pressable onPress={() => onViewDocument ? onViewDocument(d.files[0]?.id) : router.push(advDocHref(d.files[0]?.name ?? '') as Href)} accessibilityRole="button" style={styles.link}>
              <FileText size={t.linkIcon} color={colors.textPrimary} />
              <Text style={[styles.linkText, styles.linkTextPlain]} {...shrinkToFit(0.8)}>
                {d.viewSource}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            {d.filesLabel}
          </Text>
          {/* design/186 says four; five rows follow. Both kept as drawn. */}
          <Text style={styles.sectionMeta} {...shrinkToFit(0.8)}>
            {d.filesCountLabel}
          </Text>
        </View>

        {d.files.map((f) => (
          <View key={f.id} style={styles.fileCard}>
            <FileText size={t.fileIconGlyph} color={colors.brandDark} />
            <View style={styles.fileText}>
              <Text style={styles.fileName} {...shrinkToFit(0.7)}>
                {f.name}
              </Text>
              <Text style={styles.fileMeta} {...shrinkToFit(0.75)}>
                {f.meta}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => onViewDocument ? onViewDocument(f.id) : router.push(advDocHref(f.name) as Href)}
              style={styles.fileBtn}
            >
              <Text style={styles.fileBtnText} {...shrinkToFit(0.8)}>
                View
              </Text>
            </Pressable>
            <Pressable onPress={() => previewNotice(d.additionalLabel)} accessibilityRole="button" style={[styles.fileBtn, styles.fileBtnNext]}>
              <Text style={styles.fileBtnText} {...shrinkToFit(0.8)}>
                Download
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={[styles.card, styles.addCard]}>
          <View style={styles.addHead}>
            <Text style={styles.addLabel} {...shrinkToFit(0.75)}>
              {d.additionalLabel}
            </Text>
            <SquarePen size={t.addPencil} color={colors.textPrimary} />
          </View>
          {/* Static: the prototype has no text entry. */}
          <View style={styles.addBox}>
            <Text style={styles.addPlaceholder}>{d.additionalPlaceholder}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/drafting` as Href)}
          style={({ pressed }) => [styles.send, pressed && styles.pressed]}
        >
          <Text style={styles.sendText} {...shrinkToFit(0.8)}>
            {d.send}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 32 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  sumCard: { flexDirection: 'row', alignItems: 'center' },
  sumIcon: {
    width: t.sumIcon,
    height: t.sumIcon,
    borderRadius: t.sumIcon / 2,
    backgroundColor: t.sumIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sumText: { flex: 1, minWidth: 0, marginLeft: t.sumIconGap, marginRight: 8 },
  sumTitle: { fontFamily: font.appHeading, fontSize: t.sumTitleSize, color: colors.textPrimary },
  sumSub: { marginTop: t.sumSubGap, fontFamily: font.appBody, fontSize: t.sumSubSize, color: colors.textBody },
  done: {
    minHeight: t.doneHeight,
    borderRadius: t.doneRadius,
    paddingHorizontal: t.donePadX,
    backgroundColor: t.doneBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  doneDot: {
    width: t.doneDot,
    height: t.doneDot,
    borderRadius: t.doneDot / 2,
    marginRight: t.doneDotGap,
    backgroundColor: t.doneColour,
  },
  doneText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.doneSize, color: t.doneColour },

  aiHead: { flexDirection: 'row', alignItems: 'center' },
  aiTitle: {
    marginLeft: t.aiIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.aiTitleSize,
    color: colors.textPrimary,
  },
  aiChip: {
    minHeight: t.aiChipHeight,
    borderRadius: t.aiChipRadius,
    paddingHorizontal: t.aiChipPadX,
    backgroundColor: t.aiChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  aiChipText: { fontFamily: font.appBody, fontSize: t.aiChipSize, color: t.aiChipColour },
  aiSub: { marginTop: t.aiSubGap, fontFamily: font.appBody, fontSize: t.aiSubSize, color: colors.textBody },

  block: {
    marginTop: t.blockGap,
    borderRadius: t.blockRadius,
    borderWidth: 1,
    borderColor: t.blockBorder,
    backgroundColor: t.blockBg,
    padding: t.blockPad,
  },
  bullet: {
    fontFamily: font.appBody,
    fontSize: t.bulletSize,
    lineHeight: t.bulletLineHeight,
    color: colors.textPrimary,
  },
  bulletNext: { marginTop: t.bulletGap },

  linkRule: { marginTop: t.linkRuleGap, height: 1, backgroundColor: t.blockBorder },
  links: {
    marginTop: t.linkGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  link: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  linkText: {
    marginLeft: t.linkIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.linkSize,
    color: colors.brandDark,
  },
  linkTextPlain: { color: colors.textPrimary },

  sectionRow: { marginTop: t.sectionGap - t.cardGap, marginBottom: t.cardGap, flexDirection: 'row', alignItems: 'center' },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.brandDark,
  },
  sectionMeta: { fontFamily: font.appBody, fontSize: t.sectionMetaSize, color: colors.textBody },

  fileCard: {
    marginBottom: t.fileGap,
    borderRadius: t.fileRadius,
    backgroundColor: colors.card,
    padding: t.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileText: { flex: 1, minWidth: 0, marginLeft: t.fileIconGap, marginRight: 8 },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: colors.textPrimary },
  fileMeta: { marginTop: t.fileMetaGap, fontFamily: font.appBody, fontSize: t.fileMetaSize, color: colors.textBody },
  fileBtn: {
    minHeight: t.fileBtnHeight,
    borderRadius: t.fileBtnRadius,
    borderWidth: 1,
    borderColor: t.fileBtnBorder,
    paddingHorizontal: t.fileBtnPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBtnNext: { marginLeft: t.fileBtnGapX },
  fileBtnText: { fontFamily: font.appBody, fontSize: t.fileBtnSize, color: colors.textPrimary },

  addCard: { marginTop: t.cardGap - t.fileGap },
  addHead: { flexDirection: 'row', alignItems: 'center' },
  addLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.addLabelSize,
    color: colors.brandDark,
  },
  addBox: {
    marginTop: t.addBoxGap,
    minHeight: t.addBoxMinHeight,
    borderRadius: t.addBoxRadius,
    borderWidth: 1,
    borderColor: t.addBoxBorder,
    backgroundColor: t.addBoxBg,
    padding: t.addBoxPad,
  },
  addPlaceholder: { fontFamily: font.appBody, fontSize: t.addBoxSize, color: colors.textPrimary },

  send: {
    marginTop: t.sendGap - t.cardGap,
    minHeight: t.sendHeight,
    borderRadius: t.sendRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { fontFamily: font.appHeading, fontSize: t.sendSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeDocumentsScreen() {
  const model = useAdvocateNoticeModel("documents");
  return <AdvocateNoticeDocumentsScreenView data={model.data} navigate={model.navigate} onViewDocument={model.onViewDocument} />;
}
