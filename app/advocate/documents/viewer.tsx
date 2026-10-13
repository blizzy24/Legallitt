import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  FileWarning,
  Folder,
  Lock,
  Maximize,
  MoreHorizontal,
  Share2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LegalDocumentPage from '../../../components/LegalDocumentPage';
import SegmentedControl from '../../../components/SegmentedControl';
import { DEV_PREVIEW_TOGGLES } from '../../../constants/dev';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_DOC_VIEWER } from '../../../data/advocateTools';
import { advDocViewer as t, colors, font, ink } from '../../../constants/theme';

// Advocate — document viewer (design/261 loaded, 262 error, 263 empty).
//
// ⚠ THE STATE SWITCHER IS OURS, NOT DRAWN. Unlike designs 219, 229 and 259 —
// where the client drew the switcher into the product — nothing in 261/262/263
// draws a control to move between them. It is a prototype affordance, so it is
// gated behind DEV_PREVIEW_TOGGLES and also reachable as ?state=error / empty.
//
// STATIC, NOT WIRED. There is no PDF renderer in this project and none was
// scoped. Zoom Out, Zoom In, Fit to Screen, Download, Share and More do
// nothing, and the pager does not page — "Page 1 of 5" is a drawn string. The
// document body is the printed form, drawn, not a rendered file.
//
// ⚠ Note 11 — the deliverable is blank. The file is "Divorce_Notice_Rahul.pdf"
// on a "Divorce Matter", and what renders is an EMPTY ruled LEGAL NOTICE
// template with "Reffrence Id" misspelled. Same break already flagged on
// designs 189 and 209; this is the third service to show it.
//
// ⚠ Note 12 — the error and empty states still draw the full toolbar and
// "Page 1 of 5" for a document that failed or does not exist. Built as drawn.
//
// REUSE: the document page is components/LegalDocumentPage, the same printed
// form designs 189 and 209 draw. Not rebuilt.

type ViewerState = 'loaded' | 'error' | 'empty';

const STATE_SEGMENTS: { key: ViewerState; label: string }[] = [
  { key: 'loaded', label: 'Loaded' },
  { key: 'error', label: 'Error' },
  { key: 'empty', label: 'Empty' },
];

const TOOL_ICONS = [ZoomOut, ZoomIn, Maximize, Download, Share2, MoreHorizontal];

export default function AdvocateDocumentViewerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ state?: string; name?: string; client?: string; matter?: string }>();
  const d = AT_DOC_VIEWER;
  // Opened from a document's "View" action (data/docLinks.ts): show that file's
  // name, client and matter over the drawn page. With no params, design/261's.
  // A row the opening screen did not supply is left out rather than showing
  // design/261's Rahul Sharma / Divorce Matter against another file.
  const linked = params.name !== undefined;
  const file = {
    ...d.file,
    name: params.name ?? d.file.name,
    clientValue: linked ? params.client : d.file.clientValue,
    caseValue: linked ? params.matter : d.file.caseValue,
  };
  const [state, setState] = useState<ViewerState>(
    params.state === 'error' ? 'error' : params.state === 'empty' ? 'empty' : 'loaded',
  );

  const blank = state === 'error' ? d.error : state === 'empty' ? d.empty : null;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/documents' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <EllipsisVertical size={t.kebabGlyph} color="#9A938A" strokeWidth={2.4} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.file}>
          <View style={styles.fileCol}>
            <Text style={styles.fileName} {...shrinkToFit(0.75)}>
              {file.name}
            </Text>
            {file.clientValue ? (
              <View style={styles.fileRow}>
                <Text style={styles.fileLabel}>{d.file.clientLabel}</Text>
                <Text style={styles.fileValue} {...shrinkToFit(0.8)}>
                  {file.clientValue}
                </Text>
              </View>
            ) : null}
            {file.caseValue ? (
              <View style={[styles.fileRow, { marginTop: t.fileRowGap }]}>
                <Text style={styles.fileLabel}>{d.file.caseLabel}</Text>
                <Text style={styles.fileValue} {...shrinkToFit(0.8)}>
                  {file.caseValue}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.lockCol}>
            <Lock size={t.lockGlyph} color="#1B1C1C" strokeWidth={2} />
            <Text style={styles.lockLabel}>{d.file.badge}</Text>
          </View>
        </View>

        <View style={styles.doc}>
          {blank ? (
            <View style={styles.state}>
              {state === 'error' ? (
                <FileWarning size={t.stateGlyph} color="#A98A68" strokeWidth={1.6} />
              ) : (
                <Folder size={t.stateGlyph} color="#A98A68" fill="#A98A68" strokeWidth={1.6} />
              )}
              <Text style={styles.stateTitle} {...shrinkToFit(0.8)}>
                {blank.title}
              </Text>
              <Text style={styles.stateBody}>{blank.body}</Text>
              <View style={styles.stateCta}>
                <Text style={styles.stateCtaText} {...shrinkToFit(0.8)}>
                  {blank.cta}
                </Text>
              </View>
              <View style={styles.stateTail} />
            </View>
          ) : (
            <LegalDocumentPage title={d.documentTitle} />
          )}

          <View style={styles.pager}>
            <View style={styles.pagerBtn}>
              <ChevronLeft size={t.pagerGlyph} color={ink.accent} strokeWidth={2.2} />
            </View>
            <View style={styles.page}>
              <Text style={styles.pageText} {...shrinkToFit(0.8)}>
                {d.page}
              </Text>
            </View>
            <View style={styles.pagerBtn}>
              <ChevronRight size={t.pagerGlyph} color={ink.accent} strokeWidth={2.2} />
            </View>
          </View>

          <View style={styles.tools}>
            {d.tools.map((label, i) => {
              const Icon = TOOL_ICONS[i];
              return (
                <View key={label} style={styles.tool}>
                  <View style={styles.toolCircle}>
                    <Icon size={t.toolGlyph} color={ink.accent} strokeWidth={2} />
                  </View>
                  <Text style={styles.toolLabel} {...shrinkToFit(0.75)}>
                    {label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Development only — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
            No design draws this control; see the header comment. */}
        {DEV_PREVIEW_TOGGLES ? (
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Preview state</Text>
            <SegmentedControl segments={STATE_SEGMENTS} value={state} onChange={setState} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    height: t.headerH,
    backgroundColor: t.headerBg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },

  content: { paddingBottom: 26 },

  file: {
    marginTop: t.fileTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.fileRadius,
    paddingLeft: t.filePadLeft,
    paddingRight: t.filePadRight,
    paddingVertical: t.filePadY,
  },
  fileCol: { flex: 1 },
  fileName: { fontFamily: font.appHeading, fontSize: t.fileNameSize, color: '#1B1C1C' },
  fileRow: { marginTop: t.fileRowTop, flexDirection: 'row' },
  fileLabel: {
    width: t.fileLabelW,
    fontFamily: font.appHeading,
    fontSize: t.fileLabelSize,
    color: '#1B1C1C',
  },
  fileValue: { flex: 1, fontFamily: font.appBody, fontSize: t.fileValueSize, color: '#4D463D' },
  lockCol: { alignItems: 'center', marginLeft: 12 },
  lockLabel: {
    marginTop: t.lockLabelTop,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.lockLabelSize,
    lineHeight: t.lockLabelLine,
    color: '#1B1C1C',
  },

  doc: {
    marginTop: t.docTop,
    marginHorizontal: t.padX,
    backgroundColor: t.docBg,
    borderRadius: t.docRadius,
    paddingHorizontal: t.docPadX,
    paddingTop: t.docPadY,
    paddingBottom: t.docPadBottom,
    overflow: 'hidden',
  },

  state: { alignItems: 'center', paddingTop: t.stateTop },
  stateTitle: {
    marginTop: t.stateTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.stateTitleSize,
    color: '#1B1C1C',
  },
  stateBody: {
    marginTop: t.stateBodyTop,
    marginHorizontal: 30,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.stateBodySize,
    lineHeight: t.stateBodyLine,
    color: '#1B1C1C',
  },
  stateCta: {
    marginTop: t.stateCtaTop,
    height: t.stateCtaH,
    borderRadius: t.stateCtaRadius,
    paddingHorizontal: t.stateCtaPadX,
    backgroundColor: '#8C7050',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateCtaText: { fontFamily: font.appHeading, fontSize: t.stateCtaSize, color: ink.onBrand },
  stateTail: { height: t.stateTail },

  pager: {
    marginTop: t.pagerTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerBtn: {
    width: t.pagerBtn,
    height: t.pagerBtn,
    borderRadius: t.pagerBtn / 2,
    borderWidth: 1,
    borderColor: t.toolBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: t.pagerGap,
  },
  page: {
    width: t.pageW,
    height: t.pageH,
    borderRadius: t.pageRadius,
    borderWidth: 1,
    borderColor: t.toolBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageText: { fontFamily: font.appHeading, fontSize: t.pageSize, color: '#1B1C1C' },

  tools: {
    marginTop: t.toolsTop,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Content-sized columns, not flex:1. design/261 lets each label set its own
  // width — "Fit to Screen" is wider than an even sixth of the row — and spaces
  // the circles out to match. Equal columns would wrap that label.
  tool: { alignItems: 'center' },
  toolCircle: {
    width: t.toolCircle,
    height: t.toolCircle,
    borderRadius: t.toolCircle / 2,
    borderWidth: 1,
    borderColor: t.toolBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolLabel: {
    marginTop: t.toolLabelTop,
    fontFamily: font.appHeading,
    fontSize: t.toolLabelSize,
    color: '#1B1C1C',
  },

  toggle: { marginTop: 24, marginHorizontal: t.padX },
  toggleLabel: {
    marginBottom: 8,
    fontFamily: font.appSemi,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
