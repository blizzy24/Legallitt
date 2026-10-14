import { useLocalSearchParams, type Href } from 'expo-router';

import PaymentSuccessScreen from '../../components/PaymentSuccessScreen';
import { CO_SUCCESS } from '../../data/courier';

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
// The body is components/PaymentSuccessScreen. design/309 is this export.
//
// Reused: components/PayHeader, the same header designs 28, 29 and 30 draw —
// which is itself the defect, and is why it fits.
//
// STATIC, NOT WIRED: nothing was paid. "Start Tracking" advances to the
// shipment screen.
export default function CourierSuccessScreen() {
  // ?flow=hcr: the High Court courier journey (designs 304-312) continues to its
  // own shipment screen, design/310; ?flow=dcr: the District Court courier
  // (351-355) continues to design/353; otherwise design/280.
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const next =
    flow === 'hcr'
      ? '/services/high-court/courier/shipment'
      : flow === 'dcr'
        ? '/services/district-court/courier/shipment'
        : '/courier/shipment';
  return <PaymentSuccessScreen d={CO_SUCCESS} ctaHref={next as Href} />;
}
