import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Download,
  Headset,
  History,
  Landmark,
  NotebookText,
  ReceiptText,
  Share2,
  WalletCards,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advUtr as t,
  advUtrPalette as p,
  advWalletPalette as w,
  colors,
  courierHeader as h,
  dcDocumentsPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { WALLET_UTR } from '../../../data/advocateWallet';

// Advocate — UTR transfer details (design/361). Measured at 2.000 px/pt.
// The ₹18,200 payout behind the wallet's "Recent Transfer" (design/356).
//
// Reached from UTR Details on the wallet (designs 356-358).
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED: Copy, the share / download icons,
// Download Payout Receipt and Connect with Advocate Desk do nothing. Return
// to Wallet goes to the earnings tab. See WALLET_UTR for the TDS, fee and
// reference conflicts.

export default function AdvocateWalletUtrScreen() {
  const insets = useSafeAreaInsets();
  const d = WALLET_UTR;
  const { width } = useWindowDimensions();
  // The 21-character UTR wraps a lone digit below 390pt; it shrinks there instead.
  const utrSize = t.utrSize * (width < t.utrCompactBelow ? t.utrCompactScale : 1);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(advocate)/earnings' as Href));

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        avatar={false}
        backHref={'/(advocate)/earnings' as Href}
        right={
          <View style={styles.hdrIcons}>
            <Share2 size={t.hdrIcon} color={h.ink} strokeWidth={1.9} />
            <Download size={t.hdrIcon} color={h.ink} strokeWidth={1.9} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.hero]}>
          <View style={styles.wash} pointerEvents="none">
            <Svg width="100%" height={t.heroWash}>
              <Defs>
                <LinearGradient id="utrWash" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={w.glow} stopOpacity={0} />
                  <Stop offset="1" stopColor={w.glow} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height={t.heroWash} fill="url(#utrWash)" />
            </Svg>
          </View>
          <View style={styles.halo}>
            <View style={styles.tick}>
              <Check size={t.tickGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.pillText}>{d.pill}</Text>
          </View>
          <Text style={styles.amount}>{d.amount}</Text>
          <Text style={styles.body}>{d.body}</Text>
          <View style={styles.time}>
            <Clock size={t.timeIcon} color={w.text} strokeWidth={2} />
            <Text style={styles.timeText}>{d.time}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <View style={styles.headTile}>
                <Landmark size={t.headGlyph} color={c.brown} strokeWidth={1.9} />
              </View>
              <Text style={styles.headTitle}>{d.refTitle}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{d.refChip}</Text>
            </View>
          </View>
          <View style={styles.utr}>
            <View style={styles.flex}>
              <Text style={styles.utrLabel}>{d.utrLabel}</Text>
              <Text style={[styles.utrValue, { fontSize: utrSize }]} {...shrinkToFit(0.75)}>
                {d.utr}
              </Text>
            </View>
            <View style={styles.copy}>
              <Copy size={t.copyIcon} color={c.ink} strokeWidth={2} />
              <Text style={styles.copyText}>{d.copy}</Text>
            </View>
          </View>
          <View style={styles.rows}>
            {d.rows.map(([l, v, kind]) => (
              <View key={l} style={styles.row}>
                <Text style={styles.rowLabel}>{l}</Text>
                <View style={styles.rowRight}>
                  {kind === 'dot' && <View style={styles.dot} />}
                  <Text style={[styles.rowValue, (kind === 'mono' || kind === 'monoPlain') && styles.mono]} {...shrinkToFit(0.75)}>
                    {v}
                  </Text>
                  {kind === 'mono' && <Copy size={t.rowIcon} color={w.text} strokeWidth={2} />}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.earn]}>
          <View style={styles.between}>
            <View style={styles.head}>
              <View style={styles.headTile}>
                <ReceiptText size={t.headGlyph} color={c.brown} strokeWidth={1.9} />
              </View>
              <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
                {d.earnTitle}
              </Text>
            </View>
            <View style={[styles.chip, styles.chipRound]}>
              <Text style={styles.chipText}>{d.earnChip}</Text>
            </View>
          </View>
          {d.matters.map(([title, value, gross, fee], i) => (
            <View key={title} style={[styles.matter, i === 0 ? styles.mattersFirst : styles.matterNext]}>
              <View style={styles.between}>
                <Text style={styles.matterTitle}>{title}</Text>
                <Text style={styles.matterValue}>{value}</Text>
              </View>
              <View style={[styles.between, styles.matterSub]}>
                <Text style={styles.matterSubText}>{gross}</Text>
                <Text style={styles.matterSubText}>{fee}</Text>
              </View>
            </View>
          ))}
          <View style={[styles.matter, styles.matterNext, styles.adjust]}>
            <View style={styles.head}>
              <WalletCards size={t.adjIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.adjText}>{d.adjTitle}</Text>
            </View>
            <Text style={[styles.matterValue, styles.adjValue]}>{d.adjValue}</Text>
          </View>
          <View style={[styles.matter, styles.matterNext, styles.total]}>
            <View style={styles.flex}>
              <Text style={styles.totalTitle}>{d.totalTitle}</Text>
              <Text style={styles.totalSub}>{d.totalSub}</Text>
            </View>
            <Text style={styles.totalValue}>{d.totalValue}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next, styles.tlCard]}>
          <View style={styles.head}>
            <View style={styles.headTile}>
              <History size={t.headGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <Text style={styles.headTitle}>{d.tlTitle}</Text>
          </View>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map(([title, date], i) => {
              const last = i === d.timeline.length - 1;
              return (
                <View key={title} style={styles.tlRow}>
                  <View style={[styles.tlDisc, last && styles.tlDiscLast]}>
                    <Check size={t.tlGlyph} color={ink.onBrand} strokeWidth={3.5} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.tlTitle, last && styles.green]}>{title}</Text>
                    <Text style={styles.tlDate}>{date}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.inq, styles.next]}>
          <View style={styles.inqDisc}>
            <Headset size={t.inqGlyph} color={dcDocumentsPalette.shieldInk} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.inqTitle}>{d.inqTitle}</Text>
            <Text style={styles.inqBody}>
              {d.inqBody[0]}
              <Text style={styles.inqUtr}>{d.inqBody[1]}</Text>
              {d.inqBody[2]}
            </Text>
            <View style={styles.inqLink}>
              <Text style={styles.inqLinkText}>{d.inqLink}</Text>
              <ArrowRight size={t.inqLinkIcon} color={c.brown} strokeWidth={2.2} />
            </View>
          </View>
        </View>

        {/* ⚠ UNSCOPED — draws only. */}
        <View style={[styles.btn, styles.btnFirst]}>
          <NotebookText size={t.btnIcon} color={ink.onBrand} strokeWidth={1.9} />
          <Text style={styles.btnText}>{d.download}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={back} style={[styles.btn, styles.btnNext]}>
          <ArrowLeft size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          <Text style={styles.btnText}>{d.back}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: w.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  green: { color: status.active },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowGap },
  hdrIcons: { flexDirection: 'row', alignItems: 'center', gap: t.hdrIconGap, marginRight: t.hdrIconGap },
  mono: { fontFamily: font.mono, fontWeight: '700' },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  next: { marginTop: t.cardGap },
  earn: { marginTop: t.earnTop },
  hero: { marginTop: t.heroTop, paddingTop: t.heroPadY, paddingBottom: t.heroPadBottom, alignItems: 'center', overflow: 'hidden' },
  wash: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  halo: {
    width: t.halo,
    height: t.halo,
    borderRadius: t.halo / 2,
    backgroundColor: p.halo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: t.tick,
    height: t.tick,
    borderRadius: t.tick / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    marginTop: t.pillTop,
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  dot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: status.active },
  amount: { marginTop: t.amountTop, fontFamily: font.appHeading, fontSize: t.amountSize, color: c.ink },
  body: {
    marginTop: t.bodyTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: w.text,
  },
  time: {
    marginTop: t.timeTop,
    height: t.timeH,
    borderRadius: t.timeH / 2,
    paddingHorizontal: t.timePadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.timeGap,
  },
  timeText: { fontFamily: font.appBody, fontSize: t.timeSize, color: w.text },

  head: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headTile: {
    width: t.headTile,
    height: t.headTile,
    borderRadius: t.headTileRadius,
    backgroundColor: c.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  chip: { borderRadius: t.chipRadius, paddingHorizontal: t.chipPadX, paddingVertical: t.chipPadY, backgroundColor: c.panel },
  chipRound: { borderRadius: t.chipLineHeight },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, lineHeight: t.chipLineHeight, color: w.text },

  utr: {
    marginTop: t.utrTop,
    borderRadius: t.utrRadius,
    paddingHorizontal: t.utrPadX,
    paddingVertical: t.utrPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.rowGap,
  },
  utrLabel: { fontFamily: font.appBody, fontSize: t.utrLabelSize, color: w.text },
  utrValue: { marginTop: t.utrValueTop, fontFamily: font.mono, fontWeight: '700', fontSize: t.utrSize, color: c.ink },
  copy: {
    height: t.copyH,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.rowGap,
    ...shadow,
  },
  copyText: { fontFamily: font.appSemi, fontSize: t.copySize, color: c.ink },
  rows: { marginTop: t.rowsTop },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: w.text },
  rowRight: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.rowGap },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },

  mattersFirst: { marginTop: t.mattersTop },
  matterNext: { marginTop: t.matterGap },
  matter: { borderRadius: t.matterRadius, paddingHorizontal: t.matterPadX, paddingVertical: t.matterPadY, backgroundColor: c.panel },
  matterTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.matterTitleSize, color: c.ink },
  matterValue: { fontFamily: font.mono, fontWeight: '700', fontSize: t.matterValueSize, color: c.ink },
  matterSub: { marginTop: t.matterSubTop },
  matterSubText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.matterSubSize, color: w.text },
  adjust: { backgroundColor: p.adjust, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowGap },
  adjText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.adjSize, lineHeight: t.adjLineHeight, color: c.ink },
  adjValue: { textAlign: 'right', lineHeight: t.adjLineHeight },
  total: { flexDirection: 'row', alignItems: 'center', gap: t.rowGap },
  totalTitle: { fontFamily: font.appSemi, fontSize: t.totalTitleSize, color: c.ink },
  totalSub: { fontFamily: font.appBody, fontSize: t.totalSubSize, lineHeight: t.totalSubLineHeight, color: w.text },
  totalValue: { fontFamily: font.mono, fontWeight: '700', fontSize: t.totalValueSize, color: c.brown },

  tl: { marginTop: t.tlTop },
  tlCard: { paddingBottom: t.tlPadBottom },
  rail: {
    position: 'absolute',
    left: t.tlInset + (t.tlDisc - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlRowH / 2,
    width: t.tlRail,
    backgroundColor: p.rail,
  },
  tlRow: { minHeight: t.tlRowH, paddingLeft: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlDisc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Centred on the rail without widening the column, so every title starts at one x.
  tlDiscLast: { width: t.tlLast, height: t.tlLast, marginHorizontal: (t.tlDisc - t.tlLast) / 2, borderRadius: t.tlLast / 2, borderWidth: t.tlRing, borderColor: c.greenTile },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, color: c.ink },
  tlDate: { marginTop: t.tlDateTop, fontFamily: font.appBody, fontSize: t.tlDateSize, color: w.text },

  inq: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.panel, flexDirection: 'row', gap: t.inqGap },
  inqDisc: {
    width: t.inqDisc,
    height: t.inqDisc,
    borderRadius: t.inqDisc / 2,
    backgroundColor: dcDocumentsPalette.tilePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inqTitle: { fontFamily: font.appSemi, fontSize: t.inqTitleSize, color: c.ink },
  inqBody: { marginTop: t.inqBodyTop, fontFamily: font.appBody, fontSize: t.inqBodySize, lineHeight: t.inqBodyLineHeight, color: w.text },
  inqUtr: { fontFamily: font.mono, color: c.ink },
  inqLink: { marginTop: t.inqLinkTop, flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  inqLinkText: { fontFamily: font.appSemi, fontSize: t.inqLinkSize, color: c.brown },

  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnFirst: { marginTop: t.btnTop },
  btnNext: { marginTop: t.btnGap },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});
