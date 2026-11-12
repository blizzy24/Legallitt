import {Redirect,useLocalSearchParams} from 'expo-router';
import {noticeHref} from '../../features/legal-notice/navigation';
// Old seven-step links resume at the current issue step. No separate demand intake.
export default function RetiredDemand(){const {caseId}=useLocalSearchParams<{caseId?:string}>();return <Redirect href={noticeHref('/legal-notice/step3',caseId)}/>;}
