import PreviewStep from '../../components/PreviewStep';
import { useDemoWait } from '../../hooks/useDemoAdvance';

// PRICING PENDING — there is no FIR payment design.
//
// The payment screens in the FIR source batch were the Legal Notice ones verbatim:
// they read "Legal Notice", Ref #LGT-849204 and ₹999. No FIR fee, tier or invoice
// has been provided, so no FIR payment flow is built. Step 5 routes here instead.
// Replace this screen once the client confirms FIR pricing (see data/fir.ts).
//
// What renders is the neutral preview step: the service, one line, and Continue
// to the submitted screen (design/47). No amount is shown — none is settled.
export default function FirPayPlaceholderScreen() {
  useDemoWait();
  return <PreviewStep header="Payment" service="FIR Draft" next="/fir/submitted" />;
}
