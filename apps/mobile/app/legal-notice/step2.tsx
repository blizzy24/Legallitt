import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useFixtureIntakeModel } from "../../features/legal-notice/useFixtureIntakeModel";
import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import { router } from 'expo-router';
import { MapPin, User, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import FlatField from '../../components/FlatField';
import WizardShell from '../../components/WizardShell';
import { font, ink, wizardBubble as b, wizardField as f } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';

// Step 2 — who receives the notice (design/25). Icons follow the file: the mobile,
// email and relationship fields all carry the two-person glyph.
export function Step2ScreenView({ model }: { model: NoticeIntakeModel }) {
  const { form, updateNoticee } = model;
  const n = form.noticee;

  return (
    <WizardShell step={2} buttonLabel="Continue" onContinue={model.continue}>
      <ChatBubble title="Who would you like to send the notice to?" time="10:30 AM" />
      <Text style={styles.note}>Note: The person receiving the notice.</Text>
      <View style={styles.fields}>
        <FlatField icon={User} label="Noticee Full Name" required value={n.fullName} onChangeText={(t) => updateNoticee({ fullName: t })} />
        <FlatField icon={Users} label="Mobile Number of Noticee" required value={n.mobile} onChangeText={(t) => updateNoticee({ mobile: t })} keyboardType="phone-pad" />
        <FlatField icon={Users} label="Email Id of Noticee" required value={n.email} onChangeText={(t) => updateNoticee({ email: t })} keyboardType="email-address" autoCapitalize="none" />
        <FlatField icon={Users} label="Relationship" hint="(Optional)" value={n.relationship} onChangeText={(t) => updateNoticee({ relationship: t })} />
        <FlatField icon={MapPin} label="Full Address" required multiline height={f.addressHeightShort} value={n.address} onChangeText={(t) => updateNoticee({ address: t })} />
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  note: {
    marginTop: b.noteGap,
    fontFamily: font.appBody,
    fontSize: b.noteSize,
    color: ink.hint,
  },
  fields: {
    marginTop: b.noteGap,
    gap: f.gap,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step2Screen() {
  const model = useFixtureIntakeModel("step2");
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="step2" /> : <Step2ScreenView model={model} />;
}
