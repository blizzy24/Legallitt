import {useLocalSearchParams} from 'expo-router';
import {ReportClientScreen} from '../../features/reports/ClientScreen';
export default function Documents(){const {caseId}=useLocalSearchParams<{caseId?:string}>();return <ReportClientScreen service="property_search" step="documents" caseId={caseId}/>;}
