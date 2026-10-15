import { useDemoAdvance } from '../hooks/useDemoAdvance';
import { router, type Href } from 'expo-router';
import {
  Bold,
  ChevronDown,
  ChevronLeft,
  EllipsisVertical,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LegalDocumentPage from './LegalDocumentPage';
import { shrinkToFit } from '../constants/textFit';
import { ADV_NOTICE_RESPONSE } from '../data/advocateSide';
import { AT_RESPONSE_EDITOR } from '../data/advocateTools';
import {
  advNoticeResponse as t,
  advResponseEditor as g,
  colors,
  font,
  ink,
} from '../constants/theme';

// Legal notice response — the rendered document (design/189).
//
// ⚠ THE DOCUMENT IS A BLANK FORM. design/188 has just produced a fully drafted
// notice; design/189 renders a template with empty blanks for every one of those
// fields. The draft content does not carry forward into the artefact the flow exists
// to produce. Built as drawn — see the note in data/advocateSide.ts.
//
// ⚠ The toolbar implies a rich-text editor. This is the SECOND one drawn with no
// specification — design/180's docket notes was the first. Neither says what
// formatting is supported or how the document is stored. Built inert.
//
// ⚠ Third advocate name ("GURNEET CHAWLA"), a singular/plural firm-name mismatch,
// "Reffrence Id" and "has been preserve" are all as drawn.
//
// ⚠ The body runs at roughly 7pt at 390pt wide — below legible size on a device.
// Reproduced at the drawn proportions; a real one needs a zoomable document view.

/**
 * The legal notice response document screen, shared by design/189 and
 * design/267.
 *
 * PAIR. A pixel diff of the two exports found them identical above the footer —
 * same header, same rich-text toolbar, same letterhead, same printed body, to
 * sub-pixel anti-aliasing — and different only in the three footer controls:
 *
 *   variant="share"     design/189  Edit Draft / Save & Upload, filled
 *                                   "Share for Review"
 *   variant="generate"  design/267  Back / Confirm & Upload, OUTLINED
 *                                   "Generate Draft with AI"
 *
 * STATIC. The toolbar is inert — no editor engine is specified anywhere in the
 * designs — and "Generate Draft with AI" is the ELEVENTH AI surface in this
 * app, with nothing behind it.
 */
export default function NoticeResponseScreen({
  variant,
  caseId,
}: {
  variant: 'share' | 'generate';
  caseId: string;
}) {
  const { advance } = useDemoAdvance();
  const insets = useSafeAreaInsets();
  const id = caseId;
  const r = ADV_NOTICE_RESPONSE;
  const e = AT_RESPONSE_EDITOR;
  const generate = variant === 'generate';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.brandDark} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={8}>
          <EllipsisVertical size={t.kebab} color={colors.textBody} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <Text style={styles.heading} {...shrinkToFit(0.75)}>
            {r.heading}
          </Text>
          <View style={styles.status}>
            <Text style={styles.statusText} {...shrinkToFit(0.75)}>
              {r.statusChip}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {/* Inert — no rich-text editor is specified anywhere. */}
          <View style={styles.toolbar}>
            <Pressable accessibilityRole="button" style={styles.toolBlock}>
              <Text style={styles.toolBlockText} {...shrinkToFit(0.8)}>
                {r.toolbar.block}
              </Text>
              <ChevronDown size={t.toolChevron} color={colors.textPrimary} style={styles.toolChevron} />
            </Pressable>
            <Bold size={t.toolIcon} color={colors.textPrimary} style={styles.toolIcon} />
            <Italic size={t.toolIcon} color={colors.textPrimary} style={styles.toolIcon} />
            <Underline size={t.toolIcon} color={colors.textPrimary} style={styles.toolIcon} />
            <List size={t.toolIcon} color={colors.textPrimary} style={styles.toolIcon} />
            <ListOrdered size={t.toolIcon} color={colors.textPrimary} style={styles.toolIcon} />
            <Undo2 size={t.toolUndo} color={colors.textPrimary} style={styles.toolUndo} />
            <Redo2 size={t.toolUndo} color={colors.textPrimary} style={styles.toolIcon} />
          </View>

          <LegalDocumentPage title={r.docTitle} />

          <View style={styles.btns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/advocate/notice/${id}/draft` as Href)}
              style={({ pressed }) => [styles.btn, styles.edit, pressed && styles.pressed]}
            >
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {generate ? e.back : r.editDraft}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              // DEMO: Save & Upload / Confirm draw without a destination; follow the flow map.
              onPress={() => advance()}
              style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed]}
            >
              <Text style={styles.saveText} {...shrinkToFit(0.75)}>
                {generate ? e.confirm : r.saveUpload}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            // DEMO: the static Generate state follows the flow map (data/flowMap.ts).
            generate ? advance() : router.push(`/advocate/notice/${id}/review` as Href)
          }
          style={({ pressed }) => [styles.share, generate && styles.generate, pressed && styles.pressed]}
        >
          <Text
            style={[styles.shareText, generate && styles.generateText]}
            {...shrinkToFit(0.8)}
          >
            {generate ? e.generate : r.shareReview}
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
    backgroundColor: t.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 32 },
  headingRow: { marginTop: t.headingGap, flexDirection: 'row', alignItems: 'center' },
  heading: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    color: colors.brandDark,
  },
  status: {
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    borderWidth: 1,
    borderColor: t.statusBorder,
    paddingHorizontal: t.statusPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  statusText: { fontFamily: font.appBody, fontSize: t.statusSize, color: t.statusColour },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  toolbar: {
    paddingHorizontal: t.toolPadX,
    paddingTop: t.toolPadY,
    paddingBottom: t.toolPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBlock: { flexDirection: 'row', alignItems: 'center' },
  toolBlockText: { fontFamily: font.appBody, fontSize: t.toolBlockSize, color: colors.textPrimary },
  toolChevron: { marginLeft: t.toolChevronGap },
  toolIcon: { marginLeft: t.toolGapX },
  toolUndo: { marginLeft: 'auto' },

  // design/209: the two buttons are sized to their labels, not split evenly —
  // "Edit Draft" is 132pt and "Save & Upload" 161pt, each with the same padding.
  btns: {
    marginTop: t.btnGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.btnGapX,
  },
  btn: {
    flexShrink: 1,
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.btnPadX,
  },
  edit: { borderWidth: 1, borderColor: t.editBorder },
  editText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: t.editColour },
  save: { backgroundColor: t.saveBg },
  saveText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },

  share: {
    marginTop: t.shareGap,
    minHeight: t.shareHeight,
    borderRadius: t.shareRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: { fontFamily: font.appHeading, fontSize: t.shareSize, color: ink.onBrand },
  // design/267 draws the same slot as an OUTLINED button, not a filled one.
  generate: {
    marginTop: g.genTop,
    minHeight: g.genH,
    borderRadius: g.genRadius,
    borderWidth: 1,
    borderColor: g.genBorder,
    backgroundColor: g.genBg,
  },
  generateText: { fontSize: g.genSize, color: ink.accent },
  pressed: { opacity: 0.85 },
});
