import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useIntakeModel } from "../../features/legal-notice/useIntakeModel";
import { NOTICE_RELATIONS, NOTICE_SALUTATIONS } from '@legalitt/shared';
import { router } from 'expo-router';
import { Mail, MapPin, User, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import FlatChoiceField from '../../components/FlatChoiceField';
import FlatField from '../../components/FlatField';
import WizardShell from '../../components/WizardShell';
import { wizardBubble as b, wizardField as f } from '../../constants/theme';
import { useLegalNotice } from '../../context/legalNotice';
import { instructedCopy } from '../../copy/instructed';

// Instructed step 3 — the client's own details (design/24). The mobile field's two-person icon is
// as drawn.
export function Step1ScreenView({ model }: { model: NoticeIntakeModel }) {
  const { form, updateClient } = model;
  const c = form.client;

  return (
    <WizardShell busy={model.busy} onBack={model.back} step={3} totalSteps={7} buttonLabel="Continue" onContinue={model.continue}>
      <ChatBubble title="Please Provide your details!" time="10:32 AM" />
      <View style={styles.fields}>
        <FlatChoiceField icon={User} label={instructedCopy.legalNoticeIntake.salutation} options={NOTICE_SALUTATIONS}
          value={c.salutation} onChange={salutation => updateClient({salutation})} />
        <FlatField icon={User} label="Full Name" required value={c.fullName} onChangeText={(t) => updateClient({ fullName: t })} autoComplete="name" />
        <FlatField icon={User} label={instructedCopy.legalNoticeIntake.age} value={c.age} onChangeText={t => updateClient({age: t})} keyboardType="number-pad" />
        <FlatChoiceField icon={Users} label={instructedCopy.legalNoticeIntake.relation} options={NOTICE_RELATIONS}
          value={c.relation} onChange={relation => updateClient({relation})} />
        <FlatField icon={User} label={instructedCopy.legalNoticeIntake.relativeName} value={c.relativeName} onChangeText={t => updateClient({relativeName: t})} />
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

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step1Screen() {
  const { model } = useIntakeModel("step1");
  return <NoticeScreenFeedback error={model.error}><Step1ScreenView model={model} /></NoticeScreenFeedback>;
}
