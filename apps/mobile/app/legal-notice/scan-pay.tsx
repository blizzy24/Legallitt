import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
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
function FixtureLegalNoticeScanPayScreen() {
  const { form } = useLegalNotice();
  const params = useLocalSearchParams<{
    service?: string;
    amount?: string;
    ref?: string;
    success?: string;
    next?: string;
  }>();
  const total = params.amount ? Number(params.amount) : invoiceTotal(invoiceLines(form.tier));
  const service = params.service ?? INVOICE.service;
  const successHref = (params.success ?? '/legal-notice/success') as Href;

  // Forward everything on, so the success screen shows the same figures.
  const query = new URLSearchParams();
  if (params.service) query.set('service', params.service);
  if (params.amount) query.set('amount', params.amount);
  if (params.ref) query.set('ref', params.ref);
  if (params.next) query.set('next', params.next);

  return (
    <ScanPayScreen
      service={service}
      amount={total}
      successHref={successHref}
      query={query.toString()}
    />
  );
}

// The deployed fixture path remains unchanged; API mode is explicit.
export default function LegalNoticeScanPayScreen() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="payment" /> : <FixtureLegalNoticeScanPayScreen />;
}
