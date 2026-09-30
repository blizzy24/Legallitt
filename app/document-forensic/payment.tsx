import { router, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from '../../components/PaymentMethods';
import { shrinkToFit } from '../../constants/textFit';
import { colors, dfPayment as t, font, ink } from '../../constants/theme';
import { useDocumentForensic } from '../../context/documentForensic';
import { rupees } from '../../data/legalNotice';
import {
  DF_REQUEST_ID,
  DF_SAMPLE,
  DF_SERVICE,
  dfInvoiceLines,
  dfInvoiceTotal,
  dfDocTypeLabel,
} from '../../data/documentForensic';

// Complete Payment (design/86), step 3 of 3.
//
// PRICING — design/86's ₹3,167 Service Fee and ₹3,939 total are NOT reproduced. The
// invoice is computed from the tier chosen on design/82 by the established method
// (fee + 18% GST truncated + ₹199 platform fee):
//
//     Ordinary  ₹1,499 + ₹269 + ₹199 = ₹1,967
//     Urgent    ₹2,999 + ₹539 + ₹199 = ₹3,737
//
// REPORTED — design/87 draws the scan-pay screen AND a success card in one frame,
// and the two disagree: the QR reads ₹3,939 while the success card reads ₹3,737 — a
// third figure on top of design/86's. ₹3,737 is exactly the Urgent total this
// formula produces, so that one is right and the other two are not. The computed
// amount is used throughout the flow.
//
// REPORTED — design/86's Ref ID reads "#LGT-849204", the Legal Notice reference. A
// DF-prefixed reference is used instead. See DF_REQUEST_ID in data/documentForensic.
//
// REPORTED — design/86 prints "Plat form fees"; rendered as "Platform fees", the
// same correction design/28 needed.
//
// The button reads "Pay & Start Analysis", which no other payment screen in the app
// does — every other one just reads "Pay". Kept as drawn.

const BAR_HEIGHT = t.barPadTop + 20 + 12 + t.payHeight + t.barPadBottom;

export default function DocumentForensicPaymentScreen() {
  const insets = useSafeAreaInsets();
  const { form } = useDocumentForensic();
  const lines = dfInvoiceLines(form.tier);
  const total = dfInvoiceTotal(form.tier);

  const payHref = (() => {
    const q = new URLSearchParams({
      service: DF_SERVICE,
      amount: String(total),
      ref: DF_REQUEST_ID,
      success: '/legal-notice/success',
      next: '/document-forensic/submitted',
    });
    return `/legal-notice/scan-pay?${q}` as Href;
  })();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/document-forensic/review')
          }
          style={styles.circle}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Complete Payment
          </Text>
          <Text style={styles.step} {...shrinkToFit(0.8)}>
            Step 3 of 3 · Final Step
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BAR_HEIGHT + insets.bottom + t.invoiceGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.invoice}>
          <View style={styles.chip}>
            <FileText size={t.chipIcon} color={ink.accent} />
          </View>
          <View style={styles.tile}>
            <FileText size={t.tileIcon} color={ink.accent} />
          </View>

          <Text style={styles.invoiceTitle} {...shrinkToFit(0.8)}>
            {DF_SERVICE}
          </Text>
          <Text style={styles.ref} {...shrinkToFit(0.75)}>
            Ref ID: <Text style={styles.mono}>{DF_REQUEST_ID}</Text> ·{' '}
            {dfDocTypeLabel(form.docType) || DF_SAMPLE.docType}
          </Text>

          <View style={styles.divider} />

          {lines.map((l) => (
            <View key={l.label} style={styles.row}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {l.label}
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                {rupees(l.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>
              Total Payable
            </Text>
            <Text style={styles.totalValue} {...shrinkToFit(0.8)}>
              {rupees(total)}
            </Text>
          </View>
          <Text style={styles.note} {...shrinkToFit(0.8)}>
            Inclusive of all legal taxes
          </Text>
        </View>

        <View style={styles.methodHead}>
          <Text style={styles.methodLabel} {...shrinkToFit(0.8)}>
            SELECT PAYMENT METHOD
          </Text>
          <Text style={styles.methodNote} {...shrinkToFit(0.8)}>
            Fast &amp; Secure
          </Text>
        </View>

        <PaymentMethods />

        <View style={styles.secure}>
          <ShieldCheck size={t.secureIcon} color={ink.accent} />
          <Text style={styles.secureText} {...shrinkToFit(0.75)}>
            Payments are encrypted and processed securely.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel} {...shrinkToFit(0.8)}>
            Amount to pay
          </Text>
          <Text style={styles.amountValue} {...shrinkToFit(0.8)}>
            {rupees(total)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(payHref)}
          style={({ pressed }) => [styles.pay, pressed && styles.pressed]}
        >
          <Text style={styles.payLabel} {...shrinkToFit(0.75)}>
            Pay &amp; Start Analysis
          </Text>
          <ArrowRight size={t.payIcon} color={ink.onBrand} style={styles.payIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 12,
    backgroundColor: colors.appBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: t.backButton,
    height: t.backButton,
    borderRadius: t.backButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
  },
  headerTitle: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  step: {
    marginTop: t.stepGap,
    fontFamily: font.appBody,
    fontSize: t.stepSize,
    color: colors.textBody,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  invoice: {
    marginTop: t.invoiceGap,
    borderRadius: t.invoiceRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.invoicePad,
  },
  chip: {
    width: t.chipW,
    height: t.chipH,
    borderRadius: t.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    position: 'absolute',
    top: t.invoicePad,
    right: t.invoicePad,
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceTitle: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.invoiceTitleSize,
    color: colors.textPrimary,
  },
  ref: {
    marginTop: t.refGap,
    fontFamily: font.appBody,
    fontSize: t.refSize,
    color: colors.textBody,
  },
  mono: {
    fontFamily: font.mono,
  },
  divider: {
    marginTop: t.dividerGap,
    marginBottom: t.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    marginBottom: t.rowGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    marginLeft: 10,
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.totalLabelSize,
    color: colors.textPrimary,
  },
  totalValue: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: t.totalValueSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: colors.textBody,
  },
  methodHead: {
    marginTop: t.methodGap,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.methodLabelSize,
    letterSpacing: t.methodLabelSpacing,
    color: colors.textPrimary,
  },
  methodNote: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.methodNoteSize,
    color: ink.accent,
  },
  secure: {
    marginTop: t.secureGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureText: {
    marginLeft: t.secureIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.secureSize,
    color: colors.textBody,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: t.padX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountBlock: {
    flex: 1,
    minWidth: 0,
  },
  amountLabel: {
    fontFamily: font.appBody,
    fontSize: t.barLabelSize,
    color: colors.textBody,
  },
  amountValue: {
    marginTop: t.barAmountGap,
    fontFamily: font.appHeading,
    fontSize: t.barAmountSize,
    color: colors.textPrimary,
  },
  pay: {
    marginLeft: 12,
    flexShrink: 1,
    minHeight: t.payHeight,
    borderRadius: t.payRadius,
    paddingHorizontal: t.payPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  payLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.paySize,
    color: ink.onBrand,
  },
  payIcon: {
    marginLeft: t.payIconGap,
  },
});
