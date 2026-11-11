import {router} from 'expo-router';
import {Building2, FileText, Scale, UserRound} from 'lucide-react-native';
import {Body, Card, Divider, Row, Screen, SectionLabel} from '../../features/account/ui';

// Privacy Settings (profile-17; older 66). D-23: the drawn toggles (online status,
// read receipts, call privacy, message requests, location) control features that
// don't exist, so they're omitted. This is an accurate summary of who sees what.
export default function PrivacySettingsScreen() {
  return <Screen title="Privacy Settings" fallback="/privacy">
    <Body muted>Who can see the information you share with Legalitt.</Body>
    <SectionLabel>WHO CAN SEE WHAT</SectionLabel>
    <Card>
      <Row icon={UserRound} title="You" subtitle="Your profile, every case you open, your documents, payments and messages."/>
      <Divider/>
      <Row icon={Scale} title="Your assigned advocate" subtitle="The details, documents, messages and fee of the cases assigned to them — not your other cases or your account settings."/>
      <Divider/>
      <Row icon={Building2} title="Legalitt’s team" subtitle="Can access cases to assign advocates, review drafts and reports, answer support requests and check quality."/>
    </Card>
    <SectionLabel>NOT SHARED</SectionLabel>
    <Card>
      <Body>Other clients never see your cases. Identity numbers are never read from identity documents you upload. The app doesn’t show your online status, read receipts or location to anyone.</Body>
    </Card>
    <SectionLabel>MORE</SectionLabel>
    <Card>
      <Row icon={FileText} title="Data & Documents" subtitle="Download your data or request account deletion" onPress={() => router.push('/account/data')}/>
      <Divider/>
      <Row icon={FileText} title="Privacy Policy" subtitle="How Legalitt handles your information" onPress={() => router.push('/privacy-policy')}/>
    </Card>
  </Screen>;
}
