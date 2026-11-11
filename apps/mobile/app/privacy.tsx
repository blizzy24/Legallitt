import {router} from 'expo-router';
import {Eye, FileText, KeyRound, LockKeyhole, Monitor, Trash2} from 'lucide-react-native';
import PreviewStep from '../components/PreviewStep';
import {Card, Divider, Note, Row, Screen, SectionLabel} from '../features/account/ui';
import {DATA_SOURCE} from '../lib/data-source';

// Privacy & Security hub (profile-13; older 62). D-21: the "2FA Active" badge and
// "Verification enabled" line are omitted — two-step verification isn't built (D-01).
export default function PrivacySecurityScreen() {
  if (DATA_SOURCE !== 'api') return <PreviewStep header="Privacy & Security" service="Privacy & Security"/>;
  return <Screen title="Privacy & Security">
    <SectionLabel>ACCOUNT SECURITY</SectionLabel>
    <Card>
      <Row icon={KeyRound} title="Change Password" subtitle="Update your account password" onPress={() => router.push('/account/password')}/>
      <Divider/>
      <Row icon={LockKeyhole} title="Login & Security" subtitle="Manage account sign-in settings" onPress={() => router.push('/account/security')}/>
      <Divider/>
      <Row icon={Monitor} title="Active Sessions" subtitle="Review recent sign-ins to your account" onPress={() => router.push('/account/sessions')}/>
    </Card>
    <SectionLabel>PRIVACY</SectionLabel>
    <Card>
      <Row icon={Eye} title="Privacy Settings" subtitle="Who can see your information" onPress={() => router.push('/account/privacy-settings')}/>
      <Divider/>
      <Row icon={FileText} title="Data & Documents" subtitle="Download your data and manage your account" onPress={() => router.push('/account/data')}/>
    </Card>
    <SectionLabel>ACCOUNT</SectionLabel>
    <Card>
      <Row icon={Trash2} danger title="Delete Account" subtitle="Request account deletion" onPress={() => router.push('/account/delete')}/>
    </Card>
    <Note>Changing your password, signing out everywhere and deleting your account each ask you to confirm first.</Note>
  </Screen>;
}
