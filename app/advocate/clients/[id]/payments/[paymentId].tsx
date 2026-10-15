import DemoPressable from '../../../../../components/DemoPressable';
import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  ChevronLeft,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Gavel,
  Landmark,
  Lock,
  Receipt,
  Send,
  Share2,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../../constants/textFit';
import {
  ADV_COMMISSION,
  ADV_PAYMENT_DETAIL,
  advFeeBreakdown,
} from '../../../../../data/advocateSide';
import { advClientSub as t, colors, font, ink } from '../../../../../constants/theme';
import { advDocHref } from '../../../../../data/docLinks';

// Payment detail (design/157).
//
// MEASUREMENT CAVEAT — design/157 is a device mock-up, so spacing is derived rather
// than measured to the usual tolerance.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE FEE BREAKDOWN IS COMPUTED, NOT HARDCODED. advFeeBreakdown() applies the rates
// in ADV_COMMISSION to the gross fee, so the percentages live in one place:
//
//     computed   gross ₹35,000  platform ₹1,750 (5%)  escrow ₹350 (1%)  net ₹32,900
//     drawn      gross ₹35,000  platform ₹1,750       escrow ₹350       net ₹32,900
//
// They agree exactly, which is the first time in this project that a drawn invoice
// has matched its own stated rates.
//
// REPORTED — THE BENEFICIARY IS THE WRONG ADVOCATE. design/157 pays out to "Adv.
// Priya Sharma Chambers". This is Adv. Abhishek Chouhan's app — design/148 greets
// "Abhishek" and design/151 shows the AB avatar. Priya Sharma is a saved advocate on
// the CLIENT side of the product, and the client on this payment is Rahul Sharma.
// Drawn as-is, but on a payout screen a wrong beneficiary name is the most
// consequential kind of placeholder error.
//
// REPORTED — THE LIST AND THE DETAIL DISAGREE ON THE DATE. design/156 dates this
// payment 24 Sep; design/157 says deposited 22 September and filed 22 Sep, 11:30 AM.
// ─────────────────────────────────────────────────────────────────────────────

export default function AdvocatePaymentDetailScreen() {
  const insets = useSafeAreaInsets();
  const d = ADV_PAYMENT_DETAIL;
  const fee = advFeeBreakdown(d.grossFee);
  const inr = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(advocate)/clients'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Payment Details
          </Text>
          <Text style={styles.headerRef} {...shrinkToFit(0.7)}>
            {d.ref}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Share" style={styles.iconBtn}>
          <Share2 size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.receivedChip}>
              <BadgeCheck size={13} color="#6B4F2A" fill="#6B4F2A" />
              <Text style={styles.receivedText} {...shrinkToFit(0.75)}>
                {d.chip}
              </Text>
            </View>
            <View style={styles.verified}>
              <Lock size={13} color={colors.textBody} />
              <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                {d.verified}
              </Text>
            </View>
          </View>

          <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>
            {d.totalLabel}
          </Text>
          <Text style={styles.totalValue} {...shrinkToFit(0.75)}>
            ₹{d.grossFee.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.depositLine} {...shrinkToFit(0.75)}>
            {d.depositLine}
          </Text>

          <View style={styles.matterBlock}>
            <Text style={styles.matterLabel} {...shrinkToFit(0.8)}>
              Matter / Docket
            </Text>
            <Text style={styles.matterTitle} {...shrinkToFit(0.7)}>
              {d.matter}
            </Text>
            <Text style={styles.matterRef} {...shrinkToFit(0.7)}>
              {d.matterRef}
            </Text>

            <View style={styles.pairRow}>
              <View style={styles.pairCol}>
                <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                  Client Name
                </Text>
                <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                  {d.client}
                </Text>
                <Text style={styles.pairSub} {...shrinkToFit(0.75)}>
                  {d.clientRef}
                </Text>
              </View>
              <View style={[styles.pairCol, styles.pairColRight]}>
                <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                  Service
                </Text>
                <Text style={styles.pairValue} {...shrinkToFit(0.75)}>
                  {d.service}
                </Text>
              </View>
            </View>

            <View style={styles.pairRow}>
              <View style={styles.pairCol}>
                <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                  Transaction Ref
                </Text>
                <View style={styles.refRow}>
                  <Text style={styles.refValue} {...shrinkToFit(0.65)}>
                    {d.ref}
                  </Text>
                  <Copy size={13} color={colors.textBody} style={styles.refCopy} />
                </View>
              </View>
              <View style={[styles.pairCol, styles.pairColRight]}>
                <Text style={styles.pairLabel} {...shrinkToFit(0.8)}>
                  Filing Timestamp
                </Text>
                <Text style={styles.pairValue} {...shrinkToFit(0.7)}>
                  {d.filed}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.protect}>
            <Gavel size={14} color={colors.textBody} />
            <Text style={styles.protectText} {...shrinkToFit(0.7)}>
              {d.protection}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.feeHead}>
            <View style={styles.feeHeadText}>
              <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
                Fee Breakdown
              </Text>
              <Text style={styles.feeSub}>Statutory deductions &amp; net disbursements</Text>
            </View>
            <View style={styles.netChip}>
              <Text style={styles.netChipText} {...shrinkToFit(0.75)}>
                Net Disbursable
              </Text>
            </View>
          </View>

          {[
            {
              label: 'Client Gross Fee',
              sub: 'Direct professional fee received',
              value: inr(fee.grossFee),
            },
            {
              label: `Platform Facilitation Fee (${ADV_COMMISSION.platformFacilitationRate * 100}%)`,
              sub: 'Legalitt Advocate Partner charge',
              value: `-${inr(fee.platformFacilitationFee)}`,
            },
            {
              label: `Escrow Tech & Regulatory (${ADV_COMMISSION.escrowRegulatoryRate * 100}%)`,
              sub: 'Statutory transaction levy & GST',
              value: `-${inr(fee.escrowRegulatoryFee)}`,
            },
          ].map((r) => (
            <View key={r.label} style={styles.feeRow}>
              <View style={styles.feeRowText}>
                <Text style={styles.feeLabel} {...shrinkToFit(0.7)}>
                  {r.label}
                </Text>
                <Text style={styles.feeRowSub} {...shrinkToFit(0.7)}>
                  {r.sub}
                </Text>
              </View>
              <Text style={styles.feeValue} {...shrinkToFit(0.7)}>
                {r.value}
              </Text>
            </View>
          ))}

          <View style={styles.net}>
            <View style={styles.netText}>
              <Text style={styles.netLabel} {...shrinkToFit(0.75)}>
                ADVOCATE NET EARNINGS
              </Text>
              <Text style={styles.netSub} {...shrinkToFit(0.75)}>
                Approved for automated disbursement
              </Text>
            </View>
            <View style={styles.netRight}>
              <Text style={styles.netValue} {...shrinkToFit(0.7)}>
                {inr(fee.netEarnings)}
              </Text>
              <View style={styles.readyRow}>
                <Wallet size={12} color={colors.brandDark} />
                <Text style={styles.readyText} {...shrinkToFit(0.75)}>
                  Ready for Payout
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.feeHead}>
            <View style={styles.feeHeadText}>
              <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
                Disbursement Schedule
              </Text>
              <Text style={styles.feeSub}>Destination settlement route</Text>
            </View>
            <View style={styles.pendingChip}>
              <View style={styles.pendingDot} />
              <Text style={styles.pendingText} {...shrinkToFit(0.7)}>
                Pending Settlement
              </Text>
            </View>
          </View>

          <View style={styles.payout}>
            <View style={styles.payoutIcon}>
              <Clock size={17} color={colors.brandDark} />
            </View>
            <View style={styles.payoutText}>
              <Text style={styles.payoutDate} {...shrinkToFit(0.75)}>
                {d.payoutDate}
              </Text>
              <Text style={styles.payoutNote}>{d.payoutNote}</Text>
            </View>
          </View>

          <View style={styles.bank}>
            <View style={styles.bankHead}>
              <View style={styles.bankIcon}>
                <Landmark size={16} color={colors.brandDark} />
              </View>
              <View style={styles.bankText}>
                <Text style={styles.bankName} {...shrinkToFit(0.75)}>
                  {d.bank.name}
                </Text>
                <Text style={styles.bankType} {...shrinkToFit(0.75)}>
                  {d.bank.type}
                </Text>
              </View>
              <View style={styles.primaryChip}>
                <Text style={styles.primaryChipText} {...shrinkToFit(0.75)}>
                  {d.bank.chip}
                </Text>
              </View>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.masked} {...shrinkToFit(0.7)}>
                {d.bank.masked}
              </Text>
              <Text style={styles.ifsc} {...shrinkToFit(0.7)}>
                {d.bank.ifsc}
              </Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.beneLabel} {...shrinkToFit(0.8)}>
                Beneficiary
              </Text>
              {/* See the note at the top: this is the wrong advocate. */}
              <Text style={styles.beneValue} {...shrinkToFit(0.7)}>
                {d.bank.beneficiary}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.feeHead}>
            <View style={styles.feeHeadText}>
              <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
                Tax &amp; Financial Receipts
              </Text>
              <Text style={styles.feeSub}>Official verified compliance records</Text>
            </View>
            <ShieldCheck size={17} color={colors.brandDark} />
          </View>

          {d.receipts.map((r) => (
            <View key={r.id} style={styles.receipt}>
              <View style={styles.receiptIcon}>
                {r.id === 'gst' ? (
                  <Receipt size={18} color={colors.brandDark} />
                ) : (
                  <FileText size={18} color={colors.brandDark} />
                )}
              </View>
              <View style={styles.receiptText}>
                <Text style={styles.receiptName} {...shrinkToFit(0.7)}>
                  {r.name}
                </Text>
                <Text style={styles.receiptMeta} {...shrinkToFit(0.7)}>
                  {r.meta}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(advDocHref(r.name) as Href)}
                style={styles.receiptView}
              >
                <Eye size={14} color={colors.textPrimary} />
                <Text style={styles.receiptViewText} {...shrinkToFit(0.8)}>
                  View
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <DemoPressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <Download size={17} color={ink.onBrand} />
          <Text style={styles.primaryText} {...shrinkToFit(0.8)}>
            Download Full Docket Statement (PDF)
          </Text>
        </DemoPressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Send size={16} color={colors.brandDark} />
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            Share Receipt with {d.client}
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
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.titleGap, marginRight: 8, alignItems: 'center' },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  headerRef: {
    marginTop: t.subGap,
    fontFamily: font.mono,
    fontSize: 10.5,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  iconBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    marginLeft: 8,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  card: {
    marginTop: t.stripGap,
    borderRadius: 14,
    backgroundColor: colors.card,
    padding: 14,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  receivedChip: {
    minHeight: 24,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#F7E6D0',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  receivedText: {
    marginLeft: 6,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: 10.5,
    letterSpacing: 0.4,
    color: '#6B4F2A',
  },
  verified: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center' },
  verifiedText: { marginLeft: 6, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },

  totalLabel: {
    marginTop: 16,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: 11.5,
    letterSpacing: 0.8,
    color: colors.textBody,
  },
  totalValue: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: 34,
    color: colors.textPrimary,
  },
  depositLine: {
    marginTop: 7,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: 12,
    color: colors.textBody,
  },

  matterBlock: {
    marginTop: 14,
    borderRadius: 11,
    backgroundColor: '#F4F1EC',
    padding: 12,
  },
  matterLabel: { fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  matterTitle: { marginTop: 4, fontFamily: font.appHeading, fontSize: 15, color: colors.textPrimary },
  matterRef: { marginTop: 4, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },

  pairRow: { marginTop: 13, flexDirection: 'row' },
  pairCol: { flex: 1, minWidth: 0 },
  pairColRight: { alignItems: 'flex-end' },
  pairLabel: { fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },
  pairValue: { marginTop: 3, fontFamily: font.appHeading, fontSize: 13, color: colors.textPrimary },
  pairSub: { marginTop: 2, fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },
  refRow: { marginTop: 3, flexDirection: 'row', alignItems: 'center' },
  refValue: { flexShrink: 1, fontFamily: font.mono, fontSize: 11, color: colors.textPrimary },
  refCopy: { marginLeft: 6 },

  protect: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  protectText: { marginLeft: 8, flexShrink: 1, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },

  feeHead: { flexDirection: 'row', alignItems: 'flex-start' },
  feeHeadText: { flex: 1, minWidth: 0, marginRight: 8 },
  feeTitle: { fontFamily: font.appHeading, fontSize: 17, color: colors.textPrimary },
  feeSub: { marginTop: 3, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },
  netChip: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 10,
    backgroundColor: '#EFEDE9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  netChipText: { fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },

  feeRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center' },
  feeRowText: { flex: 1, minWidth: 0, marginRight: 10 },
  feeLabel: { fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary },
  feeRowSub: { marginTop: 3, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  feeValue: { fontFamily: font.appHeading, fontSize: 14.5, color: colors.textPrimary },

  net: {
    marginTop: 14,
    borderRadius: 11,
    backgroundColor: '#FBF0E2',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  netText: { flex: 1, minWidth: 0, marginRight: 8 },
  netLabel: { fontFamily: font.appSemi, fontSize: 12, letterSpacing: 0.4, color: '#6B4F2A' },
  netSub: { marginTop: 4, fontFamily: font.appBody, fontSize: 11, color: '#8A6F4B' },
  netRight: { alignItems: 'flex-end' },
  netValue: { fontFamily: font.appHeading, fontSize: 19, color: colors.textPrimary },
  readyRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center' },
  readyText: { marginLeft: 5, fontFamily: font.appBody, fontSize: 11, color: colors.brandDark },

  pendingChip: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 10,
    backgroundColor: '#FBEBD6',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pendingDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6, backgroundColor: '#8A6F4B' },
  pendingText: { flexShrink: 1, fontFamily: font.appBody, fontSize: 10.5, color: '#8A6F4B' },

  payout: {
    marginTop: 13,
    borderRadius: 11,
    backgroundColor: '#F4F1EC',
    padding: 12,
    flexDirection: 'row',
  },
  payoutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAE6DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutText: { flex: 1, minWidth: 0, marginLeft: 11 },
  payoutDate: { fontFamily: font.appHeading, fontSize: 14.5, color: colors.textPrimary },
  payoutNote: { marginTop: 5, fontFamily: font.appBody, fontSize: 11.5, lineHeight: 17, color: colors.textBody },

  bank: {
    marginTop: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    padding: 12,
  },
  bankHead: { flexDirection: 'row', alignItems: 'center' },
  bankIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1EEE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankText: { flex: 1, minWidth: 0, marginLeft: 10, marginRight: 8 },
  bankName: { fontFamily: font.appHeading, fontSize: 14, color: colors.textPrimary },
  bankType: { marginTop: 2, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  primaryChip: {
    minHeight: 20,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#EFEDE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryChipText: { fontFamily: font.appSemi, fontSize: 9.5, letterSpacing: 0.5, color: colors.textBody },
  bankRow: { marginTop: 11, flexDirection: 'row', alignItems: 'center' },
  masked: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.mono, fontSize: 13, color: colors.textPrimary },
  ifsc: { fontFamily: font.mono, fontSize: 11, color: colors.textBody },
  beneLabel: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: 11.5, color: colors.textBody },
  beneValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: 12.5, color: colors.textPrimary },

  receipt: {
    marginTop: 12,
    borderRadius: 11,
    backgroundColor: '#F4F1EC',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptText: { flex: 1, minWidth: 0, marginLeft: 11, marginRight: 8 },
  receiptName: { fontFamily: font.appHeading, fontSize: 13.5, color: colors.textPrimary },
  receiptMeta: { marginTop: 3, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  receiptView: {
    minHeight: 32,
    borderRadius: 8,
    paddingHorizontal: 11,
    backgroundColor: '#E9E6E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptViewText: { marginLeft: 6, fontFamily: font.appBody, fontSize: 12.5, color: colors.textPrimary },

  primary: {
    marginTop: 18,
    minHeight: 50,
    borderRadius: 11,
    backgroundColor: '#6B5942',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pressed: { opacity: 0.85 },
  primaryText: { marginLeft: 10, flexShrink: 1, fontFamily: font.appSemi, fontSize: 14.5, color: ink.onBrand },
  secondary: {
    marginTop: 10,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondaryText: { marginLeft: 10, flexShrink: 1, fontFamily: font.appBody, fontSize: 14.5, color: colors.textPrimary },
});
