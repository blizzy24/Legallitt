import {router} from 'expo-router';
import {Screen} from '../../../features/reports/ui';
import {SignatureSettings} from '../../../features/legal-notice/SignatureSettings';
export default function SignatureScreen(){return <Screen title="My signature" actions={[{label:'Back to dashboard',onPress:()=>router.navigate('/dashboard')}]}><SignatureSettings/></Screen>;}
