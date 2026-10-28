import NoticeTrackingScreen from '../../components/NoticeTrackingScreen';
import { useNoticeTrackingModel } from '../../features/legal-notice/useNoticeTrackingModel';

// Design 437. In the fixture demo this route is the review state the flow map
// lands on; in API mode the case decides the state.
export default function NoticeDecision() {
  return <NoticeTrackingScreen model={useNoticeTrackingModel('review')} />;
}
