import { router, type Href } from 'expo-router';
import { Clock, QrCode, Smartphone } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
 * (design/278).
 *
 * The QR is a stylised drawing, not a payable code.
 *
 * `hold` freezes the screen: the countdown stays at its starting value and the
 * screen never advances on its own. design/278 is built that way on
 * instruction — a live countdown and a self-arriving "payment" would both be
 * lies on a screen with no payment behind it. Without `hold` the screen behaves
 * exactly as the Legal Notice flow always did.
 */
export default function ScanPayScreen({
  service,
  amount,
  successHref,
  query,
  hold = false,
}: {
  service: string;
  amount: number;
  successHref: Href;
  query?: string;
  hold?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [left, setLeft] = useState(s.validSeconds);
  const successTarget = (query ? `${successHref}?${query}` : successHref) as Href;

  useEffect(() => {
    if (hold) return;
    const tick = setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000);
    const done = setTimeout(() => router.replace(successTarget), s.autoAdvanceMs);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [hold]);

  return (
    <View style={styles.screen}>
      <PayHeader padX={s.padX} title="Scan & Pay" subtitle="UPI Dynamic QR" intro="Scan the QR code using any UPI app to complete your payment." />
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

          <Text style={styles.amount}>{rupees(amount)}</Text>
          <Text style={styles.service}>{service}</Text>
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
          <Pressable accessibilityRole="button" style={styles.altButton}>
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
