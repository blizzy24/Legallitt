import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  ChevronRight,
  CircleCheck,
  ExternalLink,
  FileText,
  Gavel,
  History,
  Hourglass,
  Info,
  Landmark,
  MessageSquareText,
  NotebookText,
  PieChart,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../components/CourierHeader';
import { shrinkToFit } from '../../constants/textFit';
import {
  advWallet as t,
  advWalletPalette as p,
  colors,
  courierHeader as h,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../constants/theme';
import { WALLET, WALLET_PERIODS, type PillTone, type WalletPeriodId } from '../../data/advocateWallet';

// Advocate — Wallet and Earnings (designs 356 / 357 / 358). Measured at 2.000
// px/pt on 357; design/356 is a 1.000 px/pt export (see constants/tokens/advWallet).
//
// This is the earnings tab. The tab had no design until now — it was a "Not
// built yet" placeholder — and its icon is already the wallet, so the Wallet is
// built into this route and the tab bar is left exactly as it is: five tabs,
// where design/356 draws four (Home, Matters, Clients, Wallet). That question
// is still with the client.
//
// ⚠ design/358: the wrapped "₹2,65,400" makes the first tile taller, and in the
// export that tile runs down behind the period chips — the chips are drawn at
// the same height on all three periods. Here the chips sit below the tile
// instead of overlapping it.
//
// ONE screen, three period states. This Month / Last Month / This Year switch
// between the three records in data/advocateWallet.ts (356 / 357 / 358).
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED: no payout rail, no bank API. Withdraw
// Money, Payout Time & Limits, View Statement, UTR Details and the filter icon
// open nothing. Manage opens bank account management (design/360). The
// withdrawal (359) and UTR details (361) screens are therefore reached only
// from the advocate dev preview links.

/** A zero-width space after each comma lets a long figure wrap where the
 *  export wraps it ("₹2,65, / 400" on design/358), never mid-digit. */
const breakAtCommas = (v: string) => v.replace(/,/g, ',\u200B');

const TILE_ICON = { earned: WalletCards, pending: Hourglass, paid: CircleCheck } as const;
const ROW_ICON = { consult: MessageSquareText, draft: FileText, court: Gavel, advisory: NotebookText } as const;
const AVATAR = [
  { bg: c.peach, ink: c.brownInk },
  { bg: p.tile, ink: p.tileInk },
  { bg: c.radioGrey, ink: c.inkWarm },
] as const;

function Pill({ label, tone, dot, small }: { label: string; tone: PillTone; dot?: boolean; small?: boolean }) {
  return (
    <View style={[styles.pill, small && styles.pillSmall, PILL_BG[tone]]}>
      {dot && <View style={styles.pillDot} />}
      <Text style={[styles.pillText, PILL_TEXT[tone]]} {...shrinkToFit(0.8)}>
        {label}
      </Text>
    </View>
  );
}

export default function AdvocateWalletScreen() {
  const insets = useSafeAreaInsets();
  const w = WALLET;
  // ?period=last|year opens a period directly (for review links); default This Month.
  const { period } = useLocalSearchParams<{ period?: string }>();
  const initial = WALLET_PERIODS.some((x) => x.id === period) ? (period as WalletPeriodId) : 'month';
  const [periodId, setPeriodId] = useState<WalletPeriodId>(initial);
  const d = WALLET_PERIODS.find((x) => x.id === periodId) ?? WALLET_PERIODS[0];

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={w.title}
        sub={w.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        subStyle={styles.hdrSub}
        backHref={'/(advocate)/dashboard' as Href}
        right={
          d.filter ? (
            <View style={styles.filter}>
              <SlidersHorizontal size={t.filterIcon} color={h.ink} strokeWidth={1.8} />
            </View>
          ) : undefined
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.hero]}>
          <View style={styles.glow} pointerEvents="none">
            <Svg width={t.glowSize} height={t.glowSize}>
              <Defs>
                <RadialGradient id="walletGlow" cx="100%" cy="0%" r="100%">
                  <Stop offset="0" stopColor={p.glow} stopOpacity={1} />
                  <Stop offset="1" stopColor={p.glow} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width={t.glowSize} height={t.glowSize} fill="url(#walletGlow)" />
            </Svg>
          </View>
          <View style={styles.between}>
            <View style={styles.caps}>
              <Text style={styles.capsText} {...shrinkToFit(0.8)}>
                {w.readyCaps}
              </Text>
              <Info size={t.capsIcon} color={p.text} strokeWidth={1.9} />
            </View>
            <Pill label={w.settled} tone="grey" dot />
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amount} {...shrinkToFit(0.75)}>
              {d.available}
            </Text>
            <Text style={styles.paise}>{w.paise}</Text>
          </View>
          <Text style={styles.ready}>{w.readySub}</Text>
          {/* ⚠ UNSCOPED — no payout rail. Draws only. */}
          <View style={styles.btn}>
            <Text style={styles.btnText}>{w.withdraw}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </View>
          <View style={[styles.between, styles.links]}>
            <View style={styles.link}>
              <Text style={styles.linkText} {...shrinkToFit(0.8)}>
                {w.limits}
              </Text>
              <ChevronRight size={t.linkIcon} color={c.brown} strokeWidth={2.2} />
            </View>
            <Text style={styles.next} {...shrinkToFit(0.8)}>
              {w.nextSend}
            </Text>
          </View>
        </View>

        <View style={styles.tiles}>
          {d.tiles.map((tile) => {
            const Icon = TILE_ICON[tile.icon];
            return (
              <View key={tile.label} style={styles.tile}>
                <View style={[styles.between, styles.tileHead]}>
                  <Text style={styles.tileLabel} {...shrinkToFit(0.75)}>
                    {tile.label}
                  </Text>
                  <Icon
                    size={t.tileIcon}
                    color={tile.icon === 'paid' ? status.active : c.brown}
                    strokeWidth={1.9}
                  />
                </View>
                <Text style={styles.tileValue}>{breakAtCommas(tile.value)}</Text>
                {tile.sub ? <Text style={[styles.tileSub, tile.subGreen && styles.green]}>{tile.sub}</Text> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.chips} accessibilityRole="tablist">
          {WALLET_PERIODS.map((x, i) => {
            const on = x.id === periodId;
            return (
              <Pressable
                key={x.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setPeriodId(x.id)}
                style={[styles.chip, on ? styles.chipOn : i === 0 && d.greyFirstChip ? styles.chipGrey : styles.chipOff]}
              >
                <Text style={[styles.chipText, on ? styles.chipTextOn : i === 0 && d.greyFirstChip && styles.chipTextGrey]}>
                  {x.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.between, styles.breakdownRow]}>
          <View style={styles.secHead}>
            <PieChart size={t.secIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.secTitle} {...shrinkToFit(0.8)}>
              {w.breakdownTitle}
            </Text>
          </View>
          {/* ⚠ CONFLICT 2 — the rows below sum to Net, not to the total before fees. */}
          <Text style={styles.secTag}>{w.breakdownTag}</Text>
        </View>
        <View style={[styles.card, styles.secCard, styles.bkCard]}>
          {d.breakdown.map((r, i) => {
            const Icon = ROW_ICON[r.icon];
            const dim = r.icon === 'advisory';
            return (
              <View key={r.title} style={[styles.bkRow, i > 0 && styles.bkNext]}>
                <View style={styles.bkHead}>
                  <View style={styles.rowTile}>
                    <Icon size={t.rowGlyph} color={dim ? p.muted : c.brown} strokeWidth={1.9} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.rowTitle, dim && styles.dim]}>{r.title}</Text>
                    <Text style={[styles.rowSub, dim && styles.dim]}>{r.sub}</Text>
                  </View>
                  <Text style={[styles.rowValue, dim && styles.dim]}>{r.value}</Text>
                </View>
                {!dim && (
                  <View style={styles.track}>
                    <View style={[styles.fill, { flex: r.share }]} />
                    <View style={{ flex: 1 - r.share }} />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.secHead, styles.secRow]}>
          <Calculator size={t.secIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.secTitle}>{w.feesTitle}</Text>
        </View>
        <View style={[styles.card, styles.secCard, styles.feeCard]}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{w.billedLabel}</Text>
            <Text style={styles.feeValue}>{d.billed}</Text>
          </View>
          {/* ⚠ CONFLICT 3 — ≈7.6% of Total Billed; every payment row is 10%. */}
          <View style={styles.feeRow}>
            <View style={styles.feeLabelRow}>
              <Text style={styles.feeLabel}>{w.feeLabel}</Text>
              <View style={styles.feeChip}>
                <Text style={styles.feeChipText}>{w.feeChip}</Text>
              </View>
            </View>
            <Text style={[styles.feeValue, styles.red]}>{d.platformFee}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>{w.taxesLabel}</Text>
            <Text style={[styles.feeValue, d.taxes === w.taxesLabel && styles.feeEcho]} {...shrinkToFit(0.75)}>
              {d.taxes}
            </Text>
          </View>
          <View style={styles.rule} />
          <View style={styles.net}>
            <Text style={styles.netLabel}>{w.netLabel}</Text>
            <View style={styles.netValueRow}>
              <CircleCheck size={t.netIcon} color={c.card} fill={status.active} strokeWidth={2.2} />
              <Text style={styles.netValue}>{d.net}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.between, styles.secRow]}>
          <View style={styles.secHead}>
            <History size={t.secIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.secTitle}>{w.paymentsTitle}</Text>
          </View>
          {/* ⚠ CONFLICT 10 — no destination drawn. */}
          <View style={styles.link}>
            <Text style={styles.statement}>{w.statement}</Text>
            <ChevronRight size={t.linkIcon} color={c.brown} strokeWidth={2.2} />
          </View>
        </View>
        {d.payments.map((pay, i) => {
          const av = AVATAR[i % AVATAR.length];
          return (
            <View key={pay.name} style={[styles.card, i === 0 ? styles.payFirst : styles.payNext]}>
              <View style={styles.payHead}>
                <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                  <Text style={[styles.avatarText, { color: av.ink }]}>{pay.initials}</Text>
                </View>
                <View style={styles.flex}>
                  <View style={styles.between}>
                    <Text style={styles.name} {...shrinkToFit(0.75)}>
                      {pay.name}
                    </Text>
                    <Pill label={pay.status} tone={pay.statusTone} small />
                  </View>
                  <View style={styles.meta}>
                    <View style={styles.svc}>
                      <Text style={styles.svcText}>{pay.service}</Text>
                    </View>
                    <Text style={styles.date}>{`· ${pay.date}`}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.box}>
                <Text style={styles.boxText} {...shrinkToFit(0.75)}>
                  {w.grossLabel}
                  {pay.gross}
                  {'  ·  '}
                  <Text style={styles.red}>
                    {w.feeShort}
                    {pay.fee}
                  </Text>
                </Text>
                <Text style={styles.boxNet}>
                  {w.netShort}
                  {pay.net}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={[styles.secHead, styles.secRow]}>
          <Landmark size={t.secIcon} color={c.brown} strokeWidth={1.9} />
          <Text style={styles.secTitle}>{w.bankTitle}</Text>
        </View>
        <View style={[styles.card, styles.bank]}>
          <View style={styles.bankIcon}>
            <Landmark size={t.bankGlyph} color={c.ink} strokeWidth={1.8} />
          </View>
          <View style={styles.flex}>
            <View style={styles.bankNameRow}>
              <Text style={styles.bankName}>{w.bankName}</Text>
              <BadgeCheck size={t.badgeIcon} color={c.card} fill={status.active} strokeWidth={2} />
            </View>
            <Text style={styles.bankSub}>{w.bankSub}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/advocate/wallet/bank' as Href)}
            style={styles.manage}
          >
            <Text style={styles.manageText}>{w.manage}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, styles.xfer]}>
          <View style={styles.between}>
            <View style={styles.xferHead}>
              {d.transfer.icon === 'check' ? (
                <CircleCheck size={t.xferIcon} color={c.brown} strokeWidth={1.9} />
              ) : (
                <RefreshCcw size={t.xferIcon} color={c.brown} strokeWidth={1.9} />
              )}
              <View style={styles.flex}>
                <Text style={styles.xferTitle}>{d.transfer.title}</Text>
                {d.transfer.sub ? <Text style={styles.xferSub}>{d.transfer.sub}</Text> : null}
              </View>
            </View>
            <Pill label={d.transfer.pill} tone={d.transfer.pillTone} dot={d.transfer.pillDot} />
          </View>
          <View style={[styles.between, styles.xferRow]}>
            <Text style={styles.xferAmount}>{d.transfer.amount}</Text>
            <View style={styles.link}>
              <Text style={styles.utr}>{w.utr}</Text>
              <ExternalLink size={t.utrIcon} color={c.brown} strokeWidth={2} />
            </View>
          </View>
          <Text style={styles.ref}>{d.transfer.ref}</Text>
        </View>

        {d.note && (
          <View style={styles.note}>
            <ShieldCheck size={t.noteIcon} color={p.text} strokeWidth={1.9} />
            <Text style={styles.noteText}>{w.note}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: p.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.capsGap },
  green: { color: status.active },
  red: { color: p.red },
  dim: { color: p.muted },
  hdrTitle: { fontSize: t.hdrTitleSize },
  hdrSub: { maxWidth: t.hdrSubMaxWidth, fontSize: t.hdrSubSize, lineHeight: t.hdrSubLineHeight, color: p.text },
  filter: { marginRight: t.filterGap },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  hero: {
    marginTop: t.heroTop,
    paddingHorizontal: t.heroPad,
    paddingTop: t.heroPadTop,
    paddingBottom: t.heroPadBottom,
    overflow: 'hidden',
  },
  glow: { position: 'absolute', top: 0, right: 0 },
  caps: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.capsGap },
  capsText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: p.text },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.settledGap,
  },
  pillSmall: { height: t.payPillH, borderRadius: t.payPillH / 2 },
  pillDot: { width: t.settledDot, height: t.settledDot, borderRadius: t.settledDot / 2, backgroundColor: status.active },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize },
  amountRow: { marginTop: t.amountTop, flexDirection: 'row', alignItems: 'baseline', gap: t.paiseGap },
  amount: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.amountSize, lineHeight: t.amountLineHeight, color: c.ink },
  paise: { fontFamily: font.appBody, fontSize: t.paiseSize, color: p.text },
  ready: { marginTop: t.readyTop, fontFamily: font.appBody, fontSize: t.readySize, color: p.text },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  links: { marginTop: t.linksTop },
  link: { flexShrink: 1, flexDirection: 'row', alignItems: 'center' },
  linkText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.linkSize, color: c.brown },
  next: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.nextSize, color: p.text },

  tiles: { marginTop: t.tilesTop, flexDirection: 'row', gap: t.tileGap },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: t.tileH,
    borderRadius: t.tileRadius,
    paddingVertical: t.tilePad,
    paddingHorizontal: t.tilePadX,
    backgroundColor: c.card,
    ...shadow,
  },
  tileHead: { gap: t.tileIconGap },
  tileLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.tileLabelSize, color: p.text },
  tileValue: {
    marginTop: t.tileValueTop,
    fontFamily: font.appSemi,
    fontSize: t.tileValueSize,
    lineHeight: t.tileValueLineHeight,
    color: c.ink,
  },
  tileSub: { marginTop: t.tileSubTop, fontFamily: font.appBody, fontSize: t.tileSubSize, color: p.text },

  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.chipGap },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.brand },
  chipOff: { backgroundColor: c.card },
  chipGrey: { backgroundColor: c.panel },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  chipTextOn: { color: ink.onBrand },
  chipTextGrey: { color: p.text },

  secRow: { marginTop: t.secTop },
  breakdownRow: { marginTop: t.breakdownTop },
  secHead: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.secGap },
  secTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  secTag: { fontFamily: font.appBody, fontSize: t.secTagSize, color: p.text },
  secCard: { marginTop: t.secCardTop },
  bkCard: { paddingTop: t.bkPadTop, paddingBottom: t.bkPadTop },
  feeCard: { paddingTop: t.feePadTop, paddingBottom: t.feePadBottom },

  bkRow: {},
  bkNext: { marginTop: t.rowGapY },
  bkHead: { flexDirection: 'row', alignItems: 'center', gap: t.rowGap },
  rowTile: {
    width: t.rowTile,
    height: t.rowTile,
    borderRadius: t.rowTileRadius,
    backgroundColor: c.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: font.appSemi, fontSize: t.rowTitleSize, lineHeight: t.rowTitleLineHeight, color: c.ink },
  rowSub: { fontFamily: font.appBody, fontSize: t.rowSubSize, lineHeight: t.rowSubLineHeight, color: p.text },
  rowValue: { fontFamily: font.appSemi, fontSize: t.rowValueSize, color: c.ink },
  track: {
    marginTop: t.barTop,
    height: t.barH,
    borderRadius: t.barH / 2,
    backgroundColor: c.panel,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: { borderRadius: t.barH / 2, backgroundColor: colors.brand },

  feeRow: { minHeight: t.feeRowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.feeChipGap },
  feeLabelRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.feeChipGap },
  feeLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.feeLabelSize, color: p.text },
  feeValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.feeValueSize, color: c.ink },
  feeEcho: { fontFamily: font.appBody, color: p.text },
  feeChip: { height: t.feeChipH, borderRadius: t.feeChipRadius, paddingHorizontal: t.feeChipPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  feeChipText: { fontFamily: font.appBody, fontSize: t.feeChipSize, color: p.text },
  rule: { marginTop: t.ruleTop, height: t.ruleH, backgroundColor: c.tileGrey },
  net: { marginTop: t.netTop, flexDirection: 'row', alignItems: 'center', gap: t.feeChipGap },
  netLabel: { flex: 1, fontFamily: font.appSemi, fontSize: t.netLabelSize, lineHeight: t.netLabelLineHeight, color: c.ink },
  netValueRow: { flexDirection: 'row', alignItems: 'center', gap: t.netGap },
  netValue: { fontFamily: font.appHeading, fontSize: t.netValueSize, color: c.ink },

  statement: { fontFamily: font.appSemi, fontSize: t.secTagSize, color: c.brown },
  payFirst: { marginTop: t.payTop },
  payNext: { marginTop: t.payGap },
  payHead: { flexDirection: 'row', alignItems: 'center', gap: t.avatarGap },
  avatar: { width: t.avatar, height: t.avatar, borderRadius: t.avatar / 2, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarSize },
  name: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nameSize, color: c.ink },
  meta: { marginTop: t.metaTop, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.capsGap },
  svc: { height: t.svcH, borderRadius: t.svcRadius, paddingHorizontal: t.svcPadX, backgroundColor: c.panel, justifyContent: 'center' },
  svcText: { fontFamily: font.appBody, fontSize: t.svcSize, color: p.text },
  date: { fontFamily: font.appBody, fontSize: t.dateSize, color: p.text },
  box: {
    marginTop: t.boxTop,
    minHeight: t.boxH,
    borderRadius: t.boxRadius,
    paddingHorizontal: t.boxPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.capsGap,
  },
  boxText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.boxSize, color: p.text },
  boxNet: { fontFamily: font.appSemi, fontSize: t.boxNetSize, color: c.ink },

  bank: { marginTop: t.bankTop, flexDirection: 'row', alignItems: 'center', gap: t.bankGap },
  bankIcon: {
    width: t.bankIcon,
    height: t.bankIcon,
    borderRadius: t.rowTileRadius,
    backgroundColor: c.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankNameRow: { flexDirection: 'row', alignItems: 'center', gap: t.badgeGap },
  bankName: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.bankNameSize, color: c.ink },
  bankSub: { fontFamily: font.appBody, fontSize: t.bankSubSize, color: p.text },
  manage: { height: t.manageH, borderRadius: t.manageRadius, paddingHorizontal: t.managePadX, backgroundColor: c.panel, justifyContent: 'center' },
  manageText: { fontFamily: font.appSemi, fontSize: t.manageSize, color: c.ink },

  xfer: { marginTop: t.xferTop },
  xferHead: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.xferGap },
  xferTitle: { fontFamily: font.appSemi, fontSize: t.xferTitleSize, color: c.brown },
  xferSub: { fontFamily: font.appBody, fontSize: t.xferSubSize, color: p.text },
  xferRow: { marginTop: t.xferAmountTop },
  xferAmount: { fontFamily: font.appHeading, fontSize: t.xferAmountSize, color: c.ink },
  utr: { fontFamily: font.appSemi, fontSize: t.utrSize, color: c.brown },
  ref: { marginTop: t.refTop, fontFamily: font.appBody, fontSize: t.refSize, color: p.text },

  note: { marginTop: t.noteTop, paddingHorizontal: t.cardPad, flexDirection: 'row', gap: t.noteGap },
  noteText: { flex: 1, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: p.text },
});

const PILL_BG = StyleSheet.create({
  green: { backgroundColor: status.activeBg },
  peach: { backgroundColor: c.peachSoft },
  cream: { backgroundColor: c.peachDecide },
  grey: { backgroundColor: c.panel },
  tile: { backgroundColor: c.tileGrey },
});
const PILL_TEXT = StyleSheet.create({
  green: { color: status.active },
  peach: { color: c.brownInk },
  cream: { color: c.brownInk },
  grey: { color: p.text },
  tile: { color: p.text },
});
