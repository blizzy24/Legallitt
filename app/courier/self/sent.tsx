import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Info,
  Phone,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CourierHeader from '../../../components/CourierHeader';
import CourierTimeline from '../../../components/CourierTimeline';
import { shrinkToFit } from '../../../constants/textFit';
import { CO_SELF_SENT } from '../../../data/courier';
import { courierSelfSent as t, courierGreen as g, font, ink } from '../../../constants/theme';

// Client — documents sent, self-send branch complete (design/287).
//
// Third and last screen on components/CourierTimeline, and the one that pairs
// a status pill with the tracker.
//
// ⚠ Note 12 — drawn with placeholders: [Delivery ID], [Courier Name],
//   [Tracking Number], [Courier Office], [Tracking Link], [Advocate Name],
//   [Office Name], [Full Address], [City], [State], [PIN], [Mobile Number],
//   [Document Count], [Document Name] x3, [Date] and [Receipt File]. Sample
//   values rendered; all listed in PLACEHOLDERS.
//
// STATIC, NOT WIRED: the Copy button, the tracking link and "View Receipt" all
// do nothing — no clipboard vendor and no file viewer is scoped. "Back to home"
// returns to the dashboard.
export default function CourierSelfSentScreen() {
  const d = CO_SELF_SENT;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        right={
          <View style={styles.titlePill}>
            <View style={styles.titleDot} />
            <Text style={styles.titlePillText}>{d.titlePill}</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.heroCircle}>
            <Check size={t.heroGlyph} color={g.ink} strokeWidth={3} />
          </View>
          <Text style={styles.heroTitle} {...shrinkToFit(0.8)}>
            {d.heroTitle}
          </Text>
          <Text style={styles.heroBody} {...shrinkToFit(0.8)}>
            {d.heroBody}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.idLabel} {...shrinkToFit(0.8)}>
            {d.idLabel}
          </Text>
          <View style={styles.row}>
            <Text style={styles.idValue} {...shrinkToFit(0.8)}>
              {d.idValue}
            </Text>
            <View style={styles.flex} />
            <View style={styles.copy}>
              <Copy size={t.copyGlyph} color={t.inkMuted} strokeWidth={2} />
              <Text style={styles.copyText} {...shrinkToFit(0.8)}>
                {d.copy}
              </Text>
            </View>
          </View>
          <View style={styles.idNoteRow}>
            <Info size={t.idNoteGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.idNote} {...shrinkToFit(0.8)}>
              {d.idNote}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.head} {...shrinkToFit(0.8)}>
            {d.courierTitle}
          </Text>
          {d.courierRows.map((r, i) => (
            <View key={r.label} style={[styles.dataRow, i === 0 ? styles.dataRowFirst : styles.dataRowNext]}>
              <Text style={styles.dataLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={[styles.dataValue, r.link && styles.linkValue]} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
              {r.copy ? (
                <Copy size={t.rowCopyGlyph} color={t.inkMuted} strokeWidth={2} style={styles.rowTrail} />
              ) : null}
              {r.link ? (
                <ExternalLink size={t.rowLinkGlyph} color={t.brand} strokeWidth={2} style={styles.rowTrail} />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.head} {...shrinkToFit(0.8)}>
              {d.sendTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.saved}>
              <Text style={styles.savedText} {...shrinkToFit(0.8)}>
                {d.savedChip}
              </Text>
            </View>
          </View>
          <View style={styles.box}>
            <Text style={styles.boxLabel} {...shrinkToFit(0.8)}>
              {d.receiverLabel}
            </Text>
            <Text style={styles.boxValue} {...shrinkToFit(0.8)}>
              {d.receiverValue}
            </Text>
            <Text style={[styles.boxLabel, styles.boxLabelNext]} {...shrinkToFit(0.8)}>
              {d.officeLabel}
            </Text>
            <Text style={styles.boxValue} {...shrinkToFit(0.8)}>
              {d.officeValue}
            </Text>
            <Text style={[styles.boxLabel, styles.boxLabelNext]} {...shrinkToFit(0.8)}>
              {d.addressLabel}
            </Text>
            <Text style={styles.boxValue} {...shrinkToFit(0.8)}>
              {d.addressValue}
            </Text>
            <Text style={styles.boxLine} {...shrinkToFit(0.8)}>
              {d.cityLine}
            </Text>
            <View style={styles.phoneRow}>
              <Phone size={t.boxPhoneGlyph} color={t.inkMuted} strokeWidth={2} />
              <Text style={styles.phone} {...shrinkToFit(0.8)}>
                {d.mobile}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.head} {...shrinkToFit(0.8)}>
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
          <View style={styles.viewDocs}>
            <Text style={styles.viewDocsText} {...shrinkToFit(0.8)}>
              {d.viewDocs}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.head} {...shrinkToFit(0.8)}>
              {d.statusTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText} {...shrinkToFit(0.8)}>
                {d.statusPill}
              </Text>
            </View>
          </View>
          <View style={styles.statusList}>
            <CourierTimeline steps={d.steps} />
          </View>
          <View style={styles.statusNote}>
            <ShieldCheck size={t.statusNoteGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.statusNoteText}>{d.statusNote}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.head} {...shrinkToFit(0.8)}>
            {d.receiptTitle}
          </Text>
          <View style={styles.receipt}>
            <View style={styles.receiptTile}>
              <FileText size={t.receiptGlyph} color={t.inkMuted} strokeWidth={2} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.receiptName} {...shrinkToFit(0.8)}>
                {d.receiptFile}
              </Text>
              <Text style={styles.receiptSub} {...shrinkToFit(0.8)}>
                {'✓ ' + d.receiptStatus}
              </Text>
            </View>
            <View style={styles.receiptBtn}>
              <Text style={styles.receiptBtnText} {...shrinkToFit(0.8)}>
                {d.receiptView}
              </Text>
            </View>
          </View>
          <Text style={styles.receiptNote} {...shrinkToFit(0.8)}>
            {d.receiptNote}
          </Text>
        </View>

        <View style={styles.imp}>
          <View style={styles.row}>
            <ShieldCheck size={t.impGlyph} color={t.brand} strokeWidth={2} />
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.replace('/dashboard' as Href)}
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
  titlePillText: { marginLeft: 5, fontFamily: font.appSemi, fontSize: 10, color: g.ink },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  cardFirst: { marginTop: t.cardTop, alignItems: 'center' },

  heroCircle: {
    width: t.heroCircle,
    height: t.heroCircle,
    borderRadius: t.heroCircle / 2,
    backgroundColor: t.heroBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    marginTop: t.heroTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    color: t.ink,
  },
  heroBody: {
    marginTop: t.heroBodyTop,
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    color: t.inkMuted,
  },

  idLabel: {
    fontFamily: font.appSemi,
    fontSize: t.idLabelSize,
    letterSpacing: t.idLabelSpacing,
    color: t.inkMuted,
  },
  idValue: {
    marginTop: t.idValueTop,
    fontFamily: font.appHeading,
    fontSize: t.idValueSize,
    color: t.ink,
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
  idNoteRow: { marginTop: t.idNoteTop, flexDirection: 'row', alignItems: 'center' },
  idNote: {
    marginLeft: t.idNoteGap,
    fontFamily: font.appBody,
    fontSize: t.idNoteSize,
    color: t.inkMuted,
  },

  head: { fontFamily: font.appHeading, fontSize: t.headSize, color: t.ink },
  dataRow: {
    height: t.rowH,
    borderRadius: t.rowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataRowFirst: { marginTop: t.rowTop },
  dataRowNext: { marginTop: t.rowGap },
  dataLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.inkMuted },
  dataValue: { fontFamily: font.appHeading, fontSize: t.rowValueSize, color: t.ink },
  linkValue: { color: t.brand },
  rowTrail: { marginLeft: 8 },

  saved: {
    height: t.savedH,
    borderRadius: t.savedRadius,
    paddingHorizontal: t.savedPadX,
    backgroundColor: t.savedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedText: { fontFamily: font.appSemi, fontSize: t.savedSize, color: t.inkMuted },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
  },
  boxLabel: { fontFamily: font.appBody, fontSize: t.boxLabelSize, color: t.inkMuted },
  boxLabelNext: { marginTop: t.boxLineTop },
  boxValue: {
    marginTop: t.boxValueTop,
    fontFamily: font.appHeading,
    fontSize: t.boxValueSize,
    color: t.ink,
  },
  boxLine: {
    marginTop: t.boxValueTop,
    fontFamily: font.appHeading,
    fontSize: t.boxLineSize,
    color: t.ink,
  },
  phoneRow: { marginTop: t.boxPhoneTop, flexDirection: 'row', alignItems: 'center' },
  phone: {
    marginLeft: t.boxPhoneGap,
    fontFamily: font.appHeading,
    fontSize: t.boxLineSize,
    color: t.ink,
  },

  count: {
    height: t.countH,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: t.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: t.countInk },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDocsText: { fontFamily: font.appSemi, fontSize: t.viewDocsSize, color: t.ink },

  statusPill: {
    height: t.statusPillH,
    borderRadius: t.statusPillRadius,
    paddingHorizontal: t.statusPillPadX,
    backgroundColor: t.statusPillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: t.statusPillDot,
    height: t.statusPillDot,
    borderRadius: t.statusPillDot / 2,
    backgroundColor: t.statusPillInk,
  },
  statusPillText: {
    marginLeft: t.statusPillGap,
    fontFamily: font.appSemi,
    fontSize: t.statusPillSize,
    color: t.statusPillInk,
  },
  statusList: { marginTop: t.statusTop },
  statusNote: {
    marginTop: t.statusNoteTop,
    borderRadius: t.statusNoteRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.statusNotePadX,
    paddingVertical: t.statusNotePadY,
    flexDirection: 'row',
  },
  statusNoteText: {
    flex: 1,
    marginLeft: t.statusNoteGap,
    fontFamily: font.appBody,
    fontSize: t.statusNoteSize,
    lineHeight: t.statusNoteLine,
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
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptBtnText: { fontFamily: font.appSemi, fontSize: t.receiptBtnSize, color: t.ink },
  receiptNote: {
    marginTop: t.receiptNoteTop,
    fontFamily: font.appBody,
    fontSize: t.receiptNoteSize,
    color: t.inkMuted,
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
    color: t.ink,
  },
  impItem: { flexDirection: 'row', alignItems: 'flex-start' },
  impItemFirst: { marginTop: t.impItemTop },
  impItemNext: { marginTop: t.impItemGap },
  impDot: {
    width: t.impDot,
    height: t.impDot,
    borderRadius: t.impDot / 2,
    backgroundColor: t.inkMuted,
    marginTop: 8,
    marginRight: t.impItemGapX,
  },
  impItemText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.impItemSize,
    lineHeight: t.impItemLine,
    color: t.inkMuted,
  },

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
