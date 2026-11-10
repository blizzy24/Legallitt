import {useLocalSearchParams} from 'expo-router';
import {ReportAdvocateScreen} from '../../features/reports/AdvocateScreen';
export default function ReportRoute(){const {caseId,step}=useLocalSearchParams<{caseId?:string;step?:string}>();return <ReportAdvocateScreen caseId={caseId} step={step}/>;}
