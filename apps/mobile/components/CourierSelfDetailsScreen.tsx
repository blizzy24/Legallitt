import { router, type Href } from 'expo-router';
import {
  Calendar,
  CircleCheck,
  Copy,
  Eye,
  FileText,
  Info,
  Link2,
  Lock,
  Plus,
  Send,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from './CourierHeader';
import { shrinkToFit } from '../constants/textFit';
import { CO_SELF_DETAILS } from '../data/courier';
import { courierSelfDetails as t, courierGreen as g, colors, font, ink } from '../constants/theme';
import { clientDocHref } from '../data/docLinks';

// Client — enter the courier details after sending the documents yourself
// (design/286).
//
// ⚠ Note 12 — drawn with placeholders throughout: [Delivery ID], [Courier
//   Name], [Tracking Number], [Courier Office], [Tracking Link], [Receipt
//   File], [Receiver Name], [Office Name], [Full Address], [City], [State],
//   [PIN], [Mobile Number], [Document Count] and [Document Name] x3. Sample
//   values are rendered in their place; all are listed in PLACEHOLDERS.
//
// STATIC, NOT WIRED, and more so than it looks:
//  · the fields are DISPLAY TEXT, not inputs. Nothing is typed, validated or
//    submitted; the grey lines are the export's placeholder strings.
//  · "Upload Receipt" opens no file picker, and the "[Receipt File] ·
//    Uploaded" row below it is drawn, not the result of an upload. The export
//    draws both at once.
//  · every Copy button, including "Copy Tracking Number", copies nothing.
//  · "Submit Delivery Details" advances to design/287 and submits nothing.
export type CourierDetailsActions = {
  values: string[]; expected: string; onField: (index: number, value: string) => void;
  onExpected: (value: string) => void; onSubmit: () => void; onBack: () => void;
  onReceipt: () => void; onViewReceipt: () => void; onViewDocuments: () => void;
  onCopyId: () => void; onCopyTracking: () => void;
  /** A message shown under a field, keyed by field index (6 is Expected Delivery). */
  fieldErrors?: Record<number, string>;
  /** Nothing is saved yet: the header card shows a truck, not a completed check. */
  headerPending?: boolean;
};
export function CourierSelfDetailsView({data = CO_SELF_DETAILS, actions}: {data?: typeof CO_SELF_DETAILS; actions?: CourierDetailsActions}) {
  const insets = useSafeAreaInsets();
  const d = data;
  const BAR_H = t.barPadTop + t.ctaH + t.footTop + 32 + t.barPadBottom;

  return (
    <View style={styles.screen}>
      <CourierHeader
        onBack={actions?.onBack}
        title={d.title}
        right={d.titlePill ?
          <View style={styles.titlePill}>
            <View style={styles.titleDot} />
            <Text style={styles.titlePillText}>{d.titlePill}</Text>
          </View> : undefined
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BAR_H + insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.cardFirst, styles.rowCard]}>
          <View style={[styles.sentCircle, actions?.headerPending && styles.sentCirclePending]}>
            {actions?.headerPending
              ? <Truck size={t.sentGlyph} color={t.inkMuted} strokeWidth={2} />
              : <CircleCheck size={t.sentGlyph} color={g.ink} strokeWidth={2} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.sentTitle} {...shrinkToFit(0.8)}>
              {d.sentTitle}
            </Text>
            <Text style={styles.sentBody}>{d.sentBody}</Text>
          </View>
        </View>

        {/* Empty-state rule throughout: a missing value takes its label (or row) with it. */}
        {d.idValue ? <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.idLabel} {...shrinkToFit(0.8)}>
              {d.idLabel}
            </Text>
            <Pressable onPress={actions?.onCopyId} style={styles.copy}>
              <Copy size={t.copyGlyph} color={t.inkMuted} strokeWidth={2} />
              <Text style={styles.copyText} {...shrinkToFit(0.8)}>
                {d.copy}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.idValue} {...shrinkToFit(0.8)}>
            {d.idValue}
          </Text>
          <View style={styles.idNoteRow}>
            <Info size={t.idNoteGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.idNote} {...shrinkToFit(0.8)}>
              {d.idNote}
            </Text>
          </View>
        </View> : null}

        <View style={styles.card}>
          <Text style={styles.formTitle} {...shrinkToFit(0.8)}>
            {d.formTitle}
          </Text>
          <Text style={styles.formSub} {...shrinkToFit(0.8)}>
            {d.formSub}
          </Text>
          {d.fields.map((f, index) => (
            <View key={f.label}>
              <Text style={styles.label} {...shrinkToFit(0.8)}>
                {f.label}
              </Text>
              <View style={styles.input}>
                {actions ? <TextInput accessibilityLabel={f.label} value={actions.values[index]} onChangeText={value => actions.onField(index, value)} placeholder={f.placeholder} style={[styles.inputText, {flex: 1, padding: 0}]} /> : <Text style={styles.inputText} {...shrinkToFit(0.8)}>{f.placeholder}</Text>}
                {f.icon === 'date' ? (
                  <Calendar size={t.inputGlyph} color={t.inkMuted} strokeWidth={2} />
                ) : null}
                {f.icon === 'link' ? (
                  <Link2 size={t.inputGlyph} color={t.inkMuted} strokeWidth={2} />
                ) : null}
              </View>
              {actions?.fieldErrors?.[index] ? <Text accessibilityRole="alert" style={styles.fieldError}>{actions.fieldErrors[index]}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle} {...shrinkToFit(0.8)}>
            {d.otherTitle}
          </Text>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              {d.expectedLabel}
            </Text>
            <View style={styles.flex} />
            <View style={styles.optional}>
              <Text style={styles.optionalText} {...shrinkToFit(0.8)}>
                {d.optional}
              </Text>
            </View>
          </View>
          <View style={styles.input}>
            {actions ? <TextInput accessibilityLabel={d.expectedLabel} value={actions.expected} onChangeText={actions.onExpected} placeholder={d.expectedPlaceholder} style={[styles.inputText, {flex: 1, padding: 0}]} /> : <Text style={styles.inputText} {...shrinkToFit(0.8)}>{d.expectedPlaceholder}</Text>}
            <Calendar size={t.inputGlyph} color={t.inkMuted} strokeWidth={2} />
          </View>
          {actions?.fieldErrors?.[6] ? <Text accessibilityRole="alert" style={styles.fieldError}>{actions.fieldErrors[6]}</Text> : null}

          <Text style={[styles.label, styles.receiptLabel]} {...shrinkToFit(0.8)}>
            {d.receiptLabel}
          </Text>
          <Pressable onPress={actions?.onReceipt} style={styles.upload}>
            <Plus size={t.uploadGlyph} color={t.inkMuted} strokeWidth={2.2} />
            <Text style={styles.uploadText} {...shrinkToFit(0.8)}>
              {d.upload}
            </Text>
          </Pressable>
          <Text style={styles.uploadNote} {...shrinkToFit(0.8)}>
            {d.uploadNote}
          </Text>
          {d.receiptFile ? <View style={styles.receipt}>
            <View style={styles.receiptTile}>
              <FileText size={t.receiptGlyph} color={t.inkMuted} strokeWidth={2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.receiptName} {...shrinkToFit(0.8)}>
                {d.receiptFile}
              </Text>
              <Text style={styles.receiptSub} {...shrinkToFit(0.8)}>
                {d.receiptStatus ? '✓ ' + d.receiptStatus : ''}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={actions?.onViewReceipt ?? (() => router.push(clientDocHref(d.receiptFile) as Href))}
              style={styles.receiptBtn}
            >
              <Text style={styles.receiptBtnText} {...shrinkToFit(0.8)}>
                {d.receiptView}
              </Text>
            </Pressable>
            <Pressable onPress={actions?.onReceipt} style={[styles.receiptBtn, styles.receiptBtnNext]}>
              <Text style={styles.receiptBtnText} {...shrinkToFit(0.8)}>
                {d.receiptReplace}
              </Text>
            </Pressable>
          </View> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.formTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.count}>
              <Text style={styles.countText} {...shrinkToFit(0.8)}>
                {d.docsCount}
              </Text>
            </View>
          </View>
          {d.docs.map((n, i) => (
            <View key={n} style={[styles.docRow, i === 0 ? styles.docRowFirst : styles.docRowNext]}>
              <FileText size={t.docRowGlyph} color={t.brand} strokeWidth={2} />
              <Text style={styles.docRowText} {...shrinkToFit(0.8)}>
                {n}
              </Text>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={actions?.onViewDocuments ?? (() => router.push(clientDocHref(d.docs[0]) as Href))}
            style={styles.viewDocs}
          >
            <Eye size={t.viewDocsGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.viewDocsText} {...shrinkToFit(0.8)}>
              {d.viewDocs}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.formTitle} {...shrinkToFit(0.8)}>
              {d.sendTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.saved}>
              <Text style={styles.savedText} {...shrinkToFit(0.8)}>
                {d.savedChip}
              </Text>
            </View>
          </View>
          <View style={styles.table}>
            {d.sendRows.filter((r) => r.value).map((r, i) => (
              <View key={r.label} style={[styles.tableRow, i > 0 && styles.tableRowNext]}>
                <Text style={styles.tableLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.tableValue} {...shrinkToFit(0.75)}>
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.lockRow}>
            <Lock size={t.lockGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.lockText} {...shrinkToFit(0.8)}>
              {d.sendNote}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.trackCard]}>
          <View style={styles.row}>
            <Truck size={t.trackGlyph} color={t.brand} strokeWidth={2} />
            <Text style={styles.trackTitle} {...shrinkToFit(0.8)}>
              {d.trackTitle}
            </Text>
          </View>
          <Text style={styles.trackBody}>{d.trackBody}</Text>
          {d.trackRows.some((r) => r.value) ? <>
          <View style={styles.trackBox}>
            {d.trackRows.filter((r) => r.value).map((r, i) => (
              <View key={r.label} style={[styles.tableRow, i > 0 && styles.trackRowNext]}>
                <Text style={styles.tableLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.tableValue} {...shrinkToFit(0.8)}>
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
          <Pressable onPress={actions?.onCopyTracking} style={styles.trackCopy}>
            <Copy size={t.copyGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.trackCopyText} {...shrinkToFit(0.8)}>
              {d.trackCopy}
            </Text>
          </Pressable>
          </> : null}
        </View>

        <View style={styles.imp}>
          <View style={styles.row}>
            <Info size={t.impGlyph} color={t.brand} strokeWidth={2} />
            <Text style={styles.impTitle} {...shrinkToFit(0.8)}>
              {d.impTitle}
            </Text>
          </View>
          {d.impItems.map((it, i) => (
            <View key={it} style={[styles.impItem, i === 0 ? styles.impItemFirst : styles.impItemNext]}>
              <View style={styles.impDot} />
              <Text style={styles.impItemText}>{it}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={actions?.onSubmit ?? (() => router.push('/courier/self/sent' as Href))}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Send size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
        <Text style={styles.foot}>{d.foot}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sentCirclePending: { backgroundColor: colors.iconChipBg },
  fieldError: { marginTop: 6, fontFamily: font.appBody, fontSize: 12.5, color: colors.danger },
  screen: { flex: 1, backgroundColor: t.bg },
  content: {},
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.9 },

  titlePill: {
    marginRight: 10,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 9,
    backgroundColor: '#DEF4EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: g.ink },
  titlePillText: { marginLeft: 5, fontFamily: font.appSemi, fontSize: 10.5, color: g.ink },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  cardFirst: { marginTop: t.cardTop },
  rowCard: { flexDirection: 'row' },

  sentCircle: {
    width: t.sentCircle,
    height: t.sentCircle,
    borderRadius: t.sentCircle / 2,
    backgroundColor: t.sentCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.sentGap,
  },
  sentTitle: { fontFamily: font.appHeading, fontSize: t.sentTitleSize, color: t.ink },
  sentBody: {
    marginTop: t.sentBodyTop,
    fontFamily: font.appBody,
    fontSize: t.sentBodySize,
    lineHeight: t.sentBodyLine,
    color: t.inkMuted,
  },

  idLabel: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.idLabelSize,
    letterSpacing: t.idLabelSpacing,
    color: t.inkMuted,
  },
  copy: {
    height: t.copyH,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: {
    marginLeft: t.copyGap,
    fontFamily: font.appBody,
    fontSize: t.copySize,
    color: t.inkMuted,
  },
  idValue: {
    marginTop: t.idValueTop,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: t.ink,
  },
  idNoteRow: { marginTop: t.idNoteTop, flexDirection: 'row', alignItems: 'center' },
  idNote: {
    marginLeft: t.idNoteGap,
    fontFamily: font.appBody,
    fontSize: t.idNoteSize,
    color: t.inkMuted,
  },

  formTitle: { fontFamily: font.appHeading, fontSize: t.formTitleSize, color: t.ink },
  formSub: {
    marginTop: t.formSubTop,
    fontFamily: font.appBody,
    fontSize: t.formSubSize,
    color: t.inkMuted,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    marginTop: t.labelTop,
    fontFamily: font.appHeading,
    fontSize: t.labelSize,
    color: t.ink,
  },
  receiptLabel: { marginTop: t.receiptLabelTop },
  input: {
    marginTop: t.inputTop,
    height: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: t.placeholder },

  optional: {
    marginTop: t.labelTop,
    height: t.optionalH,
    borderRadius: t.optionalRadius,
    paddingHorizontal: t.optionalPadX,
    backgroundColor: t.optionalBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionalText: { fontFamily: font.appBody, fontSize: t.optionalSize, color: t.inkMuted },

  upload: {
    marginTop: t.uploadTop,
    height: t.uploadH,
    borderRadius: t.uploadRadius,
    backgroundColor: t.boxBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginLeft: t.uploadGap,
    fontFamily: font.appSemi,
    fontSize: t.uploadSize,
    color: t.inkMuted,
  },
  uploadNote: {
    marginTop: t.uploadNoteTop,
    fontFamily: font.appBody,
    fontSize: t.uploadNoteSize,
    color: t.inkMuted,
  },
  receipt: {
    marginTop: t.receiptTop,
    height: t.receiptH,
    borderRadius: t.receiptRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.receiptPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptTile: {
    width: t.receiptTile,
    height: t.receiptTile,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.receiptGap,
  },
  receiptName: { fontFamily: font.appHeading, fontSize: t.receiptNameSize, color: t.ink },
  receiptSub: {
    marginTop: t.receiptSubTop,
    fontFamily: font.appBody,
    fontSize: t.receiptSubSize,
    color: g.ink,
  },
  receiptBtn: {
    height: t.receiptBtnH,
    borderRadius: t.receiptBtnRadius,
    paddingHorizontal: t.receiptBtnPadX,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBtnNext: { marginLeft: t.receiptBtnGap },
  receiptBtnText: { fontFamily: font.appSemi, fontSize: t.receiptBtnSize, color: t.ink },

  count: {
    height: t.countH,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: t.inkMuted },
  docRow: {
    height: t.docRowH,
    borderRadius: t.docRowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.docRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowFirst: { marginTop: t.docRowTop },
  docRowNext: { marginTop: t.docRowGap },
  docRowText: {
    flex: 1,
    marginLeft: t.docRowGap2,
    fontFamily: font.appBody,
    fontSize: t.docRowSize,
    color: t.inkMuted,
  },
  viewDocs: {
    marginTop: t.viewDocsTop,
    height: t.viewDocsH,
    borderRadius: t.viewDocsRadius,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDocsText: {
    marginLeft: t.viewDocsGap,
    fontFamily: font.appSemi,
    fontSize: t.viewDocsSize,
    color: t.ink,
  },

  saved: {
    height: t.savedH,
    borderRadius: t.savedRadius,
    paddingHorizontal: t.savedPadX,
    backgroundColor: t.savedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedText: { fontFamily: font.appSemi, fontSize: t.savedSize, color: t.savedInk },
  table: {
    marginTop: t.tableTop,
    borderRadius: t.tableRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.tablePadX,
    paddingVertical: t.tablePadY,
  },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  tableRowNext: { marginTop: t.tableRowGap },
  tableLabel: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.tableLabelSize,
    letterSpacing: t.tableLabelSpacing,
    color: t.inkMuted,
  },
  tableValue: { fontFamily: font.appHeading, fontSize: t.tableValueSize, color: t.ink },
  lockRow: { marginTop: t.lockTop, flexDirection: 'row', alignItems: 'center' },
  lockText: {
    marginLeft: t.lockGap,
    fontFamily: font.appBody,
    fontSize: t.lockSize,
    color: t.inkMuted,
  },

  trackCard: { backgroundColor: t.trackBg },
  trackTitle: {
    marginLeft: t.trackGap,
    fontFamily: font.appHeading,
    fontSize: t.trackTitleSize,
    color: t.ink,
  },
  trackBody: {
    marginTop: t.trackBodyTop,
    fontFamily: font.appBody,
    fontSize: t.trackBodySize,
    lineHeight: t.trackBodyLine,
    color: t.inkMuted,
  },
  trackBox: {
    marginTop: t.trackBoxTop,
    borderRadius: t.trackBoxRadius,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: t.trackBoxPadX,
    paddingVertical: t.trackBoxPadY,
  },
  trackRowNext: { marginTop: t.trackRowGap },
  trackCopy: {
    marginTop: t.trackCopyTop,
    height: t.trackCopyH,
    borderRadius: t.trackCopyRadius,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCopyText: {
    marginLeft: t.uploadGap,
    fontFamily: font.appSemi,
    fontSize: t.viewDocsSize,
    color: t.ink,
  },

  imp: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.impBg,
    paddingHorizontal: t.impPadX,
    paddingVertical: t.impPadY,
  },
  impTitle: {
    marginLeft: t.impGap,
    fontFamily: font.appHeading,
    fontSize: t.impTitleSize,
    color: '#55442D',
  },
  impItem: { flexDirection: 'row', alignItems: 'flex-start' },
  impItemFirst: { marginTop: t.impItemTop },
  impItemNext: { marginTop: t.impItemGap },
  impDot: {
    width: t.impDot,
    height: t.impDot,
    borderRadius: t.impDot / 2,
    backgroundColor: t.inkMuted,
    marginTop: 7,
    marginRight: t.impItemGapX,
  },
  impItemText: { flex: 1, fontFamily: font.appBody, fontSize: t.impItemSize, color: t.inkMuted },

  bar: {
    backgroundColor: t.cardBg,
    paddingTop: t.barPadTop,
    paddingHorizontal: t.padX,
  },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginLeft: t.ctaGap,
    fontFamily: font.appHeading,
    fontSize: t.ctaSize,
    color: ink.onBrand,
  },
  foot: {
    marginTop: t.footTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLine,
    color: t.inkMuted,
  },
});
