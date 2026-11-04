import AdvocateDashboardScreen from '../../components/AdvocateDashboardScreen';
import {useAdvocateDashboard} from '../../features/legal-notice/useAdvocateDashboard';
export default function AdvocateDashboard() {return <AdvocateDashboardScreen {...useAdvocateDashboard()}/>;}
