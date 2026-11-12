import { router, type Href } from 'expo-router';
import { Check, ChevronRight, Copy, FileText } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PayHeader from './PayHeader';
import { shrinkToFit } from '../constants/textFit';
import { CO_SUCCESS } from '../data/courier';
import { courierSuccess as t, font, ink, status } from '../constants/theme';

// The "Payment Successful" screen drawn after every Scan & Pay in the courier and
// High Court batches. Extracted from app/courier/success.tsx (design/279).
//
// designs 298, 317 and 333 are pixel-identical to each other; 324 differs only
// in its button ("View Receipt"); 309 is design/279 itself. 298/317/324/333 add
// a 28pt green tick beside the title that 279 and 309 do not draw — `tick`.
//
// ⚠⚠ EVERY ONE OF THEM IS WRONG IN SUBSTANCE, and is built exactly as drawn:
//  · it still wears the Scan & Pay header — "Scan & Pay / UPI Dynamic QR";
//  · the Request ID is #PSR739482, the PROPERTY SEARCH prefix;
//  · "Your payment of ₹1377 has been received" — an amount no screen charges
//    (the courier is ₹290, every High Court payment ₹40,680);
//  · "Your forensic analysis request has been submitted" — DOCUMENT FORENSIC
//    copy, on courier, court-fee, process-fee and High Court payments.
//
// The REPLACEMENT design/298 (the service-fee success, after design/296) is the
// `hero` layout: a large green disc on top, no small tick, and the Request ID
// card moved below the payment card. The old 298 layout is still drawn — and
// still built — for the court-fee (317), pending-case (333) and process-fee
// (324) successes, whose own exports were re-issued unchanged.
//
// Reused: components/PayHeader, the same header designs 28, 29 and 30 draw.
//
// Q3 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): the screen stays until the person
// taps something. Two buttons: the drawn one ("Start Tracking", or 324's "View
// Receipt") and Home under it. Nothing advances on a timer.
//
// The courier and court callers are fixture flows (nothing was paid). The
// connected report and consultation flows pass real values via paymentSuccessCopy.
export type PaymentSuccessCopy = typeof CO_SUCCESS;

/** This payment's own copy on the drawn template (no ₹1377 / #PSR739482 / "forensic analysis"). */
export function paymentSuccessCopy({ service, reference, total, submitted }: {
  service: string;
  reference: string;
  /** Formatted amount; null when it is not known, so no empty amount is printed. */
  total: string | null;
  /** Replaces "Your <service> request has been submitted." */
  submitted?: string;
}): PaymentSuccessCopy {
  return {
    ...CO_SUCCESS,
    refValue: reference.startsWith('#') ? reference : `#${reference}`,
    successBody: total ? `Your payment of ${total} has been received.` : 'Your payment has been received.',
    successBody2: submitted ?? `Your ${service} request has been submitted.`,
  };
}

export default function PaymentSuccessScreen({
  d,
  ctaHref,
  tick = false,
  hero = false,
  homeHref = '/(tabs)/home',
  note,
}: {
  d: PaymentSuccessCopy;
  /** Where the card's button goes. */
  ctaHref: Href;
  /** design/298 draws a green tick beside the title; 279 and 309 draw none. */
  tick?: boolean;
  /** The replacement design/298: a large disc on top, Request ID card below. */
  hero?: boolean;
  /** Where Home goes: the client home unless the payer is an advocate. */
  homeHref?: Href;
  /** An honest label under the copy, e.g. a demo payment. */
  note?: string;
}) {
  const ref = (
    <View style={[styles.ref, hero && styles.refBelow]}>
      <View style={styles.refTile}>
        <FileText size={t.refTileGlyph} color={t.refBorder} strokeWidth={2} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.refLabel} {...shrinkToFit(0.8)}>
          {d.refLabel}
        </Text>
        <Text style={styles.refValue} {...shrinkToFit(0.8)}>
          {d.refValue}
        </Text>
      </View>
      <Copy size={t.copyGlyph} color={t.bodyInk} strokeWidth={2} />
    </View>
  );

  return (
    <View style={styles.screen}>
      <PayHeader padX={t.padX} title={d.title} subtitle={d.subtitle} intro={d.intro} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {hero ? (
          <View style={styles.hero}>
            <Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={3.2} />
          </View>
        ) : (
          ref
        )}

        <View style={[styles.card, hero && styles.cardBelowHero]}>
          <View style={styles.head}>
            {tick && !hero && (
              <View style={styles.tick}>
                <Check size={t.tickGlyph} color={ink.onBrand} strokeWidth={3} />
              </View>
            )}
            <View style={styles.flex}>
              <Text style={styles.title} {...shrinkToFit(0.8)}>
                {d.successTitle}
              </Text>
              <Text style={styles.body}>{d.successBody}</Text>
            </View>
          </View>
          <Text style={[styles.body, styles.body2]}>{d.successBody2}</Text>
          {note ? <Text style={[styles.body, styles.body2]}>{note}</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={d.cta}
            onPress={() => router.push(ctaHref)}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <Text style={styles.btnText} {...shrinkToFit(0.8)}>
              {d.cta}
            </Text>
            <ChevronRight size={t.btnGlyph} color={ink.onBrand} strokeWidth={2.4} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Home"
            onPress={() => router.replace(homeHref)}
            style={({ pressed }) => [styles.btn, styles.btnHome, pressed && styles.pressed]}
          >
            <Text style={[styles.btnText, styles.btnHomeText]} {...shrinkToFit(0.8)}>
              Home
            </Text>
          </Pressable>
        </View>
        {hero && ref}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.bottomPad },
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },

  ref: {
    marginTop: t.refTop,
    marginHorizontal: t.padX,
    height: t.refH,
    borderRadius: t.refRadius,
    borderWidth: 1,
    borderColor: t.refBorder,
    backgroundColor: t.refBg,
    paddingHorizontal: t.refPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refBelow: { marginTop: t.heroRefTop },
  hero: {
    marginTop: t.heroTop,
    alignSelf: 'center',
    width: t.hero,
    height: t.hero,
    borderRadius: t.hero / 2,
    backgroundColor: t.heroGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBelowHero: { marginTop: t.heroCardTop },
  refTile: { width: t.refTile, alignItems: 'center', marginRight: t.refGap },
  refLabel: { fontFamily: font.appBody, fontSize: t.refLabelSize, color: t.inkMuted },
  refValue: {
    marginTop: t.refValueTop,
    fontFamily: font.appHeading,
    fontSize: t.refValueSize,
    color: t.inkMuted,
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: t.cardBorder,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  tick: {
    width: t.tick,
    height: t.tick,
    borderRadius: t.tick / 2,
    marginRight: t.tickGap,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: t.ink },
  body: {
    marginTop: t.bodyTop,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    color: t.bodyInk,
  },
  body2: { marginTop: t.bodyGap },
  btn: {
    marginTop: t.btnTop,
    alignSelf: 'center',
    width: t.btnW,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: t.btnBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    marginRight: t.btnGap,
    fontFamily: font.appHeading,
    fontSize: t.btnSize,
    color: ink.onBrand,
  },
  // Home: the same button, outlined, under the drawn one (Q3).
  btnHome: {
    marginTop: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: t.btnBg,
  },
  btnHomeText: { marginRight: 0, color: t.inkMuted },
});
