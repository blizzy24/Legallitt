import {useAdvocateNoticeModel} from '../../../../features/legal-notice/useAdvocateNoticeModel';
import { useLocalSearchParams } from 'expo-router';

import ReportSentScreen from '../../../../components/ReportSentScreen';
import { ADV_NOTICE_REPORT } from '../../../../data/advocateSide';

// Send report (design/203). Layout lives in components/ReportSentScreen.tsx, which
// design/212 reuses — the two exports are the same pixels apart from the figure.
//
// ⚠ THE ADVOCATE IS SHOWN THE CLIENT'S PAYMENT AS THEIR PAYOUT. "Advocate Payout
// ₹3,500/-" is the GROSS client fee from design/185, whose own breakdown nets the
// advocate ₹3,087 after a ₹350 platform fee and ₹63 charges. design/212, the same
// screen for the property search, prints the correct net. Built as drawn;
// design/185 still computes the real net via advNoticeFee().

export default function AdvocateNoticeReportScreen() {
  useLocalSearchParams<{ id: string }>();
  const model=useAdvocateNoticeModel('report');
  return <ReportSentScreen r={model.data.ADV_NOTICE_REPORT} />;
}
