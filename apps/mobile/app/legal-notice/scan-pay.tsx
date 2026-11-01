import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import { usePaymentModel } from "../../features/legal-notice/usePaymentModel";
import { useLocalSearchParams, type Href } from 'expo-router';

import ScanPayScreen from '../../components/ScanPayScreen';
import { INVOICE, invoiceLines, invoiceTotal } from '../../data/legalNotice';
import { useLegalNotice } from '../../context/legalNotice';

// Scan & Pay (design/29).
//
// SHARED BY FOUR SERVICES. design/77's Property Search flow, design/87's
// Document Forensic flow and design/278's courier flow all reuse this screen,
// so the body lives in components/ScanPayScreen and each caller passes its own
// service name, amount, reference and onward route. With no params this route
// behaves exactly as the Legal Notice flow always did.
export function LegalNoticeScanPayScreenView({ service, total, successHref, query, onPayment, paymentReady, backHref, onBack }: {
  onBack?: () => void; service: string; total: number | null; backHref?: Href; successHref: Href; query: URLSearchParams; onPayment?: () => void; paymentReady?: boolean;
}) {
  return (
    <ScanPayScreen
      backHref={backHref}
      onBack={onBack}
      service={service}
      amount={total}
      successHref={successHref}
      query={query.toString()}
      onPayment={onPayment}
      paymentReady={paymentReady}
    />
  );
}

// The deployed fixture path remains unchanged; API mode is explicit.
export default function LegalNoticeScanPayScreen() {
  const model = usePaymentModel('scan-pay');
  return <NoticeScreenFeedback error={model.error}><LegalNoticeScanPayScreenView {...model} /></NoticeScreenFeedback>;
}
