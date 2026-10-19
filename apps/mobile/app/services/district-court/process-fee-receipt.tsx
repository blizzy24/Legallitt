import { router, type Href } from 'expo-router';
import { Check, Compass, Download, Eye, FileText, LockKeyhole, MessageSquare, Phone } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcReceipt as t, font, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { clientDocHref } from '../../../data/docLinks';
import { DC_RECEIPT } from '../../../data/districtCourt';

// District Court — process fee receipt (design/325). Measured at 2.000 px/pt.
// Reached from "View Receipt" on the process-fee payment success (design/324).
//
// Conflicts 2 and 5 are commented on DC_RECEIPT.
//
// Wiring: both View Receipt buttons open the client document viewer on the
// receipt. Nothing drawn here leads on to design/326, so the "Next Step" card
// ("The case will continue with the next court step") opens it — flagged, not
// drawn as a control. Chat opens the advocate chat (design/301).
// STATIC: Download saves nothing; Call dials nothing.

export default function DistrictCourtProcessFeeReceiptScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_RECEIPT;
  const viewReceipt = () => router.push(clientDocHref(d.file) as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/process-fee' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.done]}>
          <View style={styles.doneRow}>
            <View style={styles.ring}>
              <View style={styles.ringCore}>
                <Check size={t.ringGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
            </View>
            <View style={styles.flex}>
              <Text style={styles.doneTitle} {...shrinkToFit(0.8)}>
                {d.doneTitle}
              </Text>
              <Text style={styles.doneBody}>{d.doneBody}</Text>
            </View>
          </View>
          <View style={styles.stats}>
            {d.stats.map((s) => (
              <View key={s.label} style={styles.stat}>
                <Text style={styles.statLabel}>{s.label}</Text>
                {'value' in s ? (
                  <Text style={styles.statValue}>{s.value}</Text>
                ) : (
                  <View style={styles.ok}>
                    <Text style={styles.okText} {...shrinkToFit(0.75)}>
                      {s.ok}
                    </Text>
                    <Check size={t.okIcon} color={c.greenInk} strokeWidth={2.6} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.rec]}>
          <View style={styles.between}>
            <Text style={styles.recLabel}>{d.recLabel}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{d.recTag}</Text>
            </View>
          </View>
          <View style={styles.file}>
            <View style={styles.fileTile}>
              <FileText size={t.fileGlyph} color={c.inkWarm} strokeWidth={1.8} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                {d.file}
              </Text>
              <Text style={styles.fileMeta}>{d.fileMeta}</Text>
            </View>
          </View>
          <View style={styles.btns}>
            <Pressable accessibilityRole="button" onPress={viewReceipt} style={[styles.btn, styles.btnBrown]}>
              <Eye size={t.btnIcon} color={ink.onBrand} strokeWidth={2} />
              <Text style={[styles.btnText, styles.btnTextLight]}>{d.view}</Text>
            </Pressable>
            {/* Inert — nothing is downloaded. */}
            <View style={[styles.btn, styles.btnGrey]}>
              <Download size={t.btnIcon} color={c.ink} strokeWidth={2} />
              <Text style={styles.btnText}>{d.download}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.caseCard]}>
          <Text style={styles.caseTitle}>{d.caseTitle}</Text>
          <View style={styles.rows}>
            {d.rows.map(([l, v], i) => (
              <View key={l} style={styles.between}>
                <Text style={styles.rowLabel}>{l}</Text>
                <Text style={[styles.rowValue, i === d.rows.length - 1 && styles.rowValueBrown]} {...shrinkToFit(0.75)}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/first-hearing' as Href)}
          style={styles.next}
        >
          <View style={styles.nextDisc}>
            <Compass size={t.nextGlyph} color={c.inkWarm} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.nextTitle}>{d.nextTitle}</Text>
            <Text style={styles.nextBody}>{d.next}</Text>
          </View>
        </Pressable>

        <View style={[styles.card, styles.q]}>
          <Text style={styles.qTitle}>{d.qTitle}</Text>
          <Text style={styles.qSub}>{d.qSub}</Text>
          <View style={styles.qRow}>
            <View style={styles.qPhoto}>
              <Text style={styles.qInitials}>{d.initials}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.qName} {...shrinkToFit(0.8)}>
                {d.adv}
              </Text>
              <Text style={styles.qOnline}>{d.online}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chat"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.iconBtn}
            >
              <MessageSquare size={t.iconGlyph} color={c.ink} strokeWidth={1.9} />
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.iconBtn}>
              <Phone size={t.iconGlyph} color={c.ink} strokeWidth={1.9} />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={viewReceipt} style={styles.cta}>
          <Eye size={t.ctaIcon} color={ink.onBrand} strokeWidth={2} />
          <Text style={styles.ctaText}>{d.cta}</Text>
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.inkWarm} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.doneGap },
  hdrSub: { fontFamily: font.appSemi, fontSize: t.hdrSubSize },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  done: { marginTop: t.doneTop, paddingTop: t.donePadTop, paddingBottom: t.donePadBottom },
  doneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: t.doneGap },
  ring: { width: t.ring, height: t.ring, borderRadius: t.ring / 2, backgroundColor: c.greenSoft, alignItems: 'center', justifyContent: 'center' },
  ringCore: { width: t.ringCore, height: t.ringCore, borderRadius: t.ringCore / 2, backgroundColor: c.greenInk, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontFamily: font.appSemi, fontSize: t.doneTitleSize, lineHeight: t.doneTitleLineHeight, color: c.ink },
  doneBody: { fontFamily: font.appBody, fontSize: t.doneBodySize, lineHeight: t.doneBodyLineHeight, color: c.inkWarm },
  stats: { marginTop: t.statsTop, flexDirection: 'row', gap: t.statGap },
  stat: {
    flex: 1,
    minWidth: 0,
    minHeight: t.statH,
    borderRadius: t.statRadius,
    backgroundColor: c.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { fontFamily: font.appBody, fontSize: t.statLabelSize, lineHeight: t.statLabelLineHeight, color: c.inkWarm },
  statValue: { fontFamily: font.appSemi, fontSize: t.statValueSize, lineHeight: t.statValueLineHeight, color: c.ink },
  ok: {
    marginTop: (t.statValueLineHeight - t.okH) / 2,
    height: t.okH,
    borderRadius: t.okH / 2,
    paddingHorizontal: t.okPadX,
    backgroundColor: c.greenTile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  okText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.okSize, color: c.greenInk },

  rec: { paddingTop: t.recPadTop, paddingBottom: t.recPadBottom },
  recLabel: { fontFamily: font.appSemi, fontSize: t.recLabelSize, letterSpacing: t.recLabelSpacing, color: c.ink },
  tag: { height: t.tagH, borderRadius: t.tagH / 2, paddingHorizontal: t.tagPadX, backgroundColor: c.greenSoft, justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.greenInk },
  file: {
    marginTop: t.fileTop,
    minHeight: t.fileH,
    borderRadius: t.fileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.filePadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fileGap,
  },
  fileTile: { width: t.fileTile, height: t.fileTile, borderRadius: t.fileTileRadius, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontFamily: font.appSemi, fontSize: t.fileNameSize, lineHeight: t.fileNameLineHeight, color: c.ink },
  fileMeta: { fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: c.inkWarm },
  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnBrown: { backgroundColor: c.brown },
  btnGrey: { backgroundColor: c.tileGrey },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },
  btnTextLight: { color: ink.onBrand },

  caseCard: { paddingTop: t.casePadTop, paddingBottom: t.casePadBottom },
  caseTitle: { fontFamily: font.appSemi, fontSize: t.caseTitleSize, lineHeight: t.caseTitleLineHeight, color: c.ink },
  rows: { marginTop: t.rowsTop, gap: t.rowGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, lineHeight: t.rowLineHeight, color: c.inkWarm },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, lineHeight: t.rowLineHeight, color: c.ink },
  rowValueBrown: { color: c.brownLift },

  next: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.nextPadTop,
    paddingBottom: t.nextPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.nextGap,
  },
  nextDisc: { width: t.nextDisc, height: t.nextDisc, borderRadius: t.nextDisc / 2, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  nextTitle: { fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBody: { fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },

  q: { paddingTop: t.qPadTop, paddingBottom: t.qPadBottom },
  qTitle: { fontFamily: font.appSemi, fontSize: t.qTitleSize, lineHeight: t.qTitleLineHeight, color: c.ink },
  qSub: { fontFamily: font.appBody, fontSize: t.qSubSize, lineHeight: t.qSubLineHeight, color: c.inkWarm },
  qRow: { marginTop: t.qRowTop, flexDirection: 'row', alignItems: 'center', gap: t.iconBtnGap },
  qPhoto: {
    marginRight: t.qGap - t.iconBtnGap,
    width: t.qPhoto,
    height: t.qPhoto,
    borderRadius: t.qPhoto / 2,
    backgroundColor: c.avatarTan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qInitials: { fontFamily: font.appSemi, fontSize: t.qInitials, color: ink.onBrand },
  qName: { fontFamily: font.appSemi, fontSize: t.qNameSize, lineHeight: t.qNameLineHeight, color: c.ink },
  qOnline: { fontFamily: font.appBody, fontSize: t.qOnlineSize, lineHeight: t.qOnlineLineHeight, color: c.greenInk },
  iconBtn: { width: t.iconBtn, height: t.iconBtn, borderRadius: t.iconBtn / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});
