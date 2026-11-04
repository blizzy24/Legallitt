import { router, useFocusEffect, type Href } from 'expo-router';
import { DEMO_AUTO_ADVANCE } from '../constants/dev';
import { DEMO_WAIT_MS } from '../hooks/useDemoAdvance';
import { Clock, QrCode, Smartphone } from 'lucide-react-native';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PayHeader from './PayHeader';
import QrGlyph from './QrGlyph';
import Spinner from './Spinner';
import { colors, font, ink, scanPay as s } from '../constants/theme';
import { rupees } from '../data/legalNotice';

const UPI_APPS = ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'];

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

/**
 * Scan & Pay — the screen design/29 draws, reused verbatim by Property Search
 * (design/77), Document Forensic (design/87) and now the courier flow
 * (design/278), Legal Advice and FIR Draft.
 *
 * The QR is a stylised drawing, not a payable code.
 *
 * `hold` freezes the screen: the countdown stays at its starting value and the
 * screen never advances on its own. design/278 is built that way on
 * instruction — a live countdown and a self-arriving "payment" would both be
 * lies on a screen with no payment behind it. On a held screen the drawn "Pay
 * using UPI App" button opens the success screen instead, so the flow can be
 * walked. With `onPayment` (a real payment) the screen waits for that tap and
 * nothing advances on its own. Without either, the screen still moves on after
 * `autoAdvanceMs` — a timer-driven screen listed in architecture §2.12 for removal.
 */
export default function ScanPayScreen({
  service,
  amount,
  successHref,
  query,
  hold = false,
  backHref, onBack,
  requestId,
  onPayment,
  paymentReady = true,
}: {
  service: string;
  amount: number | null;
  successHref: Href;
  query?: string;
  hold?: boolean;
  backHref?: Href; onBack?: () => void;
  requestId?: string;
  onPayment?: () => void;
  paymentReady?: boolean;
}) {
  const paymentAction = useRef(onPayment);
  useEffect(() => { paymentAction.current = onPayment; }, [onPayment]);
  const controlled = Boolean(onPayment);
  const insets = useSafeAreaInsets();
  const [left, setLeft] = useState(s.validSeconds);
  // successHref is widened to string first: with every route typed, the
  // template literal over the Href union is too large for tsc to represent.
  const base = successHref as string;
  const successTarget = query ? `${base}?${query}` : base;

  useFocusEffect(useCallback(() => {
    if (hold || controlled) return;
    const tick = setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000);
    const done = setTimeout(() => router.replace(successTarget as Href), s.autoAdvanceMs);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [hold, successTarget, controlled]));

  // DEMO: a held screen still moves on, after the shared demo wait.
  useFocusEffect(useCallback(() => {
    if (controlled || !hold || !DEMO_AUTO_ADVANCE) return;
    const done = setTimeout(() => router.replace(successTarget as Href), DEMO_WAIT_MS);
    return () => clearTimeout(done);
  }, [hold, successTarget, controlled]));

  // A screen with a real payment (onPayment) pays only on the drawn "Pay using UPI
  // App" tap — never on a timer (§2.12; owner instruction, 4 Nov 2026). That tap is
  // the simulated payment, standing in for the payer completing it in their UPI app;
  // with Razorpay it opens the real flow and capture moves to the webhook. Until the
  // tap the QR screen just waits, and the case stays resumable at payment_pending.

  return (
    <View style={styles.screen}>
      <PayHeader
        padX={s.padX}
        title="Scan & Pay"
        subtitle="UPI Dynamic QR"
        intro="Scan the QR code using any UPI app to complete your payment."
        onBack={onBack ?? (backHref
          ? () => router.canGoBack() ? router.back() : router.replace(backHref)
          : undefined)}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + s.cardGap }]} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.chips}>
            <View style={styles.scanChip}>
              <QrCode size={s.chipIcon} color={ink.accent} />
              <Text style={styles.scanChipText}>Scan to Pay</Text>
            </View>
            <View style={styles.timer}>
              <Clock size={s.chipIcon} color={colors.textBody} />
              <Text style={styles.timerText}>
                QR valid for <Text style={styles.timerValue}>{mmss(left)}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.qr}>
            <QrGlyph />
          </View>

          <Text style={styles.amount}>{amount === null ? '' : rupees(amount)}</Text>
          <Text style={styles.service}>{service}</Text>
          {requestId && <Text style={styles.service}>Request ID: {requestId}</Text>}
          <Text style={styles.instr}>Open your UPI app and scan the QR code to complete the payment.</Text>

          <View style={styles.wait}>
            <Spinner />
            <Text style={styles.waitText}>Waiting for payment…</Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.apps}>
            {UPI_APPS.map((a, i) => (
              <View key={a} style={styles.appItem}>
                {i > 0 && <Text style={styles.appDot}>·</Text>}
                <Text style={styles.appText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.altCard]}>
          <Text style={styles.altTitle}>Prefer another method?</Text>
          {/* With a real payment this drawn button is the payment: it captures (simulated)
              and moves on. On a held screen (design/278) it opens the success screen and
              charges nothing. Callers that auto-advance leave it inert, as before. */}
          <Pressable
            accessibilityRole="button"
            onPress={onPayment ? () => paymentReady && paymentAction.current?.() : hold ? () => router.replace(successTarget as Href) : undefined}
            style={styles.altButton}
          >
            <Smartphone size={s.altIcon} color={ink.accent} />
            <Text style={styles.altButtonText}>Pay using UPI App</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: s.padX,
    paddingTop: s.cardGap,
    gap: s.cardGap,
  },
  card: {
    borderRadius: s.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: s.cardPad,
    alignItems: 'center',
  },
  chips: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scanChip: {
    height: s.chipH,
    borderRadius: s.chipRadius,
    paddingHorizontal: s.chipPadX,
    backgroundColor: colors.iconChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.chipIconGap,
  },
  scanChipText: {
    fontFamily: font.appSemi,
    fontSize: s.chipTextSize,
    color: ink.accent,
  },
  timer: {
    height: s.timerH,
    borderRadius: s.timerH / 2,
    paddingHorizontal: s.timerPadX,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.chipIconGap,
  },
  timerText: {
    fontFamily: font.appBody,
    fontSize: s.timerTextSize,
    color: colors.textBody,
  },
  timerValue: {
    fontFamily: font.appHeading,
    color: colors.textPrimary,
  },
  qr: {
    marginTop: s.qrGap,
  },
  amount: {
    marginTop: s.amountGap,
    fontFamily: font.appHeading,
    fontSize: s.amountSize,
    color: colors.textPrimary,
  },
  service: {
    marginTop: s.serviceGap,
    fontFamily: font.appSemi,
    fontSize: s.serviceSize,
    color: ink.accent,
  },
  instr: {
    marginTop: s.instrGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: s.instrSize,
    lineHeight: s.instrLineHeight,
    color: colors.textBody,
    maxWidth: 250,
  },
  wait: {
    marginTop: s.waitGap,
    alignSelf: 'stretch',
    height: s.waitH,
    borderRadius: s.waitRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: s.waitBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.spinnerGap,
  },
  waitText: {
    fontFamily: font.appHeading,
    fontSize: s.waitTextSize,
    color: colors.textPrimary,
  },
  divider: {
    marginTop: s.dividerGap,
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.border,
  },
  apps: {
    marginTop: s.appsGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appDot: {
    marginHorizontal: s.appsDotGap,
    fontFamily: font.appBody,
    fontSize: s.appsSize,
    color: colors.textMuted,
  },
  appText: {
    fontFamily: font.appSemi,
    fontSize: s.appsSize,
    color: s.appsText,
  },
  altCard: {
    paddingBottom: s.cardPad - 1,
  },
  altTitle: {
    fontFamily: font.appBody,
    fontSize: s.altTitleSize,
    color: s.altTitle,
  },
  altButton: {
    marginTop: s.altButtonGap,
    alignSelf: 'stretch',
    height: s.altButtonH,
    borderRadius: s.altButtonRadius,
    borderWidth: s.altButtonBorder,
    borderColor: s.altBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.altIconGap,
  },
  altButtonText: {
    fontFamily: font.appSemi,
    fontSize: s.altTextSize,
    color: ink.accent,
  },
});
