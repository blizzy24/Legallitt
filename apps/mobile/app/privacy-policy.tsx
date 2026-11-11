import {router} from 'expo-router';
import {FileText} from 'lucide-react-native';
import {Button, Empty, Screen} from '../features/account/ui';

// D-43: the policy text is the client's to supply. Say so plainly, with a way forward.
export default function PrivacyPolicyScreen() {
  return <Screen title="Privacy Policy" fallback="/privacy">
    <Empty icon={FileText} title="Being finalised" body="Legalitt’s Privacy Policy is being finalised and will appear here. For any question about your information in the meantime, contact Legalitt Support."
      action={<Button title="Contact Support" onPress={() => router.push('/support')}/>}/>
  </Screen>;
}
