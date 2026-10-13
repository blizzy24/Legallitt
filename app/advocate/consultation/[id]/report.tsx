import { useLocalSearchParams, type Href } from 'expo-router';

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
// Reached from the docket record's Continue (design/180).

export default function AdvocateLegalAdviceReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // ⚠ ORDER INFERRED, no export shows it: docket (design/180) -> this screen ->
  // completed (design/181). design/288's button still reads "Back To Home" as
  // drawn; in this flow it opens Completed, whose own button goes home.
  return <ReportSentScreen r={ADV_LA_REPORT} onwardHref={`/advocate/consultation/${id}/completed` as Href} />;
}
