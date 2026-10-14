import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  ChevronDown,
  CircleCheck,
  CirclePlus,
  CircleQuestionMark,
  ClipboardList,
  CloudUpload,
  Eye,
  FileText,
  Folders,
  Gavel,
  Info,
  Landmark,
  Lightbulb,
  Lock,
  Paperclip,
  Scale,
  Send,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { font, hcPalette as c, hcPendingDetails as t, ink, shadow } from '../../../../constants/theme';
import { clientDocHref } from '../../../../data/docLinks';
import { HC_PENDING } from '../../../../data/highCourt';

// High Court — pending case details (design/330; design/336 is pixel-identical
// and is not a second route). Measured at 2.000 px/pt. Reached from "Pending
// Case" on design/291.
//
// Conflicts 4, 5, 6 and 9 are commented on HC_PENDING.
//
// Local only: the three text fields (prefilled as drawn). Case Type and Case
// Status are drawn as closed dropdowns with no option list, so they are static.
// STATIC, NOT WIRED: NOC upload — Replace and "+ Upload Additional NOC Page"
// pick nothing; View opens the client document viewer. Submit Case
// Verification opens design/331 (the shared ₹40,680 payment). "Continue to
// Documents" opens the upload screen, design/294 — the batch's only documents
// step; flagged.

export default function HighCourtPendingDetailsScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_PENDING;
  const [caseNo, setCaseNo] = useState(d.caseNumber);
  const [court, setCourt] = useState(d.court);
  const [adv, setAdv] = useState(d.adv);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/high-court/case-type' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.step}>
          <ClipboardList size={t.stepIcon} color={c.brownInk} strokeWidth={2.2} />
          <Text style={styles.stepText} {...shrinkToFit(0.75)}>
            {d.step}
          </Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={styles.trans}>
          <View style={styles.transDisc}>
            <Scale size={t.transGlyph} color={c.inkWarm} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.transTitle}>{d.transTitle}</Text>
            <Text style={styles.transBody}>{d.transBody}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.info]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <Gavel size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText}>{d.infoTitle}</Text>
            </View>
            <View style={styles.req}>
              <Text style={styles.reqText}>{d.required}</Text>
            </View>
          </View>

          <Text style={styles.label}>{d.caseNumberLabel}</Text>
          <View style={styles.field}>
            <TextInput value={caseNo} onChangeText={setCaseNo} style={styles.input} />
            <CircleCheck size={t.fieldIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
          </View>
          <View style={styles.hint}>
            <Lightbulb size={t.hintIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.hintText}>{d.caseNumberHint}</Text>
          </View>

          <Text style={styles.label}>{d.courtLabel}</Text>
          <View style={styles.field}>
            <TextInput value={court} onChangeText={setCourt} style={styles.input} />
            <Landmark size={t.fieldIcon} color={c.inkWarm} strokeWidth={1.8} />
          </View>

          <Text style={styles.label}>{d.typeLabel}</Text>
          {/* Static — no option list is drawn. */}
          <View style={styles.field}>
            <Text style={styles.fieldText}>{d.type}</Text>
            <ChevronDown size={t.fieldIcon} color={c.inkWarm} strokeWidth={2} />
          </View>

          <View style={[styles.between, styles.labelRow]}>
            <Text style={[styles.label, styles.labelInline]}>{d.advLabel}</Text>
            <Text style={styles.optional}>{d.optional}</Text>
          </View>
          <View style={styles.field}>
            <TextInput value={adv} onChangeText={setAdv} style={styles.input} />
          </View>
          <Text style={[styles.hintText, styles.help]}>{d.advHint}</Text>

          <Text style={styles.label}>{d.statusLabel}</Text>
          {/* Static — no option list is drawn. */}
          <View style={styles.field}>
            <Text style={styles.fieldText}>{d.status}</Text>
            <ChevronDown size={t.fieldIcon} color={c.inkWarm} strokeWidth={2} />
          </View>
        </View>

        <View style={[styles.card, styles.noc]}>
          <View style={styles.head}>
            <ShieldCheck size={t.headIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.headText} {...shrinkToFit(0.75)}>
              {d.nocTitle}
            </Text>
          </View>
          <Text style={styles.nocBody}>{d.nocBody}</Text>
          <View style={styles.nocInfo}>
            <CircleQuestionMark size={t.nocInfoIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.nocInfoText}>{d.nocInfo}</Text>
          </View>
          <View style={styles.file}>
            <View style={styles.fileTop}>
              <View style={styles.pdf}>
                <FileText size={t.pdfGlyph} color={c.removeRed} strokeWidth={2} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.fileName}>{d.nocFile}</Text>
                <Text style={styles.fileMeta}>{d.nocMeta}</Text>
              </View>
              <View style={styles.up}>
                <CircleCheck size={t.upIcon} color={c.greenUploaded} fill={c.greenDeep} strokeWidth={2} />
                <Text style={styles.upText}>{d.uploaded}</Text>
              </View>
            </View>
            <View style={styles.fileBtns}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(clientDocHref(d.nocFile) as Href)}
                style={styles.fileBtn}
              >
                <Eye size={t.fileBtnIcon} color={c.ink} strokeWidth={1.9} />
                <Text style={styles.fileBtnText}>{d.view}</Text>
              </Pressable>
              {/* Inert — no file picker. */}
              <View style={styles.fileBtn}>
                <CloudUpload size={t.fileBtnIcon} color={c.ink} strokeWidth={1.9} />
                <Text style={styles.fileBtnText}>{d.replace}</Text>
              </View>
            </View>
          </View>
          {/* Inert — no file picker. */}
          <View style={styles.add}>
            <CirclePlus size={t.addIcon} color={c.brownLift} strokeWidth={1.9} />
            <Text style={styles.addText}>{d.addNoc}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.other]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <Folders size={t.headIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.headText} {...shrinkToFit(0.8)}>
                {d.otherTitle}
              </Text>
            </View>
            <View style={styles.otherDot} />
          </View>
          <Text style={styles.nocBody}>{d.otherBody}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services/high-court/documents' as Href)}
            style={styles.cont}
          >
            <Paperclip size={t.contIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.contText}>{d.cont}</Text>
            <ArrowRight size={t.contIcon + 4} color={c.ink} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.priv}>
          <View style={styles.privDisc}>
            <Lock size={t.privGlyph} color={c.brown} fill={c.brown} strokeWidth={1.5} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.privTitle}>{d.privTitle}</Text>
            <Text style={styles.privBody}>{d.privBody}</Text>
          </View>
        </View>

        <View style={styles.review}>
          <Info size={t.reviewIcon} color={c.inkWarm} strokeWidth={2} />
          <Text style={styles.reviewText}>{d.review}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/pending/payment' as Href)}
          style={styles.cta}
        >
          <Send size={t.ctaIcon} color={ink.onBrand} strokeWidth={2} />
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.headGap },
  head: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.headGap },

  step: {
    marginTop: t.stepTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.stepH,
    borderRadius: t.stepH / 2,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peachPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepGap,
  },
  stepText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },

  trans: {
    marginTop: t.transTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.transPadX,
    paddingTop: t.transPadTop,
    paddingBottom: t.transPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.transGap,
  },
  transDisc: { width: t.transDisc, height: t.transDisc, borderRadius: t.transDisc / 2, backgroundColor: c.radioGrey, alignItems: 'center', justifyContent: 'center' },
  transTitle: { fontFamily: font.appSemi, fontSize: t.transTitleSize, lineHeight: t.transTitleLineHeight, color: c.ink },
  transBody: { fontFamily: font.appBody, fontSize: t.transBodySize, lineHeight: t.transBodyLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  info: { paddingTop: t.infoPadTop, paddingBottom: t.infoPadBottom },
  headText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  req: { height: t.reqH, borderRadius: t.reqH / 2, paddingHorizontal: t.reqPadX, backgroundColor: c.peachSelect, justifyContent: 'center' },
  reqText: { fontFamily: font.appBody, fontSize: t.reqSize, color: c.brown },
  label: { marginTop: t.labelTop, fontFamily: font.appSemi, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.ink },
  labelRow: { marginTop: t.labelTop },
  labelInline: { marginTop: 0, flexShrink: 1 },
  optional: { fontFamily: font.appBody, fontSize: t.optionalSize, color: c.inkWarm },
  field: {
    marginTop: t.fieldTop,
    height: t.fieldH,
    borderRadius: t.fieldRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.headGap,
  },
  input: { flex: 1, minWidth: 0, height: t.fieldH, fontFamily: font.appBody, fontSize: t.fieldSize, color: c.ink },
  fieldText: { flex: 1, fontFamily: font.appBody, fontSize: t.fieldSize, color: c.ink },
  hint: { marginTop: t.hintTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.hintGap, paddingRight: t.hintPadR },
  hintText: { flex: 1, fontFamily: font.appBody, fontSize: t.hintSize, lineHeight: t.hintLineHeight, color: c.inkWarm },
  help: { marginTop: t.helpTop, flex: 0 },

  noc: { paddingTop: t.nocPadTop, paddingBottom: t.nocPadBottom },
  nocBody: { marginTop: t.nocBodyTop, fontFamily: font.appBody, fontSize: t.nocBodySize, lineHeight: t.nocBodyLineHeight, color: c.inkWarm },
  nocInfo: {
    marginTop: t.nocInfoTop,
    borderRadius: t.nocInfoRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.nocInfoPadX,
    paddingVertical: t.nocInfoPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.nocInfoGap,
  },
  nocInfoText: { flex: 1, fontFamily: font.appBody, fontSize: t.nocInfoSize, lineHeight: t.nocInfoLineHeight, color: c.inkWarm },
  file: {
    marginTop: t.fileTop,
    borderRadius: t.fileRadius,
    backgroundColor: c.tileGrey,
    paddingHorizontal: t.filePadX,
    paddingTop: t.filePadTop,
    paddingBottom: t.filePadBottom,
  },
  fileTop: { flexDirection: 'row', alignItems: 'center', gap: t.fileGap },
  pdf: { width: t.pdf, height: t.pdf, borderRadius: t.pdfRadius, backgroundColor: c.pdfTile, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontFamily: font.appSemi, fontSize: t.fileNameSize, lineHeight: t.fileNameLineHeight, color: c.ink },
  fileMeta: { fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: c.inkWarm },
  up: {
    height: t.upH,
    borderRadius: t.upH / 2,
    paddingHorizontal: t.upPadX,
    backgroundColor: c.greenUploaded,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.upGap,
  },
  upText: { fontFamily: font.appSemi, fontSize: t.upSize, color: c.greenDeep },
  fileBtns: { marginTop: t.fileBtnsTop, flexDirection: 'row', justifyContent: 'flex-end', gap: t.fileBtnGap },
  fileBtn: {
    height: t.fileBtnH,
    borderRadius: t.fileBtnH / 2,
    paddingHorizontal: t.fileBtnPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fileBtnIconGap,
  },
  fileBtnText: { fontFamily: font.appSemi, fontSize: t.fileBtnSize, color: c.ink },
  add: {
    marginTop: t.addTop,
    height: t.addH,
    borderRadius: t.addRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.addGap,
  },
  addText: { fontFamily: font.appSemi, fontSize: t.addSize, color: c.brownLift },

  other: { paddingTop: t.otherPadTop, paddingBottom: t.otherPadBottom },
  otherDot: { width: t.otherDot, height: t.otherDot, borderRadius: t.otherDot / 2, backgroundColor: c.brown },
  cont: {
    marginTop: t.contTop,
    height: t.contH,
    borderRadius: t.contRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.contPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.contGap,
  },
  contText: { flex: 1, fontFamily: font.appSemi, fontSize: t.contSize, color: c.ink },

  priv: {
    marginTop: t.privTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.privPadX,
    paddingVertical: t.privPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.privGap,
  },
  privDisc: { width: t.privDisc, height: t.privDisc, borderRadius: t.privDisc / 2, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
  privTitle: { fontFamily: font.appSemi, fontSize: t.privTitleSize, lineHeight: t.privTitleLineHeight, color: c.ink },
  privBody: { fontFamily: font.appBody, fontSize: t.privBodySize, lineHeight: t.privBodyLineHeight, color: c.inkWarm },
  review: { marginTop: t.reviewTop, paddingHorizontal: t.reviewPadX, flexDirection: 'row', alignItems: 'center', gap: t.reviewGap },
  reviewText: { flex: 1, textAlign: 'center', fontFamily: font.appBody, fontSize: t.reviewSize, lineHeight: t.reviewLineHeight, color: c.ink },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaH / 2,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.ink },
});
