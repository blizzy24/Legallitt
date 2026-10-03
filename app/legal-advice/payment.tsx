import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// ─────────────────────────────────────────────────────────────────────────────
// DELIBERATE PLACEHOLDER — NOT AN UNFINISHED SCREEN.
//
// The payment screens (design/108, 109, 110) are NOT built, and must not be built,
// until the pricing is resolved. There are two problems, both in the designs:
//
// 1. TWO CONTRADICTORY PRICE TABLES for the same three consultation types.
//      design/102 (landing)  Chat ₹499   Video ₹999    Audio ₹699
//      design/104 (choose)   Chat ₹499   Audio ₹999    Video ₹1,499
//    Audio and video swap rank, and video nearly doubles.
//
// 2. A SECOND, UNRECONCILED PRICING AXIS. Advocate experience tiers (design/122-124)
//    are priced "Starting at" ₹999 / ₹799 / ₹599 / ₹499. No screen says whether
//    experience replaces the consultation-type price, adds to it, or sets a floor.
//
// 3. A BARE "STANDARD FEE ₹999" in design/124's bottom bar, which does not say what
//    it is the fee for. ₹999 is video on the landing and audio on the choose screen,
//    so the bar either contradicts one of them or quotes a third, flat price.
//
// Two more figures that no tier produces: design/117's follow-up fee of ₹1,500 with
// a ₹99 platform fee (every other service charges ₹199), and design/116's ₹100
// "Written Legal Advice & Action Plan" upsell.
//
// And one more axis nobody has reconciled: chat is sold as a "30 Mins Session" on
// the landing, "Up to 7 days" on the choose screen and "Up to 30 mins" on the
// experience screen. If chat is a seven-day thread rather than a half-hour call,
// it is not the same product as the other two and may not be priced like one.
//
// Every figure is recorded in data/legalAdvice.ts. Nothing computes a total, here
// or anywhere else in this flow.
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKERS = [
  'Which price table is correct — the landing’s or the choose screen’s?',
  'How do consultation type and advocate experience combine into one amount?',
  'What is the bare “Standard Fee ₹999” on the date screen the fee for?',
  'Is the follow-up platform fee ₹99 or ₹199, as everywhere else?',
  'Is chat a 30-minute call or a 7-day thread? The designs say both.',
];

export default function LegalAdvicePaymentScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Payment" />
      <View style={styles.body}>
        <Text style={styles.title}>Payment is blocked pending pricing</Text>
        <Text style={styles.text}>
          This screen is deliberately not built. The designs carry two contradictory price
          tables for the same three consultation types, plus a second pricing axis
          (advocate experience) that no screen reconciles with the first.
        </Text>
        {BLOCKERS.map((b) => (
          <Text key={b} style={styles.item}>
            •  {b}
          </Text>
        ))}
        <Text style={styles.text}>
          Every figure from the designs is recorded in data/legalAdvice.ts. Nothing in this
          flow computes a total.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: space.screenX, paddingTop: t.sectionGap, gap: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.rowTitleSize + 3, color: colors.textPrimary },
  text: { fontFamily: font.appBody, fontSize: t.rowSubSize, lineHeight: 20, color: colors.textBody },
  item: { fontFamily: font.appBody, fontSize: t.rowSubSize, lineHeight: 20, color: colors.textPrimary },
});
