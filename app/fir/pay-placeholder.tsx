import { Redirect } from 'expo-router';

// Preserve old preview links while moving the service to its payment route.
export default function FirLegacyPaymentScreen() {
  return <Redirect href="/fir/payment" />;
}
