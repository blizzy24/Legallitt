import { useLocalSearchParams } from 'expo-router';

import ReportSentScreen from '../../../../components/ReportSentScreen';
import { ADV_PSR_SENT } from '../../../../data/advocateSide';

// Report sent (design/212). Layout lives in components/ReportSentScreen.tsx.
//
// ⚠ design/212 IS design/203 — the two exports differ only in the payout figure
// (rows 677–715). And design/212 is the one that is right: ₹3,800 matches the
// payout design/206 states, where design/203's ₹3,500 is the client's gross fee.
//
// ⚠ The header still reads "Send Report" on the sent-confirmation screen.
//
// See data/advocateSide.ts.

export default function AdvocatePropertySearchSentScreen() {
  useLocalSearchParams<{ id: string }>();
  return <ReportSentScreen r={ADV_PSR_SENT} />;
}
