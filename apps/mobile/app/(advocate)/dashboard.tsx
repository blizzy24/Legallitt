import AdvocateDashboardScreen from '../../components/AdvocateDashboardScreen';
import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import {useAdvocateDashboard} from '../../features/legal-notice/useAdvocateDashboard';
export default function AdvocateDashboard() {
  const {error,...model}=useAdvocateDashboard();
  return <NoticeScreenFeedback error={error}><AdvocateDashboardScreen {...model}/></NoticeScreenFeedback>;
}
