import NoticeTrackingScreen from '../../components/NoticeTrackingScreen';
import { useNoticeTrackingModel } from '../../features/legal-notice/useNoticeTrackingModel';

// Legal Notice Tracking, design 437 (438 is revealed in place by Request
// Changes). The case decides the state in API mode; the fixture demo starts in
// drafting and the flow map carries it to request-submitted, the review alias.
export default function TrackingScreen() {
  return <NoticeTrackingScreen model={useNoticeTrackingModel('drafting')} />;
}
