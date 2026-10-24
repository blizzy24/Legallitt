import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import { previewNotice } from '../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Check, ChevronRight, Copy, FileText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import PayHeader from '../../components/PayHeader';
import { colors, font, ink, paySuccess as s, scanPay, status } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';
import { INVOICE, invoiceLines, invoiceTotal, rupees } from '../../data/legalNotice';

// Payment success (design/30). The file reads "Your forensic analysis request has
// been submitted" — wrong service; this says legal notice. Copy is non-functional.
//
// SHARED BY TWO SERVICES — see the note in scan-pay.tsx. Service name, amount,
// reference and the onward route all come from search params; with none it behaves
// exactly as the Legal Notice flow always did.
export function PaymentSuccessScreenView({ service, total, requestId, nextHref }: {
  service: string; total: number; requestId: string; nextHref: Href;
}) {
  return (
    <View style={styles.screen}>
      <PayHeader
        padX={scanPay.padX}
        title="Scan & Pay"
        subtitle="UPI Dynamic QR"
        intro="Scan the QR code using any UPI app to complete your payment."
        onBack={() => router.replace('/(tabs)/home')}
      />
      <View style={styles.content}>
        <View style={styles.idCard}>
          <FileText size={s.idIcon} color={colors.brand} strokeWidth={1.5} />
          <View style={styles.idText}>
            <Text style={styles.idLabel}>Request ID</Text>
            <Text style={styles.idValue}>{requestId}</Text>
          </View>
          <Pressable onPress={() => previewNotice("Copy request ID")} accessibilityRole="button" accessibilityLabel="Copy request ID" hitSlop={10}>
            <Copy size={s.copyIcon} color={colors.brand} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.headRow}>
            <View style={styles.disc}>
              <Check size={s.discIcon} color={ink.onBrand} strokeWidth={3} />
            </View>
            <View style={styles.headText}>
              <Text style={styles.title}>Payment Successful</Text>
              <Text style={styles.sub}>Your payment of {rupees(total, false)} has been received.</Text>
            </View>
          </View>
          <Text style={styles.note}>Your {service} request has been submitted.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace(nextHref)}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>Start Tracking</Text>
            <ChevronRight size={s.buttonIcon} color={ink.onBrand} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: scanPay.padX,
    paddingTop: s.idGap,
  },
  idCard: {
    height: s.idH,
    borderRadius: s.idRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: s.idPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    flex: 1,
    minWidth: 0,
    marginLeft: s.idTextGap,
  },
  idLabel: {
    fontFamily: font.appBody,
    fontSize: s.idLabelSize,
    color: s.idLabel,
  },
  idValue: {
    marginTop: s.idLineGap,
    fontFamily: font.appHeading,
    fontSize: s.idValueSize,
    color: colors.textPrimary,
  },
  card: {
    marginTop: s.cardGap,
    borderRadius: s.cardRadius,
    backgroundColor: s.cardBg,
    borderWidth: 1,
    borderColor: s.cardBorder,
    padding: s.cardPad,
    paddingBottom: s.cardPadBottom,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disc: {
    width: s.disc,
    height: s.disc,
    borderRadius: s.disc / 2,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s.discTextGap,
  },
  headText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: s.titleSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: s.lineGap,
    fontFamily: font.appBody,
    fontSize: s.subSize,
    color: colors.textBody,
  },
  note: {
    marginTop: s.noteGap,
    fontFamily: font.appBody,
    fontSize: s.noteSize,
    color: s.note,
  },
  button: {
    marginTop: s.buttonGap,
    alignSelf: 'center',
    height: s.buttonH,
    borderRadius: s.buttonRadius,
    paddingHorizontal: s.buttonPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: s.buttonTextSize,
    color: ink.onBrand,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function PaymentSuccessScreen() {
  const { form } = useLegalNotice();
  const params = useLocalSearchParams<{
    service?: string;
    amount?: string;
    ref?: string;
    next?: string;
  }>();
  const total = params.amount ? Number(params.amount) : invoiceTotal(invoiceLines(form.tier));
  const requestId = params.ref ?? `#${INVOICE.requestId}`;
  const service = params.service ?? 'legal notice';
  const nextHref = (params.next ?? '/legal-notice/tracking') as Href;

  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="tracking" /> : <PaymentSuccessScreenView service={service} total={total} requestId={requestId} nextHref={nextHref} />;
}
