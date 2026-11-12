import {useLocalSearchParams} from 'expo-router';
import AdvocateCasesList from '../../components/AdvocateCasesList';
import {useNoticeLists} from '../../features/legal-notice/useNoticeLists';
export default function AdvocateCasesScreen(){
  const model=useNoticeLists();
  const {filter}=useLocalSearchParams<{filter?:string}>();
  // The dashboard's stat tiles still send their own group names; both open-work groups are "Active" here (design 213).
  const wanted=filter==='Needs Review'||filter==='In Progress'?'Active':filter;
  const selected=wanted&&model.matterFilters?.includes(wanted)?wanted:'All';
  return <AdvocateCasesList chrome="tab" initialFilter={selected}
    state={model.api?{loading:model.controller.loading||model.controller.busy,error:model.error,onRetry:()=>{void model.controller.run(model.controller.load);}}:undefined} records={model.matters} statistics={model.statistics}
    filters={model.matterFilters} services={model.matterServices} countLabel={model.matterCount} statisticsFor={model.matterStatistics}
    onReview={model.api?matter=>model.open(matter.id,true):undefined} />;
}
