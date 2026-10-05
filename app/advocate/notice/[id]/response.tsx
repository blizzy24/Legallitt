import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bold,
  ChevronDown,
  ChevronLeft,
  EllipsisVertical,
  Globe,
  Italic,
  List,
  ListOrdered,
  Mail,
  Redo2,
  Underline,
  Undo2,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AiFlowerMark from '../../../../components/AiFlowerMark';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_RESPONSE } from '../../../../data/advocateSide';
import { advNoticeResponse as t, colors, font, ink } from '../../../../constants/theme';

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

/** A ruled blank, as the printed form draws it. */
function Blank({ flex, width }: { flex?: number; width?: number }) {
  return <View style={[styles.blank, flex ? { flex } : null, width ? { width } : null]} />;
}

export default function AdvocateNoticeResponseScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_NOTICE_RESPONSE;

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

          <View style={styles.page}>
            <View style={styles.lh}>
              <View style={styles.lhLeft}>
                <View style={styles.lhBrandRow}>
                  <AiFlowerMark size={t.lhMark} colors={[t.lhGold, '#8A6E1A']} />
                  <Text style={styles.lhBrand} {...shrinkToFit(0.8)}>
                    {r.letterhead.brand}
                  </Text>
                </View>
                <Text style={styles.lhFirm} {...shrinkToFit(0.7)}>
                  {r.letterhead.firm}
                </Text>
                <View style={styles.lhLine}>
                  <Mail size={t.lhIcon} color={t.lhGold} />
                  <Text style={styles.lhContact} {...shrinkToFit(0.65)}>
                    {r.letterhead.email}
                  </Text>
                </View>
                <View style={styles.lhLine}>
                  <Globe size={t.lhIcon} color={t.lhGold} />
                  <Text style={styles.lhContact} {...shrinkToFit(0.7)}>
                    {r.letterhead.web}
                  </Text>
                </View>
              </View>
              <View style={styles.lhDivider} />
              <View style={styles.lhRight}>
                <Text style={styles.lhAdv} {...shrinkToFit(0.65)}>
                  {r.letterhead.advocate}
                </Text>
                <Text style={styles.lhQual} {...shrinkToFit(0.75)}>
                  {r.letterhead.quals}
                </Text>
                <Text style={styles.lhEnrol} {...shrinkToFit(0.7)}>
                  {r.letterhead.enrolment}{' '}
                  <Text style={styles.lhEnrolNo}>{r.letterhead.enrolmentNo}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.lhRule} />

            <View style={styles.doc}>
              <Text style={styles.docTitle}>{r.docTitle}</Text>
              <View style={styles.docTitleRule} />

              <View style={styles.row}>
                <Text style={styles.label}>{r.refLabel}</Text>
                <Blank width={52} />
                <Text style={styles.label}>{r.refSuffix}</Text>
                <Blank width={44} />
                <View style={styles.spacer} />
                <Text style={styles.label}>{r.dateLabel}</Text>
                <Blank width={78} />
              </View>

              <View style={styles.toRow}>
                <Text style={styles.label}>{r.toLabel}</Text>
                <View style={styles.toLines}>
                  {Array.from({ length: r.toLines }).map((_, i) => (
                    <Blank key={i} width={148} />
                  ))}
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>{r.subjectLabel}</Text>
                <Blank flex={1} />
              </View>

              <Text style={styles.body}>
                {r.intro[0]}
                <Text style={styles.inlineBlank}>__________</Text>
                {r.intro[1]}
                <Text style={styles.inlineBlank}>________</Text>
                {r.intro[2]}
                <Text style={styles.inlineBlank}>_____</Text>
                {r.intro[3]}
                <Text style={styles.inlineBlank}>__________</Text>
                {r.intro[4]}
              </Text>

              {Array.from({ length: r.clauses }).map((_, i) => (
                <View key={i} style={styles.clause}>
                  <Text style={styles.clauseN}>{i + 1}.</Text>
                  <Blank flex={1} />
                </View>
              ))}

              <Text style={styles.bodyNext}>{r.thereforeLine}</Text>
              {r.thereforeItems.map((item) => (
                <Text key={item} style={styles.item}>
                  {item}
                </Text>
              ))}

              <Text style={styles.bodyNext}>
                {r.failing.lead}
                <Text style={styles.bold}>{r.failing.boldA}</Text>
                {r.failing.mid}
                <Text style={styles.bold}>{r.failing.boldB}</Text>
                {r.failing.tail}
              </Text>
              <View style={styles.row}>
                <Blank flex={1} />
                <Text style={styles.body}>{r.failing.further}</Text>
              </View>
              <Text style={styles.body}>
                <Text style={styles.inlineBlank}>________</Text>
                {r.failing.cost}
              </Text>

              <Text style={styles.bodyNext}>{r.copyLine}</Text>

              <View style={styles.signBlock}>
                <Text style={styles.signFor}>{r.signFor}</Text>
                <Text style={styles.signFirm}>{r.signFirm}</Text>
              </View>

              <View style={styles.footRow}>
                <View style={styles.footLeft}>
                  <View style={styles.row}>
                    <Text style={styles.labelBold}>{r.placeLabel}</Text>
                    <Blank width={108} />
                  </View>
                  <View style={styles.rowNext}>
                    <Text style={styles.labelBold}>{r.signDateLabel}</Text>
                    <Blank width={108} />
                  </View>
                </View>
                <View style={styles.footSign}>
                  <Blank width={92} />
                </View>
              </View>
            </View>

            <View style={styles.discRule} />
            <View style={styles.disc}>
              <Text style={styles.discText}>{r.disclaimer}</Text>
            </View>
          </View>

          <View style={styles.btns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/advocate/notice/${id}/draft` as Href)}
              style={({ pressed }) => [styles.btn, styles.edit, pressed && styles.pressed]}
            >
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {r.editDraft}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.save, pressed && styles.pressed]}
            >
              <Text style={styles.saveText} {...shrinkToFit(0.75)}>
                {r.saveUpload}
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/review` as Href)}
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
    paddingVertical: t.toolPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolBlock: { flexDirection: 'row', alignItems: 'center' },
  toolBlockText: { fontFamily: font.appBody, fontSize: t.toolBlockSize, color: colors.textPrimary },
  toolChevron: { marginLeft: t.toolChevronGap },
  toolIcon: { marginLeft: t.toolGapX },
  toolUndo: { marginLeft: 'auto' },

  page: { borderRadius: t.pageRadius, backgroundColor: t.pageBg, overflow: 'hidden' },

  lh: { backgroundColor: t.lhBg, flexDirection: 'row', padding: t.lhPadX },
  lhLeft: { flex: 1, minWidth: 0, paddingRight: 8 },
  lhBrandRow: { flexDirection: 'row', alignItems: 'center' },
  lhBrand: { marginLeft: t.lhMarkGap, fontFamily: font.appHeading, fontSize: t.lhBrandSize, color: t.lhText },
  lhFirm: { marginTop: t.lhFirmGap, fontFamily: font.appBody, fontSize: t.lhFirmSize, color: t.lhGold },
  lhLine: { marginTop: t.lhLineGap, flexDirection: 'row', alignItems: 'center' },
  lhContact: {
    marginLeft: t.lhIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lhContactSize,
    color: t.lhDim,
  },
  lhDivider: { width: t.lhDividerW, backgroundColor: t.lhGold },
  lhRight: { flex: 1, minWidth: 0, paddingLeft: 8, alignItems: 'center', justifyContent: 'center' },
  lhAdv: { fontFamily: font.appHeading, fontSize: t.lhAdvSize, color: t.lhText, textAlign: 'center' },
  lhQual: { marginTop: t.lhQualGap, fontFamily: font.appBody, fontSize: t.lhQualSize, color: t.lhDim },
  lhEnrol: { marginTop: t.lhEnrolGap, fontFamily: font.appBody, fontSize: t.lhEnrolSize, color: t.lhDim },
  lhEnrolNo: { color: t.lhGold },
  lhRule: { height: 2, backgroundColor: t.lhRule },

  doc: { paddingHorizontal: t.docPadX, paddingVertical: t.docPadY },
  docTitle: {
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.docTitleSize,
    color: colors.textPrimary,
  },
  docTitleRule: {
    alignSelf: 'center',
    marginTop: t.docTitleRuleGap,
    width: t.docTitleRuleW,
    height: 1,
    backgroundColor: t.docRule,
  },

  row: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'flex-end' },
  rowNext: { marginTop: 8, flexDirection: 'row', alignItems: 'flex-end' },
  spacer: { flex: 1 },
  label: { marginRight: 5, fontFamily: font.appBody, fontSize: t.labelSize, color: colors.textPrimary },
  labelBold: { marginRight: 6, fontFamily: font.appHeading, fontSize: t.labelSize, color: colors.textPrimary },
  blank: { height: t.blankH, marginBottom: 2, marginRight: 5, backgroundColor: t.blankColour },

  toRow: { marginTop: t.rowGap, flexDirection: 'row' },
  toLines: { marginLeft: 8, gap: 10 },

  body: {
    marginTop: t.rowGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },
  bodyNext: {
    marginTop: t.sectionGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },
  inlineBlank: { color: colors.textPrimary },
  bold: { fontFamily: font.appHeading },
  clause: { marginTop: t.clauseGap, flexDirection: 'row', alignItems: 'flex-end' },
  clauseN: { marginRight: 5, fontFamily: font.appBody, fontSize: t.bodySize, color: colors.textPrimary },
  item: { marginTop: t.clauseGap, fontFamily: font.appBody, fontSize: t.bodySize, color: colors.textPrimary },

  signBlock: { marginTop: t.sectionGap, alignItems: 'center' },
  signFor: { fontFamily: font.appBody, fontSize: t.bodySize, color: colors.textPrimary },
  signFirm: { marginTop: 3, fontFamily: font.appHeading, fontSize: t.bodySize + 1, color: colors.textPrimary },
  footRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'flex-end' },
  footLeft: { flex: 1, minWidth: 0 },
  footSign: { justifyContent: 'flex-end' },

  discRule: { height: 2, backgroundColor: t.lhRule },
  disc: { paddingHorizontal: t.discPadX, paddingVertical: t.discPadY, backgroundColor: t.discBg },
  discText: {
    fontFamily: font.appBody,
    fontSize: t.discSize,
    lineHeight: t.discLineHeight,
    color: t.discColour,
  },

  btns: { marginTop: t.btnGap, flexDirection: 'row', gap: t.btnGapX },
  btn: {
    flex: 1,
    minWidth: 0,
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
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
