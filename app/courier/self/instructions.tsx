import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Copy,
  FileText,
  Folder,
  Info,
  ListOrdered,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { CO_SELF_INSTRUCTIONS } from '../../../data/courier';
import { courierSelfInstructions as t, font, ink } from '../../../constants/theme';

// Client — send the documents yourself (design/285), the second branch of
// design/284.
//
// ⚠ Note 12 — drawn with placeholders throughout the Send To block:
//   [Advocate Name], [Office / Chamber Name], [Full Office Address],
//   [Area / Locality], [City], [State], [PIN Code], [Mobile Number],
//   [Email Address], plus [Document Name] x3, [Date] and [Time]. Sample values
//   are rendered in their place; all are listed in PLACEHOLDERS.
//
// STATIC, NOT WIRED: every Copy button and "Copy All Details" copy nothing —
// no clipboard vendor is scoped for this batch. "View Documents" opens nothing.
// The "I have sent the physical documents" checkbox is real, because the
// Continue step has to be leaveable; nothing else responds to it.
export default function CourierSelfInstructionsScreen() {
  const d = CO_SELF_INSTRUCTIONS;
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} sub={d.sub} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}>
          <View style={styles.noticeCircle}>
            <Truck size={t.noticeGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.noticeTitle} {...shrinkToFit(0.8)}>
              {d.noticeTitle}
            </Text>
            <Text style={styles.noticeBody}>{d.noticeBody}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Building2 size={t.headGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.sendTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.tag}>
              <Text style={styles.tagText} {...shrinkToFit(0.8)}>
                {d.sendTag}
              </Text>
            </View>
          </View>
          {d.fields.map((f, i) => (
            <View key={f.label} style={[styles.field, i === 0 ? styles.fieldFirst : styles.fieldNext]}>
              <View style={styles.flex}>
                <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
                  {f.label}
                </Text>
                <Text style={styles.fieldValue} {...shrinkToFit(0.75)}>
                  {f.value}
                </Text>
              </View>
              <View style={styles.fieldCopy}>
                <Copy size={t.fieldCopyGlyph} color={t.inkMuted} strokeWidth={2} />
                <Text style={styles.fieldCopyText} {...shrinkToFit(0.8)}>
                  {d.copy}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.copyAll}>
            <Copy size={t.copyAllGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.copyAllText} {...shrinkToFit(0.8)}>
              {d.copyAll}
            </Text>
          </View>
          <Text style={styles.copyNote} {...shrinkToFit(0.8)}>
            {d.copyNote}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Folder size={t.headGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.docCount}>
              <Text style={styles.docCountText} {...shrinkToFit(0.8)}>
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
              <CircleCheck size={t.docCheckGlyph} color="#B9B2AB" strokeWidth={2} />
            </View>
          ))}
          <Text style={styles.viewDocs} {...shrinkToFit(0.8)}>
            {d.viewDocs}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <ListOrdered size={t.headGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.howTitle}
            </Text>
          </View>
          {d.steps.map((s, i) => (
            <View key={s.title} style={[styles.step, i === 0 ? styles.stepFirst : styles.stepNext]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{String(i + 1)}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepSub}>{s.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.anyCard]}>
          <View style={styles.anyCircle}>
            <Truck size={t.anyGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.anyTitle} {...shrinkToFit(0.8)}>
              {d.anyTitle}
            </Text>
            <Text style={styles.anyBody}>{d.anyBody}</Text>
            <Text style={styles.anySub}>{d.anySub}</Text>
          </View>
        </View>

        <View style={styles.imp}>
          <View style={styles.impCircle}>
            <Info size={t.impGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.impTitle} {...shrinkToFit(0.8)}>
              {d.impTitle}
            </Text>
            {d.impItems.map((it, i) => (
              <View key={it} style={[styles.impItem, i === 0 ? styles.impItemFirst : styles.impItemNext]}>
                <Check size={t.impTickGlyph} color={t.inkMuted} strokeWidth={2.4} />
                <Text style={styles.impItemText}>{it}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.askTitle} {...shrinkToFit(0.8)}>
            {d.askTitle}
          </Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: sent }}
            accessibilityLabel={d.askCheck}
            onPress={() => setSent((v) => !v)}
            style={({ pressed }) => [styles.askRow, pressed && styles.pressed]}
          >
            <View style={[styles.askBox, sent && styles.askBoxOn]}>
              {sent ? <Check size={t.askGlyph} color={ink.onBrand} strokeWidth={3} /> : null}
            </View>
            <Text style={styles.askText}>{d.askCheck}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.sentCard]}>
          {d.sentRows.map((r, i) => (
            <View key={r.label} style={[styles.sentRow, i > 0 && styles.sentRowNext]}>
              <Text style={styles.sentLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={styles.sentValue} {...shrinkToFit(0.8)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/courier/self/details' as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.bottomPad },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.9 },

  notice: {
    marginTop: t.noticeTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.noticeBg,
    paddingHorizontal: t.noticePadX,
    paddingVertical: t.noticePadY,
    flexDirection: 'row',
  },
  noticeCircle: {
    width: t.noticeCircle,
    height: t.noticeCircle,
    borderRadius: t.noticeCircle / 2,
    backgroundColor: t.noticeCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noticeGap,
  },
  noticeTitle: { fontFamily: font.appHeading, fontSize: t.noticeTitleSize, color: t.ink },
  noticeBody: {
    marginTop: t.noticeBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noticeBodySize,
    lineHeight: t.noticeBodyLine,
    color: t.inkMuted,
  },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headTitle: {
    marginLeft: t.headGap,
    fontFamily: font.appHeading,
    fontSize: t.headSize,
    color: t.ink,
  },
  tag: {
    height: t.tagH,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    letterSpacing: t.tagSpacing,
    color: t.inkMuted,
  },

  field: {
    borderRadius: t.fieldRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.fieldPadX,
    paddingVertical: t.fieldPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldFirst: { marginTop: t.fieldTop },
  fieldNext: { marginTop: t.fieldGap },
  fieldLabel: { fontFamily: font.appBody, fontSize: t.fieldLabelSize, color: t.inkMuted },
  fieldValue: {
    marginTop: t.fieldValueTop,
    fontFamily: font.appHeading,
    fontSize: t.fieldValueSize,
    color: t.ink,
  },
  fieldCopy: {
    marginLeft: 10,
    height: t.fieldCopyH,
    borderRadius: t.fieldCopyRadius,
    paddingHorizontal: t.fieldCopyPadX,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldCopyText: {
    marginLeft: t.fieldCopyGap,
    fontFamily: font.appBody,
    fontSize: t.fieldCopySize,
    color: t.inkMuted,
  },
  copyAll: {
    marginTop: t.copyAllTop,
    height: t.copyAllH,
    borderRadius: t.copyAllRadius,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyAllText: {
    marginLeft: t.copyAllGap,
    fontFamily: font.appSemi,
    fontSize: t.copyAllSize,
    color: t.inkMuted,
  },
  copyNote: {
    marginTop: t.copyNoteTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.copyNoteSize,
    color: t.inkMuted,
  },

  docCount: {
    height: t.docCountH,
    borderRadius: t.docCountRadius,
    paddingHorizontal: t.docCountPadX,
    backgroundColor: t.docCountBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCountText: { fontFamily: font.appSemi, fontSize: t.docCountSize, color: t.docCountInk },
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
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.viewDocsSize,
    color: t.brand,
  },

  step: { flexDirection: 'row' },
  stepFirst: { marginTop: t.stepTop },
  stepNext: { marginTop: t.stepGap },
  stepNum: {
    width: t.stepNum,
    height: t.stepNum,
    borderRadius: t.stepNum / 2,
    backgroundColor: t.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.stepGapX,
  },
  stepNumText: { fontFamily: font.appHeading, fontSize: t.stepNumSize, color: ink.onBrand },
  stepTitle: {
    fontFamily: font.appHeading,
    fontSize: t.stepTitleSize,
    lineHeight: t.stepTitleLine,
    color: t.ink,
  },
  stepSub: {
    marginTop: t.stepSubTop,
    fontFamily: font.appBody,
    fontSize: t.stepSubSize,
    lineHeight: t.stepSubLine,
    color: t.inkMuted,
  },

  anyCard: { flexDirection: 'row' },
  anyCircle: {
    width: t.anyGlyphCircle,
    height: t.anyGlyphCircle,
    borderRadius: t.anyGlyphCircle / 2,
    backgroundColor: t.noticeCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.anyGap,
  },
  anyTitle: { fontFamily: font.appHeading, fontSize: t.anyTitleSize, color: t.ink },
  anyBody: {
    marginTop: t.anyBodyTop,
    fontFamily: font.appBody,
    fontSize: t.anyBodySize,
    lineHeight: t.anyBodyLine,
    color: t.inkMuted,
  },
  anySub: {
    marginTop: t.anySubTop,
    fontFamily: font.appBody,
    fontSize: t.anySubSize,
    lineHeight: t.anySubLine,
    color: t.inkMuted,
  },

  imp: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.impBg,
    paddingHorizontal: t.impPadX,
    paddingVertical: t.impPadY,
    flexDirection: 'row',
  },
  impCircle: {
    width: t.impCircle,
    height: t.impCircle,
    borderRadius: t.impCircle / 2,
    backgroundColor: t.impCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.impGap,
  },
  impTitle: { fontFamily: font.appHeading, fontSize: t.impTitleSize, color: t.inkMuted },
  impItem: { flexDirection: 'row' },
  impItemFirst: { marginTop: t.impItemTop },
  impItemNext: { marginTop: t.impItemGap },
  impItemText: {
    flex: 1,
    marginLeft: t.impItemGapX,
    fontFamily: font.appBody,
    fontSize: t.impItemSize,
    lineHeight: t.impItemLine,
    color: t.inkMuted,
  },

  askTitle: { fontFamily: font.appHeading, fontSize: t.askTitleSize, color: t.ink },
  askRow: { marginTop: t.askCheckTop, flexDirection: 'row' },
  askBox: {
    width: t.askBox,
    height: t.askBox,
    borderRadius: t.askBoxRadius,
    borderWidth: 1.5,
    borderColor: t.askBoxBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.askGapX,
    marginTop: 1,
  },
  askBoxOn: { backgroundColor: t.brand, borderColor: t.brand },
  askText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.askSize,
    lineHeight: t.askLine,
    color: t.ink,
  },

  sentCard: { backgroundColor: t.boxBg },
  sentRow: { flexDirection: 'row', alignItems: 'center' },
  sentRowNext: { marginTop: t.sentRowGap },
  sentLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.sentLabelSize, color: t.inkMuted },
  sentValue: { fontFamily: font.appSemi, fontSize: t.sentValueSize, color: t.ink },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginRight: t.ctaGap,
    fontFamily: font.appHeading,
    fontSize: t.ctaSize,
    color: ink.onBrand,
  },
});
