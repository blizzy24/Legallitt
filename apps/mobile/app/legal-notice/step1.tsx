import { router } from 'expo-router';
import { Mail, MapPin, User, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import FlatField from '../../components/FlatField';
import WizardShell from '../../components/WizardShell';
import { wizardBubble as b, wizardField as f } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';

// Step 1 — the client's own details (design/24). The mobile field's two-person icon is
// as drawn.
export default function Step1Screen() {
  const { form, updateClient } = useLegalNotice();
  const c = form.client;

  return (
    <WizardShell step={1} buttonLabel="Continue" onContinue={() => router.push('/legal-notice/step2')}>
      <ChatBubble title="Please Provide your details!" time="10:32 AM" />
      <View style={styles.fields}>
        <FlatField icon={User} label="Full Name" required value={c.fullName} onChangeText={(t) => updateClient({ fullName: t })} autoComplete="name" />
        <FlatField icon={Users} label="Mobile Number" required value={c.mobile} onChangeText={(t) => updateClient({ mobile: t })} keyboardType="phone-pad" />
        <FlatField icon={Mail} label="Email Address" hint="(Optional)" value={c.email} onChangeText={(t) => updateClient({ email: t })} keyboardType="email-address" autoCapitalize="none" />
        <FlatField icon={MapPin} label="Full Address" required multiline value={c.address} onChangeText={(t) => updateClient({ address: t })} />
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  fields: {
    marginTop: b.fieldsGap,
    gap: f.gap,
  },
});
