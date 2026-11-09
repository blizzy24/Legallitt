import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useIntakeModel } from "../../features/legal-notice/useIntakeModel";
import { router } from 'expo-router';
import { ArrowRight, FileText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from '../../components/PaymentMethods';
import WizardShell from '../../components/WizardShell';
import { buttonShadow, colors, font, ink, payment as p, wizard as w } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';
import { INVOICE, invoiceLines, invoiceTotal, rupees } from '../../data/legalNotice';
import { paiseText, quoteLines } from '../../features/legal-notice/quote-display';

const BAR_HEIGHT = p.barPadTop + 20 + p.barButtonGap + 52 + p.captionGap + 16 + p.barPadBottom;

// Instructed step 7 — Complete Payment (design/28). The source draws
// conflicting three/six-step counts; the approved intake now uses seven steps. The UPI parent
// and its "Scan QR Code" child are both selected in the file: modelled as method +
// sub-option.
export function Step6ScreenView({ model }: { model: NoticeIntakeModel }) {
  const insets = useSafeAreaInsets();
  const { form } = model;
  const lines = model.invoiceLines;
  const total = invoiceTotal(lines);
  const quote = model.quote?.status === 'ready' ? model.quote : null;
  const displayLines = model.quoteRequired ? (quote ? quoteLines(quote.breakdown) : []) : lines.map(l => ({label: l.label, value: rupees(l.amount)}));
  const totalText = model.quoteRequired ? (quote ? paiseText(quote.breakdown.total_paise) : '') : rupees(total);
  const ready = !model.busy && (!model.quoteRequired || Boolean(quote) && !model.quoteLoading);

  return (
    <View style={styles.screen}>
      <WizardShell busy={model.busy} onBack={model.back}
        step={7} totalSteps={7}
        header="leading"
        title="Complete Payment"
        subtitle="Step 7 of 7"
        align="top"
        background="tinted"
        hideButton
        bottomInset={BAR_HEIGHT + insets.bottom + w.contentGap}
        buttonLabel=""
        onContinue={() => {}}
      >
        <View style={styles.invoice}>
          <View style={styles.chip}>
            <FileText size={p.chipIcon} color={ink.accent} />
          </View>
          <View style={styles.tile}>
            <FileText size={p.tileIcon} color={ink.accent} />
          </View>
          <Text style={styles.invoiceTitle}>{model.invoice.service}</Text>
          <Text style={styles.ref}>
            Ref ID: <Text style={styles.mono}>#{model.invoice.refId}</Text> ·
          </Text>
          <View style={styles.divider} />
          <View style={styles.rows}>
            {displayLines.map((l) => (
              <View key={l.label} style={styles.row}>
                <Text style={styles.rowLabel}>{l.label}</Text>
                <Text style={styles.rowValue}>{l.value}</Text>
              </View>
            ))}
          </View>
          {quote && BigInt(quote.breakdown.page_unit_paise) > 0n && <Text style={styles.note}>
            {quote.breakdown.total_pages} PDF pages across all files; {quote.breakdown.included_pages} included.
          </Text>}
          {model.quoteLoading && <Text accessibilityLiveRegion="polite" style={styles.note}>Calculating your payment…</Text>}
          {(model.quoteError || model.quote?.status === 'blocked') && <View accessibilityLiveRegion="polite">
            <Text style={styles.quoteError}>{model.quoteError || (model.quote?.status === 'blocked' ? model.quote.message : '')}</Text>
            {model.quote?.status === 'blocked' && model.quote.documents.map(doc => <View key={doc.id}>
              <Text style={styles.quoteError}>{doc.filename}: {doc.reason}</Text>
              <Pressable accessibilityRole="button" disabled={model.busy} onPress={() => model.removeBlockedUpload?.(doc.id)}>
                <Text style={styles.sectionLink}>Remove upload: {doc.filename}</Text>
              </Pressable>
            </View>)}
            <Pressable accessibilityRole="button" onPress={model.openDocuments}><Text style={styles.sectionLink}>Open Documents</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={model.retryQuote}><Text style={styles.sectionLink}>Retry price calculation</Text></Pressable>
          </View>}
          {(!model.quoteRequired || quote) && <>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{totalText}</Text>
          </View>
          <Text style={styles.note}>Inclusive of all legal taxes</Text>
          </>}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
          <Text style={styles.sectionLink}>Fast &amp; Secure</Text>
        </View>

        <PaymentMethods />

      </WizardShell>

      <View style={[styles.bar, { paddingBottom: insets.bottom + p.barPadBottom }]}>
        {totalText ? <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amountValue}>{totalText}</Text>
        </View> : <Text style={styles.quoteError}>{model.quoteLoading ? 'Calculating payment…' : 'Payment is blocked. See the explanation and actions in the fee breakdown above.'}</Text>}
        <Pressable
          accessibilityRole="button"
          disabled={!ready}
          onPress={() => model.continue()}
          style={({ pressed }) => [styles.pay, (pressed || !ready) && styles.pressed]}
        >
          <Text style={styles.payLabel}>Pay</Text>
          <ArrowRight size={p.buttonIcon} color={ink.onBrand} />
        </Pressable>
        <Text style={styles.caption}>Opens dynamic QR payment screen for instant verification</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quoteError: {color: colors.textPrimary, fontFamily: font.appBody, marginVertical: 8},
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  invoice: {
    borderRadius: p.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: p.cardPad,
    paddingBottom: p.cardPadBottom,
  },
  chip: {
    width: p.chipW,
    height: p.chipH,
    borderRadius: p.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    position: 'absolute',
    top: p.cardPad - 2,
    right: p.cardPad - 1,
    width: p.tile,
    height: p.tile,
    borderRadius: p.tileRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceTitle: {
    marginTop: p.titleGap,
    fontFamily: font.appHeading,
    fontSize: p.titleSize,
    color: p.invoiceText,
  },
  ref: {
    marginTop: p.refGap,
    fontFamily: font.appBody,
    fontSize: p.refSize,
    color: colors.textBody,
  },
  mono: {
    fontFamily: font.mono,
  },
  divider: {
    marginTop: p.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  rows: {
    marginTop: p.rowsGap,
  },
  row: {
    minHeight: p.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    flex: 1, marginRight: 12,
    fontFamily: font.appBody,
    fontSize: p.rowLabelSize,
    color: p.rowLabel,
  },
  rowValue: {
    fontFamily: font.appSemi,
    fontSize: p.rowValueSize,
    color: p.invoiceText,
  },
  totalRow: {
    marginTop: p.totalGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: font.appHeading,
    fontSize: p.totalLabelSize,
    color: p.invoiceText,
  },
  totalValue: {
    fontFamily: font.appHeading,
    fontSize: p.totalValueSize,
    color: p.invoiceText,
  },
  note: {
    marginTop: p.noteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: p.noteSize,
    color: p.rowLabel,
  },
  sectionRow: {
    marginTop: p.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: font.appSemi,
    fontSize: p.sectionSize,
    letterSpacing: p.sectionSpacing,
    color: p.sectionText,
  },
  sectionLink: {
    fontFamily: font.appBody,
    fontSize: p.sectionLinkSize,
    color: ink.accent,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: p.barTopColor,
    paddingTop: p.barPadTop,
    paddingHorizontal: w.padX,
  },
  amountRow: {
    paddingHorizontal: p.barRowInset,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontFamily: font.appBody,
    fontSize: p.amountLabelSize,
    color: p.rowLabel,
  },
  amountValue: {
    fontFamily: font.appHeading,
    fontSize: p.amountValueSize,
    color: colors.textPrimary,
  },
  pay: {
    marginTop: p.barButtonGap,
    height: 52,
    borderRadius: p.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: p.buttonIconGap,
    ...buttonShadow,
  },
  pressed: {
    opacity: 0.85,
  },
  payLabel: {
    fontFamily: font.appSemi,
    fontSize: p.buttonLabelSize,
    color: ink.onBrand,
  },
  caption: {
    marginTop: p.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: p.captionSize,
    color: p.rowLabel,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step6Screen() {
  const { model } = useIntakeModel("step6");
  return <NoticeScreenFeedback error={model.error}><Step6ScreenView model={model} /></NoticeScreenFeedback>;
}
