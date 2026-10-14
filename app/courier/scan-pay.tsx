import { useLocalSearchParams, type Href } from 'expo-router';

import ScanPayScreen from '../../components/ScanPayScreen';
import { CO_SCAN_PAY, CO_SCAN_PAY_HCR } from '../../data/courier';

// Client — Scan & Pay for the courier booking (design/278).
//
// REUSED WHOLE: components/ScanPayScreen, the screen design/29 draws and
// designs 77 and 87 already reuse. design/278 measures the same band for band —
// the header at 17.0pt, the "Scan to Pay" chip at 79.0, the QR block
// 175.0–382.5, the amount at 404.5, the service name at 439.0, the waiting row
// at 520.5, the UPI apps at 576.0 and the alternate-method button at 663.5,
// every one of them within 3.5pt of the existing screen. Nothing was rebuilt;
// the body was lifted out of app/legal-notice/scan-pay.tsx into the component
// and that route re-verified at 0 differing pixels of 1,404,000.
//
// ⚠ Note 3 — the QR is labelled "Legal Notice" on a High Court Representation
//   matter, for ₹290 of COURIER fee. Drawn that way, so drawn that way here.
// ⚠ Note 2 — ₹290 is the total design/277 reaches by charging ₹40 of GST on
//   ₹250 instead of ₹45.
//
// STATIC, NOT WIRED, and deliberately more static than the other callers:
//  · the QR is components/QrGlyph, a drawn glyph. No real QR is generated — a
//    scannable code on a screen with no payment behind it is worse than a
//    drawn one.
//  · "QR valid for 10:00" is a fixed string. The `hold` prop freezes the
//    countdown; there is no timer.
//  · the "Waiting for payment…" spinner animates and polls nothing, and the
//    screen never advances on its own.
//  · the drawn "Pay using UPI App" button opens the success screen (with
//    ?flow=hcr carried through for the High Court courier). It launches no UPI
//    app and charges nothing — it only lets the journey continue.
export default function CourierScanPayScreen() {
  // ?flow=hcr is carried through to the success screen (see app/courier/success.tsx).
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  // The High Court courier's QR was re-issued at ₹249 (design/308, 14 Oct).
  const d = flow === 'hcr' ? CO_SCAN_PAY_HCR : CO_SCAN_PAY;
  return (
    <ScanPayScreen
      service={d.service}
      amount={d.amount}
      successHref={'/courier/success' as Href}
      query={flow ? `flow=${flow}` : undefined}
      hold
    />
  );
}
