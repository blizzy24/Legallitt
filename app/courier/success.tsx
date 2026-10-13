import { router, type Href } from 'expo-router';
import { ChevronRight, Copy, FileText } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import PayHeader from '../../components/PayHeader';
import { shrinkToFit } from '../../constants/textFit';
import { CO_SUCCESS } from '../../data/courier';
import { courierSuccess as t, font, ink } from '../../constants/theme';

// Client — payment success (design/279).
//
// ⚠⚠ THIS SCREEN CANNOT SHIP AS IT IS. It is the one screen in this batch that
// is wrong in substance rather than in detail, and it is built exactly as drawn
// so the client can see what they signed off. Four services are on it at once:
//
//  · it still wears design/278's PAYMENT header — "Scan & Pay / UPI Dynamic QR"
//    and "Scan the QR code using any UPI app to complete your payment" — on a
//    screen whose whole message is that the payment already succeeded;
//  · the Request ID is #PSR739482, the PROPERTY SEARCH prefix, on matter
//    #HCR-2026-1048;
//  · it reads "Your payment of ₹1377 has been received" where designs 277 and
//    278 both charge ₹290 — a fourth amount in one flow;
//  · it reads "Your forensic analysis request has been submitted", which is
//    DOCUMENT FORENSIC copy, on a courier booking.
//
// There is no courier content on it anywhere: no waybill, no address, no
// document count, no courier name. Nothing here except the button can be
// reached from the flow that leads to it.
//
// Reused: components/PayHeader, the same header designs 28, 29 and 30 draw —
// which is itself the defect, and is why it fits.
//
// STATIC, NOT WIRED: nothing was paid. "Start Tracking" advances to the
// shipment screen.
export default function CourierSuccessScreen() {
  const d = CO_SUCCESS;

  return (
    <View style={styles.screen}>
      <PayHeader padX={t.padX} title={d.title} subtitle={d.subtitle} intro={d.intro} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ref}>
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

        <View style={styles.card}>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.successTitle}
          </Text>
          <Text style={styles.body}>{d.successBody}</Text>
          <Text style={[styles.body, styles.body2]}>{d.successBody2}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={d.cta}
            onPress={() => router.push('/courier/shipment' as Href)}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <Text style={styles.btnText} {...shrinkToFit(0.8)}>
              {d.cta}
            </Text>
            <ChevronRight size={t.btnGlyph} color={ink.onBrand} strokeWidth={2.4} />
          </Pressable>
        </View>
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
});
