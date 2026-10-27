import { useLocalSearchParams } from 'expo-router';
import { CourierSelfDetailsView } from '../../../components/CourierSelfDetailsScreen';
import NoticeCourierDetails from '../../../features/legal-notice/NoticeCourierDetails';
export default function CourierSelfDetailsScreen() {
  const {noticeOutbound} = useLocalSearchParams<{noticeOutbound?: string}>();
  return noticeOutbound === '1' ? <NoticeCourierDetails /> : <CourierSelfDetailsView />;
}
