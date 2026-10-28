import NoticeTrackingScreen from '../../components/NoticeTrackingScreen';
import { useNoticeTrackingModel } from '../../features/legal-notice/useNoticeTrackingModel';

// Thin alias of tracking kept for the fixture demo's flow map, which lands here
// for design 437's review state. In API mode the case decides the state exactly
// as on tracking; there is no second layout.
export default function NoticeDecision() {
  return <NoticeTrackingScreen model={useNoticeTrackingModel('review')} />;
}
