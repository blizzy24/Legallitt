import { useLocalSearchParams, type Href } from 'expo-router';

import CompletePaymentScreen from '../../components/CompletePaymentScreen';
import { CO_PAYMENT } from '../../data/courier';

// Client — complete payment for the courier booking (design/277).
//
// The body is components/CompletePaymentScreen (extracted from this file when
// the High Court batch drew the same screen again). design/307 is this export.
//
// REUSED WHOLE: components/PaymentMethods. design/277 draws the same four-option
// list as designs 28, 77, 86 and the advocate notice payment, and it measures
// the same: the UPI group 356.0–576.5pt against the component's 221pt block,
// Cards at 608.5 and Net Banking at 686.5, each within 1.5pt. Nothing was
// changed and no variant was added.
//
// ⚠ Note 9 — design/277 shows TWO payment methods selected at once: the UPI
//   radio is filled AND "Scan QR Code" carries its own "Selected" pill and
//   filled radio. A real radio group cannot do that. It is how the shared
//   component already behaves, so it is left exactly as it is.
// ⚠ Note 2 — Service Fee ₹250 + "Goods & Services Tax (GST 18%)" ₹40 =
//   "Total Payable ₹290". 18% of ₹250 is ₹45 and the total would be ₹295.
// ⚠ Note 11 — the title is drawn "High Court Represantative", misspelt and
//   different from "High Court Representation" on designs 275 and 284.
// ⚠ Note 18 — the reference is #LGT-849204, the Legal Notice prefix, and its
//   trailing "·" has nothing after it.
//
// STATIC, NOT WIRED: all payment. No Razorpay, no UPI intent, no deep link.
// "Pay" advances to the Scan & Pay screen and charges nothing.
export default function CourierPaymentScreen() {
  // design/306 (High Court courier) enters with ?flow=hcr so the rest of the
  // journey returns to the High Court courier screens; see app/courier/success.tsx.
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const q = flow ? `?flow=${flow}` : '';
  return (
    <CompletePaymentScreen
      d={CO_PAYMENT}
      payHref={`/courier/scan-pay${q}` as Href}
      backHref={'/courier/choose' as Href}
    />
  );
}
