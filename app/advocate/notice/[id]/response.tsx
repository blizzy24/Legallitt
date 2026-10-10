import { useLocalSearchParams } from 'expo-router';

import NoticeResponseScreen from '../../../../components/NoticeResponseScreen';

// Advocate — legal notice response document (design/189).
//
// The whole screen lives in components/NoticeResponseScreen, shared with
// design/267 at app/advocate/notice/response-editor.tsx. A pixel diff of the
// two exports found them identical above the footer and different only in the
// three footer controls, so one component carries both and `variant` picks.
export default function AdvocateNoticeResponseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NoticeResponseScreen variant="share" caseId={id ?? 'ln-2026-1048'} />;
}
