import { router } from 'expo-router';
import { Ellipsis, FilePenLine, House, IndianRupee, ShoppingCart, Users, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import WizardShell from '../../components/WizardShell';
import { colors, font, ink, quickActions as q, wizardBubble as b, wizardCardShadow } from '../../constants/theme';
import { useLegalNotice, type IssueType } from '../../context/legalNotice';

type Action = { id: IssueType; label: string; icon: LucideIcon; filled?: boolean };

// Order and wrap follow design/26; the file's pill widths are hand-placed so they are
// content-sized here. Tenant Issue is the one solid house in the file.
const ACTIONS: Action[] = [
  { id: 'property-dispute', label: 'Property Dispute', icon: House },
  { id: 'money-recovery', label: 'Money Recovery', icon: IndianRupee },
  { id: 'tenant-issue', label: 'Tenant Issue', icon: House, filled: true },
  { id: 'family-dispute', label: 'Family Dispute', icon: Users },
  { id: 'cheque-bounce', label: 'Cheque Bounce', icon: FilePenLine },
  { id: 'consumer-complaint', label: 'Consumer Complaint', icon: ShoppingCart },
  { id: 'other', label: 'Any other', icon: Ellipsis },
];

// Step 3 — issue type (design/26). The file shows a timestamp with no bubble above the
// heading; drawn as is. No selected state is designed: brand border + brand chip here.
export default function Step3Screen() {
  const { form, update } = useLegalNotice();

  return (
    <WizardShell step={3} buttonLabel="Continue" onContinue={() => router.push('/legal-notice/step4')}>
      <ChatBubble time="10:30 AM" />
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.pills}>
        {ACTIONS.map((a) => {
          const selected = form.issueType === a.id;
          const Icon = a.icon;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => update({ issueType: a.id })}
              style={[styles.pill, selected && styles.pillSelected]}
            >
              <View style={[styles.chip, selected && styles.chipSelected]}>
                <Icon
                  size={q.chipIcon}
                  color={selected ? ink.onBrand : b.text}
                  fill={a.filled ? (selected ? ink.onBrand : b.text) : 'none'}
                />
              </View>
              <Text style={styles.label}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: q.titleGap,
    fontFamily: font.appSemi,
    fontSize: q.titleSize,
    color: b.text,
  },
  pills: {
    marginTop: q.pillsGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: q.colGap,
    rowGap: q.rowGap,
  },
  pill: {
    height: q.pillHeight,
    borderRadius: q.pillHeight / 2,
    backgroundColor: colors.card,
    borderWidth: q.selectedBorder,
    borderColor: colors.card,
    paddingLeft: q.padLeft - q.selectedBorder,
    paddingRight: q.padRight - q.selectedBorder,
    flexDirection: 'row',
    alignItems: 'center',
    ...wizardCardShadow,
  },
  pillSelected: {
    borderColor: colors.brand,
  },
  chip: {
    width: q.chip,
    height: q.chip,
    borderRadius: q.chip / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: q.chipGap,
  },
  chipSelected: {
    backgroundColor: colors.brand,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: q.textSize,
    color: b.text,
  },
});
