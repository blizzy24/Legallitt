import { Globe, Mail } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';


import AiFlowerMark from './AiFlowerMark';
import { shrinkToFit } from '../constants/textFit';
import { ADV_NOTICE_RESPONSE } from '../data/advocateSide';
import { advNoticeResponse as t, colors, font } from '../constants/theme';

/** The supplied Legalitt wordmark — the typeface is not in the project, so it is an image. */
const WORDMARK = require('../assets/legalitt-wordmark-white.png');

// The printed legal document page, shared by design/189 (Legal Notice) and
// design/209 (Property Search Report).
//
// ⚠ IT GENERALISES BECAUSE design/209 IS A COPY OF design/189. The two exports are
// identical below the title: the same letterhead, the same ruled form, the same
// five numbered clauses, the same civil-proceedings paragraph, the same sign-off and
// the same disclaimer. design/209 changes ONE WORD — the document title — so the
// property search report still reads "I hereby serve upon you this Legal Notice as
// under", "Therefore, Through this Legal Notice, I call upon you to" and "A copy of
// this Notice has been preserve in my office".
//
// So the body below is the LEGAL NOTICE form in both cases. A property search report
// has no form of its own anywhere in the designs. The `title` prop is the only
// difference the designs actually express.
//
// ⚠ The letterhead reads "GURNEET CHAWLA ADVOCATE" — see the name conflict noted in
// data/advocateSide.ts.

/** A ruled blank, as the printed form draws it. */
function Blank({ flex, width }: { flex?: number; width?: number }) {
  return <View style={[styles.blank, flex ? { flex } : null, width ? { width } : null]} />;
}

export default function LegalDocumentPage({ title, advocateName }: { title: string; advocateName?: string }) {
  const r = ADV_NOTICE_RESPONSE;
  return (
      <View style={styles.page}>
        <View style={styles.lh}>
          <View style={styles.lhLeft}>
            <View style={styles.lhBrandRow}>
              {/* The Legalitt mark in flat gold and the supplied wordmark, white on the
                  letterhead's black band (the black wordmark would not show on it). */}
              <AiFlowerMark size={t.lhMark} color={t.lhGold} />
              <Image
                source={WORDMARK}
                accessibilityLabel={r.letterhead.brand}
                style={styles.lhWordmark}
                resizeMode="contain"
              />
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
              {advocateName ?? r.letterhead.advocate}
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
          <Text style={styles.docTitle}>{title}</Text>
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
  );
}

const styles = StyleSheet.create({
  page: { borderRadius: t.pageRadius, backgroundColor: t.pageBg, overflow: 'hidden' },

  lh: { backgroundColor: t.lhBg, flexDirection: 'row', padding: t.lhPadX },
  lhLeft: { flex: 1, minWidth: 0, paddingRight: 8 },
  lhBrandRow: { flexDirection: 'row', alignItems: 'center' },
  lhWordmark: { marginLeft: t.lhMarkGap, width: t.lhWordmarkH * t.wordmarkAspect, height: t.lhWordmarkH },
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

});
