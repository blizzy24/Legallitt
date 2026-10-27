import AdvocateCasesList from '../../components/AdvocateCasesList';
import {useNoticeLists} from '../../features/legal-notice/useNoticeLists';
export default function AdvocateCasesScreen(){
  const model=useNoticeLists();
  return <AdvocateCasesList chrome="tab" records={model.matters} statistics={model.statistics}
    onReview={model.api?matter=>model.open(matter.id,true):undefined} />;
}
