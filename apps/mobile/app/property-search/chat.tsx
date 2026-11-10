import {useLocalSearchParams} from 'expo-router';
import {ReportChat} from '../../features/reports/Chat';
export default function Chat(){const {caseId}=useLocalSearchParams<{caseId?:string}>();return <ReportChat caseId={caseId}/>;}
