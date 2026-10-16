import { previewNotice } from '../../components/PreviewNotice';
import DemoPressable from '../../components/DemoPressable';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Maximize,
  Minus,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, profile as p, viewer as t } from '../../constants/theme';
import { DOCUMENTS, VIEWER_PAGE as page, VIEWER_RELATED as related, documentById } from '../../data/documents';

// Document viewer (design/57).
//
// ONLY PAGE 1 IS DESIGNED. The pager arrows and the numbered PAGES buttons change the
// page number and the active button, but the preview below them always shows the same
// content, because the file draws no other page. Reported rather than inventing five
// more pages of a sale agreement.
//
// Share, Download and Close are inert: nothing in the prototype can share or write a
// file, and there is no designed destination for Close beyond going back.

export default function DocumentViewerScreen() {
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  // A "View" link from another screen may name a file that is not one of the
  // stored DOCUMENTS (see data/docLinks.ts); the name is shown over the drawn page.
  const stored = documentById(String(id)) ?? DOCUMENTS[0];
  const doc = name ? { ...stored, name } : stored;

  const [pageNo, setPageNo] = useState(1);
  const [zoom, setZoom] = useState(100);
  const pages = Array.from({ length: doc.pages }, (_, i) => i + 1);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/documents'));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.circle}>
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          {/* design/57 clips this to "Property Sale Agreement.p". Shown in full,
              shrinking on native and wrapping at narrow widths rather than
              ellipsizing. */}
          <Text style={styles.fileName} {...shrinkToFit(0.75)}>
            {doc.name}
          </Text>
          <View style={styles.subRow}>
            <View style={styles.subDot} />
            <Text style={styles.subText} {...shrinkToFit(0.8)}>
              Verified Case Document • {doc.size}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => previewNotice("Share")} accessibilityRole="button" accessibilityLabel="Share" style={styles.circle}>
          <Share2 size={t.actionIcon} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => previewNotice("Download")} accessibilityRole="button" accessibilityLabel="Download" style={[styles.circle, styles.circleGap]}>
          <Download size={t.actionIcon} color={colors.textPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={back} style={[styles.circle, styles.circleGap]}>
          <X size={t.actionIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.bar}>
        <View style={styles.pager}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous page"
            hitSlop={6}
            onPress={() => setPageNo((n) => Math.max(1, n - 1))}
          >
            <ChevronLeft size={t.pagerIcon} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.pagerText} {...shrinkToFit(0.8)}>
            Page <Text style={styles.pagerStrong}>{pageNo}</Text> of {doc.pages}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next page"
            hitSlop={6}
            onPress={() => setPageNo((n) => Math.min(doc.pages, n + 1))}
          >
            <ChevronRight size={t.pagerIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.zoom}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            hitSlop={6}
            onPress={() => setZoom((z) => Math.max(50, z - 25))}
          >
            <Minus size={t.zoomIcon} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.zoomText} {...shrinkToFit(0.8)}>
            {zoom}%
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            hitSlop={6}
            onPress={() => setZoom((z) => Math.min(200, z + 25))}
          >
            <Plus size={t.zoomIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setZoom(100)}
          hitSlop={6}
          style={styles.fit}
        >
          <Maximize size={t.fitIcon} color={colors.textPrimary} />
          <Text style={styles.fitText} {...shrinkToFit(0.8)}>
            Fit
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.pageGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View style={styles.formRow}>
            <Text style={styles.form} {...shrinkToFit(0.75)}>
              {page.formNo}
            </Text>
            <Text style={styles.reg} {...shrinkToFit(0.75)}>
              {page.reg}
            </Text>
          </View>

          <Text style={styles.docTitle}>{page.title}</Text>
          <Text style={styles.docSub}>{page.subtitle}</Text>

          <View style={styles.rule} />

          <Text style={styles.docBody}>{page.dateLine}</Text>
          {page.parties.map((para) => (
            <Text key={para} style={[styles.docBody, styles.para]}>
              {para}
            </Text>
          ))}

          <View style={styles.recital}>
            <Text style={styles.docBody}>{page.recital}</Text>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signDot} />
            <Text style={styles.signText} {...shrinkToFit(0.75)}>
              {page.signature}
            </Text>
            <Text style={styles.pageNo} {...shrinkToFit(0.8)}>
              Page {pageNo} of {doc.pages}
            </Text>
          </View>
        </View>

        <View style={styles.pagesRow}>
          <Text style={styles.pagesLabel} {...shrinkToFit(0.8)}>
            PAGES
          </Text>
          <View style={styles.pageButtons}>
            {pages.map((n) => {
              const on = n === pageNo;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setPageNo(n)}
                  style={[styles.pageBtn, on && styles.pageBtnOn]}
                >
                  <Text style={[styles.pageBtnText, on && styles.pageBtnTextOn]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <ShieldCheck size={t.infoIcon} color={ink.accent} />
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Document Information
            </Text>
            <View style={styles.vaultChip}>
              <Check size={t.infoChipIcon} color={t.infoChipText} strokeWidth={3} />
              <Text style={styles.vaultChipText} {...shrinkToFit(0.8)}>
                Verified Vault
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <Info label="File Format" value={doc.format} />
            <Info label="File Size" value={`${doc.size} (${doc.pages} Pages)`} />
          </View>
          <View style={styles.infoGrid}>
            <Info label="Uploaded Date" value={doc.uploadedAt} />
            <Info label="Security & Vault ID" value={doc.vaultId} mono />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.relatedIcon}>
              <Scale size={t.relatedIconGlyph} color={ink.accent} />
            </View>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Related Case / Service
            </Text>
            <View style={styles.matterChip}>
              <Text style={styles.matterChipText} {...shrinkToFit(0.8)}>
                {related.chip}
              </Text>
            </View>
          </View>

          <View style={styles.relatedBox}>
            <View style={styles.relatedText}>
              <Text style={styles.relatedLabel} {...shrinkToFit(0.8)}>
                {related.label}
              </Text>
              <Text style={styles.relatedName} {...shrinkToFit(0.75)}>
                {related.title}
              </Text>
              <Text style={styles.relatedCounsel} {...shrinkToFit(0.8)}>
                {related.counsel}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open related request"
              onPress={() => router.push('/requests/DR-4402')}
              style={styles.relatedChevron}
            >
              <ChevronRight size={t.relatedChevronIcon} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => previewNotice("Share")} accessibilityRole="button" style={[styles.action, styles.actionOutline]}>
            <Share2 size={t.actionGlyph} color={colors.textPrimary} />
            <Text style={styles.actionLabel} {...shrinkToFit(0.8)}>
              Share
            </Text>
          </Pressable>
          <DemoPressable accessibilityRole="button" accessibilityLabel="Download" style={[styles.action, styles.actionFilled]}>
            <Download size={t.actionGlyph} color={ink.onBrand} />
            <Text style={[styles.actionLabel, styles.actionLabelOn]} {...shrinkToFit(0.8)}>
              Download
            </Text>
          </DemoPressable>
          <Pressable
            accessibilityRole="button"
            onPress={back}
            style={[styles.action, styles.actionClose]}
          >
            <Text style={styles.actionLabel} {...shrinkToFit(0.8)}>
              Close
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <Text style={[styles.infoValue, mono && styles.infoMono]} {...shrinkToFit(0.7)}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    paddingHorizontal: p.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: t.actionButton,
    height: t.actionButton,
    borderRadius: t.actionButton / 2,
    backgroundColor: colors.appBg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleGap: {
    marginLeft: t.actionGap,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
  },
  fileName: {
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  subRow: {
    marginTop: t.subGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subDot: {
    width: t.subDot,
    height: t.subDot,
    borderRadius: t.subDot / 2,
    marginRight: t.subDotGap,
    backgroundColor: t.signColour,
  },
  subText: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  bar: {
    paddingHorizontal: p.padX,
    paddingVertical: t.barPad,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pager: {
    minHeight: t.pagerHeight,
    borderRadius: t.pagerRadius,
    paddingHorizontal: t.pagerPadX,
    borderWidth: 1,
    borderColor: t.pagerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagerText: {
    marginHorizontal: 8,
    fontFamily: font.appBody,
    fontSize: t.pagerSize,
    color: colors.textBody,
  },
  pagerStrong: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  zoom: {
    marginLeft: t.zoomGap,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  zoomText: {
    marginHorizontal: 10,
    fontFamily: font.appSemi,
    fontSize: t.zoomSize,
    color: colors.textPrimary,
  },
  fit: {
    marginLeft: t.fitGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fitText: {
    marginLeft: t.fitIconGap,
    fontFamily: font.appSemi,
    fontSize: t.fitSize,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  page: {
    marginTop: t.pageGap,
    borderRadius: t.pageRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.pageBorder,
    padding: t.pagePad,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  form: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.formSize,
    letterSpacing: t.formSpacing,
    color: ink.accent,
  },
  reg: {
    marginLeft: 8,
    fontFamily: font.mono,
    fontSize: t.regSize,
    color: colors.textBody,
  },
  docTitle: {
    marginTop: t.docTitleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.docTitleSize,
    lineHeight: t.docTitleLineHeight,
    color: colors.textPrimary,
  },
  docSub: {
    marginTop: t.docSubGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    color: colors.textBody,
  },
  rule: {
    marginTop: t.docRuleGap,
    height: 1,
    backgroundColor: colors.border,
  },
  docBody: {
    marginTop: t.docDateGap,
    fontFamily: font.appBody,
    fontSize: t.docBodySize,
    lineHeight: t.docBodyLineHeight,
    color: colors.textPrimary,
  },
  para: {
    marginTop: t.docParaGap,
  },
  recital: {
    marginTop: t.recitalGap,
    borderRadius: t.recitalRadius,
    backgroundColor: t.recitalBg,
    paddingHorizontal: t.recitalPad,
    paddingBottom: t.recitalPad,
  },
  signRow: {
    marginTop: t.signGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  signDot: {
    width: t.signDot,
    height: t.signDot,
    borderRadius: t.signDot / 2,
    marginRight: t.signDotGap,
    backgroundColor: t.signColour,
  },
  signText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.signSize,
    color: colors.textPrimary,
  },
  pageNo: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.pageNoSize,
    color: colors.textBody,
  },
  pagesRow: {
    marginTop: t.pagesGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagesLabel: {
    fontFamily: font.appSemi,
    fontSize: t.pagesLabelSize,
    letterSpacing: t.pagesLabelSpacing,
    color: colors.textMuted,
  },
  pageButtons: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: t.pagesColGap,
  },
  pageBtn: {
    width: t.pageBtn,
    height: t.pageBtn,
    borderRadius: t.pageBtnRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.pageBtnBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pageBtnText: {
    fontFamily: font.appSemi,
    fontSize: t.pageBtnSize,
    color: colors.textPrimary,
  },
  pageBtnTextOn: {
    color: ink.onBrand,
  },
  card: {
    marginTop: t.infoGap,
    borderRadius: t.infoRadius,
    backgroundColor: colors.card,
    padding: t.infoPad,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.infoIconGap,
    fontFamily: font.appHeading,
    fontSize: t.infoTitleSize,
    color: colors.textPrimary,
  },
  vaultChip: {
    marginLeft: 8,
    minHeight: t.infoChipHeight,
    borderRadius: t.infoChipRadius,
    paddingHorizontal: t.infoChipPadX,
    backgroundColor: t.infoChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultChipText: {
    marginLeft: t.infoChipIconGap,
    fontFamily: font.appSemi,
    fontSize: t.infoChipSize,
    color: t.infoChipText,
  },
  infoGrid: {
    marginTop: t.infoRowGap,
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontFamily: font.appBody,
    fontSize: t.infoLabelSize,
    color: colors.textBody,
  },
  infoValue: {
    marginTop: t.infoValueGap,
    fontFamily: font.appHeading,
    fontSize: t.infoValueSize,
    color: colors.textPrimary,
  },
  infoMono: {
    fontFamily: font.mono,
  },
  relatedIcon: {
    width: t.relatedIcon,
    height: t.relatedIcon,
    borderRadius: t.relatedIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterChip: {
    marginLeft: 8,
    minHeight: t.relatedChipHeight,
    borderRadius: t.relatedChipRadius,
    paddingHorizontal: t.relatedChipPadX,
    backgroundColor: t.relatedChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matterChipText: {
    fontFamily: font.appSemi,
    fontSize: t.relatedChipSize,
    color: t.relatedChipText,
  },
  relatedBox: {
    marginTop: t.relatedBoxGap,
    borderRadius: t.relatedBoxRadius,
    backgroundColor: t.relatedBoxBg,
    padding: t.relatedBoxPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedText: {
    flex: 1,
    minWidth: 0,
  },
  relatedLabel: {
    fontFamily: font.appSemi,
    fontSize: t.relatedLabelSize,
    letterSpacing: t.relatedLabelSpacing,
    color: ink.accent,
  },
  relatedName: {
    marginTop: t.relatedNameGap,
    fontFamily: font.appHeading,
    fontSize: t.relatedNameSize,
    color: colors.textPrimary,
  },
  relatedCounsel: {
    marginTop: t.relatedCounselGap,
    fontFamily: font.appBody,
    fontSize: t.relatedCounselSize,
    color: colors.textBody,
  },
  relatedChevron: {
    marginLeft: 10,
    width: t.relatedChevron,
    height: t.relatedChevron,
    borderRadius: t.relatedChevron / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    marginTop: t.actionsGap,
    flexDirection: 'row',
    gap: t.actionsColGap,
  },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutline: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.actionBorder,
  },
  actionFilled: {
    backgroundColor: colors.brand,
  },
  actionClose: {
    backgroundColor: t.closeBg,
  },
  actionLabel: {
    marginLeft: t.actionGlyphGap,
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  actionLabelOn: {
    color: ink.onBrand,
  },
});
