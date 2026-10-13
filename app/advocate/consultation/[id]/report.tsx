import { useLocalSearchParams } from 'expo-router';

import ReportSentScreen from '../../../../components/ReportSentScreen';
import { ADV_LA_REPORT } from '../../../../data/advocateSide';

// Send report — Legal Advice (design/288). Layout lives in
// components/ReportSentScreen.tsx, the component behind design/203.
//
// design/288 and design/203 (Legal Notice, app/advocate/notice/[id]/report.tsx) are
// visually identical: they differ only in the payout figure (₹25,650 here, ₹3,500
// there) and the service name. The service name is carried in each flow's own data
// record and is not drawn on either screen. See data/advocateSide.ts.
//
// Nothing pushes here yet — no Legal Advice screen leads to a report step.

export default function AdvocateLegalAdviceReportScreen() {
  useLocalSearchParams<{ id: string }>();
  return <ReportSentScreen r={ADV_LA_REPORT} />;
}
