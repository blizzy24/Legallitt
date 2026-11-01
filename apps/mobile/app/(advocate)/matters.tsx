import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import AdvocateCasesList from '../../components/AdvocateCasesList';
import {useNoticeLists} from '../../features/legal-notice/useNoticeLists';
export default function AdvocateCasesScreen(){
  const model=useNoticeLists();
  return <NoticeScreenFeedback error={model.error}><AdvocateCasesList chrome="tab" records={model.matters} statistics={model.statistics}
    onReview={model.api?matter=>model.open(matter.id,true):undefined} /></NoticeScreenFeedback>;
}
