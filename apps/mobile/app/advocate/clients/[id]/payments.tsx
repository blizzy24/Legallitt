import { previewNotice } from '../../../../components/PreviewNotice';
import DemoPressable from '../../../../components/DemoPressable';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Download,
  EllipsisVertical,
  FilePlus2,
  FileText,
  Landmark,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import {
  ADV_CLIENT_PROFILE,
  ADV_PAYMENTS,
  ADV_PAYMENT_SUMMARY,
  type AdvPaymentStatus,
} from '../../../../data/advocateSide';
import { advClientSub as t, colors, font, ink } from '../../../../constants/theme';

// Client payments (design/156).
//
// MEASUREMENT CAVEAT — design/156 is a 239x1024 device mock-up, about 0.61 px/pt.
// Spacing here is derived from proportion, and several transaction references sit at
// the edge of legibility in the file; they are recorded in data/advocateSide.ts as
// the best reading and flagged there.
//
// See the earnings note at the top of data/advocateSide.ts: this screen's "Total
// Received ₹65,000" is one of four figures across the advocate side that do not
// reconcile.

const FILTERS = ['All (8)', 'Received (6)', 'Pending (1)', 'Refunded (1)'];

const STATUS: Record<AdvPaymentStatus, { label: string; bg: string; colour: string }> = {
  received: { label: 'Received', bg: '#E3F6ED', colour: '#1E9E4A' },
  pending: { label: 'Pending', bg: '#FBEBD6', colour: '#B5761F' },
  refunded: { label: 'Refunded', bg: '#EFEDE9', colour: '#6B5942' },
};

export default function AdvocateClientPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState(0);
  const c = ADV_CLIENT_PROFILE;

  const rows = useMemo(() => {
    if (filter === 1) return ADV_PAYMENTS.filter((p) => p.status === 'received');
    if (filter === 2) return ADV_PAYMENTS.filter((p) => p.status === 'pending');
    if (filter === 3) return ADV_PAYMENTS.filter((p) => p.status === 'refunded');
    return ADV_PAYMENTS;
  }, [filter]);

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
            Client Payments
          </Text>
          <Text style={styles.headerSub} {...shrinkToFit(0.75)}>
            {c.name} • {c.clientId}
          </Text>
        </View>
        <Pressable onPress={() => previewNotice("Filter")} accessibilityRole="button" accessibilityLabel="Filter" style={styles.iconBtn}>
          <SlidersHorizontal size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => previewNotice("More")} accessibilityRole="button" accessibilityLabel="More" style={styles.iconBtn}>
          <EllipsisVertical size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ledger}>
          <View style={styles.ledgerIcon}>
            <Landmark size={18} color={colors.brandDark} />
          </View>
          <View style={styles.ledgerText}>
            <View style={styles.ledgerTitleRow}>
              <Text style={styles.ledgerTitle} {...shrinkToFit(0.75)}>
                Client Trust Ledger
              </Text>
              <View style={styles.escrowChip}>
                <Text style={styles.escrowChipText} {...shrinkToFit(0.7)}>
                  ADVOCATE PAYMENTS
                </Text>
              </View>
            </View>
            <Text style={styles.ledgerSub} {...shrinkToFit(0.7)}>
              {c.type}
            </Text>
          </View>
          <ShieldCheck size={16} color={colors.textBody} />
        </View>

        <View style={styles.total}>
          <View style={styles.totalHead}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>
              Total Received
            </Text>
            <View style={styles.settled}>
              <CircleCheck size={13} color="#1E9E4A" />
              <Text style={styles.settledText} {...shrinkToFit(0.8)}>
                {ADV_PAYMENT_SUMMARY.totalChip}
              </Text>
            </View>
          </View>
          <Text style={styles.totalValue} {...shrinkToFit(0.75)}>
            ₹{ADV_PAYMENT_SUMMARY.totalReceived.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.totalSub} {...shrinkToFit(0.8)}>
            {ADV_PAYMENT_SUMMARY.escrowLine}
          </Text>
        </View>

        <View style={styles.cells}>
          <View style={styles.cell}>
            <View style={styles.cellHead}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                Pending
              </Text>
              <View style={styles.dueChip}>
                <Text style={styles.dueChipText} {...shrinkToFit(0.75)}>
                  {ADV_PAYMENT_SUMMARY.pendingChip}
                </Text>
              </View>
            </View>
            <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
              ₹{ADV_PAYMENT_SUMMARY.pending.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.cellSub} {...shrinkToFit(0.75)}>
              Due in 2 d
            </Text>
          </View>
          <View style={styles.cell}>
            <View style={styles.cellHead}>
              <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                Records
              </Text>
              <FileText size={14} color={colors.textBody} />
            </View>
            <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
              {ADV_PAYMENT_SUMMARY.records}
            </Text>
            <Text style={styles.cellSub} {...shrinkToFit(0.75)}>
              {c.clientId}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f, i) => {
            const on = i === filter;
            return (
              <Pressable
                key={f}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(i)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {rows.map((p) => {
          const st = STATUS[p.status];
          return (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              onPress={() => router.push(`/advocate/clients/${id}/payments/${p.id}` as Href)}
              style={styles.row}
            >
              <View style={styles.rowHead}>
                <Text style={styles.rowService} {...shrinkToFit(0.7)}>
                  {p.service}
                </Text>
                <Text style={styles.rowAmount} {...shrinkToFit(0.75)}>
                  ₹{p.amount.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.rowMeta}>
                <Text style={styles.rowMatter} {...shrinkToFit(0.7)}>
                  {p.matter}
                </Text>
                <View style={[styles.statusChip, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusChipText, { color: st.colour }]} {...shrinkToFit(0.75)}>
                    {st.label}
                  </Text>
                </View>
              </View>

              <View style={styles.txn}>
                <Clock size={12} color={colors.textBody} />
                <Text style={styles.txnText} {...shrinkToFit(0.65)}>
                  {p.transaction}
                </Text>
              </View>

              <View style={styles.rowFoot}>
                <Text style={styles.counterparty} {...shrinkToFit(0.7)}>
                  {p.counterparty}
                </Text>
                <Text style={styles.action} {...shrinkToFit(0.7)}>
                  {p.action}
                </Text>
                <ChevronRight size={15} color={colors.textMuted} />
              </View>
            </Pressable>
          );
        })}

        <DemoPressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        >
          <FilePlus2 size={17} color={ink.onBrand} />
          <Text style={styles.primaryText}>Generate New Invoice</Text>
        </DemoPressable>
        <Pressable onPress={() => previewNotice("Download Statement (PDF)")}
          accessibilityRole="button"
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Download size={16} color={colors.textPrimary} />
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            Download Statement (PDF)
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
  headerText: { flex: 1, minWidth: 0, marginLeft: t.titleGap, marginRight: 8 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  headerSub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
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
  ledger: {
    marginTop: t.stripGap,
    borderRadius: 12,
    backgroundColor: '#F6EFE6',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledgerIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F7E2C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledgerText: { flex: 1, minWidth: 0, marginLeft: 11, marginRight: 8 },
  ledgerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  ledgerTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: 14, color: colors.textPrimary },
  escrowChip: {
    marginLeft: 8,
    minHeight: 19,
    borderRadius: 5,
    paddingHorizontal: 7,
    backgroundColor: '#F2DEBF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  escrowChipText: {
    fontFamily: font.appSemi,
    fontSize: 8.5,
    letterSpacing: 0.4,
    color: '#6B4F2A',
  },
  ledgerSub: { marginTop: 3, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },

  total: {
    marginTop: t.cellsGap,
    borderRadius: 13,
    backgroundColor: colors.card,
    padding: 14,
  },
  totalHead: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: 12.5, color: colors.textBody },
  settled: { flexDirection: 'row', alignItems: 'center' },
  settledText: { marginLeft: 5, fontFamily: font.appBody, fontSize: 11.5, color: '#1E9E4A' },
  totalValue: { marginTop: 6, fontFamily: font.appHeading, fontSize: 27, color: colors.textPrimary },
  totalSub: { marginTop: 6, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },

  cells: { marginTop: t.cellGapX, flexDirection: 'row', gap: t.cellGapX },
  cell: { flex: 1, minWidth: 0, borderRadius: 12, backgroundColor: colors.card, padding: 12 },
  cellHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cellLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: 12, color: colors.textBody },
  dueChip: {
    minHeight: 19,
    borderRadius: 5,
    paddingHorizontal: 7,
    backgroundColor: '#FBEBD6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueChipText: { fontFamily: font.appBody, fontSize: 10, color: '#B5761F' },
  cellValue: { marginTop: 6, fontFamily: font.appHeading, fontSize: 19, color: colors.textPrimary },
  cellSub: { marginTop: 4, fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },

  chipsRow: { marginTop: t.chipsGap, height: t.chipHeight, flexGrow: 0 },
  chips: { gap: t.chipGapX, paddingRight: 4, alignItems: 'center' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOnBg, borderColor: t.chipOnBg },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },
  chipTextOn: { fontFamily: font.appSemi, color: ink.onBrand },

  row: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center' },
  rowService: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appHeading, fontSize: 14.5, color: colors.textPrimary },
  rowAmount: { fontFamily: font.appHeading, fontSize: 15.5, color: colors.textPrimary },
  rowMeta: { marginTop: 5, flexDirection: 'row', alignItems: 'center' },
  rowMatter: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: 11, color: colors.textBody },
  statusChip: {
    minHeight: 20,
    borderRadius: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: { fontFamily: font.appBody, fontSize: 10.5 },

  txn: {
    marginTop: 10,
    borderRadius: 9,
    backgroundColor: '#F5F2EC',
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnText: { marginLeft: 8, flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },

  rowFoot: { marginTop: 10, flexDirection: 'row', alignItems: 'center' },
  counterparty: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appBody, fontSize: 10.5, color: colors.textBody },
  action: { marginRight: 5, fontFamily: font.appBody, fontSize: 11, color: colors.brandDark },

  primary: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 11,
    backgroundColor: '#8A7765',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  primaryText: { marginLeft: 10, fontFamily: font.appSemi, fontSize: 15, color: ink.onBrand },
  secondary: {
    marginTop: 10,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: { marginLeft: 9, fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary },
});
