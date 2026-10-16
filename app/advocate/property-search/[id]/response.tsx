import { previewNotice } from '../../../../components/PreviewNotice';
import DemoPressable from '../../../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
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

import LegalDocumentPage from '../../../../components/LegalDocumentPage';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PSR_RESPONSE } from '../../../../data/advocateSide';
import { advNoticeResponse as t, colors, font, ink } from '../../../../constants/theme';

// Property Search Report response — the rendered document (design/209).
//
// ⚠ design/209 IS design/189. Differenced pixel by pixel the two 780×1688 exports
// are identical except rows 587–607, the document title. So this screen reuses the
// Legal Notice response's tokens (advNoticeResponse) and document component
// outright — there is nothing else to measure, and anything else would be a second
// set of numbers for the same pixels.
//
// ⚠ (a) The header reads "Legal Notice Response" on a Property Search flow.
// ⚠ (b) The document is a BLANK FORM. design/208 produces eight fully written
//    sections; none of them reach this artefact. Same defect as design/189.
// ⚠ (c) The letterhead reads "GURNEET CHAWLA ADVOCATE" — the fourth name used for
//    the signed-in advocate.
// See the note in data/advocateSide.ts.
//
// ⚠ The toolbar implies a rich-text editor. This is the THIRD one drawn with no
// specification — design/180's docket notes and design/188's draft editor were the
// first two. Built inert.

export default function AdvocatePropertySearchResponseScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_PSR_RESPONSE;

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
        <Pressable onPress={() => previewNotice("More")} accessibilityRole="button" accessibilityLabel="More" hitSlop={8}>
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
            <Pressable onPress={() => previewNotice(r.toolbar.block)} accessibilityRole="button" style={styles.toolBlock}>
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
              onPress={() => router.push(`/advocate/property-search/${id}/editor` as Href)}
              style={({ pressed }) => [styles.btn, styles.edit, pressed && styles.pressed]}
            >
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {r.editDraft}
              </Text>
            </Pressable>
            <DemoPressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed]}
            >
              <Text style={styles.saveText} {...shrinkToFit(0.75)}>
                {r.saveUpload}
              </Text>
            </DemoPressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/property-search/${id}/upload` as Href)}
          style={({ pressed }) => [styles.share, pressed && styles.pressed]}
        >
          <Text style={styles.shareText} {...shrinkToFit(0.8)}>
            {r.shareReview}
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
  pressed: { opacity: 0.85 },
});
