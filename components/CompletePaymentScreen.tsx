import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from './PaymentMethods';
import { shrinkToFit } from '../constants/textFit';
import type { CO_PAYMENT } from '../data/courier';
import { courierPayment as t, font, ink } from '../constants/theme';

// The "Complete Payment" screen: a fee card, the shared payment-method list and
// a sticky Amount-to-pay bar. Extracted from app/courier/payment.tsx (design/277)
// when the High Court batch drew the same screen five more times (designs 296,
// 315, 322 and 331 are pixel-identical to each other; 307 is 277 itself). The
// two exports differ only in the figures, so the figures are the only input.
//
// Callers: app/courier/payment.tsx (₹290, design/277/307) and the shared High
// Court / District Court payment (₹40,680, see data/highCourt.ts HC_PAYMENT).
//
// REUSED WHOLE: components/PaymentMethods — design/277 notes below still apply.
//
// ⚠ design/277 shows TWO payment methods selected at once: the UPI radio is
//   filled AND "Scan QR Code" carries its own "Selected" pill and filled radio.
//   It is how the shared component already behaves, so it is left as it is.
//
// STATIC, NOT WIRED: all payment. No Razorpay, no UPI intent, no deep link.
// "Pay" advances to the Scan & Pay screen and charges nothing.
const BAR_H = 14 + 20 + 12 + 51 + 14;

export type CompletePaymentCopy = typeof CO_PAYMENT;

export default function CompletePaymentScreen({
  d,
  payHref,
  backHref,
}: {
  d: CompletePaymentCopy;
  /** Where "Pay" goes — the Scan & Pay step. Nothing is charged. */
  payHref: Href;
  /** Where Back goes when there is no history. */
  backHref: Href;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace(backHref))}
          style={styles.circle}
        >
          <ArrowLeft size={t.backIcon} color={t.ink} strokeWidth={2.1} />
        </Pressable>
        <Text style={styles.headerTitle} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: BAR_H + insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/*
            The big tile is drawn top-right and the title runs UNDER it, so the
            tile is taken out of flow rather than sharing a row with the chip.
          */}
          <View style={styles.tile}>
            <FileText size={t.tileIcon} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.chip}>
            <FileText size={t.chipIcon} color={t.brand} strokeWidth={2} />
          </View>
          <Text style={styles.cardTitle} {...shrinkToFit(0.75)}>
            {d.service}
          </Text>
          <Text style={styles.ref} {...shrinkToFit(0.8)}>
            {d.ref}
          </Text>

          <View style={styles.divider} />

          {d.lines.map((l, i) => (
            <View key={l.label} style={[styles.row, i > 0 && styles.rowNext]}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {l.label}
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {l.value}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>
              {d.totalLabel}
            </Text>
            <Text style={styles.totalValue} {...shrinkToFit(0.8)}>
              {d.total}
            </Text>
          </View>
          <Text style={styles.note} {...shrinkToFit(0.8)}>
            {d.note}
          </Text>
        </View>

        <View style={styles.methodHead}>
          <Text style={styles.methodLabel} {...shrinkToFit(0.8)}>
            {d.methodLabel}
          </Text>
          <Text style={styles.methodNote} {...shrinkToFit(0.8)}>
            {d.methodNote}
          </Text>
        </View>

        <PaymentMethods />

        <View style={styles.secure}>
          <ShieldCheck size={t.secureIcon} color={t.inkMuted} strokeWidth={2} />
          <Text style={styles.secureText}>{d.secure}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} {...shrinkToFit(0.8)}>
            {d.barLabel}
          </Text>
          <Text style={styles.barAmount} {...shrinkToFit(0.8)}>
            {d.total}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.pay}
          onPress={() => router.push(payHref)}
          style={({ pressed }) => [styles.pay, pressed && styles.pressed]}
        >
          <Text style={styles.payText} {...shrinkToFit(0.8)}>
            {d.pay}
          </Text>
          <ArrowRight size={t.payIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: {},
  pressed: { opacity: 0.9 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: 12,
    backgroundColor: t.bg,
    borderBottomWidth: 1,
    borderBottomColor: t.divider,
  },
  circle: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: t.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    marginLeft: t.backGap,
    fontFamily: font.appSemi,
    fontSize: t.titleSize,
    color: t.ink,
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  chip: {
    alignSelf: 'flex-start',
    width: t.chipW,
    height: t.chipH,
    borderRadius: t.chipRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    position: 'absolute',
    right: t.cardPadX,
    top: t.cardPadTop,
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: t.ink,
  },
  ref: { marginTop: t.refTop, fontFamily: font.appBody, fontSize: t.refSize, color: t.inkMuted },
  divider: { marginTop: t.dividerTop, height: 1, backgroundColor: '#EDE9E3' },
  row: { marginTop: t.rowTop, flexDirection: 'row', alignItems: 'center' },
  rowNext: { marginTop: t.rowGap },
  rowLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.rowSize, color: t.inkMuted },
  rowValue: { fontFamily: font.appSemi, fontSize: t.rowSize, color: t.ink },
  totalRow: { marginTop: t.totalTop, flexDirection: 'row', alignItems: 'center' },
  totalLabel: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.totalLabelSize,
    color: t.ink,
  },
  totalValue: { fontFamily: font.appHeading, fontSize: t.totalValueSize, color: t.ink },
  note: {
    marginTop: t.noteTop,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: t.inkMuted,
  },

  methodHead: {
    marginTop: t.methodTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodLabel: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.methodLabelSize,
    letterSpacing: t.methodLabelSpacing,
    color: t.inkMuted,
  },
  methodNote: { fontFamily: font.appBody, fontSize: t.methodNoteSize, color: t.brand },

  secure: {
    marginTop: t.secureTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secureText: {
    flex: 1,
    marginLeft: t.secureGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.secureSize,
    lineHeight: t.secureLine,
    color: t.inkMuted,
  },

  bar: {
    backgroundColor: '#FFFFFE',
    paddingTop: t.barPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: t.divider,
  },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.barLabelSize, color: t.inkMuted },
  barAmount: { fontFamily: font.appHeading, fontSize: t.barAmountSize, color: t.ink },
  pay: {
    marginTop: t.payTop,
    height: t.payH,
    borderRadius: t.payRadius,
    backgroundColor: t.payBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    marginRight: t.payIconGap,
    fontFamily: font.appHeading,
    fontSize: t.paySize,
    color: ink.onBrand,
  },
});
