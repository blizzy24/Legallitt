import {useLocalSearchParams} from 'expo-router';
import {ReportClientScreen} from '../../features/reports/ClientScreen';
export default function CourtMarriageStep(){const {caseId,step}=useLocalSearchParams<{caseId?:string;step:string}>();return <ReportClientScreen service="court_marriage" step={step} caseId={caseId}/>;}
