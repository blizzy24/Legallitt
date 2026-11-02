import { Check, FilePenLine } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ChatBubble from '../../components/ChatBubble';
import FlatField from '../../components/FlatField';
import WizardShell from '../../components/WizardShell';
import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import { colors, font, wizardBubble as b, wizardField as f } from '../../constants/theme';
import { intakeDemand as d } from '../../constants/tokens/legalNotice';
import { instructedCopy } from '../../copy/instructed';
import type { NoticeIntakeModel } from '../../features/legal-notice/screen-model';
import { useIntakeModel } from '../../features/legal-notice/useIntakeModel';

const copy = instructedCopy.legalNoticeIntake;
// Approved instructed addition (§9.2). Reuses the neighbouring chat bubble,
// fields, button and stepper; no second API-mode presentation.
export function DemandScreenView({model}: {model: NoticeIntakeModel}) {
  const {legalDemand} = model.form;
  const toggle = (option: string) => model.update({legalDemand: {...legalDemand,
    selected: legalDemand.selected.includes(option) ? legalDemand.selected.filter(v => v !== option) : [...legalDemand.selected, option]}});
  return <WizardShell step={4} totalSteps={7} onBack={model.back} busy={model.busy}
    buttonLabel="Continue" onContinue={model.continue}>
    <ChatBubble title={copy.demandTitle} time="" />
    <Text style={styles.prompt}>{copy.demandPrompt}</Text>
    <View style={styles.fields}>
      {model.demandOptions.map(option => {
        const selected = legalDemand.selected.includes(option);
        return <Pressable key={option} accessibilityRole="checkbox" accessibilityState={{checked: selected}} aria-checked={selected}
          onPress={() => toggle(option)} style={[styles.option, selected && styles.selected]}>
          <View style={[styles.check, selected && styles.checked]}>{selected && <Check size={d.checkIcon} color={colors.card} />}</View>
          <Text style={styles.optionText}>{option}</Text>
        </Pressable>;
      })}
      {!model.demandOptions.length && <Pressable accessibilityRole="button" disabled={model.busy} onPress={model.generateDemands}>
        <Text style={styles.retry}>{model.busy ? copy.generating : copy.generateOptions}</Text>
      </Pressable>}
      <FlatField icon={FilePenLine} label={copy.ownDemand} multiline value={legalDemand.custom}
        onChangeText={custom => model.update({legalDemand: {...legalDemand, custom}})} />
    </View>
  </WizardShell>;
}
const styles = StyleSheet.create({
  prompt: {marginTop: b.fieldsGap, color: b.text, fontFamily: font.appBody, fontSize: f.text},
  fields: {marginTop: f.gap, gap: f.gap},
  option: {flexDirection: 'row', alignItems: 'center', gap: f.iconGap, backgroundColor: f.bg,
    borderRadius: f.radius, borderWidth: d.border, borderColor: f.bg,
    padding: d.padding, minHeight: f.height},
  selected: {borderColor: colors.brand},
  check: {width: f.icon, height: f.icon, borderRadius: d.checkRadius, borderWidth: d.border, borderColor: colors.brand,
    alignItems: 'center', justifyContent: 'center'},
  checked: {backgroundColor: colors.brand},
  optionText: {flex: 1, color: colors.textPrimary, fontFamily: font.appBody, fontSize: f.text, lineHeight: d.lineHeight},
  retry: {color: colors.brand, fontFamily: font.appSemi, fontSize: f.text},
});
export default function DemandScreen() {
  const {model} = useIntakeModel('demand');
  return <NoticeScreenFeedback error={model.error}><DemandScreenView model={model} /></NoticeScreenFeedback>;
}
