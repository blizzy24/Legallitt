import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useIntakeModel } from "../../features/legal-notice/useIntakeModel";
import { router, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import WizardShell from '../../components/WizardShell';
import { caseSummary as s, colors, font, wizardBubble as b, wizardCardShadow } from '../../constants/theme';
import { useLegalNotice, type IssueType } from '../../context/legalNotice';

const NOTICE_TYPE: Record<IssueType, string> = {
  'property-dispute': 'Property Notice',
  'money-recovery': 'Money Recovery Notice',
  'tenant-issue': 'Tenant Notice',
  'family-dispute': 'Family Dispute Notice',
  'cheque-bounce': 'Cheque Bounce Notice',
  'consumer-complaint': 'Consumer Complaint Notice',
  other: 'Legal Notice',
};

// Step 5 — case summary (design/27). The file's card is 353pt wide (inset 18.6) against
// the shell's 346; drawn at the shell width.
export function Step5ScreenView({ model }: { model: NoticeIntakeModel }) {
  const { form } = model;
  const noticee = [form.noticee.fullName, form.noticee.relationship, form.noticee.address].filter(Boolean);
  const docCount = form.documents.length || model.summary.documents;

  return (
    <WizardShell step={5} buttonLabel="Submit & Proceed to Pay" onContinue={model.continue}>
      <ChatBubble title="Preview Your Case Summary" time="10:32 AM" />
      <View style={styles.card}>
        <Row label="Client Name" value={form.client.fullName || model.summary.client} />
        <Row label="Notice Type" value={form.issueType ? NOTICE_TYPE[form.issueType] : model.summary.noticeType} />
        <Row label="Notice Details" value={(noticee.length ? noticee : model.summary.noticee).join('\n')} />
        <Row label="Issue Summary" value={model.summary.summary} paragraph />

        <Pressable onPress={() => model.navigate('/legal-notice/step4-review')} accessibilityRole="button" style={styles.box}>
          <View style={styles.boxText}>
            <Text style={styles.boxTitle}>Uploaded Documents</Text>
            <Text style={styles.boxSub}>{docCount} Documents Uploaded</Text>
          </View>
          <ChevronRight size={s.chevron} color={colors.textMuted} />
        </Pressable>
      </View>
    </WizardShell>
  );
}

function Row({ label, value, paragraph = false }: { label: string; value: string; paragraph?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, paragraph && styles.para]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: b.cardGap,
    borderRadius: s.radius,
    backgroundColor: s.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: s.padTop,
    paddingBottom: s.padBottom,
    paddingLeft: s.padLeft,
    paddingRight: s.padRight,
    gap: s.rowGap,
    ...wizardCardShadow,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    width: s.labelWidth,
    fontFamily: font.appSemi,
    fontSize: s.labelSize,
    lineHeight: s.valueLineHeight,
    color: colors.textPrimary,
  },
  value: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: s.valueSize,
    lineHeight: s.valueLineHeight,
    color: s.value,
  },
  para: {
    maxWidth: s.paraMaxWidth,
    fontSize: s.paraSize,
    lineHeight: s.paraLineHeight,
  },
  box: {
    marginTop: s.boxGap - s.rowGap,
    marginLeft: s.boxPadX - s.padLeft + 1,
    height: s.boxHeight,
    borderRadius: s.boxRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: s.boxPadX,
    paddingRight: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxText: {
    flex: 1,
    minWidth: 0,
  },
  boxTitle: {
    fontFamily: font.appHeading,
    fontSize: s.boxTitleSize,
    color: colors.textPrimary,
  },
  boxSub: {
    marginTop: s.boxLineGap,
    fontFamily: font.appBody,
    fontSize: s.boxSubSize,
    color: s.value,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step5Screen() {
  const { model } = useIntakeModel("step5");
  return <Step5ScreenView model={model} />;
}
